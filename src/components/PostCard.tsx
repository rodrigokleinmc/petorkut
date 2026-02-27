import Link from "next/link";

type Post = {
  id: string;
  content: string;
  created_at: string;
  author_type: "profile" | "pet";
  author_id: string;
  visibility: string;
  owner_profile_id: string;
  author_label?: string;
};

export function PostCard({ post }: { post: Post }) {
  const dt = new Date(post.created_at);
  return (
    <div className="card" style={{ marginBottom: 10 }}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className="col" style={{ gap: 6 }}>
          <div style={{ fontWeight: 800 }}>
            {post.author_label ?? (post.author_type === "pet" ? "Pet" : "Pessoa")}
            <span className="small" style={{ marginLeft: 10 }}>
              {dt.toLocaleString("pt-BR")}
            </span>
          </div>
          <div style={{ whiteSpace: "pre-wrap" }}>{post.content}</div>
        </div>

        <div className="col" style={{ alignItems: "flex-end" }}>
          <span className="badge">{post.visibility}</span>
          <Link className="small" href={`/post/${post.id}`}>abrir</Link>
        </div>
      </div>
    </div>
  );
}
