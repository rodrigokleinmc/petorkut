import { supabaseServer } from "@/lib/supabase/server";
import { TopNav } from "@/components/TopNav";
import { PostCard } from "@/components/PostCard";
import Link from "next/link";

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const supabase = supabaseServer();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", params.username)
    .maybeSingle();

  if (!profile) {
    return (
      <main className="container">
        <div className="card">Perfil não encontrado.</div>
      </main>
    );
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("author_type", "profile")
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const postsWithLabel = (posts ?? []).map((p: any) => ({
    ...p,
    author_label: `${profile.display_name} (@${profile.username})`,
  }));

  const { data: scraps } = await supabase
    .from("scraps")
    .select("*")
    .eq("to_type", "profile")
    .eq("to_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <main className="container">
      <TopNav />
      <div className="grid">
        <section>
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 900, fontSize: 20 }}>{profile.display_name}</div>
            <div className="small">@{profile.username}</div>
            {profile.bio ? <p className="small">{profile.bio}</p> : null}
            <div className="row" style={{ marginTop: 10, flexWrap: "wrap" }}>
              <Link className="btn secondary" href={`/recado/profile/${profile.id}`}>deixar recado</Link>
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight: 900 }}>Posts</div>
            <div className="hr" />
            {(postsWithLabel.length === 0) ? <div className="small">(sem posts)</div> : null}
            {postsWithLabel.map((p: any) => <PostCard key={p.id} post={p} />)}
          </div>
        </section>

        <aside>
          <div className="card">
            <div style={{ fontWeight: 900 }}>Scraps (recados)</div>
            <div className="hr" />
            {(scraps ?? []).length === 0 ? <div className="small">(sem recados)</div> : null}
            {(scraps ?? []).map((s: any) => (
              <div key={s.id} className="card" style={{ marginTop: 10 }}>
                <div className="small">{new Date(s.created_at).toLocaleString("pt-BR")}</div>
                <div style={{ whiteSpace: "pre-wrap" }}>{s.content}</div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
