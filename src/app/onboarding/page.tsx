"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { ProfileOnboardingSchema } from "@/lib/validators";
import { z } from "zod";

type Form = z.infer<typeof ProfileOnboardingSchema>;

export default function OnboardingPage() {
  const supabase = supabaseBrowser();
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState<Form>({ username: "", display_name: "", bio: "" });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { window.location.href = "/login"; return; }

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
      if (profile) { window.location.href = "/"; return; }

      setLoading(false);
    })();
  }, [supabase]);

  async function submit() {
    setMsg("");
    const parsed = ProfileOnboardingSchema.safeParse(form);
    if (!parsed.success) return setMsg(parsed.error.issues[0]?.message ?? "Dados inválidos.");

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;

    const { error } = await supabase.from("profiles").insert({
      id: authData.user.id,
      username: parsed.data.username.toLowerCase(),
      display_name: parsed.data.display_name,
      bio: parsed.data.bio ?? "",
    });

    if (error) return setMsg(error.message);
    window.location.href = "/pets";
  }

  if (loading) {
    return (
      <main className="container">
        <div className="card">Carregando…</div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="card" style={{ maxWidth: 680, margin: "20px auto" }}>
        <h1 style={{ marginTop: 0 }}>Criar meu perfil</h1>
        <p className="small">Esse perfil é o “dono” dos seus pets.</p>

        <div className="field">
          <label className="small">Usuário (username)</label>
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="digaosempre" />
        </div>

        <div className="field" style={{ marginTop: 10 }}>
          <label className="small">Nome de exibição</label>
          <input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Digão" />
        </div>

        <div className="field" style={{ marginTop: 10 }}>
          <label className="small">Bio</label>
          <textarea value={form.bio ?? ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Fala um pouco sobre você…" />
        </div>

        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn" onClick={submit}>Salvar</button>
        </div>

        {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
      </div>
    </main>
  );
}
