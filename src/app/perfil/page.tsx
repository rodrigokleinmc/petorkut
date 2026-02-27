"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { TopNav } from "@/components/TopNav";

export default function PerfilPage() {
  const supabase = supabaseBrowser();
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { window.location.href = "/login"; return; }

      const { data: p } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
      if (!p) { window.location.href = "/onboarding"; return; }
      setProfile(p);
      setLoading(false);
    })();
  }, [supabase]);

  async function save() {
    setMsg("");
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

    const { error } = await supabase.from("profiles").update({
      display_name: profile.display_name,
      bio: profile.bio ?? "",
      avatar_url: profile.avatar_url ?? null,
    }).eq("id", data.user.id);

    if (error) return setMsg(error.message);
    setMsg("Salvo ✅");
  }

  if (loading) return <main className="container"><div className="card">Carregando…</div></main>;

  return (
    <main className="container">
      <TopNav />
      <div className="card" style={{ maxWidth: 760, margin: "0 auto" }}>
        <h1 style={{ marginTop: 0 }}>Meu perfil</h1>
        <div className="field">
          <label className="small">Nome de exibição</label>
          <input value={profile.display_name ?? ""} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} />
        </div>
        <div className="field" style={{ marginTop: 10 }}>
          <label className="small">Bio</label>
          <textarea value={profile.bio ?? ""} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
        </div>
        <div className="field" style={{ marginTop: 10 }}>
          <label className="small">Avatar URL (opcional)</label>
          <input value={profile.avatar_url ?? ""} onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })} placeholder="https://..." />
        </div>
        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn" onClick={save}>Salvar</button>
        </div>
        {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
      </div>
    </main>
  );
}
