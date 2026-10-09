import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  ChevronRight,
  Menu,
  Moon,
  Play,
  Search,
  Settings,
  Star,
  Sun,
  Trophy,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  categories,
  exams,
  getTrailLessons,
  getTrailProgress,
  normalizeProgress,
  type Lesson,
} from "@/lib/mock-data";

const nav = [
  { label: "Fundamental", to: "/fundamental" },
  { label: "Ensino Médio", to: "/ensino-medio" },
  { label: "Pré-vestibular", to: "/pre-vestibular" },
  { label: "Superior", to: "/superior" },
  { label: "Concursos", to: "/concursos" },
] as const;

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("matris-theme");
    const on = saved === "dark" || (!saved && matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(on);
    document.documentElement.classList.toggle("dark", on);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("matris-theme", next ? "dark" : "light");
  };
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={dark ? "Ativar tema claro" : "Ativar tema escuro"}
      className="rounded-full border border-border bg-surface/60"
    >
      {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </Button>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 sm:px-6 lg:flex">
        <Link
          to="/"
          className="flex min-w-0 items-baseline gap-2"
          aria-label="Matris, página inicial"
        >
          <strong className="font-display text-xl">Matris</strong>
          <span className="font-mono text-xs text-muted-foreground">.mat</span>
        </Link>
        <nav aria-label="Trilhas de estudo" className="ml-4 hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              activeProps={{ className: "bg-primary/10 text-primary" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link
            to="/pesquisa"
            aria-label="Pesquisar aulas"
            className="hidden min-h-11 items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex"
          >
            <Search aria-hidden="true" className="size-4" />
            <span className="hidden md:inline">Buscar aulas…</span>
          </Link>
          <ThemeToggle />
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="hidden rounded-full border border-border sm:inline-flex"
          >
            <Link to="/configuracoes" aria-label="Configurações">
              <Settings aria-hidden="true" />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="rounded-full bg-primary text-primary-foreground"
          >
            <Link to="/perfil" aria-label="Área do aluno">
              <User aria-hidden="true" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full border border-border lg:hidden"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </Button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          aria-label="Navegação móvel"
          className="border-t border-border px-4 py-3 lg:hidden"
        >
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block min-h-11 rounded-lg px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/pesquisa"
            onClick={() => setOpen(false)}
            className="block min-h-11 rounded-md px-3 py-3 text-sm text-muted-foreground"
          >
            Pesquisar aulas
          </Link>
          <Link
            to="/configuracoes"
            onClick={() => setOpen(false)}
            className="block min-h-11 rounded-md px-3 py-3 text-sm text-muted-foreground"
          >
            Configurações
          </Link>
          {user ? (
            <Link
              to="/perfil"
              onClick={() => setOpen(false)}
              className="block min-h-11 rounded-md px-3 py-3 text-sm text-muted-foreground"
            >
              Meu perfil
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="block min-h-11 rounded-md px-3 py-3 text-sm text-muted-foreground"
              >
                Entrar
              </Link>
              <Link
                to="/cadastro"
                onClick={() => setOpen(false)}
                className="block min-h-11 rounded-md px-3 py-3 text-sm text-muted-foreground"
              >
                Criar conta
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface/40">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-6 py-10 sm:flex-row">
        <Link to="/" className="font-display text-lg font-semibold">
          Matris <span className="font-mono text-xs text-muted-foreground">.mat</span>
        </Link>
        <div className="flex flex-wrap justify-center gap-5 text-sm text-muted-foreground">
          <Link to="/sobre">Sobre</Link>
          <Link to="/contato">Contato</Link>
          <Link to="/professor">Área do professor</Link>
        </div>
        <span className="font-mono text-xs text-muted-foreground">© 2026 · demonstração</span>
      </div>
    </footer>
  );
}
export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-8 pt-12 sm:px-6 sm:pt-16">
      {eyebrow && (
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
      )}
      <h1 className="mt-2 max-w-4xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </section>
  );
}
export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const safe = normalizeProgress(value);
  return (
    <div
      role="progressbar"
      aria-label={label ?? "Progresso"}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safe}
      className="h-1.5 overflow-hidden rounded-full bg-muted"
    >
      <div
        className="h-full rounded-full bg-primary transition-all duration-700"
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}
export function Rating({ value = 5 }: { value?: number }) {
  return (
    <div className="flex gap-0.5 text-amber" aria-label={`${value} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          aria-hidden="true"
          className="size-4"
          fill={i <= Math.round(value) ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}

export function LessonCard({
  lesson,
  progress = lesson.progress,
}: {
  lesson: Lesson;
  progress?: number;
}) {
  const safe = normalizeProgress(progress);
  const label = safe === 100 ? "Concluída" : safe > 0 ? "Em andamento" : "Não iniciada";
  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-card transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
      <Link
        to="/aulas/$id"
        params={{ id: lesson.id }}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <div className="relative aspect-video overflow-hidden">
          <img
            src={lesson.image}
            alt={`Capa da aula ${lesson.title}`}
            loading="lazy"
            width={1088}
            height={608}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 font-mono text-xs text-foreground backdrop-blur">
            {label}
          </span>
          <span className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
            <Play aria-hidden="true" className="size-4" fill="currentColor" />
          </span>
        </div>
        <div className="p-4">
          <p className="font-mono text-xs text-muted-foreground">
            {lesson.subject} · {lesson.category}
          </p>
          <h3 className="mt-1 text-base font-medium">{lesson.title}</h3>
          <div className="mt-4">
            <ProgressBar value={safe} label={`Progresso em ${lesson.title}`} />
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>
              {safe === 100 ? "Concluída" : safe === 0 ? "Iniciar aula" : `${safe}% concluído`}
            </span>
            <span className="shrink-0">{lesson.duration}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function CategoryCard({
  category,
  index,
}: {
  category: (typeof categories)[number];
  index: number;
}) {
  const paths = {
    fundamental: "/fundamental",
    "ensino-medio": "/ensino-medio",
    "pre-vestibular": "/pre-vestibular",
    superior: "/superior",
    concursos: "/concursos",
  } as const;
  const lessonCount = getTrailLessons(category.slug).length;
  const progress = getTrailProgress(category.slug);
  return (
    <article
      className={`category-${category.tone} rounded-lg border border-border bg-card/70 p-5 transition hover:-translate-y-1 hover:border-current`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">
          {String(index + 1).padStart(2, "0")} · {category.level}
        </span>
        <span
          aria-hidden="true"
          className="grid size-9 place-items-center rounded-full bg-current/10 text-lg"
        >
          {category.symbol}
        </span>
      </div>
      <h3 className="mt-8 text-lg font-medium text-foreground">{category.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{category.detail}</p>
      <p className="mt-3 text-sm text-foreground">{category.objective}</p>
      <div className="mt-5 text-foreground">
        {lessonCount > 0 ? (
          <>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {lessonCount} {lessonCount === 1 ? "aula demonstrativa" : "aulas demonstrativas"}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="mt-2">
              <ProgressBar value={progress} label={`Progresso demonstrativo em ${category.name}`} />
            </div>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">Conteúdo em preparação</p>
        )}
      </div>
      <Button asChild variant="outline" className="mt-5 w-full">
        <Link to={paths[category.slug as keyof typeof paths]}>
          {progress > 0 ? "Continuar trilha" : "Conhecer trilha"}
          <ChevronRight aria-hidden="true" />
        </Link>
      </Button>
    </article>
  );
}
export function ExamCard({ exam }: { exam: (typeof exams)[number] }) {
  return (
    <article className="rounded-lg border border-border bg-card p-5 transition hover:-translate-y-1 hover:border-primary/30">
      <div className="flex items-start justify-between gap-4">
        <span className="font-display text-3xl font-semibold text-primary">{exam.name}</span>
        <Trophy aria-hidden="true" className="size-5 shrink-0 text-amber" />
      </div>
      <p className="mt-4 min-h-10 text-sm text-muted-foreground">{exam.description}</p>
      <p className="mt-5 font-mono text-xs text-muted-foreground">
        Estrutura demonstrativa · conteúdo em preparação
      </p>
      <Button asChild variant="outline" className="mt-4 w-full">
        <Link to="/concursos/$slug" params={{ slug: exam.slug }}>
          Ver preparação <ChevronRight aria-hidden="true" />
        </Link>
      </Button>
    </article>
  );
}
export function TestimonialCard({
  initials,
  name,
  detail,
  children,
}: {
  initials: string;
  name: string;
  detail: string;
  children: ReactNode;
}) {
  return (
    <figure className="rounded-lg border border-border bg-card p-6">
      <Rating />
      <blockquote className="mt-4 text-sm leading-relaxed">“{children}”</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-full bg-primary/10 font-mono text-xs text-primary">
          {initials}
        </span>
        <div>
          <p className="text-sm font-medium">{name}</p>
          <p className="font-mono text-xs text-muted-foreground">{detail}</p>
        </div>
      </figcaption>
    </figure>
  );
}
