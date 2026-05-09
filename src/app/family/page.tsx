"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Plus, LogIn, Copy, Check, Crown, Trash2,
  LogOut, Trophy, Zap, Star, ArrowRight, UserPlus,
  Share2, BarChart2, Shield
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import { useAuthStore } from "@/store/authStore";
import {
  createFamilyGroup, joinFamilyGroup, getUserFamilyGroup,
  getFamilyMembers, getFamilyLeaderboard, leaveFamilyGroup, deleteFamilyGroup,
} from "@/lib/supabase/family";
import { GameIcon } from "@/components/icons/GameIcons";

const ACCENT = "linear-gradient(135deg,#4F6EF7,#9C6BE8)";
const GAME_NAMES: Record<string,string> = {
  tango:"Tango", memory:"Memory", queens:"Queens",
  sudoku:"Mini Sudoku", zip:"Zip", minesweeper:"Minesweeper",
};
const GAMES = [
  {slug:"all",name:"All"},{slug:"tango",name:"Tango"},{slug:"memory",name:"Memory"},
  {slug:"queens",name:"Queens"},{slug:"sudoku",name:"Sudoku"},
  {slug:"zip",name:"Zip"},{slug:"minesweeper",name:"Minesweeper"},
];

// ── Rank badge ────────────────────────────────────────────────────────────────
function RankBadge({ rank }: { rank: number }) {
  const configs = [
    { bg:"linear-gradient(135deg,#FDE68A,#F59E0B)", icon:"👑" },
    { bg:"linear-gradient(135deg,#E2E8F0,#94A3B8)", icon:"🥈" },
    { bg:"linear-gradient(135deg,#FED7AA,#C2410C)", icon:"🥉" },
  ];
  if (rank <= 3) {
    const cfg = configs[rank-1];
    return (
      <div style={{ width:32, height:32, borderRadius:"50%", background:cfg.bg,
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>
        {cfg.icon}
      </div>
    );
  }
  return (
    <div style={{ width:32, height:32, borderRadius:"50%", background:"#F8F7F5",
      border:"0.5px solid #EDE9E4", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <span style={{ fontSize:12, fontWeight:700, color:"#94A3B8" }}>{rank}</span>
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function MemberAvatar({ name, index, size=36 }: { name:string; index:number; size?:number }) {
  const bgs = [ACCENT,"linear-gradient(135deg,#7C9E87,#4A7C59)","linear-gradient(135deg,#C4785A,#A0522D)",
    "linear-gradient(135deg,#4DB6AC,#0D9488)","linear-gradient(135deg,#E87070,#C04040)"];
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:bgs[index%bgs.length],
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:size*0.38, fontWeight:700, color:"white", flexShrink:0 }}>
      {(name[0]??'?').toUpperCase()}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon:Icon, label, value, color, bg }:{icon:any;label:string;value:string;color:string;bg:string}) {
  return (
    <div style={{ background:"white", borderRadius:16, border:"0.5px solid rgba(0,0,0,0.07)",
      padding:"16px 18px", boxShadow:"0 2px 6px rgba(0,0,0,0.04)" }}>
      <div style={{ width:32, height:32, borderRadius:10, background:bg,
        display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10 }}>
        <Icon size={15} color={color}/>
      </div>
      <p style={{ fontSize:22, fontWeight:700, color:"#1C1917", fontFamily:"Georgia,serif", marginBottom:2 }}>{value}</p>
      <p style={{ fontSize:11, color:"#94A3B8", fontWeight:500 }}>{label}</p>
    </div>
  );
}

// ── No group: Create or Join ──────────────────────────────────────────────────
function NoGroupView({ userId, onSuccess }: { userId:string; onSuccess:()=>void }) {
  const [mode, setMode] = useState<null|"create"|"join">(null);
  const [groupName, setGroupName] = useState("");
  const [memberLimit, setMemberLimit] = useState(3);
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  async function handleCreate() {
    if (!groupName.trim()) return;
    setLoading(true); setError(null);
    try {
      await createFamilyGroup(groupName.trim(), userId, memberLimit);
      onSuccess();
    } catch(e:any) { setError(e.message); }
    setLoading(false);
  }

  async function handleJoin() {
    if (!inviteCode.trim()) return;
    setLoading(true); setError(null);
    try {
      await joinFamilyGroup(inviteCode.trim(), userId);
      onSuccess();
    } catch(e:any) { setError(e.message); }
    setLoading(false);
  }

  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ maxWidth:480, margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:40 }}>
        <div style={{ width:72, height:72, borderRadius:"50%", background:"#EEF2FF",
          display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
          <Users size={32} color="#4F6EF7"/>
        </div>
        <h2 style={{ fontSize:24, fontWeight:700, color:"#1C1917", fontFamily:"Georgia,serif", marginBottom:8 }}>
          Family Groups
        </h2>
        <p style={{ fontSize:14, color:"#64748B", lineHeight:1.6 }}>
          Compete with family and friends on a private leaderboard. Create a group or join one with an invite code.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!mode && (
          <motion.div key="choice" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <button onClick={()=>setMode("create")}
              style={{ padding:"24px 20px", borderRadius:20, border:"0.5px solid rgba(79,110,247,0.2)",
                background:"rgba(79,110,247,0.04)", cursor:"pointer", textAlign:"left",
                transition:"all 0.2s" }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform="translateY(-2px)"}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform="translateY(0)"}>
              <div style={{ width:40, height:40, borderRadius:12, background:ACCENT,
                display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}>
                <Plus size={18} color="white"/>
              </div>
              <p style={{ fontSize:14, fontWeight:700, color:"#1C1917", marginBottom:4 }}>Create Group</p>
              <p style={{ fontSize:12, color:"#64748B" }}>Start a new family group and invite members</p>
            </button>
            <button onClick={()=>setMode("join")}
              style={{ padding:"24px 20px", borderRadius:20, border:"0.5px solid rgba(0,0,0,0.08)",
                background:"white", cursor:"pointer", textAlign:"left", boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
                transition:"all 0.2s" }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform="translateY(-2px)"}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform="translateY(0)"}>
              <div style={{ width:40, height:40, borderRadius:12, background:"#EEF2FF",
                display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}>
                <LogIn size={18} color="#4F6EF7"/>
              </div>
              <p style={{ fontSize:14, fontWeight:700, color:"#1C1917", marginBottom:4 }}>Join Group</p>
              <p style={{ fontSize:12, color:"#64748B" }}>Enter an invite code from a family member</p>
            </button>
          </motion.div>
        )}

        {mode === "create" && (
          <motion.div key="create" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
            style={{ background:"white", borderRadius:24, border:"0.5px solid rgba(0,0,0,0.08)",
              padding:"28px 28px", boxShadow:"0 4px 16px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize:18, fontWeight:700, color:"#1C1917", fontFamily:"Georgia,serif", marginBottom:20 }}>
              Create Family Group
            </h3>
            {error && (
              <div style={{ background:"#FEF2F2", border:"0.5px solid #FCA5A5", borderRadius:12,
                padding:"10px 14px", marginBottom:16, fontSize:13, color:"#DC2626" }}>
                {error}
              </div>
            )}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, fontWeight:600, color:"#64748B", letterSpacing:"0.1em",
                textTransform:"uppercase", display:"block", marginBottom:6 }}>Group Name</label>
              <input value={groupName} onChange={e=>setGroupName(e.target.value)}
                placeholder="The Cohens, Team Awesome..."
                style={{ width:"100%", padding:"11px 14px", borderRadius:12,
                  border:"0.5px solid #E2E8F0", fontSize:14, color:"#1C1917",
                  outline:"none", background:"#FDFCFB" }}/>
            </div>
            <div style={{ marginBottom:24 }}>
              <label style={{ fontSize:11, fontWeight:600, color:"#64748B", letterSpacing:"0.1em",
                textTransform:"uppercase", display:"block", marginBottom:10 }}>
                Plan Size
              </label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {[{n:3,label:"Family · 3",price:"$5/mo"},{n:7,label:"Family · 7",price:"$10/mo"}].map(opt=>(
                  <button key={opt.n} onClick={()=>setMemberLimit(opt.n)}
                    style={{ padding:"14px 16px", borderRadius:14, border:"1.5px solid",
                      cursor:"pointer", textAlign:"left", transition:"all 0.15s",
                      borderColor: memberLimit===opt.n ? "#4F6EF7" : "#E2E8F0",
                      background: memberLimit===opt.n ? "rgba(79,110,247,0.05)" : "white" }}>
                    <p style={{ fontSize:13, fontWeight:700, color: memberLimit===opt.n?"#4F6EF7":"#1C1917", marginBottom:2 }}>{opt.label}</p>
                    <p style={{ fontSize:11, color:"#94A3B8" }}>{opt.price}</p>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>{ setMode(null); setError(null); }}
                style={{ flex:1, padding:"12px", borderRadius:14, border:"0.5px solid #E2E8F0",
                  background:"white", fontSize:13, fontWeight:600, color:"#64748B", cursor:"pointer" }}>
                Back
              </button>
              <button onClick={handleCreate} disabled={loading||!groupName.trim()}
                style={{ flex:2, padding:"12px", borderRadius:14, border:"none",
                  background: groupName.trim() ? ACCENT : "#E2E8F0",
                  fontSize:13, fontWeight:700, color:"white", cursor: groupName.trim()?"pointer":"not-allowed" }}>
                {loading ? "Creating..." : "Create Group"}
              </button>
            </div>
          </motion.div>
        )}

        {mode === "join" && (
          <motion.div key="join" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
            style={{ background:"white", borderRadius:24, border:"0.5px solid rgba(0,0,0,0.08)",
              padding:"28px 28px", boxShadow:"0 4px 16px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize:18, fontWeight:700, color:"#1C1917", fontFamily:"Georgia,serif", marginBottom:20 }}>
              Join with Invite Code
            </h3>
            {error && (
              <div style={{ background:"#FEF2F2", border:"0.5px solid #FCA5A5", borderRadius:12,
                padding:"10px 14px", marginBottom:16, fontSize:13, color:"#DC2626" }}>
                {error}
              </div>
            )}
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:11, fontWeight:600, color:"#64748B", letterSpacing:"0.1em",
                textTransform:"uppercase", display:"block", marginBottom:6 }}>Invite Code</label>
              <input value={inviteCode} onChange={e=>setInviteCode(e.target.value.toLowerCase())}
                placeholder="e.g. a3b8f2c1"
                maxLength={8}
                style={{ width:"100%", padding:"11px 14px", borderRadius:12,
                  border:"0.5px solid #E2E8F0", fontSize:16, color:"#1C1917",
                  outline:"none", background:"#FDFCFB", fontFamily:"monospace",
                  letterSpacing:"0.15em", textAlign:"center" }}/>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>{ setMode(null); setError(null); }}
                style={{ flex:1, padding:"12px", borderRadius:14, border:"0.5px solid #E2E8F0",
                  background:"white", fontSize:13, fontWeight:600, color:"#64748B", cursor:"pointer" }}>
                Back
              </button>
              <button onClick={handleJoin} disabled={loading||inviteCode.length<6}
                style={{ flex:2, padding:"12px", borderRadius:14, border:"none",
                  background: inviteCode.length>=6 ? ACCENT : "#E2E8F0",
                  fontSize:13, fontWeight:700, color:"white",
                  cursor: inviteCode.length>=6 ? "pointer" : "not-allowed" }}>
                {loading ? "Joining..." : "Join Group"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Family Page ──────────────────────────────────────────────────────────
export default function FamilyPage() {
  const { user, profile } = useAuthStore();
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState("all");
  const [copied, setCopied] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadGroup = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const g = await getUserFamilyGroup(user.id) as any;
      setGroup(g);
      if (g) {
        const [m, lb] = await Promise.all([
          getFamilyMembers(g.id),
          getFamilyLeaderboard(g.id, selectedGame),
        ]);
        setMembers(m);
        setLeaderboard(lb);
      }
    } catch(e) { console.error(e); }
    setLoading(false);
  }, [user, selectedGame]);

  useEffect(() => { loadGroup(); }, [loadGroup]);

  async function copyInviteCode() {
    if (!group) return;
    await navigator.clipboard.writeText(group.invite_code);
    setCopied(true); setTimeout(()=>setCopied(false), 2000);
  }

  async function handleLeave() {
    if (!group || !user) return;
    await leaveFamilyGroup(group.id, user.id);
    setGroup(null); setMembers([]); setLeaderboard([]); setConfirmLeave(false);
  }

  async function handleDelete() {
    if (!group) return;
    await deleteFamilyGroup(group.id);
    setGroup(null); setMembers([]); setLeaderboard([]); setConfirmDelete(false);
  }

  const isAdmin = group?.admin_id === user?.id;
  const totalGroupXP = leaderboard.reduce((s:number,e:any)=>s+e.total_xp,0);
  const myRank = leaderboard.find((e:any)=>e.user_id===user?.id)?.rank ?? null;

  if (!user) return (
    <div style={{ minHeight:"100vh", background:"#FDFCFB" }}>
      <Navbar/>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        minHeight:"80vh", gap:20, textAlign:"center", padding:24 }}>
        <div style={{ width:64, height:64, borderRadius:"50%", background:"#EEF2FF",
          display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto" }}>
          <Users size={28} color="#4F6EF7"/>
        </div>
        <div>
          <h2 style={{ fontSize:22, fontWeight:700, color:"#1C1917", fontFamily:"Georgia,serif", marginBottom:6 }}>Sign in to use Family Groups</h2>
          <p style={{ fontSize:14, color:"#64748B" }}>Create a family group and compete with the people you love.</p>
        </div>
        <Link href="/auth/signin" style={{ padding:"12px 28px", borderRadius:14, background:ACCENT, color:"white", fontWeight:700, fontSize:14, textDecoration:"none" }}>
          Sign In
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#FDFCFB" }}>
      <Navbar/>
      <main style={{ maxWidth:760, margin:"0 auto", padding:"76px 16px 48px" }}>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:28 }}>
          <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"#94A3B8", marginBottom:8 }}>Social</p>
          <h1 style={{ fontSize:36, fontWeight:700, color:"#1C1917", fontFamily:"Georgia,serif", marginBottom:6 }}>Family</h1>
          <p style={{ fontSize:14, color:"#64748B" }}>Compete privately with your family and friends.</p>
        </motion.div>

        {loading ? (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[1,2,3].map(i=>(
              <div key={i} style={{ height:72, borderRadius:16, background:"#F8F7F5",
                animation:"pulse 1.5s ease-in-out infinite", animationDelay:`${i*0.1}s` }}/>
            ))}
          </div>
        ) : !group ? (
          <NoGroupView userId={user.id} onSuccess={loadGroup}/>
        ) : (
          <div>
            {/* Group header card */}
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              style={{ background:ACCENT, borderRadius:24, padding:"24px 28px", marginBottom:20, color:"white" }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    {isAdmin && <Crown size={14} color="rgba(255,255,255,0.7)"/>}
                    <p style={{ fontSize:11, opacity:0.7, fontWeight:500 }}>{isAdmin?"Admin":"Member"}</p>
                  </div>
                  <h2 style={{ fontSize:22, fontWeight:700, fontFamily:"Georgia,serif", marginBottom:2 }}>{group.name}</h2>
                  <p style={{ fontSize:13, opacity:0.7 }}>{members.length} / {group.member_limit} members</p>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={copyInviteCode}
                    style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px",
                      borderRadius:12, background:"rgba(255,255,255,0.2)", border:"none",
                      color:"white", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                    {copied ? <Check size={13}/> : <Copy size={13}/>}
                    {copied ? "Copied!" : group.invite_code}
                  </button>
                </div>
              </div>
              {/* Member avatars */}
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ display:"flex" }}>
                  {members.slice(0,6).map((m:any,i:number)=>(
                    <div key={m.user_id} style={{ marginLeft:i>0?-10:0, position:"relative", zIndex:6-i }}>
                      <MemberAvatar name={(m.profiles as any)?.username??'?'} index={i} size={32}/>
                    </div>
                  ))}
                </div>
                {members.length>6&&<span style={{ fontSize:12, opacity:0.7 }}>+{members.length-6} more</span>}
                <button onClick={copyInviteCode}
                  style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:5,
                    padding:"6px 12px", borderRadius:10, background:"rgba(255,255,255,0.15)",
                    border:"none", color:"white", fontSize:11, fontWeight:600, cursor:"pointer" }}>
                  <UserPlus size={12}/> Invite
                </button>
              </div>
            </motion.div>

            {/* Stats row */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
              <StatCard icon={Zap}    label="Group XP"   value={totalGroupXP.toLocaleString()} color="#4F6EF7" bg="rgba(79,110,247,0.1)"/>
              <StatCard icon={Users}  label="Members"    value={`${members.length}`}             color="#9C6BE8" bg="rgba(156,107,232,0.1)"/>
              <StatCard icon={Trophy} label="Your Rank"  value={myRank?`#${myRank}`:"—"}         color="#F59E0B" bg="rgba(245,158,11,0.1)"/>
            </div>

            {/* Leaderboard */}
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <h2 style={{ fontSize:18, fontWeight:700, color:"#1C1917", fontFamily:"Georgia,serif" }}>
                  Family Rankings
                </h2>
                <div style={{ display:"flex", gap:6 }}>
                  {GAMES.map(g=>(
                    <button key={g.slug} onClick={()=>setSelectedGame(g.slug)}
                      style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px",
                        borderRadius:8, border:"0.5px solid", cursor:"pointer", fontSize:11, fontWeight:500,
                        background:selectedGame===g.slug?"white":"transparent",
                        borderColor:selectedGame===g.slug?"rgba(79,110,247,0.3)":"#EDE9E4",
                        color:selectedGame===g.slug?"#4F6EF7":"#94A3B8" }}>
                      {g.slug!=="all"&&<GameIcon slug={g.slug} size={14}/>}
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background:"white", borderRadius:20, border:"0.5px solid rgba(0,0,0,0.07)",
                overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                {leaderboard.length===0 ? (
                  <div style={{ padding:"40px 24px", textAlign:"center" }}>
                    <BarChart2 size={36} color="#E2E8F0" style={{ margin:"0 auto 12px", display:"block" }}/>
                    <p style={{ fontSize:14, fontWeight:600, color:"#94A3B8", marginBottom:4 }}>No scores yet</p>
                    <p style={{ fontSize:12, color:"#CBD5E1" }}>Complete stages to appear here</p>
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    <div style={{ display:"grid", gridTemplateColumns:"52px 1fr 80px 80px",
                      padding:"12px 20px", borderBottom:"0.5px solid #F8F7F5" }}>
                      {["#","Player","XP","Stages"].map((h,i)=>(
                        <p key={i} style={{ fontSize:10, fontWeight:700, color:"#94A3B8",
                          letterSpacing:"0.1em", textTransform:"uppercase", textAlign:i>1?"center":"left" }}>{h}</p>
                      ))}
                    </div>
                    {leaderboard.map((entry:any, i:number)=>(
                      <motion.div key={entry.user_id}
                        initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
                        transition={{ delay:i*0.04 }}
                        style={{ display:"grid", gridTemplateColumns:"52px 1fr 80px 80px",
                          alignItems:"center", padding:"14px 20px",
                          borderBottom:"0.5px solid #FAFAF9",
                          background:entry.user_id===user?.id?"linear-gradient(90deg,rgba(79,110,247,0.04),transparent)":"transparent" }}>
                        <RankBadge rank={entry.rank}/>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <MemberAvatar name={entry.username} index={i}/>
                          <div>
                            <p style={{ fontSize:13, fontWeight:600, color:"#1C1917" }}>
                              {entry.username}
                              {entry.user_id===user?.id&&(
                                <span style={{ fontSize:10, color:"#4F6EF7", marginLeft:6, fontWeight:500 }}>you</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div style={{ textAlign:"center" }}>
                          <p style={{ fontSize:13, fontWeight:700, color:"#4F6EF7" }}>{entry.total_xp.toLocaleString()}</p>
                        </div>
                        <div style={{ textAlign:"center" }}>
                          <p style={{ fontSize:13, fontWeight:500, color:"#64748B" }}>{entry.games_played}</p>
                        </div>
                      </motion.div>
                    ))}
                  </>
                )}
              </div>
            </motion.div>

            {/* Members list */}
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
              style={{ marginTop:20 }}>
              <h2 style={{ fontSize:18, fontWeight:700, color:"#1C1917", fontFamily:"Georgia,serif", marginBottom:12 }}>
                Members
              </h2>
              <div style={{ background:"white", borderRadius:20, border:"0.5px solid rgba(0,0,0,0.07)",
                overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                {members.map((m:any,i:number)=>{
                  const uname=(m.profiles as any)?.username??"Member";
                  const isThisAdmin=m.user_id===group.admin_id;
                  const isMe=m.user_id===user?.id;
                  return(
                    <div key={m.user_id} style={{ display:"flex", alignItems:"center", gap:12,
                      padding:"14px 20px", borderBottom:i<members.length-1?"0.5px solid #FAFAF9":"none" }}>
                      <MemberAvatar name={uname} index={i}/>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <p style={{ fontSize:13, fontWeight:600, color:"#1C1917" }}>{uname}</p>
                          {isThisAdmin&&(
                            <span style={{ fontSize:9, fontWeight:700, color:"#F59E0B", background:"#FEF9C3",
                              border:"0.5px solid #FDE68A", padding:"1px 6px", borderRadius:8 }}>ADMIN</span>
                          )}
                          {isMe&&(
                            <span style={{ fontSize:9, fontWeight:700, color:"#4F6EF7", background:"#EEF2FF",
                              border:"0.5px solid #C7D2FE", padding:"1px 6px", borderRadius:8 }}>YOU</span>
                          )}
                        </div>
                        <p style={{ fontSize:11, color:"#94A3B8" }}>
                          Joined {new Date(m.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Danger zone */}
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}
              style={{ marginTop:24, padding:"18px 20px", borderRadius:16,
                border:"0.5px solid rgba(239,68,68,0.2)", background:"rgba(239,68,68,0.02)" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:"#DC2626", marginBottom:2 }}>
                    {isAdmin ? "Delete Group" : "Leave Group"}
                  </p>
                  <p style={{ fontSize:12, color:"#94A3B8" }}>
                    {isAdmin ? "This will remove all members and data." : "You can rejoin with an invite code."}
                  </p>
                </div>
                <button
                  onClick={()=>isAdmin?setConfirmDelete(true):setConfirmLeave(true)}
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px",
                    borderRadius:12, border:"0.5px solid rgba(239,68,68,0.3)",
                    background:"white", color:"#DC2626", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                  {isAdmin?<Trash2 size={13}/>:<LogOut size={13}/>}
                  {isAdmin?"Delete":"Leave"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>

      {/* Confirm modals */}
      <AnimatePresence>
        {(confirmLeave||confirmDelete)&&(
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", backdropFilter:"blur(8px)",
              display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:24 }}>
            <motion.div initial={{ scale:0.9, y:20 }} animate={{ scale:1, y:0 }}
              style={{ background:"white", borderRadius:24, padding:"28px 28px",
                maxWidth:340, width:"100%", textAlign:"center",
                boxShadow:"0 24px 60px rgba(0,0,0,0.2)" }}>
              <div style={{ width:52, height:52, borderRadius:"50%", background:"#FEF2F2",
                display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                {confirmDelete?<Trash2 size={22} color="#DC2626"/>:<LogOut size={22} color="#DC2626"/>}
              </div>
              <h3 style={{ fontSize:18, fontWeight:700, color:"#1C1917", marginBottom:8, fontFamily:"Georgia,serif" }}>
                {confirmDelete?"Delete Group?":"Leave Group?"}
              </h3>
              <p style={{ fontSize:13, color:"#64748B", marginBottom:24, lineHeight:1.6 }}>
                {confirmDelete
                  ? `"${group?.name}" will be permanently deleted and all members removed.`
                  : `You'll leave "${group?.name}". You can rejoin with an invite code.`}
              </p>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={()=>{ setConfirmLeave(false); setConfirmDelete(false); }}
                  style={{ flex:1, padding:"12px", borderRadius:14, border:"0.5px solid #E2E8F0",
                    background:"white", fontSize:13, fontWeight:600, color:"#64748B", cursor:"pointer" }}>
                  Cancel
                </button>
                <button onClick={confirmDelete?handleDelete:handleLeave}
                  style={{ flex:1, padding:"12px", borderRadius:14, border:"none",
                    background:"#EF4444", fontSize:13, fontWeight:700, color:"white", cursor:"pointer" }}>
                  {confirmDelete?"Delete":"Leave"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
