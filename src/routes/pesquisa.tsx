import { createFileRoute } from "@tanstack/react-router";
import { LiveSearchPage } from "@/components/platform";

export const Route = createFileRoute("/pesquisa")({
  head: () => ({
    meta: [
      { title: "Pesquisar aulas — Matris" },
      {
        name: "description",
        content: "Pesquise aulas publicadas por título, matéria ou descrição.",
      },
      { property: "og:title", content: "Pesquisar aulas — Matris" },
      {
        property: "og:description",
        content: "Encontre rapidamente o conteúdo que procura.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LiveSearchPage,
});
