"use client";
import { useEffect } from "react";
import { toast } from "sonner";

interface Props {
  message: string;
  type?:   "error" | "success" | "warning";
  durationMs?: number;
  onClose: () => void;
}

const TOAST_DEDUP_WINDOW_MS = 700;
const toastDedupMap = new Map<string, number>();

export default function Toast({ message, type = "error", durationMs = 3500, onClose }: Props) {
  useEffect(() => {
    const dedupKey = `${type}:${message.trim()}`;
    const now = Date.now();
    const lastShownAt = toastDedupMap.get(dedupKey) ?? 0;
    if (now - lastShownAt < TOAST_DEDUP_WINDOW_MS) {
      const t = setTimeout(onClose, 0);
      return () => clearTimeout(t);
    }
    toastDedupMap.set(dedupKey, now);

    const id = `legacy-toast:${dedupKey}`;
    if (type === "success") toast.success(message, { duration: durationMs, id });
    else if (type === "warning") toast.warning(message, { duration: durationMs, id });
    else toast.error(message, { duration: durationMs, id });

    const t = setTimeout(onClose, 0);
    return () => clearTimeout(t);
  }, [durationMs, message, onClose, type]);

  return null;
}
