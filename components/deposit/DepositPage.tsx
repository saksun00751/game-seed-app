"use client";

import { useState, useRef, useEffect } from "react";
import { useLang } from "@/lib/i18n/context";

interface Props {
  displayName:  string;
  bankName:     string | null;
  bankAccount:  string | null;
  balance:      number;
}

interface LoadBankAccount {
  acc_no:      string;
  acc_name:    string;
  bank_name:   string;
  bank_pic:    string;
  qr_pic:      string;
  qrcode:      boolean;
  code:        number;
  deposit_min: string;
  remark:      string;
}

interface DepositChannels {
  bank:    number;
  payment: number;
  tw:      number;
  slip:    number;
  sort: {
    bank:    number | null;
    payment: number | null;
    tw:      number | null;
    slip:    number | null;
  };
}

const QUICK_AMOUNTS = [50, 100, 300, 500, 1000];

type ChannelKey = "bank" | "payment" | "tw" | "slip";
type Phase      = "method" | "amount" | "slip" | "done";

const CHANNEL_META: Record<ChannelKey, { icon: string; title: string; desc: string; color: string }> = {
  bank:    { icon: "🏦", title: "โอนผ่านเลขบัญชี",  desc: "โอนผ่านธนาคาร / Mobile Banking",    color: "ap-blue"  },
  payment: { icon: "💳", title: "โอนผ่าน Payment",  desc: "ชำระผ่านช่องทาง Payment Gateway",    color: "purple"   },
  tw:      { icon: "💚", title: "TrueWallet",        desc: "ฝากผ่าน TrueWallet",                color: "green"    },
  slip:    { icon: "📎", title: "อัพโหลดสลิป",       desc: "อัพโหลดสลิปโดยตรง",                color: "ap-blue"  },
};

const STEP_LABELS: Record<Phase, number> = { method: 1, amount: 2, slip: 3, done: 4 };

// ─── Step indicator ────────────────────────────────────────────────────────────
function StepBar({ phase }: { phase: Phase }) {
  const steps = ["เลือกวิธี", "จำนวนเงิน", "แนบสลิป", "สำเร็จ"];
  const current = STEP_LABELS[phase];
  return (
    <div className="flex items-center mb-7">
      {steps.map((label, i) => {
        const n      = i + 1;
        const done   = current > n;
        const active = current === n;
        return (
          <div key={n} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className={[
                "w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-all duration-300",
                done   ? "bg-ap-green text-white shadow-sm"
                : active ? "bg-ap-blue text-white shadow-sm"
                :          "bg-ap-border text-ap-tertiary",
              ].join(" ")}>
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : n}
              </div>
              <span className={[
                "text-[10px] font-medium whitespace-nowrap",
                active ? "text-ap-blue" : done ? "text-ap-green" : "text-ap-tertiary",
              ].join(" ")}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={[
                "flex-1 h-0.5 mx-1.5 mb-4 rounded-full transition-all duration-300",
                current > n ? "bg-ap-green" : "bg-ap-border",
              ].join(" ")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Bank account card ─────────────────────────────────────────────────────────
function BankCard({
  account,
  selected,
  onClick,
}: {
  account: LoadBankAccount;
  selected: boolean;
  onClick: () => void;
}) {
  const minAmt = parseFloat(account.deposit_min) || 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left rounded-2xl border-2 p-4 transition-all",
        selected
          ? "border-ap-blue bg-ap-blue/5 shadow-sm"
          : "border-ap-border hover:border-ap-blue/40 hover:bg-ap-bg",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        {account.bank_pic ? (
          <img src={account.bank_pic} alt={account.bank_name} className="w-10 h-10 rounded-xl object-contain bg-white border border-ap-border flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-ap-bg border border-ap-border flex items-center justify-center text-[20px] flex-shrink-0">🏦</div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-ap-primary">{account.bank_name}</p>
          <p className="text-[12px] font-mono text-ap-secondary tracking-wider mt-0.5">{account.acc_no}</p>
          <p className="text-[11px] text-ap-tertiary mt-0.5">{account.acc_name}</p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {selected && (
            <div className="w-5 h-5 rounded-full bg-ap-blue flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
          {minAmt > 0 && (
            <span className="text-[10px] text-ap-tertiary">ขั้นต่ำ ฿{minAmt.toLocaleString("th-TH")}</span>
          )}
        </div>
      </div>
      {account.remark && (
        <p className="text-[11px] text-amber-600 mt-2 bg-amber-50 rounded-lg px-2 py-1">{account.remark}</p>
      )}
    </button>
  );
}

// ─── Notes ────────────────────────────────────────────────────────────────────
function Notes() {
  return (
    <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-[18px]">⚠️</span>
        <p className="text-[12px] font-bold text-amber-700 uppercase tracking-wide">หมายเหตุสำคัญ</p>
      </div>
      <div className="space-y-1.5">
        {[
          { bold: true,  text: "ใช้บัญชีที่ลงทะเบียนไว้ในการฝากเงินเท่านั้น !!!!" },
          { bold: false, text: "หลังจากฝากเงินสำเร็จ รอไม่เกิน 1–3 นาที" },
          { bold: false, text: "หากพบปัญหาติดต่อฝ่ายบริการลูกค้า" },
        ].map((n, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-amber-500 text-[12px] mt-0.5 flex-shrink-0">•</span>
            <p className={`text-[12px] text-amber-700 leading-relaxed ${n.bold ? "font-semibold" : ""}`}>
              {n.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function DepositPage({ displayName, bankName, bankAccount, balance }: Props) {
  const { lang } = useLang();

  const [phase,       setPhase]       = useState<Phase>("method");
  const [method,      setMethod]      = useState<ChannelKey | null>(null);
  const [amount,      setAmount]      = useState("");
  const [slip,        setSlip]        = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [depositId,   setDepositId]   = useState<string | null>(null);

  // ── Deposit channels ────────────────────────────────────────────────────────
  const [channels,        setChannels]        = useState<DepositChannels | null>(null);
  const [channelsLoading, setChannelsLoading] = useState(true);
  const [channelsError,   setChannelsError]   = useState<string | null>(null);

  // ── Loadbank (per-method accounts) ─────────────────────────────────────────
  const [bankAccounts,   setBankAccounts]   = useState<LoadBankAccount[]>([]);
  const [bankLoading,    setBankLoading]    = useState(false);
  const [bankError,      setBankError]      = useState<string | null>(null);
  const [selectedBank,   setSelectedBank]   = useState<LoadBankAccount | null>(null);

  useEffect(() => {
    fetch("/api/deposit/channels")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data?.deposit) setChannels(data.data.deposit);
        else setChannelsError(data.message ?? "ไม่สามารถโหลดช่องทางฝากเงินได้");
      })
      .catch(() => setChannelsError("ไม่สามารถเชื่อมต่อระบบได้"))
      .finally(() => setChannelsLoading(false));
  }, []);

  const fileRef       = useRef<HTMLInputElement>(null);
  const amountNum     = parseFloat(amount) || 0;
  const minAmt        = parseFloat(selectedBank?.deposit_min ?? "0") || 50;
  const isValidAmount = amountNum >= minAmt;

  // เรียงช่องทางที่เปิดใช้งานตาม sort order
  const enabledChannels: ChannelKey[] = channels
    ? (Object.keys(CHANNEL_META) as ChannelKey[])
        .filter((k) => channels[k] === 1)
        .sort((a, b) => {
          const sa = channels.sort[a] ?? 999;
          const sb = channels.sort[b] ?? 999;
          return sa - sb;
        })
    : [];

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSlip(file);
    const reader = new FileReader();
    reader.onload = () => setSlipPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function maskAccount(acc: string) {
    return acc.length > 4 ? `${"X".repeat(acc.length - 4)}-${acc.slice(-4)}` : acc;
  }

  async function selectMethod(ch: ChannelKey) {
    setMethod(ch);
    setBankAccounts([]);
    setSelectedBank(null);
    setBankError(null);

    if (ch === "slip") {
      setPhase("slip");
      return;
    }

    setPhase("amount");
    setBankLoading(true);
    try {
      const res  = await fetch("/api/deposit/loadbank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: ch }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.bank) && data.bank.length > 0) {
        setBankAccounts(data.bank);
        setSelectedBank(data.bank[0]);
      } else {
        setBankError(data.message ?? "ไม่สามารถโหลดข้อมูลบัญชีได้");
      }
    } catch {
      setBankError("ไม่สามารถเชื่อมต่อระบบได้");
    } finally {
      setBankLoading(false);
    }
  }

  async function handleConfirmDeposit() {
    if (!slip) return;
    setSubmitting(true);
    setSubmitError(null);

    const fd = new FormData();
    fd.append("amount",  String(amountNum));
    fd.append("method",  method ?? "bank");
    fd.append("slip",    slip);
    if (selectedBank) {
      fd.append("accountCode", String(selectedBank.code));
    }

    try {
      const res  = await fetch("/api/deposit/submit", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        setDepositId(data.depositId ?? null);
        setPhase("done");
      } else {
        setSubmitError(data.message ?? "เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    } catch {
      setSubmitError("ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-5 pt-6">

      {/* Balance card */}
      <div className="bg-white rounded-2xl border border-ap-border shadow-card px-5 py-4 mb-3">
        <p className="text-[11px] text-ap-tertiary uppercase tracking-wide font-medium mb-0.5">ยอดคงเหลือ</p>
        <p className="text-[30px] font-bold text-ap-primary tabular-nums leading-tight">
          ฿{balance.toFixed(2)}
        </p>
      </div>

      {/* User bank info card */}
      <div className="bg-white rounded-2xl border border-ap-border shadow-card px-5 py-4 mb-5">
        <p className="text-[11px] text-ap-tertiary uppercase tracking-wide font-medium mb-1.5">บัญชีธนาคารของฉัน</p>
        {bankAccount ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold text-ap-primary">{displayName}</p>
              {bankName && <p className="text-[12px] text-ap-secondary mt-0.5">{bankName}</p>}
            </div>
            <p className="text-[14px] font-mono font-semibold text-ap-primary tracking-wider">
              {maskAccount(bankAccount)}
            </p>
          </div>
        ) : (
          <p className="text-[13px] text-ap-tertiary">ยังไม่ได้ผูกบัญชีธนาคาร</p>
        )}
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl border border-ap-border shadow-card p-5">
        <StepBar phase={phase} />

        {/* ── Phase: method ────────────────────────────────────────────────── */}
        {phase === "method" && (
          <div className="space-y-3 animate-fade-up">
            <h2 className="text-[17px] font-bold text-ap-primary mb-4">เลือกวิธีฝากเงิน</h2>

            {channelsLoading && (
              <div className="flex items-center gap-2 py-4">
                <div className="w-4 h-4 rounded-full border-2 border-ap-blue border-t-transparent animate-spin" />
                <p className="text-[13px] text-ap-secondary">กำลังโหลดช่องทางฝากเงิน...</p>
              </div>
            )}
            {channelsError && !channelsLoading && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[13px] text-ap-red">
                {channelsError}
              </div>
            )}
            {!channelsLoading && !channelsError && enabledChannels.length === 0 && (
              <p className="text-[13px] text-ap-tertiary py-4 text-center">ไม่มีช่องทางฝากเงินที่เปิดใช้งาน</p>
            )}

            {enabledChannels.map((ch) => {
              const meta = CHANNEL_META[ch];
              return (
                <button
                  key={ch}
                  onClick={() => selectMethod(ch)}
                  disabled={channelsLoading || !!channelsError}
                  className="w-full flex items-center gap-4 border-2 border-ap-border rounded-2xl px-5 py-4 text-left hover:border-ap-blue/50 hover:bg-ap-blue/[0.02] transition-all active:scale-[0.99] group disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="w-12 h-12 rounded-2xl bg-ap-bg flex items-center justify-center text-[24px] flex-shrink-0 group-hover:bg-ap-blue/5 transition-colors">
                    {meta.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] font-semibold text-ap-primary">{meta.title}</p>
                    <p className="text-[12px] text-ap-tertiary mt-0.5">{meta.desc}</p>
                  </div>
                  <svg className="w-5 h-5 text-ap-tertiary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Phase: amount ─────────────────────────────────────────────────── */}
        {phase === "amount" && method && (
          <div className="space-y-4 animate-fade-up">

            {/* Channel header */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[20px]">{CHANNEL_META[method].icon}</span>
              <h2 className="text-[16px] font-bold text-ap-primary">{CHANNEL_META[method].title}</h2>
            </div>

            {/* Loading bank accounts */}
            {bankLoading && (
              <div className="flex items-center gap-2 py-3">
                <div className="w-4 h-4 rounded-full border-2 border-ap-blue border-t-transparent animate-spin" />
                <p className="text-[13px] text-ap-secondary">กำลังโหลดข้อมูลช่องทาง...</p>
              </div>
            )}

            {/* Error */}
            {bankError && !bankLoading && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[13px] text-ap-red">
                {bankError}
              </div>
            )}

            {/* Bank account list */}
            {!bankLoading && bankAccounts.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-ap-secondary uppercase tracking-wide">
                  {method === "tw" ? "โอนมาที่หมายเลขนี้" : "โอนเงินมาที่บัญชีนี้"}
                </p>
                {bankAccounts.map((acc) => (
                  <BankCard
                    key={acc.code}
                    account={acc}
                    selected={selectedBank?.code === acc.code}
                    onClick={() => setSelectedBank(acc)}
                  />
                ))}
              </div>
            )}

            {/* Amount input */}
            {!bankLoading && (
              <>
                <h2 className="text-[15px] font-bold text-ap-primary pt-1">ระบุจำนวนเงิน</h2>

                <div className="grid grid-cols-5 gap-2">
                  {QUICK_AMOUNTS.filter((q) => q >= minAmt).map((q) => (
                    <button
                      key={q}
                      onClick={() => setAmount(String(q))}
                      className={[
                        "py-2.5 rounded-xl text-[13px] font-bold border-2 transition-all active:scale-95",
                        amount === String(q)
                          ? "bg-ap-blue border-ap-blue text-white shadow-sm"
                          : "bg-white border-ap-border text-ap-primary hover:border-ap-blue/40",
                      ].join(" ")}
                    >
                      {q}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] font-bold text-ap-secondary select-none">฿</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={minAmt}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`กรอกจำนวนเงิน (ขั้นต่ำ ${minAmt} บาท)`}
                    className="w-full border-2 border-ap-border rounded-2xl pl-9 pr-4 py-3 text-[15px] font-semibold text-ap-primary outline-none focus:border-ap-blue focus:ring-2 focus:ring-ap-blue/10 transition-all"
                  />
                </div>
                {amount !== "" && !isValidAmount && (
                  <p className="text-[12px] text-ap-red -mt-2">จำนวนขั้นต่ำ {minAmt} บาท</p>
                )}
              </>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setPhase("method")}
                className="flex-1 py-3 rounded-full border-2 border-ap-border text-[14px] font-semibold text-ap-secondary hover:border-ap-blue/30 transition-colors"
              >
                ← ย้อนกลับ
              </button>
              <button
                onClick={() => setPhase("slip")}
                disabled={!isValidAmount || bankLoading || !!bankError || !selectedBank}
                className="flex-1 py-3 rounded-full bg-ap-blue text-white text-[14px] font-semibold hover:bg-ap-blue-h transition-all disabled:opacity-40"
              >
                ถัดไป →
              </button>
            </div>
          </div>
        )}

        {/* ── Phase: slip ───────────────────────────────────────────────────── */}
        {phase === "slip" && (
          <div className="space-y-4 animate-fade-up">
            <div>
              <h2 className="text-[17px] font-bold text-ap-primary">แนบสลิปการโอนเงิน</h2>
              {method !== "slip" && (
                <p className="text-[13px] text-ap-secondary mt-1">
                  ยอดที่ฝาก{" "}
                  <span className="font-bold text-ap-blue">฿{parseFloat(amount || "0").toLocaleString("th-TH")}</span>
                  {method && <span> · {CHANNEL_META[method].title}</span>}
                  {selectedBank && <span> · {selectedBank.bank_name}</span>}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={[
                "w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-3 transition-all",
                slipPreview
                  ? "border-ap-green bg-ap-green/[0.03]"
                  : "border-ap-border bg-ap-bg hover:border-ap-blue/40 hover:bg-ap-blue/[0.02]",
              ].join(" ")}
            >
              {slipPreview ? (
                <>
                  <img src={slipPreview} alt="slip preview" className="max-h-52 rounded-xl object-contain shadow-sm" />
                  <p className="text-[12px] text-ap-green font-semibold">แนบสลิปแล้ว — แตะเพื่อเปลี่ยน</p>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-white border border-ap-border flex items-center justify-center text-[28px] shadow-sm">
                    📎
                  </div>
                  <div className="text-center">
                    <p className="text-[14px] font-semibold text-ap-primary">แตะเพื่อแนบสลิป</p>
                    <p className="text-[12px] text-ap-tertiary mt-0.5">รองรับ JPG, PNG, PDF</p>
                  </div>
                </>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[13px] text-ap-red">
                {submitError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setPhase(method === "slip" ? "method" : "amount")}
                disabled={submitting}
                className="flex-1 py-3 rounded-full border-2 border-ap-border text-[14px] font-semibold text-ap-secondary hover:border-ap-blue/30 transition-colors disabled:opacity-40"
              >
                ← ย้อนกลับ
              </button>
              <button
                onClick={handleConfirmDeposit}
                disabled={!slip || submitting}
                className="flex-1 py-3 rounded-full bg-ap-blue text-white text-[14px] font-semibold hover:bg-ap-blue-h transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    กำลังส่ง...
                  </>
                ) : (
                  "ยืนยันฝากเงิน"
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Phase: done ───────────────────────────────────────────────────── */}
        {phase === "done" && (
          <div className="text-center py-4 animate-fade-up">
            <div className="w-20 h-20 rounded-full bg-ap-green/10 flex items-center justify-center mx-auto mb-5">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.2">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-[22px] font-bold text-ap-primary">ส่งคำขอฝากเงินแล้ว!</h2>
            <p className="text-[13px] text-ap-secondary mt-1.5">ระบบกำลังตรวจสอบสลิปของคุณ</p>

            <div className="mt-5 bg-ap-bg rounded-2xl p-4 text-left space-y-2.5">
              {[
                { label: "จำนวนเงิน",    value: `฿${parseFloat(amount || "0").toLocaleString("th-TH")}`, blue: true  },
                { label: "วิธีฝาก",     value: method ? CHANNEL_META[method].title : "",                 blue: false },
                { label: "โอนไปที่",    value: selectedBank ? `${selectedBank.bank_name} · ${selectedBank.acc_no}` : displayName, blue: false },
                ...(depositId ? [{ label: "หมายเลขอ้างอิง", value: `#${depositId}`, blue: false }] : []),
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3">
                  <span className="text-[13px] text-ap-secondary flex-shrink-0">{row.label}</span>
                  <span className={`text-[13px] font-semibold text-right ${row.blue ? "text-ap-blue" : "text-ap-primary"}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <a
              href={`/${lang}/profile`}
              className="mt-5 flex items-center justify-center w-full bg-ap-blue text-white rounded-full py-3.5 text-[15px] font-semibold hover:bg-ap-blue-h transition-colors"
            >
              กลับหน้าโปรไฟล์
            </a>
          </div>
        )}
      </div>

      {phase !== "done" && <Notes />}
    </div>
  );
}
