import { useState } from "react";

type UseTemplateComponent = {
  state: {
    count: number;
  };
  handlers: {
    handleCountIncrement: () => void;
    handleCountDecrement: () => void;
    handleCountReset: () => void;
  };
};

export const useTemplateComponent = (): UseTemplateComponent => {
  const [count, setCount] = useState<number>(0);

  const handleCountIncrement = () => {
    setCount((prev) => prev + 1);
  };

  const handleCountDecrement = () => {
    setCount((prev) => prev - 1);
  };

  const handleCountReset = () => {
    setCount(0);
  };

  return {
    state: {
      count,
    },
    handlers: {
      handleCountIncrement,
      handleCountDecrement,
      handleCountReset,
    },
  };
};
