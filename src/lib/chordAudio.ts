"use client";

import type { ChordVoicing } from "@/types/chord";

const STANDARD_TUNING_MIDI = [40, 45, 50, 55, 59, 64];
const STRUM_DELAY_SECONDS = 0.032;
const NOTE_DURATION_SECONDS = 2.15;
const FALLBACK_SAMPLE_RATE = 22050;

type AudioGraph = {
  context: AudioContext;
  input: GainNode;
};

type PlayableString = {
  stringIndex: number;
  frequency: number;
  isRoot: boolean;
};

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

let graph: AudioGraph | null = null;
let activeOscillators: OscillatorNode[] = [];
let activeFallbackAudio: HTMLAudioElement | null = null;
const fallbackUrlCache = new Map<string, string>();

function midiToFrequency(midiNote: number) {
  return 440 * 2 ** ((midiNote - 69) / 12);
}

function getAudioContextConstructor() {
  const audioWindow = window as AudioWindow;
  return audioWindow.AudioContext ?? audioWindow.webkitAudioContext;
}

async function getAudioGraph(): Promise<AudioGraph | null> {
  if (typeof window === "undefined") {
    return null;
  }

  if (!graph) {
    const AudioContextConstructor = getAudioContextConstructor();

    if (!AudioContextConstructor) {
      return null;
    }

    const context = new AudioContextConstructor();
    const masterGain = context.createGain();
    const compressor = context.createDynamicsCompressor();

    masterGain.gain.value = 0.72;
    compressor.threshold.value = -22;
    compressor.knee.value = 18;
    compressor.ratio.value = 6;
    compressor.attack.value = 0.004;
    compressor.release.value = 0.22;

    masterGain.connect(compressor);
    compressor.connect(context.destination);

    graph = {
      context,
      input: masterGain,
    };
  }

  if (graph.context.state === "suspended") {
    await graph.context.resume();
  }

  return graph;
}

function stopActiveVoicing() {
  activeOscillators.forEach((oscillator) => {
    try {
      oscillator.stop();
    } catch {
      // Already stopped voices are safe to ignore.
    }
  });

  activeOscillators = [];

  if (activeFallbackAudio) {
    activeFallbackAudio.pause();
    activeFallbackAudio.currentTime = 0;
    activeFallbackAudio = null;
  }
}

function createStringVoice(params: {
  context: AudioContext;
  destination: AudioNode;
  frequency: number;
  gain: number;
  startTime: number;
  isRoot: boolean;
}) {
  const { context, destination, frequency, gain, startTime, isRoot } = params;
  const oscillator = context.createOscillator();
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(frequency, startTime);
  oscillator.detune.setValueAtTime(isRoot ? -2 : 2, startTime);

  filter.type = "lowpass";
  filter.Q.setValueAtTime(0.9, startTime);
  filter.frequency.setValueAtTime(isRoot ? 2400 : 2100, startTime);
  filter.frequency.exponentialRampToValueAtTime(760, startTime + NOTE_DURATION_SECONDS);

  envelope.gain.setValueAtTime(0.0001, startTime);
  envelope.gain.exponentialRampToValueAtTime(gain, startTime + 0.012);
  envelope.gain.exponentialRampToValueAtTime(0.0008, startTime + NOTE_DURATION_SECONDS);

  oscillator.connect(filter);
  filter.connect(envelope);
  envelope.connect(destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + NOTE_DURATION_SECONDS + 0.08);
  oscillator.onended = () => {
    activeOscillators = activeOscillators.filter((active) => active !== oscillator);
  };

  activeOscillators.push(oscillator);
}

function getPlayableStrings(voicing: ChordVoicing): PlayableString[] {
  return voicing.frets
    .map((fret, stringIndex) => {
      if (fret === "x") {
        return null;
      }

      return {
        stringIndex,
        frequency: midiToFrequency(STANDARD_TUNING_MIDI[stringIndex] + fret),
        isRoot: voicing.rootStrings?.includes(stringIndex) ?? false,
      };
    })
    .filter((note): note is PlayableString => Boolean(note));
}

function writeString(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}

function getFallbackCacheKey(notes: PlayableString[]) {
  return notes.map((note) => `${note.frequency.toFixed(2)}:${note.isRoot ? "r" : "n"}`).join("|");
}

function createFallbackWavUrl(notes: PlayableString[]) {
  const cacheKey = getFallbackCacheKey(notes);
  const cachedUrl = fallbackUrlCache.get(cacheKey);

  if (cachedUrl) {
    return cachedUrl;
  }

  const duration = NOTE_DURATION_SECONDS + notes.length * STRUM_DELAY_SECONDS + 0.12;
  const sampleCount = Math.ceil(duration * FALLBACK_SAMPLE_RATE);
  const buffer = new ArrayBuffer(44 + sampleCount * 2);
  const view = new DataView(buffer);
  const normalizer = 0.28 / Math.sqrt(notes.length);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + sampleCount * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, FALLBACK_SAMPLE_RATE, true);
  view.setUint32(28, FALLBACK_SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, sampleCount * 2, true);

  for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
    const time = sampleIndex / FALLBACK_SAMPLE_RATE;
    let sample = 0;

    notes.forEach((note, noteIndex) => {
      const noteTime = time - noteIndex * STRUM_DELAY_SECONDS;

      if (noteTime < 0) {
        return;
      }

      const attack = Math.min(1, noteTime / 0.012);
      const decay = Math.exp(-3.2 * noteTime);
      const amplitude = attack * decay * (note.isRoot ? 1.16 : 1);
      const fundamental = Math.sin(2 * Math.PI * note.frequency * noteTime);
      const harmonic = Math.sin(2 * Math.PI * note.frequency * 2 * noteTime) * 0.18;

      sample += (fundamental + harmonic) * amplitude;
    });

    const clamped = Math.max(-1, Math.min(1, sample * normalizer));
    view.setInt16(44 + sampleIndex * 2, clamped * 32767, true);
  }

  const url = URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
  fallbackUrlCache.set(cacheKey, url);

  return url;
}

async function playFallbackAudio(notes: PlayableString[]) {
  if (typeof Audio === "undefined" || typeof URL === "undefined") {
    return;
  }

  const audio = new Audio(createFallbackWavUrl(notes));
  audio.volume = 0.86;
  activeFallbackAudio = audio;
  audio.onended = () => {
    if (activeFallbackAudio === audio) {
      activeFallbackAudio = null;
    }
  };

  await audio.play();
}

export async function playChordVoicing(voicing: ChordVoicing) {
  const playableStrings = getPlayableStrings(voicing);

  if (playableStrings.length === 0) {
    return;
  }

  stopActiveVoicing();

  const audioGraph = await getAudioGraph().catch(() => null);

  if (!audioGraph) {
    await playFallbackAudio(playableStrings);
    return;
  }

  const baseGain = 0.085 / Math.sqrt(playableStrings.length);
  const startTime = audioGraph.context.currentTime + 0.025;

  playableStrings.forEach((note, index) => {
    createStringVoice({
      context: audioGraph.context,
      destination: audioGraph.input,
      frequency: note.frequency,
      gain: note.isRoot ? baseGain * 1.2 : baseGain,
      startTime: startTime + index * STRUM_DELAY_SECONDS,
      isRoot: note.isRoot,
    });
  });
}
