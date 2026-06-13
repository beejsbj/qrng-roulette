# Fake Web3 / QRNG Flow Spec

## Intent

QRNG Roulette should feel like a real Web3 roulette dApp whose live backend has been retired, not like a generic client-side randomizer.

The frontend should honestly simulate the old shape of the product:

- A wallet connects.
- A wager is prepared from the selected bet.
- A contract call is submitted.
- A transaction waits for confirmation.
- A QRNG request is emitted.
- A fulfillment event returns the random result.
- The roulette wheel reveals the result.
- The receipt shows win/loss and payout.

No real wallet, contract, API3, or chain dependency should be required for the showcase path.

## Current Flow Problem

The current flow is too thin:

- `frontend/src/store/wheel.jsx` still imports old contract/wagmi pieces, but the active `writeContract` function only starts spinning, waits five seconds, calls `Math.random()`, and sets win/loss.
- `frontend/src/App.jsx` imports `ConnectButton`, but the rendered header currently shows a live-site link instead of a usable wallet surface.
- `frontend/src/components/WheelModule/WheelModule.jsx` gates spin on `useAccount().isConnected`, but `buttonDisabled` is initialized once and does not follow connection changes.
- `frontend/src/components/InfoModule/InfoModule.jsx` only switches between instruction copy and final results, leaving no visible transaction / oracle lifecycle.

The fix is not to restore the dead backend. The fix is to make the simulation explicit, rich, and stateful.

## Product Rule

The app may be fake, but the shape of the fake should be faithful.

Use real dApp vocabulary:

- wallet
- chain
- transaction
- hash
- block
- contract method
- event
- QRNG request
- fulfillment
- payout

Do not over-explain that it is fake inside the main experience. The repo/docs can be honest; the UI should preserve the showcase illusion.

## Proposed User Flow

### 1. Disconnected

Initial state:

- Wallet badge says `CONNECT WALLET`.
- Spin button is available visually but blocked by wallet state.
- Status rail says something compact, like `wallet offline` or `awaiting wallet`.
- Betting grid can still be explored.

Action:

- User clicks connect.

### 2. Connecting

Mock sequence:

- Show a wallet modal-like pulse or inline pending badge.
- Disable spin.
- Delay for roughly 700-1200ms.
- Generate a mock wallet address and balance.

Mock wallet data:

- Address: `0x` plus 40 hex chars, displayed as `0xA4f2...91c8`.
- Chain: `Polygon Mumbai` or a deliberately named `Mumbai Demo`.
- Balance: fixed or lightly randomized `0.083 ETH` / `0.42 MATIC`.

### 3. Connected / Ready

State:

- Wallet badge shows address, balance, and network.
- Status rail says `wallet connected`.
- Spin requires a selected bet.
- Bet amount remains controlled by `Bid`.

The existing selection model should stay central:

- `selection.contractFunction`
- `selection.type`
- `selection.value`
- `selection.multiplier`
- `ticket`

### 4. Bet Prepared

When a selection exists:

- Status rail can preview the pending contract call.
- Example: `betColor(true)` or `betNumber(17)`.
- Show stake and multiplier.

The UI should feel like the transaction is being prepared before spin, not only after click.

### 5. Wallet Confirmation

When user clicks spin:

- Enter `awaiting-signature`.
- Center button text changes from `SPIN` to a short status such as `SIGN`.
- Status rail shows:
  - contract method
  - wager
  - estimated gas

Delay:

- 900-1400ms.

### 6. Transaction Submitted

Enter `tx-submitted`.

Generate:

- `txHash`
- `nonce`
- `gasLimit`
- `gasUsed`
- `requestId`

Status rail:

- Show fake hash truncated.
- Show `submitted`.
- Animate one active step.

Delay:

- 900-1500ms.

### 7. Transaction Pending / Confirmed

Enter `tx-pending`, then `tx-confirmed`.

Generate:

- `blockNumber`, based on a plausible fixed base plus a small increment.
- `confirmations`, count from 0 to 2 or 3.

Status rail:

- `pending in mempool`
- `included in block`
- `2 confirmations`

Delay:

- 1200-2200ms total.

### 8. Contract Event: QRNG Requested

Enter `qrng-requested`.

Status rail:

- Event name: `RequestedRandomness`
- Request id: shortened request id.
- Provider: `API3 QRNG`

Wheel:

- Begin low-intensity roulette scanning.
- Do not reveal the final result yet.

Delay:

- 1000-1600ms.

### 9. QRNG Fulfilled

Enter `qrng-fulfilled`.

Generate final result:

- Use `Math.random()` for now behind a named simulator function.
- Keep the result generation out of component code.
- Store raw mock random words if useful, e.g. `randomWord` and `rolledNumber`.

Status rail:

- Event name: `RandomnessFulfilled`
- Random word truncated.
- Result number ready but not immediately visually landed unless the reveal timing needs it.

Wheel:

- Increase highlight cadence.
- Then decelerate into the final result.

Delay:

- 1800-3000ms for the reveal, depending on animation feel.

### 10. Settled / Receipt

Enter `settled`.

State:

- `result`
- `isWinner`
- `payout`
- `receipt`

Result panel should include:

- win/loss
- selected bet
- result number
- multiplier
- wager
- payout
- tx hash
- block number
- QRNG request id

Primary action:

- `PLAY AGAIN`

Reset should clear:

- selected numbers
- wheel result
- flow phase
- receipt
- highlighted slices

Wallet can remain connected.

## State Machine

Suggested phases:

```js
const phases = {
  disconnected: "disconnected",
  connecting: "connecting",
  connected: "connected",
  betReady: "bet-ready",
  awaitingSignature: "awaiting-signature",
  txSubmitted: "tx-submitted",
  txPending: "tx-pending",
  txConfirmed: "tx-confirmed",
  qrngRequested: "qrng-requested",
  qrngFulfilled: "qrng-fulfilled",
  revealing: "revealing",
  settled: "settled",
  error: "error",
};
```

Derived checks:

- `canConnect`: `phase === "disconnected"`
- `canSelectBet`: connected-ish and not in a running transaction
- `canSpin`: wallet connected, selection exists, not running, not settled
- `isRunning`: from `awaiting-signature` through `revealing`
- `showReceipt`: `phase === "settled"`

## Store Shape

Add a dedicated simulator slice rather than overloading `wheel`.

Suggested files:

- `frontend/src/store/session.jsx` for fake wallet/session state.
- `frontend/src/store/flow.jsx` for transaction/QRNG lifecycle.
- Or one `frontend/src/store/demoFlow.jsx` if keeping the store smaller matters more.

Suggested state:

```js
{
  wallet: {
    status: "disconnected",
    address: null,
    displayAddress: null,
    chainName: "Mumbai Demo",
    balance: null
  },
  flow: {
    phase: "disconnected",
    steps: [],
    activeStep: null,
    txHash: null,
    blockNumber: null,
    requestId: null,
    randomWord: null,
    receipt: null,
    error: null
  }
}
```

Keep `grid` responsible for bet selection.

Keep `wheel` responsible for result and reveal primitives.

Let the flow orchestrator call into `wheel` once the QRNG mock is fulfilled.

## Simulator Helpers

Create small pure helpers so the fake data feels consistent:

- `randomHex(bytes)`
- `shortHash(hash)`
- `createMockWallet()`
- `createMockTransaction({ selection, ticket })`
- `createMockQrngRequest(txHash)`
- `settleRoulette({ result, numbers, selection, ticket })`
- `wait(ms)`
- `waitRange(min, max)`

Suggested location:

- `frontend/src/lib/demoWeb3.js`

These helpers make the fake honest and easier to test.

## Component Changes

### `App.jsx`

Replace the current live-site link wallet area with a mock wallet component.

Potential component:

- `frontend/src/components/FakeWalletButton.jsx`

It should:

- connect/disconnect mock wallet
- show network/address/balance
- match neon button styling
- avoid RainbowKit dependency for the showcase flow

### `WheelModule.jsx`

Remove direct dependency on `useAccount`.

Spin should ask the flow store:

- Is wallet connected?
- Is a selection present?
- Is a transaction already running?

The button should shake the wallet or grid depending on what is missing.

### `SpinButton.jsx`

Button center text should respond to phase:

- `SPIN`
- `SIGN`
- `TX`
- `QRNG`
- result number

Keep the current center-result reveal, but make the intermediate labels part of the fake dApp suspense.

### `InfoModule.jsx`

Turn this into a phase-aware panel:

- No selection: show current `ChooseBox`.
- Selection ready: show bet preview / contract method.
- Running: show transaction and QRNG status rail.
- Settled: show enhanced `ResultsBox`.

Potential new components:

- `BetPreviewBox.jsx`
- `TransactionStatusBox.jsx`
- `ReceiptBox.jsx` or expand `ResultsBox.jsx`

### `ResultsBox.jsx`

Add receipt details without overcrowding:

- result
- win/loss
- payout
- tx hash
- block
- request id

Use truncation for hashes and small neon labels.

## Animation Direction

The flow should make animation meaningful:

- Wallet connect: short glow ignition.
- Awaiting signature: button pulse, no wheel spin.
- Tx pending: subtle board dim and status rail activity.
- QRNG requested: wheel starts scanning slowly.
- QRNG fulfilled: scanning accelerates.
- Revealing: cadence decelerates and lands on result.
- Settled: final result glow pulses in the winning/losing color.

Avoid random flicker everywhere. Use flicker as state feedback:

- blue/pink for ambient casino.
- green for selected/confirmed/success.
- red/pink for rejected/loss/attention.

## Timing Defaults

Keep the full flow dramatic but not sluggish.

Recommended total from click to result:

- Fast path: 5.5-7s.
- Slower dramatic path: 8-10s.

Suggested timing:

- signature: 1000ms
- tx submit: 900ms
- tx pending: 1400ms
- confirmations: 900ms
- QRNG request: 1200ms
- fulfillment/reveal: 2200ms

Add one tiny variance function so the flow does not feel mechanically identical each round.

## Payout Logic

Current win logic can remain simple:

- Result maps to one of `numbers`.
- If `numbers[result].checked`, user wins.
- Payout is `ticket * selection.multiplier`.

But move it into a named helper:

```js
settleRoulette({ result, numbers, selection, ticket })
```

This keeps the result calculation readable and separates game settlement from UI.

## Implementation Slices

### Slice 1: Mock Wallet

- Add fake wallet store state.
- Add `FakeWalletButton`.
- Remove visible dependence on RainbowKit for the main showcase flow.
- Keep old deps untouched unless cleanup is explicitly desired.

Verification:

- Connect/disconnect works.
- Spin blocks when disconnected.
- Wallet remains connected after play again.

### Slice 2: Flow State Machine

- Add demo Web3 helpers.
- Replace `wheel.writeContract` with named simulated lifecycle.
- Generate tx hash, block, request id, random word, receipt.

Verification:

- All phases progress in order.
- Selection metadata appears in the mocked contract call.
- Result and payout match selected bet.

### Slice 3: Status Rail

- Add phase-aware `InfoModule` states.
- Show bet preview, running transaction, QRNG event, and final receipt.

Verification:

- No text overflow on mobile.
- Hashes truncate cleanly.
- The panel does not fight the roulette wheel for visual priority.

### Slice 4: Reveal Timing

- Tie wheel highlight cadence to phases.
- Make QRNG fulfillment lead into final result.
- Avoid direct DOM timing leaks where possible.

Verification:

- Wheel never lands before `qrng-fulfilled`.
- Play again clears highlights and receipt.
- Repeated spins do not leave intervals running.

## Verification Notes

Local build currently needs dependencies installed. Initial investigation found no `node_modules` at repo root or `frontend/`, and `npm run build` in `frontend/` failed with `sh: vite: command not found`.

Before implementation verification:

```bash
npm install
npm run build --workspace qrng-roulette-frontend
```

Or from `frontend/`:

```bash
npm install
npm run build
```

After implementation, run the Vite dev server and manually verify:

- mobile viewport around 390px wide
- tablet around 768px wide
- desktop above 1200px wide
- repeated play-again cycles
- disconnected spin attempt
- connected spin with no bet
- connected spin with number, color, half, third, odd/even bets

## Open Design Questions For Later

- Should the fake chain be named exactly `Polygon Mumbai`, or a softer `Mumbai Demo` to avoid implying live chain use?
- Should loss receipts show a fake failed payout event, or only the settled transaction and zero payout?
- Should the old RainbowKit dependencies remain for historical continuity, or be removed from the final showcase path?
- Should the UI explicitly label itself as a simulation somewhere outside the main roulette surface, such as README/About, while preserving the in-app illusion?
