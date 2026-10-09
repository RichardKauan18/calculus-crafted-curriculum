import { createFileRoute } from "@tanstack/react-router";
import { LivePasswordResetPage } from "@/components/platform";

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({
    meta: [
      { title: "Redefinir senha — Matris" },
      { name: "description", content: "Defina uma nova senha para sua conta Matris." },
    ],
  }),
  component: LivePasswordResetPage,
});
