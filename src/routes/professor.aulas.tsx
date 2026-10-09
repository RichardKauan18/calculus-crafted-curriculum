import { createFileRoute } from "@tanstack/react-router";
import { LiveTeacherPage } from "@/components/platform";
export const Route = createFileRoute("/professor/aulas")({
  head: () => ({
    meta: [
      { title: "Gerenciar aulas — Matris" },
      { name: "description", content: "Gerenciamento de aulas." },
    ],
  }),
  component: LiveTeacherPage,
});
