import { pitchClassByRoot } from "@/data/chordRoots";
import type { ChordRoot } from "@/types/chord";

export function getPitchClass(root: ChordRoot): number {
  return pitchClassByRoot[root];
}

export function areEnharmonicRoots(a: ChordRoot, b: ChordRoot): boolean {
  return getPitchClass(a) === getPitchClass(b);
}

export function getRootForDisplay(root: ChordRoot, chordName: string): string {
  if (chordName.includes("/")) {
    return chordName;
  }

  return chordName.replace(/^[A-G](#|b)?/, root);
}
