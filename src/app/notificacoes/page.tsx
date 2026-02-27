"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { TopNav } from "@/components/TopNav";

function pretty(n: any) {
  const p = n.payload ?? {};
  switch (n.type) {
    case "follow": return `Alguém começou a seguir você.`;
    case "reaction": return `Reagiram ao seu post ${p.emoji ?? ""}`.trim();
    case "comment": return `Comentaram no seu post.`;
    case "scrap": return `Você recebeu um recado (scrap).`;
    default: return `Notificação: ${n.type}`;
  }
}

export default function NotificacoesPage() {
  const supabase = supabaseBrowser();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { window.location.href = "/login"; return; }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(60);

    if (error) setMsg(error.message);
    setItems(data ?? []);
    setLoading(false);
  }

  async function markAllRead() {
    setMsg("");
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("is_read", false);

    if (error) return setMsg(error.message);
    await load();
  }

  useEffect(() => { load(); }, []);

  if (loading) return <main className="container"><div className="card">Carregando…</div></main>;

  const unread = items.filter((x) => !x.is_read).length;

  return (
    <main className="container">
      <TopNav />
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>Notificações</div>
            <div className="small">{unread} não lidas</div>
          </div>
          <button className="btn secondary" onClick={markAllRead}>marcar tudo como lido</button>
        </div>
        {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
      </div>

      {items.length === 0 ? (
        <div className="card">Sem notificações ainda.</div>
      ) : (
        items.map((n) => (
          <div key={n.id} className="card" style={{ marginBottom: 10, opacity: n.is_read ? 0.8 : 1 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="col" style={{ gap: 6 }}>
                <div style={{ fontWeight: 900 }}>{pretty(n)}</div>
                <div className="small">{new Date(n.created_at).toLocaleString("pt-BR")}</div>
              </div>
              {!n.is_read ? <span className="badge">novo</span> : <span className="badge">lido</span>}
            </div>
          </div>
        ))
      )}
    </main>
  );
}
