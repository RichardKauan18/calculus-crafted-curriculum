import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Pencil,
  Plus,
  Quote,
  Settings,
  Star,
  Trash2,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { lessons } from "@/lib/mock-data";

const items = [
  ["Dashboard", "/professor", LayoutDashboard],
  ["Aulas", "/professor/aulas", BookOpen],
  ["Alunos", "#", Users],
  ["Concursos", "/concursos", Trophy],
  ["Depoimentos", "#", Quote],
  ["Sobre mim", "/sobre", GraduationCap],
  ["Configurações", "/configuracoes", Settings],
] as const;
export function AdminShell({ children, title }: { children: ReactNode; title: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center border-b border-border bg-card px-4 py-3 lg:hidden">
        <Link to="/" className="font-display text-xl">
          Matris <span className="font-mono text-xs text-muted-foreground">studio</span>
        </Link>
        <Button size="icon" variant="outline" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </Button>
      </header>
      <div className="lg:grid lg:grid-cols-[240px_1fr]">
        <aside
          className={`${open ? "block" : "hidden"} border-b border-border bg-card p-4 lg:sticky lg:top-0 lg:block lg:h-screen lg:border-b-0 lg:border-r`}
        >
          <Link to="/" className="hidden px-3 py-4 font-display text-xl lg:block">
            Matris <span className="font-mono text-xs text-muted-foreground">studio</span>
          </Link>
          <nav className="mt-3 space-y-1">
            {items.map(([label, to, Icon]) =>
              to === "#" ? (
                <button
                  key={label}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm text-muted-foreground"
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ) : (
                <Link
                  key={label}
                  to={to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-3 text-sm text-muted-foreground"
                  activeProps={{ className: "bg-primary/10 text-primary" }}
                  activeOptions={{ exact: true }}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              ),
            )}
          </nav>
        </aside>
        <main className="min-w-0 p-5 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[.16em] text-primary">
            Área do professor
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
}
export function AdminDashboard() {
  return (
    <AdminShell title="Visão geral">
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric value="1.284" label="Total de alunos" />
        <Metric value="320" label="Total de aulas" />
        <Metric value="18.640" label="Aulas assistidas" />
        <Metric value="4,8" label="Avaliação média" />
      </div>
      <section className="mt-8 rounded-lg border border-border bg-card p-6">
        <h2 className="font-display text-2xl">Atividade recente</h2>
        <div className="mt-5 space-y-4">
          {[
            "Ana concluiu Função quadrática",
            "Lucas avaliou Trigonometria com 5 estrelas",
            "Marina iniciou Geometria espacial",
          ].map((t, i) => (
            <div
              key={t}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border pb-4"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs text-primary">
                {i + 1}
              </span>
              <span className="truncate text-sm">{t}</span>
              <span className="font-mono text-[10px] text-muted-foreground">há {i + 1}h</span>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
export function AdminLessons() {
  return (
    <AdminShell title="Gerenciar aulas">
      <div className="mt-6 flex justify-end">
        <Button className="rounded-full">
          <Plus />
          Adicionar aula
        </Button>
      </div>
      <div className="mt-4 space-y-3">
        {lessons.map((l) => (
          <article
            key={l.id}
            className="grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
          >
            <div className="min-w-0">
              <h2 className="truncate font-medium">{l.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {l.subject} · {l.category} · {l.duration}
              </p>
              <span className="mt-2 inline-block rounded-full bg-mint/10 px-2 py-1 font-mono text-[10px] text-mint">
                Publicado
              </span>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm">
                <Pencil />
                Editar
              </Button>
              <Button variant="outline" size="sm" className="text-destructive">
                <Trash2 />
                Excluir
              </Button>
            </div>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <strong className="font-display text-4xl">{value}</strong>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
