import { pitchClassByRoot } from "@/data/chordRoots";
import type { ChordRoot, ChordVoicing } from "@/types/chord";

const canonicalRootByPitch: Record<number, ChordRoot> = {
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

const qualityLabels: Record<string, string> = {
  major: "",
  minor: "m",
  dominant7: "7",
  minor7: "m7",
  major7: "M7",
  sus2: "sus2",
  sus4: "sus4",
  add9: "add9",
  dim: "dim",
  aug: "aug",
  six: "6",
  dominant9: "9",
  minor6: "m6",
  minor9: "m9",
  dominant7sus4: "7sus4",
  minor7flat5: "m7-5",
  dim7: "dim7",
  sixNine: "69",
  major9: "M9",
  major11: "M11",
  major13: "M13",
  minor11: "m11",
  minorMajor7: "mM7",
  minorMajor9: "mM9",
  minorSixNine: "m69",
  eleven: "11",
  dominant13: "13",
  dominant7flat5: "7-5",
  dominant7sharp5: "7+5",
  dominant7flat9: "7b9",
  dominant7sharp9: "7#9",
  dominant9flat5: "9-5",
  dominant9sharp11: "9#11",
  major7flat5: "M7-5",
  major7sharp5: "M7+5",
  aug7: "aug7",
  aug9: "aug9",
  "slash-dfsharp": "/F#",
  "slash-ce": "/E",
  "slash-gb": "/B",
  "slash-acsharp": "/C#",
};

type VoicingSeed = Omit<
  ChordVoicing,
  "id" | "chordName" | "displayName" | "maxFret" | "isLowPosition" | "isFree"
> & {
  id: string;
  displayName?: string;
};

function getMaxFret(frets: ChordVoicing["frets"]) {
  return Math.max(...frets.filter((fret): fret is number => fret !== "x"));
}

function buildChordName(root: ChordRoot, qualityId: string) {
  return `${root}${qualityLabels[qualityId] ?? ""}`;
}

function v(seed: VoicingSeed): ChordVoicing {
  const chordName = buildChordName(seed.root, seed.qualityId);
  const maxFret = getMaxFret(seed.frets);

  return {
    ...seed,
    chordName,
    displayName: seed.displayName ?? `${chordName} 실용 보이싱`,
    maxFret,
    isLowPosition: maxFret <= 5,
    isFree: true,
  };
}

function normalizePitch(value: number) {
  return ((value % 12) + 12) % 12;
}

function rootAtString(basePitch: number, fret: number) {
  return canonicalRootByPitch[normalizePitch(basePitch + fret)];
}

function movableBarreVoicing(params: {
  root: ChordRoot;
  qualityId: string;
  family: "E" | "A";
  frets: number[];
  fingers: Array<number | 0>;
  includedDegrees: string[];
  hasThird: boolean;
  hasSeventh: boolean;
  hasTension?: boolean;
  description: string;
}) {
  const startFret = params.frets.filter((fret) => fret > 0).sort((a, b) => a - b)[0] ?? 1;
  const rootString = params.family === "E" ? 0 : 1;
  const frets =
    params.family === "E" ? params.frets : (["x", ...params.frets] as ChordVoicing["frets"]);
  const fingers =
    params.family === "E" ? params.fingers : (["x", ...params.fingers] as ChordVoicing["fingers"]);
  const barreFret = params.family === "E" ? params.frets[0] : params.frets[0];
  const barre =
    barreFret > 0
      ? {
          finger: 1,
          fret: barreFret,
          fromString: params.family === "E" ? 6 : 5,
          toString: 1,
        }
      : undefined;

  return v({
    id: `${params.root.toLowerCase().replace("#", "sharp").replace("b", "flat")}-${
      params.qualityId
    }-${params.family.toLowerCase()}${startFret}-shape`,
    root: params.root,
    qualityId: params.qualityId,
    startFret: Math.max(1, startFret),
    frets,
    fingers,
    rootStrings: [rootString],
    barre,
    voicingType: barre ? "barre" : "open",
    difficulty: barre ? "hard" : "normal",
    useCase: ["solo", "worship", "advanced"],
    includedDegrees: params.includedDegrees,
    omittedDegrees: [],
    hasRoot: true,
    hasThird: params.hasThird,
    hasFifth: true,
    hasSeventh: params.hasSeventh,
    hasTension: params.hasTension ?? false,
    collisionRisk: "low",
    isRecommendedForBeginner: !barre,
    description: params.description,
    caution: barre ? "바레가 부담되면 위의 오픈 코드나 약식 운지를 먼저 연습해도 좋습니다." : undefined,
  });
}

function makeMovableVoicings() {
  const voicings: ChordVoicing[] = [];
  const rootPitches = Object.values(canonicalRootByPitch).map((root) => ({
    root,
    pitch: pitchClassByRoot[root],
  }));

  for (const { root, pitch } of rootPitches) {
    const eFret = normalizePitch(pitch - pitchClassByRoot.E);
    const aFret = normalizePitch(pitch - pitchClassByRoot.A);
    const eShapeFrets = [eFret, eFret + 12];
    const aShapeFrets = [aFret, aFret + 12];

    eShapeFrets.forEach((shapeFret) => {
      if (shapeFret > 0 && shapeFret + 2 <= 17) {
        voicings.push(
          movableBarreVoicing({
            root,
            qualityId: "major",
            family: "E",
            frets: [shapeFret, shapeFret + 2, shapeFret + 2, shapeFret + 1, shapeFret, shapeFret],
            fingers: [1, 3, 4, 2, 1, 1],
            includedDegrees: ["1", "3", "5"],
            hasThird: true,
            hasSeventh: false,
            description: `${root}를 6번 줄 루트로 잡는 E형 바레 코드입니다.`,
          }),
          movableBarreVoicing({
            root,
            qualityId: "minor",
            family: "E",
            frets: [shapeFret, shapeFret + 2, shapeFret + 2, shapeFret, shapeFret, shapeFret],
            fingers: [1, 3, 4, 1, 1, 1],
            includedDegrees: ["1", "b3", "5"],
            hasThird: true,
            hasSeventh: false,
            description: `${root}m을 6번 줄 루트로 잡는 E형 마이너 바레입니다.`,
          }),
          movableBarreVoicing({
            root,
            qualityId: "dominant7",
            family: "E",
            frets: [shapeFret, shapeFret + 2, shapeFret, shapeFret + 1, shapeFret, shapeFret],
            fingers: [1, 3, 1, 2, 1, 1],
            includedDegrees: ["1", "3", "5", "b7"],
            hasThird: true,
            hasSeventh: true,
            description: `${root}7을 6번 줄 루트로 잡는 실전 바레 보이싱입니다.`,
          }),
          movableBarreVoicing({
            root,
            qualityId: "minor7",
            family: "E",
            frets: [shapeFret, shapeFret + 2, shapeFret, shapeFret, shapeFret, shapeFret],
            fingers: [1, 3, 1, 1, 1, 1],
            includedDegrees: ["1", "b3", "5", "b7"],
            hasThird: true,
            hasSeventh: true,
            description: `${root}m7을 6번 줄 루트로 잡는 바레 보이싱입니다.`,
          }),
          movableBarreVoicing({
            root,
            qualityId: "major7",
            family: "E",
            frets: [
              shapeFret,
              shapeFret + 2,
              shapeFret + 1,
              shapeFret + 1,
              shapeFret,
              shapeFret,
            ],
            fingers: [1, 4, 2, 3, 1, 1],
            includedDegrees: ["1", "3", "5", "7"],
            hasThird: true,
            hasSeventh: true,
            description: `${root}M7을 6번 줄 루트로 잡는 바레 보이싱입니다.`,
          }),
        );
      }
    });

    aShapeFrets.forEach((shapeFret) => {
      if (shapeFret > 0 && shapeFret + 2 <= 17) {
        voicings.push(
          movableBarreVoicing({
            root,
            qualityId: "major",
            family: "A",
            frets: [shapeFret, shapeFret + 2, shapeFret + 2, shapeFret + 2, shapeFret],
            fingers: [1, 3, 3, 3, 1],
            includedDegrees: ["1", "3", "5"],
            hasThird: true,
            hasSeventh: false,
            description: `${root}를 5번 줄 루트로 잡는 A형 바레 코드입니다.`,
          }),
          movableBarreVoicing({
            root,
            qualityId: "minor",
            family: "A",
            frets: [shapeFret, shapeFret + 2, shapeFret + 2, shapeFret + 1, shapeFret],
            fingers: [1, 3, 4, 2, 1],
            includedDegrees: ["1", "b3", "5"],
            hasThird: true,
            hasSeventh: false,
            description: `${root}m을 5번 줄 루트로 잡는 A형 마이너 바레입니다.`,
          }),
          movableBarreVoicing({
            root,
            qualityId: "dominant7",
            family: "A",
            frets: [shapeFret, shapeFret + 2, shapeFret, shapeFret + 2, shapeFret],
            fingers: [1, 3, 1, 4, 1],
            includedDegrees: ["1", "3", "5", "b7"],
            hasThird: true,
            hasSeventh: true,
            description: `${root}7을 5번 줄 루트로 잡는 바레 보이싱입니다.`,
          }),
          movableBarreVoicing({
            root,
            qualityId: "minor7",
            family: "A",
            frets: [shapeFret, shapeFret + 2, shapeFret, shapeFret + 1, shapeFret],
            fingers: [1, 3, 1, 2, 1],
            includedDegrees: ["1", "b3", "5", "b7"],
            hasThird: true,
            hasSeventh: true,
            description: `${root}m7을 5번 줄 루트로 잡는 바레 보이싱입니다.`,
          }),
          movableBarreVoicing({
            root,
            qualityId: "major7",
            family: "A",
            frets: [shapeFret, shapeFret + 2, shapeFret + 1, shapeFret + 2, shapeFret],
            fingers: [1, 3, 2, 4, 1],
            includedDegrees: ["1", "3", "5", "7"],
            hasThird: true,
            hasSeventh: true,
            description: `${root}M7을 5번 줄 루트로 잡는 바레 보이싱입니다.`,
          }),
        );
      }
    });
  }

  return voicings;
}

type DegreeDefinition = {
  degree: string;
  interval: number;
  required?: true;
};

type FallbackQualitySpec = {
  qualityId: string;
  degrees: DegreeDefinition[];
  difficulty: ChordVoicing["difficulty"];
  voicingType: ChordVoicing["voicingType"];
  useCase: ChordVoicing["useCase"];
};

type FallbackNoteOption = {
  fret: number;
  degree: string;
  interval: number;
};

type FallbackCandidate = {
  frets: ChordVoicing["frets"];
  fingers: ChordVoicing["fingers"];
  barre?: ChordVoicing["barre"];
  rootStrings: number[];
  startFret: number;
  maxFret: number;
  includedDegrees: string[];
  omittedDegrees: string[];
  score: number;
};

const standardTuningPitchClasses = [4, 9, 2, 7, 11, 4];

const fallbackStringSets = [
  [0, 1, 2, 3],
  [1, 2, 3, 4],
  [2, 3, 4, 5],
  [0, 2, 3, 4],
  [1, 3, 4, 5],
];

const fallbackQualitySpecs: FallbackQualitySpec[] = [
  {
    qualityId: "sus2",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "2", interval: 2, required: true },
      { degree: "5", interval: 7, required: true },
    ],
    difficulty: "easy",
    voicingType: "partial",
    useCase: ["beginner", "solo", "worship"],
  },
  {
    qualityId: "sus4",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "4", interval: 5, required: true },
      { degree: "5", interval: 7, required: true },
    ],
    difficulty: "easy",
    voicingType: "partial",
    useCase: ["beginner", "solo", "worship"],
  },
  {
    qualityId: "add9",
    degrees: [
      { degree: "1", interval: 0, required: true },
      { degree: "3", interval: 4, required: true },
      { degree: "5", interval: 7 },
      { degree: "9", interval: 2, required: true },
    ],
    difficulty: "normal",
    voicingType: "shell",
    useCase: ["solo", "worship"],
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
    useCase: ["band", "advanced"],
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
    useCase: ["band", "advanced"],
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
    voicingType: "shell",
    useCase: ["solo", "worship"],
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
    voicingType: "shell",
    useCase: ["solo", "band", "worship"],
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
    voicingType: "shell",
    useCase: ["solo", "worship"],
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
    voicingType: "shell",
    useCase: ["solo", "band", "worship"],
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
    voicingType: "shell",
    useCase: ["solo", "worship"],
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
    useCase: ["band", "advanced"],
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
    useCase: ["band", "advanced"],
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
    voicingType: "shell",
    useCase: ["solo", "worship", "advanced"],
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
    voicingType: "shell",
    useCase: ["solo", "worship", "advanced"],
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
    useCase: ["band", "advanced"],
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
    useCase: ["band", "advanced"],
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
    useCase: ["band", "advanced"],
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
    useCase: ["band", "advanced"],
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
    useCase: ["band", "advanced"],
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
    useCase: ["band", "advanced"],
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
    useCase: ["band", "advanced"],
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
    useCase: ["band", "worship", "advanced"],
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
    useCase: ["band", "advanced"],
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
    useCase: ["band", "advanced"],
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
    useCase: ["band", "advanced"],
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
    useCase: ["band", "advanced"],
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
    useCase: ["band", "advanced"],
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
    useCase: ["band", "advanced"],
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
    useCase: ["band", "advanced"],
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
    useCase: ["band", "advanced"],
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
    useCase: ["band", "advanced"],
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
    useCase: ["band", "advanced"],
  },
];

function uniqueValues<T>(values: T[]) {
  return [...new Set(values)];
}

function getFallbackNoteOptions(rootPitch: number, stringIndex: number, spec: FallbackQualitySpec) {
  const options: FallbackNoteOption[] = [];

  for (let fret = 0; fret <= 17; fret += 1) {
    const interval = normalizePitch(standardTuningPitchClasses[stringIndex] + fret - rootPitch);
    const degree = spec.degrees.find((candidate) => candidate.interval === interval);

    if (degree) {
      options.push({ fret, degree: degree.degree, interval });
    }
  }

  return options;
}

function getRequiredDegrees(spec: FallbackQualitySpec) {
  return spec.degrees.filter((degree) => degree.required).map((degree) => degree.degree);
}

function assignFallbackFingers(frets: ChordVoicing["frets"]) {
  const frettedValues = frets.filter((fret): fret is number => typeof fret === "number" && fret > 0);
  const uniqueFrets = uniqueValues(frettedValues).sort((a, b) => a - b);

  if (uniqueFrets.length > 4) {
    return undefined;
  }

  const fingerByFret = new Map(uniqueFrets.map((fret, index) => [fret, index + 1]));
  const fingers = frets.map((fret) => {
    if (fret === "x") return "x";
    if (fret === 0) return 0;
    return fingerByFret.get(fret) ?? 4;
  });

  return fingers as ChordVoicing["fingers"];
}

function getFallbackBarre(frets: ChordVoicing["frets"], fingers: ChordVoicing["fingers"]) {
  const barreFret = frets.find((fret, index) => typeof fret === "number" && fret > 0 && fingers[index] === 1);

  if (typeof barreFret !== "number") {
    return undefined;
  }

  const barreStringIndexes = frets
    .map((fret, index) => (fret === barreFret ? index : undefined))
    .filter((index): index is number => typeof index === "number");

  if (barreStringIndexes.length < 2) {
    return undefined;
  }

  const minIndex = Math.min(...barreStringIndexes);
  const maxIndex = Math.max(...barreStringIndexes);
  const isContiguous = Array.from({ length: maxIndex - minIndex + 1 }).every(
    (_, offset) => frets[minIndex + offset] === barreFret,
  );

  if (!isContiguous) {
    return undefined;
  }

  const stringNumbers = barreStringIndexes.map((index) => 6 - index);

  return {
    finger: 1,
    fret: barreFret,
    fromString: Math.max(...stringNumbers),
    toString: Math.min(...stringNumbers),
  };
}

function buildFallbackCandidate(params: {
  rootPitch: number;
  spec: FallbackQualitySpec;
  stringSet: number[];
  notes: FallbackNoteOption[];
}) {
  const { spec, stringSet, notes } = params;
  const includedDegrees = uniqueValues(notes.map((note) => note.degree));
  const requiredDegrees = getRequiredDegrees(spec);

  if (!requiredDegrees.every((degree) => includedDegrees.includes(degree))) {
    return undefined;
  }

  const fullFrets: ChordVoicing["frets"] = ["x", "x", "x", "x", "x", "x"];

  notes.forEach((note, index) => {
    fullFrets[stringSet[index]] = note.fret;
  });

  const frettedValues = fullFrets.filter(
    (fret): fret is number => typeof fret === "number" && fret > 0,
  );

  if (frettedValues.length === 0) {
    return undefined;
  }

  const minFret = Math.min(...frettedValues);
  const maxFret = Math.max(...frettedValues);
  const hasHighOpenString = fullFrets.some((fret) => fret === 0) && minFret > 4;
  const fretSpan = maxFret - minFret;

  if (maxFret > 17 || fretSpan > 4 || hasHighOpenString || !includedDegrees.includes("1")) {
    return undefined;
  }

  const fingers = assignFallbackFingers(fullFrets);

  if (!fingers) {
    return undefined;
  }

  const omittedDegrees = spec.degrees
    .map((degree) => degree.degree)
    .filter((degree) => !includedDegrees.includes(degree));
  const rootStrings = notes
    .map((note, index) => (note.degree === "1" ? stringSet[index] : undefined))
    .filter((index): index is number => typeof index === "number");
  const repeatedDegreePenalty = notes.length - includedDegrees.length;
  const mutedOuterPenalty = [fullFrets[0], fullFrets[5]].filter((fret) => fret === "x").length;
  const score = maxFret * 5 + fretSpan * 8 + omittedDegrees.length * 10 + repeatedDegreePenalty * 4 + mutedOuterPenalty;

  return {
    frets: fullFrets,
    fingers,
    barre: getFallbackBarre(fullFrets, fingers),
    rootStrings,
    startFret: Math.max(1, minFret),
    maxFret,
    includedDegrees,
    omittedDegrees,
    score,
  } satisfies FallbackCandidate;
}

function getFallbackCandidates(rootPitch: number, spec: FallbackQualitySpec) {
  const candidates: FallbackCandidate[] = [];

  fallbackStringSets.forEach((stringSet) => {
    const optionsByString = stringSet.map((stringIndex) =>
      getFallbackNoteOptions(rootPitch, stringIndex, spec),
    );

    if (optionsByString.some((options) => options.length === 0)) {
      return;
    }

    optionsByString[0].forEach((firstNote) => {
      optionsByString[1].forEach((secondNote) => {
        optionsByString[2].forEach((thirdNote) => {
          optionsByString[3].forEach((fourthNote) => {
            const candidate = buildFallbackCandidate({
              rootPitch,
              spec,
              stringSet,
              notes: [firstNote, secondNote, thirdNote, fourthNote],
            });

            if (candidate) {
              candidates.push(candidate);
            }
          });
        });
      });
    });
  });

  const byFrets = new Map<string, FallbackCandidate>();

  candidates
    .sort((a, b) => a.score - b.score)
    .forEach((candidate) => {
      const key = candidate.frets.join("-");

      if (!byFrets.has(key)) {
        byFrets.set(key, candidate);
      }
    });

  return [...byFrets.values()].slice(0, 2);
}

function makeFallbackVoicings(existingVoicings: ChordVoicing[]) {
  const voicings: ChordVoicing[] = [];
  const existingKeys = new Set(
    existingVoicings.map((voicing) => `${voicing.root}:${voicing.qualityId}`),
  );

  Object.values(canonicalRootByPitch).forEach((root) => {
    const rootPitch = pitchClassByRoot[root];

    fallbackQualitySpecs.forEach((spec) => {
      if (existingKeys.has(`${root}:${spec.qualityId}`)) {
        return;
      }

      getFallbackCandidates(rootPitch, spec).forEach((candidate, index) => {
        const chordName = buildChordName(root, spec.qualityId);

        voicings.push(
          v({
            id: `${root.toLowerCase().replace("#", "sharp").replace("b", "flat")}-${
              spec.qualityId
            }-fallback-${index + 1}`,
            root,
            qualityId: spec.qualityId,
            displayName: `${chordName} 추천 운지`,
            startFret: candidate.startFret,
            frets: candidate.frets,
            fingers: candidate.fingers,
            rootStrings: candidate.rootStrings,
            barre: candidate.barre,
            voicingType: spec.voicingType,
            difficulty: candidate.maxFret <= 5 && spec.difficulty !== "expert" ? "normal" : spec.difficulty,
            useCase: spec.useCase,
            includedDegrees: candidate.includedDegrees,
            omittedDegrees: candidate.omittedDegrees,
            hasRoot: true,
            hasThird: candidate.includedDegrees.some((degree) => ["3", "b3", "4", "2"].includes(degree)),
            hasFifth: candidate.includedDegrees.some((degree) => ["5", "b5", "#5"].includes(degree)),
            hasSeventh: candidate.includedDegrees.some((degree) => ["7", "b7", "bb7"].includes(degree)),
            hasTension: candidate.includedDegrees.some((degree) =>
              ["9", "11", "13", "b9", "#9", "#11"].includes(degree),
            ),
            collisionRisk: candidate.maxFret - candidate.startFret > 3 ? "medium" : "low",
            isRecommendedForBeginner:
              candidate.maxFret <= 5 && spec.difficulty !== "hard" && spec.difficulty !== "expert",
            description: `${chordName}의 핵심음을 4줄 안에 모은 추천 운지입니다.`,
            caution:
              candidate.omittedDegrees.length > 0
                ? `생략음: ${candidate.omittedDegrees.join(", ")}`
                : undefined,
          }),
        );
      });
    });
  });

  return voicings;
}

const curatedVoicings: ChordVoicing[] = [
  v({
    id: "c-major-open",
    root: "C",
    qualityId: "major",
    startFret: 1,
    frets: ["x", 3, 2, 0, 1, 0],
    fingers: ["x", 3, 2, 0, 1, 0],
    rootStrings: [1, 4],
    voicingType: "open",
    difficulty: "easy",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: ["1", "3", "5"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: false,
    hasTension: false,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "통기타에서 가장 많이 쓰는 C 기본 오픈 코드입니다.",
  }),
  v({
    id: "c-major-easy-three-string",
    root: "C",
    qualityId: "major",
    startFret: 1,
    frets: ["x", "x", "x", 0, 1, 0],
    fingers: ["x", "x", "x", 0, 1, 0],
    rootStrings: [4],
    voicingType: "partial",
    difficulty: "easy",
    useCase: ["beginner", "band", "worship"],
    includedDegrees: ["1", "3"],
    omittedDegrees: ["5"],
    hasRoot: true,
    hasThird: true,
    hasFifth: false,
    hasSeventh: false,
    hasTension: false,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "손가락 하나로 C의 성격만 빠르게 잡는 약식 운지입니다.",
  }),
  v({
    id: "d-major-open",
    root: "D",
    qualityId: "major",
    startFret: 1,
    frets: ["x", "x", 0, 2, 3, 2],
    fingers: ["x", "x", 0, 1, 3, 2],
    rootStrings: [2],
    voicingType: "open",
    difficulty: "easy",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: ["1", "3", "5"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: false,
    hasTension: false,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "찬양 반주에서 자주 쓰이는 D 기본 오픈 코드입니다.",
  }),
  v({
    id: "e-major-open",
    root: "E",
    qualityId: "major",
    startFret: 1,
    frets: [0, 2, 2, 1, 0, 0],
    fingers: [0, 2, 3, 1, 0, 0],
    rootStrings: [0, 5],
    voicingType: "open",
    difficulty: "easy",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: ["1", "3", "5"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: false,
    hasTension: false,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "개방현이 풍성하게 울리는 E 기본 오픈 코드입니다.",
  }),
  v({
    id: "f-major-easy",
    root: "F",
    qualityId: "major",
    startFret: 1,
    frets: ["x", "x", 3, 2, 1, 1],
    fingers: ["x", "x", 3, 2, 1, 1],
    rootStrings: [2, 5],
    barre: { finger: 1, fret: 1, fromString: 2, toString: 1 },
    voicingType: "partial",
    difficulty: "normal",
    useCase: ["beginner", "band", "worship"],
    includedDegrees: ["1", "3", "5"],
    omittedDegrees: ["low 1"],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: false,
    hasTension: false,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "처음 F를 만날 때 쓰기 좋은 4줄 약식 운지입니다.",
    caution: "6번, 5번 줄은 뮤트하면 소리가 더 깔끔합니다.",
  }),
  v({
    id: "f-major7-open-sub",
    root: "F",
    qualityId: "major7",
    startFret: 1,
    frets: ["x", "x", 3, 2, 1, 0],
    fingers: ["x", "x", 3, 2, 1, 0],
    rootStrings: [2],
    voicingType: "open",
    difficulty: "easy",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: ["1", "3", "5", "7"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: true,
    hasTension: false,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "바레 F가 어려울 때 많이 쓰는 Fmaj7 대체 운지입니다.",
  }),
  v({
    id: "g-major-open",
    root: "G",
    qualityId: "major",
    startFret: 1,
    frets: [3, 2, 0, 0, 3, 3],
    fingers: [2, 1, 0, 0, 3, 4],
    rootStrings: [0, 3, 5],
    voicingType: "open",
    difficulty: "easy",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: ["1", "3", "5"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: false,
    hasTension: false,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "찬양 곡에서 가장 많이 만나는 G 오픈 코드입니다.",
  }),
  v({
    id: "a-major-open",
    root: "A",
    qualityId: "major",
    startFret: 1,
    frets: ["x", 0, 2, 2, 2, 0],
    fingers: ["x", 0, 1, 2, 3, 0],
    rootStrings: [1, 5],
    voicingType: "open",
    difficulty: "easy",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: ["1", "3", "5"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: false,
    hasTension: false,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "손가락 세 개를 나란히 놓는 A 기본 오픈 코드입니다.",
  }),
  v({
    id: "b-major-a-shape",
    root: "B",
    qualityId: "major",
    startFret: 2,
    frets: ["x", 2, 4, 4, 4, 2],
    fingers: ["x", 1, 3, 3, 3, 1],
    rootStrings: [1, 5],
    barre: { finger: 1, fret: 2, fromString: 5, toString: 1 },
    voicingType: "barre",
    difficulty: "hard",
    useCase: ["solo", "worship", "advanced"],
    includedDegrees: ["1", "3", "5"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: false,
    hasTension: false,
    collisionRisk: "low",
    isRecommendedForBeginner: false,
    description: "B를 5번 줄 루트로 잡는 A형 바레 코드입니다.",
  }),
  v({
    id: "a-minor-open",
    root: "A",
    qualityId: "minor",
    startFret: 1,
    frets: ["x", 0, 2, 2, 1, 0],
    fingers: ["x", 0, 2, 3, 1, 0],
    rootStrings: [1, 5],
    voicingType: "open",
    difficulty: "easy",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: ["1", "b3", "5"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: false,
    hasTension: false,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "초보자가 가장 먼저 익히기 좋은 Am 오픈 코드입니다.",
  }),
  v({
    id: "b-minor-easy",
    root: "B",
    qualityId: "minor",
    startFret: 2,
    frets: ["x", 2, 4, 4, 3, "x"],
    fingers: ["x", 1, 3, 4, 2, "x"],
    rootStrings: [1],
    voicingType: "partial",
    difficulty: "normal",
    useCase: ["beginner", "band", "worship"],
    includedDegrees: ["1", "b3", "5"],
    omittedDegrees: ["high 5"],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: false,
    hasTension: false,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "풀 바레 Bm이 어렵다면 먼저 사용할 수 있는 4줄 약식 운지입니다.",
  }),
  v({
    id: "d-minor-open",
    root: "D",
    qualityId: "minor",
    startFret: 1,
    frets: ["x", "x", 0, 2, 3, 1],
    fingers: ["x", "x", 0, 2, 3, 1],
    rootStrings: [2],
    voicingType: "open",
    difficulty: "easy",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: ["1", "b3", "5"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: false,
    hasTension: false,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "1번 줄을 1프렛으로 낮춰 마이너 색을 만드는 Dm 오픈 코드입니다.",
  }),
  v({
    id: "e-minor-open",
    root: "E",
    qualityId: "minor",
    startFret: 1,
    frets: [0, 2, 2, 0, 0, 0],
    fingers: [0, 2, 3, 0, 0, 0],
    rootStrings: [0, 5],
    voicingType: "open",
    difficulty: "easy",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: ["1", "b3", "5"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: false,
    hasTension: false,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "손가락 두 개로 풍성하게 울리는 Em 오픈 코드입니다.",
  }),
  v({
    id: "c-dominant7-open",
    root: "C",
    qualityId: "dominant7",
    startFret: 1,
    frets: ["x", 3, 2, 3, 1, 0],
    fingers: ["x", 3, 2, 4, 1, 0],
    rootStrings: [1, 4],
    voicingType: "open",
    difficulty: "normal",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: ["1", "3", "5", "b7"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: true,
    hasTension: false,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "C에서 F로 이어질 때 자연스럽게 긴장감을 만드는 C7 오픈 코드입니다.",
  }),
  v({
    id: "d-dominant7-open",
    root: "D",
    qualityId: "dominant7",
    startFret: 1,
    frets: ["x", "x", 0, 2, 1, 2],
    fingers: ["x", "x", 0, 2, 1, 3],
    rootStrings: [2],
    voicingType: "open",
    difficulty: "easy",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: ["1", "3", "5", "b7"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: true,
    hasTension: false,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "G로 해결되는 느낌이 또렷한 D7 기본 운지입니다.",
  }),
  v({
    id: "e-dominant7-open",
    root: "E",
    qualityId: "dominant7",
    startFret: 1,
    frets: [0, 2, 0, 1, 0, 0],
    fingers: [0, 2, 0, 1, 0, 0],
    rootStrings: [0, 5],
    voicingType: "open",
    difficulty: "easy",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: ["1", "3", "5", "b7"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: true,
    hasTension: false,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "한 손가락만 더해도 도미넌트 느낌이 나는 E7 오픈 코드입니다.",
  }),
  v({
    id: "g-dominant7-open",
    root: "G",
    qualityId: "dominant7",
    startFret: 1,
    frets: [3, 2, 0, 0, 0, 1],
    fingers: [3, 2, 0, 0, 0, 1],
    rootStrings: [0, 3],
    voicingType: "open",
    difficulty: "easy",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: ["1", "3", "5", "b7"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: true,
    hasTension: false,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "C로 해결될 때 많이 쓰는 G7 오픈 코드입니다.",
  }),
  v({
    id: "a-dominant7-open",
    root: "A",
    qualityId: "dominant7",
    startFret: 1,
    frets: ["x", 0, 2, 0, 2, 0],
    fingers: ["x", 0, 2, 0, 3, 0],
    rootStrings: [1, 5],
    voicingType: "open",
    difficulty: "easy",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: ["1", "3", "5", "b7"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: true,
    hasTension: false,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "D로 풀리는 진행에서 자주 쓰이는 A7 오픈 코드입니다.",
  }),
  v({
    id: "a-minor7-open",
    root: "A",
    qualityId: "minor7",
    startFret: 1,
    frets: ["x", 0, 2, 0, 1, 0],
    fingers: ["x", 0, 2, 0, 1, 0],
    rootStrings: [1, 5],
    voicingType: "open",
    difficulty: "easy",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: ["1", "b3", "5", "b7"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: true,
    hasTension: false,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "Am에서 손가락 하나를 빼면 바로 만들 수 있는 Am7 운지입니다.",
  }),
  v({
    id: "c-major7-open",
    root: "C",
    qualityId: "major7",
    startFret: 1,
    frets: ["x", 3, 2, 0, 0, 0],
    fingers: ["x", 3, 2, 0, 0, 0],
    rootStrings: [1, 4],
    voicingType: "open",
    difficulty: "easy",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: ["1", "3", "5", "7"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: true,
    hasTension: false,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "C에서 1번 손가락을 떼면 만드는 맑은 CM7 운지입니다.",
  }),
  v({
    id: "d-major7-open",
    root: "D",
    qualityId: "major7",
    startFret: 1,
    frets: ["x", "x", 0, 2, 2, 2],
    fingers: ["x", "x", 0, 1, 1, 1],
    rootStrings: [2],
    barre: { finger: 1, fret: 2, fromString: 3, toString: 1 },
    voicingType: "open",
    difficulty: "normal",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: ["1", "3", "5", "7"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: true,
    hasTension: false,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "2프렛 세 줄을 가볍게 누르는 DM7 오픈 보이싱입니다.",
  }),
  v({
    id: "g-major7-open",
    root: "G",
    qualityId: "major7",
    startFret: 1,
    frets: [3, 2, 0, 0, 0, 2],
    fingers: [3, 1, 0, 0, 0, 2],
    rootStrings: [0, 3],
    voicingType: "open",
    difficulty: "normal",
    useCase: ["solo", "worship"],
    includedDegrees: ["1", "3", "5", "7"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: true,
    hasTension: false,
    collisionRisk: "low",
    isRecommendedForBeginner: false,
    description: "G보다 부드럽고 세련된 마무리감을 주는 GM7 운지입니다.",
  }),
  v({
    id: "d-sus4-open",
    root: "D",
    qualityId: "sus4",
    startFret: 1,
    frets: ["x", "x", 0, 2, 3, 3],
    fingers: ["x", "x", 0, 1, 3, 4],
    rootStrings: [2],
    voicingType: "open",
    difficulty: "easy",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: ["1", "4", "5"],
    omittedDegrees: ["3"],
    hasRoot: true,
    hasThird: false,
    hasFifth: true,
    hasSeventh: false,
    hasTension: true,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "D와 번갈아 치면 자연스럽게 해결되는 Dsus4 운지입니다.",
  }),
  v({
    id: "a-sus4-open",
    root: "A",
    qualityId: "sus4",
    startFret: 1,
    frets: ["x", 0, 2, 2, 3, 0],
    fingers: ["x", 0, 1, 2, 3, 0],
    rootStrings: [1, 5],
    voicingType: "open",
    difficulty: "easy",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: ["1", "4", "5"],
    omittedDegrees: ["3"],
    hasRoot: true,
    hasThird: false,
    hasFifth: true,
    hasSeventh: false,
    hasTension: true,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "A 코드와 번갈아 연주하기 좋은 Asus4 기본 운지입니다.",
  }),
  v({
    id: "g-sus4-open",
    root: "G",
    qualityId: "sus4",
    startFret: 1,
    frets: [3, 3, 0, 0, 1, 3],
    fingers: [3, 4, 0, 0, 1, 2],
    rootStrings: [0, 3, 5],
    voicingType: "open",
    difficulty: "normal",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: ["1", "4", "5"],
    omittedDegrees: ["3"],
    hasRoot: true,
    hasThird: false,
    hasFifth: true,
    hasSeventh: false,
    hasTension: true,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "G의 밝은 3음을 잠시 빼고 긴장을 만드는 Gsus4 운지입니다.",
  }),
  v({
    id: "d-sus2-open",
    root: "D",
    qualityId: "sus2",
    startFret: 1,
    frets: ["x", "x", 0, 2, 3, 0],
    fingers: ["x", "x", 0, 1, 3, 0],
    rootStrings: [2],
    voicingType: "open",
    difficulty: "easy",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: ["1", "2", "5"],
    omittedDegrees: ["3"],
    hasRoot: true,
    hasThird: false,
    hasFifth: true,
    hasSeventh: false,
    hasTension: true,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "D 코드에서 1번 줄을 열어 맑게 만드는 Dsus2 운지입니다.",
  }),
  v({
    id: "c-add9-open",
    root: "C",
    qualityId: "add9",
    startFret: 1,
    frets: ["x", 3, 2, 0, 3, 0],
    fingers: ["x", 3, 2, 0, 4, 0],
    rootStrings: [1],
    voicingType: "open",
    difficulty: "easy",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: ["1", "3", "5", "9"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: false,
    hasTension: true,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "7음 없이 9음을 더한 맑은 Cadd9 찬양 반주 보이싱입니다.",
  }),
  v({
    id: "g-add9-open",
    root: "G",
    qualityId: "add9",
    startFret: 1,
    frets: [3, 0, 0, 2, 0, 3],
    fingers: [2, 0, 0, 1, 0, 3],
    rootStrings: [0, 2, 5],
    voicingType: "open",
    difficulty: "normal",
    useCase: ["solo", "worship"],
    includedDegrees: ["1", "3", "5", "9"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: false,
    hasTension: true,
    collisionRisk: "low",
    isRecommendedForBeginner: false,
    description: "개방현을 활용해 G에 9음의 밝은 공간감을 더합니다.",
  }),
  v({
    id: "d-add9-open",
    root: "D",
    qualityId: "add9",
    startFret: 1,
    frets: ["x", "x", 0, 2, 3, 0],
    fingers: ["x", "x", 0, 1, 3, 0],
    rootStrings: [2],
    voicingType: "open",
    difficulty: "easy",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: ["1", "3", "5", "9"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: false,
    hasTension: true,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "Dsus2와 같은 손모양으로도 쓰이는 실전 Dadd9 보이싱입니다.",
  }),
  v({
    id: "c-aug-open",
    root: "C",
    qualityId: "aug",
    startFret: 1,
    frets: ["x", 3, 2, 1, 1, 0],
    fingers: ["x", 4, 3, 1, 2, 0],
    rootStrings: [1, 4],
    voicingType: "partial",
    difficulty: "hard",
    useCase: ["solo", "advanced"],
    includedDegrees: ["1", "3", "#5"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: false,
    hasSeventh: false,
    hasTension: true,
    collisionRisk: "medium",
    isRecommendedForBeginner: false,
    description: "5음을 올려 다음 코드로 미끄러지는 느낌을 만드는 Caug 운지입니다.",
  }),
  v({
    id: "c-dim-shell",
    root: "C",
    qualityId: "dim",
    startFret: 2,
    frets: ["x", 3, 4, 2, 4, "x"],
    fingers: ["x", 2, 3, 1, 4, "x"],
    rootStrings: [1],
    voicingType: "shell",
    difficulty: "hard",
    useCase: ["band", "advanced"],
    includedDegrees: ["1", "b3", "b5", "bb7"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: false,
    hasSeventh: true,
    hasTension: true,
    collisionRisk: "medium",
    isRecommendedForBeginner: false,
    description: "Cdim 계열의 긴장감을 만드는 4줄 중심 보이싱입니다.",
  }),
  v({
    id: "a-minor9-open",
    root: "A",
    qualityId: "minor9",
    startFret: 1,
    frets: ["x", 0, 5, 5, 0, 0],
    fingers: ["x", 0, 2, 3, 0, 0],
    rootStrings: [1, 5],
    voicingType: "partial",
    difficulty: "normal",
    useCase: ["solo", "worship"],
    includedDegrees: ["1", "b3", "b7", "9"],
    omittedDegrees: ["5"],
    hasRoot: true,
    hasThird: true,
    hasFifth: false,
    hasSeventh: true,
    hasTension: true,
    collisionRisk: "low",
    isRecommendedForBeginner: false,
    description: "Am9의 부드러운 색을 개방현으로 만드는 반주용 약식 운지입니다.",
  }),
  v({
    id: "e-minor9-open",
    root: "E",
    qualityId: "minor9",
    startFret: 1,
    frets: [0, 2, 0, 0, 0, 2],
    fingers: [0, 2, 0, 0, 0, 3],
    rootStrings: [0],
    voicingType: "partial",
    difficulty: "easy",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: ["1", "b3", "5", "9"],
    omittedDegrees: ["b7"],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: false,
    hasTension: true,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "Em에 9음 느낌을 더한 쉬운 약식 보이싱입니다.",
    caution: "b7이 빠져 있어 합주에서는 Em(add9)처럼 가볍게 사용할 수 있습니다.",
  }),
  v({
    id: "c-major9-open",
    root: "C",
    qualityId: "major9",
    startFret: 1,
    frets: ["x", 3, 2, 4, 3, 0],
    fingers: ["x", 2, 1, 4, 3, 0],
    rootStrings: [1],
    voicingType: "shell",
    difficulty: "hard",
    useCase: ["solo", "worship", "advanced"],
    includedDegrees: ["1", "3", "7", "9"],
    omittedDegrees: ["5"],
    hasRoot: true,
    hasThird: true,
    hasFifth: false,
    hasSeventh: true,
    hasTension: true,
    collisionRisk: "low",
    isRecommendedForBeginner: false,
    description: "CM9의 핵심인 3음, 7음, 9음을 살린 로우 포지션 보이싱입니다.",
  }),
  v({
    id: "g-dominant9-rootless",
    root: "G",
    qualityId: "dominant9",
    startFret: 2,
    frets: ["x", "x", 3, 2, 3, 3],
    fingers: ["x", "x", 2, 1, 3, 4],
    rootStrings: [],
    voicingType: "rootless",
    difficulty: "normal",
    useCase: ["band", "worship", "advanced"],
    includedDegrees: ["3", "b7", "9", "5"],
    omittedDegrees: ["1"],
    hasRoot: false,
    hasThird: true,
    hasFifth: true,
    hasSeventh: true,
    hasTension: true,
    collisionRisk: "low",
    isRecommendedForBeginner: false,
    description: "베이스가 G를 연주할 때 깔끔하게 들리는 G9 루트리스 보이싱입니다.",
    caution: "혼자 반주할 때는 G 루트가 빠져 가볍게 들릴 수 있습니다.",
  }),
  v({
    id: "a-dominant9-open",
    root: "A",
    qualityId: "dominant9",
    startFret: 1,
    frets: ["x", 0, 2, 4, 2, 3],
    fingers: ["x", 0, 1, 4, 2, 3],
    rootStrings: [1],
    voicingType: "shell",
    difficulty: "hard",
    useCase: ["solo", "worship", "advanced"],
    includedDegrees: ["1", "3", "b7", "9"],
    omittedDegrees: ["5"],
    hasRoot: true,
    hasThird: true,
    hasFifth: false,
    hasSeventh: true,
    hasTension: true,
    collisionRisk: "low",
    isRecommendedForBeginner: false,
    description: "A9의 3음, b7음, 9음을 선명하게 담은 반주용 보이싱입니다.",
  }),
  v({
    id: "g-dominant13-band-low-shell",
    root: "G",
    qualityId: "dominant13",
    startFret: 3,
    frets: ["x", "x", 3, 4, 5, 5],
    fingers: ["x", "x", 1, 2, 3, 4],
    rootStrings: [],
    voicingType: "rootless",
    difficulty: "normal",
    useCase: ["band", "worship", "advanced"],
    includedDegrees: ["3", "b7", "9", "13"],
    omittedDegrees: ["1", "5", "11"],
    hasRoot: false,
    hasThird: true,
    hasFifth: false,
    hasSeventh: true,
    hasTension: true,
    collisionRisk: "low",
    isRecommendedForBeginner: false,
    description:
      "베이스가 G를 연주하는 상황에서 쓰기 좋은 G13 약식 보이싱입니다. 3음, b7음, 13음을 중심으로 코드의 성격을 전달합니다.",
    caution: "혼자 반주할 때는 루트가 빠져 다소 불안정하게 들릴 수 있습니다.",
  }),
  v({
    id: "c-dominant13-low",
    root: "C",
    qualityId: "dominant13",
    startFret: 2,
    frets: ["x", 3, 2, 3, 3, 5],
    fingers: ["x", 2, 1, 3, 3, 4],
    rootStrings: [1],
    barre: { finger: 3, fret: 3, fromString: 3, toString: 2 },
    voicingType: "shell",
    difficulty: "hard",
    useCase: ["solo", "band", "worship", "advanced"],
    includedDegrees: ["1", "3", "b7", "9", "13"],
    omittedDegrees: ["5", "11"],
    hasRoot: true,
    hasThird: true,
    hasFifth: false,
    hasSeventh: true,
    hasTension: true,
    collisionRisk: "low",
    isRecommendedForBeginner: false,
    description: "C13의 분위기를 만드는 핵심음과 13음을 남긴 실용 보이싱입니다.",
  }),
  v({
    id: "a-dominant7flat9-open",
    root: "A",
    qualityId: "dominant7flat9",
    startFret: 1,
    frets: ["x", 0, 2, 3, 2, 3],
    fingers: ["x", 0, 1, 3, 2, 4],
    rootStrings: [1],
    voicingType: "shell",
    difficulty: "hard",
    useCase: ["band", "worship", "advanced"],
    includedDegrees: ["1", "3", "b7", "b9"],
    omittedDegrees: ["5"],
    hasRoot: true,
    hasThird: true,
    hasFifth: false,
    hasSeventh: true,
    hasTension: true,
    collisionRisk: "medium",
    isRecommendedForBeginner: false,
    description: "A7의 긴장감에 b9를 더해 D 계열로 강하게 해결되는 보이싱입니다.",
  }),
  v({
    id: "g-dominant7sharp9-shell",
    root: "G",
    qualityId: "dominant7sharp9",
    startFret: 3,
    frets: [3, "x", 3, 4, 3, 6],
    fingers: [1, "x", 2, 3, 1, 4],
    rootStrings: [0],
    barre: { finger: 1, fret: 3, fromString: 6, toString: 2 },
    voicingType: "shell",
    difficulty: "expert",
    useCase: ["band", "advanced"],
    includedDegrees: ["1", "3", "5", "b7", "#9"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: true,
    hasTension: true,
    collisionRisk: "medium",
    isRecommendedForBeginner: false,
    description: "G7에 #9의 강한 색채를 더한 얼터드 도미넌트 보이싱입니다.",
  }),
  v({
    id: "d-over-fsharp",
    root: "D",
    qualityId: "slash-dfsharp",
    chordName: "D/F#",
    displayName: "D/F# 분수코드",
    startFret: 1,
    frets: [2, 0, 0, 2, 3, 2],
    fingers: [1, 0, 0, 2, 4, 3],
    rootStrings: [2],
    voicingType: "open",
    difficulty: "easy",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: ["3 in bass", "1", "5"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: false,
    hasTension: false,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "D 코드에 F# 베이스를 둔 운지입니다. G-D/F#-Em 같은 하행 베이스에 잘 맞습니다.",
  } as VoicingSeed),
  v({
    id: "c-over-e",
    root: "C",
    qualityId: "slash-ce",
    chordName: "C/E",
    displayName: "C/E 분수코드",
    startFret: 1,
    frets: [0, 3, 2, 0, 1, 0],
    fingers: [0, 3, 2, 0, 1, 0],
    rootStrings: [1, 4],
    voicingType: "open",
    difficulty: "easy",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: ["3 in bass", "1", "5"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: false,
    hasTension: false,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "C 코드에 E 베이스를 열어 두는 쉬운 분수코드입니다.",
  } as VoicingSeed),
  v({
    id: "g-over-b",
    root: "G",
    qualityId: "slash-gb",
    chordName: "G/B",
    displayName: "G/B 분수코드",
    startFret: 1,
    frets: ["x", 2, 0, 0, 3, 3],
    fingers: ["x", 1, 0, 0, 3, 4],
    rootStrings: [3, 5],
    voicingType: "open",
    difficulty: "easy",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: ["3 in bass", "1", "5"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: false,
    hasTension: false,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "G 코드에 B 베이스를 둬 C로 자연스럽게 움직이는 분수코드입니다.",
  } as VoicingSeed),
  v({
    id: "a-over-csharp",
    root: "A",
    qualityId: "slash-acsharp",
    chordName: "A/C#",
    displayName: "A/C# 분수코드",
    startFret: 1,
    frets: ["x", 4, 2, 2, 2, 0],
    fingers: ["x", 3, 1, 1, 1, 0],
    rootStrings: [5],
    barre: { finger: 1, fret: 2, fromString: 4, toString: 2 },
    voicingType: "partial",
    difficulty: "normal",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: ["3 in bass", "1", "5"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: false,
    hasTension: false,
    collisionRisk: "low",
    isRecommendedForBeginner: true,
    description: "A 코드에 C# 베이스를 둔 상승 진행용 분수코드입니다.",
  } as VoicingSeed),
];

const baseVoicings = [...curatedVoicings, ...makeMovableVoicings()];

export const chordVoicings = [...baseVoicings, ...makeFallbackVoicings(baseVoicings)];

export const voicingCount = chordVoicings.length;

export { rootAtString };
