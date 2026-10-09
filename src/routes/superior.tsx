import { createFileRoute } from "@tanstack/react-router";
import { LiveLevelPage } from "@/components/platform";
export const Route = createFileRoute("/superior")({
  head: () => ({ meta: [{ title: "Superior — Matris" }] }),
  component: () => <LiveLevelPage level="superior" />,
});
