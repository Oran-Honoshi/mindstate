"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const ACCENT = "linear-gradient(135deg,#4F6EF7,#9C6BE8)";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data:{ username }, emailRedirectTo:`${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); }
    else setSuccess(true);
  }

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({ provider:"google", options:{ redirectTo:`${window.location.origin}/auth/callback` } });
  }

  if (success) return (
    <div style={{ minHeight:"100vh", background:"#FDFCFB", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
        style={{ width:"100%", maxWidth:380, background:"white", borderRadius:24, border:"0.5px solid rgba(0,0,0,0.08)", padding:"40px 28px", textAlign:"center", boxShadow:"0 4px 24px rgba(0,0,0,0.06)" }}>
        <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(79,110,247,0.1)", border:"0.5px solid rgba(79,110,247,0.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
          <Brain size={24} color="#4F6EF7"/>
        </div>
        <h2 style={{ fontSize:20, fontWeight:700, color:"#1C1917", fontFamily:"Georgia,serif", marginBottom:8 }}>Check your email</h2>
        <p style={{ fontSize:13, color:"#64748B", lineHeight:1.6 }}>
          We sent a confirmation link to <strong style={{ color:"#1C1917" }}>{email}</strong>. Click it to activate your account.
        </p>
      </motion.div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#FDFCFB", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24 }}>
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }} style={{ width:"100%", maxWidth:380 }}>
        <Link href="/" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, textDecoration:"none", marginBottom:32 }}>
          <div style={{ width:32, height:32, borderRadius:"22.5%", background:ACCENT, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 12px rgba(79,110,247,0.3)" }}>
            <Brain size={16} color="white"/>
          </div>
          <span style={{ fontWeight:700, fontSize:18, color:"#1C1917", fontFamily:"Georgia,serif" }}>MindElement</span>
        </Link>

        <div style={{ background:"white", borderRadius:24, border:"0.5px solid rgba(0,0,0,0.08)", padding:"32px 28px", boxShadow:"0 4px 24px rgba(0,0,0,0.06)" }}>
          <h1 style={{ fontSize:22, fontWeight:700, color:"#1C1917", fontFamily:"Georgia,serif", marginBottom:4 }}>Create account</h1>
          <p style={{ fontSize:13, color:"#64748B", marginBottom:24 }}>Start training for free</p>

          {error && (
            <div style={{ background:"#FEF2F2", border:"0.5px solid #FCA5A5", borderRadius:12, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#DC2626" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp}>
            {[
              { label:"Username", type:"text",     value:username,  onChange:(v:string)=>setUsername(v),  placeholder:"mindmaster" },
              { label:"Email",    type:"email",    value:email,     onChange:(v:string)=>setEmail(v),     placeholder:"you@example.com" },
            ].map(field => (
              <div key={field.label} style={{ marginBottom:14 }}>
                <label style={{ fontSize:11, fontWeight:600, color:"#64748B", letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:6 }}>{field.label}</label>
                <input type={field.type} value={field.value} onChange={e=>field.onChange(e.target.value)} required placeholder={field.placeholder}
                  style={{ width:"100%", padding:"11px 14px", borderRadius:12, border:"0.5px solid #E2E8F0", fontSize:14, color:"#1C1917", background:"#FDFCFB", outline:"none" }}/>
              </div>
            ))}
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:11, fontWeight:600, color:"#64748B", letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:6 }}>Password</label>
              <div style={{ position:"relative" }}>
                <input type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} placeholder="min 8 characters"
                  style={{ width:"100%", padding:"11px 40px 11px 14px", borderRadius:12, border:"0.5px solid #E2E8F0", fontSize:14, color:"#1C1917", background:"#FDFCFB", outline:"none" }}/>
                <button type="button" onClick={()=>setShowPassword(s=>!s)}
                  style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#94A3B8" }}>
                  {showPassword?<EyeOff size={15}/>:<Eye size={15}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{ width:"100%", padding:"13px", borderRadius:14, border:"none", background:ACCENT, color:"white", fontSize:14, fontWeight:700, cursor:loading?"not-allowed":"pointer", opacity:loading?0.7:1 }}>
              {loading?"Creating account...":"Create Account"}
            </button>
          </form>

          <div style={{ display:"flex", alignItems:"center", gap:10, margin:"18px 0" }}>
            <div style={{ flex:1, height:"0.5px", background:"#E2E8F0" }}/>
            <span style={{ fontSize:11, color:"#94A3B8" }}>OR</span>
            <div style={{ flex:1, height:"0.5px", background:"#E2E8F0" }}/>
          </div>

          <button onClick={handleGoogle}
            style={{ width:"100%", padding:"13px", borderRadius:14, border:"0.5px solid #E2E8F0", background:"white", fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <p style={{ textAlign:"center", fontSize:13, color:"#94A3B8", marginTop:20 }}>
          Already have an account?{" "}
          <Link href="/auth/signin" style={{ color:"#4F6EF7", fontWeight:600, textDecoration:"none" }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
