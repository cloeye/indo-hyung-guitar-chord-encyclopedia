# 통기타 코드 탐색기 기획·개발 Spec

## 0. 프로젝트 개요

### 제품명 가칭

- 쉬운 통기타 코드
- 찬양 통기타 코드
- 코드등대
- Guitar Chord Finder

### 제품 한 줄 정의

복잡한 기타 코드도 초보자가 실제로 잡을 수 있는 로우 포지션 보이싱으로 보여주는 무료 통기타 코드 탐색기.

### 핵심 포지션

이 서비스는 단순한 코드표 앱이 아니다.  
초보자, 찬양팀 기타 입문자, 예배 반주자, 합주자를 위해 **코드명을 실전에서 잡을 수 있는 손모양으로 번역해주는 앱**이다.

기본 코드뿐 아니라 텐션 코드와 얼터드 코드까지 무료로 제공한다.  
다만 모든 코드를 한 화면에 복잡하게 보여주지 않고, 초보자가 실제로 사용할 수 있는 로우 포지션 운지를 우선 노출한다.

---

## 1. 핵심 제품 철학

### 1.1 모든 코드는 무료로 제공한다

레퍼런스 앱처럼 복잡한 코드에 잠금 아이콘을 걸지 않는다.

무료 제공 범위:

- Major / minor 계열
- 6 / 7 / 9 계열
- sus / add 계열
- dim / aug 계열
- maj7 / maj9 / maj11 / maj13 계열
- m7-5 / dim7 계열
- altered dominant 계열: 7-5, 7+5, 7-9, 7+9, 9-5, 9+11 등
- 분수코드: D/F#, C/E, G/B, A/C# 등

수익화가 필요하다면 코드 자체를 잠그지 않는다.  
코드는 무료, 편의 기능은 유료 또는 후원형으로 설계한다.

유료 또는 후원형 후보:

- 광고 제거
- 내 코드북 무제한 저장
- 곡별 코드 세트 저장
- 찬양팀 공유 링크
- 오프라인 저장
- 커스텀 코드 등록
- PDF 코드표 생성

---

## 2. 사용자 정의

### 2.1 Primary Target

- 통기타 초보자
- 찬양팀 기타 입문자
- 예배 반주자
- 교회 음악팀 교육자

### 2.2 Secondary Target

- 작곡 초보자
- 싱어송라이터
- 팝/재즈 반주 입문자
- 음악 교육 콘텐츠 제작자

---

## 3. 주요 사용 시나리오

### 3.1 찬양 악보에서 모르는 코드 발견

사용자가 찬양 악보에서 Cadd9, D/F#, G/B, Em7, Asus4 같은 코드를 발견한다.

앱에서 루트와 코드 타입을 버튼으로 선택한다.

예:

```text
Root: C
Quality: add9
Result: Cadd9
```

앱은 로우 포지션 중심의 운지 다이어그램을 즉시 보여준다.

---

### 3.2 복잡한 텐션 코드 발견

사용자가 G13, Cmaj9, A7(b9) 같은 코드를 발견한다.

앱은 완전한 구성음을 모두 포함한 어려운 운지만 보여주지 않는다.  
대신 합주 상황에서 사용할 수 있는 핵심음 중심의 로우 포지션 보이싱을 우선 보여준다.

---

### 3.3 F, Bm 같은 바레 코드에서 막힘

사용자가 F 코드를 선택한다.

앱은 바레 F를 먼저 강요하지 않는다.

표시 순서 예:

1. 약식 F
2. Fmaj7 대체 가능 운지
3. 바레 F

---

## 4. 핵심 UX 구조

### 4.1 메인 화면 구조

메인 화면은 버튼 선택형 구조를 기본으로 한다.

```text
상단:
- 앱 이름
- 현재 선택된 코드명

왼쪽:
- 코드 루트 선택

가운데:
- 코드 타입 그룹
- 코드 타입 버튼

오른쪽:
- 현재 선택 코드명
- 코드 다이어그램 리스트
- 난이도, 라벨, 설명

하단:
- Forward
- Reverse
- Memo
- Setting
```

### 4.2 기본 모드

앱 첫 진입 시 기본값:

```text
Root: C
Quality: Major
Result: C
Mode: 초보 연습
```

---

## 5. 코드 루트 선택

### 5.1 루트 목록

```text
C
C#
Db
D
D#
Eb
E
F
F#
Gb
G
G#
Ab
A
A#
Bb
B
```

C#과 Db처럼 이론적으로 같은 음이라도 사용자가 악보에서 보는 표기 그대로 찾을 수 있어야 하므로 둘 다 제공한다.

---

## 6. 코드 타입 그룹

### 6.1 기본 그룹

초기 화면에서 바로 보이는 코드 타입.

```text
Major
m
7
m7
M7
sus2
sus4
add9
dim
aug
```

### 6.2 반주 그룹

```text
6
9
m6
m9
7sus4
m7-5
dim7
69
```

### 6.3 텐션 그룹

```text
M9
M11
M13
m11
mM7
mM9
m69
11
13
```

### 6.4 얼터드 그룹

```text
7-5
7+5
7-9
7+9
9-5
9+11
M7-5
M7+5
aug7
aug9
```

### 6.5 UX 원칙

모든 코드는 무료로 제공한다.  
하지만 초보자가 부담을 느끼지 않도록 코드 타입은 그룹화한다.

핵심 원칙:

```text
무료지만 복잡하지 않게.
고급 코드까지 열려 있지만, 초보자는 기본 코드부터 보이게.
```

---

## 7. Low Position First 정책

### 7.1 기본 원칙

초보자는 10프렛 초과에서 코드를 누를 일이 거의 없다.  
따라서 기본 모드에서는 10프렛 초과 운지를 숨긴다.

운지 우선순위:

```text
1순위: 0~5프렛 오픈 코드 / 약식 코드
2순위: 6~10프렛 내 실용 바레 코드
3순위: 10프렛 초과 고급 포지션
```

MVP에서는 3순위는 숨김 처리한다.

### 7.2 기본 프렛 범위

```ts
const BEGINNER_MAX_FRET = 5;
const DEFAULT_MAX_FRET = 10;
```

초보자 모드:

- 0~5프렛 우선
- 10프렛 초과 숨김
- 바레 최소화
- 약식 운지 허용

일반 모드:

- 0~10프렛 표시
- 바레 운지 포함
- 실용 운지와 비교적 완전한 운지 함께 표시

고급 모드:

- 10프렛 초과 운지 표시
- 고급 보이싱 표시
- 구성음 정보 상세 표시

---

## 8. 실용 보이싱 정책

### 8.1 핵심 철학

1, 3, 5, 7음을 모두 눌러야만 해당 코드로 인정하지 않는다.

특히 합주에서는 베이스, 건반, 패드, 세컨 기타, 보컬 멜로디가 함께 존재한다.  
기타가 모든 음을 다 채우면 오히려 소리가 탁해질 수 있다.

따라서 앱은 다음 세 가지를 만족하는 보이싱을 우선한다.

```text
1. 코드의 성격이 전달될 것
2. 다른 악기와 충돌하지 않을 것
3. 초보자가 실제로 누를 수 있을 것
```

### 8.2 생략 가능한 음

일반적인 생략 우선순위:

```text
1. 중복 루트
2. 5음
3. 일부 확장 텐션
4. 루트, 단 베이스가 있는 합주 상황에 한함
```

### 8.3 유지 우선 음

```text
Major/minor 판단: 3음
Dominant 성격: 3음 + b7음
sus 성격: 4음, 3음은 기본 생략
add9 성격: 9음
altered 성격: b9, #9, b5, #5 등 변형음
```

### 8.4 충돌 방지 원칙

- sus4 코드에서는 3음과 4음이 동시에 강하게 울리지 않도록 한다.
- add9와 9 코드를 구분한다.
  - add9 = 7음 없이 9음을 더한 코드
  - 9 = 7음을 포함한 도미넌트9 코드
- 11 코드에서 메이저 3음과 11음이 동시에 과하게 부딪히지 않도록 주의한다.
- 합주용 보이싱에서는 저음 루트 중복을 줄인다.
- 베이스가 있는 경우 루트리스 보이싱을 허용한다.

---

## 9. 연주 상황 모드

### 9.1 초보 연습 모드

목표:

- 쉽게 누를 수 있는 운지 우선
- 0~5프렛 우선
- 바레 최소화
- 약식 운지 허용

정렬 우선순위:

```text
1. 0~5프렛
2. 손가락 수 적음
3. 바레 없음
4. 충돌 위험 낮음
5. 코드 성격이 어느 정도 살아남
```

### 9.2 혼자 반주 모드

목표:

- 루트와 울림이 풍성한 운지 우선
- 개방현 활용
- 혼자 연주해도 코드감이 분명한 운지 우선

정렬 우선순위:

```text
1. 루트 포함
2. 울림이 풍성함
3. 개방현 활용
4. 코드 진행 연결이 자연스러움
5. 0~5프렛 우선
```

### 9.3 찬양팀/합주 모드

목표:

- 다른 악기와 부딪히지 않는 핵심음 중심
- 루트리스 보이싱 허용
- 저음 과밀 방지
- 베이스/건반과 역할 분리

정렬 우선순위:

```text
1. 충돌 위험 낮음
2. 저음 과밀 없음
3. 3음과 7음 또는 핵심 텐션 포함
4. 베이스와 역할 분리 가능
5. 10프렛 이하
```

### 9.4 고급 모드

목표:

- 10프렛 초과 보이싱 허용
- 고급 코드와 재즈 보이싱 표시
- 구성음 상세 정보 표시

---

## 10. 보이싱 라벨

각 운지에는 사용자가 이해하기 쉬운 라벨을 붙인다.

추천 라벨:

```text
오픈 코드
초보자용
약식 운지
핵심음 중심
합주용
혼자 반주용
로우 포지션
바레 코드
루트리스
완전 운지
고급 운지
```

### 10.1 UI 문구 예시

C13:

```text
이 운지는 모든 구성음을 다 누르지 않고, C13의 분위기를 만드는 핵심음만 남긴 실용 보이싱입니다.
```

G9:

```text
G9의 핵심인 3음, b7음, 9음을 중심으로 잡는 운지입니다. 베이스가 G를 연주하는 상황에서 특히 깔끔하게 들립니다.
```

Asus4:

```text
sus4 코드는 3음을 빼고 4음을 넣어 긴장감을 만드는 코드입니다. A 코드와 번갈아 연주하면 자연스럽게 해결되는 느낌을 만들 수 있습니다.
```

---

## 11. 기능 범위

### 11.1 MVP 필수 기능

| 기능 | 설명 |
|---|---|
| 루트 선택 | C, C#, Db, D 등 |
| 코드 타입 선택 | Major, m, 7, M7, add9, sus4 등 |
| 코드명 자동 조합 | C + add9 = Cadd9 |
| 코드 다이어그램 표시 | 프렛, 줄, 손가락 번호 표시 |
| 로우 포지션 우선 정렬 | 0~5프렛 우선, 10프렛 초과 숨김 |
| 약식 보이싱 표시 | 생략음 허용, 핵심음 중심 |
| 난이도 표시 | 쉬움 / 보통 / 어려움 / 고급 |
| 코드 그룹화 | 기본 / 반주 / 텐션 / 얼터드 |
| 무료 고급 코드 제공 | 자물쇠 없이 모든 코드 열람 |
| 연주 상황 모드 | 초보 연습 / 혼자 반주 / 찬양팀 합주 |

### 11.2 2차 기능

| 기능 | 설명 |
|---|---|
| 즐겨찾기 | 자주 쓰는 코드 저장 |
| 최근 본 코드 | 최근 선택 코드 자동 기록 |
| 분수코드 모음 | D/F#, C/E, G/B, A/C# 등 |
| 코드 설명 | 코드 성격, 사용 상황, 주의점 |
| 왼손잡이 모드 | 다이어그램 반전 |
| 오프라인 저장 | 앱 설치 후 인터넷 없이 사용 |

### 11.3 3차 기능

| 기능 | 설명 |
|---|---|
| Reverse Chord Finder | 사용자가 누른 프렛을 기반으로 코드명 추론 |
| 코드 진행 추천 | G-D-Em-C 등 기본 진행 제공 |
| 찬양팀 코드 세트 | 예배 반주 자주 쓰는 코드 묶음 |
| 커스텀 코드 등록 | 사용자가 직접 운지 저장 |
| PDF 코드표 출력 | 교육용 코드표 생성 |
| 팀 공유 링크 | 찬양팀원에게 코드 세트 공유 |

---

## 12. 기술 스택

### 12.1 MVP 추천 스택

| 영역 | 추천 스택 |
|---|---|
| 프론트엔드 | Next.js App Router |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS |
| UI 컴포넌트 | shadcn/ui |
| 상태관리 | Zustand |
| 코드 데이터 | TypeScript / JSON 로컬 데이터 |
| 코드 다이어그램 | SVG 커스텀 렌더링 |
| 배포 | Vercel |
| 아이콘 | Lucide React |

### 12.2 확장 스택

| 영역 | 추천 스택 |
|---|---|
| PWA | next-pwa |
| 앱 래핑 | Capacitor |
| 장기 DB | Supabase |
| 인증 | Supabase Auth 또는 Clerk |
| 결제 | Toss Payments / Stripe |
| 분석 | Google Analytics / PostHog |
| 에러 추적 | Sentry |

### 12.3 기술 판단

MVP는 네이티브 앱이 아니라 웹앱/PWA로 만든다.  
이 프로젝트의 승부처는 기술보다 코드 데이터 품질과 보이싱 정책이다.

처음부터 앱스토어 배포를 목표로 네이티브 앱을 만들면 개발비와 유지비가 커진다.  
먼저 Next.js 웹앱으로 제품과 데이터를 검증한 뒤, 필요할 때 Capacitor로 앱스토어 배포를 검토한다.

---

## 13. 코드 다이어그램 렌더링

### 13.1 기본 방향

코드 다이어그램은 이미지 파일로 만들지 않는다.  
SVG 컴포넌트로 직접 렌더링한다.

이유:

- 코드 수가 늘어나도 관리가 쉽다.
- 손가락 번호, 바레, 루트음 강조를 동적으로 처리할 수 있다.
- 왼손잡이 모드와 테마 변경에 대응하기 쉽다.

### 13.2 컴포넌트 예시

```tsx
<ChordDiagram
  frets={["x", 3, 2, 0, 1, 0]}
  fingers={["x", 3, 2, 0, 1, 0]}
  startFret={1}
  barre={undefined}
  showFingerNumbers={true}
/>
```

### 13.3 표시 요소

- 6개 줄
- 4~5칸 프렛
- 시작 프렛 번호
- X / O 표시
- 손가락 번호
- 바레 표시
- 루트음 강조
- 선택적으로 구성음 표시

---

## 14. 프로젝트 구조

```text
src/
├─ app/
│  ├─ page.tsx
│  ├─ chords/
│  │  └─ [chordName]/
│  │     └─ page.tsx
│  └─ settings/
│     └─ page.tsx
│
├─ components/
│  ├─ ChordRootSelector.tsx
│  ├─ ChordQualitySelector.tsx
│  ├─ ChordDiagram.tsx
│  ├─ VoicingCard.tsx
│  ├─ ModeSelector.tsx
│  ├─ BottomTabs.tsx
│  └─ LayoutShell.tsx
│
├─ data/
│  ├─ chordRoots.ts
│  ├─ chordQualities.ts
│  ├─ chordVoicings.ts
│  ├─ slashChords.ts
│  └─ chordDescriptions.ts
│
├─ lib/
│  ├─ buildChordName.ts
│  ├─ filterVoicings.ts
│  ├─ sortVoicings.ts
│  ├─ musicTheory.ts
│  └─ constants.ts
│
├─ store/
│  └─ chordStore.ts
│
└─ types/
   └─ chord.ts
```

---

## 15. TypeScript 타입 설계

### 15.1 기본 타입

```ts
export type ChordRoot =
  | "C" | "C#" | "Db" | "D" | "D#" | "Eb"
  | "E" | "F" | "F#" | "Gb" | "G" | "G#"
  | "Ab" | "A" | "A#" | "Bb" | "B";

export type ChordGroup =
  | "basic"
  | "playing"
  | "tension"
  | "altered"
  | "slash";

export type Difficulty =
  | "easy"
  | "normal"
  | "hard"
  | "expert";

export type VoicingType =
  | "open"
  | "easy"
  | "shell"
  | "partial"
  | "rootless"
  | "barre"
  | "full"
  | "advanced";

export type UseCase =
  | "beginner"
  | "solo"
  | "band"
  | "worship"
  | "advanced";
```

### 15.2 ChordQuality

```ts
export type ChordQuality = {
  id: string;
  label: string;
  displayName: string;
  aliases: string[];
  group: ChordGroup;
  difficulty: Difficulty;
  shortDescription: string;
  isFree: true;
};
```

### 15.3 ChordVoicing

```ts
export type ChordVoicing = {
  id: string;
  chordName: string;
  displayName: string;

  root: ChordRoot;
  qualityId: string;

  startFret: number;
  maxFret: number;

  frets: Array<number | "x">;
  fingers: Array<number | "x" | 0>;

  barre?: {
    finger: number;
    fret: number;
    fromString: number;
    toString: number;
  };

  voicingType: VoicingType;
  difficulty: Difficulty;
  useCase: UseCase[];

  includedDegrees: string[];
  omittedDegrees: string[];

  hasRoot: boolean;
  hasThird: boolean;
  hasFifth: boolean;
  hasSeventh: boolean;
  hasTension: boolean;

  collisionRisk: "low" | "medium" | "high";

  isLowPosition: boolean;
  isRecommendedForBeginner: boolean;
  isFree: true;

  description: string;
  caution?: string;
};
```

---

## 16. 데이터 예시

### 16.1 ChordQuality 예시

```ts
export const chordQualities: ChordQuality[] = [
  {
    id: "major",
    label: "",
    displayName: "Major",
    aliases: ["major", "maj", "메이저"],
    group: "basic",
    difficulty: "easy",
    shortDescription: "가장 기본적인 밝은 느낌의 코드입니다.",
    isFree: true
  },
  {
    id: "dominant13",
    label: "13",
    displayName: "13",
    aliases: ["13", "dominant13"],
    group: "tension",
    difficulty: "expert",
    shortDescription: "도미넌트7 코드에 13음의 색채를 더한 코드입니다.",
    isFree: true
  }
];
```

### 16.2 ChordVoicing 예시: C Major

```ts
export const chordVoicings: ChordVoicing[] = [
  {
    id: "c-major-open",
    chordName: "C",
    displayName: "C 기본 오픈 코드",
    root: "C",
    qualityId: "major",
    startFret: 1,
    maxFret: 3,
    frets: ["x", 3, 2, 0, 1, 0],
    fingers: ["x", 3, 2, 0, 1, 0],
    voicingType: "open",
    difficulty: "easy",
    useCase: ["beginner", "solo", "worship"],
    includedDegrees: ["1", "3", "5"],
    omittedDegrees: [],
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    hasSeventh: false,
    hasTension: false,
    collisionRisk: "low",
    isLowPosition: true,
    isRecommendedForBeginner: true,
    isFree: true,
    description: "통기타에서 가장 많이 쓰는 C 코드 기본 운지입니다."
  }
];
```

### 16.3 ChordVoicing 예시: G13 합주용

```ts
export const g13Voicing: ChordVoicing = {
  id: "g13-band-low-shell",
  chordName: "G13",
  displayName: "G13 합주용 로우 보이싱",
  root: "G",
  qualityId: "dominant13",
  startFret: 3,
  maxFret: 5,
  frets: ["x", "x", 3, 4, 5, 5],
  fingers: ["x", "x", 1, 2, 3, 4],
  voicingType: "rootless",
  difficulty: "normal",
  useCase: ["band", "worship"],
  includedDegrees: ["3", "b7", "13"],
  omittedDegrees: ["1", "5", "9", "11"],
  hasRoot: false,
  hasThird: true,
  hasFifth: false,
  hasSeventh: true,
  hasTension: true,
  collisionRisk: "low",
  isLowPosition: true,
  isRecommendedForBeginner: false,
  isFree: true,
  description: "베이스가 G를 연주하는 상황에서 쓰기 좋은 G13 약식 보이싱입니다. 3음, b7음, 13음을 중심으로 코드의 성격을 전달합니다.",
  caution: "혼자 반주할 때는 루트가 빠져 다소 불안정하게 들릴 수 있습니다."
};
```

---

## 17. 코드명 조합 로직

### 17.1 기본 조합

```text
C + major = C
C + m = Cm
C + 7 = C7
C + M7 = CM7
C + add9 = Cadd9
```

### 17.2 함수 예시

```ts
export function buildChordName(root: ChordRoot, quality: ChordQuality): string {
  return `${root}${quality.label}`;
}
```

### 17.3 주의 사항

Major의 label은 빈 문자열이다.

```ts
{
  id: "major",
  label: "",
  displayName: "Major"
}
```

따라서 C + Major는 `CMajor`가 아니라 `C`로 표시되어야 한다.

---

## 18. 보이싱 필터링 로직

### 18.1 기본 필터

```ts
export function filterVoicings(params: {
  root: ChordRoot;
  qualityId: string;
  voicings: ChordVoicing[];
  maxFret?: number;
}) {
  const { root, qualityId, voicings, maxFret = 10 } = params;

  return voicings.filter((voicing) => {
    return (
      voicing.root === root &&
      voicing.qualityId === qualityId &&
      voicing.maxFret <= maxFret
    );
  });
}
```

---

## 19. 보이싱 정렬 로직

### 19.1 점수 기반 정렬

```ts
export function getVoicingScore(
  voicing: ChordVoicing,
  mode: UseCase
): number {
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
  if (voicing.voicingType === "rootless" && mode === "band") score += 10;

  if (voicing.voicingType === "barre") score -= 10;
  if (voicing.voicingType === "advanced") score -= 20;

  if (mode === "solo" && voicing.hasRoot) score += 15;
  if (mode === "band" && voicing.collisionRisk === "low") score += 10;

  return score;
}
```

### 19.2 정렬 함수

```ts
export function sortVoicings(
  voicings: ChordVoicing[],
  mode: UseCase
): ChordVoicing[] {
  return [...voicings].sort((a, b) => {
    return getVoicingScore(b, mode) - getVoicingScore(a, mode);
  });
}
```

---

## 20. 상태관리 설계

### 20.1 Zustand Store

```ts
import { create } from "zustand";
import type { ChordRoot, UseCase } from "@/types/chord";

type ChordState = {
  selectedRoot: ChordRoot;
  selectedQualityId: string;
  selectedMode: UseCase;
  showAdvancedVoicings: boolean;
  showFingerNumbers: boolean;
  isLeftHanded: boolean;

  setRoot: (root: ChordRoot) => void;
  setQualityId: (qualityId: string) => void;
  setMode: (mode: UseCase) => void;
  toggleAdvancedVoicings: () => void;
  toggleFingerNumbers: () => void;
  toggleLeftHanded: () => void;
};

export const useChordStore = create<ChordState>((set) => ({
  selectedRoot: "C",
  selectedQualityId: "major",
  selectedMode: "beginner",
  showAdvancedVoicings: false,
  showFingerNumbers: true,
  isLeftHanded: false,

  setRoot: (root) => set({ selectedRoot: root }),
  setQualityId: (qualityId) => set({ selectedQualityId: qualityId }),
  setMode: (mode) => set({ selectedMode: mode }),
  toggleAdvancedVoicings: () =>
    set((state) => ({ showAdvancedVoicings: !state.showAdvancedVoicings })),
  toggleFingerNumbers: () =>
    set((state) => ({ showFingerNumbers: !state.showFingerNumbers })),
  toggleLeftHanded: () =>
    set((state) => ({ isLeftHanded: !state.isLeftHanded }))
}));
```

---

## 21. 화면별 Spec

### 21.1 Forward 화면

가장 중요한 기본 화면.

구성:

- 루트 선택 버튼
- 코드 타입 그룹 탭
- 코드 타입 버튼
- 현재 선택 코드명
- 추천 운지 리스트
- 보이싱 설명
- 난이도 및 라벨

### 21.2 Reverse 화면

MVP에서는 비활성 또는 준비 중 처리.

문구:

```text
직접 누른 운지로 코드명을 찾는 기능은 준비 중입니다.
```

### 21.3 Memo 화면

MVP에서는 간단한 즐겨찾기만 구현하거나 준비 중 처리한다.

2차 기능으로 확장:

- 자주 쓰는 코드 저장
- 최근 본 코드
- 내 코드 세트
- 팀 공유 링크

### 21.4 Setting 화면

설정 항목:

- 손가락 번호 표시 ON/OFF
- 왼손잡이 모드 ON/OFF
- 10프렛 초과 고급 운지 표시 ON/OFF
- 코드 표기 방식: M7 / maj7
- 기본 연주 모드: 초보 연습 / 혼자 반주 / 찬양팀 합주 / 고급

---

## 22. 디자인 방향

### 22.1 레퍼런스에서 가져올 것

- 버튼 선택형 구조
- 코드 루트와 코드 타입의 분리
- 현재 코드명이 크게 보이는 구조
- 운지 다이어그램 리스트

### 22.2 그대로 따라 하지 말 것

- 오래된 UI 질감
- 버튼이 과하게 빽빽한 구성
- 고급 코드 잠금 UX
- 초보자에게 설명 없는 코드 나열

### 22.3 추천 디자인 톤

- 모바일 우선
- 큰 버튼
- 선명한 코드명
- 다크 모드 기반
- 초보자 친화적 라벨
- 깔끔한 SVG 다이어그램
- 텍스트는 짧고 실용적으로

---

## 23. MVP 개발 순서

### Phase 1. 기본 구조

1. Next.js 프로젝트 생성
2. Tailwind CSS 설정
3. shadcn/ui 설정
4. 기본 레이아웃 구현
5. Zustand Store 구현

### Phase 2. 코드 선택 기능

1. 루트 선택 버튼 구현
2. 코드 타입 그룹 탭 구현
3. 코드 타입 버튼 구현
4. 코드명 자동 조합 구현

### Phase 3. 코드 데이터

1. chordRoots.ts 작성
2. chordQualities.ts 작성
3. chordVoicings.ts 작성
4. 기본 코드 30~50개 입력
5. 텐션 코드 대표 보이싱 일부 입력

### Phase 4. 다이어그램

1. ChordDiagram SVG 컴포넌트 구현
2. X/O 표시 구현
3. 손가락 번호 표시 구현
4. startFret 표시 구현
5. 바레 표시 구현

### Phase 5. 추천 로직

1. filterVoicings 구현
2. sortVoicings 구현
3. 모드별 정렬 점수 적용
4. 10프렛 초과 숨김 적용

### Phase 6. 배포

1. Vercel 배포
2. 모바일 화면 점검
3. 실제 찬양팀/초보자 테스트
4. 코드 데이터 보강

---

## 24. MVP 데이터 범위

### 24.1 우선 입력할 기본 코드

```text
C
D
E
F
G
A
B
Am
Bm
Cm
Dm
Em
Fm
Gm
C7
D7
E7
G7
A7
B7
Cm7
Dm7
Em7
Am7
Bm7
CM7
DM7
GM7
AM7
```

### 24.2 찬양 반주 자주 쓰는 코드

```text
G
D
Em
C
Am
Bm
D/F#
C/E
G/B
A/C#
F/A
Asus4
Dsus4
Gsus4
Cadd9
Gadd9
Dadd9
```

### 24.3 텐션 대표 코드

```text
Cadd9
Gadd9
Dadd9
Am9
Em9
CM9
GM9
G9
A9
D9
G13
C13
A7-9
G7+9
```

---

## 25. 주의사항

### 25.1 저작권

코드명과 일반적인 코드 구성 원리 자체는 보통 보호 대상이 되기 어렵다.  
하지만 특정 앱이나 사이트의 코드 이미지, 설명문, 데이터베이스를 그대로 복제하면 문제가 될 수 있다.

안전한 방식:

- 코드 데이터 직접 제작
- 코드 다이어그램 SVG 직접 렌더링
- 설명 문구 직접 작성
- 악보와 가사 제공하지 않음
- 특정 유료 앱의 데이터 구조를 그대로 복사하지 않음

### 25.2 음악적 정확성

약식 보이싱은 반드시 라벨을 붙인다.

예:

```text
약식 운지
핵심음 중심
합주용
루트리스
```

“모든 구성음을 다 포함한 완전 운지”와 “실용 보이싱”을 명확히 구분해야 한다.

---

## 26. 최종 개발 지시 요약

이 앱은 초보자와 찬양팀 기타 연주자를 위한 통기타 코드 탐색기이다.  
사용자는 코드 루트와 코드 타입을 버튼으로 선택하고, 앱은 해당 코드의 실용적인 로우 포지션 운지를 보여준다.

핵심 원칙:

- 모든 코드는 무료로 제공한다.
- 복잡한 텐션 코드도 잠그지 않는다.
- 초보자는 10프렛 초과 운지를 거의 사용하지 않으므로 기본적으로 0~5프렛, 최대 10프렛 이하 운지를 우선한다.
- 텐션 코드는 모든 구성음을 반드시 포함하지 않아도 된다.
- 합주 상황에서는 5음, 중복 루트, 일부 텐션음, 경우에 따라 루트도 생략 가능하다.
- 코드의 성격과 합주 충돌 방지를 우선한다.
- 코드 다이어그램은 이미지가 아니라 SVG로 렌더링한다.
- MVP는 Next.js + TypeScript + Tailwind CSS + Zustand + Vercel 조합으로 만든다.
- 데이터는 초기에는 DB 없이 TypeScript/JSON 로컬 데이터로 관리한다.
- Reverse Chord Finder는 MVP에서 제외하거나 준비 중 처리한다.

---
