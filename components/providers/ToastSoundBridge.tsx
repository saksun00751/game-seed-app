"use client";

import { useEffect } from "react";

function playToastSound(kind: "error" | "success" | "warning" | "info") {
  if (typeof window === "undefined") return;
  const Ctx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;

  try {
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const pattern =
      kind === "success"
        ? [920, 1180]
        : kind === "warning"
          ? [640, 540]
          : kind === "info"
            ? [760]
            : [420, 340];

    pattern.forEach((freq, i) => {
      const start = now + i * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.028, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.1);
    });

    setTimeout(() => { void ctx.close(); }, 260);
  } catch {
    // Ignore browsers that block audio without user interaction
  }
}

function detectToastType(el: Element): "error" | "success" | "warning" | "info" {
  const type = (el.getAttribute("data-type") || "").toLowerCase();
  if (type === "success" || type === "warning" || type === "info" || type === "error") return type;

  const cls = el.className.toString().toLowerCase();
  if (cls.includes("success")) return "success";
  if (cls.includes("warning")) return "warning";
  if (cls.includes("info")) return "info";
  return "error";
}

export default function ToastSoundBridge() {
  useEffect(() => {
    const seen = new WeakSet<Element>();

    const handleToastNode = (el: Element) => {
      if (seen.has(el)) return;
      seen.add(el);
      playToastSound(detectToastType(el));
    };

    const scan = (root: Element | Document) => {
      root.querySelectorAll("[data-sonner-toast]").forEach((el) => handleToastNode(el));
    };

    scan(document);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches("[data-sonner-toast]")) handleToastNode(node);
          scan(node);
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}

