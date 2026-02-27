"use client";

import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { TopNav } from "@/components/TopNav";

export default function ThreadPage({ params }: { params: { thread: string } }) {
  const supabase = supabaseBrowser();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  async function load() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { window.location.href = "/login"; return; }

    const { data, error } = await supabase
      .from("dm_messages")
      .select("*")
      .eq("thread_id", params.thread)
      .order("created_at", { ascending: true });

    if (error) setMsg(error.message);
    setItems(data ?? []);
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  async function send() {
    setMsg("");
    const body = text.trim();
    if (!body) return;

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;

    const { error } = await supabase.from("dm_messages").insert({
      thread_id: params.thread,
      from_profile_id: auth.user.id,
      content: body,
    });

    if (error) return setMsg(error.message);
    setText("");
  }

  useEffect(() => {
    load();

    // Realtime subscribe (opcional, depende de habilitar Realtime no Supabase para dm_messages)
    const channel = supabase
      .channel(`dm:${params.thread}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "dm_messages", filter: `thread_id=eq.${params.thread}` },
        () => load()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.thread]);

  if (loading) return <main className="container"><div className="card">Carregando…</div></main>;

  return (
    <main className="container">
      <TopNav />
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>DM</div>
            <div className="small">Thread: {params.thread}</div>
          </div>
          <a className="btn ghost" href="/mensagens">voltar</a>
        </div>

        <div className="hr" />

        <div className="col" style={{ gap: 10 }}>
          {items.length === 0 ? <div className="small">(sem mensagens)</div> : null}
          {items.map((m) => (
            <div key={m.id} className="card">
              <div className="small">{new Date(m.created_at).toLocaleString("pt-BR")}</div>
              <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="hr" />

        <div className="field">
          <label className="small">Mensagem</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="manda uma mensagem…" />
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn" onClick={send}>Enviar</button>
        </div>

        {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
        <p className="small" style={{ marginTop: 12 }}>
          Se o Realtime não atualizar sozinho, é só recarregar; ele já está pronto para subscribe quando você habilitar no Supabase.
        </p>
      </div>
    </main>
  );
}
