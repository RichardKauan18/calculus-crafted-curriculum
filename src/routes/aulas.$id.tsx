import { createFileRoute } from "@tanstack/react-router";
import { LiveLessonPage } from "@/components/platform";
export const Route = createFileRoute("/aulas/$id")({
  head: () => ({
    meta: [
      { title: "Videoaula — Matris" },
      { name: "description", content: "Assista à aula e acompanhe seu progresso." },
    ],
  }),
  component: LiveLessonPage,
});
