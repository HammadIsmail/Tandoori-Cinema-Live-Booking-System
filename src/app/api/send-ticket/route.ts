import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      email, 
      bookingId, 
      movieTitle, 
      hallName, 
      format, 
      date, 
      time, 
      seats, 
      totalAmount 
    } = body;

    if (!email || !bookingId) {
      return NextResponse.json(
        { error: "Missing required fields (email, bookingId)" },
        { status: 400 }
      );
    }

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const shortId = bookingId.slice(0, 8).toUpperCase();
    const seatString = seats.join(", ");

    // HTML Email Template
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(to right, #FF6A00, #FF8A3D); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Mall1Tandoori E-Ticket</h1>
          <p style="margin: 5px 0 0; opacity: 0.9;">Booking Confirmed</p>
        </div>
        
        <div style="padding: 30px; background-color: white; color: #1a1a1a;">
          <h2 style="margin-top: 0; font-size: 22px;">${movieTitle}</h2>
          
          <div style="margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: bold;">Date & Time</p>
              <p style="margin: 5px 0 0; font-weight: bold;">${date} at ${time}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: bold;">Screen & Format</p>
              <p style="margin: 5px 0 0; font-weight: bold;">${hallName} • ${format}</p>
            </div>
          </div>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px dashed #e5e7eb;">
            <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: bold;">Seats</p>
            <p style="margin: 5px 0 0; font-weight: bold; font-size: 18px; color: #FF6A00;">${seatString}</p>
          </div>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px dashed #e5e7eb; display: grid; grid-template-columns: 1fr 1fr;">
            <div>
              <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: bold;">Booking ID</p>
              <p style="margin: 5px 0 0; font-weight: bold; font-size: 16px;">${shortId}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: bold;">Amount Paid</p>
              <p style="margin: 5px 0 0; font-weight: bold; font-size: 16px; color: #E63946;">Rs. ${totalAmount}</p>
            </div>
          </div>
        </div>

        <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
          <p style="margin: 0;">Please show this email or your E-Ticket at the cinema entrance.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Mall1Tandoori Cinema" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: `Your Cinema Tickets: ${movieTitle} (${shortId})`,
      html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Ticket sent successfully" });
  } catch (error: any) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: "Failed to send email", details: error.message },
      { status: 500 }
    );
  }
}
