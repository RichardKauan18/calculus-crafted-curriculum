import { createFileRoute } from "@tanstack/react-router";
import { LiveAuthPage } from "@/components/platform";
export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Matris" },
      { name: "description", content: "Entre para salvar seu progresso de estudos." },
    ],
  }),
  component: () => <LiveAuthPage />,
});
