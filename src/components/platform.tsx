import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  useConcursos,
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
        <div className="p-5">
          <p className="font-mono text-[11px] uppercase tracking-[.12em] text-muted-foreground">
            {lesson.subject} · {levelName(lesson.level)}
          </p>
          <h3 className="mt-2 font-display text-lg font-semibold leading-snug tracking-tight">
            {lesson.title}
          </h3>
          {demo ? (
            <p className="mt-5 rounded-lg bg-muted/70 px-3 py-2 text-xs text-muted-foreground">
              Prévia ilustrativa · progresso não é salvo
            </p>
          ) : (
            <>
              <div className="mt-5">
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
  const [studentFeedback, setStudentFeedback] = useState<Array<{ id: string; title: string; message: string; created_at: string }>>([]);
  useEffect(() => {
    let active = true;
    if (!profile || profile.role !== "student" || !hasSupabaseConfig) {
      setStudentFeedback([]);
      return () => { active = false; };
    }
    supabase
      .from("teacher_feedback")
      .select("id,title,message,created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data, error: feedbackError }) => {
        if (active) setStudentFeedback(feedbackError ? [] : (data ?? []) as Array<{ id: string; title: string; message: string; created_at: string }>);
      });
    return () => { active = false; };
  }, [profile?.id, profile?.role]);
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
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayedLessons.slice(0, 6).map((l) => (
              <LiveLessonCard key={l.id} lesson={l} demo={!hasSupabaseConfig} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-muted-foreground">
            {hasSupabaseConfig
              ? "Nenhuma aula publicada ainda."
              : "O catálogo ficará disponível quando a conexão de dados estiver configurada."}
          </div>
        )}
      </section>
      {profile?.role === "student" && studentFeedback.length > 0 && (
        <section aria-labelledby="teacher-feedback-title" className="mx-auto max-w-7xl px-5 pb-12 sm:px-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[.14em] text-primary">Recados do professor</p>
              <h2 id="teacher-feedback-title" className="mt-2 font-display text-2xl font-semibold sm:text-3xl">Avisos e orientações para seus estudos</h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {studentFeedback.map((item) => (
              <article key={item.id} className="rounded-2xl border border-primary/15 bg-card p-5 shadow-sm">
                <span className="inline-flex items-center gap-2 text-xs font-medium text-primary"><MessageSquare className="size-4" aria-hidden="true" /> Mensagem do professor</span>
                <h3 className="mt-3 font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{item.message}</p>
                <p className="mt-4 text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}</p>
              </article>
            ))}
          </div>
        </section>
      )}
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
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="rounded-2xl border border-border/80 bg-card/70 p-4 shadow-sm sm:p-5">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por aula, assunto ou matéria…"
            className="h-12 rounded-xl border-border/80 bg-background"
          />
        </div>
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
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="rounded-2xl border border-border/80 bg-card/70 p-4 shadow-sm sm:p-5">
          <label htmlFor="platform-search" className="sr-only">
            Pesquisar aulas
          </label>
          <Input
            id="platform-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ex.: equações, trigonometria, álgebra…"
            className="h-12 rounded-xl border-border/80 bg-background"
            autoComplete="off"
          />
        </div>
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
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {isDemoLesson && (
          <div className="rounded-2xl border border-amber/30 bg-amber/5 p-5 text-sm text-muted-foreground lg:col-span-2">
            <strong className="text-foreground">Aula demonstrativa.</strong> O vídeo, o progresso,
            as avaliações e os comentários não são dados reais nem serão salvos nesta prévia.
          </div>
        )}
        <div>
          <div className="aspect-video overflow-hidden rounded-2xl bg-black shadow-xl shadow-foreground/10 ring-1 ring-border/50">
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
            <div className="mt-4 rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
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
              <div className="mt-5">
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
              <div className="mt-4 rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
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
                <article
                  key={c.id}
                  className="mt-4 rounded-xl border border-border/80 bg-card p-5 shadow-sm"
                >
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
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
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
  const { signIn, signUp, resetPassword, session } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
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
      if (forgotPassword) {
        const err = await resetPassword(email.trim());
        if (err) {
          setError(err);
          return;
        }
        setSuccess("Se esse e-mail estiver cadastrado, enviaremos um link para redefinir sua senha. Confira também a caixa de spam.");
        return;
      }
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
      <section className="mx-auto grid min-h-[70vh] max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:gap-12">
        <div className="hidden rounded-3xl bg-primary p-10 text-primary-foreground shadow-xl shadow-foreground/5 lg:block">
          <p className="font-mono text-xs uppercase tracking-[.16em] text-primary-foreground/70">
            Matris .mat
          </p>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-tight xl:text-5xl">
            Sua evolução começa com uma aula.
          </h1>
          <p className="mt-5 leading-relaxed text-primary-foreground/80">
            Conta real com progresso, avaliações, comentários e metas sincronizados.
          </p>
        </div>
        <form
          onSubmit={submit}
          className="rounded-3xl border border-border/80 bg-card p-6 shadow-xl shadow-foreground/5 sm:p-8 lg:p-10"
        >
          <h2 className="font-display text-3xl">{forgotPassword ? "Recuperar senha" : signup ? "Criar conta" : "Entrar"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {forgotPassword ? "Informe o e-mail da sua conta para receber um link seguro de redefinição." : signup ? "Crie sua conta para acompanhar seu progresso." : "Entre para acessar seu progresso e suas aulas."}
          </p>
          <div className="mt-7 space-y-5">
            {signup && !forgotPassword && (
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
            {!forgotPassword && (
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
            )}
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
            {busy ? "Aguarde…" : forgotPassword ? "Enviar link de recuperação" : signup ? "Criar conta" : "Entrar"}
          </Button>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
            {!signup && (
              <button type="button" className="text-primary underline-offset-4 hover:underline" onClick={() => { setForgotPassword((value) => !value); setError(""); setSuccess(""); }}>
                {forgotPassword ? "Voltar para entrar" : "Esqueci minha senha"}
              </button>
            )}
            <Link to={signup ? "/login" : "/cadastro"} className="ml-auto text-primary">
              {signup ? "Já tenho conta" : "Criar conta"}
            </Link>
          </div>
        </form>
      </section>
    </SiteLayout>
  );
}


export function LivePasswordResetPage() {
  const { session, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setBusy(true);
    try {
      const result = await updatePassword(password);
      if (result) {
        setError(result);
        return;
      }
      setSuccess("Senha alterada com sucesso. Redirecionando para seu perfil…");
      window.setTimeout(() => { void navigate({ to: "/perfil" }); }, 900);
    } catch {
      setError("Não foi possível alterar a senha. Solicite um novo link de recuperação.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Segurança da conta"
        title="Definir nova senha"
        description="Escolha uma senha nova para voltar a acessar sua conta."
      />
      <section className="mx-auto max-w-xl px-4 pb-16 sm:px-6">
        {session ? (
          <form onSubmit={submit} className="space-y-5 rounded-3xl border border-border/80 bg-card p-6 shadow-sm sm:p-8">
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Nova senha</span>
              <Input type="password" autoComplete="new-password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required />
              <span className="mt-1 block text-xs text-muted-foreground">Use pelo menos 6 caracteres.</span>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Confirmar nova senha</span>
              <Input type="password" autoComplete="new-password" minLength={6} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
            </label>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            {success && <p role="status" className="rounded-xl bg-primary/5 p-3 text-sm">{success}</p>}
            <Button type="submit" className="w-full rounded-full" disabled={busy || password.length < 6 || password !== confirmPassword}>
              {busy ? "Alterando senha…" : "Salvar nova senha"}
            </Button>
          </form>
        ) : (
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8">
            <p className="text-sm leading-relaxed text-muted-foreground">Este link de recuperação é inválido ou expirou. Solicite um novo link para seu e-mail.</p>
            <Button asChild className="mt-5 rounded-full"><Link to="/login">Voltar para entrar</Link></Button>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

export function LiveProfilePage() {
  const { user, profile, loading: authLoading, profileError, signOut } = useAuth();
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
        <PageHeader
          eyebrow="Meu perfil"
          title={user && profileError ? "Não foi possível carregar seu perfil" : "Entre para acessar sua área"}
          description={profileError || "Faça login para acompanhar seus estudos ou gerenciar suas aulas."}
        />
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <div className="max-w-xl rounded-2xl border border-border bg-card p-6 sm:p-8">
            <p className="text-muted-foreground">
              {user ? "Sua sessão está ativa, mas os dados do perfil não estão disponíveis. Tente novamente antes de continuar." : "Entre na sua conta para acompanhar seus estudos ou gerenciar suas aulas."}
            </p>
            {user ? (
              <Button className="mt-5 rounded-full" onClick={() => window.location.reload()}>Tentar novamente</Button>
            ) : (
              <Button asChild className="mt-5 rounded-full"><Link to="/login">Entrar na minha conta</Link></Button>
            )}
          </div>
        </section>
      </SiteLayout>
    );

  const isTeacher = profile.role === "teacher";
  const teacherLessons = lessons.filter((lesson) => lesson.teacher_id === user.id);
  const displayName = profile.name?.trim() || (isTeacher ? "Professor" : "Estudante");
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase("pt-BR");
  const createdLabel = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    : "—";
  const inProgressLessons = lessons.filter((lesson) =>
    progressItems.some((item) => item.lesson_id === lesson.id && (item.status === "watching" || item.status === "half")),
  );
  const suggestedLessons = lessons
    .filter((lesson) => !progressItems.some((item) => item.lesson_id === lesson.id))
    .slice(0, 4);
  const weeklyGoal = goal?.lessons_per_week ?? 3;
  // A tabela atual guarda updated_at, não um completed_at imutável.
  // Por isso, a métrica semanal conta conclusões cujo registro foi atualizado nesta semana.
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  const mondayOffset = (weekStart.getDay() + 6) % 7;
  weekStart.setDate(weekStart.getDate() - mondayOffset);
  const weeklyCompleted = progressItems.filter((item) => {
    if (item.status !== "completed" || !item.completed_at) return false;
    const completedAt = new Date(item.completed_at);
    return !Number.isNaN(completedAt.getTime()) && completedAt >= weekStart;
  }).length;
  const weeklyProgress = Math.min(100, Math.round((weeklyCompleted / Math.max(1, weeklyGoal)) * 100));
  const recentActivity = [...progressItems]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)
    .map((item) => ({
      ...item,
      lesson: lessons.find((lesson) => lesson.id === item.lesson_id),
    }))
    .filter((item) => item.lesson);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow={isTeacher ? "Área do professor" : "Área do aluno"}
        title="Meu perfil"
        description={isTeacher ? "Gerencie sua conta e acesse rapidamente suas ferramentas de ensino." : "Veja sua evolução e organize os próximos passos dos seus estudos."}
      />
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm">
          <div className="h-2 bg-primary" aria-hidden="true" />
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5">
              <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary text-xl font-semibold text-primary-foreground sm:size-20 sm:text-2xl" aria-label={`Iniciais de ${displayName}`}>
                {initials || "M"}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate font-display text-2xl font-semibold tracking-tight sm:text-3xl">{displayName}</h2>
                  <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    {isTeacher ? "Professor" : "Aluno"}
                  </span>
                </div>
                <p className="mt-1 break-all text-sm text-muted-foreground">{user.email}</p>
                <p className="mt-2 text-xs text-muted-foreground">Conta criada em {createdLabel}</p>
              </div>
            </div>
            <Button variant="outline" className="shrink-0 rounded-full" onClick={() => void signOut()}>
              Sair da conta
            </Button>
          </div>
        </div>

        {isTeacher ? (
          <>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-semibold">Seu espaço de ensino</h2>
                <p className="mt-1 text-sm text-muted-foreground">Acompanhe o catálogo e escolha uma ação para continuar.</p>
              </div>
              <Button asChild className="rounded-full">
                <Link to="/professor/aulas"><Pencil className="mr-2 size-4" /> Gerenciar aulas</Link>
              </Button>
            </div>
            {lessonsError ? (
              <div role="alert" className="mt-5 rounded-2xl border border-destructive/30 bg-card p-5">
                <p className="text-sm text-muted-foreground">{lessonsError}</p>
                <Button variant="outline" className="mt-3" onClick={() => void refetchLessons()}>Tentar novamente</Button>
              </div>
            ) : lessonsLoading ? (
              <p role="status" className="py-8 text-muted-foreground">Carregando dados do catálogo…</p>
            ) : (
              <>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Metric icon={<BookOpen aria-hidden="true" />} value={String(teacherLessons.length)} label="Aulas cadastradas" />
                  <Metric icon={<CheckCircle2 aria-hidden="true" />} value={String(teacherLessons.filter((lesson) => lesson.level === "medio").length)} label="Aulas de Ensino Médio" />
                  <Metric icon={<Target aria-hidden="true" />} value={String(teacherLessons.filter((lesson) => lesson.level === "concursos").length)} label="Aulas para concursos" />
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <Link to="/professor/aulas" className="group rounded-2xl border border-border/80 bg-card p-6 transition hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Pencil className="size-5" /></span>
                    <h3 className="mt-4 font-display text-xl font-semibold">Cadastrar ou editar aulas</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Adicione vídeos, atualize descrições e mantenha seu catálogo organizado.</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">Abrir gerenciamento <ArrowLeft className="size-4 rotate-180" /></span>
                  </Link>
                  <Link to="/aulas" className="group rounded-2xl border border-border/80 bg-card p-6 transition hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <span className="grid size-11 place-items-center rounded-xl bg-secondary/60 text-secondary-foreground"><Play className="size-5" /></span>
                    <h3 className="mt-4 font-display text-xl font-semibold">Visualizar biblioteca</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Confira a experiência de quem acessa as aulas como aluno.</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">Ver biblioteca <ArrowLeft className="size-4 rotate-180" /></span>
                  </Link>
                </div>
                {!lessons.length && (
                  <div className="mt-6 rounded-2xl border border-dashed border-border bg-muted/30 p-7 text-center sm:p-9">
                    <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-background text-primary"><BookOpen className="size-6" /></span>
                    <h3 className="mt-4 font-display text-xl font-semibold">Vamos publicar sua primeira aula?</h3>
                    <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">Seu catálogo ainda está vazio. Cadastre uma aula para começar a preencher a biblioteca que os alunos vão acessar.</p>
                    <Button asChild className="mt-5 rounded-full"><Link to="/professor/aulas"><Pencil className="mr-2 size-4" /> Cadastrar primeira aula</Link></Button>
                  </div>
                )}
              </>
            )}
            <TeacherSupportPanel />
          </>
        ) : (
          <>
            <div className="mt-7">
              <h2 className="font-display text-2xl font-semibold">Seu progresso</h2>
              <p className="mt-1 text-sm text-muted-foreground">Pequenos passos constantes fazem diferença. Veja como está sua jornada.</p>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Metric icon={<CheckCircle2 aria-hidden="true" />} value={String(completedCount)} label="Aulas concluídas" />
              <Metric icon={<Clock3 aria-hidden="true" />} value={String(inProgressCount)} label="Aulas em andamento" />
              <Metric icon={<Target aria-hidden="true" />} value={String(weeklyGoal)} label="Meta de aulas por semana" />
            </div>
            <section aria-labelledby="weekly-progress-title" className="mt-6 rounded-2xl border border-border/80 bg-card p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 id="weekly-progress-title" className="font-display text-xl font-semibold">Seu ritmo nesta semana</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Acompanhe as aulas concluídas desde segunda-feira.</p>
                </div>
                <p className="font-display text-2xl font-semibold tabular-nums">{weeklyCompleted}<span className="text-base font-normal text-muted-foreground"> / {weeklyGoal}</span></p>
              </div>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Progresso da meta semanal" aria-valuemin={0} aria-valuemax={weeklyGoal} aria-valuenow={Math.min(weeklyCompleted, weeklyGoal)}>
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${weeklyProgress}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {weeklyCompleted >= weeklyGoal
                  ? "Meta semanal atingida. Ótimo trabalho!"
                  : `Faltam ${weeklyGoal - weeklyCompleted} aula(s) para atingir sua meta.`}
              </p>
            </section>
            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-w-0">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-semibold">{inProgressLessons.length ? "Continue de onde parou" : "Próximos passos"}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{inProgressLessons.length ? "Retome uma aula sem perder o ritmo." : "Escolha uma aula e comece a construir seu progresso."}</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-full"><Link to="/aulas">Explorar aulas</Link></Button>
                </div>
                {progressError ? (
                  <div role="alert" className="rounded-2xl border border-destructive/30 bg-card p-5">
                    <p className="text-sm text-muted-foreground">{progressError}</p>
                    <Button variant="outline" className="mt-3" onClick={() => void refetchProgress()}>Tentar novamente</Button>
                  </div>
                ) : lessonsError ? (
                  <div role="alert" className="rounded-2xl border border-destructive/30 bg-card p-5">
                    <p className="text-sm text-muted-foreground">{lessonsError}</p>
                    <Button variant="outline" className="mt-3" onClick={() => void refetchLessons()}>Tentar novamente</Button>
                  </div>
                ) : lessonsLoading || progressLoading ? (
                  <p role="status" className="py-8 text-muted-foreground">Carregando seus estudos…</p>
                ) : (inProgressLessons.length ? inProgressLessons : suggestedLessons).length ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(inProgressLessons.length ? inProgressLessons : suggestedLessons).map((lesson) => <LiveLessonCard key={lesson.id} lesson={lesson} />)}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-7 text-center sm:p-9">
                    <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-background text-primary"><BookOpen className="size-6" /></span>
                    <h3 className="mt-4 font-display text-xl font-semibold">Seu próximo capítulo começa aqui</h3>
                    <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">Ainda não há aulas publicadas. Quando o professor adicionar conteúdo, ele aparecerá nesta área.</p>
                    <Button asChild className="mt-5 rounded-full"><Link to="/aulas">Explorar biblioteca</Link></Button>
                  </div>
                )}
              </div>
              <aside className="h-fit rounded-2xl border border-border/80 bg-card p-5 sm:p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Target className="size-5" /></span>
                <h3 className="mt-4 font-display text-xl font-semibold">Meta semanal</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Defina uma meta realista para manter a consistência nos estudos.</p>
                <label htmlFor="weekly-goal" className="mt-5 block text-sm font-medium">Aulas por semana</label>
                <Input id="weekly-goal" type="number" min={1} max={50} value={goalValue} onChange={(e) => setGoalValue(Number(e.target.value))} className="mt-2" />
                <p className="mt-2 text-xs text-muted-foreground">Escolha entre 1 e 50 aulas por semana.</p>
                <Button className="mt-4 w-full rounded-full" onClick={() => void saveGoal()} disabled={goalValue < 1 || goalValue > 50}>Salvar meta</Button>
                {goalStatus && <p role="status" className="mt-3 text-sm text-muted-foreground">{goalStatus}</p>}
              </aside>
            </div>
            <section aria-labelledby="recent-activity-title" className="mt-7 rounded-2xl border border-border/80 bg-card p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 id="recent-activity-title" className="font-display text-xl font-semibold">Atividade recente</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Retome seus estudos e confira a última atualização de cada aula.</p>
                </div>
                <Button asChild variant="outline" size="sm" className="rounded-full"><Link to="/aulas">Ver biblioteca</Link></Button>
              </div>
              {progressLoading ? (
                <p role="status" className="mt-4 text-sm text-muted-foreground">Carregando atividade…</p>
              ) : recentActivity.length ? (
                <ul className="mt-4 divide-y divide-border">
                  {recentActivity.map((item) => (
                    <li key={item.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                      <Link to="/aulas/$id" params={{ id: item.lesson_id }} className="font-medium hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {item.lesson?.title}
                      </Link>
                      <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                        {item.status === "completed" ? <CheckCircle2 className="size-4 text-primary" aria-hidden="true" /> : <Clock3 className="size-4" aria-hidden="true" />}
                        {item.status === "completed" ? "Concluída" : item.status === "half" ? "Parei na metade" : "Em andamento"}
                        <span aria-hidden="true">·</span>
                        {new Date(item.updated_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">Sua atividade aparecerá aqui assim que você começar uma aula e salvar o progresso.</p>
              )}
            </section>
          </>
        )}
      </section>
    </SiteLayout>
  );
}
function TeacherSupportPanel() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Array<{
    id: string; lesson_id: string; user_id: string; user_name: string;
    text: string; reply: string | null; created_at: string; lesson_title: string;
  }>>([]);
  const [feedback, setFeedback] = useState<Array<{
    id: string; title: string; message: string; is_published: boolean; created_at: string;
  }>>([]);
  const [draftReplies, setDraftReplies] = useState<Record<string, string>>({});
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const userId = user?.id;

  const loadPanel = useCallback(async () => {
    if (!userId || !hasSupabaseConfig) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [questionsResult, feedbackResult] = await Promise.all([
      supabase.from("comments")
        .select("id,lesson_id,user_id,user_name,text,reply,created_at,lessons!inner(title,teacher_id)")
        .eq("lessons.teacher_id", userId)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase.from("teacher_feedback")
        .select("id,title,message,is_published,created_at")
        .eq("teacher_id", userId)
        .order("created_at", { ascending: false }),
    ]);
    if (questionsResult.error) {
      setNotice("Não foi possível carregar as dúvidas. Tente atualizar a página.");
    } else {
      setQuestions(((questionsResult.data ?? []) as Array<{
        id: string; lesson_id: string; user_id: string; user_name: string; text: string;
        reply: string | null; created_at: string; lessons?: { title: string; teacher_id: string } | null;
      }>).map((q) => ({ ...q, lesson_title: q.lessons?.title ?? "Aula sem título" })));
    }
    if (feedbackResult.error) {
      setNotice("Não foi possível carregar as mensagens da página inicial.");
    } else {
      setFeedback((feedbackResult.data ?? []) as typeof feedback);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { void loadPanel(); }, [loadPanel]);

  const sendReply = async (id: string) => {
    const reply = draftReplies[id]?.trim();
    if (!reply) return;
    setBusy(true);
    const result = await replyToComment(id, reply);
    setBusy(false);
    if (result.error) {
      setNotice("Não foi possível enviar a resposta. Confira as permissões e tente novamente.");
      return;
    }
    setDraftReplies((current) => ({ ...current, [id]: "" }));
    setNotice("Resposta enviada.");
    await loadPanel();
  };

  const createFeedback = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || title.trim().length < 3 || message.trim().length < 5) return;
    setBusy(true);
    const result = await supabase.from("teacher_feedback").insert({
      teacher_id: user.id,
      title: title.trim(),
      message: message.trim(),
      is_published: false,
    });
    setBusy(false);
    if (result.error) {
      setNotice("Não foi possível salvar a mensagem.");
      return;
    }
    setTitle("");
    setMessage("");
    setNotice("Mensagem salva como rascunho. Publique quando estiver pronta.");
    await loadPanel();
  };

  const toggleFeedback = async (item: (typeof feedback)[number]) => {
    setBusy(true);
    const result = await supabase.from("teacher_feedback")
      .update({ is_published: !item.is_published, updated_at: new Date().toISOString() })
      .eq("id", item.id)
      .eq("teacher_id", user?.id);
    setBusy(false);
    if (result.error) setNotice("Não foi possível atualizar a publicação.");
    else setNotice(item.is_published ? "Mensagem retirada da página inicial." : "Mensagem publicada na página inicial dos alunos.");
    await loadPanel();
  };

  const deleteFeedback = async (id: string) => {
    if (!window.confirm("Excluir esta mensagem permanentemente?")) return;
    setBusy(true);
    const result = await supabase.from("teacher_feedback").delete().eq("id", id).eq("teacher_id", user?.id);
    setBusy(false);
    if (result.error) setNotice("Não foi possível excluir a mensagem.");
    else setNotice("Mensagem excluída.");
    await loadPanel();
  };

  const unanswered = questions.filter((question) => !question.reply?.trim());
  return (
    <section className="mt-8 space-y-8">
      <div aria-labelledby="teacher-questions-title" className="rounded-3xl border border-border/80 bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary"><MessageSquare className="size-4" aria-hidden="true" /> Atendimento aos alunos</span>
            <h2 id="teacher-questions-title" className="mt-2 font-display text-2xl font-semibold">Central de dúvidas</h2>
            <p className="mt-1 text-sm text-muted-foreground">Consulte perguntas deixadas nas aulas e responda sem precisar procurar cada vídeo.</p>
          </div>
          <div className="rounded-xl bg-muted px-4 py-3 text-center">
            <strong className="block font-display text-2xl">{unanswered.length}</strong>
            <span className="text-xs text-muted-foreground">Sem resposta</span>
          </div>
        </div>
        {loading ? <p role="status" className="mt-5 text-sm text-muted-foreground">Carregando dúvidas…</p> : questions.length ? (
          <div className="mt-5 space-y-4">
            {questions.map((question) => (
              <article key={question.id} className="rounded-2xl border border-border bg-background p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{question.user_name || "Aluno"}</p>
                    <p className="mt-1 text-xs text-primary">{question.lesson_title}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(question.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{question.text}</p>
                {question.reply ? (
                  <div className="mt-4 rounded-xl bg-muted/60 p-3">
                    <p className="text-xs font-semibold text-primary">Sua resposta</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm">{question.reply}</p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-2">
                    <label htmlFor={`reply-${question.id}`} className="text-sm font-medium">Responder dúvida</label>
                    <Textarea id={`reply-${question.id}`} value={draftReplies[question.id] ?? ""} onChange={(event) => setDraftReplies((current) => ({ ...current, [question.id]: event.target.value }))} placeholder="Escreva uma explicação clara para o aluno…" rows={3} />
                    <div className="flex justify-end">
                      <Button disabled={busy || !draftReplies[question.id]?.trim()} onClick={() => void sendReply(question.id)}><Send className="mr-2 size-4" /> Enviar resposta</Button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-xl bg-muted/50 p-5 text-sm text-muted-foreground">Ainda não há dúvidas registradas nas aulas.</p>
        )}
      </div>

      <div aria-labelledby="teacher-feedback-management-title" className="rounded-3xl border border-border/80 bg-card p-5 sm:p-7">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-primary"><Star className="size-4" aria-hidden="true" /> Comunicação com os alunos</span>
        <h2 id="teacher-feedback-management-title" className="mt-2 font-display text-2xl font-semibold">Mensagens da página inicial</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">Crie avisos, orientações ou mensagens de incentivo. Elas ficam como rascunho até você publicar e, quando publicadas, aparecem apenas na página inicial dos alunos.</p>
        <form onSubmit={createFeedback} className="mt-5 space-y-4 rounded-2xl bg-muted/40 p-4 sm:p-5">
          <div>
            <label htmlFor="feedback-title" className="mb-1.5 block text-sm font-medium">Título da mensagem</label>
            <Input id="feedback-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={100} minLength={3} required placeholder="Ex.: Cronograma de revisão da semana" />
          </div>
          <div>
            <label htmlFor="feedback-message" className="mb-1.5 block text-sm font-medium">Mensagem para os alunos</label>
            <Textarea id="feedback-message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={1000} minLength={5} required rows={4} placeholder="Escreva o aviso ou a orientação que os alunos verão na página inicial…" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">Até 100 caracteres no título e 1.000 na mensagem.</p>
            <Button type="submit" disabled={busy || title.trim().length < 3 || message.trim().length < 5}>Salvar rascunho</Button>
          </div>
        </form>
        {feedback.length ? (
          <div className="mt-5 space-y-3">
            <h3 className="font-display text-lg font-semibold">Suas mensagens</h3>
            {feedback.map((item) => (
              <article key={item.id} className="flex flex-col gap-4 rounded-2xl border border-border p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold">{item.title}</h4>
                    <span className={item.is_published ? "rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary" : "rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"}>{item.is_published ? "Publicada" : "Rascunho"}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{item.message}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void toggleFeedback(item)}>{item.is_published ? "Retirar do início" : "Publicar"}</Button>
                  <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void deleteFeedback(item.id)}><Trash2 className="mr-1 size-4" /> Excluir</Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-muted-foreground">Você ainda não criou mensagens para os alunos.</p>
        )}
        {notice && <p role="status" className="mt-4 rounded-xl bg-muted/60 p-3 text-sm">{notice}</p>}
      </div>
    </section>
  );
}

function Metric({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
      <span className="text-primary">{icon}</span>
      <strong className="mt-5 block font-display text-3xl">{value}</strong>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function LiveTeacherDashboard() {
  const { user, isTeacher, loading: authLoading } = useAuth();
  const { lessons, loading, error, refetch } = useLessons();
  const teacherLessons = lessons.filter((lesson) => lesson.teacher_id === user?.id);

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
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        {!hasSupabaseConfig ? (
          <div className="rounded-2xl border border-amber/30 bg-amber/5 p-5">
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
          <div role="alert" className="rounded-2xl border border-destructive/30 bg-card p-5">
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
                value={String(teacherLessons.length)}
                label="Aulas cadastradas"
              />
              <Metric
                icon={<Target aria-hidden="true" />}
                value={String(teacherLessons.filter((lesson) => lesson.level === "medio").length)}
                label="Ensino Médio"
              />
              <Metric
                icon={<Target aria-hidden="true" />}
                value={String(teacherLessons.filter((lesson) => lesson.level === "pre-vestibular").length)}
                label="Pré-vestibular"
              />
              <Metric
                icon={<Target aria-hidden="true" />}
                value={String(teacherLessons.filter((lesson) => lesson.level === "concursos").length)}
                label="Concursos"
              />
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <Link
                to="/professor/aulas"
                className="group rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition duration-300 hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="text-sm font-medium text-primary">Experiência do aluno</span>
                <h2 className="mt-2 font-display text-2xl">Ver biblioteca pública</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Confira como as aulas publicadas aparecem para os estudantes.
                </p>
                <span className="mt-4 inline-block text-sm font-medium">Abrir biblioteca →</span>
              </Link>
            </div>
            {!teacherLessons.length && (
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
  const { user, isTeacher, loading: authLoading } = useAuth();
  const { lessons, loading: lessonsLoading, error: lessonsError, refetch } = useLessons();
  const teacherLessons = lessons.filter((lesson) => lesson.teacher_id === user?.id);
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
      if (!user?.id) {
        setStatus("Sua sessão expirou. Entre novamente para salvar aulas.");
        return;
      }
      const payload = {
        title: title.trim(),
        subject: subject.trim(),
        duration: duration.trim(),
        video_id: video.trim(),
        level,
        description: description.trim(),
        teacher_id: user.id,
        updated_at: new Date().toISOString(),
      };
      const result = editing
        ? await supabase.from("lessons").update(payload).eq("id", editing.id).eq("teacher_id", user.id)
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
      if (!user?.id) {
        setStatus("Sua sessão expirou. Entre novamente para excluir aulas.");
        return;
      }
      const result = await supabase.from("lessons").delete().eq("id", id).eq("teacher_id", user.id);
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
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-3">
            {lessonsLoading ? (
              <p role="status" className="py-8 text-muted-foreground">
                Carregando aulas…
              </p>
            ) : lessonsError ? (
              <div role="alert" className="rounded-2xl border border-destructive/30 bg-card p-5">
                <p className="text-sm text-muted-foreground">{lessonsError}</p>
                <Button variant="outline" className="mt-3" onClick={() => void refetch()}>
                  Tentar novamente
                </Button>
              </div>
            ) : teacherLessons.length ? (
              teacherLessons.map((l) => (
                <article
                  key={l.id}
                  className="grid gap-4 rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-colors hover:border-primary/30 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
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
              <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-muted-foreground">
                Nenhuma aula cadastrada. Crie a primeira usando o formulário.
              </div>
            )}
            <Button onClick={() => open()} disabled={busy}>
              <BookOpen aria-hidden="true" />
              Nova aula
            </Button>
          </div>
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
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
                {isValidYouTubeId(video.trim()) && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-border">
                    <iframe
                      className="aspect-video w-full"
                      src={`https://www.youtube-nocookie.com/embed/${video.trim()}`}
                      title={`Prévia do vídeo: ${title.trim() || "aula"}`}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                )}
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
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
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
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
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
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <div className="rounded-2xl border border-amber/30 bg-amber/5 p-5">
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
            <div role="alert" className="rounded-2xl border border-destructive/30 bg-card p-5">
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
