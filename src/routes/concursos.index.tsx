import { createFileRoute } from "@tanstack/react-router";
import { LiveConcursosPage } from "@/components/platform";
export const Route = createFileRoute("/concursos/")({
  head: () => ({
    meta: [
      { title: "Concursos — Matris" },
      { name: "description", content: "Preparação organizada por concursos militares e civis, matérias e aulas." },
    ],
  }),
  component: LiveConcursosPage,
});
