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

  resetRound: () =>
    set((state) => ({
      ...state,
      wheel: {
        ...state.wheel,
        result: null,
        spinned: false,
        isSpinning: false,
        isWinner: false,
        loadingContract: { status: false, message: "" },
      },
    })),

  writeContract: async () => get().flow.runRouletteFlow(),
});
