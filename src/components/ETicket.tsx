"use client";

import { useRef } from "react";

import html2canvas from "html2canvas";

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

  const handleDownload = () => {
    const width = 400;
    const height = 400;
    const canvas = document.createElement("canvas");
    const scale = 2; // High-res export
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(scale, scale);

    // Base background & Border
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);

    // Header background (Gradient)
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, "#FF6A00");
    gradient.addColorStop(1, "#FF8A3D");
    ctx.fillStyle = gradient;
    ctx.fillRect(2, 2, width - 4, 80);

    // Header Text
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "12px Arial, sans-serif";
    ctx.fillText("E-TICKET", width / 2, 35);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px Arial, sans-serif";
    ctx.fillText("Mall1Tandoori", width / 2, 60);

    // Body text
    ctx.textAlign = "left";
    ctx.fillStyle = "#1A1A1A";
    ctx.font = "bold 22px Arial, sans-serif";
    ctx.fillText(ticket.movieTitle, 30, 130);

    ctx.fillStyle = "#6b7280";
    ctx.font = "14px Arial, sans-serif";
    ctx.fillText(`${ticket.hallName} • ${ticket.format}`, 30, 160);
    ctx.fillText(`${ticket.date} at ${ticket.time}`, 30, 185);

    // Seats row
    ctx.fillText("Seats: ", 30, 215);
    let xOffset = 80;
    ticket.seats.forEach((seat) => {
      ctx.fillStyle = "#f3f4f6";
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(xOffset, 200, 32, 20, 10);
        ctx.fill();
      } else {
        ctx.fillRect(xOffset, 200, 32, 20);
      }
      ctx.fillStyle = "#1A1A1A";
      ctx.font = "bold 12px Arial, sans-serif";
      const metrics = ctx.measureText(seat);
      const textX = xOffset + (32 - metrics.width) / 2;
      ctx.fillText(seat, textX, 214);
      xOffset += 38;
    });

    // Divider line
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(30, 250);
    ctx.lineTo(width - 30, 250);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Amount Paid & Booking ID
    ctx.fillStyle = "#9ca3af";
    ctx.font = "10px Arial, sans-serif";
    ctx.fillText("AMOUNT PAID", 30, 280);
    ctx.fillStyle = "#E63946";
    ctx.font = "bold 20px Arial, sans-serif";
    ctx.fillText(`Rs. ${ticket.totalAmount}`, 30, 305);

    ctx.textAlign = "right";
    ctx.fillStyle = "#9ca3af";
    ctx.font = "10px Arial, sans-serif";
    ctx.fillText("BOOKING ID", width - 30, 280);
    ctx.fillStyle = "#1A1A1A";
    ctx.font = "bold 18px Arial, sans-serif";
    ctx.fillText(ticket.bookingId.slice(0, 8).toUpperCase(), width - 30, 305);

    // Footer section
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(2, height - 50, width - 4, 48);
    ctx.textAlign = "center";
    ctx.fillStyle = "#9ca3af";
    ctx.font = "10px Arial, sans-serif";
    ctx.fillText("SHOW THIS TICKET AT THE CINEMA ENTRANCE", width / 2, height - 20);

    // Download image
    const link = document.createElement("a");
    link.download = `ticket-${ticket.bookingId.slice(0, 8)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
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
