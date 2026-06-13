# QRNG Roulette Design Handoff

## Purpose

This is a handoff prompt for a Claude/Opus design pass on QRNG Roulette.

The app should remain a faithful showcase of the existing QRNG Roulette idea: a neon casino roulette frontend that feels like a real Web3/QRNG dApp, even though API3 and the original contract backend are no longer live.

Do not invent a new product direction. Deepen what is already here.

## Current Repo State

- Repo: `/Users/burooj/Projects/qrng-roulette`
- Main app: `frontend/`
- Framework: Vite + React + Zustand
- Current deployed showcase: `https://qrng-roulette.vercel.app`
- Current branch at handoff creation: `main`
- Dirty state at handoff creation: clean

Important files to inspect:

- `frontend/src/App.jsx`
- `frontend/src/components/Roulette.jsx`
- `frontend/src/components/WheelModule/WheelModule.jsx`
- `frontend/src/components/WheelModule/SpinButton.jsx`
- `frontend/src/components/WheelModule/Bid.jsx`
- `frontend/src/components/NumbersGrid/NumbersGrid.jsx`
- `frontend/src/components/InfoModule/InfoModule.jsx`
- `frontend/src/components/InfoModule/ChooseBox.jsx`
- `frontend/src/components/InfoModule/ResultsBox.jsx`
- `frontend/src/store/wheel.jsx`
- `frontend/src/store/grid.jsx`
- `frontend/src/styles/site.css`
- `frontend/src/styles/settings.css`
- `frontend/src/styles/roulette-module.css`
- `frontend/src/styles/wheel.css`
- `frontend/src/styles/numbers-grid.css`
- `frontend/src/styles/info-module.css`
- `frontend/src/styles/animation.css`

## Existing Visual Direction

The current app already has a strong identity:

- Neon wall / casino atmosphere.
- Tourney display typography.
- Glowing roulette SVG.
- Pink/blue/green electric palette.
- Betting grid with selectable numbers, colors, halves, thirds, odd/even.
- Audio blips and flickering neon effects.
- Center spin button and final result reveal.

The desired design pass should smooth, strengthen, and mature those ideas.

## Product/Fake Flow Context

The app should feel like a Web3 QRNG roulette dApp showcase, not a stripped-down random toy.

The future fake flow should roughly feel like:

1. Fake wallet connect.
2. Bet selection and stake amount.
3. Mocked transaction submission.
4. Pending transaction state.
5. Fake transaction hash / block confirmation.
6. Mocked contract method call based on the selected bet.
7. Mocked QRNG request.
8. Mocked QRNG fulfillment event.
9. Roulette spin/reveal.
10. Win/loss and payout receipt.

Design improvements should leave room for this flow. They should not make the app feel less dApp-like.

## Ask For Claude

Generate exactly 4 design/frontend improvement proposals.

Each proposal should:

1. Smooth out or deepen an existing idea.
2. Avoid replacing the app with a new visual concept.
3. Be implementation-ready.
4. Include file-level evidence from the current code.
5. Include concrete frontend/CSS/interaction notes.
6. Explain why the change preserves and strengthens the current QRNG Roulette identity.

Focus areas:

- Neon realism and light behavior.
- Animation timing and sequencing beyond stock pasted effects.
- Roulette interaction and result reveal.
- Fake Web3 / QRNG feedback affordances.
- Responsive layout and text fit.
- Visual hierarchy of betting, wheel, status, and result areas.
- Reducing brittleness while preserving the handmade neon-casino feel.

Avoid:

- A new landing page.
- Generic SaaS panels.
- A clean white/neutral redesign.
- Replacing the neon casino style.
- Stripping out Web3/QRNG language.
- Making it feel like an ordinary random-number game.
- Broad aesthetic moodboards without implementation guidance.

## Suggested Output Format

Return exactly 4 sections:

```markdown
## 1. <Improvement Title>

Current issue/opportunity:
<Use file references and explain what is happening now.>

Implementation notes:
<Concrete component/style/state changes.>

Why this deepens the current idea:
<Explain how it preserves the existing QRNG Roulette concept.>
```

Repeat for items 2-4.

## Notes From Initial Investigation

- `App.jsx` imports `ConnectButton` and reads `useAccount`, but currently renders a "Go to Live Site" link instead of a visible wallet connect surface.
- `WheelModule.jsx` gates spin behavior on `isConnected`, but `buttonDisabled` is initialized once and not updated when connection state changes.
- `wheel.jsx` still imports real `ethers`, wagmi contract helpers, and the contract artifact, but the active `writeContract` function is now a simulated delay plus `Math.random()`.
- The existing selection model is useful: selections already carry `contractFunction`, `type`, `value`, and `multiplier`.
- `InfoModule` currently switches between instructional copy and the final result. It is a natural place to evolve into a transaction / QRNG status rail.
- Mobile styles currently use scale transforms on `info-module`, which can preserve layout visually but may make text fit and hierarchy feel less deliberate.

## Handoff Prompt

Copy/paste this into Claude:

```text
You are reviewing /Users/burooj/Projects/qrng-roulette as a frontend/design refinement advisor. Do not edit files unless explicitly asked.

First inspect the current app source and styles enough to understand the existing visual idea: neon casino wall, Tourney typography, glowing roulette SVG, betting grid, sound/flicker effects, and fake Web3/QRNG showcase.

Generate exactly 4 design/frontend improvement proposals.

Constraint: smooth out and deepen the current ideas instead of inventing a new direction. Preserve the faithful QRNG Roulette showcase feel. The point is not to make a new app; it is to make this app feel more intentional, polished, and believable.

Pay special attention to:
- Neon realism and light behavior.
- Animation timing and sequencing beyond stock/pasted animation effects.
- Roulette interaction and result reveal.
- Fake wallet / mocked transaction / mocked QRNG feedback affordances.
- Responsive layout and text fit.
- Visual hierarchy of betting, wheel, status, and result areas.

The app should feel like a simulated Web3 QRNG roulette dApp: fake wallet connect, mocked transaction submission, pending states, fake transaction hash, mocked contract call, mocked event/QRNG fulfillment, final spin/result/win/loss. Do not strip it down into a random-number toy.

For each of the 4 proposals include:
1. Title.
2. Current issue/opportunity with file evidence.
3. Concrete implementation notes.
4. Why it preserves and deepens the current concept.

Avoid generic redesign advice, moodboards, landing-page ideas, SaaS panels, or replacing the neon casino direction.
```
