import FakeWalletButton from "./components/FakeWalletButton";
import HudStatus from "./components/HudStatus";
import Roulette from "./components/Roulette";
import Loading from "./components/Loading";
import PerfHud from "./components/PerfHud";
import { perfEnabled } from "./lib/perfHarness";

function App() {
  return (
    <>
      {perfEnabled() && <PerfHud />}
      <header className="hud">
        <div className="hud-brand">
          <span className="hud-logo">QRNG</span>
          <span className="hud-brand-sub">roulette</span>
        </div>
        <HudStatus />
        <FakeWalletButton />
      </header>
      <main className="App page-content">
        <section className="page-section">
          <inner-column>
            <Roulette />
          </inner-column>

          <Loading />
        </section>
      </main>
    </>
  );
}

export default App;
