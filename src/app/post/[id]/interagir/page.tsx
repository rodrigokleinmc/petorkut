"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { TopNav } from "@/components/TopNav";

const EMOJIS = ["❤️","😺","🐶","😂","😡","🔥","✨","🥺"];

export default function InteragirPage({ params }: { params: { id: string } }) {
  const supabase = supabaseBrowser();
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { window.location.href = "/login"; return; }
      setLoading(false);
    })();
  }, []);

  async function react(emoji: string) {
    setMsg("");
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;

    const { error } = await supabase.from("reactions").insert({
      post_id: params.id,
      reactor_profile_id: auth.user.id,
      emoji
    });

    if (error) {
      // If already exists (same emoji), ignore
      if (String(error.message).toLowerCase().includes("duplicate")) {
        setMsg("Você já reagiu com esse emoji 🙂");
        return;
      }
      return setMsg(error.message);
    }
    setMsg("Reação enviada ✅");
  }

  async function sendComment() {
    setMsg("");
    if (!comment.trim()) return setMsg("Escreva um comentário.");

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;

    // Commenting as profile for MVP (pode evoluir para comentar como pet)
    const { error } = await supabase.from("comments").insert({
      post_id: params.id,
      author_type: "profile",
      author_id: auth.user.id,
      owner_profile_id: auth.user.id,
      content: comment.trim(),
    });

    if (error) return setMsg(error.message);
    setComment("");
    setMsg("Comentário enviado ✅");
  }

  if (loading) return <main className="container"><div className="card">Carregando…</div></main>;

  return (
    <main className="container">
      <TopNav />
      <div className="card" style={{ maxWidth: 860, margin: "0 auto" }}>
        <h1 style={{ marginTop: 0 }}>Interagir</h1>
        <p className="small">Reaja e comente nesse post.</p>

        <div className="row" style={{ flexWrap: "wrap" }}>
          {EMOJIS.map((e) => (
            <button key={e} className="btn ghost" onClick={() => react(e)}>{e}</button>
          ))}
        </div>

        <div className="hr" />

        <div className="field">
          <label className="small">Comentário</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Manda um recado fofo 🐾" />
        </div>

        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn" onClick={sendComment}>Enviar</button>
          <a className="btn ghost" href={`/post/${params.id}`}>Voltar ao post</a>
        </div>

        {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
      </div>
    </main>
  );
}
