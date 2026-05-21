"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  BookOpen,
  ChevronRight,
  RotateCcw,
  Search,
  Settings2,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { BottomTabs } from "@/components/BottomTabs";
import { ChordQualitySelector } from "@/components/ChordQualitySelector";
import { ChordRootSelector } from "@/components/ChordRootSelector";
import { VoicingCard } from "@/components/VoicingCard";
import { chordQualities, getQualityTab } from "@/data/chordQualities";
import { chordRoots } from "@/data/chordRoots";
import { chordVoicings, voicingCount } from "@/data/chordVoicings";
import { buildChordName } from "@/lib/buildChordName";
import { ADVANCED_MAX_FRET, DEFAULT_MAX_FRET } from "@/lib/constants";
import { filterVoicings } from "@/lib/filterVoicings";
import { sortVoicings } from "@/lib/sortVoicings";
import { useChordStore } from "@/store/chordStore";
import type { ChordQuality, ChordRoot, ChordVoicing } from "@/types/chord";

function ToggleRow({
  label,
  value,
  onClick,
  icon: Icon,
}: {
  label: string;
  value: boolean;
  onClick: () => void;
  icon: typeof Settings2;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-14 w-full items-center justify-between gap-4 rounded-[8px] border border-white/10 bg-white/[0.04] p-3 text-left transition hover:border-[#f7c36c]/50"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-[8px] bg-white/[0.06] text-[#e6d7b7]">
          <Icon className="size-4" />
        </span>
        <span className="text-sm font-semibold text-[#f8f3e7]">{label}</span>
      </span>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full border transition ${
          value ? "border-[#8fc8b6] bg-[#8fc8b6]" : "border-white/10 bg-black/30"
        }`}
        aria-hidden="true"
      >
        <span
          className={`absolute top-1 size-5 rounded-full bg-white transition ${
            value ? "left-6" : "left-1"
          }`}
        />
      </span>
    </button>
  );
}

function findQuality(qualityId: string) {
  return chordQualities.find((quality) => quality.id === qualityId) ?? chordQualities[0];
}

type VoicingSectionId = "easy" | "normal" | "advanced";

const voicingSections: Array<{
  id: VoicingSectionId;
  title: string;
  description: string;
}> = [
  {
    id: "easy",
    title: "쉬운 운지",
    description: "오픈 코드, 약식 운지, 5프렛 이하 초보 추천",
  },
  {
    id: "normal",
    title: "일반 운지",
    description: "실전에서 자주 쓰는 바레와 로우 포지션",
  },
  {
    id: "advanced",
    title: "고급 운지",
    description: "텐션, expert 성격, 높은 프렛 포지션 포함",
  },
];

function getVoicingSectionId(voicing: ChordVoicing): VoicingSectionId {
  if (
    voicing.maxFret > DEFAULT_MAX_FRET ||
    voicing.difficulty === "expert" ||
    voicing.voicingType === "advanced"
  ) {
    return "advanced";
  }

  if (
    voicing.isRecommendedForBeginner ||
    (voicing.maxFret <= 5 &&
      (voicing.difficulty === "easy" ||
        voicing.voicingType === "open" ||
        voicing.voicingType === "partial" ||
        voicing.voicingType === "easy"))
  ) {
    return "easy";
  }

  return "normal";
}

function groupVoicingsBySection(voicings: ChordVoicing[]) {
  const grouped: Record<VoicingSectionId, ChordVoicing[]> = {
    easy: [],
    normal: [],
    advanced: [],
  };

  voicings.forEach((voicing) => {
    grouped[getVoicingSectionId(voicing)].push(voicing);
  });

  return grouped;
}

function normalizeChordInput(value: string) {
  const compactValue = value.trim().replace(/\s+/g, "");
  const rootMatch = compactValue.match(/^[a-gA-G](#|b)?/);

  if (!rootMatch) {
    return compactValue;
  }

  const rawRoot = rootMatch[0];
  const normalizedRoot = `${rawRoot.charAt(0).toUpperCase()}${rawRoot.slice(1)}`;

  return `${normalizedRoot}${compactValue.slice(rawRoot.length)}`;
}

function findSelectionFromChordName(chordName: string):
  | {
      root: ChordRoot;
      quality: ChordQuality;
    }
  | undefined {
  const normalizedChordName = normalizeChordInput(chordName);
  const lowerChordName = normalizedChordName.toLowerCase();
  const slashQuality = chordQualities.find(
    (quality) =>
      quality.group === "slash" &&
      (quality.displayName.toLowerCase() === lowerChordName ||
        quality.aliases.some((alias) => alias.toLowerCase() === lowerChordName)),
  );

  if (slashQuality) {
    const root = slashQuality.displayName.match(/^[A-G](#|b)?/)?.[0] as ChordRoot | undefined;
    return { root: root ?? "C", quality: slashQuality };
  }

  const root = [...chordRoots]
    .sort((a, b) => b.length - a.length)
    .find((candidate) => normalizedChordName.startsWith(candidate));

  if (!root) {
    return undefined;
  }

  const suffix = normalizedChordName.slice(root.length);
  const lowerSuffix = suffix.toLowerCase();
  const quality = chordQualities.find(
    (candidate) =>
      candidate.group !== "slash" &&
      (candidate.label === suffix ||
        candidate.label.toLowerCase() === lowerSuffix ||
        candidate.displayName === suffix ||
        candidate.displayName.toLowerCase() === lowerSuffix ||
        candidate.aliases.some((alias) => alias.toLowerCase() === lowerSuffix)),
  );

  if (!quality) {
    return undefined;
  }

  return { root, quality };
}

function buildGoogleImageSearchUrl(chordName: string) {
  const params = new URLSearchParams({
    igu: "1",
    q: `${chordName} guitar chord fingering`,
    tbm: "isch",
  });

  return `https://www.google.com/search?${params.toString()}`;
}

function GoogleImageSearchEmbed({
  chordName,
  url,
}: {
  chordName: string;
  url: string;
}) {
  return (
    <div className="overflow-hidden rounded-[8px] border border-white/10 bg-[#10100f]">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-white/[0.04] px-3 py-2">
        <p className="min-w-0 truncate text-sm font-semibold text-[#f8f3e7]">
          {chordName} 이미지 검색
        </p>
        <a
          href={url}
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-[7px] border border-white/10 bg-white/[0.06] px-2 text-xs font-semibold text-[#e6d7b7] transition hover:border-[#eef20c]/60"
        >
          현재 탭
          <ChevronRight className="size-3.5" />
        </a>
      </div>
      <iframe
        title={`${chordName} 구글 이미지 검색 결과`}
        src={url}
        className="h-[560px] w-full bg-white"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

export function ChordFinderApp() {
  const [directInput, setDirectInput] = useState("");
  const [directInputError, setDirectInputError] = useState("");
  const [imageSearchChordName, setImageSearchChordName] = useState<string | undefined>();
  const selectedRoot = useChordStore((state) => state.selectedRoot);
  const selectedQualityId = useChordStore((state) => state.selectedQualityId);
  const activeTab = useChordStore((state) => state.activeTab);
  const favorites = useChordStore((state) => state.favorites);
  const recent = useChordStore((state) => state.recent);
  const isLeftHanded = useChordStore((state) => state.isLeftHanded);
  const setRoot = useChordStore((state) => state.setRoot);
  const setQualityId = useChordStore((state) => state.setQualityId);
  const setGroup = useChordStore((state) => state.setGroup);
  const setActiveTab = useChordStore((state) => state.setActiveTab);
  const toggleLeftHanded = useChordStore((state) => state.toggleLeftHanded);
  const addRecent = useChordStore((state) => state.addRecent);

  const selectedQuality = findQuality(selectedQualityId);
  const chordName = buildChordName(selectedRoot, selectedQuality);
  const googleImageSearchUrl = buildGoogleImageSearchUrl(chordName);
  const showImageSearch = imageSearchChordName === chordName;

  const voicings = useMemo(() => {
    const filteredVoicings = filterVoicings({
      root: selectedRoot,
      qualityId: selectedQualityId,
      voicings: chordVoicings,
      maxFret: ADVANCED_MAX_FRET,
    });

    return [
      ...sortVoicings(
        filteredVoicings.filter((voicing) => getVoicingSectionId(voicing) === "easy"),
        "beginner",
      ),
      ...sortVoicings(
        filteredVoicings.filter((voicing) => getVoicingSectionId(voicing) === "normal"),
        "solo",
      ),
      ...sortVoicings(
        filteredVoicings.filter((voicing) => getVoicingSectionId(voicing) === "advanced"),
        "advanced",
      ),
    ];
  }, [selectedQualityId, selectedRoot]);

  const groupedVoicings = useMemo(() => groupVoicingsBySection(voicings), [voicings]);

  useEffect(() => {
    addRecent(chordName);
  }, [addRecent, chordName]);

  function selectChordName(targetChordName: string) {
    const selection = findSelectionFromChordName(targetChordName);

    if (!selection) {
      return;
    }

    setRoot(selection.root);
    setQualityId(selection.quality.id);
    setGroup(getQualityTab(selection.quality));
    setActiveTab("forward");
  }

  function handleDirectSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const submittedInput = String(formData.get("directChord") ?? directInput);
    const normalizedInput = normalizeChordInput(submittedInput);
    const selection = findSelectionFromChordName(normalizedInput);

    if (!selection) {
      setDirectInputError("코드명을 확인해 주세요. 예: Cadd9, D/F#, A7b9");
      return;
    }

    setDirectInput(normalizedInput);
    setDirectInputError("");
    setRoot(selection.root);
    setQualityId(selection.quality.id);
    setGroup(getQualityTab(selection.quality));
    setActiveTab("forward");
  }

  return (
    <div className="min-h-screen bg-[#151615] text-[#f8f3e7]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1380px] flex-col px-3 pb-24 pt-3 sm:px-5 lg:px-6">
        <header className="overflow-hidden rounded-[8px] border border-white/10 bg-[#191a18] shadow-xl shadow-black/20">
          <div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid size-16 shrink-0 place-items-center rounded-[8px] border border-[#eef20c]/50 bg-[#f8f3e7] p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.16),0_10px_24px_rgba(0,0,0,0.28)]">
                <Image
                  src="/indo-hyung-icon.jpeg"
                  alt="인도형 아이콘"
                  width={56}
                  height={56}
                  priority
                  className="size-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8fc8b6]">
                  Praise Guitar Chords
                </p>
                <h1 className="mt-0.5 text-balance text-xl font-semibold tracking-normal text-[#f8f3e7] sm:text-2xl">
                  인도형의 찬양 기타코드 대백과
                  <span className="ml-1 whitespace-nowrap text-sm font-medium text-[#b9b29f]">
                    (by 전도사닷컴)
                  </span>
                </h1>
                <div className="mt-1.5 inline-flex max-w-full items-center gap-2 rounded-[7px] border border-white/10 bg-white/[0.05] px-2.5 py-1">
                  <span className="shrink-0 text-[10px] font-semibold text-[#a99a7a]">
                    현재 코드
                  </span>
                  <strong className="truncate text-2xl font-semibold leading-none text-[#eef20c]">
                    {chordName}
                  </strong>
                </div>
              </div>
            </div>
            <div className="grid shrink-0 grid-cols-3 gap-1.5 text-center sm:gap-2">
              <div className="rounded-[7px] bg-white/[0.06] px-2 py-1.5">
                <p className="text-[10px] font-semibold text-[#a99a7a]">폼</p>
                <p className="text-sm font-semibold">{voicings.length}</p>
              </div>
              <div className="rounded-[7px] bg-white/[0.06] px-2 py-1.5">
                <p className="text-[10px] font-semibold text-[#a99a7a]">무료</p>
                <p className="text-sm font-semibold">{voicingCount}</p>
              </div>
              <div className="rounded-[7px] bg-white/[0.06] px-2 py-1.5">
                <p className="text-[10px] font-semibold text-[#a99a7a]">프렛</p>
                <p className="text-sm font-semibold">{ADVANCED_MAX_FRET}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="mt-3">
          <BottomTabs />
        </div>

        {activeTab === "forward" ? (
          <main className="mt-4 grid flex-1 grid-cols-[minmax(176px,43%)_minmax(0,57%)] gap-3 lg:grid-cols-[420px_minmax(0,1fr)]">
            <aside className="h-fit rounded-[8px] border border-white/10 bg-[#111210] p-2 shadow-xl shadow-black/20 lg:sticky lg:top-4">
              <form
                onSubmit={handleDirectSubmit}
                className="mb-2 rounded-[8px] border border-white/10 bg-black/25 p-2"
              >
                <label
                  htmlFor="direct-chord-input"
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-[#f8f3e7]"
                >
                  Direct
                </label>
                <div className="mt-2 flex gap-1.5">
                  <input
                    id="direct-chord-input"
                    name="directChord"
                    value={directInput}
                    onChange={(event) => {
                      setDirectInput(event.target.value);
                      setDirectInputError("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        event.currentTarget.form?.requestSubmit();
                      }
                    }}
                    placeholder="Cadd9"
                    className="min-w-0 flex-1 rounded-[7px] border border-white/10 bg-white/[0.06] px-2 text-[16px] font-semibold text-[#f8f3e7] outline-none transition placeholder:text-[#8b8069] focus:border-[#eef20c]/70"
                  />
                  <button
                    type="submit"
                    aria-label="입력한 코드 보기"
                    title="입력한 코드 보기"
                    className="grid size-10 shrink-0 place-items-center rounded-[7px] border border-[#eef20c]/60 bg-[#eef20c] text-[#17120d] transition hover:bg-[#f6ff39]"
                  >
                    <Search className="size-4" />
                  </button>
                </div>
                {directInputError ? (
                  <p className="mt-2 text-xs leading-5 text-[#f7c36c]">{directInputError}</p>
                ) : null}
              </form>
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                <ChordRootSelector />
                <ChordQualitySelector />
              </div>
            </aside>

            <section className="min-w-0">
              <div className="mb-2 text-center">
                <p className="text-2xl font-semibold text-[#f8f3e7]">{chordName}</p>
                <div className="mt-1.5 rounded-[8px] border border-white/30 bg-[#858582] py-0.5 text-base font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                  Finger
                </div>
                <p className="mt-1 text-xs leading-4 text-[#b9b29f]">
                  운지표를 누르면 소리가 납니다.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setImageSearchChordName((value) => (value === chordName ? undefined : chordName))
                  }
                  className="mt-1.5 inline-flex h-8 items-center gap-2 rounded-[7px] border border-white/10 bg-white/[0.06] px-2.5 text-xs font-semibold text-[#e6d7b7] transition hover:border-[#eef20c]/60"
                >
                  <Search className="size-3.5" />
                  이미지 검색
                </button>
              </div>

              {voicings.length > 0 ? (
                <div className="space-y-3">
                  {showImageSearch ? (
                    <GoogleImageSearchEmbed chordName={chordName} url={googleImageSearchUrl} />
                  ) : null}
                  {voicingSections.map((section) => {
                    const sectionVoicings = groupedVoicings[section.id];

                    if (sectionVoicings.length === 0) {
                      return null;
                    }

                    return (
                      <section key={section.id} aria-labelledby={`${section.id}-voicings`}>
                        <div className="mb-1.5 flex items-center justify-between gap-2 border-b border-white/10 pb-1.5">
                          <div className="min-w-0">
                            <h2
                              id={`${section.id}-voicings`}
                              className="text-base font-semibold text-[#f8f3e7]"
                            >
                              {section.title}
                            </h2>
                            <p className="hidden text-[11px] leading-4 text-[#a7a28f] sm:block">
                              {section.description}
                            </p>
                          </div>
                          <span className="rounded-[6px] bg-white/[0.06] px-2 py-0.5 text-xs font-semibold text-[#e6d7b7]">
                            {sectionVoicings.length}
                          </span>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                          {sectionVoicings.map((voicing, index) => (
                            <VoicingCard key={voicing.id} voicing={voicing} index={index} />
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[8px] border border-white/10 bg-[#181817] p-5">
                  <div className="grid size-11 place-items-center rounded-[8px] bg-white/[0.06] text-[#eef20c]">
                    <Search className="size-5" />
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-[#f8f3e7]">
                    {chordName} 운지를 바로 찾아볼 수 있습니다
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#d8ccb2]">
                    앱에 저장된 대표 운지가 없을 때는 아래 검색 결과에서 다른 포지션을
                    확인하세요.
                  </p>
                  <div className="mt-4">
                    <GoogleImageSearchEmbed chordName={chordName} url={googleImageSearchUrl} />
                  </div>
                </div>
              )}
            </section>
          </main>
        ) : (
          <main className="mt-5 flex-1">
            {activeTab === "reverse" ? (
              <div className="rounded-[8px] border border-white/10 bg-[#181817] p-6">
                <div className="grid size-12 place-items-center rounded-[8px] bg-white/[0.06] text-[#8fc8b6]">
                  <RotateCcw className="size-5" />
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-[#f8f3e7]">Reverse</h2>
                <p className="mt-2 text-sm leading-6 text-[#d8ccb2]">
                  직접 누른 운지로 코드명을 찾는 기능은 준비 중입니다.
                </p>
                <div className="mt-5 grid grid-cols-6 gap-2">
                  {["E", "A", "D", "G", "B", "E"].map((stringName, index) => (
                    <button
                      key={`${stringName}-${index}`}
                      type="button"
                      disabled
                      className="h-16 rounded-[8px] border border-dashed border-white/10 bg-white/[0.03] text-sm font-semibold text-[#8b8069]"
                    >
                      {stringName}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {activeTab === "memo" ? (
              <div className="grid gap-4 xl:grid-cols-2">
                <section className="rounded-[8px] border border-white/10 bg-[#181817] p-5">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-[8px] bg-[#eef20c] text-[#17120d]">
                      <Star className="size-5" />
                    </div>
                    <h2 className="text-xl font-semibold text-[#f8f3e7]">즐겨찾기</h2>
                  </div>
                  <div className="mt-4 grid gap-2">
                    {favorites.length > 0 ? (
                      favorites.map((favorite) => (
                        <button
                          key={favorite}
                          type="button"
                          onClick={() => selectChordName(favorite)}
                          className="flex h-12 items-center justify-between rounded-[8px] border border-white/10 bg-white/[0.04] px-3 text-left font-semibold text-[#f8f3e7] transition hover:border-[#eef20c]/50"
                        >
                          {favorite}
                          <ChevronRight className="size-4 text-[#a99a7a]" />
                        </button>
                      ))
                    ) : (
                      <p className="rounded-[8px] bg-white/[0.04] p-3 text-sm text-[#d8ccb2]">
                        아직 저장된 코드가 없습니다.
                      </p>
                    )}
                  </div>
                </section>

                <section className="rounded-[8px] border border-white/10 bg-[#181817] p-5">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-[8px] bg-[#8fc8b6] text-[#101817]">
                      <BookOpen className="size-5" />
                    </div>
                    <h2 className="text-xl font-semibold text-[#f8f3e7]">최근 본 코드</h2>
                  </div>
                  <div className="mt-4 grid gap-2">
                    {recent.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => selectChordName(item)}
                        className="flex h-12 items-center justify-between rounded-[8px] border border-white/10 bg-white/[0.04] px-3 text-left font-semibold text-[#f8f3e7] transition hover:border-[#8fc8b6]/50"
                      >
                        {item}
                        <ChevronRight className="size-4 text-[#a99a7a]" />
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            ) : null}

            {activeTab === "settings" ? (
              <div className="rounded-[8px] border border-white/10 bg-[#181817] p-5">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-[8px] bg-white/[0.06] text-[#eef20c]">
                    <Settings2 className="size-5" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#f8f3e7]">Setting</h2>
                </div>
                <div className="mt-5 grid gap-3">
                  <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-sm font-semibold text-[#f8f3e7]">손가락 번호 표시</p>
                    <p className="mt-1 text-xs leading-5 text-[#b9b29f]">
                      운지표에는 항상 손가락 번호가 표시됩니다.
                    </p>
                  </div>
                  <ToggleRow
                    label="왼손잡이 모드"
                    value={isLeftHanded}
                    onClick={toggleLeftHanded}
                    icon={SlidersHorizontal}
                  />
                  <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-sm font-semibold text-[#f8f3e7]">고급 운지</p>
                    <p className="mt-1 text-xs leading-5 text-[#b9b29f]">
                      10프렛 초과 포지션은 결과 화면의 고급 운지 섹션에 항상 표시됩니다.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </main>
        )}
      </div>
    </div>
  );
}
