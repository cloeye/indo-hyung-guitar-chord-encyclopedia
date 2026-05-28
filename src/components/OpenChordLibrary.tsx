"use client";

import { useMemo, useState } from "react";
import { ListMusic, Music2, Sparkles } from "lucide-react";
import { VoicingCard } from "@/components/VoicingCard";
import {
  openChordAdvancedCount,
  openChordCollections,
  openChordCount,
  type OpenChordCollectionId,
} from "@/data/openChordCollections";
import { cn } from "@/lib/cn";

type ActiveOpenChordFilter = "all" | OpenChordCollectionId;

const keyFilters: Array<{ id: ActiveOpenChordFilter; label: string }> = [
  { id: "all", label: "전체" },
  { id: "G", label: "G key" },
  { id: "D", label: "D key" },
  { id: "E", label: "E key" },
  { id: "A", label: "A key" },
  { id: "C", label: "C key" },
];

export function OpenChordLibrary() {
  const [activeFilter, setActiveFilter] = useState<ActiveOpenChordFilter>("all");
  const [showAdvancedOpenChords, setShowAdvancedOpenChords] = useState(false);
  const visibleCollections = useMemo(() => {
    if (activeFilter === "all") {
      return openChordCollections;
    }

    return openChordCollections.filter((collection) => collection.id === activeFilter);
  }, [activeFilter]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <section className="border-b border-white/10 pb-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-[#5eead4] text-[#06201c]">
                <Music2 className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff8a65]">
                  Open Chord
                </p>
                <h2 className="mt-0.5 text-balance text-2xl font-semibold text-[#f6f0e6]">
                  모던워십 오픈코드 모음
                </h2>
              </div>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#d8d0c0]">
              기본 개방현 코드는 그대로 두고, 고급 옵션을 켜면 교회에서 흔히 말하는
              모던워십 텐션 오픈코드를 함께 볼 수 있습니다.
            </p>
          </div>

          <div className="grid shrink-0 grid-cols-4 gap-1.5 text-center">
            <div className="rounded-[7px] bg-white/[0.06] px-2 py-1.5">
              <p className="text-[10px] font-semibold text-[#92a49b]">Key</p>
              <p className="text-sm font-semibold">{openChordCollections.length}</p>
            </div>
            <div className="rounded-[7px] bg-white/[0.06] px-2 py-1.5">
              <p className="text-[10px] font-semibold text-[#92a49b]">Basic</p>
              <p className="text-sm font-semibold">{openChordCount}</p>
            </div>
            <div className="rounded-[7px] bg-white/[0.06] px-2 py-1.5">
              <p className="text-[10px] font-semibold text-[#92a49b]">Tension</p>
              <p className="text-sm font-semibold">{openChordAdvancedCount}</p>
            </div>
            <div className="rounded-[7px] bg-white/[0.06] px-2 py-1.5">
              <p className="text-[10px] font-semibold text-[#92a49b]">Mode</p>
              <p className="text-sm font-semibold">
                {showAdvancedOpenChords ? "Adv" : "Basic"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 xl:flex-row">
          <div className="grid flex-1 grid-cols-3 gap-1.5 sm:grid-cols-6">
            {keyFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "h-10 rounded-[8px] border px-2 text-sm font-semibold transition",
                  activeFilter === filter.id
                    ? "border-[#5eead4] bg-[#5eead4] text-[#06201c]"
                    : "border-white/10 bg-white/[0.04] text-[#d8d0c0] hover:border-[#5eead4]/60 hover:text-[#f6f0e6]",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowAdvancedOpenChords((value) => !value)}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 rounded-[8px] border px-3 text-sm font-semibold transition xl:min-w-[164px]",
              showAdvancedOpenChords
                ? "border-[#ff8a65] bg-[#ff8a65] text-[#24100a]"
                : "border-[#ff8a65]/45 bg-[#ff8a65]/10 text-[#ffb199] hover:border-[#ff8a65]/80",
            )}
            aria-pressed={showAdvancedOpenChords}
          >
            <Sparkles className="size-4" />
            <span>{showAdvancedOpenChords ? "텐션 오픈 켜짐" : "텐션 오픈"}</span>
          </button>
        </div>
      </section>

      <div className="space-y-6">
        {visibleCollections.map((collection) => (
          <section key={collection.id} aria-labelledby={`open-${collection.id}-title`}>
            <div className="mb-2 flex flex-col gap-2 border-b border-white/10 pb-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-[#ff8a65] text-sm font-bold text-[#24100a]">
                    {collection.id}
                  </span>
                  <h3
                    id={`open-${collection.id}-title`}
                    className="text-xl font-semibold text-[#f6f0e6]"
                  >
                    {collection.title}
                  </h3>
                </div>
                <p className="mt-1 text-sm leading-5 text-[#aeb8ad]">{collection.subtitle}</p>
              </div>
              <div className="inline-flex min-h-9 max-w-full items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.04] px-2.5 text-sm font-semibold text-[#efe8dd]">
                <ListMusic className="size-4 shrink-0 text-[#5eead4]" />
                <span className="truncate">{collection.progression}</span>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {collection.voicings.map((voicing, index) => (
                <VoicingCard
                  key={`${collection.id}-${voicing.id}`}
                  voicing={voicing}
                  index={index}
                />
              ))}
            </div>

            {showAdvancedOpenChords ? (
              <div className="mt-4 border-t border-[#ff8a65]/25 pt-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 shrink-0 text-[#ff8a65]" />
                      <h4 className="text-base font-semibold text-[#f6f0e6]">
                        텐션 오픈코드
                      </h4>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-[#aeb8ad]">
                      개방현을 최대한 살리면서 9, 11, 13 계열 텐션을 더한 모던워십 폼입니다.
                    </p>
                  </div>
                  <span className="rounded-[6px] bg-[#ff8a65]/15 px-2 py-0.5 text-xs font-semibold text-[#ffb199]">
                    {collection.advancedVoicings.length}
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {collection.advancedVoicings.map((voicing, index) => (
                    <VoicingCard
                      key={`${collection.id}-advanced-${voicing.id}`}
                      voicing={voicing}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
