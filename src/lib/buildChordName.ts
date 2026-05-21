import type { ChordQuality, ChordRoot } from "@/types/chord";

export function buildChordName(root: ChordRoot, quality: ChordQuality): string {
  if (quality.group === "slash") {
    return quality.displayName;
  }

  return `${root}${quality.label}`;
}
