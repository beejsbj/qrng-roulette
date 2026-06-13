import Wheel from "./Wheel";
import SpinButton from "./SpinButton";
import { useEffect, useRef, useState } from "react";
import useStore from "/src/store";
import howler from "howler";
import gsap from "gsap";

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
  const { result, spinned, isSpinning } = useStore((state) => state.wheel);
  const { wallet, phase, runRouletteFlow, getIsRunning } = useStore(
    (state) => state.flow
  );

  const [colorSliceColor, setColorSliceColor] = useState("");
  const [whiteSliceColor, setWhiteSliceColor] = useState("");
  const [centerResultClass, setCenterResultClass] = useState("");
  const [center, setCenter] = useState(null);
  const animationId = useRef(null);
  const frameTime = 200;

  //functions

  useEffect(() => {
    if (isSpinning && !spinned) {
      animationId.current = setInterval(animations, frameTime);
    }
    if (!isSpinning && spinned) {
      clearInterval(animationId.current);
      highlight(numbers[result]);
    }

    return () => clearInterval(animationId.current);
  }, [isSpinning, spinned, result]);

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

  function animations() {
    // highlight the animation at the moment timePassed
    const i = Math.floor(Math.random() * 37);
    highlight(numbers[i]);
  }

  //highlight number on wheel
  function highlight(num) {
    setCenter(num.number); //set center number
    //   num.number % 2 === 0 ? neonBlink.play() : blink.play();
    neonBlink.play();
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
      currentWhiteSlice.classList.add("selected");
      currentColorSlice.classList.add("selected");
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
