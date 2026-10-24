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

## Zasady realizmu copywritingu (Antki / Native Ads) i spójności Fanpage’a — 24 października 2026

1. **Realizm motywu „kartki od lekarza / eksperta”:**
   - Gdy w long-form copy (Antki / historie natywne) pojawia się motyw kartki od lekarza, weterynarza, fizjoterapeuty lub innego eksperta, którą bohater wpisuje później w Google, lekarz zapisuje na kartce **wyłącznie nazwy mechanizmów biologicznych, jednostek chorobowych, składników lub samą nazwę własną produktu** (np. `„dyfuzor Feliora”`, `„biomimetyczny dyfuzor feromonowy matczyny kompleks M.A.P. F3”`).
   - Lekarz **nigdy** nie zapisuje pacjentowi na kartce konsumenckich fraz wyszukiwarkowych typu `„dyfuzor Feliora opinie”`, `„... cena”` czy `„... recenzje”`. Jeśli w historii pojawia się szukanie opinii, musi wynikać z narracji, że to sam bohater dopisał słowo `opinie` w wyszukiwarce.

2. **Weryfikacja perspektywy narratora przed przypisaniem Fanpage’a (Authority vs. Klient):**
   - Zawsze przed przypisaniem lub przeniesieniem kreacji reklamowej na fanpage autorytetu/eksperta (np. lekarza, weterynarza, fizjoterapeuty) najpierw przeczytaj cały `Primary Text` i zweryfikuj osobę oraz rodzaj gramatyczny narratora.
   - Nigdy nie przypisuj pierwszoosobowej historii pisanej z perspektywy klienta/opiekunki (`1. os. r. żeński/męski klienta`) bezpośrednio do fanpage’a lekarza/eksperta (ani odwrotnie) bez uprzedniego dostosowania głosu narracji.


## Generowanie obrazków Kie.ai i kreacje A/B — stałe zasady użytkownika, 24 października 2026

1. **Maksymalnie 3 zdjęcia tej samej sceny:** Nigdy nie generuj 20–30 identycznych lub prawie takich samych zdjęć powtarzalnej sceny (np. tych samych stóp, misek z wodą, przedpokoju) osobno dla każdego kąta. Wystarczą maksymalnie **3 mocne warianty** danej sceny współdzielone w bibliotece. Przed wysłaniem zadań do Kie.ai zawsze sprawdzaj w bazie, czy dana scena ma już 3 wygenerowane warianty.
2. **Model Kie.ai:** Domyślnym modelem w Kie.ai jest `nano-banana-pro` (`aspect_ratio: '1:1'`, `resolution: '1K'`, z przekazywaniem zdjęcia referencyjnego produktu w `image_input`). Nie używaj `flux-2/pro-text-to-image`, bo ignoruje `image_input` i zniekształca wygląd produktu.
3. **Zero automatycznego przepalania kredytów w tle:** Nigdy nie dodawaj w komponentach frontendowych (`useEffect`) ani skryptach w tle automatycznych pętli generujących zdjęcia w Kie.ai przy otwarciu strony. Generowanie może ruszyć wyłącznie po jawnym żądaniu (`isManual: true`).
4. **Sloty `Ustaw A` i `Ustaw B`:** `Ustaw A` aktualizuje wyłącznie slot 1 (`imageUrl`), a `Ustaw B` wyłącznie slot 2 (`secondImageUrl`) — nigdy nie czyść drugiego slotu przy zmianie pierwszego i nigdy nie nadpisuj zapisanego wyboru użytkownika domyślnym fallbackiem.
5. **Estetyka zdjęć (naturalne i neutralne, zero ohydy i rozmycia):** Zdjęcia z Kie.ai mają wyglądać jak normalne, czyste, codzienne zdjęcie zrobione telefonem w zadbanym polskim mieszkaniu (`natural, neutral everyday smartphone photo in a tidy Polish home, clean and pleasant to look at, clear focus, balanced indoor lighting`). Nigdy nie dodawaj do promptów słów typu `ugly`, `shit quality`, `out of focus`, `motion blur`, `muddy shadows`, ani drastycznych, obrzydliwych lub odpychających detali wizualnych (krwi, wielkich brudnych plam, ran do żywego mięsa), na które źle się patrzy w feedzie.

