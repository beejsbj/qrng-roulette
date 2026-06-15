import TitleSign from "./TitleSign";
import NumbersGrid from "./NumbersGrid/NumbersGrid";
import WheelModule from "./WheelModule/WheelModule";
import InfoModule from "./InfoModule/InfoModule";
import Bid from "./WheelModule/Bid";

export default function Roulette() {
  return (
    <roulette-module>
      <TitleSign />
      <Bid />
      <NumbersGrid />
      <WheelModule />
      <InfoModule />
    </roulette-module>
  );
}
