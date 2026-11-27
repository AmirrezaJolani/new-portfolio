import { Press_Start_2P, VT323 } from "next/font/google";
import { Game } from "./Game";

// Pixel fonts, scoped to whichever element carries `fontVars`.
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
export const fontVars = `${pixel.variable} ${body.variable}`;

export function DrivePage() {
  return (
    <div className={fontVars}>
      <Game />
    </div>
  );
}
