"use client";

import { useState } from "react";
import { fetchSlipDetail } from "@/app/actions/history";
import type { Ticket } from "@/app/[locale]/(protected)/history/page";
import type { BetSlipDetail, BetItemDetail } from "@/lib/types/bet";

// ─── API shapes (subset of lotto.ts) ──────────────────────────────────────────
interface ApiDraw {
  draw_id:         number;
  draw_date:       string | null;
  close_at:        string | null;
  status:          string;
  result_top_3:    string;
  result_bottom_2: string;
}
interface ApiMarket {
  market_id:   number;
  market_name: string;
  market_logo: string;
  market_icon: string;
  is_enabled:  boolean;
  latest_draw: ApiDraw;
}
interface ApiGroup {
  group_id:    number;
  group_code:  string;
  group_name:  string;
  description?: string;
  markets:     ApiMarket[];
}

interface Props {
  groups:  ApiGroup[];
  tickets: Ticket[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function top2of(top3: string) {
  return top3.length >= 2 ? top3.slice(-2) : "—";
}

function formatDate(dt: string | null) {
  if (!dt) return "—";
  return new Date(dt.replace(" ", "T")).toLocaleDateString("th-TH", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

/** ตรวจสอบการถูกรางวัลจาก bet type + ผลออก */
function checkWin(number: string, betType: string, top3: string, bot2: string): boolean | null {
  if (!top3 && !bot2) return null;
  const t2 = top2of(top3);
  switch (betType) {
    case "top3": return number === top3;
    case "tod3": {
      if (top3.length !== 3) return false;
      const [a, b, c] = top3.split("");
      const perms = new Set([a+b+c, a+c+b, b+a+c, b+c+a, c+a+b, c+b+a]);
      return perms.has(number);
    }
    case "top2":    return number === t2;
    case "bot2":    return number === bot2;
    case "run_top": return top3.includes(number);
    case "run_bot": return bot2.includes(number);
    default:        return null;
  }
}

const TAB_GRADIENTS = [
  "from-ap-blue to-sky-400",
  "from-emerald-500 to-teal-400",
  "from-yellow-500 to-orange-400",
  "from-violet-600 to-indigo-400",
  "from-rose-500 to-pink-400",
  "from-cyan-500 to-blue-400",
];

const STATUS_STYLE: Record<string, string> = {
  active:    "bg-ap-blue/10 text-ap-blue",
  confirmed: "bg-ap-blue/10 text-ap-blue",
  won:       "bg-ap-green/10 text-ap-green",
  lost:      "bg-ap-red/10 text-ap-red",
  pending:   "bg-yellow-50 text-yellow-700",
  cancelled: "bg-ap-bg text-ap-tertiary",
};
const STATUS_LABEL: Record<string, string> = {
  active: "กำลังเล่น", confirmed: "ยืนยัน", won: "ถูกรางวัล",
  lost: "ไม่ถูก", pending: "รอยืนยัน", cancelled: "ยกเลิก",
};

// ─── Modal ────────────────────────────────────────────────────────────────────
interface DrawInfo {
  group_id:    number;
  market_id:   number;
  draw_id:     number;
  market_name: string;
  result_top_3:    string;
  result_bottom_2: string;
}

function CheckResultModal({
  draw,
  tickets,
  onClose,
}: {
  draw:    DrawInfo;
  tickets: Ticket[];
  onClose: () => void;
}) {
  const matching = tickets.filter((t) => t.draw_id === draw.draw_id);
  const top2 = top2of(draw.result_top_3);

  // slip detail: id → BetSlipDetail
  const [details,  setDetails]  = useState<Record<string, BetSlipDetail>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading,  setLoading]  = useState<Record<string, boolean>>({});

  async function toggleSlip(ticketId: number) {
    const id = String(ticketId);
    if (expanded[id]) {
      setExpanded((p) => ({ ...p, [id]: false }));
      return;
    }
    if (details[id]) {
      setExpanded((p) => ({ ...p, [id]: true }));
      return;
    }
    setLoading((p) => ({ ...p, [id]: true }));
    const detail = await fetchSlipDetail(id);
    if (detail) setDetails((p) => ({ ...p, [id]: detail }));
    setLoading((p) => ({ ...p, [id]: false }));
    setExpanded((p) => ({ ...p, [id]: true }));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-0 sm:px-4"
      onClick={(e) => { if (e.currentTarget === e.target) onClose(); }}
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-ap-border flex-shrink-0">
          <div className="w-10 h-1 bg-ap-border rounded-full mx-auto mb-4 sm:hidden" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-bold text-ap-primary">{draw.market_name}</h2>
              <p className="text-[12px] text-ap-tertiary mt-0.5">ตรวจผลรางวัล</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-ap-bg flex items-center justify-center text-ap-secondary hover:bg-ap-border/40 transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Result numbers */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "3 ตัวบน",  value: draw.result_top_3,    bg: "bg-ap-blue text-white" },
              { label: "2 ตัวบน",  value: top2,                 bg: "bg-teal-500 text-white" },
              { label: "2 ตัวล่าง", value: draw.result_bottom_2, bg: "bg-emerald-500 text-white" },
            ].map((r) => (
              <div key={r.label} className={`${r.bg} rounded-2xl py-3 text-center`}>
                <p className="text-[22px] font-bold tabular-nums tracking-wider">{r.value || "—"}</p>
                <p className="text-[10px] font-medium opacity-80 mt-0.5">{r.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket list */}
        <div className="overflow-y-auto flex-1">
          {matching.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[32px] mb-3">📋</p>
              <p className="text-[14px] font-semibold text-ap-primary">ไม่มีโพยสำหรับงวดนี้</p>
              <p className="text-[12px] text-ap-tertiary mt-1">คุณยังไม่ได้แทงหวยในงวดนี้</p>
            </div>
          ) : (
            <div className="divide-y divide-ap-border">
              {matching.map((ticket) => {
                const id      = String(ticket.id);
                const detail  = details[id];
                const isOpen  = expanded[id];
                const isLoading = loading[id];

                return (
                  <div key={ticket.id}>
                    {/* Ticket row */}
                    <button
                      type="button"
                      onClick={() => toggleSlip(ticket.id)}
                      className="w-full text-left px-5 py-3.5 hover:bg-ap-bg/60 transition-colors flex items-center gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[ticket.status] ?? "bg-ap-bg text-ap-secondary"}`}>
                            {STATUS_LABEL[ticket.status] ?? ticket.status}
                          </span>
                          <span className="text-[11px] text-ap-tertiary font-mono">#{ticket.id}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] text-ap-secondary">ยอดแทง</span>
                          <span className="text-[13px] font-bold text-ap-primary tabular-nums">
                            ฿{ticket.total_amount.toLocaleString("th-TH")}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {isLoading ? (
                          <div className="w-4 h-4 rounded-full border-2 border-ap-blue border-t-transparent animate-spin" />
                        ) : (
                          <svg className={`w-4 h-4 text-ap-tertiary transition-transform ${isOpen ? "rotate-90" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M9 18l6-6-6-6" strokeLinecap="round" />
                          </svg>
                        )}
                      </div>
                    </button>

                    {/* Expanded items */}
                    {isOpen && detail && (
                      <div className="bg-ap-bg/60 border-t border-ap-border">
                        {/* Column headers */}
                        <div className="grid grid-cols-[1fr_60px_60px] gap-2 px-5 py-2 text-[10px] font-semibold text-ap-tertiary uppercase tracking-wide">
                          <span>เลข / ประเภท</span>
                          <span className="text-right">ยอดแทง</span>
                          <span className="text-right">ผล</span>
                        </div>
                        {detail.items.map((item: BetItemDetail) => {
                          const won = checkWin(
                            item.number, item.betType,
                            draw.result_top_3, draw.result_bottom_2,
                          );
                          return (
                            <div
                              key={item.id}
                              className={[
                                "grid grid-cols-[1fr_60px_60px] gap-2 px-5 py-2.5 border-t border-ap-border items-center",
                                won === true  ? "bg-ap-green/5"  : "",
                                won === false ? "bg-ap-red/5"    : "",
                              ].join(" ")}
                            >
                              <div>
                                <span className="text-[16px] font-bold text-ap-primary tabular-nums tracking-widest">
                                  {item.number}
                                </span>
                                <span className="text-[10px] text-ap-tertiary ml-1.5">{item.betTypeLabel}</span>
                              </div>
                              <span className="text-[12px] text-ap-secondary text-right tabular-nums">
                                ฿{item.amount.toLocaleString("th-TH")}
                              </span>
                              <div className="flex justify-end">
                                {won === true && (
                                  <span className="text-[10px] font-bold bg-ap-green text-white px-2 py-0.5 rounded-full">ถูก ✓</span>
                                )}
                                {won === false && (
                                  <span className="text-[10px] font-bold bg-ap-red/10 text-ap-red px-2 py-0.5 rounded-full">ไม่ถูก</span>
                                )}
                                {won === null && (
                                  <span className="text-[10px] text-ap-tertiary">—</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CheckResultPage({ groups, tickets }: Props) {
  const [activeId,  setActiveId]  = useState<string | null>(groups[0]?.group_code ?? null);
  const [modalDraw, setModalDraw] = useState<DrawInfo | null>(null);

  const activeGroup = groups.find((g) => g.group_code === activeId) ?? null;
  const gradient    = TAB_GRADIENTS[groups.findIndex((g) => g.group_code === activeId) % TAB_GRADIENTS.length] ?? TAB_GRADIENTS[0];

  return (
    <div className="max-w-5xl mx-auto px-5 pt-6 space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-[20px] font-bold text-ap-primary tracking-tight">🏆 ตรวจผลรางวัล</h1>
        <p className="text-[13px] text-ap-secondary mt-0.5">ตรวจสอบผลรางวัลและโพยหวยของคุณ</p>
      </div>

      {groups.length === 0 && (
        <div className="py-16 text-center bg-white rounded-2xl border border-ap-border shadow-card">
          <p className="text-[32px] mb-3">🏆</p>
          <p className="text-[14px] font-semibold text-ap-primary">ยังไม่มีผลรางวัล</p>
        </div>
      )}

      {groups.length > 0 && (
        <div className="bg-white rounded-2xl border border-ap-border shadow-card overflow-hidden">

          {/* Tab bar */}
          <div className={`bg-gradient-to-r ${gradient} p-1 flex gap-1 overflow-x-auto`}>
            {groups.map((g) => (
              <button
                key={g.group_code}
                onClick={() => setActiveId(g.group_code)}
                className={[
                  "flex-shrink-0 flex-1 min-w-[72px] py-2 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap px-2",
                  activeId === g.group_code
                    ? "bg-white text-ap-primary shadow-sm"
                    : "text-white/80 hover:text-white hover:bg-white/10",
                ].join(" ")}
              >
                {g.group_name}
              </button>
            ))}
          </div>

          {/* Group header + description */}
          {activeGroup && (
            <div className={`bg-gradient-to-r ${gradient} px-4 pb-3 pt-2`}>
              <p className="text-white font-bold text-[15px]">{activeGroup.group_name}</p>
              {activeGroup.description && (
                <p className="text-white/80 text-[12px] mt-0.5">{activeGroup.description}</p>
              )}
            </div>
          )}

          {/* Column headers */}
          <div className="grid grid-cols-[1fr_80px_64px_64px_64px_80px] gap-2 px-4 py-2 bg-gray-50 border-b border-ap-border text-[11px] font-semibold text-ap-tertiary uppercase tracking-wide">
            <span>ประเภทหวย</span>
            <span className="text-center">งวด</span>
            <span className="text-center">3 ตัวบน</span>
            <span className="text-center">2 ตัวบน</span>
            <span className="text-center">2 ตัวล่าง</span>
            <span className="text-center">ตรวจผล</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-ap-border">
            {activeGroup?.markets.filter((m) => m.is_enabled).map((market) => {
              const draw       = market.latest_draw;
              const top3       = draw.result_top_3 || "";
              const bot2       = draw.result_bottom_2 || "";
              const t2         = top3 ? top2of(top3) : "—";
              const hasResult  = !!(top3 && bot2);
              const drawDate   = formatDate(draw.draw_date);
              const myTickets  = tickets.filter((t) => t.draw_id === draw.draw_id);
              const canOpen    = hasResult || myTickets.length > 0;
              const drawInfo: DrawInfo = {
                group_id:        activeGroup.group_id,
                market_id:       market.market_id,
                draw_id:         draw.draw_id,
                market_name:     market.market_name,
                result_top_3:    top3,
                result_bottom_2: bot2,
              };

              return (
                <div
                  key={market.market_id}
                  onClick={() => canOpen && setModalDraw(drawInfo)}
                  className={[
                    "grid grid-cols-[1fr_80px_64px_64px_64px_80px] gap-2 px-4 py-3 items-center transition-colors",
                    canOpen ? "cursor-pointer hover:bg-ap-blue/5" : "hover:bg-ap-bg/40",
                  ].join(" ")}
                >

                  {/* ประเภทหวย */}
                  <div className="flex items-center gap-2 min-w-0">
                    {market.market_logo ? (
                      <img src={market.market_logo} alt={market.market_name} className="w-7 h-7 rounded-full object-cover border border-ap-border flex-shrink-0" />
                    ) : (
                      <span className="text-[20px] flex-shrink-0">{market.market_icon || "🎯"}</span>
                    )}
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-ap-primary truncate">{market.market_name}</p>
                      {myTickets.length > 0 && (
                        <span className="text-[10px] text-ap-blue font-medium">{myTickets.length} โพย</span>
                      )}
                    </div>
                  </div>

                  {/* งวด */}
                  <p className="text-[11px] text-ap-secondary text-center tabular-nums">{drawDate}</p>

                  {/* 3 ตัวบน */}
                  <div className="flex justify-center">
                    {top3
                      ? <span className="bg-ap-blue text-white text-[13px] font-bold tabular-nums rounded-lg px-2 py-0.5">{top3}</span>
                      : <span className="text-ap-tertiary text-[12px]">—</span>}
                  </div>

                  {/* 2 ตัวบน */}
                  <div className="flex justify-center">
                    {top3
                      ? <span className="bg-teal-500 text-white text-[13px] font-bold tabular-nums rounded-lg px-2 py-0.5">{t2}</span>
                      : <span className="text-ap-tertiary text-[12px]">—</span>}
                  </div>

                  {/* 2 ตัวล่าง */}
                  <div className="flex justify-center">
                    {bot2
                      ? <span className="bg-emerald-500 text-white text-[13px] font-bold tabular-nums rounded-lg px-2 py-0.5">{bot2}</span>
                      : <span className="text-ap-tertiary text-[12px]">—</span>}
                  </div>

                  {/* ตรวจผล */}
                  <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={!canOpen}
                      onClick={() => canOpen && setModalDraw(drawInfo)}
                      className={[
                        "px-3 py-1.5 text-[11px] font-bold rounded-full whitespace-nowrap transition-colors",
                        canOpen
                          ? "bg-ap-blue text-white hover:bg-ap-blue-h cursor-pointer"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed",
                      ].join(" ")}
                    >
                      ตรวจผลหวย
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Modal */}
      {modalDraw && (
        <CheckResultModal
          draw={modalDraw}
          tickets={tickets}
          onClose={() => setModalDraw(null)}
        />
      )}

    </div>
  );
}
