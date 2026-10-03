<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep all prototype content in centralized mock-data modules so future backend replacement does not alter presentation components.
- Public pages share the root site shell; teacher management uses a dedicated responsive dashboard shell.
- Model study content as trail, discipline, module, topic, lesson, and exercise relationships; keep progress aggregation in shared data utilities so presentation never invents or recalculates it.
