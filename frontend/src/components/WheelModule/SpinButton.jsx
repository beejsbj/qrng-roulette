import { useEffect } from "react";
import SpinSvg from "./SpinSvg";
import useStore from "/src/store";

export default function SpinButton(props) {
  const { spinned, isSpinning } = useStore((state) => state.wheel);

  const phaseLabel = {
    "awaiting-signature": "SIGN",
    "tx-submitted": "TX",
    "tx-pending": "TX",
    "tx-confirmed": "LOG",
    "qrng-requested": "QRNG",
    "qrng-fulfilled": "QRNG",
    revealing: "ROLL",
  };

  const label = phaseLabel[props.phase] ?? "SPIN";

  useEffect(() => {
    setTimeout(function () {
      let spinSignLetter = document.querySelector(
        `div.spin-text span:nth-of-type(${Math.floor(Math.random() * 4) + 1})`
      );
      spinSignLetter.classList.add("flicker-animation");
    }, 400);
  }, []);

  return (
    <>
      <button
        onClick={props.buttonHandle}
        className={
          spinned || isSpinning
            ? "button pointer-event"
            : `button ${props.buttonDisabled}`
        }
        id="spin"
      >
        <SpinSvg
          className={spinned || isSpinning ? "spin-text hide" : "spin-text"}
        />
        <div className={spinned || isSpinning ? "spin-text hide" : "spin-text"}>
          {label.split("").map((letter, index) => (
            <span key={`${letter}-${index}`}>{letter}</span>
          ))}
        </div>
        <div
          className={
            spinned || isSpinning
              ? `result ${props.centerResultClass}`
              : "result hide"
          }
        >
          {props.center}
        </div>
      </button>
    </>
  );
}
