import { useEffect } from "react";

import ChooseBox from "./ChooseBox";
import ResultsBox from "./ResultsBox";
import BetPreviewBox from "./BetPreviewBox";
import TransactionStatusBox from "./TransactionStatusBox";
import useStore from "/src/store";

export default function InfoModule(props) {
  const selection = useStore((state) => state.grid.selection);
  const { phase, wallet, getIsRunning } = useStore((state) => state.flow);

  useEffect(() => {
    setTimeout(function () {
      let randomChooseEles = document.querySelectorAll("info-module > * > *");
      let randomChooseEle =
        randomChooseEles[Math.floor(Math.random() * randomChooseEles.length)];
      randomChooseEle.classList.add("flicker-animation2");
    }, 300);
  }, []);

  const isRunning = getIsRunning();
  const isSettled = phase === "settled";
  const canPreview = wallet.status === "connected" && selection;

  return (
    <info-module>
      {isSettled && <ResultsBox resultBanner={props.resultBanner} />}
      {!isSettled && isRunning && <TransactionStatusBox />}
      {!isSettled && !isRunning && canPreview && <BetPreviewBox />}
      {!isSettled && !isRunning && !canPreview && <ChooseBox />}
    </info-module>
  );
}
