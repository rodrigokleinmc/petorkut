"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { TopNav } from "@/components/TopNav";
import { PostCreateSchema } from "@/lib/validators";

export default function PostarPage() {
  const supabase = supabaseBrowser();
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [authorType, setAuthorType] = useState<"profile" | "pet">("profile");
  const [authorId, setAuthorId] = useState<string>("");
  const [visibility, setVisibility] = useState<"public" | "followers" | "friends" | "private">("public");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { window.location.href = "/login"; return; }
      const { data: p } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
      if (!p) { window.location.href = "/onboarding"; return; }
      setProfile(p);
      setAuthorId(p.id);

      const { data: list } = await supabase.from("pets").select("*").eq("owner_id", data.user.id).order("created_at", { ascending: false });
      setPets(list ?? []);
      setLoading(false);
    })();
  }, []);

  function switchAuthor(t: "profile" | "pet") {
    setAuthorType(t);
    if (t === "profile") setAuthorId(profile?.id ?? "");
    else setAuthorId(pets?.[0]?.id ?? "");
  }

  async function submit() {
    setMsg("");
    const parsed = PostCreateSchema.safeParse({
      author_type: authorType,
      author_id: authorId,
      content,
      visibility,
    });
    if (!parsed.success) return setMsg(parsed.error.issues[0]?.message ?? "Dados inválidos.");

    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

    // Uploads (bucket: media)
const media_urls: string[] = [];
if (files && files.length > 0) {
  for (let i = 0; i < Math.min(files.length, 4); i++) {
    const file = files[i];
    const ext = (file.name.split(".").pop() || "bin").toLowerCase();
    const path = `${data.user.id}/${Date.now()}_${i}.${ext}`;

    const up = await supabase.storage.from("media").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (up.error) { setMsg(up.error.message); return; }

    // Se o bucket for PUBLIC, getPublicUrl funciona.
    const pub = supabase.storage.from("media").getPublicUrl(path);
    if (pub?.data?.publicUrl) media_urls.push(pub.data.publicUrl);
  }
}

const { error } = await supabase.from("posts").insert({
      ...parsed.data,
      owner_profile_id: data.user.id,
      media_urls,
    });

    if (error) return setMsg(error.message);
    window.location.href = "/";
  }

  if (loading) return <main className="container"><div className="card">Carregando…</div></main>;

  return (
    <main className="container">
      <TopNav />
      <div className="card" style={{ maxWidth: 860, margin: "0 auto" }}>
        <h1 style={{ marginTop: 0 }}>Novo post</h1>
        <p className="small">Você pode postar como você ou como um pet.</p>

        <div className="row" style={{ flexWrap: "wrap" }}>
          <button className={`btn ${authorType === "profile" ? "" : "secondary"}`} onClick={() => switchAuthor("profile")}>
            Postar como @{profile.username}
          </button>
          <button className={`btn ${authorType === "pet" ? "" : "secondary"}`} onClick={() => switchAuthor("pet")}>
            Postar como pet
          </button>

          {authorType === "pet" && (
            <select value={authorId} onChange={(e) => setAuthorId(e.target.value)} style={{ padding: 10, borderRadius: 12 }}>
              {pets.length === 0 ? <option value="">(crie um pet primeiro)</option> : null}
              {pets.map((p) => <option key={p.id} value={p.id}>{p.display_name} (@{p.username})</option>)}
            </select>
          )}
        </div>

        <div className="field" style={{ marginTop: 12 }}>
          <label className="small">Visibilidade</label>
          <select value={visibility} onChange={(e) => setVisibility(e.target.value as any)}>
            <option value="public">público</option>
            <option value="followers">seguidores</option>
            <option value="friends">amigos</option>
            <option value="private">só eu</option>
          </select>
        </div>

        <div className="field" style={{ marginTop: 12 }}>
          <label className="small">Mídia (até 4 arquivos)</label>
          <input type="file" multiple accept="image/*,video/*" onChange={(e) => setFiles(e.target.files)} />
        </div>

        <div className="field" style={{ marginTop: 12 }}>
          <label className="small">Texto</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="O que o pet aprontou hoje? 🐾" />
        </div>

        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn" onClick={submit}>Publicar</button>
          <a className="btn ghost" href="/">Cancelar</a>
        </div>

        {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
        <div className="hr" />
        <p className="small">
          Upload de imagens/vídeos via Storage entra no próximo passo (já deixei o banco pronto com media_urls).
        </p>
      </div>
    </main>
  );
}
