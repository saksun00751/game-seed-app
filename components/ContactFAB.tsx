"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getContactChannels, type ContactChannel } from "@/lib/api/contact-channels";
import { getTranslation } from "@/lib/i18n/getTranslation";

function getChannelMeta(type: string) {
  if (type === "line") return {
    color: "#06C755",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C6.48 2 2 6.02 2 11c0 3.07 1.6 5.78 4.08 7.5L5 21l3.13-1.56C9.32 19.78 10.63 20 12 20c5.52 0 10-4.02 10-9S17.52 2 12 2zm1 13H7v-1.5h6V15zm2-3H7v-1.5h8V12zm0-3H7V7.5h8V9z" />
      </svg>
    ),
  };
  if (type === "telegram") return {
    color: "#229ED9",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.69 7.96c-.12.55-.46.68-.93.43l-2.57-1.89-1.24 1.19c-.14.14-.25.25-.51.25l.18-2.61 4.7-4.24c.2-.18-.04-.28-.32-.1L7.54 14.5l-2.52-.79c-.55-.17-.56-.55.12-.81l9.86-3.8c.46-.17.86.11.64.7z" />
      </svg>
    ),
  };
  return {
    color: "#6366f1",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  };
}

export default function ContactFAB() {
  const params = useParams();
  const locale = params.locale as string;
  const [isOpen, setIsOpen] = useState(false);
  const [channels, setChannels] = useState<ContactChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const data = await getContactChannels(locale);
        setChannels(data);
      } catch (err) {
        console.error("Failed to fetch contact channels:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannels();
  }, [locale]);

  if (isLoading || channels.length === 0) return null;

  return (
    <>
      {/* FAB Menu Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Contact Buttons Menu */}
      {isOpen && (
        <div className="fixed bottom-24 right-5 z-50 space-y-2 animate-in fade-in zoom-in-95 duration-200">
          {channels.map((ch) => {
            const meta = getChannelMeta(ch.type);
            return (
              <a
                key={ch.code}
                href={ch.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-end gap-3 group"
                title={ch.label}
              >
                <div className="bg-white rounded-lg shadow-lg px-3 py-2 text-[12px] font-semibold text-ap-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {ch.label}
                </div>
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95"
                  style={{ backgroundColor: meta.color }}
                >
                  {meta.icon}
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center text-white font-bold text-2xl bg-ap-blue hover:opacity-90"
        aria-label="Contact us"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        )}
      </button>
    </>
  );
}
