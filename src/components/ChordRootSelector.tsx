"use client";

import { pitchClassByRoot } from "@/data/chordRoots";
import { cn } from "@/lib/cn";
import { useChordStore } from "@/store/chordStore";
import type { ChordRoot } from "@/types/chord";

const rootButtons: Array<{
  root: ChordRoot;
  label: string;
}> = [
  { root: "C", label: "C" },
  { root: "C#", label: "C#(Db)" },
  { root: "D", label: "D" },
  { root: "D#", label: "D#(Eb)" },
  { root: "E", label: "E" },
  { root: "F", label: "F" },
  { root: "F#", label: "F#(Gb)" },
  { root: "G", label: "G" },
  { root: "G#", label: "G#(Ab)" },
  { root: "A", label: "A" },
  { root: "A#", label: "A#(Bb)" },
  { root: "B", label: "B" },
];

export function ChordRootSelector() {
  const selectedRoot = useChordStore((state) => state.selectedRoot);
  const setRoot = useChordStore((state) => state.setRoot);

  return (
    <section aria-labelledby="root-heading">
      <div className="flex items-center justify-between gap-2">
        <h2 id="root-heading" className="text-xs font-semibold uppercase tracking-[0.12em] text-[#f8f3e7]">
          Root
        </h2>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1">
        {rootButtons.map(({ root, label }) => {
          const isSelected = pitchClassByRoot[selectedRoot] === pitchClassByRoot[root];

          return (
            <button
              key={root}
              type="button"
              aria-pressed={isSelected}
              title={label}
              onClick={() => setRoot(root)}
              className={cn(
                "relative h-9 min-w-0 overflow-hidden rounded-[7px] border px-1 text-sm font-semibold text-black shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_-2px_3px_rgba(0,0,0,0.2)] transition active:translate-y-px sm:text-base",
                isSelected
                  ? "border-[#f3ff50] bg-[linear-gradient(#f6ff39,#efff51_48%,#cfd34d)]"
                  : "border-[#d7d8b5] bg-[linear-gradient(#f8f8f0,#fbfbfb_47%,#cfd1ac)] hover:border-[#f3ff50]",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
