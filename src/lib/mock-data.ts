import parabola from "@/assets/parabola.jpg";
import geometry from "@/assets/geometry.jpg";
import trigonometry from "@/assets/trigonometry.jpg";

export type LessonStatus = "not-started" | "progress" | "completed";
export type ContentAvailability = "demo" | "preparing";
export type Lesson = {
  id: string;
  title: string;
  subject: string;
  category: string;
  categorySlug: string;
  module: string;
  topic: string;
  duration: string;
  progress: number;
  status: LessonStatus;
  image: string;
};

export const lessons: Lesson[] = [
  {
    id: "equacoes-2-grau",
    title: "Equações do 2º grau",
    subject: "Álgebra",
    category: "Ensino Médio",
    categorySlug: "ensino-medio",
    module: "Equações",
    topic: "Equações polinomiais",
    duration: "18 min",
    progress: 67,
    status: "progress",
    image: parabola,
  },
  {
    id: "geometria-espacial",
    title: "Geometria espacial",
    subject: "Geometria",
    category: "Superior",
    categorySlug: "superior",
    module: "Geometria",
    topic: "Sólidos geométricos",
    duration: "32 min",
    progress: 24,
    status: "progress",
    image: geometry,
  },
  {
    id: "trigonometria",
    title: "Trigonometria",
    subject: "Trigonometria",
    category: "Pré-vestibular",
    categorySlug: "pre-vestibular",
    module: "Trigonometria",
    topic: "Relações trigonométricas",
    duration: "26 min",
    progress: 100,
    status: "completed",
    image: trigonometry,
  },
  {
    id: "funcao-quadratica",
    title: "Função quadrática",
    subject: "Funções",
    category: "Ensino Médio",
    categorySlug: "ensino-medio",
    module: "Funções",
    topic: "Funções polinomiais",
    duration: "22 min",
    progress: 0,
    status: "not-started",
    image: parabola,
  },
  {
    id: "logaritmos",
    title: "Logaritmos: fundamentos",
    subject: "Álgebra",
    category: "Concursos Militares",
    categorySlug: "concursos",
    module: "Álgebra",
    topic: "Logaritmos",
    duration: "35 min",
    progress: 0,
    status: "not-started",
    image: geometry,
  },
];

export const categories = [
  {
    slug: "fundamental",
    name: "Fundamental",
    level: "Base escolar",
    symbol: "∑",
    detail: "Base sólida em operações, frações e geometria plana.",
    objective: "Consolidar fundamentos para avançar com segurança.",
    tone: "primary",
    availability: "preparing" as ContentAvailability,
  },
  {
    slug: "ensino-medio",
    name: "Ensino Médio",
    level: "Intermediário",
    symbol: "ƒ",
    detail: "Funções, trigonometria, geometria analítica e estatística.",
    objective: "Dominar os principais conteúdos do Ensino Médio.",
    tone: "cyan",
    availability: "demo" as ContentAvailability,
  },
  {
    slug: "pre-vestibular",
    name: "Pré-vestibular",
    level: "Preparatório",
    symbol: "√",
    detail: "Revisão orientada para ENEM e vestibulares.",
    objective: "Ganhar repertório e estratégia de resolução.",
    tone: "mint",
    availability: "demo" as ContentAvailability,
  },
  {
    slug: "superior",
    name: "Superior",
    level: "Avançado",
    symbol: "∞",
    detail: "Introdução a cálculo, álgebra linear e geometria.",
    objective: "Apoiar a transição para a Matemática universitária.",
    tone: "amber",
    availability: "demo" as ContentAvailability,
  },
  {
    slug: "concursos",
    name: "Concursos Militares",
    level: "Preparatório",
    symbol: "⌾",
    detail: "Organização por carreira, disciplina e assunto.",
    objective: "Preparar uma futura jornada orientada por concurso.",
    tone: "primary",
    availability: "demo" as ContentAvailability,
  },
];

export const exams = [
  { slug: "esa", name: "ESA", description: "Formação de sargentos do Exército.", subjects: 5 },
  {
    slug: "espcex",
    name: "EsPCEx",
    description: "Ingresso na carreira de oficial do Exército.",
    subjects: 6,
  },
  {
    slug: "colegio-naval",
    name: "Colégio Naval",
    description: "Preparação completa para o ensino naval.",
    subjects: 5,
  },
  {
    slug: "escola-naval",
    name: "Escola Naval",
    description: "Formação superior para oficiais da Marinha.",
    subjects: 7,
  },
  { slug: "afa", name: "AFA", description: "Academia da Força Aérea.", subjects: 7 },
  { slug: "efomm", name: "EFOMM", description: "Oficiais da Marinha Mercante.", subjects: 6 },
  { slug: "eear", name: "EEAR", description: "Especialistas da Aeronáutica.", subjects: 5 },
  {
    slug: "ime",
    name: "IME",
    description: "Engenharia militar de alta complexidade.",
    subjects: 8,
  },
  { slug: "ita", name: "ITA", description: "Engenharia e tecnologia aeroespacial.", subjects: 8 },
];

export const knowledgeTree = [
  {
    trailSlug: "ensino-medio",
    discipline: "Álgebra",
    modules: [
      { name: "Equações", topics: ["Equações polinomiais"] },
      { name: "Funções", topics: ["Funções polinomiais"] },
    ],
  },
  {
    trailSlug: "pre-vestibular",
    discipline: "Trigonometria",
    modules: [{ name: "Trigonometria", topics: ["Relações trigonométricas"] }],
  },
  {
    trailSlug: "superior",
    discipline: "Geometria",
    modules: [{ name: "Geometria", topics: ["Sólidos geométricos"] }],
  },
  {
    trailSlug: "concursos",
    discipline: "Álgebra",
    modules: [{ name: "Álgebra", topics: ["Logaritmos"] }],
  },
];

export const exercises = [
  {
    id: "ex-equacoes-1",
    lessonId: "equacoes-2-grau",
    title: "Reconhecer os coeficientes",
    type: "Múltipla escolha",
    difficulty: "Essencial",
    objective: "Identificar a estrutura de uma equação quadrática.",
  },
  {
    id: "ex-equacoes-2",
    lessonId: "equacoes-2-grau",
    title: "Calcular as raízes",
    type: "Resposta numérica",
    difficulty: "Intermediário",
    objective: "Aplicar a fórmula resolutiva com conferência do resultado.",
  },
];

export const studyJourney = [
  "Diagnóstico",
  "Trilha personalizada",
  "Aulas",
  "Exercícios",
  "Revisão",
  "Simulados",
  "Acompanhamento do progresso",
];

export function normalizeProgress(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function aggregateProgress(values: number[]) {
  if (values.length === 0) return 0;
  return normalizeProgress(
    values.reduce((total, value) => total + normalizeProgress(value), 0) / values.length,
  );
}

export function getTrailLessons(trailSlug: string) {
  return lessons.filter((lesson) => lesson.categorySlug === trailSlug);
}

export function getTrailProgress(trailSlug: string) {
  return aggregateProgress(getTrailLessons(trailSlug).map((lesson) => lesson.progress));
}
