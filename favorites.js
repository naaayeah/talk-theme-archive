// 전역 변수
let themes = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// DOM 요소들
const favoritesContainer = document.getElementById('favoritesContainer');
const favoritesCount = document.getElementById('favoritesCount');
const emptyMessage = document.getElementById('emptyMessage');
const clearAllBtn = document.getElementById('clearAllBtn');

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
        
        renderFavorites();
    } catch (error) {
        console.error('테마 데이터를 불러오는데 실패했습니다:', error);
        
        // 임시로 기존 JSON 데이터 사용
        try {
            const response = await fetch('themes.json');
            if (response.ok) {
                themes = await response.json();
                renderFavorites();
                return;
            }
        } catch (jsonError) {
            console.error('JSON 데이터도 불러올 수 없습니다:', jsonError);
        }
        
        favoritesContainer.innerHTML = `
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

// 즐겨찾기 렌더링 함수
function renderFavorites() {
    if (!favoritesContainer) return;
    
    // LocalStorage에서 favorites 배열을 다시 불러옴 (최신 상태 유지)
    favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    // 즐겨찾기한 테마만 필터링
    const favoriteThemes = themes.filter(theme => favorites.includes(theme.id));
    
    // 즐겨찾기 개수 업데이트
    if (favoritesCount) {
        favoritesCount.textContent = favoriteThemes.length;
    }
    
    if (favoriteThemes.length === 0) {
        favoritesContainer.innerHTML = '';
        if (emptyMessage) {
            emptyMessage.style.display = 'block';
        }
    } else {
        if (emptyMessage) {
            emptyMessage.style.display = 'none';
        }
        favoritesContainer.innerHTML = favoriteThemes.map(theme => createThemeCard(theme)).join('');
    }
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
    
    // 즐겨찾기 다시 렌더링
    renderFavorites();
}

// 모두 삭제 함수
function clearAllFavorites() {
    if (confirm('모든 즐겨찾기를 삭제하시겠습니까?')) {
        favorites = [];
        localStorage.setItem('favorites', JSON.stringify(favorites));
        renderFavorites();
    }
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
    // 모두 삭제 버튼
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAllFavorites);
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadThemes();
    renderAuthButton();
});

// 전역 함수로 노출 (HTML에서 호출하기 위해)
window.toggleFavorite = toggleFavorite;
window.clearAllFavorites = clearAllFavorites; 