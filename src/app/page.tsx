import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { TopNav } from "@/components/TopNav";
import { PostCard } from "@/components/PostCard";

async function getProfileId() {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("id", data.user.id)
    .maybeSingle();

  return profile?.id ?? null;
}

async function getFeed() {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { posts: [], profileMissing: false };

  // If profile not created yet, go onboarding
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!profile) return { posts: [], profileMissing: true };

  // Feed v0.2: RPC get_feed (públicos + seguidos + seus)
  const { data: posts } = await supabase
    .rpc("get_feed", { p_profile_id: profile.id });

  // Hydrate author label (simple)
  const postsWithLabels = await Promise.all((posts ?? []).map(async (p: any) => {
    if (p.author_type === "profile") {
      const { data: a } = await supabase.from("profiles").select("display_name, username").eq("id", p.author_id).maybeSingle();
      return { ...p, author_label: a ? `${a.display_name} (@${a.username})` : "Usuário" };
    } else {
      const { data: pet } = await supabase.from("pets").select("display_name, username").eq("id", p.author_id).maybeSingle();
      return { ...p, author_label: pet ? `${pet.display_name} (@${pet.username})` : "Pet" };
    }
  }));

  return { posts: postsWithLabels, profileMissing: false };
}

export default async function HomePage() {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return (
      <main className="container">
        <div className="card">
          <h1 style={{ marginTop: 0 }}>PetOrkut 🐾</h1>
          <p className="small">
            Rede social pet com vibe nostálgica e recursos modernos. 100% funcional (com Supabase).
          </p>
          <div className="row" style={{ marginTop: 12 }}>
            <Link className="btn" href="/login">Entrar</Link>
            <Link className="btn secondary" href="/login">Criar conta</Link>
          </div>
          <div className="hr" />
          <p className="small">
            Dica: depois de criar conta, você vai criar seu perfil e os perfis dos seus pets.
          </p>
        </div>
      </main>
    );
  }

  const feed = await getFeed();
  if (feed.profileMissing) {
    return (
      <main className="container">
        <div className="card">
          <h1 style={{ marginTop: 0 }}>Quase lá…</h1>
          <p className="small">Antes do feed, precisamos criar seu perfil.</p>
          <Link className="btn" href="/onboarding">Criar meu perfil</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <TopNav />
      <div className="grid">
        <section>
          <div className="card" style={{ marginBottom: 12 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 18 }}>Feed</div>
                <div className="small">públicos + seus</div>
              </div>
              <Link className="btn" href="/postar">Postar</Link>
            </div>
          </div>
          {(feed.posts ?? []).length === 0 ? (
            <div className="card">
              <p>Nenhum post ainda. Seja o primeiro 😼</p>
              <Link className="btn" href="/postar">Criar post</Link>
            </div>
          ) : (
            (feed.posts ?? []).map((p: any) => <PostCard key={p.id} post={p} />)
          )}
        </section>

        <aside className="col">
          <div className="card">
            <div style={{ fontWeight: 900 }}>Atalhos</div>
            <div className="hr" />
            <div className="col">
              <Link className="btn ghost" href="/pets">Gerenciar meus pets</Link>
              <Link className="btn ghost" href="/explorar">Explorar perfis</Link>
              <Link className="btn ghost" href="/perfil">Editar meu perfil</Link>
            </div>
          </div>
          <div className="card">
            <div style={{ fontWeight: 900 }}>Como é “100% funcional”?</div>
            <div className="hr" />
            <p className="small">
              Login, dados, permissões e persistência via Supabase (Postgres + Auth + RLS).
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
