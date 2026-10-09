import { createFileRoute } from "@tanstack/react-router";
import { LiveLessonsPage } from "@/components/platform";
export const Route = createFileRoute("/aulas/")({
  head: () => ({
    meta: [
      { title: "Aulas — Matris" },
      { name: "description", content: "Biblioteca de aulas gravadas de Matemática." },
    ],
  }),
  component: LiveLessonsPage,
});
