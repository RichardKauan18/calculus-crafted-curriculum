import parabola from '@/assets/parabola.jpg'
import geometry from '@/assets/geometry.jpg'
import trigonometry from '@/assets/trigonometry.jpg'

export type LessonStatus = 'not-started' | 'progress' | 'completed'
export type Lesson = { id: string; title: string; subject: string; category: string; duration: string; progress: number; status: LessonStatus; image: string }

export const lessons: Lesson[] = [
  { id: 'equacoes-2-grau', title: 'Equações do 2º grau', subject: 'Álgebra', category: 'Ensino Médio', duration: '18 min', progress: 67, status: 'progress', image: parabola },
  { id: 'geometria-espacial', title: 'Geometria espacial', subject: 'Geometria', category: 'Superior', duration: '32 min', progress: 24, status: 'progress', image: geometry },
  { id: 'trigonometria', title: 'Trigonometria', subject: 'Trigonometria', category: 'Pré-vestibular', duration: '26 min', progress: 100, status: 'completed', image: trigonometry },
  { id: 'funcao-quadratica', title: 'Função quadrática', subject: 'Funções', category: 'Ensino Médio', duration: '22 min', progress: 0, status: 'not-started', image: parabola },
  { id: 'logaritmos', title: 'Logaritmos: fundamentos', subject: 'Álgebra', category: 'Concursos', duration: '35 min', progress: 0, status: 'not-started', image: geometry },
]

export const categories = [
  { slug: 'fundamental', name: 'Fundamental', symbol: '∑', detail: 'Base sólida: operações, frações e geometria plana.', count: '64 aulas · 8 módulos', tone: 'primary' },
  { slug: 'ensino-medio', name: 'Ensino Médio', symbol: 'ƒ', detail: 'Funções, trigonometria, analítica e estatística.', count: '98 aulas · 12 módulos', tone: 'cyan' },
  { slug: 'pre-vestibular', name: 'Pré-vestibular', symbol: '√', detail: 'ENEM e vestibulares: resolução cronometrada.', count: '112 aulas · 14 módulos', tone: 'mint' },
  { slug: 'superior', name: 'Superior', symbol: '∞', detail: 'Cálculo, álgebra linear e equações diferenciais.', count: '76 aulas · 9 módulos', tone: 'amber' },
  { slug: 'concursos', name: 'Concursos Militares', symbol: '⌾', detail: 'Preparação organizada por edital e carreira.', count: '9 concursos · 180 aulas', tone: 'primary' },
]

export const exams = [
  { slug: 'esa', name: 'ESA', description: 'Formação de sargentos do Exército.', subjects: 5 },
  { slug: 'espcex', name: 'EsPCEx', description: 'Ingresso na carreira de oficial do Exército.', subjects: 6 },
  { slug: 'colegio-naval', name: 'Colégio Naval', description: 'Preparação completa para o ensino naval.', subjects: 5 },
  { slug: 'escola-naval', name: 'Escola Naval', description: 'Formação superior para oficiais da Marinha.', subjects: 7 },
  { slug: 'afa', name: 'AFA', description: 'Academia da Força Aérea.', subjects: 7 },
  { slug: 'efomm', name: 'EFOMM', description: 'Oficiais da Marinha Mercante.', subjects: 6 },
  { slug: 'eear', name: 'EEAR', description: 'Especialistas da Aeronáutica.', subjects: 5 },
  { slug: 'ime', name: 'IME', description: 'Engenharia militar de alta complexidade.', subjects: 8 },
  { slug: 'ita', name: 'ITA', description: 'Engenharia e tecnologia aeroespacial.', subjects: 8 },
]
