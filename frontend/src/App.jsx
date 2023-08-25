import TitleSign from "./components/TitleSign";
import ConnectButton from "./components/ConnectButton";
import Roulette from "./components/Roulette";
import Loading from "./components/Loading";

import { useAccount } from "wagmi";

function App() {
  const { isConnected } = useAccount();

  return (
    <>
      <header>
        <div className="wallet-wrapper">
          <a
            className="button live-link connect heartbeat"
            href="https://qrng-roulette.netlify.com"
            target="roulette-qrng"
          >
            Go to Live Site
          </a>
        </div>
      </header>
      <main className="App page-content">
        <section className="page-section">
          <inner-column>
            <TitleSign />
            <Roulette />
          </inner-column>

          <Loading />
        </section>
      </main>
    </>
  );
}

export default App;
