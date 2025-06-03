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
→ `SignupPage.jsx`에서 폼 입력 시 `axios.post('http://localhost:8080/api/join', payload)`를 통해 백엔드 API 호출  
→ 백엔드 응답 확인 후, 회원정보가 MySQL DB에 정상 저장됨을 검증  

---

### 2025.06.03

✅ **로그인 페이지 기능 개선**  
→ `LoginPage.jsx`에서 폼 입력 후 `axios.post('http://localhost:8080/api/login', payload)` 호출  
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
  - 사용자가 이메일 입력 후 `axios.post('http://localhost:8080/api/find-id', { email })` 호출  
  - 성공 시 `/find-id/success`로 이동하며, `ShowIDPage`에서 아이디 노출  
  - 실패 시 `/find-id/fail`로 이동하며, `FailIDPage`에서 에러 메시지 표시  
→ 라우팅 설정(`App.jsx`)에 `/find-id`, `/find-id/success`, `/find-id/fail` 경로 추가  
→ CSS(`FindIDPage.css`, `ShowIDPage.css`, `FailIDPage.css`)로 로그인 페이지와 동일한 디자인 적용  

✅ **비밀번호 찾기 페이지 구현 및 백엔드 연동**  
→ `FindPasswordPage.jsx`, `ResetPasswordPage.jsx`, `FailPasswordPage.jsx` 파일 생성  
  - `FindPasswordPage`에서 아이디+이메일 입력 후 `axios.post('http://localhost:8080/api/reset-password/request', { username, email })` 호출  
    • 성공 시 `/reset-password`로 이동하며 `ResetPasswordPage`에서 새 비밀번호 입력 폼 노출  
    • 실패 시 `/find-password/fail`로 이동하며 `FailPasswordPage`에서 에러 메시지 표시  
  - `ResetPasswordPage`에서 새 비밀번호/확인비밀번호 입력 후 `axios.post('http://localhost:8080/api/reset-password', { username, newPassword, confirmPassword })` 호출  
    • 성공 시 알림창(“비밀번호가 변경이 완료되었습니다!”) 후 `/login`으로 이동  
    • 실패 시 페이지 내에 오류 메시지 표시  
→ 라우팅 설정(`App.jsx`)에 `/find-password`, `/reset-password`, `/find-password/fail` 경로 추가  
→ CSS(`FindPasswordPage.css`, `ResetPasswordPage.css`, `FailPasswordPage.css`)로 로그인 페이지와 일관된 디자인 적용  

