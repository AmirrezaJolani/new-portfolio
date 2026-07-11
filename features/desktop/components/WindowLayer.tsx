"use client";

import { createElement } from "react";
import { useWindowManager } from "@/context/WindowManagerContext";
import { appComponents } from "./appRegistry";
import { Window } from "./Window";

export function WindowLayer() {
  const { windows } = useWindowManager();
  return (
    <>
      {windows.map((win) => (
        <Window key={win.id} win={win}>
          {createElement(appComponents[win.appId])}
        </Window>
      ))}
    </>
  );
}
