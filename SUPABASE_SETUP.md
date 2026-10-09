# Matris + Supabase

A plataforma usa React/Vite/TanStack e Supabase para autenticação e dados.

## Configuração local

1. Crie ou selecione o projeto Supabase.
2. Aplique as migrations em `supabase/migrations/` na ordem cronológica. Se estiver configurando o banco do zero, confira também o SQL base indicado pelo histórico do projeto antes de aplicar as migrations incrementais.
3. Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. Nunca use a chave `service_role` no frontend.
4. Crie a primeira conta normalmente. Novos usuários devem entrar como `student`.
5. Para promover o primeiro professor, faça a alteração de função por um procedimento administrativo seguro no Supabase, usando uma sessão administrativa autorizada. Não exponha credenciais administrativas no navegador.

## Funcionalidades

- autenticação e perfil
- catálogo de aulas e player do YouTube
- progresso por aula, avaliações e comentários
- respostas de professores a comentários das próprias aulas
- metas semanais
- painel do professor com criação, edição e exclusão das próprias aulas
- avisos publicados por professores
- trilhas por nível e concursos
- políticas RLS e funções de autorização

## Recuperação de senha

No painel do Supabase, abra **Authentication → URL Configuration** e inclua as URLs usadas pelo projeto na lista de redirect URLs, incluindo:

- `https://calculus-crafted-curriculum.lovable.app/redefinir-senha`
- `http://localhost:5173/redefinir-senha` (desenvolvimento local, se aplicável)

Confirme também o Site URL configurado para o ambiente publicado.

## Segurança recomendada

- Mantenha RLS habilitado nas tabelas expostas.
- Nunca coloque a chave `service_role` no frontend ou em variáveis `VITE_*`.
- A função `set_user_role(uuid,text)` está restrita a `service_role`; não a chame diretamente a partir do navegador.
- O trigger de perfil impede que um usuário altere a própria função.
- Em **Authentication → Settings / Security and Protection**, ative a proteção contra senhas vazadas, se disponível no plano do projeto.
- Revise periodicamente os avisos do Security Advisor. Funções `SECURITY DEFINER` como `is_teacher()` e `reply_to_comment()` precisam permanecer estritamente limitadas e validar permissões internamente.

## Qualidade do frontend

O workflow do GitHub Actions executa build, lint e testes. Ele formata os quatro arquivos principais que foram alterados e grava a formatação no branch `main` antes de executar as verificações.
