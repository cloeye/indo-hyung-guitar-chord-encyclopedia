import { cn } from "@/lib/cn";
import type { ChordVoicing } from "@/types/chord";

type ChordDiagramProps = {
  voicing: ChordVoicing;
  isLeftHanded: boolean;
  size?: "default" | "compact" | "large";
  className?: string;
  onFretSelect?: (stringIndex: number, fret: number) => void;
  onFingerSelect?: (stringIndex: number) => void;
};

const width = 236;
const height = 272;
const gridX = 40;
const gridY = 54;
const stringGap = 30;
const fretGap = 34;
const fretCount = 5;

function stringIndexFromNumber(stringNumber: number) {
  return 6 - stringNumber;
}

function getStringX(stringIndex: number, isLeftHanded: boolean) {
  const displayIndex = isLeftHanded ? 5 - stringIndex : stringIndex;
  return gridX + displayIndex * stringGap;
}

export function ChordDiagram({
  voicing,
  isLeftHanded,
  size = "default",
  className,
  onFretSelect,
  onFingerSelect,
}: ChordDiagramProps) {
  const bottomY = gridY + fretCount * fretGap;
  const nutWidth = voicing.startFret === 1 ? 7 : 2;
  const isCompact = size === "compact";
  const isLarge = size === "large";
  const isInteractive = typeof onFretSelect === "function";
  const isFingerEditable = typeof onFingerSelect === "function";

  const barre = voicing.barre
    ? {
        y: gridY + (voicing.barre.fret - voicing.startFret + 0.5) * fretGap,
        x1: getStringX(stringIndexFromNumber(voicing.barre.fromString), isLeftHanded),
        x2: getStringX(stringIndexFromNumber(voicing.barre.toString), isLeftHanded),
      }
    : undefined;

  return (
    <div
      className={cn(
        "relative w-full rounded-[8px] border border-[#5eead4]/70 bg-[#111817] text-[#252019] shadow-[0_0_0_1px_rgba(255,255,255,0.08)]",
        isCompact ? "p-1" : isLarge ? "p-3" : "p-2",
        className,
      )}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${voicing.chordName} chord diagram`}
        className={cn(
          "mx-auto block aspect-[236/272] w-full",
          isCompact ? "max-w-[174px]" : isLarge ? "max-w-[340px]" : "max-w-[236px]",
        )}
      >
        <rect
          x={gridX}
          y={gridY}
          width={5 * stringGap}
          height={fretCount * fretGap}
          fill="#fbfaf6"
        />

        {voicing.startFret > 1 ? (
          <text
            x={18}
            y={gridY + 22}
            className="fill-[#d8d8d8] text-[12px] font-semibold"
          >
            {voicing.startFret}fr
          </text>
        ) : null}

        {Array.from({ length: 6 }).map((_, index) => {
          const x = getStringX(index, isLeftHanded);
          const isOuter = index === 0 || index === 5;
          return (
            <line
              key={`string-${index}`}
              x1={x}
              x2={x}
              y1={gridY}
              y2={bottomY}
              stroke={isOuter ? "#3d3d3d" : "#9a9a9a"}
              strokeWidth={isOuter ? 2.4 : 1.8}
              strokeLinecap="round"
            />
          );
        })}

        {Array.from({ length: fretCount + 1 }).map((_, index) => {
          const y = gridY + index * fretGap;
          return (
            <line
              key={`fret-${index}`}
              x1={gridX}
              x2={gridX + 5 * stringGap}
              y1={y}
              y2={y}
              stroke={index === 0 ? "#d8d8d8" : "#d98b75"}
              strokeWidth={index === 0 ? nutWidth : 1.8}
              strokeLinecap="round"
            />
          );
        })}

        {barre ? (
          <rect
            x={Math.min(barre.x1, barre.x2) - 12}
            y={barre.y - 11}
            width={Math.abs(barre.x2 - barre.x1) + 24}
            height={22}
            rx={11}
            fill="#64706d"
            opacity={0.5}
          />
        ) : null}

        {voicing.frets.map((fret, index) => {
          const x = getStringX(index, isLeftHanded);
          const markY = gridY - 24;

          if (fret === "x") {
            return (
              <text
                key={`mute-${index}`}
                x={x}
                y={markY}
                textAnchor="middle"
                className="fill-[#f2f2f2] text-[14px] font-bold"
              >
                X
              </text>
            );
          }

          if (fret === 0) {
            return (
              <circle
                key={`open-${index}`}
                cx={x}
                cy={markY - 4}
                r={6}
                fill="none"
                stroke="#f2f2f2"
                strokeWidth={2}
              />
            );
          }

          const localFret = fret - voicing.startFret + 1;
          const y = gridY + (localFret - 0.5) * fretGap;
          const isRoot = voicing.rootStrings?.includes(index);
          const finger = voicing.fingers[index];

          return (
            <g key={`note-${index}`}>
              <circle
                cx={x}
                cy={y}
                r={13.5}
                fill={isRoot ? "#d9fff7" : "#f4f0e9"}
                stroke={isRoot ? "#2dd4bf" : "#918c84"}
                strokeWidth={isRoot ? 3 : 2}
              />
              {finger !== "x" && finger !== 0 ? (
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  className={cn(
                    "text-[13px] font-bold",
                    isRoot ? "fill-[#08786c]" : "fill-[#1d1d1d]",
                  )}
                >
                  {finger}
                </text>
              ) : null}
            </g>
          );
        })}

        {Array.from({ length: 6 }).map((_, index) => {
          const stringNumber = 6 - index;

          return (
            <text
              key={`string-number-${stringNumber}`}
              x={getStringX(index, isLeftHanded)}
              y={bottomY + 30}
              textAnchor="middle"
              className="chord-string-number fill-[#8ee8dc] text-[11px] font-semibold"
            >
              {stringNumber}
            </text>
          );
        })}

        {isInteractive ? (
          <g aria-label="지판 프렛 입력">
            {Array.from({ length: 6 }).map((_, stringIndex) =>
              Array.from({ length: fretCount }).map((__, fretIndex) => {
                const fret = voicing.startFret + fretIndex;
                const x = getStringX(stringIndex, isLeftHanded) - stringGap / 2;
                const y = gridY + fretIndex * fretGap;

                return (
                  <rect
                    key={`hit-${stringIndex}-${fret}`}
                    x={x}
                    y={y}
                    width={stringGap}
                    height={fretGap}
                    fill="transparent"
                    data-fret-input={`${stringIndex}-${fret}`}
                    className="cursor-pointer"
                    onClick={() => onFretSelect(stringIndex, fret)}
                  >
                    <title>
                      {6 - stringIndex}번 줄 {fret}프렛 입력
                    </title>
                  </rect>
                );
              }),
            )}
          </g>
        ) : null}

        {isFingerEditable ? (
          <g aria-label="손가락 번호 입력">
            {voicing.frets.map((fret, stringIndex) => {
              if (fret === "x" || fret === 0) {
                return null;
              }

              const localFret = fret - voicing.startFret + 1;
              const x = getStringX(stringIndex, isLeftHanded);
              const y = gridY + (localFret - 0.5) * fretGap;

              return (
                <circle
                  key={`finger-hit-${stringIndex}`}
                  cx={x}
                  cy={y}
                  r={18}
                  fill="transparent"
                  data-finger-input={stringIndex}
                  className="cursor-pointer"
                  onClick={(event) => {
                    event.stopPropagation();
                    onFingerSelect(stringIndex);
                  }}
                >
                  <title>{6 - stringIndex}번 줄 손가락 번호 변경</title>
                </circle>
              );
            })}
          </g>
        ) : null}
      </svg>
    </div>
  );
}
