"use client";

import { useState } from "react";

interface ResultLink {
  name:    string;
  flag:    string;
  closeAt: string;
  drawAt:  string;
  url:     string;
}

interface Tab {
  id:    string;
  label: string;
  emoji: string;
  gradient: string;
  items: ResultLink[];
}

const TABS: Tab[] = [
  {
    id:       "thai",
    label:    "หวยไทย",
    emoji:    "🇹🇭",
    gradient: "from-ap-blue to-sky-400",
    items: [
      { name: "หวยรัฐบาล", flag: "🇹🇭", closeAt: "15:00 น.", drawAt: "15:30 น.", url: "https://www.glo.or.th" },
      { name: "หวยออมสิน", flag: "💰",   closeAt: "10:40 น.", drawAt: "11:00 น.", url: "https://www.gsb.or.th" },
      { name: "หวย ธ.ก.ส.", flag: "🌾",  closeAt: "10:20 น.", drawAt: "12:00 น.", url: "https://www.baac.or.th" },
    ],
  },
  {
    id:       "foreign",
    label:    "หวยต่างประเทศ",
    emoji:    "🌏",
    gradient: "from-emerald-500 to-teal-400",
    items: [
      { name: "ฮานอย พิเศษ",  flag: "🇻🇳", closeAt: "11:50 น.", drawAt: "12:00 น.", url: "https://www.xosovietnam.net" },
      { name: "ฮานอย 17:00",  flag: "🇻🇳", closeAt: "16:50 น.", drawAt: "17:00 น.", url: "https://www.xosovietnam.net" },
      { name: "ฮานอย VIP",    flag: "🇻🇳", closeAt: "18:00 น.", drawAt: "18:10 น.", url: "https://www.xosovietnam.net" },
      { name: "ฮานอย Extra",  flag: "🇻🇳", closeAt: "20:50 น.", drawAt: "21:00 น.", url: "https://www.xosovietnam.net" },
      { name: "ลาว (รัฐบาล)", flag: "🇱🇦", closeAt: "20:10 น.", drawAt: "20:20 น.", url: "https://www.laos-lottery.com" },
      { name: "ลาว VIP",      flag: "🇱🇦", closeAt: "20:35 น.", drawAt: "20:45 น.", url: "https://www.laos-lottery.com" },
      { name: "ลาว Star",     flag: "🇱🇦", closeAt: "21:20 น.", drawAt: "21:30 น.", url: "https://www.laos-lottery.com" },
      { name: "มาเลเซีย",    flag: "🇲🇾", closeAt: "18:50 น.", drawAt: "19:00 น.", url: "https://www.magnum4d.my" },
      { name: "สิงคโปร์",    flag: "🇸🇬", closeAt: "18:20 น.", drawAt: "18:30 น.", url: "https://www.singaporepools.com.sg" },
    ],
  },
  {
    id:       "daily",
    label:    "หวยรายวัน",
    emoji:    "⚡",
    gradient: "from-yellow-500 to-orange-400",
    items: [
      { name: "Speed ยี่กี รอบ 1", flag: "⚡", closeAt: "ทุก 5 นาที", drawAt: "ทุก 5 นาที", url: "" },
      { name: "Speed ยี่กี รอบ 2", flag: "⚡", closeAt: "ทุก 5 นาที", drawAt: "ทุก 5 นาที", url: "" },
      { name: "Super ยี่กี VIP",   flag: "🎰", closeAt: "ทุก 15 นาที", drawAt: "ทุก 15 นาที", url: "" },
    ],
  },
  {
    id:       "stock",
    label:    "หวยหุ้น",
    emoji:    "📈",
    gradient: "from-violet-600 to-indigo-400",
    items: [
      { name: "หุ้นไทย เช้า",    flag: "📈", closeAt: "10:50 น.", drawAt: "11:00 น.", url: "https://www.set.or.th" },
      { name: "หุ้นไทย บ่าย",   flag: "📊", closeAt: "14:20 น.", drawAt: "14:30 น.", url: "https://www.set.or.th" },
      { name: "หุ้นไทย ปิด",    flag: "📉", closeAt: "16:20 น.", drawAt: "16:30 น.", url: "https://www.set.or.th" },
      { name: "นิเคอิ เช้า",    flag: "🇯🇵", closeAt: "08:50 น.", drawAt: "09:00 น.", url: "https://www.jpx.co.jp" },
      { name: "นิเคอิ บ่าย",    flag: "🇯🇵", closeAt: "13:50 น.", drawAt: "14:00 น.", url: "https://www.jpx.co.jp" },
      { name: "จีน เช้า",       flag: "🇨🇳", closeAt: "09:50 น.", drawAt: "10:00 น.", url: "https://www.sse.com.cn" },
      { name: "จีน บ่าย",       flag: "🇨🇳", closeAt: "13:50 น.", drawAt: "14:00 น.", url: "https://www.sse.com.cn" },
      { name: "ฮั่งเส็ง เช้า",  flag: "🇭🇰", closeAt: "09:50 น.", drawAt: "10:00 น.", url: "https://www.hkex.com.hk" },
      { name: "ฮั่งเส็ง บ่าย",  flag: "🇭🇰", closeAt: "14:20 น.", drawAt: "14:30 น.", url: "https://www.hkex.com.hk" },
      { name: "ดาวโจนส์",       flag: "🇺🇸", closeAt: "03:50 น.", drawAt: "04:00 น.", url: "https://www.nyse.com" },
    ],
  },
];

export default function ResultsPage() {
  const [activeTab, setActiveTab] = useState("thai");
  const tab = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="max-w-5xl mx-auto px-5 pt-6 space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-[20px] font-bold text-ap-primary tracking-tight">🏆 ลิ้งค์ดูผลหวย</h1>
        <p className="text-[13px] text-ap-secondary mt-0.5">รวมลิ้งค์ตรวจผลหวยทุกประเภท</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-ap-border shadow-card overflow-hidden">

        {/* Tab bar */}
        <div className={`bg-gradient-to-r ${tab.gradient} p-1 flex gap-1`}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={[
                "flex-1 py-2 rounded-xl text-[13px] font-semibold transition-all",
                activeTab === t.id
                  ? "bg-white text-ap-primary shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10",
              ].join(" ")}
            >
              <span className="mr-1">{t.emoji}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab header */}
        <div className={`bg-gradient-to-r ${tab.gradient} px-4 pb-3 pt-1`}>
          <p className="text-white font-bold text-[15px]">{tab.emoji} {tab.label}</p>
        </div>

        {/* Items */}
        <div className="divide-y divide-ap-border">
          {tab.items.map((item) => (
            <div key={item.name} className="flex items-center gap-4 px-4 py-3.5 hover:bg-ap-bg transition-colors">

              {/* Flag */}
              <span className="text-[28px] flex-shrink-0 w-10 text-center">{item.flag}</span>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-ap-primary">{item.name}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                  <span className="flex items-center gap-1 text-[12px] text-ap-secondary">
                    <span className="text-ap-red">⊗</span> ปิดรับ: {item.closeAt}
                  </span>
                  <span className="flex items-center gap-1 text-[12px] text-ap-secondary">
                    <span className="text-ap-green">⊙</span> ผลออก: {item.drawAt}
                  </span>
                </div>
              </div>

              {/* Link */}
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 flex items-center gap-1.5 bg-ap-blue/10 text-ap-blue text-[12px] font-semibold px-3 py-1.5 rounded-full hover:bg-ap-blue hover:text-white transition-all"
                >
                  ดูผล
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <path d="M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              ) : (
                <span className="flex-shrink-0 text-[12px] text-ap-tertiary px-3 py-1.5">ในระบบ</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
