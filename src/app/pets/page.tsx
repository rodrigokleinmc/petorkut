"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { TopNav } from "@/components/TopNav";
import { PetCreateSchema } from "@/lib/validators";

export default function PetsPage() {
  const supabase = supabaseBrowser();
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ username: "", display_name: "", species: "cachorro", breed: "", bio: "" });

  async function load() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) { window.location.href = "/login"; return; }

    const { data: prof } = await supabase.from("profiles").select("id").eq("id", data.user.id).maybeSingle();
    if (!prof) { window.location.href = "/onboarding"; return; }

    const { data: list } = await supabase.from("pets").select("*").eq("owner_id", data.user.id).order("created_at", { ascending: false });
    setPets(list ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function createPet() {
    setMsg("");
    const parsed = PetCreateSchema.safeParse(form);
    if (!parsed.success) return setMsg(parsed.error.issues[0]?.message ?? "Dados inválidos.");

    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

    const { error } = await supabase.from("pets").insert({
      owner_id: data.user.id,
      username: parsed.data.username.toLowerCase(),
      display_name: parsed.data.display_name,
      species: parsed.data.species,
      breed: parsed.data.breed ?? "",
      bio: parsed.data.bio ?? "",
    });

    if (error) return setMsg(error.message);
    setForm({ username: "", display_name: "", species: "cachorro", breed: "", bio: "" });
    await load();
    setMsg("Pet criado ✅");
  }

  async function removePet(id: string) {
    setMsg("");
    const { error } = await supabase.from("pets").delete().eq("id", id);
    if (error) return setMsg(error.message);
    await load();
  }

  if (loading) return <main className="container"><div className="card">Carregando…</div></main>;

  return (
    <main className="container">
      <TopNav />
      <div className="grid">
        <section>
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 900, fontSize: 18 }}>Meus pets</div>
            <div className="small">cada pet é um perfil próprio</div>
          </div>

          {pets.length === 0 ? (
            <div className="card">
              <p>Nenhum pet ainda. Crie o primeiro 😺</p>
            </div>
          ) : (
            pets.map((p) => (
              <div className="card" key={p.id} style={{ marginBottom: 10 }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div className="col" style={{ gap: 4 }}>
                    <div style={{ fontWeight: 900 }}>{p.display_name} <span className="small">@{p.username}</span></div>
                    <div className="small">{p.species}{p.breed ? ` • ${p.breed}` : ""}</div>
                    {p.bio ? <div className="small">{p.bio}</div> : null}
                  </div>
                  <div className="col" style={{ alignItems: "flex-end" }}>
                    <a className="btn ghost" href={`/u/pet/${p.username}`}>ver perfil</a>
                    <button className="btn secondary" onClick={() => removePet(p.id)}>remover</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        <aside className="col">
          <div className="card">
            <div style={{ fontWeight: 900 }}>Criar pet</div>
            <div className="hr" />

            <div className="field">
              <label className="small">Username do pet</label>
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="luna_pug" />
            </div>

            <div className="field" style={{ marginTop: 10 }}>
              <label className="small">Nome do pet</label>
              <input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Luna" />
            </div>

            <div className="field" style={{ marginTop: 10 }}>
              <label className="small">Espécie</label>
              <select value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })}>
                <option value="cachorro">cachorro</option>
                <option value="gato">gato</option>
                <option value="passaro">pássaro</option>
                <option value="outro">outro</option>
              </select>
            </div>

            <div className="field" style={{ marginTop: 10 }}>
              <label className="small">Raça (opcional)</label>
              <input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} placeholder="pug" />
            </div>

            <div className="field" style={{ marginTop: 10 }}>
              <label className="small">Bio (opcional)</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Minha humana diz que eu mando na casa." />
            </div>

            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn" onClick={createPet}>Criar</button>
            </div>

            {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
          </div>
        </aside>
      </div>
    </main>
  );
}
