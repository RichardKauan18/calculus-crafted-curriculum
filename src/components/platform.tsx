import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  MessageSquare,
  Pencil,
  Play,
  Send,
  Star,
  Target,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SiteLayout, PageHeader, ProgressBar } from "@/components/site";
import { useAuth } from "@/hooks/useAuth";
import {
  addComment,
  replyToComment,
  saveProgress,
  saveRating,
  useComments,
  useLesson,
  useLessons,
  useMyProgress,
  useRatings,
  useStudyGoal,
  useProgressSummary,
  type PlatformLesson,
} from "@/hooks/usePlatformData";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";
import { exams as demoExams, lessons as demoLessons } from "@/lib/mock-data";
import parabola from "@/assets/parabola.jpg";
import geometry from "@/assets/geometry.jpg";
import trigonometry from "@/assets/trigonometry.jpg";

const imageFor = (lesson: PlatformLesson) =>
  lesson.level === "pre-vestibular"
    ? trigonometry
    : lesson.level === "superior" || lesson.level === "concursos"
      ? geometry
      : parabola;
const levelName = (level: string) =>
  ({
    fundamental: "Fundamental",
    medio: "Ensino Médio",
    "pre-vestibular": "Pré-vestibular",
    superior: "Superior",
    concursos: "Concursos",
  })[level] ?? level;
const isValidYouTubeId = (id: string | undefined) => Boolean(id && /^[a-zA-Z0-9_-]{11}$/.test(id));

const demoPlatformLessons: PlatformLesson[] = demoLessons.map((lesson) => ({
  id: lesson.id,
  title: lesson.title,
  subject: lesson.subject,
  duration: lesson.duration,
  video_id: "",
  level:
    lesson.categorySlug === "ensino-medio"
      ? "medio"
      : lesson.categorySlug === "concursos"
        ? "concursos"
        : lesson.categorySlug,
  concurso_id: null,
  description: `${lesson.topic}. Conteúdo ilustrativo para demonstrar a experiência da plataforma.`,
  created_at: "",
  updated_at: "",
}));

function getDemoLessons(level?: string, search = "") {
  const term = search.trim().toLocaleLowerCase("pt-BR");
  return demoPlatformLessons.filter((lesson) => {
    const matchesLevel = !level || lesson.level === level;
    const matchesSearch =
      !term ||
      [lesson.title, lesson.subject, lesson.description]
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(term);
    return matchesLevel && matchesSearch;
  });
}

function LiveLessonCard({ lesson, demo = false }: { lesson: PlatformLesson; demo?: boolean }) {
  const { user } = useAuth();
  const { progress } = useMyProgress(lesson.id, user?.id);
  const value =
    progress?.status === "completed"
      ? 100
      : progress?.status === "half"
        ? 50
        : progress?.status === "watching"
          ? 10
          : 0;
  return (
    <article className="group overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-foreground/5">
      <Link
        to="/aulas/$id"
        params={{ id: lesson.id }}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <div className="relative aspect-video overflow-hidden">
          <img
            src={imageFor(lesson)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute left-3 top-3 rounded-full border border-border/70 bg-background/95 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider shadow-sm backdrop-blur">
            {demo
              ? "Demonstração"
              : value === 100
                ? "Concluída"
                : value
                  ? "Em andamento"
                  : "Não iniciada"}
          </span>
          <span className="absolute bottom-3 right-3 grid size-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-105">
            <Play className="size-4" fill="currentColor" />
          </span>
        </div>
        <div className="p-4">
          <p className="font-mono text-xs text-muted-foreground">
            {lesson.subject} · {levelName(lesson.level)}
          </p>
          <h3 className="mt-2 font-display text-lg font-semibold leading-snug tracking-tight">{lesson.title}</h3>
          {demo ? (
            <p className="mt-4 text-xs text-muted-foreground">
              Prévia ilustrativa · progresso não é salvo
            </p>
          ) : (
            <>
              <div className="mt-4">
                <ProgressBar value={value} />
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>{value}% concluído</span>
                <span>{lesson.duration}</span>
              </div>
            </>
          )}
        </div>
      </Link>
    </article>
  );
}

export function LiveHomePage() {
  const { lessons, loading, error, refetch } = useLessons();
  const { profile } = useAuth();
  const displayedLessons = lessons.length ? lessons : !hasSupabaseConfig ? getDemoLessons() : [];
  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="relative isolate grid overflow-hidden rounded-3xl bg-primary text-primary-foreground shadow-xl shadow-foreground/5 lg:grid-cols-[1.05fr_.95fr]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full border border-primary-foreground/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 left-[42%] size-96 rounded-full border border-primary-foreground/10"
          />
          <div className="relative z-10 px-6 py-12 sm:px-10 sm:py-16 lg:px-12 lg:py-20">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[.16em]">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-secondary" />
              Matemática, do Fundamental ao IME
            </span>
            <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-[1.06] sm:text-5xl lg:text-6xl">
              Aprenda Matemática de forma{" "}
              <em className="text-[#e7d8ba] dark:text-[#41483a]">simples</em>, clara e objetiva.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
              {hasSupabaseConfig
                ? "Aulas gravadas, progresso real, avaliações e dúvidas respondidas pelo professor."
                : "Explore uma prévia da plataforma, com aulas ilustrativas identificadas como demonstração."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                <Link to="/aulas">Explorar aulas</Link>
              </Button>
              {profile ? (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-full border-primary-foreground/35 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Link to="/perfil">Meu progresso</Link>
                </Button>
              ) : (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-full border-primary-foreground/35 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Link to="/cadastro">Criar conta</Link>
                </Button>
              )}
            </div>
          </div>
          <div className="relative min-h-[300px] overflow-hidden border-t border-primary-foreground/15 bg-primary-foreground/[0.04] sm:min-h-[360px] lg:border-l lg:border-t-0">
            <div className="math-glow absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/35 blur-3xl sm:size-80" />
            <svg
              aria-hidden="true"
              focusable="false"
              viewBox="0 0 400 400"
              className="absolute inset-0 m-auto size-[250px] text-primary-foreground/35 sm:size-[310px]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            >
              <circle cx="200" cy="200" r="150" strokeDasharray="3 8" />
              <path d="M200 50 L330 275 L70 275 Z" />
              <line x1="200" y1="50" x2="200" y2="350" />
              <line x1="70" y1="275" x2="330" y2="275" />
              <circle cx="200" cy="200" r="78" />
            </svg>
            <span className="absolute left-4 top-5 rounded-xl border border-primary-foreground/20 bg-background/80 px-3 py-2.5 font-mono text-xs text-foreground shadow-lg backdrop-blur sm:left-7 sm:top-8 sm:px-4 sm:py-3 sm:text-sm">
              a² + b² = c²
            </span>
            <span className="absolute bottom-6 right-4 rounded-xl border border-primary-foreground/20 bg-background/80 px-3 py-2.5 font-mono text-xs text-foreground shadow-lg backdrop-blur sm:bottom-8 sm:right-7 sm:px-4 sm:py-3 sm:text-sm">
              ∫ eˣ dx = eˣ + C
            </span>
            <span className="absolute bottom-6 left-5 font-mono text-[10px] uppercase tracking-[.18em] text-primary-foreground/60 sm:bottom-8 sm:left-8">
              Estudo com método
            </span>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-3xl font-semibold">Aulas recentes</h2>
          <Link to="/aulas" className="text-sm text-primary">
            Ver todas →
          </Link>
        </div>
        {loading ? (
          <p role="status" className="text-muted-foreground">
            Carregando aulas…
          </p>
        ) : error ? (
          <div role="alert" className="rounded-lg border border-destructive/30 bg-card p-6">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-3" onClick={() => void refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : displayedLessons.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayedLessons.slice(0, 6).map((l) => (
              <LiveLessonCard key={l.id} lesson={l} demo={!hasSupabaseConfig} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
            {hasSupabaseConfig
              ? "Nenhuma aula publicada ainda."
              : "O catálogo ficará disponível quando a conexão de dados estiver configurada."}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

export function LiveLessonsPage() {
  const [search, setSearch] = useState("");
  const { lessons, loading, error, refetch } = useLessons(undefined, search);
  const displayedLessons = lessons.length
    ? lessons
    : !hasSupabaseConfig
      ? getDemoLessons(undefined, search)
      : [];
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Biblioteca"
        title="Todas as aulas"
        description="Explore as aulas disponíveis por título, assunto ou descrição."
      />
      <section className="mx-auto max-w-7xl px-5 sm:px-6">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por aula, assunto ou matéria…"
          className="h-12"
        />
        {loading ? (
          <p role="status" className="mt-8 text-muted-foreground">
            Carregando…
          </p>
        ) : error ? (
          <div role="alert" className="mt-8 rounded-lg border border-destructive/30 bg-card p-5">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-3" onClick={() => void refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : displayedLessons.length ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayedLessons.map((l) => (
              <LiveLessonCard key={l.id} lesson={l} demo={!hasSupabaseConfig} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-muted-foreground">
            {hasSupabaseConfig
              ? "Nenhuma aula encontrada para esta busca."
              : "Configure a conexão com o Supabase para disponibilizar o catálogo de aulas."}
          </p>
        )}
      </section>
    </SiteLayout>
  );
}

export function LiveSearchPage() {
  const [search, setSearch] = useState("");
  const { lessons, loading, error, refetch } = useLessons(undefined, search);
  const displayedLessons = lessons.length
    ? lessons
    : !hasSupabaseConfig
      ? getDemoLessons(undefined, search)
      : [];
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Pesquisa global"
        title="O que você quer aprender?"
        description="Pesquise aulas publicadas por título, matéria ou descrição."
      />
      <section className="mx-auto max-w-7xl px-5 sm:px-6">
        <label htmlFor="platform-search" className="sr-only">
          Pesquisar aulas
        </label>
        <Input
          id="platform-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ex.: equações, trigonometria, álgebra…"
          className="h-12"
          autoComplete="off"
        />
        {loading ? (
          <p role="status" className="mt-8 text-muted-foreground">
            Buscando aulas…
          </p>
        ) : error ? (
          <div role="alert" className="mt-8 rounded-lg border border-destructive/30 bg-card p-5">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-3" onClick={() => void refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : (
          <>
            <p aria-live="polite" className="my-6 font-mono text-xs text-muted-foreground">
              {displayedLessons.length}{" "}
              {displayedLessons.length === 1 ? "resultado encontrado" : "resultados encontrados"}
            </p>
            {displayedLessons.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {displayedLessons.map((l) => (
                  <LiveLessonCard key={l.id} lesson={l} demo={!hasSupabaseConfig} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-muted-foreground">
                {!hasSupabaseConfig
                  ? search.trim()
                    ? "Nenhuma aula demonstrativa corresponde à busca."
                    : "Configure o catálogo real para disponibilizar mais aulas."
                  : search.trim()
                    ? "Nenhuma aula encontrada. Tente outro termo."
                    : "Nenhuma aula publicada está disponível para pesquisa no momento."}
              </div>
            )}
          </>
        )}
      </section>
    </SiteLayout>
  );
}

export function LiveLessonPage() {
  const { id } = useParams({ strict: false }) as { id?: string };
  const {
    lesson: loadedLesson,
    loading,
    error: lessonError,
    refetch: refetchLesson,
  } = useLesson(id);
  const lesson =
    loadedLesson ??
    (!hasSupabaseConfig ? (demoPlatformLessons.find((item) => item.id === id) ?? null) : null);
  const isDemoLesson = !hasSupabaseConfig && Boolean(lesson);
  const { user, profile } = useAuth();
  const {
    avg,
    count,
    loading: ratingsLoading,
    error: ratingsError,
    refetch: refetchRatings,
  } = useRatings(id);
  const {
    comments,
    loading: commentsLoading,
    error: commentsError,
    refetch: refetchComments,
  } = useComments(id);
  const { progress, error: progressError, refetch: refetchProgress } = useMyProgress(id, user?.id);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [myRating, setMyRating] = useState(0);
  useEffect(() => {
    if (!id || !user || !hasSupabaseConfig) return;
    supabase
      .from("ratings")
      .select("rating")
      .eq("lesson_id", id)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setMyRating((data as { rating: number } | null)?.rating ?? 0));
  }, [id, user]);
  if (loading)
    return (
      <SiteLayout>
        <div role="status" className="mx-auto max-w-7xl px-5 py-20 text-muted-foreground">
          Carregando aula…
        </div>
      </SiteLayout>
    );
  if (lessonError)
    return (
      <SiteLayout>
        <PageHeader title="Não foi possível carregar esta aula" />
        <section className="mx-auto max-w-7xl px-5">
          <p role="alert" className="text-sm text-muted-foreground">
            {lessonError}
          </p>
          <Button className="mt-4" onClick={() => void refetchLesson()}>
            Tentar novamente
          </Button>
        </section>
      </SiteLayout>
    );
  if (!lesson)
    return (
      <SiteLayout>
        <PageHeader title="Aula não encontrada" />
        <section className="mx-auto max-w-7xl px-5">
          <Button asChild>
            <Link to="/aulas">Voltar às aulas</Link>
          </Button>
        </section>
      </SiteLayout>
    );
  const status = progress?.status;
  const progressValue =
    status === "completed" ? 100 : status === "half" ? 50 : status === "watching" ? 10 : 0;
  const videoIsValid = isValidYouTubeId(lesson.video_id);
  const setStatus = async (next: "watching" | "half" | "completed") => {
    if (isDemoLesson) {
      setMessage(
        "Esta é uma aula demonstrativa. O progresso será salvo quando o catálogo real estiver conectado.",
      );
      return;
    }
    if (!user) {
      setMessage("Entre na sua conta para salvar seu progresso.");
      return;
    }
    setBusy(true);
    const { error } = await saveProgress(lesson.id, next);
    setBusy(false);
    setMessage(error ? "Não foi possível salvar o progresso." : "Progresso salvo.");
    if (!error) await refetchProgress();
  };
  const rate = async (value: number) => {
    if (isDemoLesson) {
      setMessage("As avaliações não ficam disponíveis na prévia demonstrativa.");
      return;
    }
    if (!user) {
      setMessage("Entre na sua conta para avaliar.");
      return;
    }
    setBusy(true);
    const { error } = await saveRating(lesson.id, value);
    setBusy(false);
    setMessage(error ? "Não foi possível salvar a avaliação." : "Avaliação salva.");
    if (!error) {
      setMyRating(value);
      await refetchRatings();
    }
  };
  const sendComment = async () => {
    if (isDemoLesson) {
      setMessage("Os comentários não ficam disponíveis na prévia demonstrativa.");
      return;
    }
    if (!user || !profile) {
      setMessage("Entre na sua conta para comentar.");
      return;
    }
    if (!comment.trim()) return;
    setBusy(true);
    const { error } = await addComment(lesson.id, profile.name, comment.trim());
    setBusy(false);
    if (error) setMessage("Não foi possível enviar.");
    else {
      setComment("");
      setMessage("Comentário enviado.");
      await refetchComments();
    }
  };
  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-5 pb-6 pt-8 sm:px-6">
        <Link to="/aulas" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowLeft className="size-4" />
          Biblioteca
        </Link>
        <h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold sm:text-5xl">
          {lesson.title}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {lesson.subject} · {levelName(lesson.level)} · {lesson.duration}
        </p>
      </section>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {isDemoLesson && (
          <div className="rounded-lg border border-amber/30 bg-amber/5 p-4 text-sm text-muted-foreground lg:col-span-2">
            <strong className="text-foreground">Aula demonstrativa.</strong> O vídeo, o progresso,
            as avaliações e os comentários não são dados reais nem serão salvos nesta prévia.
          </div>
        )}
        <div>
          <div className="aspect-video overflow-hidden rounded-lg bg-black">
            {videoIsValid ? (
              <iframe
                className="h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${lesson.video_id}`}
                title={`Vídeo da aula: ${lesson.title}`}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-white">
                <Play aria-hidden="true" className="size-8 opacity-70" />
                <p className="font-medium">Vídeo indisponível</p>
                <p className="max-w-sm text-sm text-white/70">
                  O professor ainda não configurou um identificador válido para esta aula.
                </p>
              </div>
            )}
          </div>
          {!isDemoLesson && (
            <div className="mt-4 rounded-lg border border-border bg-card p-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={busy}
                  aria-pressed={status === "completed"}
                  onClick={() => setStatus("completed")}
                >
                  <CheckCircle2 aria-hidden="true" />
                  Concluída
                </Button>
                <Button
                  disabled={busy}
                  aria-pressed={status === "half"}
                  variant="outline"
                  onClick={() => setStatus("half")}
                >
                  <Clock3 aria-hidden="true" />
                  Parei na metade
                </Button>
                <Button
                  disabled={busy}
                  aria-pressed={status === "watching"}
                  variant="outline"
                  onClick={() => setStatus("watching")}
                >
                  <Play aria-hidden="true" />
                  Assistindo
                </Button>
              </div>
              <div className="mt-4">
                <ProgressBar value={progressValue} label="Progresso da aula" />
                <p className="mt-2 text-xs text-muted-foreground">{progressValue}% concluído</p>
              </div>
            </div>
          )}
          {message && (
            <p role="status" className="mt-3 text-sm text-muted-foreground">
              {message}
            </p>
          )}
          {progressError && (
            <div role="alert" className="mt-3 rounded-md border border-destructive/30 bg-card p-3">
              <p className="text-sm text-muted-foreground">{progressError}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => void refetchProgress()}
              >
                Tentar novamente
              </Button>
            </div>
          )}
          <h2 className="mt-10 font-display text-2xl">Sobre esta aula</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            {lesson.description || "Esta aula ainda não possui descrição."}
          </p>
          <section className="mt-10">
            <h2 className="font-display text-2xl">Comentários e dúvidas</h2>
            {user ? (
              <div className="mt-4 rounded-lg border border-border bg-card p-4">
                <label htmlFor="lesson-comment" className="mb-2 block text-sm font-medium">
                  Sua dúvida
                </label>
                <Textarea
                  id="lesson-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Professor, poderia explicar novamente esta parte?"
                />
                <Button
                  className="mt-3"
                  disabled={busy || isDemoLesson || !comment.trim()}
                  onClick={sendComment}
                >
                  <Send aria-hidden="true" />
                  Enviar comentário
                </Button>
              </div>
            ) : (
              <p className="mt-4 rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
                Para participar da conversa,{" "}
                <Link to="/login" className="font-medium text-primary underline underline-offset-4">
                  entre na sua conta
                </Link>
                .
              </p>
            )}
            {commentsLoading ? (
              <p role="status" className="mt-4 text-sm text-muted-foreground">
                Carregando comentários…
              </p>
            ) : commentsError ? (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-destructive/30 bg-card p-4"
              >
                <p className="text-sm text-muted-foreground">{commentsError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => void refetchComments()}
                >
                  Tentar novamente
                </Button>
              </div>
            ) : comments.length ? (
              comments.map((c) => (
                <article key={c.id} className="mt-4 rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <MessageSquare className="size-4 text-primary" />
                    {c.user_name}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{c.text}</p>
                  {c.reply && (
                    <div className="ml-5 mt-3 border-l-2 border-primary/40 pl-4">
                      <p className="text-xs font-medium text-primary">Resposta do professor</p>
                      <p className="mt-1 text-sm text-muted-foreground">{c.reply}</p>
                    </div>
                  )}
                </article>
              ))
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Ainda não há comentários nesta aula. Seja o primeiro a enviar uma dúvida.
              </p>
            )}
          </section>
        </div>
        <aside className="space-y-5">
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="font-mono text-xs uppercase text-muted-foreground">Avaliação</p>
            <div className="mt-3 flex items-end gap-3">
              <strong className="font-display text-5xl">
                {avg ? avg.toFixed(1).replace(".", ",") : "—"}
              </strong>
              <div>
                <div className="flex" role="group" aria-label="Sua avaliação">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      disabled={busy || isDemoLesson}
                      onClick={() => rate(n)}
                      aria-label={`Avaliar com ${n} ${n === 1 ? "estrela" : "estrelas"}`}
                      aria-pressed={n === myRating}
                      className="rounded-sm p-1 text-amber disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Star
                        aria-hidden="true"
                        className="size-5"
                        fill={n <= myRating ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                </div>
                {ratingsError ? (
                  <div role="alert" className="mt-2">
                    <p className="text-xs text-muted-foreground">{ratingsError}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 px-0"
                      onClick={() => void refetchRatings()}
                    >
                      Tentar novamente
                    </Button>
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {ratingsLoading ? "Carregando avaliações…" : `${count} avaliação(ões)`}
                  </p>
                )}
              </div>
            </div>
          </div>
        </aside>
      </section>
    </SiteLayout>
  );
}

export function LiveAuthPage({ signup = false }: { signup?: boolean }) {
  const { signIn, signUp, session } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (session) void navigate({ to: "/perfil" });
  }, [session, navigate]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const err = signup
        ? await signUp(email.trim(), password, name.trim())
        : await signIn(email.trim(), password);
      if (err) {
        setError(err);
        return;
      }
      if (signup && !session) {
        setSuccess(
          "Cadastro recebido. Se a confirmação por e-mail estiver ativada, confira sua caixa de entrada para ativar a conta antes de entrar.",
        );
        return;
      }
      await navigate({ to: "/perfil" });
    } catch {
      setError("Não foi possível concluir a solicitação. Verifique sua conexão e tente novamente.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <SiteLayout>
      <section className="mx-auto grid min-h-[70vh] max-w-5xl items-center gap-10 px-5 py-14 lg:grid-cols-2">
        <div className="hidden lg:block">
          <p className="font-mono text-xs uppercase tracking-[.16em] text-primary">Matris .mat</p>
          <h1 className="mt-4 font-display text-5xl font-semibold">
            Sua evolução começa com uma aula.
          </h1>
          <p className="mt-4 text-muted-foreground">
            Conta real com progresso, avaliações, comentários e metas sincronizados.
          </p>
        </div>
        <form onSubmit={submit} className="rounded-lg border border-border bg-card p-6 sm:p-8">
          <h2 className="font-display text-3xl">{signup ? "Criar conta" : "Entrar"}</h2>
          <div className="mt-6 space-y-4">
            {signup && (
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Nome</span>
                <Input
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>
            )}
            <label className="block">
              <span className="mb-2 block text-sm font-medium">E-mail</span>
              <Input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Senha</span>
              <Input
                type="password"
                autoComplete={signup ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </label>
          </div>
          {error && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {error}
            </p>
          )}
          {success && (
            <p
              role="status"
              className="mt-4 rounded-md border border-primary/20 bg-primary/5 p-3 text-sm text-foreground"
            >
              {success}
            </p>
          )}
          <Button disabled={busy} className="mt-6 h-11 w-full rounded-full">
            {busy ? "Aguarde…" : signup ? "Criar conta" : "Entrar"}
          </Button>
          <div className="mt-5 text-right text-sm">
            <Link to={signup ? "/login" : "/cadastro"} className="text-primary">
              {signup ? "Já tenho conta" : "Criar conta"}
            </Link>
          </div>
        </form>
      </section>
    </SiteLayout>
  );
}

export function LiveProfilePage() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const {
    lessons,
    loading: lessonsLoading,
    error: lessonsError,
    refetch: refetchLessons,
  } = useLessons();
  const {
    items: progressItems,
    loading: progressLoading,
    error: progressError,
    refetch: refetchProgress,
    completedCount,
    inProgressCount,
  } = useProgressSummary(user?.id);
  const { goal, update } = useStudyGoal(user?.id);
  const [goalValue, setGoalValue] = useState(3);
  const [goalStatus, setGoalStatus] = useState("");
  useEffect(() => {
    if (goal) setGoalValue(goal.lessons_per_week);
  }, [goal?.lessons_per_week]);
  const saveGoal = async () => {
    const safe = Math.max(1, Math.min(50, Math.floor(Number.isFinite(goalValue) ? goalValue : 1)));
    setGoalStatus("Salvando…");
    try {
      const result = await update(safe);
      setGoalStatus(result.error ? "Não foi possível salvar a meta." : "Meta semanal salva.");
    } catch {
      setGoalStatus("Não foi possível salvar a meta.");
    }
  };
  if (authLoading)
    return (
      <SiteLayout>
        <div role="status" className="mx-auto max-w-7xl px-5 py-20 text-muted-foreground">
          Carregando perfil…
        </div>
      </SiteLayout>
    );
  if (!user || !profile)
    return (
      <SiteLayout>
        <PageHeader eyebrow="Área do aluno" title="Entre para acompanhar seu progresso" />
        <section className="mx-auto max-w-7xl px-5">
          <p className="mb-4 text-muted-foreground">
            Entre na sua conta para consultar aulas concluídas, metas e progresso salvo.
          </p>
          <Button asChild>
            <Link to="/login">Entrar</Link>
          </Button>
        </section>
      </SiteLayout>
    );
  const inProgressLessons = lessons.filter((lesson) =>
    progressItems.some(
      (item) =>
        item.lesson_id === lesson.id && (item.status === "watching" || item.status === "half"),
    ),
  );
  const suggestedLessons = lessons
    .filter((lesson) => !progressItems.some((item) => item.lesson_id === lesson.id))
    .slice(0, 4);
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Área do aluno"
        title={`Olá, ${profile.name || "estudante"}`}
        description="Acompanhe seu progresso e mantenha uma meta de estudos consistente."
      />
      <section className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric icon={<CheckCircle2 />} value={String(completedCount)} label="Aulas concluídas" />
          <Metric icon={<Clock3 />} value={String(inProgressCount)} label="Em andamento" />
          <Metric
            icon={<Target />}
            value={String(goal?.lessons_per_week ?? 3)}
            label="Meta semanal"
          />
          <Metric
            icon={<Users />}
            value={profile.role === "teacher" ? "Professor" : "Aluno"}
            label="Tipo de conta"
          />
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <h2 className="mb-4 font-display text-2xl">
              {inProgressLessons.length ? "Continue de onde parou" : "Sugestões para estudar"}
            </h2>
            {progressError ? (
              <div role="alert" className="rounded-lg border border-destructive/30 bg-card p-5">
                <p className="text-sm text-muted-foreground">{progressError}</p>
                <Button variant="outline" className="mt-3" onClick={() => void refetchProgress()}>
                  Tentar novamente
                </Button>
              </div>
            ) : lessonsError ? (
              <div role="alert" className="rounded-lg border border-destructive/30 bg-card p-5">
                <p className="text-sm text-muted-foreground">{lessonsError}</p>
                <Button variant="outline" className="mt-3" onClick={() => void refetchLessons()}>
                  Tentar novamente
                </Button>
              </div>
            ) : lessonsLoading || progressLoading ? (
              <p role="status" className="py-8 text-muted-foreground">
                Carregando seu progresso…
              </p>
            ) : (inProgressLessons.length ? inProgressLessons : suggestedLessons).length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {(inProgressLessons.length ? inProgressLessons : suggestedLessons).map((l) => (
                  <LiveLessonCard key={l.id} lesson={l} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
                Ainda não há aulas publicadas para exibir. Volte mais tarde para continuar seus
                estudos.
              </div>
            )}
          </div>
          <aside className="rounded-lg border border-border bg-card p-6">
            <Target className="size-7 text-primary" />
            <h2 className="mt-4 font-display text-2xl">Meta semanal</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Quantas aulas você quer concluir por semana?
            </p>
            <label htmlFor="weekly-goal" className="mt-4 block text-sm font-medium">
              Aulas por semana
            </label>
            <Input
              id="weekly-goal"
              type="number"
              min={1}
              max={50}
              value={goalValue}
              onChange={(e) => setGoalValue(Number(e.target.value))}
              className="mt-2"
            />
            <Button
              className="mt-3 w-full"
              onClick={() => void saveGoal()}
              disabled={goalValue < 1 || goalValue > 50}
            >
              Salvar meta
            </Button>
            {goalStatus && (
              <p role="status" className="mt-2 text-sm text-muted-foreground">
                {goalStatus}
              </p>
            )}
            <Button variant="outline" className="mt-3 w-full" onClick={() => void signOut()}>
              Sair
            </Button>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
function Metric({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <span className="text-primary">{icon}</span>
      <strong className="mt-5 block font-display text-3xl">{value}</strong>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function LiveTeacherDashboard() {
  const { isTeacher, loading: authLoading } = useAuth();
  const { lessons, loading, error, refetch } = useLessons();

  if (authLoading)
    return (
      <SiteLayout>
        <div role="status" className="mx-auto max-w-7xl px-5 py-20 text-muted-foreground">
          Verificando acesso…
        </div>
      </SiteLayout>
    );

  if (!isTeacher)
    return (
      <SiteLayout>
        <PageHeader title="Painel do professor" />
        <section className="mx-auto max-w-7xl px-5">
          <p className="text-muted-foreground">
            Acesso restrito a professores. Entre com uma conta autorizada para continuar.
          </p>
          <Button asChild className="mt-4">
            <Link to="/login">Entrar</Link>
          </Button>
        </section>
      </SiteLayout>
    );

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Área do professor"
        title="Painel do professor"
        description={
          hasSupabaseConfig
            ? "Acompanhe o conteúdo cadastrado e acesse rapidamente as ferramentas de ensino."
            : "Prévia da área do professor. Conecte o catálogo real para exibir métricas e gerenciar aulas."
        }
      />
      <section className="mx-auto max-w-7xl px-5 sm:px-6">
        {!hasSupabaseConfig ? (
          <div className="rounded-lg border border-amber/30 bg-amber/5 p-5">
            <h2 className="font-medium">Catálogo não conectado</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              As métricas e ações de gerenciamento só ficam disponíveis quando o Supabase estiver
              configurado. Nenhum dado de exemplo é apresentado como atividade real.
            </p>
          </div>
        ) : loading ? (
          <p role="status" className="py-8 text-muted-foreground">
            Carregando resumo…
          </p>
        ) : error ? (
          <div role="alert" className="rounded-lg border border-destructive/30 bg-card p-5">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-3" onClick={() => void refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metric
                icon={<BookOpen aria-hidden="true" />}
                value={String(lessons.length)}
                label="Aulas cadastradas"
              />
              <Metric
                icon={<Target aria-hidden="true" />}
                value={String(lessons.filter((lesson) => lesson.level === "medio").length)}
                label="Ensino Médio"
              />
              <Metric
                icon={<Target aria-hidden="true" />}
                value={String(lessons.filter((lesson) => lesson.level === "pre-vestibular").length)}
                label="Pré-vestibular"
              />
              <Metric
                icon={<Target aria-hidden="true" />}
                value={String(lessons.filter((lesson) => lesson.level === "concursos").length)}
                label="Concursos"
              />
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <Link
                to="/professor/aulas"
                className="group rounded-lg border border-border bg-card p-5 transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="text-sm font-medium text-primary">Gerenciamento</span>
                <h2 className="mt-2 font-display text-2xl">Gerenciar aulas</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Cadastre novas aulas, edite os dados e remova conteúdo publicado.
                </p>
                <span className="mt-4 inline-block text-sm font-medium">Abrir gerenciamento →</span>
              </Link>
              <Link
                to="/aulas"
                className="rounded-lg border border-border bg-card p-5 transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="text-sm font-medium text-primary">Experiência do aluno</span>
                <h2 className="mt-2 font-display text-2xl">Ver biblioteca pública</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Confira como as aulas publicadas aparecem para os estudantes.
                </p>
                <span className="mt-4 inline-block text-sm font-medium">Abrir biblioteca →</span>
              </Link>
            </div>
            {!lessons.length && (
              <div className="mt-6 rounded-lg border border-dashed border-border p-6 text-center">
                <p className="text-muted-foreground">
                  Ainda não há aulas cadastradas no catálogo real.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/professor/aulas">Cadastrar a primeira aula</Link>
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </SiteLayout>
  );
}

export function LiveTeacherPage() {
  const { isTeacher, loading: authLoading } = useAuth();
  const { lessons, loading: lessonsLoading, error: lessonsError, refetch } = useLessons();
  const [editing, setEditing] = useState<PlatformLesson | null>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState("");
  const [video, setVideo] = useState("");
  const [level, setLevel] = useState("medio");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const open = (lesson?: PlatformLesson) => {
    setEditing(lesson ?? null);
    setTitle(lesson?.title ?? "");
    setSubject(lesson?.subject ?? "");
    setDuration(lesson?.duration ?? "");
    setVideo(lesson?.video_id ?? "");
    setLevel(lesson?.level ?? "medio");
    setDescription(lesson?.description ?? "");
    setStatus("");
  };
  const reset = () => {
    setEditing(null);
    setTitle("");
    setSubject("");
    setDuration("");
    setVideo("");
    setLevel("medio");
    setDescription("");
  };
  if (authLoading)
    return (
      <SiteLayout>
        <div role="status" className="mx-auto max-w-7xl px-5 py-20 text-muted-foreground">
          Verificando acesso…
        </div>
      </SiteLayout>
    );
  if (!isTeacher)
    return (
      <SiteLayout>
        <PageHeader title="Área do professor" />
        <section className="mx-auto max-w-7xl px-5">
          <p className="text-muted-foreground">
            Acesso restrito a professores. Entre com uma conta autorizada para gerenciar aulas.
          </p>
          <Button asChild className="mt-4">
            <Link to="/login">Entrar</Link>
          </Button>
        </section>
      </SiteLayout>
    );
  const save = async () => {
    if (!title.trim() || !subject.trim() || !duration.trim()) {
      setStatus("Preencha título, matéria e duração.");
      return;
    }
    if (!isValidYouTubeId(video.trim())) {
      setStatus("Informe um ID válido de vídeo do YouTube (11 caracteres).");
      return;
    }
    setBusy(true);
    setStatus("Salvando…");
    try {
      const payload = {
        title: title.trim(),
        subject: subject.trim(),
        duration: duration.trim(),
        video_id: video.trim(),
        level,
        description: description.trim(),
        updated_at: new Date().toISOString(),
      };
      const result = editing
        ? await supabase.from("lessons").update(payload).eq("id", editing.id)
        : await supabase.from("lessons").insert(payload);
      if (result.error) {
        setStatus("Não foi possível salvar a aula. Confira os dados e suas permissões.");
        return;
      }
      reset();
      setStatus("Aula salva com sucesso.");
      await refetch();
    } catch {
      setStatus("Ocorreu um erro ao salvar. Tente novamente.");
    } finally {
      setBusy(false);
    }
  };
  const remove = async (id: string) => {
    if (!confirm("Excluir esta aula? Esta ação não pode ser desfeita.")) return;
    setBusy(true);
    setStatus("");
    try {
      const result = await supabase.from("lessons").delete().eq("id", id);
      if (result.error) {
        setStatus("Não foi possível excluir a aula. Confira suas permissões.");
        return;
      }
      setStatus("Aula excluída.");
      await refetch();
      if (editing?.id === id) reset();
    } catch {
      setStatus("Ocorreu um erro ao excluir. Tente novamente.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Área do professor"
        title="Gerenciar aulas"
        description="Cadastre, edite e remova aulas publicadas."
      />
      <section className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-3">
            {lessonsLoading ? (
              <p role="status" className="py-8 text-muted-foreground">
                Carregando aulas…
              </p>
            ) : lessonsError ? (
              <div role="alert" className="rounded-lg border border-destructive/30 bg-card p-5">
                <p className="text-sm text-muted-foreground">{lessonsError}</p>
                <Button variant="outline" className="mt-3" onClick={() => void refetch()}>
                  Tentar novamente
                </Button>
              </div>
            ) : lessons.length ? (
              lessons.map((l) => (
                <article
                  key={l.id}
                  className="grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <h2 className="font-medium">{l.title}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {l.subject} · {levelName(l.level)} · {l.duration}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => open(l)}>
                      <Pencil aria-hidden="true" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      className="text-destructive"
                      onClick={() => void remove(l.id)}
                    >
                      <Trash2 aria-hidden="true" />
                      Excluir
                    </Button>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
                Nenhuma aula cadastrada. Crie a primeira usando o formulário.
              </div>
            )}
            <Button onClick={() => open()} disabled={busy}>
              <BookOpen aria-hidden="true" />
              Nova aula
            </Button>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-display text-2xl">{editing ? "Editar aula" : "Nova aula"}</h2>
            <div className="mt-4 space-y-3">
              <label className="block text-sm font-medium">
                Título
                <Input
                  className="mt-1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex.: Equações do 2º grau"
                  required
                />
              </label>
              <label className="block text-sm font-medium">
                Matéria
                <Input
                  className="mt-1"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex.: Álgebra"
                  required
                />
              </label>
              <label className="block text-sm font-medium">
                Duração
                <Input
                  className="mt-1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Ex.: 24 min"
                  required
                />
              </label>
              <label className="block text-sm font-medium">
                ID do vídeo do YouTube
                <Input
                  className="mt-1"
                  value={video}
                  onChange={(e) => setVideo(e.target.value)}
                  placeholder="11 caracteres do link"
                  required
                />
                <span className="mt-1 block text-xs font-normal text-muted-foreground">
                  Cole apenas o ID, não o link completo.
                </span>
              </label>
              <label className="block text-sm font-medium">
                Nível
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="fundamental">Fundamental</option>
                  <option value="medio">Ensino Médio</option>
                  <option value="pre-vestibular">Pré-vestibular</option>
                  <option value="superior">Superior</option>
                  <option value="concursos">Concursos</option>
                </select>
              </label>
              <label className="block text-sm font-medium">
                Descrição
                <Textarea
                  className="mt-1"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explique brevemente o conteúdo"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                onClick={() => void save()}
                disabled={
                  busy || !title.trim() || !subject.trim() || !duration.trim() || !video.trim()
                }
              >
                {busy ? "Salvando…" : "Salvar aula"}
              </Button>
              {(editing || title || subject || duration || video || description) && (
                <Button variant="outline" onClick={reset} disabled={busy}>
                  Cancelar
                </Button>
              )}
            </div>
            {status && (
              <p role="status" className="mt-3 text-sm text-muted-foreground">
                {status}
              </p>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

export function LiveLevelPage({ level }: { level: string }) {
  const { lessons, loading, error, refetch } = useLessons(level);
  const displayedLessons = lessons.length
    ? lessons
    : !hasSupabaseConfig
      ? getDemoLessons(level)
      : [];
  return (
    <SiteLayout>
      <PageHeader
        eyebrow={levelName(level)}
        title={`Aulas de ${levelName(level)}`}
        description={
          hasSupabaseConfig
            ? "Trilha organizada por nível, usando o catálogo da plataforma."
            : "Prévia ilustrativa da organização das aulas por nível."
        }
      />
      <section className="mx-auto max-w-7xl px-5 sm:px-6">
        {loading ? (
          <p role="status" className="py-8 text-muted-foreground">
            Carregando aulas…
          </p>
        ) : error ? (
          <div role="alert" className="rounded-lg border border-destructive/30 bg-card p-6">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-3" onClick={() => void refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : displayedLessons.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayedLessons.map((l) => (
              <LiveLessonCard key={l.id} lesson={l} demo={!hasSupabaseConfig} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-muted-foreground">
            {hasSupabaseConfig
              ? "Ainda não há aulas publicadas nesta trilha."
              : "Ainda não há aulas demonstrativas para esta trilha."}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

export function LiveConcursosPage() {
  const { concursos, loading, error, refetch } = useConcursos();
  const demoMode = !hasSupabaseConfig && concursos.length === 0;
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Preparação por objetivo"
        title="Concursos Militares"
        description={
          hasSupabaseConfig
            ? "Organização por concurso, disciplina e assunto."
            : "Prévia ilustrativa de como a preparação por concurso pode ser organizada."
        }
      />
      <section className="mx-auto max-w-7xl px-5 sm:px-6">
        {loading ? (
          <p role="status" className="py-8 text-muted-foreground">
            Carregando concursos…
          </p>
        ) : error ? (
          <div role="alert" className="rounded-lg border border-destructive/30 bg-card p-6">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-3" onClick={() => void refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : concursos.length || demoMode ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {demoMode
              ? demoExams.map((exam) => (
                  <Link
                    key={exam.slug}
                    to="/concursos/$slug"
                    params={{ slug: exam.slug }}
                    className="group rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="inline-flex rounded-full border border-amber/30 bg-amber/5 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                      Demonstração
                    </span>
                    <span className="mt-4 block font-display text-3xl font-semibold tracking-tight text-primary">
                      {exam.name}
                    </span>
                    <p className="mt-3 text-sm text-muted-foreground">{exam.description}</p>
                    <p className="mt-5 border-t border-border/70 pt-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      {exam.subjects} disciplinas previstas · conteúdo ilustrativo
                    </p>
                  </Link>
                ))
              : concursos.map((c) => (
                  <Link
                    key={c.id}
                    to="/concursos/$slug"
                    params={{ slug: c.id }}
                    className="group rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="font-display text-3xl font-semibold tracking-tight text-primary">
                      {c.name}
                    </span>
                    <p className="mt-3 text-sm text-muted-foreground">{c.description}</p>
                    <p className="mt-5 border-t border-border/70 pt-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      {c.category} · {c.subjects?.length ?? 0} disciplinas
                    </p>
                  </Link>
                ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-muted-foreground">
            {hasSupabaseConfig
              ? "Os concursos ainda não foram cadastrados."
              : "Configure a conexão com o Supabase para disponibilizar os concursos."}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

export function LiveConcursoPage() {
  const { slug } = useParams({ strict: false }) as { slug?: string };
  const {
    concursos,
    loading: contestsLoading,
    error: contestsError,
    refetch: refetchContests,
  } = useConcursos();
  const concurso = concursos.find((c) => c.id === slug);
  const demoExam = !hasSupabaseConfig ? demoExams.find((exam) => exam.slug === slug) : undefined;
  const {
    lessons,
    loading,
    error: lessonsError,
    refetch: refetchLessons,
  } = useLessons("concursos");
  const filtered = lessons.filter((l) => l.concurso_id === slug);
  if (contestsLoading)
    return (
      <SiteLayout>
        <div role="status" className="mx-auto max-w-7xl px-5 py-20 text-muted-foreground">
          Carregando concurso…
        </div>
      </SiteLayout>
    );
  if (contestsError)
    return (
      <SiteLayout>
        <PageHeader title="Não foi possível carregar o concurso" />
        <section className="mx-auto max-w-7xl px-5">
          <p role="alert" className="text-sm text-muted-foreground">
            {contestsError}
          </p>
          <Button className="mt-4" onClick={() => void refetchContests()}>
            Tentar novamente
          </Button>
        </section>
      </SiteLayout>
    );
  if (demoExam)
    return (
      <SiteLayout>
        <PageHeader
          eyebrow="Prévia demonstrativa"
          title={demoExam.name}
          description={demoExam.description}
        />
        <section className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="rounded-lg border border-amber/30 bg-amber/5 p-5">
            <p className="font-medium">Conteúdo ilustrativo</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Esta prévia indica uma estrutura de preparação com {demoExam.subjects} disciplinas
              previstas. A grade real de disciplinas, as aulas e o progresso só serão exibidos
              quando os dados forem cadastrados no catálogo conectado.
            </p>
          </div>
          <Button asChild variant="outline" className="mt-5">
            <Link to="/concursos">Voltar aos concursos</Link>
          </Button>
        </section>
      </SiteLayout>
    );
  if (!hasSupabaseConfig)
    return (
      <SiteLayout>
        <PageHeader
          title="Conexão de dados não configurada"
          description="A preparação por concurso ficará disponível quando a conexão com o catálogo for configurada."
        />
        <section className="mx-auto max-w-7xl px-5">
          <Button asChild variant="outline">
            <Link to="/concursos">Voltar aos concursos</Link>
          </Button>
        </section>
      </SiteLayout>
    );
  if (!concurso)
    return (
      <SiteLayout>
        <PageHeader title="Concurso não encontrado" />
        <section className="mx-auto max-w-7xl px-5">
          <Button asChild>
            <Link to="/concursos">Voltar aos concursos</Link>
          </Button>
        </section>
      </SiteLayout>
    );
  return (
    <SiteLayout>
      <PageHeader
        eyebrow={concurso.category}
        title={concurso.name}
        description={concurso.description}
      />
      <section className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-display text-2xl">Disciplinas</h2>
          <div className="mt-4 space-y-2">
            {(concurso.subjects ?? []).map((s) => (
              <div key={s} className="rounded-md bg-muted/60 px-3 py-2 text-sm">
                {s}
              </div>
            ))}
          </div>
        </aside>
        <div>
          {loading ? (
            <p role="status" className="text-muted-foreground">
              Carregando aulas…
            </p>
          ) : lessonsError ? (
            <div role="alert" className="rounded-lg border border-destructive/30 bg-card p-5">
              <p className="text-sm text-muted-foreground">{lessonsError}</p>
              <Button variant="outline" className="mt-3" onClick={() => void refetchLessons()}>
                Tentar novamente
              </Button>
            </div>
          ) : filtered.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((l) => (
                <LiveLessonCard key={l.id} lesson={l} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-muted-foreground">
              Ainda não há aulas publicadas para este concurso.
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
