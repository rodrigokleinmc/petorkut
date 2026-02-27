"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function LoginPage() {
  const supabase = supabaseBrowser();
  const next = useSearchParams().get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string>("");

  async function signIn() {
    setMsg("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setMsg(error.message);
    window.location.href = next;
  }

  async function signUp() {
    setMsg("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return setMsg(error.message);
    setMsg("Conta criada! Agora faça login 🙂");
  }

  return (
    <main className="container">
      <div className="card" style={{ maxWidth: 520, margin: "30px auto" }}>
        <h1 style={{ marginTop: 0 }}>Entrar no PetOrkut 🐾</h1>
        <p className="small">Email e senha (Supabase Auth).</p>

        <div className="field">
          <label className="small">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
        </div>

        <div className="field" style={{ marginTop: 10 }}>
          <label className="small">Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>

        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn" onClick={signIn}>Entrar</button>
          <button className="btn secondary" onClick={signUp}>Criar conta</button>
        </div>

        {msg && <p style={{ marginTop: 12 }}>{msg}</p>}

        <div className="hr" />
        <p className="small">
          Depois do login, você cria seu perfil e os perfis dos pets.
        </p>
      </div>
    </main>
  );
}
