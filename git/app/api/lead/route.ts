import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, notes, total, cfg } = body || {};

    if (!name || !email) {
      return NextResponse.json({ ok: false, error: "Naam en e‑mail zijn verplicht" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const html = `
      <h2>Nieuwe configuratie lead</h2>
      <p><b>Naam:</b> ${name}<br/>
         <b>E‑mail:</b> ${email}<br/>
         <b>Telefoon:</b> ${phone || "-"}<br/>
         <b>Totaal:</b> €${Number(total).toFixed(2)}</p>
      <pre style="white-space:pre-wrap">${JSON.stringify(cfg, null, 2)}</pre>`;

    await transporter.sendMail({
      from: process.env.MAIL_FROM || "noreply@adzaagt.nl",
      to: process.env.MAIL_TO || "productie@adzaagt.nl",
      subject: "Nieuwe maatkast lead",
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
