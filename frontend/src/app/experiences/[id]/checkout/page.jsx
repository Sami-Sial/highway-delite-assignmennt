import Checkout from "./checkout";
import { Suspense } from "react";
const page = () => {
  return (
    <>
      <Suspense>
        <Checkout />
      </Suspense>
    </>
  );
};

export default page;
