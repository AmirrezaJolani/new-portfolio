"use client";

import { useTranslations } from "next-intl";
import { type PointerEvent, useRef } from "react";
import { Icon } from "./Icon";

const R = 44; // knob travel, CSS px

// Mobile driving HUD: a joystick on the left (drag toward where you want to
// go) and a brake/reverse button on the right. Only shown on touch screens.
type Props = {
  onStick: (x: number, y: number) => void;
  onBrake: (on: boolean) => void;
};

export function TouchControls({ onStick, onBrake }: Props) {
  const t = useTranslations("drive.hud");
  const knob = useRef<HTMLSpanElement>(null);

  const move = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2);
    let dy = e.clientY - (r.top + r.height / 2);
    const len = Math.hypot(dx, dy);
    if (len > R) {
      dx *= R / len;
      dy *= R / len;
    }
    onStick(dx / R, dy / R);
    if (knob.current)
      knob.current.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  const release = () => {
    onStick(0, 0);
    if (knob.current) knob.current.style.transform = "";
  };

  return (
    <div className="hidden pointer-coarse:flex absolute bottom-6 inset-x-6 justify-between items-end z-10">
      <div
        className="joystick"
        aria-hidden
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          move(e);
        }}
        onPointerMove={(e) =>
          e.currentTarget.hasPointerCapture(e.pointerId) && move(e)
        }
        onPointerUp={release}
        onPointerCancel={release}
      >
        <span ref={knob} className="joystick-knob" />
      </div>
      <button
        type="button"
        aria-label={t("brakeAria")}
        className="pedal font-pixel"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          onBrake(true);
        }}
        onPointerUp={() => onBrake(false)}
        onPointerCancel={() => onBrake(false)}
      >
        <Icon name="brake" size={32} className="mx-auto block" />
        <span className="block text-[8px] mt-1">{t("brake")}</span>
      </button>
    </div>
  );
}
