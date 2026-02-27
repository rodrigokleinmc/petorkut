"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { TopNav } from "@/components/TopNav";

export default function ExplorarPage() {
  const supabase = supabaseBrowser();
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [profiles, setProfiles] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [me, setMe] = useState<string>("");
  const [msg, setMsg] = useState("");

  async function load() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { window.location.href = "/login"; return; }
    setMe(auth.user.id);

    // load lists (basic)
    const { data: p } = await supabase.from("profiles").select("id, username, display_name, bio").order("created_at", { ascending: false }).limit(50);
    const { data: petList } = await supabase.from("pets").select("id, username, display_name, species, breed, bio").order("created_at", { ascending: false }).limit(50);
    setProfiles(p ?? []);
    setPets(petList ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filteredProfiles = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return profiles;
    return profiles.filter((x) => (x.username ?? "").toLowerCase().includes(s) || (x.display_name ?? "").toLowerCase().includes(s));
  }, [q, profiles]);

  const filteredPets = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return pets;
    return pets.filter((x) => (x.username ?? "").toLowerCase().includes(s) || (x.display_name ?? "").toLowerCase().includes(s) || (x.species ?? "").toLowerCase().includes(s));
  }, [q, pets]);

  async function follow(target_type: "profile" | "pet", target_id: string) {
    setMsg("");
    if (!me) return;
    if (target_type === "profile" && target_id === me) return setMsg("Você não precisa seguir você mesmo 🙂");
    const { error } = await supabase.from("follows").insert({ follower_profile_id: me, target_type, target_id });
    if (error) {
      if (String(error.message).toLowerCase().includes("duplicate")) return setMsg("Você já segue 🙂");
      return setMsg(error.message);
    }
    setMsg("Seguindo ✅");
  }

  if (loading) return <main className="container"><div className="card">Carregando…</div></main>;

  return (
    <main className="container">
      <TopNav />
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 900, fontSize: 18 }}>Explorar</div>
        <div className="small">ache pessoas e pets</div>
        <div className="field" style={{ marginTop: 10 }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="buscar por username, nome, espécie…" />
        </div>
        {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
      </div>

      <div className="grid">
        <section>
          <div className="card">
            <div style={{ fontWeight: 900 }}>Pessoas</div>
            <div className="hr" />
            {filteredProfiles.length === 0 ? <div className="small">Nenhum resultado.</div> : null}
            {filteredProfiles.map((p) => (
              <div key={p.id} className="card" style={{ marginTop: 10 }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div className="col" style={{ gap: 4 }}>
                    <div style={{ fontWeight: 900 }}>{p.display_name} <span className="small">@{p.username}</span></div>
                    {p.bio ? <div className="small">{p.bio}</div> : <div className="small">(sem bio)</div>}
                  </div>
                  <div className="col" style={{ alignItems: "flex-end" }}>
                    <a className="btn ghost" href={`/u/${p.username}`}>ver</a>
                    <button className="btn secondary" onClick={() => follow("profile", p.id)}>seguir</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside>
          <div className="card">
            <div style={{ fontWeight: 900 }}>Pets</div>
            <div className="hr" />
            {filteredPets.length === 0 ? <div className="small">Nenhum resultado.</div> : null}
            {filteredPets.map((p) => (
              <div key={p.id} className="card" style={{ marginTop: 10 }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div className="col" style={{ gap: 4 }}>
                    <div style={{ fontWeight: 900 }}>{p.display_name} <span className="small">@{p.username}</span></div>
                    <div className="small">{p.species}{p.breed ? ` • ${p.breed}` : ""}</div>
                    {p.bio ? <div className="small">{p.bio}</div> : null}
                  </div>
                  <div className="col" style={{ alignItems: "flex-end" }}>
                    <a className="btn ghost" href={`/u/pet/${p.username}`}>ver</a>
                    <button className="btn secondary" onClick={() => follow("pet", p.id)}>seguir</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
