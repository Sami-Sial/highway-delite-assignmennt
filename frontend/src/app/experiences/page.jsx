import Experiences from "./experiences";
import { Suspense } from "react";

const page = () => {
  return (
    <>
      <Suspense>
        <Experiences />
      </Suspense>
    </>
  );
};

export default page;
