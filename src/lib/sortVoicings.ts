import type { ChordVoicing, UseCase } from "@/types/chord";

export function getVoicingScore(voicing: ChordVoicing, mode: UseCase): number {
  let score = 0;

  if (voicing.useCase.includes(mode)) score += 30;
  if (voicing.isRecommendedForBeginner) score += 20;
  if (voicing.isLowPosition) score += 25;
  if (voicing.maxFret <= 5) score += 20;
  if (voicing.maxFret <= 10) score += 10;

  if (voicing.collisionRisk === "low") score += 15;
  if (voicing.collisionRisk === "medium") score += 5;
  if (voicing.collisionRisk === "high") score -= 20;

  if (voicing.voicingType === "open") score += 10;
  if (voicing.voicingType === "easy") score += 10;
  if (voicing.voicingType === "shell") score += 8;
  if (voicing.voicingType === "partial") score += 5;
  if (voicing.voicingType === "rootless" && (mode === "band" || mode === "worship")) {
    score += 10;
  }

  if (voicing.voicingType === "barre" && mode === "beginner") score -= 14;
  if (voicing.voicingType === "advanced" && mode !== "advanced") score -= 20;

  if (mode === "solo" && voicing.hasRoot) score += 15;
  if ((mode === "band" || mode === "worship") && voicing.collisionRisk === "low") score += 10;
  if (mode === "advanced" && voicing.hasTension) score += 12;

  return score;
}

export function sortVoicings(voicings: ChordVoicing[], mode: UseCase): ChordVoicing[] {
  return [...voicings].sort((a, b) => {
    return getVoicingScore(b, mode) - getVoicingScore(a, mode);
  });
}
