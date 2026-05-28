"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  BookOpen,
  ChevronRight,
  Search,
  Settings2,
  SlidersHorizontal,
  Star,
  Trash2,
} from "lucide-react";
import { BottomTabs } from "@/components/BottomTabs";
import { ChordDiagram } from "@/components/ChordDiagram";
import { ChordQualitySelector } from "@/components/ChordQualitySelector";
import { ChordRootSelector } from "@/components/ChordRootSelector";
import { OpenChordLibrary } from "@/components/OpenChordLibrary";
import { ReverseChordFinder } from "@/components/ReverseChordFinder";
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
      className="flex min-h-14 w-full items-center justify-between gap-4 rounded-[8px] border border-white/10 bg-white/[0.04] p-3 text-left transition hover:border-[#5eead4]/50"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-[8px] bg-white/[0.06] text-[#efe8dd]">
          <Icon className="size-4" />
        </span>
        <span className="text-sm font-semibold text-[#f6f0e6]">{label}</span>
      </span>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full border transition ${
          value ? "border-[#5eead4] bg-[#5eead4]" : "border-white/10 bg-black/30"
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
    <div className="overflow-hidden rounded-[8px] border border-white/10 bg-[#111817]">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-white/[0.04] px-3 py-2">
        <p className="min-w-0 truncate text-sm font-semibold text-[#f6f0e6]">
          {chordName} 이미지 검색
        </p>
        <a
          href={url}
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-[7px] border border-white/10 bg-white/[0.06] px-2 text-xs font-semibold text-[#efe8dd] transition hover:border-[#5eead4]/60"
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
  const [selectedMemoFavorite, setSelectedMemoFavorite] = useState<string | undefined>();
  const selectedRoot = useChordStore((state) => state.selectedRoot);
  const selectedQualityId = useChordStore((state) => state.selectedQualityId);
  const activeTab = useChordStore((state) => state.activeTab);
  const favorites = useChordStore((state) => state.favorites);
  const favoriteVoicings = useChordStore((state) => state.favoriteVoicings);
  const recent = useChordStore((state) => state.recent);
  const isLeftHanded = useChordStore((state) => state.isLeftHanded);
  const setRoot = useChordStore((state) => state.setRoot);
  const setQualityId = useChordStore((state) => state.setQualityId);
  const setGroup = useChordStore((state) => state.setGroup);
  const setActiveTab = useChordStore((state) => state.setActiveTab);
  const toggleLeftHanded = useChordStore((state) => state.toggleLeftHanded);
  const toggleFavorite = useChordStore((state) => state.toggleFavorite);
  const addRecent = useChordStore((state) => state.addRecent);

  const selectedQuality = findQuality(selectedQualityId);
  const chordName = buildChordName(selectedRoot, selectedQuality);
  const googleImageSearchUrl = buildGoogleImageSearchUrl(chordName);
  const showImageSearch = imageSearchChordName === chordName;
  const selectedFavoriteName =
    selectedMemoFavorite && favorites.includes(selectedMemoFavorite)
      ? selectedMemoFavorite
      : favorites[0];
  const favoriteItems = useMemo(
    () =>
      favorites.map((favorite) => {
        const savedVoicing = favoriteVoicings[favorite];
        const voicing =
          savedVoicing ?? chordVoicings.find((candidate) => candidate.chordName === favorite);

        return {
          name: favorite,
          sourceLabel: savedVoicing ? "저장 운지" : voicing ? "대표 운지" : "운지 없음",
          voicing,
        };
      }),
    [favoriteVoicings, favorites],
  );

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
  const selectedFavoriteVoicing = useMemo(() => {
    if (!selectedFavoriteName) {
      return undefined;
    }

    return favoriteItems.find((item) => item.name === selectedFavoriteName)?.voicing;
  }, [favoriteItems, selectedFavoriteName]);

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

  function handleDeleteFavorite(favorite: string) {
    if (selectedFavoriteName === favorite) {
      setSelectedMemoFavorite(undefined);
    }

    toggleFavorite(favorite);
  }

  return (
    <div className="min-h-screen bg-[#101614] text-[#f6f0e6]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1380px] flex-col px-3 pb-24 pt-3 sm:px-5 lg:px-6">
        <header className="overflow-hidden rounded-[8px] border border-[#5eead4]/20 bg-[#15201e] shadow-xl shadow-black/20">
          <div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid size-16 shrink-0 place-items-center rounded-[8px] border border-[#ff8a65]/60 bg-[#f6f0e6] p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_10px_24px_rgba(0,0,0,0.28)]">
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
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#ff8a65]">
                  Praise Guitar Chords
                </p>
                <h1 className="mt-0.5 text-balance break-keep text-xl font-semibold tracking-normal text-[#f6f0e6] sm:text-2xl">
                  인도형의 찬양 기타코드 대백과
                  <span className="ml-1 whitespace-nowrap text-sm font-medium text-[#aeb8ad]">
                    (by 전도사닷컴)
                  </span>
                </h1>
                <div className="mt-1.5 inline-flex max-w-full items-center gap-2 rounded-[7px] border border-white/10 bg-white/[0.05] px-2.5 py-1">
                  <span className="shrink-0 text-[10px] font-semibold text-[#92a49b]">
                    현재 코드
                  </span>
                  <strong className="truncate text-2xl font-semibold leading-none text-[#5eead4]">
                    {chordName}
                  </strong>
                </div>
              </div>
            </div>
            <div className="grid shrink-0 grid-cols-3 gap-1.5 text-center sm:gap-2">
              <div className="rounded-[7px] bg-white/[0.06] px-2 py-1.5">
                <p className="text-[10px] font-semibold text-[#92a49b]">폼</p>
                <p className="text-sm font-semibold">{voicings.length}</p>
              </div>
              <div className="rounded-[7px] bg-white/[0.06] px-2 py-1.5">
                <p className="text-[10px] font-semibold text-[#92a49b]">무료</p>
                <p className="text-sm font-semibold">{voicingCount}</p>
              </div>
              <div className="rounded-[7px] bg-white/[0.06] px-2 py-1.5">
                <p className="text-[10px] font-semibold text-[#92a49b]">프렛</p>
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
            <aside className="h-fit rounded-[8px] border border-white/10 bg-[#0f1715] p-2 shadow-xl shadow-black/20 lg:sticky lg:top-4">
              <form
                onSubmit={handleDirectSubmit}
                className="mb-2 rounded-[8px] border border-white/10 bg-[#0b1211]/85 p-2"
              >
                <label
                  htmlFor="direct-chord-input"
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-[#f6f0e6]"
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
                    className="min-w-0 flex-1 rounded-[7px] border border-white/10 bg-white/[0.06] px-2 text-[16px] font-semibold text-[#f6f0e6] outline-none transition placeholder:text-[#7f9188] focus:border-[#5eead4]/70"
                  />
                  <button
                    type="submit"
                    aria-label="입력한 코드 보기"
                    title="입력한 코드 보기"
                    className="grid size-10 shrink-0 place-items-center rounded-[7px] border border-[#ff8a65]/70 bg-[#ff8a65] text-[#24100a] transition hover:bg-[#ffa184]"
                  >
                    <Search className="size-4" />
                  </button>
                </div>
                {directInputError ? (
                  <p className="mt-2 text-xs leading-5 text-[#ff8a65]">{directInputError}</p>
                ) : null}
              </form>
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                <ChordRootSelector />
                <ChordQualitySelector />
              </div>
            </aside>

            <section className="min-w-0">
              <div className="mb-2 text-center">
                <p className="text-2xl font-semibold text-[#f6f0e6]">{chordName}</p>
                <div className="mt-1.5 rounded-[8px] border border-[#5eead4]/30 bg-[#183a36] py-0.5 text-base font-semibold text-[#dffbf5] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                  Finger
                </div>
                <p className="mt-1 text-xs leading-4 text-[#aeb8ad]">
                  운지표를 누르면 소리가 납니다.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setImageSearchChordName((value) => (value === chordName ? undefined : chordName))
                  }
                  className="mt-1.5 inline-flex h-8 items-center gap-2 rounded-[7px] border border-white/10 bg-white/[0.06] px-2.5 text-xs font-semibold text-[#efe8dd] transition hover:border-[#5eead4]/60"
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
                              className="text-base font-semibold text-[#f6f0e6]"
                            >
                              {section.title}
                            </h2>
                            <p className="hidden text-[11px] leading-4 text-[#9fb6ad] sm:block">
                              {section.description}
                            </p>
                          </div>
                          <span className="rounded-[6px] bg-white/[0.06] px-2 py-0.5 text-xs font-semibold text-[#efe8dd]">
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
                <div className="rounded-[8px] border border-white/10 bg-[#17201e] p-5">
                  <div className="grid size-11 place-items-center rounded-[8px] bg-white/[0.06] text-[#5eead4]">
                    <Search className="size-5" />
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-[#f6f0e6]">
                    {chordName} 운지를 바로 찾아볼 수 있습니다
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#d8d0c0]">
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
            {activeTab === "reverse" ? <ReverseChordFinder /> : null}

            {activeTab === "open" ? <OpenChordLibrary /> : null}

            {activeTab === "memo" ? (
              <div className="grid gap-4 xl:grid-cols-2">
                <section className="rounded-[8px] border border-white/10 bg-[#17201e] p-5">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-[8px] bg-[#ff8a65] text-[#24100a]">
                      <Star className="size-5" />
                    </div>
                    <h2 className="text-xl font-semibold text-[#f6f0e6]">즐겨찾기</h2>
                  </div>
                  <div className="mt-4 grid gap-2">
                    {favorites.length > 0 ? (
                      favoriteItems.map(({ name: favorite, sourceLabel, voicing }) => (
                        <div
                          key={favorite}
                          className={`grid grid-cols-[96px_minmax(0,1fr)_40px] gap-2 rounded-[8px] border p-2 transition sm:grid-cols-[112px_minmax(0,1fr)_42px] ${
                            selectedFavoriteName === favorite
                              ? "border-[#ff8a65]/75 bg-[#ff8a65]/15 text-[#f6f0e6]"
                              : "border-white/10 bg-white/[0.04] text-[#f6f0e6] hover:border-[#ff8a65]/50"
                          }`}
                        >
                          <div className="min-w-0">
                            {voicing ? (
                              <ChordDiagram
                                voicing={voicing}
                                isLeftHanded={isLeftHanded}
                                size="compact"
                                className="border-white/10 bg-[#0f1715] shadow-none"
                              />
                            ) : (
                              <div className="grid aspect-[236/272] place-items-center rounded-[8px] border border-dashed border-white/10 bg-black/20 p-2 text-center text-xs leading-5 text-[#92a49b]">
                                운지 없음
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedMemoFavorite(favorite)}
                            className="flex min-h-[112px] min-w-0 flex-col items-start justify-center gap-2 rounded-[7px] px-2 text-left transition hover:bg-white/[0.04]"
                          >
                            <span className="max-w-full truncate text-xl font-semibold leading-tight">
                              {favorite}
                            </span>
                            <span className="rounded-[6px] bg-white/[0.06] px-2 py-1 text-xs font-semibold text-[#aeb8ad]">
                              {sourceLabel}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#ffb199]">
                              선택
                              <ChevronRight className="size-3.5" />
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFavorite(favorite)}
                            aria-label={`${favorite} 즐겨찾기 삭제`}
                            title="즐겨찾기 삭제"
                            className="grid min-h-[112px] place-items-center rounded-[7px] border border-white/10 text-[#aeb8ad] transition hover:bg-[#ff8a65]/15 hover:text-[#ffb199]"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-[8px] bg-white/[0.04] p-3 text-sm text-[#d8d0c0]">
                        아직 저장된 코드가 없습니다.
                      </p>
                    )}
                  </div>
                  {selectedFavoriteVoicing ? (
                    <div className="mt-4 rounded-[8px] border border-[#ff8a65]/30 bg-[#111817] p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-lg font-semibold text-[#f6f0e6]">
                            {selectedFavoriteVoicing.chordName}
                          </p>
                          <p className="mt-0.5 text-xs text-[#aeb8ad]">저장 운지</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => selectChordName(selectedFavoriteVoicing.chordName)}
                          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-[7px] border border-white/10 bg-white/[0.06] px-2 text-xs font-semibold text-[#efe8dd] transition hover:border-[#5eead4]/60"
                        >
                          Forward
                          <ChevronRight className="size-3.5" />
                        </button>
                      </div>
                      <ChordDiagram voicing={selectedFavoriteVoicing} isLeftHanded={isLeftHanded} />
                    </div>
                  ) : null}
                </section>

                <section className="rounded-[8px] border border-white/10 bg-[#17201e] p-5">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-[8px] bg-[#5eead4] text-[#06201c]">
                      <BookOpen className="size-5" />
                    </div>
                    <h2 className="text-xl font-semibold text-[#f6f0e6]">최근 본 코드</h2>
                  </div>
                  <div className="mt-4 grid gap-2">
                    {recent.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => selectChordName(item)}
                        className="flex h-12 items-center justify-between rounded-[8px] border border-white/10 bg-white/[0.04] px-3 text-left font-semibold text-[#f6f0e6] transition hover:border-[#5eead4]/50"
                      >
                        {item}
                        <ChevronRight className="size-4 text-[#92a49b]" />
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            ) : null}

            {activeTab === "settings" ? (
              <div className="rounded-[8px] border border-white/10 bg-[#17201e] p-5">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-[8px] bg-white/[0.06] text-[#5eead4]">
                    <Settings2 className="size-5" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#f6f0e6]">Setting</h2>
                </div>
                <div className="mt-5 grid gap-3">
                  <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-sm font-semibold text-[#f6f0e6]">손가락 번호 표시</p>
                    <p className="mt-1 text-xs leading-5 text-[#aeb8ad]">
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
                    <p className="text-sm font-semibold text-[#f6f0e6]">고급 운지</p>
                    <p className="mt-1 text-xs leading-5 text-[#aeb8ad]">
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
