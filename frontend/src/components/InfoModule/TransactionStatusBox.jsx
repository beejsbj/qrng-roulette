import { shortHash } from "/src/lib/demoWeb3";
import useStore from "/src/store";

const steps = [
  { id: "signature", label: "SIGN" },
  { id: "transaction", label: "TX" },
  { id: "confirmation", label: "BLOCK" },
  { id: "qrng", label: "QRNG" },
  { id: "reveal", label: "ROLL" },
];

const stepIndex = {
  signature: 0,
  transaction: 1,
  confirmation: 2,
  qrng: 3,
  reveal: 4,
  receipt: 5,
};

const phaseCopy = {
  "awaiting-signature": "wallet confirmation",
  "tx-submitted": "transaction submitted",
  "tx-pending": "waiting for block",
  "tx-confirmed": "contract event indexed",
  "qrng-requested": "randomness requested",
  "qrng-fulfilled": "oracle fulfilled",
  revealing: "roulette resolving",
};

export default function TransactionStatusBox() {
  const flow = useStore((state) => state.flow);
  const currentIndex = stepIndex[flow.activeStep] ?? 0;

  return (
    <transaction-status-box className="flicker-in-2">
      <p className="module-kicker">LIVE CONTRACT TRACE</p>
      <h2 className="contract-call">{phaseCopy[flow.phase] ?? "preparing"}</h2>

      <ol className="flow-steps">
        {steps.map((step, index) => (
          <li
            className={
              index < currentIndex
                ? "complete"
                : index === currentIndex
                ? "active"
                : ""
            }
            key={step.id}
          >
            {step.label}
          </li>
        ))}
      </ol>

      <dl className="receipt-grid">
        <div>
          <dt>CALL</dt>
          <dd>{flow.contractCall ?? "prepareBet()"}</dd>
        </div>
        <div>
          <dt>HASH</dt>
          <dd>{flow.txHash ? shortHash(flow.txHash) : "pending"}</dd>
        </div>
        <div>
          <dt>BLOCK</dt>
          <dd>{flow.blockNumber ?? "..."}</dd>
        </div>
        <div>
          <dt>REQ</dt>
          <dd>{flow.requestId ? shortHash(flow.requestId) : "queued"}</dd>
        </div>
      </dl>

      <p className="status-line">
        {flow.provider ?? "Mumbai Demo"} / {flow.confirmations} confirmations
      </p>
    </transaction-status-box>
  );
}
