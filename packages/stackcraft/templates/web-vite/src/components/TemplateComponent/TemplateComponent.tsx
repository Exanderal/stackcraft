import React from "react";
import { useTemplateComponent } from "./TemplateComponent.behaviour";

export const TemplateComponent = () => {
  const { state, handlers } = useTemplateComponent();
  return (
    <div>
      <div>Count: {state.count}</div>
      <button onClick={handlers.handleCountIncrement}>Increment</button>
      <button onClick={handlers.handleCountDecrement}>Decrement</button>
      <button onClick={handlers.handleCountReset}>Reset</button>
    </div>
  );
};
