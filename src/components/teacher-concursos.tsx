import { useCallback, useEffect, useState, type FormEvent } from "react";
import { FolderPlus, Pencil, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";
import { useConcursos, type Concurso } from "@/hooks/usePlatformData";

type ContestForm = {
  name: string;
  full_name: string;
  category: string;
  description: string;
  subjects: string;
};

const blankForm: ContestForm = {
  name: "",
  full_name: "",
  category: "Militar",
  description: "",
  subjects: "",
};

const makeSlug = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function TeacherConcursosManager() {
  const { user, profile, loading: authLoading } = useAuth();
  const { concursos, loading, error: loadError, refetch } = useConcursos();
  const [editing, setEditing] = useState<Concurso | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ContestForm>(blankForm);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const ownContests = concursos.filter((contest) => (contest as Concurso & { teacher_id?: string }).teacher_id === user?.id);

  const reset = () => {
    setEditing(null);
    setFormOpen(false);
    setForm(blankForm);
    setStatus("");
  };

  const edit = (contest: Concurso) => {
    setEditing(contest);
    setFormOpen(true);
    setForm({
      name: contest.name,
      full_name: contest.full_name ?? "",
      category: contest.category || "Militar",
      description: contest.description ?? "",
      subjects: (contest.subjects ?? []).join(", "),
    });
    setStatus("");
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || profile?.role !== "teacher") return;
    const name = form.name.trim();
    const slug = makeSlug(name);
    const subjects = [...new Set(form.subjects.split(",").map((value) => value.trim()).filter(Boolean))];
    if (name.length < 2 || !slug) {
      setStatus("Informe um nome válido para o concurso.");
      return;
    }
    if (!subjects.length) {
      setStatus("Informe pelo menos uma matéria, separada por vírgula.");
      return;
    }
    setBusy(true);
    setStatus("");
    try {
      const payload = {
        name,
        slug,
        title: name,
        full_name: form.full_name.trim() || name,
        category: form.category,
        description: form.description.trim(),
        subjects,
        teacher_id: user.id,
      };
      const result = editing
        ? await supabase.from("concursos").update(payload).eq("id", editing.id).eq("teacher_id", user.id)
        : await supabase.from("concursos").insert(payload);
      if (result.error) throw result.error;
      setStatus(editing ? "Concurso atualizado." : "Pasta de concurso criada.");
      setEditing(null);
      setFormOpen(false);
      setForm(blankForm);
      await refetch();
    } catch {
      setStatus("Não foi possível salvar. Confira os dados e suas permissões.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (contest: Concurso) => {
    if (!user || !window.confirm(`Excluir a pasta “${contest.name}”? As aulas vinculadas ficarão sem concurso associado.`)) return;
    setBusy(true);
    setStatus("");
    try {
      const result = await supabase.from("concursos").delete().eq("id", contest.id).eq("teacher_id", user.id);
      if (result.error) throw result.error;
      if (editing?.id === contest.id) reset();
      setStatus("Pasta excluída.");
      await refetch();
    } catch {
      setStatus("Não foi possível excluir a pasta. Verifique se há aulas ou vínculos que impeçam a exclusão.");
    } finally {
      setBusy(false);
    }
  };

  if (authLoading || profile?.role !== "teacher") return null;

  return (
    <section className="mt-7 rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[.14em] text-primary">Biblioteca de concursos</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">Pastas de concursos</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Crie pastas militares ou civis, defina as matérias e depois vincule cada aula à pasta correspondente.
          </p>
        </div>
        {!formOpen && (
          <Button type="button" onClick={() => { setForm(blankForm); setFormOpen(true); setStatus(""); }} className="shrink-0 rounded-full">
            <FolderPlus aria-hidden="true" className="mr-2 size-4" /> Nova pasta
          </Button>
        )}
      </div>

      {!hasSupabaseConfig && <p className="mt-4 text-sm text-muted-foreground">Conecte o catálogo para salvar pastas.</p>}
      {(status || loadError) && (
        <p role={loadError ? "alert" : "status"} className="mt-4 rounded-xl border border-border p-3 text-sm">
          {loadError || status}
        </p>
      )}

      {formOpen && <form onSubmit={save} className="mt-5 grid gap-4 rounded-xl border border-border bg-background/60 p-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Nome curto do concurso *
          <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} placeholder="Ex.: ESA, EsPCEx, Polícia Federal" required />
        </label>
        <label className="block text-sm font-medium">
          Categoria *
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="Militar">Concurso militar</option>
            <option value="Civil">Concurso civil</option>
          </select>
        </label>
        <label className="block text-sm font-medium sm:col-span-2">
          Nome completo (opcional)
          <Input className="mt-1" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} maxLength={180} placeholder="Ex.: Escola de Sargentos das Armas" />
        </label>
        <label className="block text-sm font-medium sm:col-span-2">
          Descrição
          <Textarea className="mt-1" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={800} rows={2} placeholder="Breve descrição do concurso e da preparação." />
        </label>
        <label className="block text-sm font-medium sm:col-span-2">
          Matérias da pasta *
          <Input className="mt-1" value={form.subjects} onChange={(e) => setForm({ ...form, subjects: e.target.value })} placeholder="Matemática, Português, Física, História..." required />
          <span className="mt-1 block text-xs font-normal text-muted-foreground">Separe as matérias por vírgula. Você poderá vincular aulas a esta pasta no gerenciamento de aulas.</span>
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button type="submit" disabled={busy || !hasSupabaseConfig || form.name.trim().length < 2 || !form.subjects.trim()}>
            <Save aria-hidden="true" className="mr-2 size-4" /> {busy ? "Salvando…" : editing ? "Salvar alterações" : "Criar pasta"}
          </Button>
          {(editing || form.name || form.full_name || form.description || form.subjects) && (
            <Button type="button" variant="outline" disabled={busy} onClick={reset}>
              <X aria-hidden="true" className="mr-2 size-4" /> Cancelar
            </Button>
          )}
        </div>
      </form>}

      <div className="mt-6 space-y-3">
        <h3 className="font-semibold">Pastas cadastradas</h3>
        {loading ? (
          <p role="status" className="py-4 text-sm text-muted-foreground">Carregando pastas…</p>
        ) : ownContests.length ? ownContests.map((contest) => (
          <article key={contest.id} className="flex flex-col gap-3 rounded-xl border border-border/80 p-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{contest.name}</h3>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">{contest.category}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{contest.full_name}</p>
              <p className="mt-2 text-xs text-muted-foreground">{(contest.subjects ?? []).join(" · ")}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => edit(contest)}><Pencil aria-hidden="true" className="mr-1.5 size-4" /> Editar</Button>
              <Button type="button" size="sm" variant="outline" disabled={busy} className="text-destructive" onClick={() => void remove(contest)}><Trash2 aria-hidden="true" className="mr-1.5 size-4" /> Excluir</Button>
            </div>
          </article>
        )) : (
          <p className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">Você ainda não criou pastas. Cadastre uma pasta militar ou civil acima.</p>
        )}
      </div>
    </section>
  );
}
