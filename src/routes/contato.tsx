import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/components/account-pages";
export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Matris" },
      { name: "description", content: "Canais de contato demonstrativos." },
      { property: "og:title", content: "Contato — Matris" },
      { property: "og:description", content: "Canais de contato demonstrativos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ContactPage />,
});
