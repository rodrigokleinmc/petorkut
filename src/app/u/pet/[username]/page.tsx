import { supabaseServer } from "@/lib/supabase/server";
import { TopNav } from "@/components/TopNav";
import { PostCard } from "@/components/PostCard";
import Link from "next/link";

export default async function PetProfilePage({ params }: { params: { username: string } }) {
  const supabase = supabaseServer();

  const { data: pet } = await supabase
    .from("pets")
    .select("*")
    .eq("username", params.username)
    .maybeSingle();

  if (!pet) {
    return (
      <main className="container">
        <div className="card">Pet não encontrado.</div>
      </main>
    );
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("author_type", "pet")
    .eq("author_id", pet.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const postsWithLabel = (posts ?? []).map((p: any) => ({
    ...p,
    author_label: `${pet.display_name} (@${pet.username})`,
  }));

  const { data: scraps } = await supabase
    .from("scraps")
    .select("*")
    .eq("to_type", "pet")
    .eq("to_id", pet.id)
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <main className="container">
      <TopNav />
      <div className="grid">
        <section>
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 900, fontSize: 20 }}>{pet.display_name}</div>
            <div className="small">@{pet.username} • {pet.species}{pet.breed ? ` • ${pet.breed}` : ""}</div>
            {pet.bio ? <p className="small">{pet.bio}</p> : null}
            <div className="row" style={{ marginTop: 10, flexWrap: "wrap" }}>
              <Link className="btn secondary" href={`/recado/pet/${pet.id}`}>deixar recado</Link>
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
