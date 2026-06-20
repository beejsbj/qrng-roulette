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
  activeRunId: null,
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

function createRunId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function snapshotBet({ selection, ticket, numbers }) {
  return {
    selection: selection ? { ...selection } : null,
    ticket: Number(ticket || 0),
    numbers: numbers.map(({ number, checked, color }) => ({
      number,
      checked,
      color,
    })),
  };
}

function isRunActive(get, runId) {
  const { activeRunId, wallet } = get().flow;
  return activeRunId === runId && wallet.status === "connected";
}

async function waitForActiveRun(get, runId, min, max) {
  await waitRange(min, max);
  return isRunActive(get, runId);
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
    const submittedBet = snapshotBet(grid);
    const { selection, ticket, numbers } = submittedBet;

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

    const runId = createRunId();

    wheel.resetRound();

    mergeFlow(set, {
      ...initialFlowState,
      wallet: get().flow.wallet,
      activeRunId: runId,
      phase: "awaiting-signature",
      activeStep: "signature",
      contractCall: null,
      error: null,
    });

    if (!(await waitForActiveRun(get, runId, 700, 1000))) return;

    const tx = createMockTransaction({ selection, ticket });
    mergeFlow(set, {
      phase: "tx-submitted",
      activeStep: "transaction",
      ...tx,
    });

    if (!(await waitForActiveRun(get, runId, 700, 950))) return;

    mergeFlow(set, {
      phase: "tx-pending",
      activeStep: "confirmation",
      confirmations: 1,
    });

    if (!(await waitForActiveRun(get, runId, 550, 800))) return;

    mergeFlow(set, {
      phase: "tx-confirmed",
      blockNumber: 49382000 + Math.floor(Math.random() * 80000),
      confirmations: 3,
    });

    if (!(await waitForActiveRun(get, runId, 500, 750))) return;

    // QRNG request: the disc spins up and the centre starts its blurred flash.
    const qrngRequest = createMockQrngRequest(tx.txHash);
    if (!isRunActive(get, runId)) return;
    wheel.setIsSpinning(true);
    mergeFlow(set, {
      phase: "qrng-requested",
      activeStep: "qrng",
      ...qrngRequest,
    });

    if (!(await waitForActiveRun(get, runId, 700, 950))) return;

    // QRNG fulfilled: the winning index is now decided; the wheel keeps blurring
    // until the reveal step kicks off the decelerating landing onto it.
    const fulfillment = createMockFulfillment();
    mergeFlow(set, {
      phase: "qrng-fulfilled",
      randomWord: fulfillment.randomWord,
    });

    if (!(await waitForActiveRun(get, runId, 700, 950))) return;

    const settlement = settleRoulette({
      result: fulfillment.result,
      numbers,
      selection,
      ticket,
    });

    if (!isRunActive(get, runId)) return;
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
    if (!(await waitForActiveRun(get, runId, 2650, 2900))) return;

    mergeFlow(set, {
      phase: "settled",
      activeRunId: null,
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
