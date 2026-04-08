"use client";
import { useState } from "react";
import { BetTypeId, BillRow, betTypeLabel } from "./types";
import BetConfirmModal from "./BetConfirmModal";
import CountdownTimer from "@/components/ui/CountdownTimer";
import Toast from "@/components/ui/Toast";
import { useLang } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import type { BettingContext } from "@/lib/types/bet";

interface Props {
  bills:         BillRow[];
  drawId?:       number | null;
  packageId?:    number;
  bettingContext?: BettingContext;
  lotteryName:   string;
  lotteryFlag?:  string;
  lotteryLogo?:  string;
  closeAt?:      string;
  totalAmount:   number;
  onDelete:      (id: string) => void;
  onClearAll:    () => void;
  onConfirm:     () => Promise<{ ok: boolean; error?: string; message?: string; response?: unknown }>;
  onConfirmSuccess?: () => void;
}

type PayloadBetType = "top_3" | "tod_3" | "top_2" | "bottom_2" | "run_top" | "run_bottom";

interface PayloadItem {
  bet_type: PayloadBetType;
  number: string;
  amount: number;
  note: string;
}

const TOP_SIDE_MAP: Partial<Record<BetTypeId, PayloadBetType>> = {
  "3top": "top_3",
  "3tod": "tod_3",
  "2top": "top_2",
  "2bot": "bottom_2",
  "run": "run_top",
  "winlay": "run_bottom",
  "6perm": "top_3",
  "19door": "top_2",
  "winnum": "top_2",
};

const BOT_SIDE_MAP: Partial<Record<BetTypeId, PayloadBetType>> = {
  "3top": "tod_3",
  "3tod": "tod_3",
  "2top": "bottom_2",
  "2bot": "bottom_2",
  "run": "run_top",
  "winlay": "run_bottom",
  "6perm": "tod_3",
  "19door": "bottom_2",
  "winnum": "bottom_2",
};

function mapBillsToItems(bills: BillRow[]): PayloadItem[] {
  return bills.flatMap((b) => {
    const rows: PayloadItem[] = [];
    const note = b.note?.trim() ?? "";

    const topType = TOP_SIDE_MAP[b.betType];
    if (topType && b.top > 0) {
      rows.push({
        bet_type: topType,
        number: b.number,
        amount: Number(b.top),
        note,
      });
    }

    const botType = BOT_SIDE_MAP[b.betType];
    if (botType && b.bot > 0) {
      rows.push({
        bet_type: botType,
        number: b.number,
        amount: Number(b.bot),
        note,
      });
    }

    return rows;
  });
}

const PAYLOAD_TO_CTX_BET_TYPE: Record<PayloadBetType, BetTypeId> = {
  top_3: "3top",
  tod_3: "3tod",
  top_2: "2top",
  bottom_2: "2bot",
  run_top: "run",
  run_bottom: "winlay",
};

function getAmountLabel(betType: BetTypeId, side: "top" | "bot", t: Record<string, string>): string {
  if (side === "top") {
    if (betType === "3top" || betType === "2top" || betType === "6perm" || betType === "19door" || betType === "winnum") return t.top;
    if (betType === "3tod") return t.tod;
    if (betType === "2bot") return t.bottom;
    if (betType === "run") return t.betTypeRun;
    return t.betTypeWinlay;
  }
  if (betType === "3top" || betType === "3tod" || betType === "6perm") return t.tod;
  if (betType === "2top" || betType === "2bot" || betType === "19door" || betType === "winnum") return t.bottom;
  if (betType === "run") return t.betTypeRun;
  return t.betTypeWinlay;
}

type SlipGroupKey = "top" | "bottom" | "tod";

function getSlipGroupKey(betType: BetTypeId): SlipGroupKey {
  if (betType === "3tod") return "tod";
  if (betType === "2bot" || betType === "winlay") return "bottom";
  return "top";
}

export default function BetSlipSidebar({
  bills,
  bettingContext,
  lotteryName,
  lotteryFlag,
  lotteryLogo,
  closeAt,
  totalAmount,
  onDelete,
  onClearAll,
  onConfirm,
  onConfirmSuccess,
}: Props) {
  const { lang } = useLang();
  const t = useTranslation("bet");
  const localeByLang: Record<string, string> = { th: "th-TH", en: "en-US", kh: "km-KH", la: "lo-LA" };
  const numberLocale = localeByLang[lang] ?? "th-TH";
  const getBetTypeLabel = (id: BetTypeId) => {
    const key = `betType${id.charAt(0).toUpperCase()}${id.slice(1)}` as keyof typeof t;
    return (t[key] as string | undefined) ?? betTypeLabel(id);
  };
  const [showModal,    setShowModal]    = useState(false);
  const [closedToast,  setClosedToast]  = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [resultToast,  setResultToast]  = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const groupedBills = (() => {
    const base: Record<SlipGroupKey, BillRow[]> = { top: [], bottom: [], tod: [] };
    for (const b of [...bills].reverse()) {
      base[getSlipGroupKey(b.betType)].push(b);
    }
    return base;
  })();
  const groupMeta: { key: SlipGroupKey; label: string }[] = [
    { key: "top", label: t.top },
    { key: "bottom", label: t.bottom },
    { key: "tod", label: t.tod },
  ];
  const payloadItems = mapBillsToItems(bills);
  const subtotalAmount = payloadItems.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = payloadItems.reduce((sum, item) => {
    const ctxBetType = PAYLOAD_TO_CTX_BET_TYPE[item.bet_type];
    const discountPercent = Number(bettingContext?.[ctxBetType]?.discountPercent ?? 0);
    return sum + (item.amount * (discountPercent > 0 ? discountPercent : 0)) / 100;
  }, 0);
  const discountPct = subtotalAmount > 0 ? (discountAmount / subtotalAmount) * 100 : 0;
  const netAmount = Math.max(0, subtotalAmount - discountAmount);

  function handleOpenModal() {
    if (closeAt && new Date(closeAt).getTime() <= Date.now()) {
      setClosedToast(true);
      return;
    }
    setShowModal(true);
  }

  const handleConfirmAndClose = async () => {
    setShowModal(false);
    setSaving(true);
    // แสดง loading 2 วิก่อน แล้วค่อย post
    await new Promise((r) => setTimeout(r, 2000));
    const result = await onConfirm();
    setSaving(false);
    if (result.ok) {
      setResultToast({ msg: result.message ?? t.saveSuccessDefault, type: "success" });
      onConfirmSuccess?.();
    } else {
      setResultToast({ msg: result.message ?? result.error ?? t.errorUnknown, type: "error" });
    }
  };
  return (
    <>
    {showModal && (
      <BetConfirmModal
        bills={bills}
        lotteryName={lotteryName}
        totalAmount={totalAmount}
        bettingContext={bettingContext}
        onConfirm={handleConfirmAndClose}
        onCancel={() => setShowModal(false)}
      />
    )}
    <div className="space-y-3">
      <div className="bg-white rounded-2xl overflow-hidden shadow-card border border-ap-border sticky top-4">

        {/* Header */}
        <div className="px-4 py-3 border-b border-ap-border bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[17px] leading-none">📋</span>
              <span className="text-[15px] leading-none font-bold text-ap-primary">{t.slipTitle}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-white bg-ap-blue px-2.5 py-0.5 rounded-full leading-none">
                {bills.length} {t.items}
              </span>
              {bills.length > 0 && (
                <button onClick={onClearAll} className="text-[13px] font-semibold text-ap-red hover:underline">
                  {t.clearAll}
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            {lotteryLogo
              ? <img src={lotteryLogo} alt={lotteryName} className="w-4 h-4 rounded-full object-cover shrink-0" />
              : lotteryFlag ? <span className="text-[13px] shrink-0">{lotteryFlag}</span> : null
            }
            <span className="text-[13px] text-ap-primary font-semibold">{lotteryName}</span>
          </div>
        </div>

        {/* Bill list */}
        {bills.length === 0 ? (
          <div className="py-14 flex flex-col items-center gap-2">
            <span className="text-[48px]">📋</span>
            <p className="text-[14px] font-bold text-ap-primary">{t.noItems}</p>
            <p className="text-[13px] text-ap-secondary font-medium">{t.enterAndAdd}</p>
          </div>
        ) : (
          <div className="divide-y divide-ap-border max-h-[480px] overflow-y-auto">
            {groupMeta.map((group) => {
              const items = groupedBills[group.key];
              if (!items.length) return null;
              return (
                <div key={group.key}>
                  <div className="px-4 py-2 bg-ap-bg/80 border-b border-ap-border flex items-center justify-between">
                    <span className="text-[12px] font-bold text-ap-primary uppercase tracking-wide">{group.label}</span>
                    <span className="text-[12px] font-bold text-ap-secondary">{items.length} {t.items}</span>
                  </div>
                  {items.map((b) => {
                    const amt = b.top + b.bot;
                    return (
                      <div key={b.id} className="px-4 py-3 flex items-center gap-3 hover:bg-ap-bg/60 transition-colors border-b border-ap-border last:border-b-0">
                        <div className="w-12 h-12 rounded-2xl bg-ap-primary flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-extrabold text-[15px] tabular-nums tracking-wider">{b.number}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="inline-block text-[11px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full mb-1.5">
                            {getBetTypeLabel(b.betType)}
                          </span>
                          <p className="text-[13px] font-bold tabular-nums text-ap-blue">
                            <span className="text-[11px] font-semibold">{getAmountLabel(b.betType, "top", t as Record<string, string>)} </span>
                            {amt}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 flex flex-col items-end">
                          <button onClick={() => onDelete(b.id)}
                            className="text-[10px] text-ap-red hover:underline mb-1.5">
                            {t.delete}
                          </button>
                          <p className="text-[11px] text-ap-secondary font-medium">{t.totalBet}</p>
                          <p className="text-[13px] font-bold text-ap-primary tabular-nums">
                            ฿{amt.toLocaleString(numberLocale)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {bills.length > 0 && (
          <div className="border-t border-ap-border">
            <div className="px-4 py-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-ap-primary">{t.totalItems}</span>
                <span className="text-[12px] font-bold text-ap-primary">{bills.length} {t.items}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-semibold text-ap-primary">ยอดก่อนหักส่วนลด</span>
                <span className="text-[22px] font-bold text-ap-primary tabular-nums">
                  ฿{subtotalAmount.toLocaleString(numberLocale)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold text-ap-primary">
                  ส่วนลด ({discountPct.toLocaleString(numberLocale, { maximumFractionDigits: 2 })}%)
                </span>
                <span className="text-[14px] font-bold text-ap-green tabular-nums">
                  -฿{discountAmount.toLocaleString(numberLocale, { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-ap-border">
                <span className="text-[16px] font-bold text-ap-primary">ยอดหลังหักส่วนลด</span>
                <span className="text-[22px] font-bold text-ap-primary tabular-nums">
                  ฿{netAmount.toLocaleString(numberLocale, { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-ap-border">
                <span className="text-[16px] text-ap-red font-bold">⏱ {t.closeIn}</span>
                {closeAt
                  ? <CountdownTimer closeAt={closeAt} className="text-[16px] font-bold text-ap-red tabular-nums" />
                  : <span className="text-[16px] font-bold text-ap-red tabular-nums">—</span>
                }
              </div>
            </div>
            <div className="px-4 pb-4 space-y-2">
              <button onClick={handleOpenModal}
                className="w-full bg-ap-blue hover:bg-ap-blue-h text-white font-bold text-[14px] py-3 rounded-2xl transition-colors active:scale-[0.98]">
                {t.confirmBet}
              </button>
            </div>
          </div>
        )}

      </div>

    </div>

    {/* Loading overlay — full screen */}
    {saving && (
      <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-ap-blue/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-ap-blue animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-[15px] font-bold text-ap-primary">{t.saving ?? "กำลังบันทึก..."}</p>
          <p className="text-[12px] text-ap-secondary font-medium mt-1">{(t as Record<string,string>).pleaseWait ?? "กรุณารอสักครู่"}</p>
        </div>
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-ap-blue animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-ap-blue animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-ap-blue animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    )}

    {resultToast && (
      <Toast
        message={resultToast.msg}
        type={resultToast.type}
        durationMs={4000}
        onClose={() => setResultToast(null)}
      />
    )}

    {closedToast && (
      <Toast
        message={t.closedBetToast}
        type="warning"
        onClose={() => setClosedToast(false)}
      />
    )}
    </>
  );
}
