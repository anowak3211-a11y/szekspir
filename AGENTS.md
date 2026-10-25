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



## Generowanie obrazków Kie.ai i kreacje A/B - zasada z 25 października 2026 (Raw iPhone 3:4 · styl NHS/NFZ)

1. **Silnik i format:** Domyślnym silnikiem natywnych zdjęć w Szekspirze (`/native-images`, `/antki/[id]`, `/antki-pl` -> Sardian, Feliora, Orthomax) jest `lib/native-iphone-scenes.ts` na modelu `nano-banana-pro` (Google AI) w pionowym formacie `aspect_ratio: '3:4'`, `resolution: '2K'` (`1792 x 2400`).
2. **Czytanie pełnego `skrypt.txt` i 12-15 scen:** Każda paczka powstaje z pełnego tekstu reklamy (`skrypt.txt` + opcjonalnie `instruction.txt`) i obejmuje realnych, nieupiększonych ludzi 55-75 lat, selfie specjalisty/lekarza NHS (UK) lub NFZ/Poradni (PL) z ręki pod światło okna/jarzeniówki, fizyczny objaw, wyrzucanie nieskutecznych preparatów do kuchennego kosza, zdjęcie monitora w gabinecie, pogniecioną kartkę w zaparkowanym aucie oraz chaotyczny bałagan na umywalce/blacie. Referencję produktową `image_input` dołączaj wyłącznie do ostatniego kadru produktu w ruchu, aby pozostałe kadry były w 100% czystym `text-to-image` z rolki aparatu.
3. **Twarde zakazy wizualne:** Zero graficznych rzutów 90° flat-lay z żółtymi karteczkami Post-it lub podkładkami („Wzór Noom”), zero dzielonych kolaży Przed/Po z datami (ryzyko bana na Meta Ads), zero studyjnego bokeh i ciepłego oświetlenia AI. Wymuszaj optyczne niedoskonałości iPhone'a (`blown-out window flare`, jarzeniówki `4000K`, bezpośredni flesz, pełna ostrość tła).
4. **Zero automatycznego przepalania kredytów w tle i niezależne sloty A/B:** Generowanie startuje wyłącznie na jawne żądanie użytkownika (`isManual: true`), a sloty `Ustaw A` i `Ustaw B` nigdy nie nadpisują siebie nawzajem.


