import { supabaseServer } from "@/lib/supabase/server";
import Link from "next/link";
import { TopNav } from "@/components/TopNav";

async function authorLabel(supabase: any, post: any) {
  if (post.author_type === "profile") {
    const { data: a } = await supabase.from("profiles").select("display_name, username").eq("id", post.author_id).maybeSingle();
    return a ? `${a.display_name} (@${a.username})` : "Usuário";
  }
  const { data: pet } = await supabase.from("pets").select("display_name, username").eq("id", post.author_id).maybeSingle();
  return pet ? `${pet.display_name} (@${pet.username})` : "Pet";
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return (
      <main className="container">
        <div className="card">Faça login. <Link href="/login">Entrar</Link></div>
      </main>
    );
  }

  const { data: post } = await supabase.from("posts").select("*").eq("id", params.id).maybeSingle();
  if (!post) {
    return (
      <main className="container">
        <div className="card">Post não encontrado.</div>
      </main>
    );
  }

  const label = await authorLabel(supabase, post);
  const { data: comments } = await supabase.from("comments").select("*").eq("post_id", post.id).order("created_at", { ascending: true });
  const { data: reactions } = await supabase.from("reactions").select("emoji").eq("post_id", post.id);

  const counts = (reactions ?? []).reduce((acc: any, r: any) => {
    acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <main className="container">
      <TopNav />
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="col" style={{ gap: 6 }}>
            <div style={{ fontWeight: 900 }}>{label}</div>
            <div className="small">{new Date(post.created_at).toLocaleString("pt-BR")} • <span className="badge">{post.visibility}</span></div>
          </div>
          <Link className="btn ghost" href="/">voltar</Link>
        </div>
        <div className="hr" />
        <div style={{ whiteSpace: "pre-wrap" }}>{post.content}</div>

        {(post.media_urls && post.media_urls.length > 0) ? (
          <div className="hr">
          </div>
        ) : null}
        <div className="col">
          {(post.media_urls ?? []).map((u: string) => (
            u.includes(".mp4") || u.includes("video") ? (
              <video key={u} src={u} controls style={{ width: "100%", borderRadius: 12, border: "1px solid rgba(28,34,49,.9)" }} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={u} src={u} alt="mídia" style={{ width: "100%", borderRadius: 12, border: "1px solid rgba(28,34,49,.9)" }} />
            )
          ))}
        </div>

        <div className="hr" />
        <div className="row" style={{ flexWrap: "wrap" }}>
          <span className="small">Reações:</span>
          {Object.keys(counts).length === 0 ? <span className="small">(ainda nenhuma)</span> : null}
          {Object.entries(counts).map(([k, v]) => <span key={k} className="badge">{k} {v as any}</span>)}
          <Link className="btn secondary" href={`/post/${post.id}/interagir`}>reagir / comentar</Link>
        </div>

        <div className="hr" />
        <div style={{ fontWeight: 900, marginBottom: 6 }}>Comentários</div>
        {(comments ?? []).length === 0 ? (
          <div className="small">Nenhum comentário ainda.</div>
        ) : (
          (comments ?? []).map((c: any) => (
            <div key={c.id} className="card" style={{ marginTop: 8 }}>
              <div className="small">{new Date(c.created_at).toLocaleString("pt-BR")}</div>
              <div style={{ whiteSpace: "pre-wrap" }}>{c.content}</div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
