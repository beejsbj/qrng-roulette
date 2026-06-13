const HEX = "0123456789abcdef";

export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function waitRange(min, max) {
  return wait(Math.floor(min + Math.random() * (max - min)));
}

export function randomHex(bytes) {
  return Array.from({ length: bytes * 2 }, () => HEX[Math.floor(Math.random() * HEX.length)]).join("");
}

export function shortHash(hash, start = 6, end = 4) {
  if (!hash) return "";
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
}

export function createMockWallet() {
  const address = `0x${randomHex(20)}`;
  const balance = (0.08 + Math.random() * 0.19).toFixed(3);

  return {
    address,
    displayAddress: shortHash(address),
    chainName: "Mumbai Demo",
    balance: `${balance} MATIC`,
  };
}

export function formatContractCall(selection) {
  if (!selection) return "selectBet()";

  if (selection.type === "number") {
    return `${selection.contractFunction}(${selection.value})`;
  }

  return `${selection.contractFunction}(${String(selection.value)})`;
}

export function createMockTransaction({ selection, ticket }) {
  const gasLimit = 184000 + Math.floor(Math.random() * 24000);
  const gasUsed = gasLimit - Math.floor(Math.random() * 9000);

  return {
    txHash: `0x${randomHex(32)}`,
    nonce: 8 + Math.floor(Math.random() * 91),
    gasLimit,
    gasUsed,
    contractCall: formatContractCall(selection),
    wager: Number(ticket || 0),
  };
}

export function createMockQrngRequest(txHash) {
  return {
    requestId: `0x${randomHex(16)}`,
    provider: "API3 QRNG",
    seed: txHash ? txHash.slice(-10) : randomHex(5),
  };
}

export function createMockFulfillment() {
  const randomWord = `0x${randomHex(32)}`;
  const result = Number.parseInt(randomWord.slice(-8), 16) % 37;

  return {
    randomWord,
    result,
  };
}

export function settleRoulette({ result, numbers, selection, ticket }) {
  const landedNumber = numbers.find((item) => item.number === result);
  const isWinner = Boolean(landedNumber?.checked);
  const multiplier = selection?.multiplier ?? 0;
  const wager = Number(ticket || 0);
  const payout = isWinner ? wager * multiplier : 0;

  return {
    isWinner,
    payout,
    wager,
    multiplier,
    result,
    betType: selection?.type ?? "none",
    contractCall: formatContractCall(selection),
  };
}
