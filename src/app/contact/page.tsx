// src/app/contact/page.tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text-primary)" }}>
      <Navbar />
      <main style={{ maxWidth: 600, margin: "0 auto", padding: "100px 24px 60px" }}>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-text-secondary)", textDecoration: "none", marginBottom: 32 }}>
            <ArrowLeft size={14} /> Back
          </Link>

          <h1 style={{ fontSize: 36, fontWeight: 700, fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", marginBottom: 8 }}>
            Get in touch
          </h1>
          <p style={{ fontSize: 15, color: "var(--color-text-secondary)", marginBottom: 40, lineHeight: 1.6 }}>
            Questions, feedback, or just want to say hello — we read everything.
          </p>

          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                style={{ background: "rgba(34,197,94,0.08)", border: "0.5px solid rgba(34,197,94,0.3)", borderRadius: 20, padding: "48px 32px", textAlign: "center" }}>
                <CheckCircle size={40} color="#22C55E" style={{ margin: "0 auto 16px" }} />
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 8 }}>Message sent</h2>
                <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 24 }}>We'll get back to you within 24 hours.</p>
                <button onClick={() => setStatus("idle")}
                  style={{ padding: "10px 24px", borderRadius: 12, border: "0.5px solid var(--color-border)", background: "var(--color-surface)", fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", cursor: "pointer" }}>
                  Send another
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Field label="Name" required>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your name" required style={inputStyle} />
                  </Field>
                  <Field label="Email" required>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="you@example.com" required style={inputStyle} />
                  </Field>
                </div>

                <Field label="Subject">
                  <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder="What's this about?" style={inputStyle} />
                </Field>

                <Field label="Message" required>
                  <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Tell us what's on your mind..." required rows={6}
                    style={{ ...inputStyle, resize: "vertical", minHeight: 140 }} />
                </Field>

                {status === "error" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "0.5px solid rgba(239,68,68,0.2)", fontSize: 13, color: "var(--color-error)" }}>
                    <AlertCircle size={15} /> Something went wrong. Please try again.
                  </motion.div>
                )}

                <motion.button type="submit" disabled={status === "sending"}
                  whileTap={{ scale: 0.98 }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 28px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))", color: "white", fontSize: 15, fontWeight: 700, cursor: status === "sending" ? "not-allowed" : "pointer", opacity: status === "sending" ? 0.7 : 1 }}>
                  <Send size={15} />
                  {status === "sending" ? "Sending..." : "Send message"}
                </motion.button>

              </motion.form>
            )}
          </AnimatePresence>

        </motion.div>
      </main>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", letterSpacing: "0.05em" }}>
        {label}{required && <span style={{ color: "var(--color-error)", marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "11px 14px",
  borderRadius: 12,
  border: "0.5px solid var(--color-border)",
  background: "var(--color-surface)",
  fontSize: 14,
  color: "var(--color-text-primary)",
  outline: "none",
  width: "100%",
  fontFamily: "inherit",
};