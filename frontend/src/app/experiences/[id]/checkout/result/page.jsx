import Bookingresult from "./result";
import { Suspense } from "react";

const page = () => {
  return (
    <>
      <Suspense>
        <Bookingresult />
      </Suspense>
    </>
  );
};

export default page;
