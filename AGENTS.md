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

3. **Wyłącznie cyfry dla liczb w copy reklamowym (zero liczebników słownych):**
   - W copy reklamowym (`Primary Text`, `Headline`, `Description`) **zawsze zapisuj liczby, wiek, czas, odległości, kwoty, godziny i ilości cyframi** (np. `64 lata`, `85`, `po 30 latach`, `2 palce`, `o 6:00 rano`, `11 opasek`), nigdy słownie (`sześćdziesiąt cztery`, `trzydziestu`, `jedenaście`), z zachowaniem wyłącznie naturalnych związków frazeologicznych (np. `miał dwie lewe nogi`, `w czterech ścianach`).

4. **Samodzielne, naturalne polskie nagłówki (`Headline`) na pasku linku:**
   - Nigdy nie używaj wyrwanych z kontekstu, kalekich tłumaczeń z angielskiego typu `„Nie poprawiła go.”`, `„Wrócił na górę do łóżka.”` czy `„Żona zadzwoniła po mojego brata do mojej drabiny.”`. Każdy `Headline` musi być pełnym, naturalnie brzmiącym po polsku zdaniem z natychmiastowym sensem i hookiem.

5. **Zero naciąganych zbiegów okoliczności w stylu AI:**
   - Usuwaj z adaptacji zagranicznych kreacji sztuczne, filmowe zbiegi okoliczności (np. drugi identyczny niemal-wypadek na tym samym parkingu na oczach tego samego sprzedawcy). Zakończenia muszą być przyziemne i w 100% wiarygodne życiowo.

6. **Zero sztucznych, hiper-dokładnych godzin/dat w stylu AI i 100% polskich realiów (NFZ, wiek pokoleń, historia):**
   - Nigdy nie wstawiaj do narracji robotycznych godzin co do minuty ani pamiętnikowych dat dziennych, których żaden człowiek nie pamięta po czasie (np. `„Zamówiłam opaskę o 3:10 w nocy”`, `„Wtorek, 12 maja. Godzina 2:40 w nocy”`, `„o 9:14”`, `„o 5:50”`, `„przez 38 dni”`). Używaj naturalnych polskich określeń pory dnia (`w środku nocy`, `nad ranem`, `po południu`, `po 5 tygodniach`) lub zwykłych pełnych godzin przy stałych nawykach (`o 6:00 rano`, `od 9:00 do 18:00`).
   - Zawsze lokalizuj realia systemowe, historyczne i pokoleniowe do Polski: kolejki medyczne to **kolejka na NFZ** (nigdy kalki z NHS typu `„wpisany na listę oczekujących”`), polska historia gospodarcza (działalność prywatna od 1989/1990 r., wiek emerytalny 60/65 lat), polskie zwyczaje (stypa w restauracji pod cmentarzem zamiast kanapek na dywanie w sali parafialnej, altanka ROD) oraz realistyczne relacje wiekowe (u ~75-latka mały **wnuk**, nie `prawnuk`).

7. **Zero „wygładzania” i osłabiania pazura Direct Response przy lokalizacji:**
   - Podczas lokalizacji zagranicznego copy zmieniaj **wyłącznie** obce realia kulturowe/historyczne, kalki językowe, liczebniki słowne i sztuczne daty/godziny. **Nigdy** nie zmiękczaj mocnych hooków (*pattern interrupts*, np. `„Przyłapałem żonę z moim bratem”`), kątów wspólnego wroga (np. wewnętrzny mail z branży ortopedycznej) ani krótkich, szorstkich, emocjonalnych zdań i dialogów w `Primary Text` (`„To nie patrz. Nie patrzyła.”`, `„Nie uciekło. Na 4.”`, `„Patrzył na jej stopy.”`, `„na własnym tyłku”`).



## Generowanie obrazków Kie.ai i kreacje A/B — stałe zasady użytkownika, 24 października 2026

1. **Maksymalnie 3 zdjęcia tej samej sceny:** Nigdy nie generuj 20–30 identycznych lub prawie takich samych zdjęć powtarzalnej sceny (np. tych samych stóp, misek z wodą, przedpokoju) osobno dla każdego kąta. Wystarczą maksymalnie **3 mocne warianty** danej sceny współdzielone w bibliotece. Przed wysłaniem zadań do Kie.ai zawsze sprawdzaj w bazie, czy dana scena ma już 3 wygenerowane warianty.
2. **Model Kie.ai:** Domyślnym modelem w Kie.ai jest `nano-banana-pro` (`aspect_ratio: '1:1'`, `resolution: '1K'`, z przekazywaniem zdjęcia referencyjnego produktu w `image_input`). Nie używaj `flux-2/pro-text-to-image`, bo ignoruje `image_input` i zniekształca wygląd produktu.
3. **Zero automatycznego przepalania kredytów w tle:** Nigdy nie dodawaj w komponentach frontendowych (`useEffect`) ani skryptach w tle automatycznych pętli generujących zdjęcia w Kie.ai przy otwarciu strony. Generowanie może ruszyć wyłącznie po jawnym żądaniu (`isManual: true`).
4. **Sloty `Ustaw A` i `Ustaw B`:** `Ustaw A` aktualizuje wyłącznie slot 1 (`imageUrl`), a `Ustaw B` wyłącznie slot 2 (`secondImageUrl`) — nigdy nie czyść drugiego slotu przy zmianie pierwszego i nigdy nie nadpisuj zapisanego wyboru użytkownika domyślnym fallbackiem.
5. **Wzór promptowania 1:1 jak w Opasce PL (Stryde) + zero drastycznych/obrzydliwych motywów:** Wszystkie marki (Stryde, Feliora, OrthoMax) mają używać dokładnie tego samego zwięzłego wzorca promptu co Opaska na kolano (`Stryde PL`) na modelu `nano-banana-pro`:
   - Konkretny opis sceny w `First-person POV amateur smartphone photo...` lub `Amateur smartphone photo inside a dim Polish...`
   - Dopisek stylu: `Raw, unpolished amateur smartphone snapshot, visible high-ISO sensor grain, candid framing, natural Polish home lighting. STRICT BAN: zero AI glow, zero studio lighting, zero bokeh.` (a dla rzutów 90° na stół: `90-degree flat-lay tabletop filling 100% of the frame, SUMA PLN, zero AI glow`).
   - Jednocześnie w samych opisach scen (szczególnie w Feliorze) zero obrzydliwych/drastycznych detali typu krew na rękach, wielkie brudne plamy moczu czy rany do żywego mięsa — tylko fizyczne przedmioty, polskie wnętrza (schody, taśma malarska na stopniu, nakolanniki na gwoździu, kot w kuwecie, siatka w drzwiach) w autentycznym polskim klimacie.

