import { createFileRoute } from "@tanstack/react-router";
import { LiveConcursoPage } from "@/components/platform";
export const Route = createFileRoute("/concursos/$slug")({
  head: () => ({ meta: [{ title: "Concurso — Matris" }] }),
  component: LiveConcursoPage,
});
