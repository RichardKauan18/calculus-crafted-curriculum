import { AlertCircle, Inbox, LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function DemoNotice({
  children = "Conteúdo demonstrativo para avaliação da experiência.",
}: {
  children?: ReactNode;
}) {
  return (
    <p className="rounded-md border border-border bg-muted/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid min-h-52 place-items-center rounded-lg border border-dashed border-border bg-card/40 p-6 text-center">
      <div>
        <Inbox aria-hidden="true" className="mx-auto size-7 text-muted-foreground" />
        <h2 className="mt-3 font-display text-xl">{title}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}

export function LoadingState({ label = "Carregando conteúdo" }: { label?: string }) {
  return (
    <div
      className="flex min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground"
      role="status"
    >
      <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({
  title = "Não foi possível carregar",
  description,
  onRetry,
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="grid min-h-52 place-items-center rounded-lg border border-destructive/30 bg-card p-6 text-center"
      role="alert"
    >
      <div>
        <AlertCircle aria-hidden="true" className="mx-auto size-7 text-destructive" />
        <h2 className="mt-3 font-display text-xl">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        {onRetry && (
          <Button className="mt-4" onClick={onRetry}>
            Tentar novamente
          </Button>
        )}
      </div>
    </div>
  );
}
