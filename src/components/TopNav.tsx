import Link from "next/link";

export function TopNav() {
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="row" style={{ gap: 10 }}>
          <div style={{ fontWeight: 900, letterSpacing: .3 }}>
            PetOrkut <span className="small">🐾</span>
          </div>
          <span className="badge">rede social pet • funcional</span>
        </div>
        <div className="nav">
          <Link href="/">Feed</Link>
          <Link href="/pets">Meus pets</Link>
          <Link href="/explorar">Explorar</Link>
          <Link href="/notificacoes">Notificações</Link>
          <Link href="/mensagens">Mensagens</Link>
          <Link href="/perfil">Meu perfil</Link>
          <Link href="/sair">Sair</Link>
        </div>
      </div>
    </div>
  );
}
