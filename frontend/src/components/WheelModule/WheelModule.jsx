import Wheel from "./Wheel";
import SpinButton from "./SpinButton";
import { useEffect, useRef, useState } from "react";
import useStore from "/src/store";
import howler from "howler";
import gsap from "gsap";

// Standard European wheel ring order (clockwise from 0). Used so that the
// last few "ticks" of the landing pass through the winning number's physical
// neighbours on the disc instead of teleporting to it.
const WHEEL_RING = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];
const RING_INDEX = WHEEL_RING.reduce((acc, num, i) => {
  acc[num] = i;
  return acc;
}, {});

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Build the sequence of wheel numbers the center should flash through while it
// decelerates onto `result`. Walks several full + partial laps of the ring so
// the tail visibly settles through the winner's neighbours, landing exactly on
// `result`. Returns an array of wheel numbers ending with `result`.
function buildLandingSequence(result, laps = 0, tail = 13) {
  const end = RING_INDEX[result] ?? 0;
  const steps = laps * WHEEL_RING.length + tail;
  const startIndex = ((end - steps) % WHEEL_RING.length + WHEEL_RING.length) %
    WHEEL_RING.length;

  const sequence = [];
  for (let i = 0; i <= steps; i++) {
    sequence.push(WHEEL_RING[(startIndex + i) % WHEEL_RING.length]);
  }
  return sequence; // first..last, last === result; the tail are ring neighbours
}

// Ease-out delay schedule: fast at the start (~70ms) and progressively
// slower as it approaches the result (~500-650ms on the final ticks).
function landingDelay(progress) {
  const fast = 0.07; // s
  const slow = 0.72; // s
  const eased = Math.pow(progress, 3.2); // power3-ish ease-out toward the end
  return fast + (slow - fast) * eased;
}

export default function WheelModule() {
  const neonBlink = new howler.Howl({
    src: ["/sounds/neon-blink.wav"],
    volume: 0.01,
  });

  const blink = new howler.Howl({
    src: ["/sounds/blink.wav"],
    volume: 0.01,
  });

  const { numbers, selection } = useStore((state) => state.grid);
  const { result, spinned, isSpinning, isWinner } = useStore(
    (state) => state.wheel
  );
  const { wallet, phase, runRouletteFlow, getIsRunning } = useStore(
    (state) => state.flow
  );

  const [colorSliceColor, setColorSliceColor] = useState("");
  const [whiteSliceColor, setWhiteSliceColor] = useState("");
  const [centerResultClass, setCenterResultClass] = useState("");
  const [center, setCenter] = useState(null);

  // gsap handles we need to be able to cancel/clean up
  const spinTickRef = useRef(null); // delayedCall driving the blur-phase flashes
  const landingTweenRef = useRef(null); // delayedCall chain driving the landing
  const wheelSpinRef = useRef(null); // tween controlling disc rotation speed

  //functions

  // --- disc rotation reaction -------------------------------------------
  // The disc has a constant CSS `rotate-wheel 300s linear infinite` drift. We
  // speed that drift up while spinning (by shrinking its animation-duration via
  // a tweened proxy) and ease it back to the 300s idle on settle, instead of
  // fighting the CSS transform with a competing gsap transform.
  function spinUpDisc() {
    const svg = document.querySelector("svg.wheel");
    if (!svg || prefersReducedMotion()) return;

    wheelSpinRef.current?.kill();
    const proxy = { dur: 300 };
    svg.style.animationDuration = "300s";
    wheelSpinRef.current = gsap.to(proxy, {
      dur: 6, // fast drift while the QRNG resolves
      duration: 1.1,
      ease: "power2.in",
      onUpdate: () => {
        svg.style.animationDuration = `${proxy.dur}s`;
      },
    });
  }

  function settleDisc() {
    const svg = document.querySelector("svg.wheel");
    if (!svg) return;

    wheelSpinRef.current?.kill();
    if (prefersReducedMotion()) {
      svg.style.animationDuration = "300s";
      return;
    }
    const current = parseFloat(svg.style.animationDuration) || 60;
    const proxy = { dur: current };
    wheelSpinRef.current = gsap.to(proxy, {
      dur: 300, // back to the calm idle drift
      duration: 2.2,
      ease: "power3.out",
      onUpdate: () => {
        svg.style.animationDuration = `${proxy.dur}s`;
      },
    });
  }

  // --- blur phase: fast roughly-uniform flashing while we wait for QRNG ---
  function startSpinFlashes() {
    stopSpinFlashes();
    if (prefersReducedMotion()) return;

    const tick = () => {
      const i = Math.floor(Math.random() * 37);
      highlight(numbers[i], { silent: false });
      // hold cadence quick (60-95ms) for a blurred, energetic spin-up
      spinTickRef.current = gsap.delayedCall(0.06 + Math.random() * 0.035, tick);
    };
    tick();
  }

  function stopSpinFlashes() {
    spinTickRef.current?.kill();
    spinTickRef.current = null;
  }

  // --- landing: decelerating walk through the ring onto `result` ---------
  function runLanding(resultIndex) {
    stopSpinFlashes();
    landingTweenRef.current?.kill();

    const landed = numbers[resultIndex];

    if (prefersReducedMotion()) {
      highlight(landed, { silent: true });
      flareWinningSlice(landed);
      stampResult();
      settleDisc();
      return;
    }

    const sequence = buildLandingSequence(resultIndex);
    const total = sequence.length;

    const step = (i) => {
      const progress = i / (total - 1);
      const num = numbers[sequence[i]];
      highlight(num, { silent: false });

      if (i >= total - 1) {
        // we are ON the result now — punctuate the reveal
        flareWinningSlice(num);
        stampResult();
        settleDisc();
        return;
      }

      // delay BEFORE the next tick grows as we approach the result
      const delay = landingDelay(progress);
      landingTweenRef.current = gsap.delayedCall(delay, () => step(i + 1));
    };

    step(0);
  }

  // --- reveal punctuation -----------------------------------------------
  // brief flare on the landed slice: a quick brightness/scale pop that settles
  // back, NOT a permanent change. Winner = brighter, triumphant; loss = colder,
  // quicker.
  function flareWinningSlice(num) {
    if (num.number <= 0 || prefersReducedMotion()) return;

    const colorSlice = document.querySelector(
      `#color-slices #slice-${num.number}-color`
    );
    const whiteSlice = document.querySelector(
      `#white-slices #slice-${num.number}`
    );
    const targets = [colorSlice, whiteSlice].filter(Boolean);
    if (!targets.length) return;

    const win = useStore.getState().wheel.isWinner;

    gsap.killTweensOf(targets);
    gsap.fromTo(
      targets,
      { filter: "brightness(1)", scale: 1, transformOrigin: "1000px 1000px" },
      {
        filter: win ? "brightness(2.4)" : "brightness(1.5)",
        scale: win ? 1.06 : 1.025,
        duration: win ? 0.16 : 0.1,
        ease: "power2.out",
        transformOrigin: "1000px 1000px",
        onComplete: () => {
          gsap.to(targets, {
            filter: "brightness(1)",
            scale: 1,
            duration: win ? 0.85 : 0.45,
            ease: win ? "elastic.out(1, 0.55)" : "power2.out",
            transformOrigin: "1000px 1000px",
          });
        },
      }
    );
  }

  // the result number "stamps" in rather than just appearing
  function stampResult() {
    const el = document.querySelector("button#spin .result");
    if (!el || prefersReducedMotion()) return;

    const win = useStore.getState().wheel.isWinner;
    gsap.killTweensOf(el);
    gsap.fromTo(
      el,
      {
        scale: win ? 3.2 : 2.4,
        opacity: 0,
        rotate: win ? -6 : -3,
      },
      {
        scale: 1,
        opacity: 1,
        rotate: 0,
        duration: win ? 0.55 : 0.4,
        ease: win ? "back.out(2.2)" : "back.out(1.4)",
        clearProps: "transform,opacity",
      }
    );
  }

  // --- spin lifecycle ----------------------------------------------------
  // begin the blurred spin-up when isSpinning turns on (QRNG phase)
  useEffect(() => {
    if (isSpinning && !spinned) {
      spinUpDisc();
      startSpinFlashes();
    }
    return () => {
      stopSpinFlashes();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning, spinned]);

  // run the decelerating landing when the round resolves (reveal phase)
  useEffect(() => {
    if (spinned && result !== null && numbers[result]) {
      runLanding(result);
    }
    return () => {
      landingTweenRef.current?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinned, result]);

  // tidy up every gsap handle on unmount
  useEffect(() => {
    return () => {
      spinTickRef.current?.kill();
      landingTweenRef.current?.kill();
      wheelSpinRef.current?.kill();
      const svg = document.querySelector("svg.wheel");
      if (svg) svg.style.animationDuration = "";
    };
  }, []);

  async function buttonHandle() {
    if (wallet.status !== "connected") {
      shakeConnectButton();
      return;
    }

    if (!selection) {
      shakeGrid();
      return;
    }

    if (getIsRunning()) {
      return;
    }

    await runRouletteFlow();
  }

  //highlight number on wheel
  function highlight(num, { silent = false } = {}) {
    setCenter(num.number); //set center number
    if (!silent) neonBlink.play();
    wheelStrokeColor(num);

    document
      .querySelectorAll("#white-slices .slices")
      .forEach(function (slice) {
        slice.classList.remove("selected");
      });
    document
      .querySelectorAll("#color-slices .slices")
      .forEach(function (slice) {
        slice.classList.remove("selected");
      });

    sliceColor(num);
  }
  // change color of wheel to match number
  function wheelStrokeColor(num) {
    setColorSliceColor(`var(--${num.color})`);
    setWhiteSliceColor(`var(--${num.color})`);
    setCenterResultClass(num.color);
  }

  function sliceColor(num) {
    const currentWhiteSlice = document.querySelector(
      `#white-slices #slice-${num.number}`
    );
    const currentColorSlice = document.querySelector(
      `#color-slices #slice-${num.number}-color`
    );
    if (num.number > 0) {
      currentWhiteSlice?.classList.add("selected");
      currentColorSlice?.classList.add("selected");
    }
  }

  //return
  return (
    <wheel-module>
      <Wheel
        colorSliceColor={colorSliceColor}
        whiteSliceColor={whiteSliceColor}
      />

      {/* <Bid /> */}

      <SpinButton
        center={center}
        buttonHandle={buttonHandle}
        buttonDisabled={wallet.status === "connected" ? "" : "disabled"}
        centerResultClass={centerResultClass}
        phase={phase}
      />
    </wheel-module>
  );
}

function shakeGrid() {
  const grid = gsap.timeline({ paused: true, repeat: 1 });
  grid
    .to("numbers-grid", {
      duration: 0.2,
      //   color: "var(--green)",
      filter: "brightness(1.5) saturate(1.5)",
      rotate: 1,
      ease: "power2.in",
    })
    .to("numbers-grid ", {
      duration: 0.2,
      filter: "brightness(1) saturate(1)",
      //   color: "white",
      rotate: 0,
      ease: "power2.in",
    });

  grid.play();
  return;
}
function shakeConnectButton() {
  const connectButton = document.querySelector("button.fake-wallet");
  //  scroll to top
  window.scrollTo(0, 0);
  if (!connectButton) return;
  connectButton.classList.add("wobble-connect");
  setTimeout(() => {
    connectButton.classList.remove("wobble-connect");
  }, 1200);
  return;
}
