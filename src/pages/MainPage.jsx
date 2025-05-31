import Header from '../components/Header';
import Footer from '../components/Footer';
import './MainPage.css';

function MainPage() {
  return (
    <div className="main-page">
      <Header />

      <main className="hero">
        <div className="hero-text">
          <p>"끝없는 던전에서 살아남아라!"</p>
          <p>"매번 새롭게 시작되는 로그라이크 어드벤처"</p>
          <p>"2D 액션 + 아이템 파밍의 재미, 지금 경험해보세요"</p>
        </div>

        <button className="download-button">무료 다운로드</button>
        <p className="sub-text">2D 로그라이크 게임 · 무료 플레이</p>
      </main>

      <Footer />
    </div>
  );
}

export default MainPage;
