"use client";

import { useRef } from "react";

interface TicketData {
  bookingId: string;
  movieTitle: string;
  hallName: string;
  format: string;
  date: string;
  time: string;
  seats: string[];
  totalAmount: number;
  customerName: string;
  paymentMethod: string;
}

export default function ETicket({ ticket }: { ticket: TicketData }) {
  const ticketRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!ticketRef.current) return;

    // Use html2canvas-style approach: create a canvas from the ticket
    const el = ticketRef.current;
    const canvas = document.createElement("canvas");
    const scale = 2;
    canvas.width = el.offsetWidth * scale;
    canvas.height = el.offsetHeight * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw background
    ctx.scale(scale, scale);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, el.offsetWidth, el.offsetHeight);

    // Draw content using foreignObject approach via SVG
    const data = new XMLSerializer().serializeToString(
      (() => {
        const div = document.createElement("div");
        div.innerHTML = `
          <div style="width:${el.offsetWidth}px;padding:24px;font-family:Arial,sans-serif;color:#1A1A1A;">
            <div style="text-align:center;margin-bottom:16px;">
              <div style="font-size:20px;font-weight:bold;">Mall1<span style="color:#FF6A00;">Tandoori</span></div>
              <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:2px;">E-Ticket</div>
            </div>
            <div style="border-top:2px dashed #ddd;padding-top:12px;margin-top:8px;">
              <div style="font-size:18px;font-weight:bold;margin-bottom:8px;">${ticket.movieTitle}</div>
              <div style="font-size:13px;color:#666;margin-bottom:4px;">${ticket.hallName} • ${ticket.format}</div>
              <div style="font-size:13px;color:#666;margin-bottom:4px;">${ticket.date} at ${ticket.time}</div>
              <div style="font-size:13px;color:#666;margin-bottom:8px;">Seats: ${ticket.seats.join(", ")}</div>
              <div style="display:flex;justify-content:space-between;border-top:2px dashed #ddd;padding-top:8px;margin-top:8px;">
                <div>
                  <div style="font-size:10px;color:#888;text-transform:uppercase;">Amount Paid</div>
                  <div style="font-size:16px;font-weight:bold;color:#E63946;">Rs. ${ticket.totalAmount}</div>
                </div>
                <div style="text-align:right;">
                  <div style="font-size:10px;color:#888;text-transform:uppercase;">Booking ID</div>
                  <div style="font-size:11px;font-weight:bold;">${ticket.bookingId.slice(0, 8).toUpperCase()}</div>
                </div>
              </div>
            </div>
            <div style="text-align:center;margin-top:12px;font-size:10px;color:#888;">
              Show this ticket at the cinema entrance
            </div>
          </div>
        `;
        return div;
      })()
    );

    const img = new Image();
    const svgBlob = new Blob(
      [`<svg xmlns="http://www.w3.org/2000/svg" width="${el.offsetWidth}" height="${el.offsetHeight}"><foreignObject width="100%" height="100%">${data}</foreignObject></svg>`],
      { type: "image/svg+xml;charset=utf-8" }
    );
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const link = document.createElement("a");
      link.download = `ticket-${ticket.bookingId.slice(0, 8)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = url;
  };

  return (
    <div>
      <div ref={ticketRef} className="bg-white rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-primary text-white text-center py-4 px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">E-Ticket</p>
          <h3 className="text-lg font-bold mt-1">
            Mall1<span className="text-white/90">Tandoori</span>
          </h3>
        </div>

        {/* Body */}
        <div className="p-5">
          <h4 className="text-lg font-bold text-[#1A1A1A] mb-2">{ticket.movieTitle}</h4>
          <div className="text-sm text-gray-500 space-y-1 mb-4">
            <p>{ticket.hallName} • {ticket.format}</p>
            <p>{ticket.date} at {ticket.time}</p>
            <p>
              Seats:{" "}
              {ticket.seats.map((s, i) => (
                <span key={i} className="inline-block bg-gray-100 text-[#1A1A1A] text-xs font-medium px-2 py-0.5 rounded-full mr-1">
                  {s}
                </span>
              ))}
            </p>
          </div>

          <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center">
            <div>
              <p className="text-[10px] text-gray-400 uppercase">Amount Paid</p>
              <p className="text-lg font-bold text-[#E63946]">Rs. {ticket.totalAmount}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase">Booking ID</p>
              <p className="text-sm font-bold text-[#1A1A1A]">{ticket.bookingId.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 text-center py-3 px-5">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">
            Show this ticket at the cinema entrance
          </p>
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="mt-3 w-full btn-pill text-sm flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download Ticket
      </button>
    </div>
  );
}
