import './Header.css';
import { Link } from 'react-router-dom';


function Header() {
  return (
    <>
      <header className="navbar">
        <div className="nav-left">
          <Link to="/">홈</Link>
          <Link to="/guide">게임 정보</Link>
          <Link to="/notice">공지사항</Link>
          <Link to="/community">커뮤니티</Link>
        </div>
        <div className="nav-right">
          <Link to="/login">로그인</Link>
          <Link to="/signup">회원가입</Link>
          <button className="play-button">지금 플레이</button>
        </div>
      </header>

    </>
  );
}

export default Header;
