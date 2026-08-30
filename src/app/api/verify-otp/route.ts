import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

// Helper for generating secure OTP hashes (must match send-email route)
const generateHash = (data: string) => {
  const secret = process.env.JWT_SECRET || "default_development_secret";
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
};

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const storedHash = cookieStore.get("otp_hash")?.value;
    const storedEmail = cookieStore.get("otp_email")?.value;

    if (!storedHash || !storedEmail) {
      return NextResponse.json(
        { error: "OTP has expired or was not requested. Please try again." },
        { status: 400 }
      );
    }

    if (email !== storedEmail) {
      return NextResponse.json(
        { error: "Invalid email for this OTP." },
        { status: 400 }
      );
    }

    const calculatedHash = generateHash(email + otp);

    if (calculatedHash === storedHash) {
      // Success! Clear the cookies so they can't be reused.
      cookieStore.delete("otp_hash");
      cookieStore.delete("otp_email");
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Invalid OTP code. Please try again." },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "Verification failed", details: error.message },
      { status: 500 }
    );
  }
}
