import { Link, useParams } from "@tanstack/react-router";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  MessageCircle,
  Pause,
  Play,
  Search,
  Trophy,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DemoNotice, EmptyState } from "@/components/states";
import {
  ExamCard,
  LessonCard,
  PageHeader,
  ProgressBar,
  Rating,
  SiteLayout,
} from "@/components/site";
import {
  categories,
  exams,
  exercises,
  getTrailLessons,
  getTrailProgress,
  knowledgeTree,
  lessons,
} from "@/lib/mock-data";

export function CategoryPage({ slug }: { slug: string }) {
  const category = categories.find((item) => item.slug === slug);
  if (!category)
    return (
      <SiteLayout>
        <PageHeader title="Trilha não encontrada" />
        <section className="mx-auto max-w-7xl px-5 sm:px-6">
          <EmptyState
            title="Esta trilha não está disponível"
            description="Volte à página inicial para escolher uma das trilhas existentes."
            action={
              <Button asChild>
                <Link to="/">Ver trilhas</Link>
              </Button>
            }
          />
        </section>
      </SiteLayout>
    );
  const trailLessons = getTrailLessons(slug);
  const tree = knowledgeTree.filter((item) => item.trailSlug === slug);
  return (
    <SiteLayout>
      <PageHeader
        eyebrow={`${category.level} · Trilha de estudos`}
        title={category.name}
        description={category.objective}
      />
      <section className="mx-auto max-w-7xl px-5 sm:px-6">
        <DemoNotice>
          Estrutura e progresso demonstrativos. As quantidades finais dependerão do catálogo
          publicado.
        </DemoNotice>
        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,.6fr)]">
          <div>
            <h2 className="font-display text-2xl">Aulas disponíveis</h2>
            {trailLessons.length > 0 ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {trailLessons.map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState
                  title="Conteúdo em preparação"
                  description="A estrutura desta trilha já está pronta para receber módulos, tópicos, aulas e exercícios."
                />
              </div>
            )}
          </div>
          <aside>
            <h2 className="font-display text-2xl">Organização da trilha</h2>
            <div className="mt-4 rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between text-sm">
                <span>Progresso demonstrativo</span>
                <strong>{getTrailProgress(slug)}%</strong>
              </div>
              <div className="mt-3">
                <ProgressBar
                  value={getTrailProgress(slug)}
                  label={`Progresso da trilha ${category.name}`}
                />
              </div>
              <div className="mt-6 space-y-5">
                {tree.length > 0 ? (
                  tree.map((discipline) => (
                    <div key={discipline.discipline}>
                      <h3 className="font-medium">{discipline.discipline}</h3>
                      {discipline.modules.map((module) => (
                        <div key={module.name} className="mt-3 border-l-2 border-primary/30 pl-4">
                          <p className="text-sm">{module.name}</p>
                          <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
                            {module.topics.map((topic) => (
                              <li key={topic}>→ {topic}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Disciplinas e módulos serão publicados em breve.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

export function LessonsPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Biblioteca"
        title="Todas as aulas"
        description="Encontre uma explicação objetiva por assunto, matéria ou nível de ensino."
      />
      <section className="mx-auto max-w-7xl px-5 sm:px-6">
        <form
          action="/pesquisa"
          className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-[1fr_auto]"
        >
          <label htmlFor="lesson-search" className="sr-only">
            Buscar por aula, assunto ou matéria
          </label>
          <Input
            id="lesson-search"
            name="q"
            placeholder="Buscar por aula, assunto ou matéria"
            className="h-11"
          />
          <Button type="submit" className="h-11">
            <Search aria-hidden="true" />
            Pesquisar
          </Button>
        </form>
        <DemoNotice>Catálogo demonstrativo para validação da navegação e apresentação.</DemoNotice>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

export function SearchPage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () =>
      lessons.filter((lesson) =>
        `${lesson.title} ${lesson.subject} ${lesson.category} ${lesson.module} ${lesson.topic}`
          .toLowerCase()
          .includes(q.trim().toLowerCase()),
      ),
    [q],
  );
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Pesquisa global"
        title="O que você quer aprender?"
        description="Pesquise pelo nome da aula, assunto, módulo ou trilha."
      />
      <section className="mx-auto max-w-7xl px-5 sm:px-6">
        <form role="search" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="global-search" className="sr-only">
            Pesquisar aulas
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="global-search"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Ex.: equações, trigonometria, álgebra…"
              className="h-14 rounded-full bg-card pl-12 text-base"
            />
          </div>
        </form>
        <p aria-live="polite" className="my-6 font-mono text-xs text-muted-foreground">
          {filtered.length}{" "}
          {filtered.length === 1 ? "resultado encontrado" : "resultados encontrados"}
        </p>
        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhuma aula encontrada"
            description="Tente buscar por outro assunto, matéria ou nível de ensino."
            action={
              <Button variant="outline" onClick={() => setQ("")}>
                Limpar busca
              </Button>
            }
          />
        )}
      </section>
    </SiteLayout>
  );
}

export function ExamsPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Preparação por objetivo"
        title="Concursos Militares"
        description="Estruturas demonstrativas organizadas por concurso, prontas para receber conteúdo validado."
      />
      <section className="mx-auto max-w-7xl px-5 sm:px-6">
        <DemoNotice>
          Não há informações de edital, quantidade de aulas ou desempenho publicadas nesta
          demonstração.
        </DemoNotice>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <ExamCard key={exam.slug} exam={exam} />
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

export function ExamDetailPage() {
  const { slug } = useParams({ strict: false }) as { slug?: string };
  const exam = exams.find((item) => item.slug === slug);
  if (!exam)
    return (
      <SiteLayout>
        <PageHeader title="Preparação não encontrada" />
        <section className="mx-auto max-w-7xl px-5 sm:px-6">
          <EmptyState
            title="Este concurso não está disponível"
            description="Confira as opções de preparação que já fazem parte da demonstração."
            action={
              <Button asChild>
                <Link to="/concursos">Ver concursos</Link>
              </Button>
            }
          />
        </section>
      </SiteLayout>
    );
  const subjects =
    exam.slug === "espcex"
      ? ["Matemática", "Português", "Física", "História", "Geografia", "Inglês"]
      : ["Matemática", "Português", "Física", "Inglês", "Conhecimentos gerais"];
  const recommended = lessons.filter((lesson) => lesson.categorySlug === "concursos");
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Concursos Militares"
        title={`Preparação para ${exam.name}`}
        description={exam.description}
      />
      <section className="mx-auto max-w-7xl px-5 sm:px-6">
        <DemoNotice>
          Estrutura demonstrativa. Disciplinas, assuntos e conteúdos devem ser validados antes da
          publicação.
        </DemoNotice>
        <div className="mt-6 grid gap-8 lg:grid-cols-[.7fr_1.3fr]">
          <div className="rounded-lg border border-border bg-card p-6">
            <Trophy aria-hidden="true" className="size-8 text-amber" />
            <h2 className="mt-5 font-display text-2xl">Disciplinas previstas</h2>
            <div className="mt-4 space-y-2">
              {subjects.map((subject) => (
                <div
                  key={subject}
                  className="flex items-center gap-3 rounded-md bg-muted/60 px-4 py-3 text-sm"
                >
                  <CircleDot aria-hidden="true" className="size-3 text-primary" />
                  <span>{subject}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-4 font-display text-2xl">Aulas demonstrativas</h2>
            {recommended.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {recommended.map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Conteúdo em preparação"
                description="A estrutura está pronta para receber aulas e exercícios relacionados a este concurso."
              />
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

export function LessonPage() {
  const { id } = useParams({ strict: false }) as { id?: string };
  const lesson = lessons.find((item) => item.id === id);
  const [done, setDone] = useState(false);
  if (!lesson)
    return (
      <SiteLayout>
        <PageHeader
          title="Aula não encontrada"
          description="O endereço pode ter mudado ou o conteúdo ainda não foi publicado."
        />
        <section className="mx-auto max-w-7xl px-5 sm:px-6">
          <EmptyState
            title="Não encontramos esta aula"
            description="Volte à biblioteca para continuar estudando."
            action={
              <Button asChild>
                <Link to="/aulas">Ver todas as aulas</Link>
              </Button>
            }
          />
        </section>
      </SiteLayout>
    );
  const index = lessons.findIndex((item) => item.id === lesson.id);
  const previous = index > 0 ? lessons[index - 1] : undefined;
  const next = index < lessons.length - 1 ? lessons[index + 1] : undefined;
  const relatedExercises = exercises.filter((exercise) => exercise.lessonId === lesson.id);
  const progress = done ? 100 : lesson.progress;
  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-5 pb-6 pt-8 sm:px-6">
        <nav
          aria-label="Localização da aula"
          className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
        >
          <Link to="/" className="hover:text-foreground">
            Trilhas
          </Link>
          <span aria-hidden="true">/</span>
          <span>{lesson.category}</span>
          <span aria-hidden="true">/</span>
          <span>{lesson.subject}</span>
          <span aria-hidden="true">/</span>
          <span>{lesson.module}</span>
        </nav>
        <h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
          {lesson.title}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {lesson.topic} · Professor demonstrativo · {lesson.duration}
        </p>
      </section>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <div className="relative aspect-video overflow-hidden rounded-lg bg-foreground">
            <img
              src={lesson.image}
              alt={`Capa da aula ${lesson.title}`}
              width={1088}
              height={608}
              className="h-full w-full object-cover opacity-70"
            />
            <Button
              size="icon"
              className="absolute inset-0 m-auto size-20 rounded-full"
              aria-label="Player demonstrativo, reprodução indisponível"
              disabled
            >
              <Play aria-hidden="true" className="size-8" fill="currentColor" />
            </Button>
            <div className="absolute inset-x-5 bottom-5">
              <ProgressBar value={progress} label={`Progresso na aula ${lesson.title}`} />
            </div>
          </div>
          <DemoNotice>
            Player, professor, comentários e avaliações são demonstrativos. Nenhuma atividade é
            salva nesta versão.
          </DemoNotice>
          <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
            <Button onClick={() => setDone(!done)} className="min-h-11">
              <Check aria-hidden="true" />
              {done ? "Aula concluída" : "Marcar como concluída"}
            </Button>
            <Button variant="outline" className="min-h-11">
              <Pause aria-hidden="true" />
              Parei na metade
            </Button>
            <Button variant="outline" className="min-h-11">
              <MessageCircle aria-hidden="true" />
              Comentar
            </Button>
          </div>
          <h2 className="mt-10 font-display text-2xl">Sobre esta aula</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Conteúdo demonstrativo organizado para apresentar conceitos, exemplos e exercícios de
            forma progressiva. O material definitivo poderá ser atualizado pelo professor.
          </p>
          <section className="mt-10">
            <h2 className="font-display text-2xl">Exercícios relacionados</h2>
            {relatedExercises.length > 0 ? (
              <div className="mt-4 grid gap-3">
                {relatedExercises.map((exercise) => (
                  <article
                    key={exercise.id}
                    className="rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-medium">{exercise.title}</h3>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                        {exercise.difficulty}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{exercise.objective}</p>
                    <p className="mt-3 font-mono text-xs text-muted-foreground">
                      {exercise.type} · estrutura demonstrativa
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState
                  title="Exercícios em preparação"
                  description="Esta aula poderá receber questões com explicações passo a passo em uma próxima etapa."
                />
              </div>
            )}
          </section>
          <Comments />
        </div>
        <aside className="space-y-5">
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="font-mono text-xs uppercase text-muted-foreground">
              Avaliação demonstrativa
            </p>
            <div className="mt-3 flex items-end gap-3">
              <strong className="font-display text-5xl">4,8</strong>
              <div>
                <Rating value={5} />
                <p className="mt-1 text-xs text-muted-foreground">amostra visual</p>
              </div>
            </div>
            {[5, 4, 3, 2, 1].map((rating) => (
              <div
                key={rating}
                className="mt-3 grid grid-cols-[14px_1fr_30px] items-center gap-2 text-xs"
              >
                <span>{rating}</span>
                <ProgressBar
                  value={rating === 5 ? 78 : rating === 4 ? 16 : 2}
                  label={`Distribuição demonstrativa de ${rating} estrelas`}
                />
                <span className="text-muted-foreground">
                  {rating === 5 ? "78%" : rating === 4 ? "16%" : "2%"}
                </span>
              </div>
            ))}
          </div>
          <div>
            <h2 className="mb-3 font-display text-xl">Próximo passo</h2>
            {next ? (
              <LessonCard lesson={next} />
            ) : (
              <EmptyState
                title="Trilha concluída"
                description="Explore a biblioteca para escolher o próximo conteúdo."
              />
            )}
          </div>
        </aside>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {previous ? (
            <Button asChild variant="outline" className="min-h-12 justify-start">
              <Link to="/aulas/$id" params={{ id: previous.id }}>
                <ChevronLeft aria-hidden="true" />
                {previous.title}
              </Link>
            </Button>
          ) : (
            <div />
          )}
          {next ? (
            <Button asChild className="min-h-12 justify-end">
              <Link to="/aulas/$id" params={{ id: next.id }}>
                {next.title}
                <ChevronRight aria-hidden="true" />
              </Link>
            </Button>
          ) : (
            <Button asChild className="min-h-12">
              <Link to="/aulas">Voltar à biblioteca</Link>
            </Button>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function Comments() {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl">Comentários e dúvidas</h2>
      <div className="mt-4 rounded-lg border border-border bg-card p-4">
        <label htmlFor="lesson-comment" className="mb-2 block text-sm font-medium">
          Sua dúvida
        </label>
        <Textarea
          id="lesson-comment"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setSent(false);
          }}
          placeholder="Professor, poderia explicar novamente essa parte?"
          className="min-h-24"
        />
        <Button
          className="mt-3"
          disabled={!text.trim()}
          onClick={() => {
            setText("");
            setSent(true);
          }}
        >
          Enviar comentário
        </Button>
        {sent && (
          <p role="status" className="mt-3 text-sm text-mint">
            Comentário demonstrativo enviado com sucesso.
          </p>
        )}
      </div>
      <DemoNotice>O comentário e a resposta abaixo são exemplos de apresentação.</DemoNotice>
      <div className="mt-4 rounded-lg border border-border p-4">
        <strong className="text-sm">Aluna demonstrativa</strong>
        <p className="mt-2 text-sm text-muted-foreground">
          Professor, poderia explicar novamente por que o sinal muda nesta etapa?
        </p>
        <div className="ml-5 mt-3 border-l-2 border-primary pl-4">
          <span className="text-xs font-medium text-primary">Professor demonstrativo</span>
          <p className="mt-1 text-sm text-muted-foreground">
            Claro! Isso acontece porque distribuímos o sinal negativo por todos os termos.
          </p>
        </div>
      </div>
    </section>
  );
}
