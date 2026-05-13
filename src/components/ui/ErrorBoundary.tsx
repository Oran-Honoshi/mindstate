"use client";

import React from "react";

interface Props { children: React.ReactNode; game?: string; }
interface State { hasError: boolean; error: string; stack: string; }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: "", stack: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message, stack: error.stack ?? "" };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight:"100vh", background:"#0F0F14", display:"flex",
          flexDirection:"column", alignItems:"center", justifyContent:"center",
          padding:24, fontFamily:"monospace" }}>
          <div style={{ maxWidth:700, width:"100%" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>💥</div>
            <h2 style={{ color:"#EF4444", fontSize:18, fontWeight:700, marginBottom:8 }}>
              Runtime Error{this.props.game ? ` in ${this.props.game}` : ""}
            </h2>
            <div style={{ background:"#1A1A2E", borderRadius:12, padding:16,
              marginBottom:12, border:"1px solid rgba(239,68,68,0.25)" }}>
              <p style={{ color:"#FCA5A5", fontSize:13, fontWeight:600, marginBottom:8 }}>
                {this.state.error}
              </p>
              <pre style={{ color:"#94A3B8", fontSize:11, whiteSpace:"pre-wrap",
                wordBreak:"break-all", maxHeight:300, overflow:"auto", lineHeight:1.6 }}>
                {this.state.stack.split("\n").slice(0, 12).join("\n")}
              </pre>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => this.setState({ hasError:false, error:"", stack:"" })}
                style={{ padding:"8px 18px", borderRadius:10, border:"none",
                  background:"#4F6EF7", color:"white", cursor:"pointer", fontSize:13, fontWeight:600 }}>
                Retry
              </button>
              <button onClick={() => window.history.back()}
                style={{ padding:"8px 18px", borderRadius:10, border:"1px solid #374151",
                  background:"transparent", color:"#94A3B8", cursor:"pointer", fontSize:13 }}>
                Back
              </button>
              <button onClick={() => {
                navigator.clipboard?.writeText(this.state.error + "\n\n" + this.state.stack);
                alert("Copied!");
              }}
                style={{ padding:"8px 18px", borderRadius:10, border:"1px solid #374151",
                  background:"transparent", color:"#94A3B8", cursor:"pointer", fontSize:13 }}>
                Copy Error
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
