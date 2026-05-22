"use client";

import { useState } from "react";
import { AlertTriangle, Star, Volume2 } from "lucide-react";
import { ChordDiagram } from "@/components/ChordDiagram";
import { DIFFICULTY_LABELS, VOICING_TYPE_LABELS } from "@/lib/constants";
import { playChordVoicing } from "@/lib/chordAudio";
import { cn } from "@/lib/cn";
import { useChordStore } from "@/store/chordStore";
import type { ChordVoicing } from "@/types/chord";

type VoicingCardProps = {
  voicing: ChordVoicing;
  index: number;
};

export function VoicingCard({ voicing, index }: VoicingCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const isLeftHanded = useChordStore((state) => state.isLeftHanded);
  const favorites = useChordStore((state) => state.favorites);
  const toggleFavoriteVoicing = useChordStore((state) => state.toggleFavoriteVoicing);
  const isFavorite = favorites.includes(voicing.chordName);

  async function handlePlay() {
    setIsPlaying(true);

    try {
      await playChordVoicing(voicing);
      window.setTimeout(() => setIsPlaying(false), 900);
    } catch {
      setIsPlaying(false);
    }
  }

  return (
    <article
      title={[voicing.description, voicing.caution].filter(Boolean).join("\n")}
      className={cn(
        "min-w-0 rounded-[8px] border bg-[#17201e] p-1.5 shadow-xl shadow-black/20",
        index === 0 ? "border-[#5eead4]/80" : "border-white/10",
      )}
    >
      <div className="mb-1.5 flex items-center justify-between gap-1.5">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-[#f6f0e6]">{voicing.chordName}</p>
          <p className="truncate text-[10px] font-medium leading-3 text-[#a6a6a0]">
            {DIFFICULTY_LABELS[voicing.difficulty]} · {VOICING_TYPE_LABELS[voicing.voicingType]}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {voicing.caution ? (
            <AlertTriangle className="size-3.5 text-[#ff8a65]" aria-label="주의" />
          ) : null}
          <button
            type="button"
            onClick={handlePlay}
            aria-label={`${voicing.chordName} 소리 듣기`}
            title={`${voicing.chordName} 소리 듣기`}
            className={cn(
              "grid size-7 place-items-center rounded-[7px] border transition",
              isPlaying
                ? "border-[#5eead4] bg-[#5eead4] text-[#06201c]"
                : "border-white/10 bg-white/[0.06] text-[#efe8dd] hover:border-[#5eead4]/60",
            )}
          >
            <Volume2 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => toggleFavoriteVoicing(voicing)}
            aria-label={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
            title={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
            className={cn(
              "grid size-7 place-items-center rounded-[7px] border transition",
              isFavorite
                ? "border-[#ff8a65]/80 bg-[#ff8a65] text-[#24100a]"
                : "border-white/10 bg-white/[0.06] text-[#efe8dd] hover:border-[#ff8a65]/60",
            )}
          >
            <Star className={cn("size-3.5", isFavorite && "fill-current")} />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handlePlay}
        aria-label={`${voicing.displayName} 운지표 듣기`}
        title="운지표를 누르면 소리가 납니다"
        className="group block w-full rounded-[8px] text-left outline-none transition focus-visible:ring-2 focus-visible:ring-[#5eead4]"
      >
        <ChordDiagram
          voicing={voicing}
          isLeftHanded={isLeftHanded}
          size="compact"
          className={cn(
            "transition group-active:scale-[0.985]",
            isPlaying && "shadow-[0_0_0_2px_rgba(94,234,212,0.85)]",
          )}
        />
      </button>
    </article>
  );
}
