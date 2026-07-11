"use client";

import { WindowManagerProvider } from "@/context/WindowManagerContext";
import { useIsMobile } from "@/hooks/useIsMobile";
import { DesktopIcons } from "./DesktopIcons";
import { Dock } from "./Dock";
import { MenuBar } from "./MenuBar";
import { MobileHome } from "./MobileHome";
import { Wallpaper } from "./Wallpaper";
import { Widgets } from "./Widgets";
import { WindowLayer } from "./WindowLayer";

export function Desktop() {
  const isMobile = useIsMobile();

  return (
    <WindowManagerProvider>
      <main className="relative h-dvh w-full overflow-hidden">
        <Wallpaper />
        {isMobile ? (
          <MobileHome />
        ) : (
          <>
            <Widgets />
            <DesktopIcons />
            <MenuBar />
            <WindowLayer />
            <Dock />
          </>
        )}
      </main>
    </WindowManagerProvider>
  );
}
