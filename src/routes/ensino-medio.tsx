import { createFileRoute } from "@tanstack/react-router";
import { LiveLevelPage } from "@/components/platform";
export const Route = createFileRoute("/ensino-medio")({
  head: () => ({ meta: [{ title: "Ensino Médio — Matris" }] }),
  component: () => <LiveLevelPage level="medio" />,
});
