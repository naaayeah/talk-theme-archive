// 전역 변수
let themes = [];
let currentSort = 'popular';
let currentCategory = 'all';
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// DOM 요소들
const galleryContainer = document.getElementById('galleryContainer');
const tabBtns = document.querySelectorAll('.tab-btn');
const categoryBtns = document.querySelectorAll('.category-btn');

/**
 * 새 테마를 추가하는 방법:
 * 1. themes.json 파일에 새로운 테마 객체를 추가
 * 2. 필수 필드: id, title, author, img, link, downloads, date
 * 3. 페이지를 새로고침하면 자동으로 반영됩니다
 * 
 * 예시:
 * {
 *   "id": 7,
 *   "title": "새로운 테마",
 *   "author": "제작자명",
 *   "img": "이미지URL",
 *   "link": "다운로드링크",
 *   "downloads": 1000,
 *   "date": "2024-01-30"
 * }
 */

// 테마 데이터 로드 (Realtime Database에서)
async function loadThemes() {
    try {
        // Firebase SDK 동적 import
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js');
        const { getDatabase, ref, get } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js');
        
        const firebaseConfig = {
            apiKey: "AIzaSyCzN65wqVnAEsGWQ1f9NoF-BOf1jGZIjb4",
            authDomain: "talk-theme-archive-556e4.firebaseapp.com",
            databaseURL: "https://talk-theme-archive-556e4-default-rtdb.asia-southeast1.firebasedatabase.app",
            projectId: "talk-theme-archive-556e4",
            storageBucket: "talk-theme-archive-556e4.firebasestorage.app",
            messagingSenderId: "370781750",
            appId: "1:370781750:web:452da7c22b5ad13965f297",
            measurementId: "G-EC59C2K94Z"
        };
        
        let app;
        try {
            app = initializeApp(firebaseConfig);
        } catch (e) {
            app = firebase.app(); // 이미 초기화된 경우
        }
        
        const db = getDatabase(app);
        const themesRef = ref(db, 'themes');
        const snapshot = await get(themesRef);
        
        themes = [];
        if (snapshot.exists()) {
            const data = snapshot.val();
            Object.keys(data).forEach((key) => {
                const themeData = data[key];
                const theme = {
                    id: key,
                    title: themeData.title,
                    author: themeData.author,
                    img: themeData.preview && themeData.preview.length > 0 ? themeData.preview[0] : 'https://via.placeholder.com/300x200/CCCCCC/FFFFFF?text=이미지+없음',
                    link: themeData.downloadUrl,
                    downloads: themeData.downloads || 0,
                    date: themeData.createdAt ? new Date(themeData.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    labels: themeData.labels || []
                };
                themes.push(theme);
            });
        }
        
        // 날짜순으로 정렬
        themes.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        renderGallery();
    } catch (error) {
        console.error('테마 데이터를 불러오는데 실패했습니다:', error);
        
        // 임시로 기존 JSON 데이터 사용
        try {
            const response = await fetch('themes.json');
            if (response.ok) {
                themes = await response.json();
                renderGallery();
                return;
            }
        } catch (jsonError) {
            console.error('JSON 데이터도 불러올 수 없습니다:', jsonError);
        }
        
        galleryContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <h3>데이터를 불러올 수 없습니다</h3>
                <p>Firebase 연결에 문제가 있을 수 있습니다.</p>
                <p>오류: ${error.message}</p>
                <p>잠시 후 다시 시도해주세요.</p>
            </div>
        `;
    }
}

// 테마 카드 생성 함수
function createThemeCard(theme) {
    const isFavorited = favorites.includes(theme.id);
    
    return `
        <div class="theme-card" data-id="${theme.id}">
            <div class="theme-image">
                <img src="${theme.img}" alt="${theme.title}" loading="lazy">
            </div>
            <div class="theme-content">
                <div class="theme-header">
                    <div>
                        <h3 class="theme-title">${theme.title}</h3>
                        <p class="theme-creator">${theme.author}</p>
                    </div>
                </div>
                <div class="theme-actions">
                    <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" onclick="toggleFavorite('${theme.id}')">
                        <i class="fas fa-heart"></i>
                        ${isFavorited ? '찜됨' : '찜하기'}
                    </button>
                    <a href="${theme.link}" class="download-btn" target="_blank">
                        <i class="fas fa-download"></i>
                        다운로드
                    </a>
                </div>
            </div>
        </div>
    `;
}

// 테마 정렬 함수
function sortThemes(type) {
    currentSort = type;
    
    // 탭 버튼 활성화 상태 변경
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.sort === type) {
            btn.classList.add('active');
        }
    });
    
    renderGallery();
}

// 테마 필터링 및 정렬
function filterAndSortThemes() {
    let filteredThemes = [...themes];
    
    // 카테고리 필터 (현재는 전체만 표시, 필요시 확장 가능)
    if (currentCategory !== 'all') {
        // 카테고리 필터링 로직 추가 가능
    }
    
    // 정렬 적용
    switch (currentSort) {
        case 'popular':
            filteredThemes.sort((a, b) => b.downloads - a.downloads);
            break;
        case 'latest':
            filteredThemes.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        default:
            break;
    }
    
    return filteredThemes;
}

// 갤러리 렌더링 함수
function renderGallery() {
    if (!galleryContainer) return;
    
    const filteredThemes = filterAndSortThemes();
    
    if (filteredThemes.length === 0) {
        galleryContainer.innerHTML = '<p>표시할 테마가 없습니다.</p>';
        return;
    }
    
    galleryContainer.innerHTML = filteredThemes.map(theme => createThemeCard(theme)).join('');
}

// 즐겨찾기 토글 함수
function toggleFavorite(id) {
    const index = favorites.indexOf(id);
    
    if (index > -1) {
        // 이미 찜되어 있으면 제거
        favorites.splice(index, 1);
    } else {
        // 찜되어 있지 않으면 추가
        favorites.push(id);
    }
    
    // LocalStorage에 저장
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // 갤러리 다시 렌더링
    renderGallery();
}

// Firebase Auth 상태에 따라 로그인/로그아웃 버튼과 등록 버튼 렌더링
function renderAuthButton() {
    const loginBtn = document.getElementById('loginBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    if (!loginBtn) return;

    // Firebase SDK 동적 import
    import('https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js').then(({ initializeApp }) => {
        import('https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js').then(({ getAuth, onAuthStateChanged, signOut }) => {
            const firebaseConfig = {
                apiKey: "AIzaSyCzN65wqVnAEsGWQ1f9NoF-BOf1jGZIjb4",
                authDomain: "talk-theme-archive-556e4.firebaseapp.com",
                databaseURL: "https://talk-theme-archive-556e4-default-rtdb.asia-southeast1.firebasedatabase.app",
                projectId: "talk-theme-archive-556e4",
                storageBucket: "talk-theme-archive-556e4.firebasestorage.app",
                messagingSenderId: "370781750",
                appId: "1:370781750:web:452da7c22b5ad13965f297",
                measurementId: "G-EC59C2K94Z"
            };
            let app;
            try {
                app = initializeApp(firebaseConfig);
            } catch (e) {
                app = firebase.app(); // 이미 초기화된 경우
            }
            const auth = getAuth();
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    // 로그인 상태: 로그아웃 버튼 + 등록 버튼 표시
                    loginBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i> 로그아웃`;
                    loginBtn.href = '#';
                    loginBtn.onclick = async (e) => {
                        e.preventDefault();
                        await signOut(auth);
                        window.location.reload();
                    };
                    
                    // 등록 버튼 표시
                    if (uploadBtn) {
                        uploadBtn.style.display = 'flex';
                    }
                } else {
                    // 로그아웃 상태: 로그인 버튼 + 등록 버튼 숨김
                    loginBtn.innerHTML = `<i class="fas fa-user"></i> 로그인`;
                    loginBtn.href = 'login.html';
                    loginBtn.onclick = null;
                    
                    // 등록 버튼 숨김
                    if (uploadBtn) {
                        uploadBtn.style.display = 'none';
                    }
                }
            });
        });
    });
}

// 이벤트 리스너들
function initializeEventListeners() {
    // 탭 버튼들
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const sortType = btn.dataset.sort;
            sortThemes(sortType);
        });
    });
    
    // 카테고리 버튼들 (필요시 확장)
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 활성 카테고리 클래스 제거
            categoryBtns.forEach(b => b.classList.remove('active'));
            // 클릭된 카테고리 활성화
            btn.classList.add('active');
            // 카테고리 필터 적용 (현재는 전체만 표시)
            currentCategory = btn.dataset.category;
            renderGallery();
        });
    });
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadThemes();
    renderAuthButton();
});

// 전역 함수로 노출 (HTML에서 호출하기 위해)
window.toggleFavorite = toggleFavorite;
window.sortThemes = sortThemes; 