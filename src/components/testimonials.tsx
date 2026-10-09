import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, Pencil, Plus, Quote, Save, Trash2, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";

type Testimonial = {
  id: string;
  name: string;
  role: string | null;
  content: string;
  avatar_url: string | null;
  exam_name: string | null;
  teacher_id: string | null;
  is_published: boolean;
  created_at: string;
};

type TestimonialForm = {
  name: string;
  exam_name: string;
  role: string;
  content: string;
  avatar_url: string;
  is_published: boolean;
};

const emptyForm: TestimonialForm = {
  name: "",
  exam_name: "",
  role: "",
  content: "",
  avatar_url: "",
  is_published: false,
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase("pt-BR");
}

export function TestimonialsSection() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!hasSupabaseConfig) {
      setItems([]);
      setLoading(false);
      return () => {
        active = false;
      };
    }
    supabase
      .from("testimonials")
      .select("id,name,role,content,avatar_url,exam_name,teacher_id,is_published,created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data, error: queryError }) => {
        if (!active) return;
        if (queryError) {
          setError("Não foi possível carregar as histórias de aprovação.");
          setItems([]);
        } else {
          setItems((data ?? []) as Testimonial[]);
        }
      })
      .catch(() => {
        if (active) setError("Ocorreu uma falha ao carregar as histórias de aprovação.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!hasSupabaseConfig || (!loading && !error && items.length === 0)) return null;

  return (
    <section aria-labelledby="approval-stories-title" className="mx-auto max-w-7xl px-5 py-12 sm:px-6">
      <div className="mb-7 max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[.14em] text-primary">Resultados reais</p>
        <h2 id="approval-stories-title" className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
          Histórias de aprovação
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Cada conquista tem uma história de dedicação. Conheça alunos que alcançaram seus objetivos.
        </p>
      </div>
      {loading ? (
        <p role="status" className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
          Carregando depoimentos…
        </p>
      ) : error ? (
        <p role="alert" className="rounded-2xl border border-destructive/30 bg-card p-5 text-sm text-muted-foreground">
          {error}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="flex h-full flex-col rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-6">
              <Quote aria-hidden="true" className="size-7 text-primary/70" />
              <p className="mt-4 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                “{item.content}”
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-border/70 pt-4">
                {item.avatar_url ? (
                  <img src={item.avatar_url} alt="" loading="lazy" className="size-11 rounded-full border border-border object-cover" />
                ) : (
                  <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {initials(item.name) || "A"}
                  </span>
                )}
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{item.name}</h3>
                  {item.role && <p className="truncate text-xs text-muted-foreground">{item.role}</p>}
                  {item.exam_name && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-primary">
                      <Trophy aria-hidden="true" className="size-3.5 shrink-0" />
                      <span className="truncate">{item.exam_name}</span>
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function TeacherTestimonialsManager() {
  const { user, profile, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<TestimonialForm>(emptyForm);

  const load = useCallback(async () => {
    if (!user || profile?.role !== "teacher" || !hasSupabaseConfig) {
      setItems([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data, error: queryError } = await supabase
        .from("testimonials")
        .select("id,name,role,content,avatar_url,exam_name,teacher_id,is_published,created_at")
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false });
      if (queryError) throw queryError;
      setItems((data ?? []) as Testimonial[]);
    } catch {
      setError("Não foi possível carregar os depoimentos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [user, profile?.role]);

  useEffect(() => {
    void load();
  }, [load]);

  if (authLoading || profile?.role !== "teacher") return null;

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormOpen(false);
    setError("");
    setNotice("");
  };

  const edit = (item: Testimonial) => {
    setEditingId(item.id);
    setFormOpen(true);
    setForm({
      name: item.name,
      exam_name: item.exam_name ?? "",
      role: item.role ?? "",
      content: item.content,
      avatar_url: item.avatar_url ?? "",
      is_published: item.is_published,
    });
    setError("");
    setNotice("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || profile?.role !== "teacher") return;
    setSaving(true);
    setError("");
    setNotice("");
    const payload = {
      name: form.name.trim(),
      exam_name: form.exam_name.trim(),
      role: form.role.trim() || null,
      content: form.content.trim(),
      avatar_url: form.avatar_url.trim() || null,
      is_published: form.is_published,
      teacher_id: user.id,
    };
    try {
      const result = editingId
        ? await supabase.from("testimonials").update(payload).eq("id", editingId).eq("teacher_id", user.id)
        : await supabase.from("testimonials").insert(payload);
      if (result.error) throw result.error;
      setNotice(form.is_published ? "Depoimento salvo e publicado na página inicial." : "Depoimento salvo como rascunho.");
      setForm(emptyForm);
      setEditingId(null);
      setFormOpen(false);
      await load();
    } catch {
      setError("Não foi possível salvar. Confira os campos e tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (item: Testimonial) => {
    setError("");
    setNotice("");
    const { error: updateError } = await supabase
      .from("testimonials")
      .update({ is_published: !item.is_published })
      .eq("id", item.id)
      .eq("teacher_id", user?.id);
    if (updateError) {
      setError("Não foi possível alterar a publicação do depoimento.");
      return;
    }
    setNotice(item.is_published ? "Depoimento retirado da página inicial." : "Depoimento publicado na página inicial.");
    await load();
  };

  const remove = async (item: Testimonial) => {
    if (!user || !window.confirm(`Excluir o depoimento de ${item.name}?`)) return;
    setError("");
    setNotice("");
    const { error: deleteError } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", item.id)
      .eq("teacher_id", user.id);
    if (deleteError) {
      setError("Não foi possível excluir o depoimento.");
      return;
    }
    if (editingId === item.id) resetForm();
    setNotice("Depoimento excluído.");
    await load();
  };

  return (
    <section aria-labelledby="teacher-testimonials-title" className="mt-7 rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[.14em] text-primary">Página inicial</p>
          <h2 id="teacher-testimonials-title" className="mt-2 font-display text-2xl font-semibold">
            Depoimentos de aprovação
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Cadastre histórias de alunos aprovados em concursos. Só depoimentos publicados aparecem para o público.
          </p>
        </div>
        {!editingId && (
          <Button type="button" onClick={() => { setForm(emptyForm); setFormOpen(true); setError(""); setNotice(""); }} className="shrink-0 rounded-full">
            <Plus aria-hidden="true" className="mr-2 size-4" /> Novo depoimento
          </Button>
        )}
      </div>

      {(error || notice) && (
        <p role={error ? "alert" : "status"} className={`mt-4 rounded-xl border p-3 text-sm ${error ? "border-destructive/30 text-destructive" : "border-primary/20 bg-primary/5"}`}>
          {error || notice}
        </p>
      )}

      {formOpen && (
        <form onSubmit={submit} className="mt-6 grid gap-4 rounded-2xl border border-border bg-background/60 p-4 sm:grid-cols-2 sm:p-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Nome do aluno *</span>
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} maxLength={120} required placeholder="Ex.: João Silva" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Concurso em que foi aprovado *</span>
            <Input value={form.exam_name} onChange={(event) => setForm({ ...form, exam_name: event.target.value })} maxLength={160} required placeholder="Ex.: ESA — Escola de Sargentos das Armas" />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium">Cargo, classificação ou turma (opcional)</span>
            <Input value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} maxLength={120} placeholder="Ex.: Aprovado para a área geral" />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium">Depoimento *</span>
            <Textarea value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} minLength={10} maxLength={1800} rows={5} required placeholder="Conte brevemente a trajetória do aluno e como a preparação ajudou…" />
            <span className="mt-1 block text-right text-xs text-muted-foreground">{form.content.length}/1800</span>
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium">URL da foto (opcional)</span>
            <Input type="url" value={form.avatar_url} onChange={(event) => setForm({ ...form, avatar_url: event.target.value })} placeholder="https://…" />
          </label>
          <label className="flex items-start gap-3 rounded-xl border border-border p-3 sm:col-span-2">
            <input type="checkbox" checked={form.is_published} onChange={(event) => setForm({ ...form, is_published: event.target.checked })} className="mt-1 size-4 accent-primary" />
            <span>
              <span className="block text-sm font-medium">Publicar na página inicial</span>
              <span className="mt-1 block text-xs text-muted-foreground">Desmarcado: fica salvo como rascunho, visível apenas para o professor.</span>
            </span>
          </label>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Button type="submit" disabled={saving || form.name.trim().length < 2 || form.exam_name.trim().length < 2 || form.content.trim().length < 10} className="rounded-full">
              <Save aria-hidden="true" className="mr-2 size-4" /> {saving ? "Salvando…" : editingId ? "Salvar alterações" : "Salvar depoimento"}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm} className="rounded-full">
              <X aria-hidden="true" className="mr-2 size-4" /> Cancelar
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold">Depoimentos cadastrados</h3>
          <Button type="button" variant="ghost" size="sm" onClick={() => void load()} disabled={loading}>
            {loading ? "Atualizando…" : "Atualizar"}
          </Button>
        </div>
        {loading ? (
          <p role="status" className="py-4 text-sm text-muted-foreground">Carregando depoimentos…</p>
        ) : items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
            Você ainda não cadastrou depoimentos. Use “Novo depoimento” para adicionar o primeiro.
          </p>
        ) : (
          items.map((item) => (
            <article key={item.id} className="flex flex-col gap-4 rounded-xl border border-border/80 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-medium">{item.name}</h4>
                  <span className={`rounded-full px-2.5 py-1 text-xs ${item.is_published ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {item.is_published ? "Publicado" : "Rascunho"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.exam_name}{item.role ? ` · ${item.role}` : ""}</p>
                <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed">{item.content}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => void togglePublished(item)} aria-label={item.is_published ? "Retirar publicação" : "Publicar depoimento"}>
                  {item.is_published ? <EyeOff aria-hidden="true" className="mr-1.5 size-4" /> : <Eye aria-hidden="true" className="mr-1.5 size-4" />}
                  {item.is_published ? "Ocultar" : "Publicar"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => edit(item)} aria-label={`Editar depoimento de ${item.name}`}>
                  <Pencil aria-hidden="true" className="mr-1.5 size-4" /> Editar
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => void remove(item)} aria-label={`Excluir depoimento de ${item.name}`} className="text-destructive">
                  <Trash2 aria-hidden="true" className="mr-1.5 size-4" /> Excluir
                </Button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
