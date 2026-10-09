# Rodada incremental de melhorias do Matris

## Objetivo

Evoluir o protótipo atual sem reescrever a aplicação, sem backend novo e sem remover fluxos existentes. Esta rodada prioriza inconsistências reais, navegação de estudo e apresentação honesta dos dados demonstrativos.

## Escopo desta rodada

1. **Dados e progresso consistentes**
   - Ampliar o módulo central de dados demonstrativos com trilhas, hierarquia de conhecimento e relações entre aulas.
   - Criar utilitários únicos para normalizar e agregar progresso, evitando percentuais contraditórios.
   - Marcar explicitamente métricas, perfis, avaliações e atividades como demonstração; remover números sem fonte quando não agregarem à experiência.

2. **Página inicial mais clara**
   - Preservar a composição atual, reforçando o que é o Matris, para quem serve e como começar.
   - Adicionar uma jornada curta: Diagnóstico → Trilha → Aulas → Exercícios → Revisão → Simulados → Progresso.
   - Incluir “Começar diagnóstico” como ação demonstrativa e “Entrar na minha conta” apontando para o acesso existente.
   - Melhorar a apresentação das trilhas com nível, objetivo, estado do conteúdo e ação de início.

3. **Centro do aluno e continuidade de estudo**
   - Reorganizar o perfil como painel do aluno: próxima aula, progresso da trilha, plano do dia e áreas de desempenho/revisão/simulados.
   - Quando não houver dados reais, exibir estados vazios úteis em vez de métricas inventadas.

4. **Experiência da aula e árvore de conhecimento**
   - Adicionar breadcrumb da trilha até a aula, navegação anterior/próxima, indicação clara de conclusão e próximos passos.
   - Preparar um bloco demonstrativo de exercícios relacionados com tipo, dificuldade e objetivo pedagógico, sem implementar motor de questões.
   - Tratar aula inexistente com estado útil, sem substituir silenciosamente por outra aula.

5. **Concursos, estados e acabamento**
   - Não afirmar quantidades de disciplinas/editais sem dados reais; sinalizar conteúdos em preparação.
   - Criar componentes reutilizáveis para estados vazio, erro, carregamento e conteúdo demonstrativo, usando-os onde fizer sentido nesta rodada.
   - Traduzir estados globais de erro/404, corrigir foco de teclado, rótulos e controles sem destino.
   - Revisar mobile/tablet/desktop nas rotas principais e corrigir overflow ou áreas de toque inadequadas.

6. **Verificação**
   - Executar testes existentes e adicionar testes focados nos utilitários de progresso e navegação crítica.
   - Verificar as principais rotas no navegador em desktop e celular.
   - Confirmar build limpo, ausência de regressões e ausência de alterações no banco.

## Fora desta rodada

- Backend, autenticação real, migrations, pagamentos, IA, simulados funcionais, motor completo de exercícios e internacionalização integral.
- Páginas administrativas ainda sem destino serão apenas identificadas como indisponíveis nesta demonstração; não serão transformadas em módulos completos.

## Decisões técnicas

- Continuar com TanStack Start, React, Tailwind e os componentes atuais.
- Manter todo conteúdo demonstrativo no módulo central de dados, separado da apresentação.
- Não alterar banco: o projeto atual não possui conexão de dados configurada.
