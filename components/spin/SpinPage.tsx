"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { spinWheelAction } from "@/lib/actions";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useLang } from "@/lib/i18n/context";
import type { AuthUser } from "@/lib/session/auth";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface WheelSegment {
  code:     number;
  prize:    number;
  label:    string;
  imageUrl: string;
  color:    string;
  name:     string;
  types:    string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SpinPage({
  user,
  segments,
  wheelEnabled,
}: {
  user:         AuthUser;
  segments:     WheelSegment[];
  wheelEnabled: boolean;
}) {
  const t            = useTranslation("spin");
  const { lang }     = useLang();

  const wheelRef = useRef<any>(null);

  const [isSpinning, setIsSpinning] = useState(false);
  const [diamond, setDiamond]       = useState(user.diamond);

  useEffect(() => {
    if (segments.length === 0) return;

    const initWheel = () => {
      const W = (window as any).Winwheel;
      if (!W) return;
      wheelRef.current = new W({
        canvasId:       "spin-canvas",
        numSegments:    segments.length,
        drawMode:       "segmentImage",
        imageDirection: "N",
        outerRadius:    170,
        innerRadius:    0,
        strokeStyle:    "white",
        lineWidth:      2,
        segments:       segments.map((seg) => ({ image: seg.imageUrl })),
        animation: {
          type:     "spinToStop",
          duration: 5,
          spins:    8,
        },
      });
      wheelRef.current.draw();
    };

    const loadWheel = () => {
      if ((window as any).Winwheel) { initWheel(); return; }
      const s  = document.createElement("script");
      s.src    = "/Winwheel.min.js";
      s.onload = initWheel;
      document.body.appendChild(s);
    };

    if ((window as any).TweenMax) {
      loadWheel();
    } else {
      const s  = document.createElement("script");
      s.src    = "/TweenMax.min.js";
      s.onload = loadWheel;
      document.body.appendChild(s);
    }
  }, [segments]);

  const handleSpin = async () => {
    if (isSpinning || diamond < 1 || !wheelEnabled || !wheelRef.current) return;
    setIsSpinning(true);

    // Reset wheel before each spin
    wheelRef.current.stopAnimation(false);
    wheelRef.current.rotationAngle = 0;
    wheelRef.current.draw();

    const result = await spinWheelAction();

    if (result.error) {
      toast.error(result.error);
      setIsSpinning(false);
      return;
    }

    console.log("[spin] code:", result.code, "prize:", result.prize);
    wheelRef.current.animation.stopAngle        = result.prize;
    wheelRef.current.animation.callbackFinished = () => {
      toast.success(result.title ?? "ยินดีด้วย!", {
        description: result.msg,
        duration:    5000,
      });
      if (result.diamond !== undefined) setDiamond(result.diamond);
      setIsSpinning(false);
    };

    wheelRef.current.startAnimation();
  };

  return (
    <>
      <main className="min-h-screen bg-ap-bg flex flex-col items-center justify-center p-5 pt-6 pb-24 sm:pb-8">
        <div className="w-full max-w-md">

          <div className="text-center mb-6">
            <h1 className="text-[24px] font-bold text-ap-primary tracking-tight">{t.title}</h1>
            <p className="text-[14px] text-ap-secondary mt-1">{t.subtitle}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-card-xl border border-ap-border p-6 flex flex-col items-center gap-5">

            {/* Top bar */}
            <div className="w-full flex items-center justify-between">
              <Link href={`/${lang}/dashboard`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ap-bg border border-ap-border text-ap-secondary text-[13px] hover:bg-ap-blue/5 transition-colors">
                {t.back}
              </Link>
              <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5">
                <span className="text-[16px]">💎</span>
                <span className="text-[14px] font-bold text-ap-blue tabular-nums">{diamond}</span>
                <span className="text-[11px] text-ap-secondary">{t.diamond}</span>
              </div>
            </div>

            {/* Wheel */}
            <div className="rng-canvas-container">
              <div className="rng-canvas-pointer">
                <svg width="22" height="30" viewBox="0 0 22 30">
                  <polygon points="11,30 0,6 22,6" fill="#EF4444" />
                  <circle cx="11" cy="6" r="4" fill="white" stroke="#EF4444" strokeWidth="2" />
                </svg>
              </div>
              <canvas id="spin-canvas" className="rng-canvas-canvas" width="400" height="400" />
            </div>

            <button
              onClick={handleSpin}
              disabled={isSpinning || diamond < 1 || !wheelEnabled}
              className="w-full bg-ap-blue text-white font-bold py-3 rounded-xl text-[15px] disabled:opacity-50 hover:bg-ap-blue-h transition-colors active:scale-[0.98]"
            >
              {isSpinning
                ? t.spinning
                : !wheelEnabled
                ? t.disabled
                : diamond < 1
                ? t.noDiamond
                : t.spinBtn}
            </button>

            <Link href={`/${lang}/spin/history`}
              className="w-full text-center py-2 rounded-xl border border-ap-border text-[13px] text-ap-secondary hover:bg-ap-bg transition-colors">
              {t.history}
            </Link>

          </div>
        </div>
      </main>
    </>
  );
}
