"use client";

import { BookOpen, Compass, Guitar, RotateCcw, Settings } from "lucide-react";
import { cn } from "@/lib/cn";
import { useChordStore } from "@/store/chordStore";
import type { TabId } from "@/types/chord";

const tabs: Array<{ id: TabId; label: string; icon: typeof Compass }> = [
  { id: "forward", label: "Forward", icon: Compass },
  { id: "reverse", label: "Reverse", icon: RotateCcw },
  { id: "open", label: "Open", icon: Guitar },
  { id: "memo", label: "Memo", icon: BookOpen },
  { id: "settings", label: "Setting", icon: Settings },
];

export function BottomTabs() {
  const activeTab = useChordStore((state) => state.activeTab);
  const setActiveTab = useChordStore((state) => state.setActiveTab);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0e1514]/95 px-3 py-2 backdrop-blur md:sticky md:bottom-auto md:top-0 md:rounded-[8px] md:border"
    >
      <div className="mx-auto grid max-w-4xl grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex h-12 flex-col items-center justify-center gap-1 rounded-[8px] text-[11px] font-semibold transition",
                activeTab === tab.id
                  ? "bg-[#5eead4] text-[#06201c]"
                  : "text-[#9fb6ad] hover:bg-white/[0.06] hover:text-[#f6f0e6]",
              )}
            >
              <Icon className="size-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
