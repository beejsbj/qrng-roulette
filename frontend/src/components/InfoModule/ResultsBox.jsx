import useStore from "/src/store";
import { shortHash } from "/src/lib/demoWeb3";

export default function ResultsBox() {
  const { numbers, setNumbers, setSelection, selection, ticket } = useStore(
    (state) => state.grid
  );
  const { resetRound, isWinner, result } = useStore((state) => state.wheel);
  const { receipt, resetFlowForNextRound } = useStore((state) => state.flow);

  const multiplier = receipt?.multiplier ?? selection?.multiplier ?? 0;
  const wager = receipt?.wager ?? ticket;
  const winnings = receipt?.payout ?? ticket * multiplier;

  function resetRoulette() {
    setNumbers(
      numbers.map((num) => {
        return {
          ...num,
          checked: false,
        };
      })
    );
    setSelection("");

    //reset slice class
    let selectedSlices = document.querySelectorAll(".selected");
    selectedSlices.forEach(function (slice) {
      slice.classList.remove("selected");
    });

    resetRound();
    resetFlowForNextRound();
  }

  return (
    <results-box class="flicker-in-2">
      <div className="congrats-text">
        <h1>{isWinner ? "CONGRATS" : "TRY AGAIN"}</h1>
        <div>
          <span className="win-lose">YOU BET</span>
          <h2 className="color-text">
            {wager}
            <span className="or-text">x {multiplier}</span>
          </h2>

          <h3 className="color-text">
            <span className="or-text">YOU GET</span> {winnings.toFixed(3)}
          </h3>
        </div>
      </div>
      <dl className="receipt-grid final-receipt">
        <div>
          <dt>ROLL</dt>
          <dd>{receipt?.result ?? result}</dd>
        </div>
        <div>
          <dt>CALL</dt>
          <dd>{receipt?.contractCall ?? "settleBet()"}</dd>
        </div>
        <div>
          <dt>HASH</dt>
          <dd>{receipt?.txHash ? shortHash(receipt.txHash) : "demo"}</dd>
        </div>
        <div>
          <dt>QRNG</dt>
          <dd>{receipt?.requestId ? shortHash(receipt.requestId) : "fulfilled"}</dd>
        </div>
      </dl>
      <button className="play-again" onClick={resetRoulette}>
        PLAY
        <br />
        AGAIN
      </button>
    </results-box>
  );
}
