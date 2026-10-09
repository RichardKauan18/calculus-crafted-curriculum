import { createFileRoute } from "@tanstack/react-router";
import { LiveTeacherDashboard } from "@/components/platform";
export const Route = createFileRoute("/professor/")({
  head: () => ({
    meta: [
      { title: "Painel do professor — Matris" },
      { name: "description", content: "Resumo do catálogo e atalhos para as ferramentas de ensino." },
    ],
  }),
  component: LiveTeacherDashboard,
});
