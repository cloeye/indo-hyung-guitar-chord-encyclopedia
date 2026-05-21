import { DEFAULT_MAX_FRET } from "@/lib/constants";
import { areEnharmonicRoots } from "@/lib/musicTheory";
import type { ChordRoot, ChordVoicing } from "@/types/chord";

export function filterVoicings(params: {
  root: ChordRoot;
  qualityId: string;
  voicings: ChordVoicing[];
  maxFret?: number;
}) {
  const { root, qualityId, voicings, maxFret = DEFAULT_MAX_FRET } = params;

  return voicings.filter((voicing) => {
    if (voicing.qualityId !== qualityId) {
      return false;
    }

    if (voicing.qualityId.startsWith("slash-")) {
      return voicing.maxFret <= maxFret;
    }

    return areEnharmonicRoots(voicing.root, root) && voicing.maxFret <= maxFret;
  });
}
