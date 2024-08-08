
# 📂 PDFast 서비스 소개

![파이널-프로젝트-001](https://github.com/user-attachments/assets/b6ceb105-2b41-4101-b510-ac062fe5c130)

![파이널-프로젝트-004](https://github.com/user-attachments/assets/4ec19ea5-4540-4606-8ef0-fc35691e852e)


<br/>
<br/>

## 🎥 시연 영상

|<img width="1000" src="https://github.com/user-attachments/assets/6d27a6c6-caf8-4071-974c-54c735fe1d0f">|
| :---: |
|PDF 문서를 통한 학습 보조 웹 플랫폼|

<br/>
<br/>

## ✅ 추진 배경


![파이널-프로젝트-005](https://github.com/user-attachments/assets/4c7d0043-7651-4d3c-b1f0-294b8818998d)


# 👥 팀원 소개

| <img width="250" alt="hj" src="https://github.com/user-attachments/assets/c0af7daa-f81b-4527-b62b-f9ee8d23e311"> | <img width="250" alt="yj" src="https://github.com/user-attachments/assets/bee1516f-d25d-46af-8cee-2771a4d9c917"> | <img width="250" alt="jh" src="https://github.com/user-attachments/assets/0c08e694-5ca3-446a-8af9-e7441b83553f"> |
| --- | --- | --- |
| 🐼[정현주](https://github.com/wjdguswn1203)🐼 | 🐱[송윤주](https://github.com/raminicano)🐱 | 🐶[신지현](https://github.com/sinzng)🐶 |

<br/>
<br/>


# ⚒ 전체 아키텍처

![파이널-프로젝트-008](https://github.com/user-attachments/assets/da29e426-b752-4f92-98ef-833580c38298)

<br/>
<br/>

# 📝 기능 및 화면

![Cap 2024-08-06 16-20-27-430](https://github.com/user-attachments/assets/e2a472ab-def9-416e-887a-7b6b28ac3bd2)
![Cap 2024-08-06 17-17-11-524](https://github.com/user-attachments/assets/b7edf6db-d21f-46a6-9fee-5bdfe26a1e3a)

<br/>
<br/>

# 🏆 기술 스택
## Programming language

<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
<br/>

## Library & Framework

<img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=white"/>
<br/>

## Database

<img alt="s3" src="https://img.shields.io/badge/AWS_S3-569A31?logo=amazons3&logoColor=fff&style=for-the-badge"> <img src="https://img.shields.io/badge/-MongoDB-13aa52?style=for-the-badge&logo=mongodb&logoColor=white"/> <img src="https://img.shields.io/badge/weaviate-6EBE49?style=for-the-badge"/>

<br/>


## Version Control System
<img alt="github" src="https://img.shields.io/badge/Github-000000?style=for-the-badge&logo=github&logoColor=white"> 
<br/>


## Communication Tool

<img alt="notion" src="https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=white"> <img alt="kakao" src="https://img.shields.io/badge/KakaoTalk-FFCD00?style=for-the-badge&logo=kakao&logoColor=black"> 


<br/>
<br/>
<br/>


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
- `regex.js`: redux 관련 파일입니다.

## src/styles
- 스타일시트 파일을 저장

## App.js
- 애플리케이션의 메인 컴포넌트

## index.js
- 애플리케이션의 진입점
