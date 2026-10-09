import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/components/account-pages";
export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Matris" },
      { name: "description", content: "Personalize tema e idioma." },
      { property: "og:title", content: "Configurações — Matris" },
      { property: "og:description", content: "Personalize tema e idioma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <SettingsPage />,
});
