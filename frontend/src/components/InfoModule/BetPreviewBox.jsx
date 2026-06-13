import { formatContractCall } from "/src/lib/demoWeb3";
import useStore from "/src/store";

export default function BetPreviewBox() {
  const { selection, ticket } = useStore((state) => state.grid);
  const wallet = useStore((state) => state.flow.wallet);

  const multiplier = selection?.multiplier ?? 0;
  const wager = Number(ticket || 0);

  return (
    <bet-preview-box className="flicker-in-2">
      <p className="module-kicker">CONTRACT READY</p>
      <h2 className="contract-call">{formatContractCall(selection)}</h2>
      <dl className="receipt-grid">
        <div>
          <dt>WALLET</dt>
          <dd>{wallet.displayAddress}</dd>
        </div>
        <div>
          <dt>STAKE</dt>
          <dd>{wager} chip</dd>
        </div>
        <div>
          <dt>MULT</dt>
          <dd>{multiplier}x</dd>
        </div>
        <div>
          <dt>MAX PAY</dt>
          <dd>{(wager * multiplier).toFixed(3)}</dd>
        </div>
      </dl>
      <p className="status-line">awaiting signature</p>
    </bet-preview-box>
  );
}
