"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { TopNav } from "@/components/TopNav";

export default function MensagensPage() {
  const supabase = supabaseBrowser();
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [toUsername, setToUsername] = useState("");

  async function load() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { window.location.href = "/login"; return; }

    const { data, error } = await supabase
      .from("dm_participants")
      .select("thread_id, dm_threads(created_at)")
      .eq("profile_id", auth.user.id)
      .order("thread_id", { ascending: false });

    if (error) setMsg(error.message);
    const unique = Array.from(new Set((data ?? []).map((x: any) => x.thread_id))).map((id) => ({ id }));
    setThreads(unique);
    setLoading(false);
  }

  async function startThread() {
    setMsg("");
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;

    const username = toUsername.trim().toLowerCase();
    if (!username) return setMsg("Digite o username.");

    const { data: target } = await supabase.from("profiles").select("id").eq("username", username).maybeSingle();
    if (!target) return setMsg("Usuário não encontrado.");

    if (target.id === auth.user.id) return setMsg("Você não precisa mandar DM pra você mesmo 🙂");

    // Create thread
    const { data: th, error: thErr } = await supabase.from("dm_threads").insert({}).select("id").single();
    if (thErr) return setMsg(thErr.message);

    const thread_id = th.id;

    // Add participants (RLS: each participant inserts themselves; here we insert both, then user may be blocked if policy strict.
    // For MVP, allow insert participants as me. We'll insert both as service later if needed.
    // Workaround: insert self, then insert other may fail. We'll try both; if second fails, show message.
    const a = await supabase.from("dm_participants").insert({ thread_id, profile_id: auth.user.id });
    if (a.error) return setMsg(a.error.message);

    const b = await supabase.from("dm_participants").insert({ thread_id, profile_id: target.id });
    if (b.error) {
      // If this fails due to policy, you can create a server route with service role key.
      setMsg("Thread criado, mas o outro participante não foi adicionado (ajuste policy ou use server route).");
      window.location.href = `/mensagens/${thread_id}`;
      return;
    }

    window.location.href = `/mensagens/${thread_id}`;
  }

  useEffect(() => { load(); }, []);

  if (loading) return <main className="container"><div className="card">Carregando…</div></main>;

  return (
    <main className="container">
      <TopNav />
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 900, fontSize: 18 }}>Mensagens</div>
        <div className="small">DMs simples (threads)</div>
        <div className="hr" />
        <div className="row" style={{ flexWrap: "wrap" }}>
          <input
            style={{ padding: 10, borderRadius: 12, border: "1px solid rgba(28,34,49,.9)", background: "rgba(5,8,12,.55)", color: "var(--text)" }}
            value={toUsername}
            onChange={(e) => setToUsername(e.target.value)}
            placeholder="username para abrir DM (ex: digaosempre)"
          />
          <button className="btn" onClick={startThread}>Abrir DM</button>
        </div>
        {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
      </div>

      {threads.length === 0 ? (
        <div className="card">Sem threads ainda.</div>
      ) : (
        threads.map((t) => (
          <div key={t.id} className="card" style={{ marginBottom: 10 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="col" style={{ gap: 6 }}>
                <div style={{ fontWeight: 900 }}>Thread</div>
                <div className="small">{t.id}</div>
              </div>
              <a className="btn secondary" href={`/mensagens/${t.id}`}>abrir</a>
            </div>
          </div>
        ))
      )}
    </main>
  );
}
