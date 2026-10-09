import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Check,
  Mail,
  Instagram,
  MessageCircle,
  User,
  Target,
  Clock3,
  BookOpen,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LessonCard, PageHeader, ProgressBar, SiteLayout, ThemeToggle } from "@/components/site";
import { lessons } from "@/lib/mock-data";
import { useAuth } from "@/hooks/useAuth";

export function ProfilePage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Área do aluno"
        title="Olá, Ana Martins"
        description="Seu ritmo está excelente. Continue construindo consistência."
      />
      <section className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric icon={<BookOpen />} value="42" label="Aulas concluídas" />
          <Metric icon={<Clock3 />} value="3" label="Em andamento" />
          <Metric icon={<Clock3 />} value="28h 16m" label="Tempo estudado" />
          <Metric icon={<Target />} value="68%" label="Progresso geral" />
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="mb-4 font-display text-2xl">Continue de onde parou</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {lessons.slice(0, 2).map((l) => (
                <LessonCard key={l.id} lesson={l} />
              ))}
            </div>
          </div>
          <aside className="rounded-lg border border-border bg-card p-6">
            <Target className="size-7 text-primary" />
            <h2 className="mt-4 font-display text-2xl">Meta semanal</h2>
            <p className="mt-2 text-sm text-muted-foreground">5 aulas por semana</p>
            <strong className="mt-8 block font-display text-4xl">
              3 <span className="text-lg text-muted-foreground">/ 5</span>
            </strong>
            <div className="mt-3">
              <ProgressBar value={60} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Faltam 2 aulas para completar sua meta.
            </p>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
function Metric({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
      <span className="text-primary">{icon}</span>
      <strong className="mt-5 block font-display text-3xl">{value}</strong>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
export function AuthPage({ signup = false }: { signup?: boolean }) {
  return (
    <SiteLayout>
      <section className="mx-auto grid min-h-[70vh] max-w-5xl items-center gap-10 px-5 py-14 lg:grid-cols-2">
        <div className="hidden lg:block">
          <p className="font-mono text-xs uppercase tracking-[.16em] text-primary">Matris .mat</p>
          <h1 className="mt-4 font-display text-5xl font-semibold">
            Sua evolução começa com uma aula.
          </h1>
          <p className="mt-4 text-muted-foreground">
            Acesso demonstrativo. Nenhuma conta real será criada nesta versão.
          </p>
        </div>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="rounded-lg border border-border bg-card p-6 sm:p-8"
        >
          <h2 className="font-display text-3xl">{signup ? "Criar conta" : "Entrar"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Protótipo visual — dados não serão enviados.
          </p>
          <div className="mt-6 space-y-4">
            {signup && (
              <Field label="Nome">
                <Input placeholder="Seu nome" />
              </Field>
            )}
            <Field label="E-mail">
              <Input type="email" placeholder="voce@email.com" />
            </Field>
            <Field label="Senha">
              <Input type="password" placeholder="••••••••" />
            </Field>
            {signup && (
              <Field label="Confirmar senha">
                <Input type="password" placeholder="••••••••" />
              </Field>
            )}
          </div>
          <Button className="mt-6 h-11 w-full rounded-full">
            {signup ? "Criar conta" : "Entrar"}
          </Button>
          <div className="mt-5 flex justify-between text-sm">
            {!signup && (
              <a href="#" className="text-muted-foreground">
                Esqueci minha senha
              </a>
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
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
export function SettingsPage() {
  const [lang, setLang] = useState("pt");
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("matris-language");
    if (saved && ["pt", "en", "es", "it"].includes(saved)) setLang(saved);
  }, []);

  const selectLanguage = (code: string) => {
    setLang(code);
    localStorage.setItem("matris-language", code);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Preferências"
        title="Configurações"
        description="Personalize a aparência e as preferências desta plataforma."
      />
      <section className="mx-auto max-w-3xl space-y-5 px-4 pb-16 sm:px-6">
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm sm:p-7">
          <h2 className="font-display text-2xl">Tema</h2>
          <div className="mt-4 flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">Alternar entre claro e escuro</span>
            <ThemeToggle />
          </div>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm sm:p-7">
          <h2 className="font-display text-2xl">Idioma</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A interface está disponível em Português (Brasil). Outros idiomas serão liberados quando a tradução estiver completa.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {(
              [
                ["pt", "BR", "Português"],
                ["en", "US", "English"],
                ["es", "ES", "Español"],
                ["it", "IT", "Italiano"],
              ] as const
            ).map(([code, country, name]) => (
              <button
                key={code}
                type="button"
                aria-pressed={lang === code}
                disabled={code !== "pt"}
                onClick={() => selectLanguage(code)}
                className={`flex min-h-12 items-center gap-3 rounded-xl border p-3.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 ${lang === code ? "border-primary bg-primary/10 shadow-sm" : "border-border/80 hover:bg-muted/60"}`}
              >
                <Flag country={country} />
                <span>{name}</span>
                {code !== "pt" && <span className="ml-auto text-xs text-muted-foreground">Em breve</span>}
                {lang === code && (
                  <Check aria-hidden="true" className="ml-auto size-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button asChild variant="outline" className="justify-start">
            <Link to="/perfil">
              <User aria-hidden="true" />
              Perfil
            </Link>
          </Button>
          <Button
            variant="outline"
            disabled={!user || signingOut}
            onClick={handleSignOut}
            className="justify-start text-destructive"
          >
            <LogOut aria-hidden="true" />
            {signingOut ? "Saindo…" : "Sair"}
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
function Flag({ country }: { country: "BR" | "US" | "ES" | "IT" }) {
  const common = {
    viewBox: "0 0 28 20",
    className: "h-5 w-7 shrink-0 rounded-sm border border-border",
    role: "img" as const,
    "aria-label": `Bandeira ${country}`,
  };
  if (country === "BR")
    return (
      <svg {...common}>
        <rect width="28" height="20" fill="#229E45" />
        <path d="M14 2.5 25 10 14 17.5 3 10Z" fill="#F8D447" />
        <circle cx="14" cy="10" r="4.1" fill="#2454A4" />
        <path d="M10.4 8.8c2.4-.7 5.1-.2 7.2 1.2" fill="none" stroke="#fff" strokeWidth=".8" />
      </svg>
    );
  if (country === "US")
    return (
      <svg {...common}>
        {Array.from({ length: 13 }, (_, i) => (
          <rect
            key={i}
            y={(i * 20) / 13}
            width="28"
            height={20 / 13}
            fill={i % 2 ? "#fff" : "#C83A48"}
          />
        ))}
        <rect width="12" height="10.8" fill="#244575" />
        {Array.from({ length: 9 }, (_, i) => (
          <circle
            key={i}
            cx={1.5 + (i % 3) * 4}
            cy={1.4 + Math.floor(i / 3) * 3.5}
            r=".55"
            fill="#fff"
          />
        ))}
      </svg>
    );
  if (country === "ES")
    return (
      <svg {...common}>
        <rect width="28" height="20" fill="#AA151B" />
        <rect y="5" width="28" height="10" fill="#F1BF00" />
        <rect x="7" y="7" width="2" height="6" rx=".3" fill="#AA151B" />
      </svg>
    );
  return (
    <svg {...common}>
      <rect width="9.34" height="20" fill="#15945A" />
      <rect x="9.33" width="9.34" height="20" fill="#fff" />
      <rect x="18.66" width="9.34" height="20" fill="#D83B45" />
    </svg>
  );
}

export function AboutPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Sobre o Matris"
        title="Clareza antes da complexidade."
        description="Uma plataforma em desenvolvimento para organizar o aprendizado de Matemática, da base aos conteúdos avançados."
      />
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <div className="matris-surface grid gap-6 p-6 sm:p-8 md:grid-cols-[auto_1fr] md:items-start">
          <div className="grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="size-8" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-2xl">Aprender com organização e método</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              O Matris reúne aulas, trilhas de estudo e ferramentas para acompanhar o progresso.
              O catálogo e algumas experiências ainda estão em preparação; os conteúdos disponíveis
              são identificados na própria plataforma.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Informações sobre professores e equipe serão publicadas aqui quando forem confirmadas.
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
export function ContactPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Contato"
        title="Fale com a equipe do Matris"
        description="Os canais oficiais serão publicados assim que forem configurados. Não exibimos endereços ou perfis fictícios."
      />
      <section className="mx-auto max-w-4xl px-5 pb-16 sm:px-6">
        <div className="matris-surface flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:p-8">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Mail aria-hidden="true" className="size-6" />
          </span>
          <div>
            <h2 className="font-display text-xl">Canais em configuração</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              WhatsApp, e-mail e redes sociais serão disponibilizados nesta página quando os dados
              oficiais forem definidos pelo responsável pelo projeto.
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
function Contact({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex min-h-36 flex-col items-center rounded-lg border border-border bg-card p-5 text-center">
      {icon}
      <strong className="mt-3">{title}</strong>
      <span className="mt-2 whitespace-normal text-xs text-muted-foreground">{text}</span>
      <span className="mt-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        Link a configurar
      </span>
    </div>
  );
}
