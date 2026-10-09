import { createFileRoute } from "@tanstack/react-router";
import { LiveTeacherPage } from "@/components/platform";
export const Route = createFileRoute("/professor/")({
  head: () => ({
    meta: [
      { title: "Painel do professor — Matris" },
      { name: "description", content: "Gerencie as aulas da plataforma." },
    ],
  }),
  component: LiveTeacherPage,
});
