import useStore from "/src/store";

export default function FakeWalletButton() {
  const { wallet, phase, connectWallet, disconnectWallet } = useStore(
    (state) => state.flow
  );

  const isConnecting = wallet.status === "connecting" || phase === "connecting";
  const isConnected = wallet.status === "connected";

  if (isConnected) {
    return (
      <div className="wallet-wrapper fake-wallet-wrapper">
        <button className="button picture wallet-network" type="button">
          <span className="network-dot" aria-hidden="true" />
          {wallet.chainName}
        </button>
        <button
          className="button fake-wallet connected"
          onClick={disconnectWallet}
          type="button"
          title="Disconnect mock wallet"
        >
          <span>{wallet.displayAddress}</span>
          <span className="balance">({wallet.balance})</span>
        </button>
      </div>
    );
  }

  return (
    <div className="connect-wrapper fake-wallet-wrapper">
      <div></div>
      <button
        className={`button connect fake-wallet heartbeat ${isConnecting ? "connecting" : ""}`}
        disabled={isConnecting}
        onClick={connectWallet}
        type="button"
      >
        {isConnecting ? "CONNECTING" : "CONNECT WALLET"}
      </button>
    </div>
  );
}
