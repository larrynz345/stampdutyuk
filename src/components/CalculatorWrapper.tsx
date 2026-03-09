import { Suspense } from "react";
import Calculator from "./Calculator";

export default function CalculatorWrapper({ initialPrice = 0 }: { initialPrice?: number }) {
  return (
    <Suspense>
      <Calculator initialPrice={initialPrice} />
    </Suspense>
  );
}
