"use client";

import { useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function LogoutPage() {
  useEffect(() => {
    const run = async () => {
      const supabase = supabaseBrowser();
      await supabase.auth.signOut();
      window.location.href = "/";
    };
    run();
  }, []);

  return (
    <main className="container">
      <div className="card">Saindo…</div>
    </main>
  );
}
