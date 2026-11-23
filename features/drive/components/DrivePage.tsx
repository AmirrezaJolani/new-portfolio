import { Press_Start_2P, VT323 } from "next/font/google";
import { Game } from "./Game";

// Pixel fonts are scoped to the game, so the desktop route keeps Geist.
const pixel = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});
const body = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-body",
});

export function DrivePage() {
  return (
    <div className={`${pixel.variable} ${body.variable}`}>
      <Game />
    </div>
  );
}
