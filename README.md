# AI 식물 집사

AI로 식물을 진단하고, 사진과 함께 성장 일기를 기록하며 맞춤 관리 가이드를 받아보세요.

## 📦 로컬 환경에서 실행하기 (Vite + npm)

1.  **종속성 설치**:
    -   프로젝트 폴더에서 다음 명령어를 실행하여 필요한 패키지를 설치합니다.
    ```bash
    npm install
    ```

2.  **환경 변수 설정**:
    -   프로젝트 루트에 있는 `.env.example` 파일을 복사하여 `.env` 파일을 생성합니다.
        ```bash
        cp .env.example .env
        ```
    -   생성된 `.env` 파일을 열고, [Google AI Studio](https://aistudio.google.com/app/apikey)에서 발급받은 본인의 Gemini API 키를 입력합니다.
        ```
        VITE_API_KEY="YOUR_GEMINI_API_KEY"
        ```

3.  **개발 서버 실행**:
    ```bash
    npm run dev
    ```
    -   서버가 실행되면 터미널에 표시된 로컬 주소(예: `http://localhost:5173`)로 접속하여 앱을 확인할 수 있습니다.


## ✨ 주요 기능

-   **📸 AI 사진 분석 진단**: 식물 사진 한 장으로 식물의 종류, 건강 상태, 수분 및 일조량 등을 정밀하게 분석합니다.
-   **📝 맞춤 관리 가이드**: AI 분석 결과를 바탕으로 물주기, 햇빛, 가지치기 등 식물에 꼭 맞는 관리 방법을 추천합니다.
-   **📔 성장 일기**: 진단받은 식물을 등록하고, 시간의 흐름에 따른 변화를 사진과 함께 기록하여 성장 과정을 한눈에 볼 수 있습니다.
-   **💬 AI 챗봇 상담**: 진단 결과에 대해 궁금한 점을 AI 식물 전문가에게 바로 질문하고 답변을 받을 수 있습니다.
-   **🎨 특수 기능**:
    -   **꽃 색깔 예측**: 수국처럼 흙의 산도에 따라 색이 변하는 식물의 경우, 원하는 색으로 꽃을 피우는 방법을 안내하고 AI로 미리보기 이미지를 생성합니다.
    -   **개화 모습 시뮬레이션**: 아직 꽃이 피지 않은 식물이 만개했을 때의 모습을 다양한 색상으로 미리 볼 수 있습니다.

## 🛠️ 사용 기술

-   **Frontend**: React, TypeScript, Vite, Tailwind CSS
-   **AI Model**: Google Gemini API
    -   `gemini-2.5-flash`: 식물 분석 및 챗봇 기능
    -   `gemini-2.5-flash-image`: 꽃 색깔 변경 및 개화 시뮬레이션 이미지 생성

## 📂 프로젝트 구조

```
.
├── src/
│   ├── components/         # 리액트 컴포넌트
│   ├── services/           # 외부 서비스 연동
│   ├── App.tsx             # 메인 애플리케이션 컴포넌트
│   ├── index.css           # Tailwind CSS 진입점
│   ├── index.tsx           # 리액트 렌더링 시작점
│   └── types.ts            # TypeScript 타입 정의
├── .env.example        # 환경 변수 예시 파일
├── index.html          # HTML 진입점
├── package.json        # npm 패키지 및 스크립트 정의
├── postcss.config.js   # PostCSS 설정
├── tailwind.config.js  # Tailwind CSS 설정
├── tsconfig.json       # TypeScript 설정
├── vite.config.ts      # Vite 설정
└── README.md           # 프로젝트 설명 파일
```
