"use client";

import { Headphones, Music, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { useChordStore } from "@/store/chordStore";
import type { UseCase } from "@/types/chord";

const modes: Array<{
  id: UseCase;
  label: string;
  description: string;
  icon: typeof Music;
}> = [
  {
    id: "beginner",
    label: "초보 연습",
    description: "0~5프렛, 약식 우선",
    icon: Music,
  },
  {
    id: "solo",
    label: "혼자 반주",
    description: "루트와 울림 우선",
    icon: Headphones,
  },
  {
    id: "worship",
    label: "찬양팀 합주",
    description: "충돌 적은 핵심음",
    icon: Users,
  },
  {
    id: "advanced",
    label: "고급",
    description: "텐션 정보 자세히",
    icon: Sparkles,
  },
];

export function ModeSelector() {
  const selectedMode = useChordStore((state) => state.selectedMode);
  const setMode = useChordStore((state) => state.setMode);

  return (
    <section aria-labelledby="mode-heading">
      <h2 id="mode-heading" className="text-xs font-semibold uppercase tracking-[0.12em] text-[#f6f0e6]">
        Mode
      </h2>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => setMode(mode.id)}
              className={cn(
                "flex min-h-11 items-center gap-2 rounded-[8px] border px-2 py-2 text-left transition",
                selectedMode === mode.id
                  ? "border-[#5eead4] bg-[#5eead4] text-[#06201c]"
                  : "border-white/10 bg-white/[0.04] text-[#efe8dd] hover:border-[#5eead4]/60 hover:bg-white/[0.07]",
              )}
            >
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-[7px]",
                  selectedMode === mode.id ? "bg-black/10" : "bg-white/[0.06]",
                )}
              >
                <Icon className="size-3.5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold">{mode.label}</span>
                <span className="mt-0.5 hidden text-[10px] opacity-75 sm:block">
                  {mode.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
