import tokenContract from "../contracts/roulette.json";
import { ethers } from "ethers";
import {
  prepareWriteContract,
  writeContract,
  waitForTransaction,
  getContract,
  watchContractEvent,
} from "@wagmi/core";

export const wheel = (set, get) => ({
  result: null,
  spinned: false, // bolean telling if wheel has been spinned
  isSpinning: false, // boolean telling if wheel is spinning
  isWinner: false, // boolean telling if the result is a winner

  loadingContract: { status: false, message: "" },

  setResult: (result) =>
    set((state) => ({
      ...state,
      wheel: {
        ...state.wheel,
        result,
      },
    })),

  setSpinned: (spinned) =>
    set((state) => ({
      ...state,
      wheel: {
        ...state.wheel,
        spinned,
      },
    })),

  setIsSpinning: (isSpinning) =>
    set((state) => ({
      ...state,
      wheel: {
        ...state.wheel,
        isSpinning,
      },
    })),

  setIsWinner: (isWinner) =>
    set((state) => ({
      ...state,
      wheel: {
        ...state.wheel,
        isWinner,
      },
    })),

  setLoadingContract: (loadingContract) =>
    set((state) => ({
      ...state,
      wheel: {
        ...state.wheel,
        loadingContract,
      },
    })),

  writeContract: async () => {
    const { selection, numbers, ticket } = get().grid;
    const { setIsSpinning, setResult, setSpinned, setIsWinner } = get().wheel;
    const { contractAddress } = get();

    setIsSpinning(true);

    await new Promise((r) => setTimeout(r, 5000));

    setIsSpinning(false);
    setSpinned(true);

    const result = Math.floor(Math.random() * 37);
    setResult(result);

    const found = numbers.find((item) => item.number === result);
    setIsWinner(found.checked);
  },
});
