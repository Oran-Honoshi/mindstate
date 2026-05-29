// src/app/join/[code]/page.tsx
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/nav/Navbar";
import { useAuthStore } from "@/store/authStore";
import { createClient } from "@/lib/supabase/client";
import { joinFamilyGroup } from "@/lib/supabase/family";

export default function JoinPage() {
  const supabase = createClient();
  const { code } = useParams<{ code: string }>();
  const { user } = useAuthStore();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "joining" | "success" | "full" | "already" | "invalid" | "error">("loading");
  const [groupInfo, setGroupInfo] = useState<{ member_limit: number; current: number; admin: string } | null>(null);

  useEffect(() => {
    async function checkCode() {
      if (!code) { setStatus("invalid"); return; }

      const { data: group } = await supabase
        .from("family_groups")
        .select("id, member_limit, admin_id, profiles(username)")
        .eq("invite_code", code.toUpperCase())
        .single();

      if (!group) { setStatus("invalid"); return; }

      const { count } = await supabase
        .from("family_members")
        .select("*", { count: "exact", head: true })
        .eq("group_id", group.id);

      const current = count ?? 0;

      if (user) {
        // Check if already a member
        const { data: existing } = await supabase
          .from("family_members")
          .select("id")
          .eq("group_id", group.id)
          .eq("user_id", user.id)
          .single();

        if (existing) { setStatus("already"); return; }
      }

      const adminName = (group.profiles as { username?: string } | null)?.username ?? "the admin";
      setGroupInfo({
        member_limit: group.member_limit,
        current,
        admin: adminName,
      });

      if (current >= group.member_limit) { setStatus("full"); return; }
      setStatus("ready");
    }

    checkCode();
  }, [code, user]);

  async function joinGroup() {
    if (!user || !code) return;
    setStatus("joining");
    try {
      await joinFamilyGroup(code, user.id);
      setStatus("success");
      setTimeout(() => router.push("/family"), 2000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("full")) setStatus("full");
      else if (msg.includes("Already")) setStatus("already");
      else setStatus("error");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text-primary)" }}>
      <Navbar />
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "120px 24px 60px", textAlign: "center" }}>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {status === "loading" && (
            <p style={{ color: "var(--color-text-secondary)", fontSize: 15 }}>Checking invite link...</p>
          )}

          {status === "invalid" && (
            <>
              <AlertCircle size={48} color="var(--color-error)" style={{ margin: "0 auto 16px" }} />
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Invalid invite link</h1>
              <p style={{ color: "var(--color-text-secondary)", marginBottom: 24 }}>This invite link doesn't exist or has expired. Ask the group admin to send a new one.</p>
              <Link href="/" style={{ color: "var(--cyan)", textDecoration: "none", fontSize: 14 }}>Go home</Link>
            </>
          )}

          {status === "full" && groupInfo && (
            <>
              <AlertCircle size={48} color="#F59E0B" style={{ margin: "0 auto 16px" }} />
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Group is full</h1>
              <p style={{ color: "var(--color-text-secondary)", marginBottom: 8 }}>
                This family group is at capacity ({groupInfo.current}/{groupInfo.member_limit} members).
              </p>
              <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>Ask {groupInfo.admin} to remove a member and send a new invite.</p>
            </>
          )}

          {status === "already" && (
            <>
              <CheckCircle size={48} color="#22C55E" style={{ margin: "0 auto 16px" }} />
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Already a member</h1>
              <p style={{ color: "var(--color-text-secondary)", marginBottom: 24 }}>You're already in this family group.</p>
              <Link href="/family" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "12px 24px", borderRadius: 14, background: "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))", color: "white", fontWeight: 700, textDecoration: "none" }}>
                Go to Family <ArrowRight size={14} />
              </Link>
            </>
          )}

          {(status === "ready" || status === "joining") && groupInfo && (
            <>
              <div style={{ width: 72, height: 72, borderRadius: 24, background: "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <Users size={32} color="white" />
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: "var(--font-sans)", marginBottom: 8 }}>You're invited</h1>
              <p style={{ color: "var(--color-text-secondary)", marginBottom: 8, fontSize: 15 }}>
                {groupInfo.admin} invited you to their MindElement family group.
              </p>
              <p style={{ color: "var(--color-text-secondary)", fontSize: 13, marginBottom: 32 }}>
                {groupInfo.current} / {groupInfo.member_limit} members · {groupInfo.member_limit - groupInfo.current} slot{groupInfo.member_limit - groupInfo.current !== 1 ? "s" : ""} left
              </p>

              {!user ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 8 }}>Sign in or create an account to join.</p>
                  <Link href={`/auth/signup?redirect=/join/${code}`}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", borderRadius: 14, background: "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))", color: "white", fontWeight: 700, textDecoration: "none" }}>
                    Create Account & Join <ArrowRight size={14} />
                  </Link>
                  <Link href={`/auth/signin?redirect=/join/${code}`}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", borderRadius: 14, background: "var(--color-surface)", color: "var(--color-text-secondary)", fontWeight: 600, textDecoration: "none", border: "0.5px solid var(--color-border)" }}>
                    Sign In
                  </Link>
                </div>
              ) : (
                <button onClick={joinGroup} disabled={status === "joining"}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "14px", borderRadius: 14, background: "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))", color: "white", fontWeight: 700, fontSize: 15, border: "none", cursor: status === "joining" ? "not-allowed" : "pointer", opacity: status === "joining" ? 0.7 : 1 }}>
                  {status === "joining" ? "Joining..." : "Join Family Group"} <ArrowRight size={15} />
                </button>
              )}
            </>
          )}

          {status === "success" && (
            <>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <CheckCircle size={56} color="#22C55E" style={{ margin: "0 auto 16px" }} />
              </motion.div>
              <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Welcome to the family!</h1>
              <p style={{ color: "var(--color-text-secondary)" }}>Redirecting to your family dashboard...</p>
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle size={48} color="var(--color-error)" style={{ margin: "0 auto 16px" }} />
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h1>
              <p style={{ color: "var(--color-text-secondary)", marginBottom: 24 }}>Please try again or contact hello@mindelement.app.</p>
              <button onClick={() => setStatus("ready")}
                style={{ padding: "12px 24px", borderRadius: 14, background: "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))", color: "white", fontWeight: 700, border: "none", cursor: "pointer" }}>
                Try Again
              </button>
            </>
          )}

        </motion.div>
      </main>
    </div>
  );
}