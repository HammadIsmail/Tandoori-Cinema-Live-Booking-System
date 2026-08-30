import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { cookies } from "next/headers";
import crypto from "crypto";

// Helper for generating secure OTP hashes
const generateHash = (data: string) => {
  const secret = process.env.JWT_SECRET || "default_development_secret";
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, email, ...data } = body;

    if (!type || !email) {
      return NextResponse.json(
        { error: "Missing required fields (type, email)" },
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

    let subject = "";
    let htmlTemplate = "";

    if (type === "otp") {
      // 1. OTP Email
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      subject = "Your Verification Code";
      htmlTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 30px; text-align: center;">
          <h2 style="color: #FF6A00; margin-top: 0;">Welcome to Mall1Tandoori!</h2>
          <p>Please use the following code to verify your email address. This code will expire in 10 minutes.</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 5px; margin: 30px 0; color: #1a1a1a;">${otp}</div>
          <p style="font-size: 12px; color: #6b7280; margin-bottom: 0;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `;

      // Store hashed OTP in a cookie for verification
      const otpHash = generateHash(email + otp);
      const cookieStore = await cookies();
      cookieStore.set("otp_hash", otpHash, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 600, // 10 minutes
        path: "/",
      });
      cookieStore.set("otp_email", email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 600,
        path: "/",
      });
    } else if (type === "pending") {
      // 2. Pending Booking Email
      const { movieTitle, bookingId, totalAmount } = data;
      const shortId = bookingId?.slice(0, 8).toUpperCase() || "";
      subject = `Booking Pending Approval: ${movieTitle}`;
      htmlTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #f3f4f6; padding: 30px; text-align: center; color: #1a1a1a;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Booking Under Review</h1>
            <p style="margin: 5px 0 0; color: #4b5563;">Your payment is being verified</p>
          </div>
          <div style="padding: 30px;">
            <p>Hi there,</p>
            <p>We've received your booking request for <strong>${movieTitle}</strong>.</p>
            <p>Your payment of Rs. ${totalAmount} is currently being verified by our team. Once approved, you will receive your official E-Ticket in a separate email.</p>
            <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">Booking ID: ${shortId}</p>
          </div>
        </div>
      `;
    } else if (type === "ticket") {
      // 3. Official Ticket Email
      const { bookingId, movieTitle, hallName, format, date, time, seats, totalAmount } = data;
      const shortId = bookingId?.slice(0, 8).toUpperCase() || "";
      const seatString = seats?.join(", ") || "";
      subject = `Your Cinema Tickets: ${movieTitle} (${shortId})`;
      htmlTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(to right, #FF6A00, #FF8A3D); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Mall1Tandoori E-Ticket</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">Booking Confirmed & Approved</p>
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
    } else {
      return NextResponse.json({ error: "Invalid email type" }, { status: 400 });
    }

    const mailOptions = {
      from: `"Mall1Tandoori Cinema" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject,
      html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Email sent successfully" });
  } catch (error: any) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: "Failed to send email", details: error.message },
      { status: 500 }
    );
  }
}
