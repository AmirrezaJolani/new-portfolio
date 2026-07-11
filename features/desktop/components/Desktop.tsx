"use client";

import { WindowManagerProvider } from "@/context/WindowManagerContext";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Dock } from "./Dock";
import { MenuBar } from "./MenuBar";
import { MobileHome } from "./MobileHome";
import { WindowLayer } from "./WindowLayer";

export function Desktop() {
  const isMobile = useIsMobile();

  return (
    <WindowManagerProvider>
      <main className="relative h-dvh w-full overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        {isMobile ? (
          <MobileHome />
        ) : (
          <>
            <MenuBar />
            <WindowLayer />
            <Dock />
          </>
        )}
      </main>
    </WindowManagerProvider>
  );
}
