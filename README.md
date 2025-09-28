# looper_frontend  
게임 사용자 관리 및 회원가입/로그인 페이지를 포함한 전반적인 프론트엔드 기능을 처리하는 클라이언트 애플리케이션입니다.

# 🎓 Graduation Project - Game Frontend

## 📅 작업 히스토리

---

### 2025.05.31

✅ **기본 페이지 구현**  
→ `MainPage.jsx`, `MainPage.css` 파일 생성  
→ 헤더(로고, 내비게이션), 간단한 환영 메시지, 푸터 화면 배치  
→ 배경에 숲 이미지(`main.png`) 풀스크린 적용  

✅ **로그인 페이지 구현**  
→ `LoginPage.jsx`, `LoginPage.css` 파일 생성  
→ 이메일(ID) 및 비밀번호 입력 필드, 로그인 버튼 배치  
→ “회원가입”, “아이디 찾기”, “비밀번호 찾기” 링크 추가  
→ 반투명 흰색 컨테이너로 입력 구역 강조 및 그림자 적용  

✅ **회원가입 페이지 구현**  
→ `SignupPage.jsx`, `SignupPage.css` 파일 생성  
→ 이메일, 아이디, 닉네임, 비밀번호, 비밀번호 재확인 입력 필드 배치  
→ 폼 제출 버튼(회원가입) 추가  

---

### 2025.06.02

✅ **회원가입 페이지 백엔드 연동**  
→ `SignupPage.jsx`에서 폼 입력 시 `axios.post('${API_BASE_URL}/api/join', payload)`를 통해 백엔드 API 호출  
→ 백엔드 응답 확인 후, 회원정보가 MySQL DB에 정상 저장됨을 검증  

---

### 2025.06.03

✅ **로그인 페이지 기능 개선**  
→ `LoginPage.jsx`에서 폼 입력 후 `axios.post('${API_BASE_URL}/api/login', payload)` 호출  
  - 로그인 성공 시 `navigate('/')`를 이용해 `MainPage`로 이동  
  - 로그인 실패 시, 에러 코드에 따라 적절한 `alert` 메시지 표시 (“아이디 또는 비밀번호가 올바르지 않습니다.” 등)  

✅ **Remember-Me(로그인 상태 유지) 기능 추가**  
→ 로그인 폼에 체크박스를 추가하여,  
  - 체크 시 `localStorage.setItem('accessToken', token)` 처리  
  - 미체크 시 `sessionStorage.setItem('accessToken', token)` 처리  
  → 이를 통해 브라우저 세션 유지/만료에 따른 자동 로그인 제어 가능  

---

### 2025.06.04

✅ **아이디 찾기 페이지 구현 및 백엔드 연동**  
→ `FindIDPage.jsx`, `ShowIDPage.jsx`, `FailIDPage.jsx` 파일 생성  
  - 사용자가 이메일 입력 후 `axios.post('${API_BASE_URL}/api/find-id', { email })` 호출  
  - 성공 시 `/find-id/success`로 이동하며, `ShowIDPage`에서 아이디 노출  
  - 실패 시 `/find-id/fail`로 이동하며, `FailIDPage`에서 에러 메시지 표시  
→ 라우팅 설정(`App.jsx`)에 `/find-id`, `/find-id/success`, `/find-id/fail` 경로 추가  
→ CSS(`FindIDPage.css`, `ShowIDPage.css`, `FailIDPage.css`)로 로그인 페이지와 동일한 디자인 적용  

✅ **비밀번호 찾기 페이지 구현 및 백엔드 연동**  
→ `FindPasswordPage.jsx`, `ResetPasswordPage.jsx`, `FailPasswordPage.jsx` 파일 생성  
  - `FindPasswordPage`에서 아이디+이메일 입력 후 `axios.post('${API_BASE_URL}/api/reset-password/request', { username, email })` 호출  
    • 성공 시 `/reset-password`로 이동하며 `ResetPasswordPage`에서 새 비밀번호 입력 폼 노출  
    • 실패 시 `/find-password/fail`로 이동하며 `FailPasswordPage`에서 에러 메시지 표시  
  - `ResetPasswordPage`에서 새 비밀번호/확인비밀번호 입력 후 `axios.post('${API_BASE_URL}/api/reset-password', { username, newPassword, confirmPassword })` 호출  
    • 성공 시 알림창(“비밀번호가 변경이 완료되었습니다!”) 후 `/login`으로 이동  
    • 실패 시 페이지 내에 오류 메시지 표시  
→ 라우팅 설정(`App.jsx`)에 `/find-password`, `/reset-password`, `/find-password/fail` 경로 추가  
→ CSS(`FindPasswordPage.css`, `ResetPasswordPage.css`, `FailPasswordPage.css`)로 로그인 페이지와 일관된 디자인 적용  

✅ **커뮤니티 목록 페이지 구현 (`CommunityListPage.jsx` / `CommunityListPage.css`)**  
→ `CommunityListPage.jsx` 파일 생성  
  - 컴포넌트가 마운트될 때 `axios.get('${API_BASE_URL}/api/posts')` 호출  
  - 응답받은 게시글 배열을 `useState`로 관리하고 `useEffect`로 초기 로드  
  - 각 게시글을 카드 형태로 렌더링 (`제목`, `작성자`, `작성일` 표시)  
  - 게시글 클릭 시 `navigate(`/community/${post.id}`)`를 이용해 상세 페이지로 라우팅  
→ `CommunityListPage.css` 파일 생성  
  - 리스트 전체 레이아웃: 그리드 레이아웃(2열) 적용, gap과 margin 설정  
  - 카드 스타일: 그림자(`box-shadow`), hover 시 색 변화, padding, border-radius(8px) 적용  
  - 제목, 작성자, 작성일 텍스트 크기와 색상 지정  

✅ **커뮤니티 상세 페이지 구현 (`CommunityDetailPage.jsx` / `CommunityDetailPage.css`)**  
→ `CommunityDetailPage.jsx` 파일 생성  
  - URL 파라미터 (`useParams().id`)를 받아 `axios.get('${API_BASE_URL}/api/posts/' + id)` 호출  
  - 게시글 정보(`제목`, `작성자`, `내용`, `작성일`)를 `useState`로 관리  
  - 댓글 목록: GET `/api/posts/{id}/comments` 호출해 `댓글 배열` 조회 후 렌더링  
  - 로그인 여부 확인 (`localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')`)  
   • 로그인 상태일 때만 댓글 작성 입력창(`textarea` + “댓글 작성” 버튼) 표시  
   • 댓글 작성 시 `axios.post('${API_BASE_URL}/api/posts/' + id + '/comments', { body }, { headers: { Authorization: `Bearer ${token}` } })`  
  - 게시글 작성자 권한 확인: `post.authorId === 현재 로그인된 사용자 ID` 일 경우에만 ‘수정’, ‘삭제’ 버튼 표시  
   • 수정 클릭 시 `/community/edit/${id}`로 이동  
   • 삭제 클릭 시 `axios.delete('${API_BASE_URL}/api/posts/' + id, { headers: { Authorization: `Bearer ${token}` } })` 후 목록으로 리다이렉트  
  - 향후 예정: `좋아요(Like)`, `신고(Report)` 버튼 UI 자리만 미리 추가 (onClick 핸들러는 추후 구현)  
→ `CommunityDetailPage.css` 파일 생성  
  - 전체 컨테이너: max-width 800px, margin: 50px auto  
  - 제목: font-size 2rem, margin-bottom 16px  
  - 메타 정보(작성자/작성일): color #888, margin-bottom 24px  
  - 내용 영역: line-height 1.6, padding: 20px, background-color: #f9f9f9, border-radius: 8px  
  - 댓글 리스트: 댓글 각각에 padding 12px, border-bottom 1px solid #ddd  
  - 댓글 입력 폼: textarea 높이 100px, width 100%,	border-radius: 4px, margin-bottom 12px, 버튼은 반투명 어두운 배경  

✅ **커뮤니티 글 작성 페이지 구현 (`CommunityCreatePage.jsx` / `CommunityCreatePage.css`)**  
→ `CommunityCreatePage.jsx` 파일 생성  
  - 로그인 여부 검사: 로그인 토큰이 없으면 `navigate('/login')`  
  - 제목(`input type="text"`), 내용(`textarea`) 입력 form 구성  
  - “작성하기” 버튼 클릭 시 유효성 검사(제목/내용 빈 값 체크) 후:  
   `const payload = { title, body };`  
   `axios.post('${API_BASE_URL}/api/posts', payload, { headers: { Authorization: `Bearer ${token}` } })`  
   - 요청 성공 시 `navigate('/community')` (목록 페이지)로 이동  
  - “취소” 버튼 클릭 시 `navigate('/community')`  
→ `CommunityCreatePage.css` 파일 생성  
  - 폼 컨테이너: max-width 600px, margin 80px auto, padding 30px, background-color rgba(0, 0, 0, 0.05), border-radius 8px  
  - `label`과 `input`/`textarea` 간 margin-bottom 12px  
  - `input`, `textarea`: width 100%, padding 10px, border 1px solid #ccc, border-radius 4px  
  - 버튼(“작성하기”, “취소”): background-color #444, color #fff, padding 10px 20px, border-radius 4px, hover 시 배경-color #333  

✅ **라우팅 설정 업데이트 (`App.jsx`)**  
→ `/community` → `CommunityListPage` 연결  
→ `/community/:id` → `CommunityDetailPage` 연결  
→ `/community/create` → `CommunityCreatePage` 연결  
→ `/community/edit/:id` → (추후 구현 예정) `CommunityEditPage` 자리 마련  

✅ **공통 레이아웃 및 인증 Context 적용**  
→ 전체 페이지 공통으로 `Header` 컴포넌트에 “커뮤니티” 메뉴 항목 추가 (클릭 시 `/community`로 이동)  
→ `AuthContext`에 현재 로그인된 사용자 정보(id, username)와 `accessToken` 저장 로직 보강  
  - 로그인 시 `AuthContext.setUser({ id, username })` 호출  
  - 로그아웃 시 `AuthContext.clear()`  

---

### 2025.06.05

✅ **댓글 수정 삭제 기능 추가**  
→ `CommunityDetailPage.jsx` 수정:  
  - 댓글 목록 렌더링 시, 댓글 작성자 본인만 ‘삭제’ 버튼 표시  
  - `handleCommentDelete` 구현:  
    ```js
    axios
      .delete(`${API_BASE_URL}/api/posts/${id}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        alert('댓글이 삭제되었습니다.');
      })
      .catch((err) => {
        console.error('댓글 삭제 실패:', err);
        alert('댓글 삭제 중 오류가 발생했습니다.');
      });
    ```  
  - 삭제 후 댓글 리스트 자동 갱신 및 성공/실패 알림  

---

### 2025.06.06

✅ **글 작성 시 사진 여러 장 첨부 기능 추가**  
→ `CommunityCreatePage.jsx` 수정:  
  - `<input type="file" multiple accept="image/*" name="imageFiles" />` 태그로 여러 파일 선택 가능  
  - `handleFileChange`에서 `Array.from(e.target.files)`로 파일 배열 상태 관리  
  - `handleSubmit`에서 `FormData`에 `formData.append('imageFiles', file)`로 여러 파일 전송  
→ `PostRequest` DTO에 `List<MultipartFile> imageFiles` 추가, `PostServiceImpl`에서 `request.getImageFiles()` 반복 처리  

✅ **커뮤니티 목록 페이지 10개 단위 페이징 기능 구현**  
→ `CommunityListPage.jsx` 수정:  
  - 페이지 상태 관리: `const [currentPage, setCurrentPage] = useState(1); const postsPerPage = 10;`  
  - `currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost)` 로 현재 페이지 게시글 구분  
  - `totalPages = Math.ceil(posts.length / postsPerPage)` 계산, “이전”, “다음” 버튼으로 페이지 이동  
  - 페이지네이션 버튼 클릭 시 `setCurrentPage(num)` 호출  
→ `CommunityListPage.css`에 `.pagination-wrapper`, `.pagination`, `.page-button` 등 스타일 추가  

✅ **메인페이지 텍스트 이벤트(애니메이션) 추가**  
→ `MainPage.jsx` 수정:  
  - `lines = ['끝없는 던전에서 살아남아라!', '매번 새롭게 시작되는 로그라이크 어드벤처', '2D 액션 + 아이템 파밍의 재미, 지금 경험해보세요']` 배열 선언  
  - 각 줄 요소에 `.typing-line` 클래스를 주고, `fade-in` 클래스가 붙으면 슬라이드업+페이드인 효과 적용  
  - 마지막줄 애니메이션이 끝난 뒤에만 “무료 다운로드” 버튼과 “2D 로그라이크 게임 · 무료 플레이” 서브텍스트에 `.fade-in` 클래스 추가  
→ `MainPage.css`에 `.typing-line`, `.fade-in`, `@keyframes fadeInText` 등 관련 애니메이션 CSS 추가  

---


### 2025.06.07

✅ **커뮤니티 글 수정 페이지 구현 (`CommunityEditPage.jsx` / `CommunityEditPage.css`)**  
→ 기존 게시글 제목·내용·이미지 불러오기  
→ “사진 첨부” 섹션에서  
  - 기존 이미지 유지·삭제 기능  
  - 새 이미지 추가 기능  
→ `FormData` + `axios.put(‘/api/posts/{id}`, …)` 로 백엔드 연동  
→ 수정 완료 후 상세 페이지로 리다이렉트  

✅ **커뮤니티 글 수정 시 이미지 처리 오류 해결**  
→ 이미지 삭제가 반영되지 않던 원인:  
  - `keepImageUrls` 가 null 이면 삭제 로직이 동작하지 않음  
→ **해결**: `updatePost()` 내에서  
```java
List<String> keepUrls = request.getKeepImageUrls() != null
    ? request.getKeepImageUrls()
    : new ArrayList<>();
post.getImages().removeIf(img -> !keepUrls.contains(img.getFilePath()));
```

---


### 2025.06.08 

✅ **ADMIN 권한으로 다른 사용자 댓글·게시글 삭제 기능 오류 수정**  
→ 원인: 인증 필터에서 `UsernamePasswordAuthenticationToken` 생성 시 권한(roles)이 비어 있어, SecurityContext 의 `getAuthorities()` 검사에서 “ROLE_ADMIN”이 감지되지 않음  
→ **해결**:  
1. `JwtAuthenticationFilter` 에서 토큰 파싱 후 `new UsernamePasswordAuthenticationToken(username, null, List.of(new SimpleGrantedAuthority("ROLE_"+role)))` 로 권한 정보까지 함께 설정  
2. `CommentServiceImpl.deleteComment()` 와 `PostController.delete()` 에서 `auth.getAuthorities().anyMatch(…)` 로 ADMIN 검사 정상 동작  

✅ **댓글 수 카운팅 오류 수정**  
→ 원인: 상세 페이지 마운트 시 댓글 목록 조회(`fetchComments`)가 완료되기 전에 렌더링이 일어나, `comments.length`가 0으로 고정됨  
→ **해결**:  
1. 댓글 불러오기 요청 성공 후 `setComments(...)` 다음에 `setLoading(false)` 추가  
2. 로딩 상태 (`loading` state) 가 false 일 때만 본문과 댓글 수를 렌더링하도록 조건부 렌더링 적용  

(추후 작업 예정)  
- **게시글 좋아요(Like) 기능**: 게시글 상세에서 토큰 포함 `POST /api/posts/{id}/like` 호출, 좋아요 개수 렌더링  
- **게시글 신고(Report) 기능**: 신고 모달 UI 추가, `POST /api/posts/{id}/report` 호출  
- **무한 스크롤 페이징**: `CommunityListPage`에서 스크롤 페이징 방식으로 데이터 로드 최적화  
