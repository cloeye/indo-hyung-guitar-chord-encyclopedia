import { chordQualities } from "@/data/chordQualities";
import { pitchClassByRoot } from "@/data/chordRoots";
import type { ChordRoot, ChordVoicing, Difficulty, VoicingType } from "@/types/chord";

export type ReverseFretValue = number | "x";

type DegreeDefinition = {
  degree: string;
  interval: number;
  required?: boolean;
};

type ReverseQualitySpec = {
  qualityId: string;
  degrees: DegreeDefinition[];
  difficulty: Difficulty;
  voicingType: VoicingType;
};

export type ReversePlayedNote = {
  stringIndex: number;
  stringNumber: number;
  fret: number;
  pitchClass: number;
  noteName: string;
};

export type ReverseChordCandidate = {
  chordName: string;
  root: ChordRoot;
  qualityId: string;
  qualityName: string;
  bassName: string;
  score: number;
  confidence: "높음" | "보통" | "낮음";
  isSlash: boolean;
  includedDegrees: string[];
  missingDegrees: string[];
  extraNotes: string[];
};

const standardTuningPitchClasses = [4, 9, 2, 7, 11, 4] as const;

const noteNameByPitch: Record<number, ChordRoot> = {
  0: "C",
  1: "C#",
  2: "D",
  3: "Eb",
  4: "E",
  5: "F",
  6: "F#",
  7: "G",
  8: "Ab",
  9: "A",
  10: "Bb",
  11: "B",
};

const rootByPitch = noteNameByPitch;

const reverseQualitySpecs: ReverseQualitySpec[] = [
  {
    qualityId: "major",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "3", interval: 4, required: true },
      { degree: "5", interval: 7 },
    ],
    difficulty: "easy",
    voicingType: "open",
  },
  {
    qualityId: "minor",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "b3", interval: 3, required: true },
      { degree: "5", interval: 7 },
    ],
    difficulty: "easy",
    voicingType: "open",
  },
  {
    qualityId: "dominant7",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "3", interval: 4, required: true },
      { degree: "5", interval: 7 },
      { degree: "b7", interval: 10, required: true },
    ],
    difficulty: "normal",
    voicingType: "full",
  },
  {
    qualityId: "minor7",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "b3", interval: 3, required: true },
      { degree: "5", interval: 7 },
      { degree: "b7", interval: 10, required: true },
    ],
    difficulty: "normal",
    voicingType: "full",
  },
  {
    qualityId: "major7",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "3", interval: 4, required: true },
      { degree: "5", interval: 7 },
      { degree: "7", interval: 11, required: true },
    ],
    difficulty: "normal",
    voicingType: "full",
  },
  {
    qualityId: "sus2",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "2", interval: 2, required: true },
      { degree: "5", interval: 7, required: true },
    ],
    difficulty: "easy",
    voicingType: "open",
  },
  {
    qualityId: "sus4",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "4", interval: 5, required: true },
      { degree: "5", interval: 7, required: true },
    ],
    difficulty: "easy",
    voicingType: "open",
  },
  {
    qualityId: "add9",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "3", interval: 4, required: true },
      { degree: "5", interval: 7 },
      { degree: "9", interval: 2, required: true },
    ],
    difficulty: "easy",
    voicingType: "open",
  },
  {
    qualityId: "dim",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "b3", interval: 3, required: true },
      { degree: "b5", interval: 6, required: true },
    ],
    difficulty: "hard",
    voicingType: "shell",
  },
  {
    qualityId: "aug",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "3", interval: 4, required: true },
      { degree: "#5", interval: 8, required: true },
    ],
    difficulty: "hard",
    voicingType: "shell",
  },
  {
    qualityId: "six",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "3", interval: 4, required: true },
      { degree: "5", interval: 7 },
      { degree: "6", interval: 9, required: true },
    ],
    difficulty: "normal",
    voicingType: "full",
  },
  {
    qualityId: "dominant9",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "3", interval: 4, required: true },
      { degree: "5", interval: 7 },
      { degree: "b7", interval: 10, required: true },
      { degree: "9", interval: 2, required: true },
    ],
    difficulty: "hard",
    voicingType: "advanced",
  },
  {
    qualityId: "minor6",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "b3", interval: 3, required: true },
      { degree: "5", interval: 7 },
      { degree: "6", interval: 9, required: true },
    ],
    difficulty: "hard",
    voicingType: "full",
  },
  {
    qualityId: "minor9",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "b3", interval: 3, required: true },
      { degree: "5", interval: 7 },
      { degree: "b7", interval: 10, required: true },
      { degree: "9", interval: 2, required: true },
    ],
    difficulty: "hard",
    voicingType: "advanced",
  },
  {
    qualityId: "dominant7sus4",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "4", interval: 5, required: true },
      { degree: "5", interval: 7 },
      { degree: "b7", interval: 10, required: true },
    ],
    difficulty: "normal",
    voicingType: "full",
  },
  {
    qualityId: "minor7flat5",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "b3", interval: 3, required: true },
      { degree: "b5", interval: 6, required: true },
      { degree: "b7", interval: 10, required: true },
    ],
    difficulty: "hard",
    voicingType: "shell",
  },
  {
    qualityId: "dim7",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "b3", interval: 3, required: true },
      { degree: "b5", interval: 6, required: true },
      { degree: "bb7", interval: 9, required: true },
    ],
    difficulty: "hard",
    voicingType: "shell",
  },
  {
    qualityId: "sixNine",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "3", interval: 4, required: true },
      { degree: "5", interval: 7 },
      { degree: "6", interval: 9, required: true },
      { degree: "9", interval: 2, required: true },
    ],
    difficulty: "hard",
    voicingType: "advanced",
  },
  {
    qualityId: "major9",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "3", interval: 4, required: true },
      { degree: "5", interval: 7 },
      { degree: "7", interval: 11, required: true },
      { degree: "9", interval: 2, required: true },
    ],
    difficulty: "hard",
    voicingType: "advanced",
  },
  {
    qualityId: "major11",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "3", interval: 4 },
      { degree: "7", interval: 11, required: true },
      { degree: "9", interval: 2, required: true },
      { degree: "11", interval: 5, required: true },
    ],
    difficulty: "expert",
    voicingType: "advanced",
  },
  {
    qualityId: "major13",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "3", interval: 4, required: true },
      { degree: "7", interval: 11, required: true },
      { degree: "9", interval: 2 },
      { degree: "13", interval: 9, required: true },
    ],
    difficulty: "expert",
    voicingType: "advanced",
  },
  {
    qualityId: "minor11",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "b3", interval: 3, required: true },
      { degree: "5", interval: 7 },
      { degree: "b7", interval: 10, required: true },
      { degree: "11", interval: 5, required: true },
    ],
    difficulty: "expert",
    voicingType: "advanced",
  },
  {
    qualityId: "minorMajor7",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "b3", interval: 3, required: true },
      { degree: "5", interval: 7 },
      { degree: "7", interval: 11, required: true },
    ],
    difficulty: "expert",
    voicingType: "shell",
  },
  {
    qualityId: "minorMajor9",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "b3", interval: 3, required: true },
      { degree: "7", interval: 11, required: true },
      { degree: "9", interval: 2, required: true },
    ],
    difficulty: "expert",
    voicingType: "advanced",
  },
  {
    qualityId: "minorSixNine",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "b3", interval: 3, required: true },
      { degree: "6", interval: 9, required: true },
      { degree: "9", interval: 2, required: true },
    ],
    difficulty: "expert",
    voicingType: "advanced",
  },
  {
    qualityId: "eleven",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "3", interval: 4 },
      { degree: "b7", interval: 10, required: true },
      { degree: "9", interval: 2, required: true },
      { degree: "11", interval: 5, required: true },
    ],
    difficulty: "expert",
    voicingType: "advanced",
  },
  {
    qualityId: "dominant13",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "3", interval: 4, required: true },
      { degree: "b7", interval: 10, required: true },
      { degree: "9", interval: 2 },
      { degree: "13", interval: 9, required: true },
    ],
    difficulty: "expert",
    voicingType: "advanced",
  },
  {
    qualityId: "dominant7flat5",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "3", interval: 4, required: true },
      { degree: "b5", interval: 6, required: true },
      { degree: "b7", interval: 10, required: true },
    ],
    difficulty: "expert",
    voicingType: "shell",
  },
  {
    qualityId: "dominant7sharp5",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "3", interval: 4, required: true },
      { degree: "#5", interval: 8, required: true },
      { degree: "b7", interval: 10, required: true },
    ],
    difficulty: "expert",
    voicingType: "shell",
  },
  {
    qualityId: "dominant7flat9",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "3", interval: 4, required: true },
      { degree: "b7", interval: 10, required: true },
      { degree: "b9", interval: 1, required: true },
    ],
    difficulty: "expert",
    voicingType: "advanced",
  },
  {
    qualityId: "dominant7sharp9",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "3", interval: 4, required: true },
      { degree: "b7", interval: 10, required: true },
      { degree: "#9", interval: 3, required: true },
    ],
    difficulty: "expert",
    voicingType: "advanced",
  },
  {
    qualityId: "dominant9flat5",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "3", interval: 4, required: true },
      { degree: "b5", interval: 6, required: true },
      { degree: "b7", interval: 10, required: true },
      { degree: "9", interval: 2 },
    ],
    difficulty: "expert",
    voicingType: "advanced",
  },
  {
    qualityId: "dominant9sharp11",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "3", interval: 4, required: true },
      { degree: "b7", interval: 10, required: true },
      { degree: "9", interval: 2 },
      { degree: "#11", interval: 6, required: true },
    ],
    difficulty: "expert",
    voicingType: "advanced",
  },
  {
    qualityId: "major7flat5",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "3", interval: 4, required: true },
      { degree: "b5", interval: 6, required: true },
      { degree: "7", interval: 11, required: true },
    ],
    difficulty: "expert",
    voicingType: "shell",
  },
  {
    qualityId: "major7sharp5",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "3", interval: 4, required: true },
      { degree: "#5", interval: 8, required: true },
      { degree: "7", interval: 11, required: true },
    ],
    difficulty: "expert",
    voicingType: "shell",
  },
  {
    qualityId: "aug7",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "3", interval: 4, required: true },
      { degree: "#5", interval: 8, required: true },
      { degree: "b7", interval: 10, required: true },
    ],
    difficulty: "expert",
    voicingType: "shell",
  },
  {
    qualityId: "aug9",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "3", interval: 4, required: true },
      { degree: "#5", interval: 8 },
      { degree: "b7", interval: 10, required: true },
      { degree: "9", interval: 2, required: true },
    ],
    difficulty: "expert",
    voicingType: "advanced",
  },
];

const qualityById = new Map(chordQualities.map((quality) => [quality.id, quality]));
const qualityOrder = new Map(reverseQualitySpecs.map((spec, index) => [spec.qualityId, index]));

function normalizePitch(value: number) {
  return ((value % 12) + 12) % 12;
}

function uniqueValues<T>(values: T[]) {
  return [...new Set(values)];
}

function getQualityLabel(qualityId: string) {
  return qualityById.get(qualityId)?.label ?? "";
}

function getQualityName(qualityId: string) {
  return qualityById.get(qualityId)?.displayName ?? qualityId;
}

function getConfidence(score: number): ReverseChordCandidate["confidence"] {
  if (score >= 112) return "높음";
  if (score >= 94) return "보통";
  return "낮음";
}

function assignFingers(frets: ReverseFretValue[]): ChordVoicing["fingers"] {
  const frettedValues = frets.filter((fret): fret is number => typeof fret === "number" && fret > 0);
  const uniqueFrets = uniqueValues(frettedValues).sort((a, b) => a - b);
  const fingerByFret = new Map(uniqueFrets.slice(0, 4).map((fret, index) => [fret, index + 1]));

  return frets.map((fret) => {
    if (fret === "x") return "x";
    if (fret === 0) return 0;
    return fingerByFret.get(fret) ?? 4;
  }) as ChordVoicing["fingers"];
}

function getInputBarre(frets: ReverseFretValue[], fingers: ChordVoicing["fingers"]): ChordVoicing["barre"] {
  const barreFret = frets.find(
    (fret, index) => typeof fret === "number" && fret > 0 && fingers[index] === 1,
  );

  if (typeof barreFret !== "number") {
    return undefined;
  }

  const barreIndexes = frets
    .map((fret, index) => (fret === barreFret ? index : undefined))
    .filter((index): index is number => typeof index === "number");

  if (barreIndexes.length < 2) {
    return undefined;
  }

  const minIndex = Math.min(...barreIndexes);
  const maxIndex = Math.max(...barreIndexes);
  const isContiguous = Array.from({ length: maxIndex - minIndex + 1 }).every(
    (_, offset) => frets[minIndex + offset] === barreFret,
  );

  if (!isContiguous) {
    return undefined;
  }

  const stringNumbers = barreIndexes.map((index) => 6 - index);

  return {
    finger: 1,
    fret: barreFret,
    fromString: Math.max(...stringNumbers),
    toString: Math.min(...stringNumbers),
  };
}

export function getReversePlayedNotes(frets: ReverseFretValue[]): ReversePlayedNote[] {
  return frets.flatMap((fret, stringIndex) => {
    if (fret === "x") {
      return [];
    }

    const pitchClass = normalizePitch(standardTuningPitchClasses[stringIndex] + fret);

    return [
      {
        stringIndex,
        stringNumber: 6 - stringIndex,
        fret,
        pitchClass,
        noteName: noteNameByPitch[pitchClass],
      },
    ];
  });
}

export function getReverseChordCandidates(frets: ReverseFretValue[]): ReverseChordCandidate[] {
  const playedNotes = getReversePlayedNotes(frets);

  if (playedNotes.length < 2) {
    return [];
  }

  const uniquePitchClasses = uniqueValues(playedNotes.map((note) => note.pitchClass));

  if (uniquePitchClasses.length < 2) {
    return [];
  }

  const bassPitch = playedNotes[0].pitchClass;
  const bassName = noteNameByPitch[bassPitch];
  const candidates: ReverseChordCandidate[] = [];

  Object.entries(rootByPitch).forEach(([rootPitchText, root]) => {
    const rootPitch = Number(rootPitchText);

    reverseQualitySpecs.forEach((spec) => {
      const specIntervals = spec.degrees.map((degree) => degree.interval);
      const intervals = uniquePitchClasses.map((pitch) => normalizePitch(pitch - rootPitch));
      const extraIntervals = intervals.filter((interval) => !specIntervals.includes(interval));

      if (extraIntervals.length > 0) {
        return;
      }

      const requiredIntervals = spec.degrees
        .filter((degree) => degree.required)
        .map((degree) => degree.interval);

      if (!requiredIntervals.every((interval) => intervals.includes(interval))) {
        return;
      }

      const includedDegrees = spec.degrees
        .filter((degree) => intervals.includes(degree.interval))
        .map((degree) => degree.degree);
      const missingDegrees = spec.degrees
        .filter((degree) => !degree.required && !intervals.includes(degree.interval))
        .map((degree) => degree.degree);
      const exactMatch = spec.degrees.every((degree) => intervals.includes(degree.interval));
      const isSlash = bassPitch !== rootPitch;
      const label = getQualityLabel(spec.qualityId);
      const chordName = `${root}${label}${isSlash ? `/${bassName}` : ""}`;
      const optionalPresent = includedDegrees.length - requiredIntervals.length;
      const complexityPenalty = Math.max(0, spec.degrees.length - 3) * 2;
      const bassBonus = bassPitch === rootPitch ? 22 : 4;
      const compactBonus = uniquePitchClasses.length <= 3 ? 4 : 0;
      const exactBonus = exactMatch ? 14 : 0;
      const missingPenalty = missingDegrees.length * 3;
      const tensionBonus = spec.degrees.some((degree) => ["9", "11", "13", "b9", "#9", "#11"].includes(degree.degree))
        ? 3
        : 0;
      const score =
        72 +
        requiredIntervals.length * 9 +
        optionalPresent * 5 +
        bassBonus +
        compactBonus +
        exactBonus +
        tensionBonus -
        complexityPenalty -
        missingPenalty;

      candidates.push({
        chordName,
        root,
        qualityId: spec.qualityId,
        qualityName: getQualityName(spec.qualityId),
        bassName,
        score,
        confidence: getConfidence(score),
        isSlash,
        includedDegrees,
        missingDegrees,
        extraNotes: [],
      });
    });
  });

  return candidates
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (qualityOrder.get(a.qualityId) ?? 999) - (qualityOrder.get(b.qualityId) ?? 999);
    })
    .slice(0, 8);
}

export function buildReverseVoicing(
  frets: ReverseFretValue[],
  candidate?: ReverseChordCandidate,
): ChordVoicing {
  const frettedValues = frets.filter((fret): fret is number => typeof fret === "number" && fret > 0);
  const maxFret = frettedValues.length > 0 ? Math.max(...frettedValues) : 1;
  const minFret = frettedValues.length > 0 ? Math.min(...frettedValues) : 1;
  const startFret = maxFret > 5 ? minFret : 1;
  const fingers = assignFingers(frets);
  const rootPitch = candidate ? pitchClassByRoot[candidate.root] : undefined;
  const rootStrings = getReversePlayedNotes(frets)
    .filter((note) => note.pitchClass === rootPitch)
    .map((note) => note.stringIndex);

  return {
    id: "reverse-input",
    chordName: candidate?.chordName ?? "입력 운지",
    displayName: candidate?.chordName ?? "입력 운지",
    root: candidate?.root ?? "C",
    qualityId: candidate?.qualityId ?? "major",
    startFret,
    maxFret,
    frets,
    fingers,
    rootStrings,
    barre: getInputBarre(frets, fingers),
    voicingType: candidate
      ? reverseQualitySpecs.find((spec) => spec.qualityId === candidate.qualityId)?.voicingType ?? "partial"
      : "partial",
    difficulty: candidate
      ? reverseQualitySpecs.find((spec) => spec.qualityId === candidate.qualityId)?.difficulty ?? "normal"
      : "normal",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: candidate?.includedDegrees ?? [],
    omittedDegrees: candidate?.missingDegrees ?? [],
    hasRoot: rootStrings.length > 0,
    hasThird: candidate?.includedDegrees.some((degree) => ["3", "b3"].includes(degree)) ?? false,
    hasFifth: candidate?.includedDegrees.some((degree) => ["5", "b5", "#5"].includes(degree)) ?? false,
    hasSeventh: candidate?.includedDegrees.some((degree) => ["7", "b7", "bb7"].includes(degree)) ?? false,
    hasTension:
      candidate?.includedDegrees.some((degree) => ["9", "11", "13", "b9", "#9", "#11"].includes(degree)) ??
      false,
    collisionRisk: "low",
    isLowPosition: maxFret <= 5,
    isRecommendedForBeginner: maxFret <= 5,
    isFree: true,
    description: "Reverse 입력 운지입니다.",
  };
}
