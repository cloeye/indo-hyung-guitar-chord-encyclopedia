"use client";

import {
  getQualitiesForTab,
  normalizeQualityTabId,
  qualityTabLabels,
  qualityTabs,
} from "@/data/chordQualities";
import { cn } from "@/lib/cn";
import { useChordStore } from "@/store/chordStore";
import type { QualityTabId } from "@/types/chord";

function difficultyLabel(difficulty: string) {
  if (difficulty === "easy") return "쉬움";
  if (difficulty === "normal") return "보통";
  if (difficulty === "hard") return "어려움";
  return "고급";
}

export function ChordQualitySelector() {
  const selectedGroup = useChordStore((state) => state.selectedGroup);
  const selectedQualityId = useChordStore((state) => state.selectedQualityId);
  const setGroup = useChordStore((state) => state.setGroup);
  const setQualityId = useChordStore((state) => state.setQualityId);

  const activeTab = normalizeQualityTabId(selectedGroup);
  const visibleQualities = getQualitiesForTab(activeTab);

  function selectTab(tab: QualityTabId) {
    setGroup(tab);

    if (!getQualitiesForTab(tab).some((quality) => quality.id === selectedQualityId)) {
      setQualityId(getQualitiesForTab(tab)[0]?.id ?? selectedQualityId);
    }
  }

  return (
    <section aria-labelledby="quality-heading">
      <div className="flex items-center justify-between gap-2">
        <h2 id="quality-heading" className="text-xs font-semibold uppercase tracking-[0.12em] text-[#f8f3e7]">
          Quality
        </h2>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-1 rounded-[8px] border border-white/10 bg-black/25 p-1">
        {qualityTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => selectTab(tab)}
            className={cn(
              "h-8 rounded-[6px] px-1 text-[10px] font-semibold transition",
              activeTab === tab
                ? "bg-[#8a8a86] text-white"
                : "text-[#b8aa8e] hover:bg-white/[0.06] hover:text-[#f8f3e7]",
            )}
          >
            {qualityTabLabels[tab]}
          </button>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-2 gap-1">
        {visibleQualities.map((quality) => (
          <button
            key={quality.id}
            type="button"
            onClick={() => setQualityId(quality.id)}
            title={quality.shortDescription}
            className={cn(
              "relative h-10 min-w-0 overflow-hidden rounded-[7px] border px-1 text-center text-black shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_-2px_3px_rgba(0,0,0,0.2)] transition active:translate-y-px",
              selectedQualityId === quality.id
                ? "border-[#f3ff50] bg-[linear-gradient(#f6ff39,#efff51_48%,#cfd34d)]"
                : "border-[#d7d8b5] bg-[linear-gradient(#f8f8f0,#fbfbfb_47%,#cfd1ac)] hover:border-[#f3ff50]",
            )}
          >
            <span className="block truncate text-sm font-semibold leading-4">
              {quality.displayName}
            </span>
            <span className="mt-0.5 block truncate text-[9px] font-semibold leading-3 text-black/45">
              {difficultyLabel(quality.difficulty)}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
