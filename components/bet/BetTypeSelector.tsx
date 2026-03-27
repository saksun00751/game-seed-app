"use client";
import { BetTypeId, BET_TYPE_BTNS } from "./types";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface Props {
  betType:   BetTypeId;
  onChange:  (id: BetTypeId) => void;
  visibleIds?: BetTypeId[];
  disabled?: boolean;
}

export default function BetTypeSelector({ betType, onChange, visibleIds, disabled = false }: Props) {
  const t = useTranslation("bet");
  const buttons = visibleIds?.length
    ? BET_TYPE_BTNS.filter((b) => visibleIds.includes(b.id))
    : BET_TYPE_BTNS;
  const getBetTypeLabel = (id: BetTypeId) => (t[`betType${id}` as keyof typeof t] as string | undefined) ?? id;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-card border border-ap-border p-4">
      <p className="text-[12px] font-semibold text-ap-secondary uppercase tracking-wider mb-3">{t.betTypeTitle}</p>
      <div className="grid grid-cols-3 gap-2">
        {buttons.map((bt) => {
          const active = betType === bt.id;
          return (
            <button key={bt.id} onClick={() => !disabled && onChange(bt.id)} disabled={disabled}
              className={[
                "flex items-center gap-2.5 px-3 py-3 rounded-2xl border-2 transition-all text-left",
                disabled
                  ? "border-ap-border bg-ap-bg opacity-40 cursor-not-allowed"
                  : active
                    ? "border-violet-400 bg-violet-50 active:scale-95"
                    : "border-ap-border bg-ap-bg hover:border-ap-blue/30 active:scale-95",
              ].join(" ")}>
              <span className={[
                "w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 transition-all",
                active && !disabled ? "border-violet-500 bg-violet-500" : "border-ap-border bg-white",
              ].join(" ")} />
              <p className={`text-[13px] font-bold leading-tight ${active && !disabled ? "text-violet-700" : "text-ap-primary"}`}>{getBetTypeLabel(bt.id)}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
