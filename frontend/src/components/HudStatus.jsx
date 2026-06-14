import useStore from "/src/store";

export default function HudStatus() {
  const { provider, blockNumber, phase, wallet, getIsRunning } = useStore(
    (state) => state.flow
  );

  const running = getIsRunning();
  const state = running
    ? "live"
    : wallet.status === "connected"
    ? "ready"
    : "offline";
  const stateLabel =
    state === "live" ? "LIVE" : state === "ready" ? "READY" : "OFFLINE";

  return (
    <div className="hud-readout" role="status">
      <span className={`hud-stat hud-state ${state}`}>
        <span className="hud-dot" aria-hidden="true" />
        {stateLabel}
      </span>
      <span className="hud-stat hud-oracle">API3 · AIRNODE QRNG</span>
      <span className="hud-stat">{wallet.chainName ?? "Mumbai Testnet"}</span>
      <span className="hud-stat hud-mono">
        BLK {blockNumber ? `#${blockNumber}` : "—"}
      </span>
      <span className="hud-stat hud-phase hud-mono">{phase ?? "idle"}</span>
    </div>
  );
}
