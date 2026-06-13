import TitleSign from "./components/TitleSign";
import FakeWalletButton from "./components/FakeWalletButton";
import Roulette from "./components/Roulette";
import Loading from "./components/Loading";

function App() {
  return (
    <>
      <header>
        <FakeWalletButton />
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
