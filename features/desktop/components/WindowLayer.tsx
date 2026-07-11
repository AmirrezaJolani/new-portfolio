"use client";

import { createElement } from "react";
import { useWindowManager } from "@/context/WindowManagerContext";
import { Window } from "./Window";
import { appComponents } from "./appRegistry";

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
