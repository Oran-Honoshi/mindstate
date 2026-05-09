"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import { ProModal } from "@/components/modals/ProModal";

export default function FlowPage() {
  const [showPro, setShowPro] = useState(false);
  return (
    <div style={{minHeight:"100vh",background:"#FDFCFB",display:"flex",flexDirection:"column"}}>
      <Navbar/>
      <main style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"76px 24px 48px",gap:24}}>

        {/* Game icon */}
        <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}}
          style={{width:96,height:96,borderRadius:28,background:"#DCFCE7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:48,boxShadow:"0 16px 40px rgba(0,0,0,0.1)"}}>
          ∞
        </motion.div>

        <div style={{textAlign:"center",maxWidth:400}}>
          <h1 style={{fontSize:28,fontWeight:700,color:"#1C1917",fontFamily:"Georgia,serif",marginBottom:8}}>Flow</h1>
          <p style={{fontSize:15,color:"#64748B",lineHeight:1.65,marginBottom:24}}>Connect color dot pairs without crossing paths and fill the entire board.</p>

          {/* Pro lock */}
          <div style={{background:"white",borderRadius:20,border:"0.5px solid rgba(0,0,0,0.08)",padding:"20px 24px",marginBottom:20,boxShadow:"0 4px 16px rgba(0,0,0,0.06)"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={{width:36,height:36,borderRadius:10,background:"rgba(79,110,247,0.1)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Lock size={16} color="#4F6EF7"/>
              </div>
              <div style={{textAlign:"left"}}>
                <p style={{fontSize:13,fontWeight:700,color:"#1C1917"}}>Pro Feature</p>
                <p style={{fontSize:11,color:"#94A3B8"}}>Unlock all 20 games from $2/mo</p>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
              {["1,000 stages","Daily challenges","XP leaderboard","Family groups"].map(f=>(
                <div key={f} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#374151"}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:"#15803D",flexShrink:0}}/>
                  {f}
                </div>
              ))}
            </div>
            <button onClick={()=>setShowPro(true)}
              style={{width:"100%",padding:"13px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",fontSize:14,fontWeight:700,color:"white",cursor:"pointer",boxShadow:"0 6px 20px rgba(79,110,247,0.3)"}}>
              Unlock Flow
            </button>
          </div>

          {/* Preview */}
          <div style={{background:"#DCFCE7",borderRadius:20,padding:"20px",marginBottom:16,border:"0.5px solid rgba(0,0,0,0.06)"}}>
            <p style={{fontSize:11,fontWeight:600,color:"#15803D",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Coming in v1.1</p>
            <p style={{fontSize:13,color:"#374151",lineHeight:1.6}}>
              Full gameplay with 1,000 algorithmically generated stages across Easy, Medium, and Hard difficulty. Daily challenge included.
            </p>
          </div>

          <Link href="/games"
            style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:13,color:"#64748B",textDecoration:"none"}}>
            <ArrowLeft size={14}/> Back to all games
          </Link>
        </div>
      </main>
      <ProModal open={showPro} onClose={()=>setShowPro(false)} feature="Flow"/>
    </div>
  );
}
