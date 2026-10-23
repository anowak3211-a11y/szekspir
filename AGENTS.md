<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## SZEKSPIR project rules

VMake: retain the legacy API. The owner explicitly prohibits switching to the new API. Never accept account migration or replace the integration with the new API as part of fixes, SDK updates, deployments or limit increases. Generic permission to fix/deploy does not override this prohibition. Migration permanently ends legacy access.

Read `docs/HANDOFF.md` before changes. Follow the user requirements listed there. Run `npm run typecheck` and relevant offline tests. Keep secrets and private operational data out of this public repository. Never run live Sheet mutations, migrations or paid provider tests as routine verification. Update handoff documentation when behavior or setup changes.

## Publikacja Szekspira — stała zasada użytkownika, 13 października 2026

Przy każdej publikacji lub uploadzie zmian Szekspira aktualizuj zarówno działającą stronę na Vercelu, jak i repozytorium GitHub: commit oraz zwykły push do właściwej gałęzi po wymaganych sprawdzeniach. Nie kończ na samym deployu. Użytkownik wyraźnie potwierdził „na repo też uploaduj. zawsze”; ta stała autoryzacja zastępuje starsze wymaganie czekania na koniec sesji lub osobne polecenie push. Zachowuj sekrety i prywatne materiały poza repozytorium; nie używaj force push.

## Generowanie obrazków Kie.ai i kreacje A/B — stałe zasady użytkownika, 24 października 2026

1. **Maksymalnie 3 zdjęcia tej samej sceny:** Nigdy nie generuj 20–30 identycznych lub prawie takich samych zdjęć powtarzalnej sceny (np. tych samych stóp, misek z wodą, przedpokoju) osobno dla każdego kąta. Wystarczą maksymalnie **3 mocne warianty** danej sceny współdzielone w bibliotece. Przed wysłaniem zadań do Kie.ai zawsze sprawdzaj w bazie, czy dana scena ma już 3 wygenerowane warianty.
2. **Model Kie.ai:** Domyślnym modelem text-to-image w Kie.ai jest `flux-2/pro-text-to-image` (`aspect_ratio: '1:1'`, `resolution: '1K'`). Nie przełączaj z powrotem na droższy `nano-banana-pro` bez wyraźnego polecenia użytkownika.
3. **Zero automatycznego przepalania kredytów w tle:** Nigdy nie dodawaj w komponentach frontendowych (`useEffect`) ani skryptach w tle automatycznych pętli generujących zdjęcia w Kie.ai przy otwarciu strony. Generowanie może ruszyć wyłącznie po jawnym żądaniu (`isManual: true`).
4. **Sloty `Ustaw A` i `Ustaw B`:** `Ustaw A` aktualizuje wyłącznie slot 1 (`imageUrl`), a `Ustaw B` wyłącznie slot 2 (`secondImageUrl`) — nigdy nie czyść drugiego slotu przy zmianie pierwszego i nigdy nie nadpisuj zapisanego wyboru użytkownika domyślnym fallbackiem.

