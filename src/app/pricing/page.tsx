import type { Metadata } from "next";
import Link from "next/link";
import { Check, Brain } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, honest pricing for MindState. All 20 games from $2/mo.",
};

const PLANS = [
  { name:"Individual", price:"$2", period:"/mo",
    features:["All 20 games","100 stages per game","Daily challenges","Global leaderboard","Infinite mode"],
    highlight:false, cta:"Start Free Trial" },
  { name:"Family · 3", price:"$5", period:"/mo",
    features:["3 members","Family leaderboard","All individual perks","Shared family streaks","Priority support"],
    highlight:true, cta:"Start Free Trial" },
  { name:"Family · 7", price:"$10", period:"/mo",
    features:["7 members","Family leaderboard","All individual perks","Shared family streaks","Priority support"],
    highlight:false, cta:"Start Free Trial" },
];

const FAQS = [
  { q:"Is there a free trial?", a:"Yes — create an account and get 7 days free on any plan. No credit card required to start." },
  { q:"Can I cancel anytime?", a:"Absolutely. Cancel from your profile settings at any time. You keep access until the end of your billing period." },
  { q:"What's included in the Daily Challenge?", a:"Every game has one free Daily Challenge per day, playable without a subscription. It resets at midnight." },
  { q:"How does the Family plan work?", a:"You invite family members via a unique link. Each member gets their own account, progress, and profile." },
  { q:"What payment methods do you accept?", a:"All major credit/debit cards via Paddle. Apple Pay and Google Pay coming soon." },
];

export default function PricingPage() {
  const ACCENT = "linear-gradient(135deg,#4F6EF7,#9C6BE8)";
  return (
    <div style={{minHeight:"100vh",background:"#FDFCFB",color:"#1C1917"}}>
      {/* Nav */}
      <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",background:"rgba(253,252,251,0.9)",backdropFilter:"blur(20px)",borderBottom:"0.5px solid rgba(0,0,0,0.07)",position:"sticky",top:0,zIndex:50}}>
        <Link href="/" style={{display:"flex",alignItems:"center",gap:8,textDecoration:"none"}}>
          <div style={{width:28,height:28,borderRadius:"22.5%",background:ACCENT,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Brain size={13} color="white"/>
          </div>
          <span style={{fontWeight:700,fontSize:15,color:"#1C1917",fontFamily:"Georgia,serif"}}>MindState</span>
        </Link>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <Link href="/games" style={{fontSize:13,color:"#64748B",padding:"6px 12px",borderRadius:10,textDecoration:"none"}}>Games</Link>
          <Link href="/auth/signin" style={{fontSize:13,color:"#64748B",padding:"6px 12px",borderRadius:10,textDecoration:"none"}}>Sign in</Link>
          <Link href="/auth/signup" style={{fontSize:13,fontWeight:600,color:"white",padding:"8px 16px",borderRadius:12,background:ACCENT,textDecoration:"none"}}>Start Free</Link>
        </div>
      </nav>

      <main style={{maxWidth:960,margin:"0 auto",padding:"48px 20px"}}>
        {/* Header */}
        <div style={{textAlign:"center",marginBottom:56}}>
          <p style={{fontSize:11,fontWeight:600,letterSpacing:"0.18em",textTransform:"uppercase",color:"#94A3B8",marginBottom:12}}>Pricing</p>
          <h1 style={{fontSize:48,fontWeight:700,color:"#1C1917",fontFamily:"Georgia,serif",lineHeight:1.08,marginBottom:12}}>
            Simple, Honest Pricing
          </h1>
          <p style={{fontSize:16,color:"#64748B",maxWidth:440,margin:"0 auto"}}>
            Less than a coffee a month. Cancel anytime. No dark patterns.
          </p>
        </div>

        {/* Plans */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20,marginBottom:64,alignItems:"start"}}>
          {PLANS.map((plan,i)=>(
            <div key={i} style={{borderRadius:24,padding:28,position:"relative",
              background:plan.highlight?ACCENT:"white",
              border:plan.highlight?"none":"0.5px solid rgba(0,0,0,0.08)",
              boxShadow:plan.highlight?"0 24px 60px rgba(79,110,247,0.28),0 4px 16px rgba(79,110,247,0.16)":"0 2px 8px rgba(0,0,0,0.04)",
              color:plan.highlight?"white":"#1C1917"}}>
              {plan.highlight&&(
                <div style={{position:"absolute",top:-13,left:"50%",transform:"translateX(-50%)",
                  fontSize:10,fontWeight:700,color:"#4F6EF7",background:"white",
                  padding:"4px 14px",borderRadius:20,boxShadow:"0 2px 8px rgba(0,0,0,0.1)",whiteSpace:"nowrap"}}>
                  Most Popular
                </div>
              )}
              <p style={{fontSize:11,fontWeight:600,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:12,
                color:plan.highlight?"rgba(255,255,255,0.65)":"#94A3B8"}}>
                {plan.name}
              </p>
              <div style={{display:"flex",alignItems:"flex-end",gap:4,marginBottom:24}}>
                <span style={{fontSize:52,fontWeight:700,lineHeight:1,fontFamily:"Georgia,serif"}}>{plan.price}</span>
                <span style={{fontSize:13,paddingBottom:8,opacity:0.6}}>{plan.period}</span>
              </div>
              <ul style={{listStyle:"none",marginBottom:24,display:"flex",flexDirection:"column",gap:10}}>
                {plan.features.map((f,j)=>(
                  <li key={j} style={{display:"flex",alignItems:"center",gap:10,fontSize:13,
                    color:plan.highlight?"rgba(255,255,255,0.88)":"#374151"}}>
                    <div style={{width:18,height:18,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",
                      background:plan.highlight?"rgba(255,255,255,0.2)":"#EEF2FF"}}>
                      <Check size={10} color={plan.highlight?"white":"#4F6EF7"}/>
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" style={{display:"block",textAlign:"center",padding:"13px",borderRadius:14,fontWeight:600,fontSize:13,textDecoration:"none",
                background:plan.highlight?"white":"transparent",
                color:plan.highlight?"#4F6EF7":"#374151",
                border:plan.highlight?"none":"1.5px solid rgba(0,0,0,0.12)",
                boxShadow:plan.highlight?"0 4px 12px rgba(0,0,0,0.12)":"none"}}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* All plans include */}
        <div style={{background:"white",borderRadius:24,border:"0.5px solid rgba(0,0,0,0.08)",padding:32,marginBottom:64,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <h2 style={{fontSize:18,fontWeight:700,color:"#1C1917",fontFamily:"Georgia,serif",marginBottom:20,textAlign:"center"}}>All plans include</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16}}>
            {[
              { icon:"", title:"20 logic games", desc:"Tango, Queens, Memory, Sudoku, and 16 more" },
              { icon:"", title:"Daily challenges", desc:"One free puzzle per game every day" },
              { icon:"", title:"XP & leaderboards", desc:"Earn XP, climb global and family rankings" },
              { icon:"🌍", title:"Hebrew RTL support", desc:"Full right-to-left layout for Hebrew speakers" },
              { icon:"", title:"Silent mode", desc:"Disable sounds and haptics globally" },
              { icon:"", title:"PWA support", desc:"Install on any device, works offline" },
            ].map((item,i)=>(
              <div key={i} style={{display:"flex",gap:12,padding:"12px 0"}}>
                <span style={{fontSize:22,flexShrink:0}}>{item.icon}</span>
                <div>
                  <p style={{fontSize:13,fontWeight:600,color:"#1C1917",marginBottom:2}}>{item.title}</p>
                  <p style={{fontSize:12,color:"#64748B",lineHeight:1.5}}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{maxWidth:640,margin:"0 auto"}}>
          <h2 style={{fontSize:28,fontWeight:700,color:"#1C1917",fontFamily:"Georgia,serif",textAlign:"center",marginBottom:32}}>
            Frequently Asked Questions
          </h2>
          <div style={{display:"flex",flexDirection:"column",gap:1}}>
            {FAQS.map((faq,i)=>(
              <div key={i} style={{background:"white",borderRadius:16,border:"0.5px solid rgba(0,0,0,0.07)",padding:"18px 22px",boxShadow:"0 1px 4px rgba(0,0,0,0.03)"}}>
                <p style={{fontSize:14,fontWeight:600,color:"#1C1917",marginBottom:6}}>{faq.q}</p>
                <p style={{fontSize:13,color:"#64748B",lineHeight:1.65}}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer style={{borderTop:"0.5px solid rgba(0,0,0,0.06)",background:"rgba(255,255,255,0.7)",padding:"28px 40px",marginTop:64}}>
        <div style={{maxWidth:960,margin:"0 auto",display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:12}}>
          <span style={{fontSize:12,color:"#CBD5E1"}}>&copy; {new Date().getFullYear()} MindState</span>
          <div style={{display:"flex",gap:20}}>
            {[["Games","/games"],["Privacy","/privacy"],["Terms","/terms"]].map(([l,h])=>(
              <Link key={l} href={h} style={{fontSize:12,color:"#94A3B8",textDecoration:"none"}}>{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

// Note: Paddle checkout wired at bottom of pricing page
// To activate: add your Paddle vendor ID and product IDs below
// Get these from: vendors.paddle.com → Products
