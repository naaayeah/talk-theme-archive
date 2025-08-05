# 카톡테마모음

카카오톡 테마 갤러리 웹앱입니다.

## 🚀 시작하기

### 방법 1: 스크립트 사용 (권장)
```bash
./start-server.sh
```

### 방법 2: Python 직접 실행
```bash
python3 -m http.server 8000
```

### 방법 3: Node.js 사용
```bash
npx serve
```

### 방법 4: VS Code Live Server
1. VS Code에서 Live Server 확장 설치
2. `index.html` 파일을 우클릭
3. "Open with Live Server" 선택

## 🌐 접속 방법

서버가 실행되면 브라우저에서 다음 주소로 접속하세요:
- **메인 페이지**: http://localhost:8000
- **즐겨찾기**: http://localhost:8000/favorites.html

## 📁 파일 구조

```
themegallery/
├── index.html          # 메인 페이지
├── favorites.html      # 즐겨찾기 페이지
├── themes.json         # 테마 데이터
├── styles.css          # 스타일시트
├── script.js           # 메인 페이지 JavaScript
├── favorites.js        # 즐겨찾기 페이지 JavaScript
├── start-server.sh     # 서버 실행 스크립트
└── README.md           # 이 파일
```

## ✨ 주요 기능

- **테마 갤러리**: 다양한 카카오톡 테마 둘러보기
- **정렬 기능**: 인기순, 최신순 정렬
- **즐겨찾기**: 마음에 드는 테마 찜하기
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
- **로컬 스토리지**: 즐겨찾기 데이터 저장

## 🔧 새 테마 추가하기

1. `themes.json` 파일을 열어서 새로운 테마 객체를 추가하세요:

```json
{
  "id": 7,
  "title": "새로운 테마",
  "author": "제작자명",
  "img": "이미지URL",
  "link": "다운로드링크",
  "downloads": 1000,
  "date": "2024-01-30"
}
```

2. 페이지를 새로고침하면 자동으로 반영됩니다.

## 🛠️ 기술 스택

- HTML5
- CSS3
- JavaScript (ES6+)
- LocalStorage API
- Fetch API

## 📱 브라우저 지원

- Chrome (권장)
- Firefox
- Safari
- Edge

## ⚠️ 주의사항

- 브라우저에서 직접 파일을 열면 CORS 정책으로 인해 데이터를 불러올 수 없습니다.
- 반드시 로컬 서버를 통해 접속해주세요. 