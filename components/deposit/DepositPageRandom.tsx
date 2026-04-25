"use client";

import { useEffect, useState } from "react";
import Toast from "@/components/ui/Toast";
import PromotionPanel from "@/components/deposit/PromotionPanel";
import { useLang } from "@/lib/i18n/context";

function formatBankAccount(account: string): string {
  const digits = account.replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 12) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 4)}-${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  return account;
}

interface ActivePromotion {
  select: boolean;
  name: string;
  min: string;
}

interface Props {
  displayName:  string;
  bankName:     string | null;
  bankLogo:     string | null;
  bankAccount:  string | null;
  balance:      number;
  selectedPromotion?: ActivePromotion | null;
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
}

interface LoadBankApiPayload {
  success?: boolean;
  message?: string;
  bank?: LoadBankAccount[] | Record<string, Partial<LoadBankAccount>>;
  data?: { bank?: LoadBankAccount[]; items?: LoadBankAccount[]; accounts?: LoadBankAccount[] } | LoadBankAccount[];
}

type Method = "bank" | "tw";
type Step = "method" | "amount" | "result";

function normalizeAccount(a: Partial<LoadBankAccount> | undefined, fallbackCode: number): LoadBankAccount | null {
  if (!a?.acc_no || !a?.acc_name || !a?.bank_name) return null;
  return {
    acc_no:      a.acc_no,
    acc_name:    a.acc_name,
    bank_name:   a.bank_name,
    bank_pic:    a.bank_pic ?? "",
    qr_pic:      a.qr_pic ?? "",
    qrcode:      Boolean(a.qrcode),
    code:        typeof a.code === "number" ? a.code : fallbackCode,
    deposit_min: a.deposit_min ?? "0.00",
    remark:      a.remark ?? "",
  };
}

function extractAccounts(payload: LoadBankApiPayload): LoadBankAccount[] {
  const map = (arr: Partial<LoadBankAccount>[]) =>
    arr.map((a, i) => normalizeAccount(a, i + 1)).filter(Boolean) as LoadBankAccount[];
  if (Array.isArray(payload.bank)) return map(payload.bank);
  if (payload.bank && typeof payload.bank === "object") {
    const obj = payload.bank as Record<string, unknown>;
    if (typeof obj.acc_no === "string" && typeof obj.acc_name === "string" && typeof obj.bank_name === "string") {
      const single = normalizeAccount(obj as Partial<LoadBankAccount>, 1);
      return single ? [single] : [];
    }
    return Object.entries(obj).map(([k, a], i) =>
      normalizeAccount(a as Partial<LoadBankAccount>, Number(k) || i + 1)
    ).filter(Boolean) as LoadBankAccount[];
  }
  if (Array.isArray(payload.data)) return map(payload.data);
  if (payload.data && Array.isArray(payload.data.bank)) return map(payload.data.bank);
  if (payload.data && Array.isArray(payload.data.items)) return map(payload.data.items);
  if (payload.data && Array.isArray(payload.data.accounts)) return map(payload.data.accounts);
  return [];
}

const METHOD_META: Record<Method, { icon: string; title: string; desc: string }> = {
  bank: { icon: "🏦", title: "ธนาคาร",     desc: "โอนผ่านบัญชีธนาคาร" },
  tw:   { icon: "💚", title: "TrueWallet", desc: "โอนผ่านทรูวอลเล็ต" },
};

export default function DepositPageRandom({ displayName, bankName, bankLogo, bankAccount, balance, selectedPromotion }: Props) {
  const { lang } = useLang();
  const [activePromotion, setActivePromotion] = useState<ActivePromotion | null>(
    selectedPromotion?.select ? selectedPromotion : null,
  );
  const [step, setStep]                 = useState<Step>("method");
  const [method, setMethod]             = useState<Method | null>(null);
  const [channels, setChannels]         = useState<DepositChannels | null>(null);
  const [channelsLoading, setChannelsLoading] = useState(true);
  const [amount, setAmount]             = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [pickedAccount, setPickedAccount] = useState<LoadBankAccount | null>(null);
  const [error, setError]               = useState<string | null>(null);
  const [toast, setToast]               = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetch("/api/deposit/channels")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data?.deposit) setChannels(data.data.deposit);
      })
      .catch(() => {})
      .finally(() => setChannelsLoading(false));
  }, []);

  function notify(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
  }

  function selectMethod(m: Method) {
    setMethod(m);
    setError(null);
    setAmount("");
    setStep("amount");
  }

  async function handleNext() {
    if (!method) return;
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setError("กรุณากรอกจำนวนเงินให้ถูกต้อง");
      return;
    }
    if (activePromotion?.select) {
      const min = parseFloat(activePromotion.min);
      if (Number.isFinite(min) && amt < min) {
        setError(`โปรโมชั่น "${activePromotion.name}" ขั้นต่ำ ฿${min.toLocaleString("en-US")}`);
        return;
      }
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/deposit/loadbank/random", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method }),
      });
      const data: LoadBankApiPayload = await res.json();
      const accounts = extractAccounts(data);
      if (!data.success || accounts.length === 0) {
        setError(data.message ?? "ไม่สามารถโหลดบัญชีรับเงินได้");
        return;
      }
      const picked = accounts[0];
      const min = parseFloat(picked.deposit_min) || 0;
      if (amt < min) {
        setError(`ยอดฝากขั้นต่ำ ฿${min.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        return;
      }
      setPickedAccount(picked);
      setStep("result");
    } catch {
      setError("ไม่สามารถเชื่อมต่อระบบได้");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text.replace(/\s+/g, ""));
      notify(`คัดลอก${label}แล้ว`, "success");
    } catch {
      notify("ไม่สามารถคัดลอกได้", "error");
    }
  }

  function reset() {
    setStep("method");
    setMethod(null);
    setAmount("");
    setPickedAccount(null);
    setError(null);
  }

  const methods: Method[] = [];
  if (!channels || channels.bank === 1) methods.push("bank");
  if (!channels || channels.tw === 1) methods.push("tw");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-5 pt-5 sm:pt-6">

      {/* Balance card */}
      <div className="relative overflow-hidden bg-[linear-gradient(160deg,#ffffff_0%,#f8fbff_100%)] rounded-2xl border border-slate-200 shadow-[0_14px_30px_rgba(15,23,42,0.10)] px-5 py-4 mb-3">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(59,130,246,0.12),transparent_42%)] pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-300/60 to-transparent" />
        <p className="relative text-[12px] text-slate-500 uppercase tracking-[0.08em] font-semibold mb-1">ยอดคงเหลือ</p>
        <p className="relative text-[32px] font-extrabold text-slate-900 tabular-nums leading-tight tracking-tight">
          ฿{balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      {/* User bank info card */}
      <div className="relative bg-[linear-gradient(165deg,#ffffff_0%,#f9fbff_100%)] rounded-2xl border border-slate-200 shadow-[0_14px_30px_rgba(15,23,42,0.10)] px-5 py-4 mb-5">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-200/70 to-transparent" />
        <p className="text-[12px] text-slate-500 uppercase tracking-[0.08em] font-semibold mb-2">บัญชีธนาคารของฉัน</p>
        {bankAccount ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                {bankLogo ? (
                  <img src={bankLogo} alt={bankName ?? "ธนาคาร"} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-[16px]" aria-hidden>🏦</span>
                )}
              </div>
              <div>
                <p className="text-[14px] font-semibold text-slate-900">{displayName}</p>
                {bankName && <p className="text-[13px] text-slate-600 mt-0.5">{bankName}</p>}
              </div>
            </div>
            <p className="text-[14px] font-mono font-semibold text-slate-900 tracking-wider bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
              {formatBankAccount(bankAccount)}
            </p>
          </div>
        ) : (
          <p className="text-[13px] text-ap-tertiary">ยังไม่ได้ผูกบัญชีธนาคาร</p>
        )}
      </div>

      <PromotionPanel
        lang={lang}
        initialActive={selectedPromotion?.select ? selectedPromotion : null}
        onNotify={(message, type) => notify(message, type)}
        onActiveChange={(next) => setActivePromotion(next)}
      />

      <div className="bg-white rounded-2xl border border-ap-border p-5 shadow-sm">
        <h1 className="text-[18px] font-extrabold text-ap-primary">ฝากเงิน</h1>

        {/* Stepper */}
        <div className="mt-4 flex items-center w-full">
          {(["method", "amount", "result"] as Step[]).map((s, i) => {
            const order = ["method", "amount", "result"];
            const cur   = order.indexOf(step);
            const idx   = order.indexOf(s);
            const done  = idx < cur;
            const active = idx === cur;
            const labels = ["เลือกช่องทาง", "กรอกจำนวนเงิน", "บัญชีรับเงิน"];
            return (
              <div key={s} className={[i < 2 ? "flex-1" : "", "flex items-center"].join(" ")}>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className={[
                    "w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-all",
                    active ? "bg-ap-blue text-white" : done ? "bg-ap-blue/15 text-ap-blue" : "bg-ap-bg text-ap-tertiary",
                  ].join(" ")}>
                    {i + 1}
                  </div>
                  <span className={[
                    "text-[11px] font-semibold whitespace-nowrap",
                    active ? "text-ap-blue" : done ? "text-ap-secondary" : "text-ap-tertiary",
                  ].join(" ")}>
                    {labels[i]}
                  </span>
                </div>
                {i < 2 && <div className={["flex-1 h-0.5 mx-2 -mt-4", done ? "bg-ap-blue/40" : "bg-ap-border"].join(" ")} />}
              </div>
            );
          })}
        </div>

        {/* Step 1: Select method */}
        {step === "method" && (
          <div className="mt-5">
            {selectedPromotion?.select && (
              <div className="mb-3 rounded-xl bg-ap-blue/5 border border-ap-blue/20 px-3 py-2">
                <p className="text-[12px] text-ap-tertiary">โปรโมชั่นที่เลือก</p>
                <p className="text-[14px] font-bold text-ap-blue">{selectedPromotion.name}</p>
                <p className="text-[12px] text-ap-secondary">
                  ขั้นต่ำ ฿{(parseFloat(selectedPromotion.min) || 0).toLocaleString("en-US")}
                </p>
              </div>
            )}
            <p className="text-[14px] font-bold text-ap-primary mb-3">เลือกช่องทาง</p>
            {channelsLoading ? (
              <p className="text-[13px] text-ap-tertiary">กำลังโหลด...</p>
            ) : methods.length === 0 ? (
              <p className="text-[13px] text-ap-red">ไม่มีช่องทางที่เปิดใช้งาน</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {methods.map((m) => {
                  const meta = METHOD_META[m];
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => selectMethod(m)}
                      className="flex items-center gap-3 p-4 rounded-2xl border-2 border-ap-border hover:border-ap-blue hover:bg-ap-blue/5 active:scale-[0.98] transition-all text-left"
                    >
                      <span className="text-[28px] leading-none">{meta.icon}</span>
                      <div>
                        <p className="text-[15px] font-bold text-ap-primary">{meta.title}</p>
                        <p className="text-[12px] text-ap-tertiary">{meta.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Amount */}
        {step === "amount" && method && (
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[22px] leading-none">{METHOD_META[method].icon}</span>
              <p className="text-[15px] font-bold text-ap-primary">{METHOD_META[method].title}</p>
            </div>

            <label className="block text-[13px] font-semibold text-ap-secondary mb-1.5">จำนวนเงิน</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] font-bold text-ap-tertiary">฿</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                placeholder="0"
                className="w-full h-12 pl-9 pr-3 rounded-xl border-2 border-ap-border focus:border-ap-blue focus:outline-none text-[16px] font-bold tabular-nums"
              />
            </div>

            {error && <p className="mt-2 text-[13px] text-ap-red">{error}</p>}

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={reset}
                className="flex-1 h-12 rounded-xl border border-ap-border text-[14px] font-bold text-ap-secondary hover:bg-ap-bg transition-colors"
              >
                ย้อนกลับ
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={submitting}
                className="flex-1 h-12 rounded-xl bg-ap-blue text-white text-[14px] font-bold shadow-sm hover:bg-ap-blue-h active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {submitting ? "กำลังสุ่มบัญชี..." : "ถัดไป"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Result */}
        {step === "result" && pickedAccount && (
          <div className="mt-5">
            <div className="rounded-2xl bg-ap-blue/5 border border-ap-blue/20 px-3 py-2 mb-3">
              <p className="text-[12px] text-ap-tertiary">โอนจำนวน</p>
              <p className="text-[20px] font-extrabold text-ap-blue tabular-nums">
                ฿{Number(amount).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="rounded-2xl border-2 border-ap-blue bg-ap-blue/5 p-4">
              <div className="flex items-center gap-3">
                {pickedAccount.bank_pic ? (
                  <img src={pickedAccount.bank_pic} alt={pickedAccount.bank_name} className="w-12 h-12 rounded-xl object-contain bg-white border border-ap-border" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-white border border-ap-border flex items-center justify-center text-[22px]">🏦</div>
                )}
                <div className="min-w-0">
                  <p className="text-[15px] font-bold text-ap-primary truncate">{pickedAccount.bank_name}</p>
                  <p className="text-[13px] text-ap-secondary truncate">{pickedAccount.acc_name}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-white border border-ap-border px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-ap-tertiary uppercase tracking-wide leading-none">เลขบัญชี</p>
                  <p className="mt-1 text-[18px] font-mono font-bold text-ap-primary tracking-wider leading-none break-all">
                    {pickedAccount.acc_no}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(pickedAccount.acc_no, "เลขบัญชี")}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-ap-blue text-white text-[12px] font-bold shadow-sm hover:bg-ap-blue-h active:scale-95 transition-all flex-shrink-0"
                >
                  คัดลอก
                </button>
              </div>

              {pickedAccount.remark && (
                <p className="mt-2 text-[13px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
                  {pickedAccount.remark}
                </p>
              )}

              {pickedAccount.qrcode && pickedAccount.qr_pic && (
                <div className="mt-3 flex flex-col items-center gap-2 rounded-xl bg-white border border-ap-border p-3">
                  <p className="text-[12px] font-bold text-ap-tertiary uppercase tracking-wide">สแกน QR Code</p>
                  <img
                    src={pickedAccount.qr_pic}
                    alt="QR Code"
                    className="w-56 h-56 object-contain"
                  />
                </div>
              )}
            </div>

            <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2">
              <p className="text-[12px] text-amber-700">
                ⚠️ กรุณาโอนตามจำนวนที่ระบุ และใช้บัญชีที่ลงทะเบียนไว้เท่านั้น
              </p>
            </div>


            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep("amount")}
                className="flex-1 h-12 rounded-xl border border-ap-border text-[14px] font-bold text-ap-secondary hover:bg-ap-bg transition-colors"
              >
                ย้อนกลับ
              </button>
              <button
                type="button"
                onClick={reset}
                className="flex-1 h-12 rounded-xl bg-ap-blue text-white text-[14px] font-bold shadow-sm hover:bg-ap-blue-h active:scale-[0.98] transition-all"
              >
                เริ่มใหม่
              </button>
            </div>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
