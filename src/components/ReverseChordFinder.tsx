"use client";

import { Ban, Minus, Plus, RotateCcw, Search, Star, Volume2 } from "lucide-react";
import { useMemo, useState } from "react";
import { ChordDiagram } from "@/components/ChordDiagram";
import { STRING_NAMES } from "@/lib/constants";
import { playChordVoicing } from "@/lib/chordAudio";
import { cn } from "@/lib/cn";
import {
  buildReverseVoicing,
  getReverseChordCandidates,
  getReversePlayedNotes,
  type ReverseChordCandidate,
  type ReverseFretValue,
} from "@/lib/reverseChordLookup";
import { useChordStore } from "@/store/chordStore";
import type { ChordVoicing } from "@/types/chord";

const maxReverseFret = 17;
const initialFrets: ReverseFretValue[] = ["x", 3, 2, 0, 1, 0];
const emptyCustomFingers = Array.from({ length: 6 }, () => undefined) as Array<
  ChordVoicing["fingers"][number] | undefined
>;

const presets: Array<{
  label: string;
  frets: ReverseFretValue[];
}> = [
  { label: "C", frets: ["x", 3, 2, 0, 1, 0] },
  { label: "G", frets: [3, 2, 0, 0, 0, 3] },
  { label: "D/F#", frets: [2, "x", 0, 2, 3, 2] },
  { label: "Em", frets: [0, 2, 2, 0, 0, 0] },
  { label: "A7", frets: ["x", 0, 2, 0, 2, 0] },
  { label: "F", frets: [1, 3, 3, 2, 1, 1] },
];

function getDisplayValue(value: ReverseFretValue) {
  if (value === "x") return "X";
  if (value === 0) return "0";
  return String(value);
}

function getConfidenceClass(confidence: ReverseChordCandidate["confidence"]) {
  if (confidence === "높음") {
    return "bg-[#5eead4] text-[#06201c]";
  }

  if (confidence === "보통") {
    return "bg-[#ffcc80] text-[#271804]";
  }

  return "bg-white/[0.08] text-[#efe8dd]";
}

function updateFretValue(value: ReverseFretValue, direction: "up" | "down"): ReverseFretValue {
  if (direction === "up") {
    if (value === "x") return 0;
    return Math.min(maxReverseFret, value + 1);
  }

  if (value === "x") return "x";
  if (value === 0) return "x";
  return value - 1;
}

function uniqueValues<T>(values: T[]) {
  return [...new Set(values)];
}

function getNextFingerValue(finger: ChordVoicing["fingers"][number]) {
  if (finger === 1) return 2;
  if (finger === 2) return 3;
  if (finger === 3) return 4;
  if (finger === 4) return 0;
  return 1;
}

export function ReverseChordFinder() {
  const [frets, setFrets] = useState<ReverseFretValue[]>(initialFrets);
  const [customFingers, setCustomFingers] =
    useState<Array<ChordVoicing["fingers"][number] | undefined>>(emptyCustomFingers);
  const [isPlaying, setIsPlaying] = useState(false);
  const favorites = useChordStore((state) => state.favorites);
  const toggleFavoriteVoicing = useChordStore((state) => state.toggleFavoriteVoicing);
  const candidates = useMemo(() => getReverseChordCandidates(frets), [frets]);
  const playedNotes = useMemo(() => getReversePlayedNotes(frets), [frets]);
  const autoVoicing = useMemo(
    () => buildReverseVoicing(frets, candidates[0]),
    [candidates, frets],
  );
  const hasCustomFingers = customFingers.some(
    (finger, index) => finger !== undefined && typeof frets[index] === "number" && frets[index] > 0,
  );
  const currentVoicing = useMemo<ChordVoicing>(() => {
    const hasActiveCustomFinger = customFingers.some(
      (finger, index) =>
        finger !== undefined && typeof frets[index] === "number" && frets[index] > 0,
    );

    return {
      ...autoVoicing,
      barre: hasActiveCustomFinger ? undefined : autoVoicing.barre,
      fingers: autoVoicing.fingers.map((finger, index) => {
        const fret = frets[index];

        if (fret === "x") {
          return "x";
        }

        if (fret === 0) {
          return 0;
        }

        return customFingers[index] ?? finger;
      }) as ChordVoicing["fingers"],
    };
  }, [autoVoicing, customFingers, frets]);
  const noteSummary = uniqueValues(playedNotes.map((note) => note.noteName)).join(" · ");

  function applyCustomFingers(baseVoicing: ChordVoicing): ChordVoicing {
    const hasActiveCustomFinger = customFingers.some(
      (finger, index) =>
        finger !== undefined && typeof frets[index] === "number" && frets[index] > 0,
    );

    return {
      ...baseVoicing,
      barre: hasActiveCustomFinger ? undefined : baseVoicing.barre,
      fingers: baseVoicing.fingers.map((finger, index) => {
        const fret = frets[index];

        if (fret === "x") {
          return "x";
        }

        if (fret === 0) {
          return 0;
        }

        return customFingers[index] ?? finger;
      }) as ChordVoicing["fingers"],
    };
  }

  function getSavedCandidateVoicing(candidate: ReverseChordCandidate) {
    return applyCustomFingers(buildReverseVoicing(frets, candidate));
  }

  function resetCustomFingers() {
    setCustomFingers([...emptyCustomFingers]);
  }

  function setFretsAndResetFingers(nextFrets: ReverseFretValue[]) {
    setFrets(nextFrets);
    resetCustomFingers();
  }

  function resetCustomFingerAt(stringIndex: number) {
    setCustomFingers((current) =>
      current.map((finger, index) => (index === stringIndex ? undefined : finger)),
    );
  }

  function setStringFret(stringIndex: number, value: ReverseFretValue) {
    setFrets((current) =>
      current.map((fret, index) => (index === stringIndex ? value : fret)),
    );
    resetCustomFingerAt(stringIndex);
  }

  function shiftStringFret(stringIndex: number, direction: "up" | "down") {
    setFrets((current) =>
      current.map((fret, index) =>
        index === stringIndex ? updateFretValue(fret, direction) : fret,
      ),
    );
    resetCustomFingerAt(stringIndex);
  }

  function handleDiagramFretSelect(stringIndex: number, fret: number) {
    if (fret > maxReverseFret) {
      return;
    }

    setFrets((current) =>
      current.map((currentFret, index) =>
        index === stringIndex ? (currentFret === fret ? "x" : fret) : currentFret,
      ),
    );
    resetCustomFingerAt(stringIndex);
  }

  function handleFingerSelect(stringIndex: number) {
    const fret = frets[stringIndex];

    if (fret === "x" || fret === 0) {
      return;
    }

    setCustomFingers((current) =>
      current.map((finger, index) =>
        index === stringIndex ? getNextFingerValue(finger ?? autoVoicing.fingers[stringIndex]) : finger,
      ),
    );
  }

  async function handlePlayCurrentVoicing() {
    if (playedNotes.length === 0) {
      return;
    }

    setIsPlaying(true);

    try {
      await playChordVoicing(currentVoicing);
      window.setTimeout(() => setIsPlaying(false), 900);
    } catch {
      setIsPlaying(false);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,650px)_minmax(0,1fr)]">
      <section className="rounded-[8px] border border-white/10 bg-[#17201e] p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-white/[0.06] text-[#5eead4]">
              <RotateCcw className="size-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[#f6f0e6]">Reverse</h2>
              <p className="mt-1 text-xs leading-5 text-[#aeb8ad]">
                6번 줄부터 프렛을 맞추면 가능한 코드명을 찾습니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFretsAndResetFingers(["x", "x", "x", "x", "x", "x"])}
            aria-label="입력 초기화"
            title="입력 초기화"
            className="grid size-9 shrink-0 place-items-center rounded-[7px] border border-white/10 bg-white/[0.06] text-[#efe8dd] transition hover:border-[#ff8a65]/60"
          >
            <Ban className="size-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
          {frets.map((fret, stringIndex) => (
            <div
              key={`${STRING_NAMES[stringIndex]}-${stringIndex}`}
              className="rounded-[8px] border border-white/10 bg-[#0c1413]/70 p-1.5"
            >
              <p className="text-center text-[10px] font-semibold text-[#9fb6ad]">
                {6 - stringIndex}번 {STRING_NAMES[stringIndex]}
              </p>
              <div className="mt-1 grid gap-1">
                <button
                  type="button"
                  onClick={() => shiftStringFret(stringIndex, "up")}
                  aria-label={`${6 - stringIndex}번 줄 프렛 올리기`}
                  title="프렛 올리기"
                  className="grid h-7 place-items-center rounded-[6px] bg-white/[0.06] text-[#efe8dd] transition hover:bg-white/[0.1]"
                >
                  <Plus className="size-3.5" />
                </button>
                <div className="grid h-12 place-items-center rounded-[7px] border border-[#5eead4]/35 bg-[#111817] text-2xl font-semibold leading-none text-[#f6f0e6]">
                  {getDisplayValue(fret)}
                </div>
                <button
                  type="button"
                  onClick={() => shiftStringFret(stringIndex, "down")}
                  aria-label={`${6 - stringIndex}번 줄 프렛 내리기`}
                  title="프렛 내리기"
                  className="grid h-7 place-items-center rounded-[6px] bg-white/[0.06] text-[#efe8dd] transition hover:bg-white/[0.1]"
                >
                  <Minus className="size-3.5" />
                </button>
              </div>
              <div className="mt-1 grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setStringFret(stringIndex, "x")}
                  className={cn(
                    "h-7 rounded-[6px] text-[10px] font-semibold transition",
                    fret === "x"
                      ? "bg-[#ff8a65] text-[#24100a]"
                      : "bg-white/[0.05] text-[#aeb8ad] hover:bg-white/[0.08]",
                  )}
                >
                  X
                </button>
                <button
                  type="button"
                  onClick={() => setStringFret(stringIndex, 0)}
                  className={cn(
                    "h-7 rounded-[6px] text-[10px] font-semibold transition",
                    fret === 0
                      ? "bg-[#5eead4] text-[#06201c]"
                      : "bg-white/[0.05] text-[#aeb8ad] hover:bg-white/[0.08]",
                  )}
                >
                  0
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#f6f0e6]">
            Preset
          </p>
          <div className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setFretsAndResetFingers([...preset.frets])}
                className="h-9 rounded-[7px] border border-white/10 bg-white/[0.05] px-1 text-sm font-semibold text-[#efe8dd] transition hover:border-[#5eead4]/60"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(300px,380px)_minmax(0,1fr)]">
          <div className="min-w-0">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#f6f0e6]">
                Fretboard
              </p>
              <div className="flex flex-wrap items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={resetCustomFingers}
                  disabled={!hasCustomFingers}
                  aria-label="손가락 번호 자동복구"
                  title="손가락 번호 자동복구"
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-[7px] border px-2 text-xs font-semibold transition",
                    hasCustomFingers
                      ? "border-white/10 bg-white/[0.06] text-[#efe8dd] hover:border-[#5eead4]/60"
                      : "border-white/10 bg-white/[0.03] text-[#7f9188]",
                  )}
                >
                  <RotateCcw className="size-3.5" />
                  자동
                </button>
                <button
                  type="button"
                  onClick={handlePlayCurrentVoicing}
                  disabled={playedNotes.length === 0}
                  aria-label="현재 입력 운지 소리 듣기"
                  title="현재 입력 운지 소리 듣기"
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-[7px] border px-2 text-xs font-semibold transition",
                    isPlaying
                      ? "border-[#5eead4] bg-[#5eead4] text-[#06201c]"
                      : "border-white/10 bg-white/[0.06] text-[#efe8dd] hover:border-[#5eead4]/60",
                    playedNotes.length === 0 && "opacity-45",
                  )}
                >
                  <Volume2 className="size-3.5" />
                  소리
                </button>
              </div>
            </div>
            <ChordDiagram
              voicing={currentVoicing}
              isLeftHanded={false}
              size="large"
              onFretSelect={handleDiagramFretSelect}
              onFingerSelect={handleFingerSelect}
            />
          </div>
          <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#f6f0e6]">
              Notes
            </p>
            <p className="mt-2 min-h-7 text-lg font-semibold text-[#5eead4]">
              {noteSummary || "음을 입력하세요"}
            </p>
            <div className="mt-3 grid gap-1.5">
              {playedNotes.length > 0 ? (
                playedNotes.map((note) => (
                  <div
                    key={`${note.stringIndex}-${note.fret}`}
                    className="flex items-center justify-between rounded-[6px] bg-black/20 px-2 py-1 text-xs text-[#d8d0c0]"
                  >
                    <span>
                      {note.stringNumber}번 줄 {note.fret === 0 ? "개방" : `${note.fret}프렛`}
                    </span>
                    <strong className="text-[#f6f0e6]">{note.noteName}</strong>
                  </div>
                ))
              ) : (
                <p className="rounded-[6px] bg-black/20 px-2 py-2 text-xs text-[#aeb8ad]">
                  최소 2개 이상의 줄을 입력하면 분석을 시작합니다.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="min-w-0 rounded-[8px] border border-white/10 bg-[#17201e] p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-[#f6f0e6]">찾은 코드</h2>
            <p className="mt-1 text-xs leading-5 text-[#aeb8ad]">
              낮은 줄의 베이스음을 기준으로 분수코드 후보도 함께 표시합니다.
            </p>
          </div>
          <div className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-[#5eead4] text-[#06201c]">
            <Search className="size-5" />
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          {candidates.length > 0 ? (
            candidates.map((candidate, index) => {
              const isFavorite = favorites.includes(candidate.chordName);

              return (
              <article
                key={`${candidate.chordName}-${candidate.qualityId}-${index}`}
                className={cn(
                  "rounded-[8px] border bg-white/[0.04] p-3",
                  index === 0 ? "border-[#5eead4]/70" : "border-white/10",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-2xl font-semibold leading-none text-[#f6f0e6]">
                        {candidate.chordName}
                      </h3>
                      <span
                        className={cn(
                          "rounded-[6px] px-2 py-0.5 text-[11px] font-semibold",
                          getConfidenceClass(candidate.confidence),
                        )}
                      >
                        {candidate.confidence}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-[#aeb8ad]">
                      {candidate.qualityName}
                      {candidate.isSlash ? ` · 베이스 ${candidate.bassName}` : " · 루트 베이스"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFavoriteVoicing(getSavedCandidateVoicing(candidate))}
                    aria-label={isFavorite ? `${candidate.chordName} 즐겨찾기 해제` : `${candidate.chordName} 즐겨찾기 추가`}
                    title={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                    className={cn(
                      "inline-flex h-9 shrink-0 items-center gap-1 rounded-[7px] border px-2 text-xs font-semibold transition",
                      isFavorite
                        ? "border-[#ff8a65]/80 bg-[#ff8a65] text-[#24100a]"
                        : "border-white/10 bg-white/[0.06] text-[#efe8dd] hover:border-[#ff8a65]/60",
                    )}
                  >
                    <Star className={cn("size-3.5", isFavorite && "fill-current")} />
                    {isFavorite ? "저장됨" : "저장"}
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {candidate.includedDegrees.map((degree) => (
                    <span
                      key={`${candidate.chordName}-${degree}`}
                      className="rounded-[6px] bg-[#123c38] px-2 py-1 text-[11px] font-semibold text-[#dffbf5]"
                    >
                      {degree}
                    </span>
                  ))}
                  {candidate.missingDegrees.map((degree) => (
                    <span
                      key={`${candidate.chordName}-${degree}-missing`}
                      className="rounded-[6px] bg-white/[0.05] px-2 py-1 text-[11px] font-semibold text-[#92a49b]"
                    >
                      {degree} 생략
                    </span>
                  ))}
                </div>
              </article>
              );
            })
          ) : (
            <div className="rounded-[8px] border border-dashed border-white/10 bg-white/[0.03] p-5">
              <div className="grid size-11 place-items-center rounded-[8px] bg-white/[0.06] text-[#5eead4]">
                <Search className="size-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[#f6f0e6]">
                아직 맞는 후보가 없습니다
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#d8d0c0]">
                뮤트가 너무 많거나 코드 밖 음이 섞이면 후보가 줄어듭니다. 프렛을 하나씩 조정해
                보세요.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
