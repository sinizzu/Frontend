# 설명
메인 frontend repo입니다.

# 디렉토리 설명

```
paperinsight/
├── node_modules/
├── public/
│   ├── favicon.ico
│   ├── index.html
├── src/
│   ├── assets/
│   │   └── logo.png
│   ├── components/
│   │   ├── header.js
│   │   └── menu.js
│   ├── config/
│   │   └── config.json
│   ├── pages/
│   │   ├── chatbot.js
│   │   ├── driver.js
│   │   ├── pdfpreview.js
│   │   └── search.js
│   ├── services/
│   │   └── api.js
│   ├── store/
│   │   └── regex.js
│   ├── styles/
│   ├── App.js
│   ├── index.js
├── .gitignore
├── README.md
├── package-lock.json
└── package.json
```

## node_modules
- CRA구성하는 모든 패키지 소스코드가 존재하는 폴더

## public
- `index.html`같은 정적파일이 포함되는 곳으로 컴파일이 필요없는 파일들이 위치하는 폴더
- `favicon.ico`: 웹사이트의 파비콘입니다.
- `index.html`: React 애플리케이션의 주요 HTML 파일입니다.

## src
- 리액트 내부에서 작성하는 거의 모든 파일들이 포함

## src/assets
- 이미지 혹은 폰트와 같은 파일들이 저장
- `logo.png`: 애플리케이션의 로고

## src/components
- 재사용 가능한 컴포넌트들이 위치하는 폴더
- `header.js`: 헤더 컴포넌트입니다.
- `menu.js`: 메뉴 컴포넌트입니다.

## src/config
- `config.json`: 애플리케이션의 구성 설정입니다.

## src/pages
- react router등을 이용하여 라우팅을 적용할 때 페이지 컴포넌트를 이 폴더에 위치시킵니다.
- `chatbot.js`: 챗봇 페이지 컴포넌트입니다.
- `driver.js`: 드라이버 페이지 컴포넌트입니다.
- `pdfpreview.js`: PDF 미리보기 페이지 컴포넌트입니다.
- `search.js`: 검색 페이지 컴포넌트입니다.

## src/services
- 서비스 관련 파일을 저장
- `api.js`: API 호출 관련 파일입니다.

## src/store
- regex.js: redux 관련 파일입니다.

## src/styles
- 스타일시트 파일을 저장

## App.js
- 애플리케이션의 메인 컴포넌트

## index.js
- 애플리케이션의 진입점
