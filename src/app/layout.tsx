import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PetOrkut",
  description: "Rede social pet com vibe nostálgica e recursos modernos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  );
}
