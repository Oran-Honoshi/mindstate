"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const ACCENT = "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const router = useRouter();

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); }
    else router.push("/games");
  }

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({ provider:"google", options:{ redirectTo:`${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` } });
  }

  async function handleFacebook() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({ provider:"facebook", options:{ redirectTo:`${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` } });
  }

  return (
    <div className="auth-page" style={{ minHeight:"100vh", background:"var(--color-bg)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }} style={{ width:"100%", maxWidth:380 }}>
        <Link href="/" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, textDecoration:"none", marginBottom:32 }}>
          <div style={{ width:32, height:32, borderRadius:"22.5%", background:ACCENT, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 12px rgba(0,255,255,0.2)" }}>
            <Brain size={16} color="#000"/>
          </div>
          <span style={{ fontWeight:700, fontSize:18, color:"var(--color-text-primary)", fontFamily:"var(--font-sans)" }}>MindElement</span>
        </Link>

        <div className="ms-card" style={{ padding:"32px 28px" }}>
          <h1 style={{ fontSize:22, fontWeight:700, color:"var(--color-text-primary)", fontFamily:"var(--font-sans)", marginBottom:4 }}>Welcome back</h1>
          <p style={{ fontSize:13, color:"var(--color-text-secondary)", marginBottom:24 }}>Sign in to continue training</p>

          {error && (
            <div style={{ background:"#FEF2F2", border:"0.5px solid #FCA5A5", borderRadius:12, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#DC2626" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn}>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:600, color:"var(--color-text-secondary)", letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:6 }}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com"
                style={{ width:"100%", padding:"11px 14px", borderRadius:12, border:"0.5px solid var(--color-border)", fontSize:14, color:"var(--color-text-primary)", background:"var(--color-surface)", outline:"none" }}/>
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:11, fontWeight:600, color:"var(--color-text-secondary)", letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:6 }}>Password</label>
              <div style={{ position:"relative" }}>
                <input type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••"
                  style={{ width:"100%", padding:"11px 40px 11px 14px", borderRadius:12, border:"0.5px solid var(--color-border)", fontSize:14, color:"var(--color-text-primary)", background:"var(--color-surface)", outline:"none" }}/>
                <button type="button" onClick={()=>setShowPassword(s=>!s)}
                  style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--color-text-secondary)" }}>
                  {showPassword?<EyeOff size={15}/>:<Eye size={15}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{ width:"100%", padding:"13px", borderRadius:14, border:"none", background:ACCENT, color:"#000", fontSize:14, fontWeight:700, cursor:loading?"not-allowed":"pointer", opacity:loading?0.7:1 }}>
              {loading?"Signing in...":"Sign In"}
            </button>
          </form>

          <div style={{ display:"flex", alignItems:"center", gap:10, margin:"18px 0" }}>
            <div style={{ flex:1, height:"0.5px", background:"var(--color-border)" }}/>
            <span style={{ fontSize:11, color:"var(--color-text-secondary)" }}>OR</span>
            <div style={{ flex:1, height:"0.5px", background:"var(--color-border)" }}/>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <button onClick={handleGoogle}
              style={{ width:"100%", padding:"13px", borderRadius:14, border:"0.5px solid var(--color-border)", background:"var(--color-surface)", fontSize:13, fontWeight:600, color:"var(--color-text-secondary)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button onClick={handleFacebook}
              style={{ width:"100%", padding:"13px", borderRadius:14, border:"0.5px solid var(--color-border)", background:"var(--color-surface)", fontSize:13, fontWeight:600, color:"var(--color-text-secondary)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
              Continue with Facebook
            </button>
          </div>
        </div>

        <p style={{ textAlign:"center", fontSize:13, color:"var(--color-text-secondary)", marginTop:20 }}>
          No account?{" "}
          <Link href="/auth/signup" style={{ color:"var(--color-accent-primary)", fontWeight:600, textDecoration:"none" }}>Sign up free</Link>
        </p>
      </motion.div>
    </div>
  );
}
