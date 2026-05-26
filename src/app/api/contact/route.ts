// src/app/api/contact/route.ts
import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await resend.emails.send({
      from: "MindElement Contact <hello@mindelement.app>",
      to: ["hello@mindelement.app"],
      replyTo: email,
      subject: subject ? `[Contact] ${subject}` : `[Contact] Message from ${name}`,
      html: `
        <div style="font-family:var(--font-sans);max-width:560px;margin:0 auto;padding:32px;background:#FAFAF9;border-radius:16px;">
          <h2 style="color:#121212;font-size:22px;margin-bottom:4px;">New message from MindElement</h2>
          <p style="color:#64748B;font-size:13px;margin-bottom:24px;border-bottom:1px solid #E2E8F0;padding-bottom:16px;">
            Received via mindelement.app contact form
          </p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr><td style="padding:8px 0;font-size:13px;color:#64748B;width:80px;">Name</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#121212;">${name}</td></tr>
            <tr><td style="padding:8px 0;font-size:13px;color:#64748B;">Email</td><td style="padding:8px 0;font-size:14px;color:var(--color-accent-primary);"><a href="mailto:${email}">${email}</a></td></tr>
            ${subject ? `<tr><td style="padding:8px 0;font-size:13px;color:#64748B;">Subject</td><td style="padding:8px 0;font-size:14px;color:#121212;">${subject}</td></tr>` : ""}
          </table>
          <div style="background:white;border-radius:12px;padding:20px;border:1px solid #E2E8F0;">
            <p style="font-size:13px;color:#64748B;margin-bottom:8px;">Message</p>
            <p style="font-size:15px;color:#121212;line-height:1.7;white-space:pre-wrap;">${message}</p>
          </div>
          <p style="margin-top:24px;font-size:12px;color:#94A3B8;">Reply directly to this email to respond to ${name}.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}