import {
  createMockFulfillment,
  createMockQrngRequest,
  createMockTransaction,
  createMockWallet,
  settleRoulette,
  waitRange,
} from "../lib/demoWeb3";

const initialWallet = {
  status: "disconnected",
  address: null,
  displayAddress: null,
  chainName: "Mumbai Demo",
  balance: null,
};

const initialFlowState = {
  phase: "disconnected",
  activeStep: null,
  txHash: null,
  nonce: null,
  gasLimit: null,
  gasUsed: null,
  contractCall: null,
  blockNumber: null,
  confirmations: 0,
  requestId: null,
  provider: null,
  randomWord: null,
  receipt: null,
  error: null,
};

const runningPhases = [
  "awaiting-signature",
  "tx-submitted",
  "tx-pending",
  "tx-confirmed",
  "qrng-requested",
  "qrng-fulfilled",
  "revealing",
];

function mergeFlow(set, updates) {
  set((state) => ({
    ...state,
    flow: {
      ...state.flow,
      ...updates,
    },
  }));
}

export const flow = (set, get) => ({
  ...initialFlowState,
  wallet: initialWallet,

  getIsWalletConnected: () => get().flow.wallet.status === "connected",
  getIsRunning: () => runningPhases.includes(get().flow.phase),

  connectWallet: async () => {
    const current = get().flow;
    if (current.wallet.status === "connected" || current.wallet.status === "connecting") {
      return;
    }

    mergeFlow(set, {
      phase: "connecting",
      activeStep: "wallet",
      wallet: {
        ...initialWallet,
        status: "connecting",
      },
      error: null,
    });

    await waitRange(700, 1200);

    const wallet = createMockWallet();

    mergeFlow(set, {
      ...initialFlowState,
      phase: "connected",
      activeStep: "wallet",
      wallet: {
        ...wallet,
        status: "connected",
      },
    });
  },

  disconnectWallet: () => {
    const { resetRound } = get().wheel;

    resetRound();
    mergeFlow(set, {
      ...initialFlowState,
      phase: "disconnected",
      activeStep: null,
      wallet: initialWallet,
    });
  },

  resetFlowForNextRound: () => {
    const wallet = get().flow.wallet;

    mergeFlow(set, {
      ...initialFlowState,
      phase: wallet.status === "connected" ? "connected" : "disconnected",
      activeStep: wallet.status === "connected" ? "wallet" : null,
      wallet,
    });
  },

  runRouletteFlow: async () => {
    const { grid, wheel } = get();
    const { selection, ticket, numbers } = grid;

    if (get().flow.wallet.status !== "connected") {
      mergeFlow(set, {
        activeStep: "wallet",
        error: "Connect wallet first",
      });
      return;
    }

    if (!selection) {
      mergeFlow(set, {
        activeStep: "bet",
        error: "Choose a bet first",
      });
      return;
    }

    if (runningPhases.includes(get().flow.phase)) {
      return;
    }

    wheel.resetRound();

    mergeFlow(set, {
      ...initialFlowState,
      wallet: get().flow.wallet,
      phase: "awaiting-signature",
      activeStep: "signature",
      contractCall: null,
      error: null,
    });

    await waitRange(700, 1000);

    const tx = createMockTransaction({ selection, ticket });
    mergeFlow(set, {
      phase: "tx-submitted",
      activeStep: "transaction",
      ...tx,
    });

    await waitRange(700, 950);

    mergeFlow(set, {
      phase: "tx-pending",
      activeStep: "confirmation",
      confirmations: 1,
    });

    await waitRange(550, 800);

    mergeFlow(set, {
      phase: "tx-confirmed",
      blockNumber: 49382000 + Math.floor(Math.random() * 80000),
      confirmations: 3,
    });

    await waitRange(500, 750);

    // QRNG request: the disc spins up and the centre starts its blurred flash.
    const qrngRequest = createMockQrngRequest(tx.txHash);
    wheel.setIsSpinning(true);
    mergeFlow(set, {
      phase: "qrng-requested",
      activeStep: "qrng",
      ...qrngRequest,
    });

    await waitRange(700, 950);

    // QRNG fulfilled: the winning index is now decided; the wheel keeps blurring
    // until the reveal step kicks off the decelerating landing onto it.
    const fulfillment = createMockFulfillment();
    mergeFlow(set, {
      phase: "qrng-fulfilled",
      randomWord: fulfillment.randomWord,
    });

    await waitRange(700, 950);

    const settlement = settleRoulette({
      result: fulfillment.result,
      numbers,
      selection,
      ticket,
    });

    mergeFlow(set, {
      phase: "revealing",
      activeStep: "reveal",
    });

    wheel.setResult(fulfillment.result);
    wheel.setIsWinner(settlement.isWinner);
    wheel.setIsSpinning(false);
    wheel.setSpinned(true);

    // Hold here while the decelerating landing (~2.6s) plays out, so the result
    // panel only surfaces once the wheel has visibly settled on the number.
    await waitRange(2650, 2900);

    mergeFlow(set, {
      phase: "settled",
      activeStep: "receipt",
      receipt: {
        ...settlement,
        txHash: tx.txHash,
        blockNumber: get().flow.blockNumber,
        requestId: qrngRequest.requestId,
        randomWord: fulfillment.randomWord,
        provider: qrngRequest.provider,
      },
    });
  },
});
