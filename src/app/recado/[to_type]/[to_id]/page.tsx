"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { TopNav } from "@/components/TopNav";
import { ScrapCreateSchema } from "@/lib/validators";

export default function RecadoPage({ params }: { params: { to_type: "profile" | "pet"; to_id: string } }) {
  const supabase = supabaseBrowser();
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { window.location.href = "/login"; return; }
      setLoading(false);
    })();
  }, []);

  async function send() {
    setMsg("");
    const parsed = ScrapCreateSchema.safeParse({ to_type: params.to_type, to_id: params.to_id, content });
    if (!parsed.success) return setMsg(parsed.error.issues[0]?.message ?? "Dados inválidos.");

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;

    const { error } = await supabase.from("scraps").insert({
      from_profile_id: auth.user.id,
      to_type: parsed.data.to_type,
      to_id: parsed.data.to_id,
      content: parsed.data.content,
    });

    if (error) return setMsg(error.message);
    setContent("");
    setMsg("Recado enviado ✅");
  }

  if (loading) return <main className="container"><div className="card">Carregando…</div></main>;

  return (
    <main className="container">
      <TopNav />
      <div className="card" style={{ maxWidth: 860, margin: "0 auto" }}>
        <h1 style={{ marginTop: 0 }}>Deixar recado</h1>
        <p className="small">Estilo Orkut raiz — só que pet.</p>
        <div className="field">
          <label className="small">Mensagem</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Oi! Eu adorei seu perfil 🐾" />
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn" onClick={send}>Enviar</button>
          <button className="btn ghost" onClick={() => history.back()}>Voltar</button>
        </div>
        {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
      </div>
    </main>
  );
}
