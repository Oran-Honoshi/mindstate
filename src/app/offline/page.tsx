"use client";

export default function OfflinePage() {
  return (
    <div style={{ minHeight:"100vh", background:"#0F0F14", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, padding:24, textAlign:"center" }}>
      <div style={{ fontSize:64 }}>🧠</div>
      <h1 style={{ fontSize:28, fontWeight:700, color:"white", fontFamily:"Georgia,serif" }}>You're Offline</h1>
      <p style={{ fontSize:16, color:"#64748B", maxWidth:340, lineHeight:1.6 }}>
        No internet connection. Your recent game progress is saved — connect to sync scores and access new stages.
      </p>
      <button onClick={() => window.location.reload()}
        style={{ padding:"12px 28px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)", color:"white", fontSize:14, fontWeight:700, cursor:"pointer" }}>
        Try Again
      </button>
    </div>
  );
}
