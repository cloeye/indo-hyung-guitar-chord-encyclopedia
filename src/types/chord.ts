export type ChordRoot =
  | "C"
  | "C#"
  | "Db"
  | "D"
  | "D#"
  | "Eb"
  | "E"
  | "F"
  | "F#"
  | "Gb"
  | "G"
  | "G#"
  | "Ab"
  | "A"
  | "A#"
  | "Bb"
  | "B";

export type ChordGroup = "basic" | "playing" | "tension" | "altered" | "slash";

export type QualityTabId = "main" | "altered" | "slash";

export type Difficulty = "easy" | "normal" | "hard" | "expert";

export type VoicingType =
  | "open"
  | "easy"
  | "shell"
  | "partial"
  | "rootless"
  | "barre"
  | "full"
  | "advanced";

export type UseCase = "beginner" | "solo" | "band" | "worship" | "advanced";

export type TabId = "forward" | "reverse" | "memo" | "settings";

export type ChordQuality = {
  id: string;
  label: string;
  displayName: string;
  aliases: string[];
  group: ChordGroup;
  difficulty: Difficulty;
  shortDescription: string;
  isFree: true;
};

export type Barre = {
  finger: number;
  fret: number;
  fromString: number;
  toString: number;
};

export type ChordVoicing = {
  id: string;
  chordName: string;
  displayName: string;

  root: ChordRoot;
  qualityId: string;

  startFret: number;
  maxFret: number;

  frets: Array<number | "x">;
  fingers: Array<number | "x" | 0>;
  rootStrings?: number[];

  barre?: Barre;

  voicingType: VoicingType;
  difficulty: Difficulty;
  useCase: UseCase[];

  includedDegrees: string[];
  omittedDegrees: string[];

  hasRoot: boolean;
  hasThird: boolean;
  hasFifth: boolean;
  hasSeventh: boolean;
  hasTension: boolean;

  collisionRisk: "low" | "medium" | "high";

  isLowPosition: boolean;
  isRecommendedForBeginner: boolean;
  isFree: true;

  description: string;
  caution?: string;
};
