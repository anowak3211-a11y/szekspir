# Kompendium Różnic: Amerykański (US) → Brytyjski (UK) Angielski
## Wersja dla silnika tłumaczącego reklamy natywne / Facebook Ads

Ten dokument jest zestawem reguł operacyjnych dla agenta AI, który tłumaczy teksty reklamowe z amerykańskiego na brytyjski angielski. Reguły są podzielone na dwie warstwy:

1. **Warstwa mechaniczna** — pisownia, interpunkcja, gramatyka, format liczb i dat (rzeczy, które da się zastosować niemal automatycznie).
2. **Warstwa redakcyjna** — ton głosu, dobór słownictwa emocjonalnego, zgodność z brytyjskimi regulacjami reklamowymi (rzeczy, które wymagają decyzji redakcyjnej, nie tylko podmiany słowa).

Agent powinien stosować obie warstwy łącznie. Sama podmiana pisowni (`color` → `colour`) bez dostosowania tonu i słownictwa daje tekst, który "pachnie" tłumaczeniem, a nie oryginalnie brytyjską reklamą.

---

## 1. Mikro-interpunkcja i typografia

| Zagadnienie | UK | US | Zastosowanie |
| :--- | :--- | :--- | :--- |
| Kropka a cudzysłów | Poza cudzysłowem: `He called it 'robust'.` | W środku: `He called it "robust."` | Cytaty klientów, recenzje w reklamie |
| Rodzaj cudzysłowu | Pojedynczy: `'text'` | Podwójny: `"text"` | Cała kopia reklamowa |
| Zagnieżdżenie | `'Zewnętrzny "wewnętrzny" tekst'` | `"Zewnętrzny 'wewnętrzny' tekst"` | Cytowanie w cytacie |
| Skróty tytułów | Bez kropki: **Mr**, **Dr**, **Ms**, **Mrs** | Z kropką: **Mr.**, **Dr.**, **Ms.**, **Mrs.** | Nagłówki, podpisy ekspertów |
| Skróty łacińskie | Bez kropek: **eg**, **ie**, **etc** | Z kropkami: **e.g.**, **i.e.**, **etc.** | Mikrokopia, disclaimer |
| Oxford comma | Rzadziej, tylko gdy koniecznie dla jasności | Standardowo przed ostatnim elementem listy | Listy korzyści produktu |
| Myślniki | Spaced en-dash: `Sales grew – despite the crisis – by 10%` | Unspaced em-dash: `Sales grew—despite the crisis—by 10%` | Long-form copy, caption |
| Przecinki w datach | Pomijane: `25 September` | Stosowane: `September 25,` | Daty promocji, wydarzeń |
| Hyphenation (łączenie wyrazów) | UK częściej łączy wyrazy złożone łącznikiem (np. `well-known`, `anti-ageing`, `co-ordinate`) | US częściej pisze razem lub rozdzielnie, bez łącznika (`wellknown`/`well known`, `anti-aging` ale rzadziej łącznik w ogóle) | Nazwy cech produktu, claimy |

**Zasada dla agenta:** jeśli oryginał US zawiera cytat w cudzysłowie z kropką w środku, przy konwersji przenieś kropkę poza cudzysłów, chyba że kropka jest faktyczną częścią cytowanej wypowiedzi.

---

## 2. Gramatyka i składnia

### Zgodność podmiotu z orzeczeniem
- **UK:** instytucje, marki, zespoły mogą brać liczbę mnogą, gdy mowa o ludziach, którzy je tworzą: `Our team are here to help.`
- **US:** zawsze liczba pojedyncza: `Our team is here to help.`
- W reklamach UK częściej humanizuje markę przez liczbę mnogą ("we care, our team are listening"), co brzmi bardziej osobiście. Agent może to wykorzystać świadomie, ale nie musi zmieniać każdego zdania — forma pojedyncza też jest poprawna w UK.

### Przyimki
| Konstrukcja | UK | US |
| :--- | :--- | :--- |
| Weekend | **at** the weekend | **on** the weekend |
| Pisanie do kogoś | write **to** me | write me |
| Formularze | fill **in** a form | fill **out** a form |
| Dostosowanie do czegoś | cater **for** | cater **to** |
| Praca w zespole | **in** a team | **on** a team |
| Kontakt telefoniczny | call us **on** 0800... | call us **at** (555)... |
| Różny od | different **from/to** | different **than** |
| Weekendowy czas wolny | **at** the weekend | **on** the weekend |

### Czas przeszły w UI, powiadomieniach i hasłach reklamowych
- **UK:** Present Perfect: `Your password has been changed.` / `We've just launched something new.`
- **US:** Past Simple: `Your password changed.` / `We just launched something new.`
- To ma znaczenie w nagłówkach typu "Mums have discovered..." (UK) vs "Moms discovered..." (US) — pierwsza forma brzmi bardziej jak coś trwającego/aktualnego, druga jak zamknięty fakt.

### "Got" vs "gotten"
- **UK:** `has got` (posiadanie), imiesłów `got`.
- **US:** `has gotten` jako imiesłów czasownika "to get" w znaczeniu "stać się/otrzymać": `She's gotten better at this.` W UK byłoby `She's got better at this.`

### "Do" jako czasownik posiłkowy zastępczy
- **UK:** `I might do.` (np. w odpowiedzi "Will you try it?" — "I might do.")
- **US:** rzadziej używane, zwykle pomijane: `I might.`

---

## 3. Ortografia

### Główne wzorce końcówek
- **-our (UK) vs -or (US):** behaviour → behavior, labour → labor, favour → favor, colour → color, flavour → flavor, humour → humor
- **-re (UK) vs -er (US):** centre → center, theatre → theater, litre → liter, fibre → fiber
- **-ise/-yse (UK) vs -ize/-yze (US):** optimise → optimize, analyse → analyze, customise → customize, realise → realize, organise → organize
  - Uwaga: OED akceptuje też `-ize` w UK (tzw. Oxford spelling), ale dla spójności z resztą reklam UK agent powinien domyślnie wybierać `-ise`.
- **-ence (UK) vs -ense (US):** defence → defense, offence → offense, licence (rzeczownik) → license
- **-ogue (UK) vs -og (US):** catalogue → catalog, dialogue → dialog (choć "dialog" przyjęło się też w UK w kontekście UI/software)
- **-ling, -lled (podwajanie L):** travelling/traveller (UK) → traveling/traveler (US), cancelled (UK) → canceled (US), modelling (UK) → modeling (US). Wyjątek: "cancellation" ma dwa L w obu wariantach.
- **ae/oe vs e:** anaesthetic → anesthetic, paediatric → pediatric, manoeuvre → maneuver

### Pisownia specyficzna, często pomijana
| US | UK |
| :--- | :--- |
| gray | grey |
| mold | mould |
| jewelry | jewellery |
| skillful | skilful |
| fulfill | fulfil |
| enrollment | enrolment |
| aluminum | aluminium |
| check (rachunek/sprawdzić) | cheque (tylko w znaczeniu bankowym), check (sprawdzić) |
| program (każde znaczenie) | programme (w znaczeniu "audycja/harmonogram"), program (tylko w kontekście software/IT) |
| mustache | moustache |
| donut | doughnut |
| pajamas | pyjamas |
| tire (opona) | tyre |
| curb (krawężnik) | kerb |

---

## 4. Słownictwo codzienne, dom i rodzina (kluczowe dla reklam natywnych/parentingowych)

To jest sekcja najważniejsza dla tłumaczenia treści o dzieciach, domu i codziennym życiu — czyli typowych native adsów na Facebooku.

### Dziecko i opieka nad dzieckiem
| US | UK |
| :--- | :--- |
| diaper | nappy |
| diaper bag | changing bag |
| pacifier | dummy |
| stroller / baby carriage / buggy | pushchair / pram |
| crib | cot |
| onesie | babygrow / sleepsuit |
| mom / mommy | mum / mummy |
| dad / daddy | dad / daddy (bez zmian) |
| preschool | nursery |
| kindergarten | reception (patrz tabela klas w sekcji 7) |
| recess | break time |
| field trip | school trip |
| backpack | rucksack / school bag |
| candy | sweets |
| cookie | biscuit |
| popsicle | ice lolly |
| band-aid | plaster |
| stuffed animal | soft toy / cuddly toy |
| sneakers | trainers |
| sweater | jumper |
| vacation | holiday |
| mail | post |
| trash / garbage | rubbish |
| yard | garden |
| apartment | flat |
| closet | wardrobe |
| flashlight | torch |
| stove | cooker / hob |
| faucet | tap |
| sidewalk | pavement |

### Słownictwo emocji i stanów, typowe dla treści "lifestyle"/parenting
Te słowa zwykle **nie wymagają zmiany** — są rozumiane identycznie po obu stronach Atlantyku: *meltdown, tantrum, overwhelmed, rattled, exhausted, burnt out*. Nie podmieniaj ich na siłę — ryzyko nadtłumaczenia.

Wyjątki, gdzie warto rozważyć zmianę rejestru:
- US "I was losing my mind" → UK równie naturalne, zostaw bez zmian lub "I was at the end of my tether" (bardziej brytyjski idiom, opcjonalnie dla wzmocnienia autentyczności).
- US "mom guilt" → UK "mum guilt" (tylko zmiana pisowni, termin funkcjonuje identycznie).
- US "parenting win" → UK równie naturalne, ale czasem "a small victory" brzmi mniej "coachowo", bardziej brytyjsko.

---

## 5. Słownictwo biznesowe, e-commerce i reklamowe

| Obszar | UK | US | Znaczenie |
| :--- | :--- | :--- | :--- |
| E-commerce | basket | cart | Koszyk zakupowy |
| E-commerce | delivery | shipping | Dostawa (UK rzadziej mówi "shipping" w kontekście B2C) |
| E-commerce | postcode | zip code | Kod pocztowy |
| E-commerce | out of stock | sold out / out of stock (oba używane) | Brak towaru |
| Finanse | current account | checking account | Rachunek bieżący |
| Finanse | note (np. £20 note) | bill (np. $20 bill) | Banknot |
| HR | redundancy | layoff | Zwolnienie grupowe |
| HR | CV | resume | Życiorys |
| Zarządzanie | Managing Director | CEO | Prezes/dyrektor zarządzający |
| Planowanie | timetable | schedule | Harmonogram |
| Prawo | Articles of Association | Bylaws | Statut spółki |
| Marketing | free phone number / 0800 | toll-free number | Infolinia |
| Marketing | money off / discount | sale / discount | Zniżka (oba naturalne) |

### Uwaga prawna: ceny i VAT
W reklamach B2C kierowanych do konsumentów w UK ceny pokazywane publicznie powinny być **cenami zawierającymi VAT** (brytyjskie prawo dot. oznaczania cen wymaga od sprzedawców detalicznych podawania cen "VAT included" dla konsumentów indywidualnych). Jeśli oryginalny US ad pokazuje cenę bez podatku (co jest normą w USA, gdzie sales tax dolicza się na checkout), agent powinien **oznaczyć to jako punkt do weryfikacji przez człowieka**, a nie automatycznie przeliczać kwoty — przeliczanie waluty i podatku wykracza poza tłumaczenie językowe i wymaga danych biznesowych klienta.

---

## 6. Ton głosu: US hard-sell vs UK understatement

To jest różnica, której sama podmiana słownictwa nie rozwiąże, a która najbardziej odróżnia "przetłumaczoną" reklamę od "oryginalnie brytyjskiej".

**Charakterystyka tonu US w reklamach natywnych:**
- Bezpośredni hard-sell, produkt jest na pierwszym planie od pierwszego zdania.
- Duża otwartość emocjonalna, bezpośrednie zwroty do czytelnika, częste wykrzykniki.
- Chętne użycie superlatywów i hype words: *game-changer, must-have, revolutionary, life-changing, obsessed, literally saved my life*.
- Chętne odwołania do popkultury i celebrytów jako social proof.
- Czas Past Simple w nagłówkach ("Moms discovered...", "This mom found...").

**Charakterystyka tonu UK w reklamach:**
- Softer sell — produkt częściej wprowadzany jako "przy okazji", pod koniec narracji, nie w pierwszym zdaniu.
- Większy dystans i autoironia, mniej przesady emocjonalnej na sucho (choć storytelling emocjonalny jak w Twoim przykładowym adsie o meltdownie działa dobrze w obu wariantach — to narracja uniwersalna).
- Hype words są postrzegane jako tandetne/nachalne i warto je stonować. Poniżej tabela zamienników.
- Mniejsza częstotliwość wykrzykników i caps locka w treści.
- Instytucje/marka może mówić o sobie w liczbie mnogiej (patrz sekcja 2), co brzmi bardziej "ludzko" i mniej korporacyjnie.

### Słownik "hype words" US → stonowany odpowiednik UK
| US hype word | Bardziej brytyjski odpowiednik |
| :--- | :--- |
| game-changer | makes a real difference / genuinely helpful |
| revolutionary | new approach / different way to... |
| must-have | worth having / handy to have |
| literally saved my life | made a huge difference / honestly helped so much |
| obsessed (I'm obsessed with this) | I love this / I'm a big fan of this |
| amazing / incredible (nadużywane) | really good / genuinely useful |
| unlock / supercharge / unleash | help you / make it easier to |
| perfect | great / just right |
| 100% | completely / absolutely (używać oszczędnie) |

**Zasada dla agenta:** nie usuwaj emocji z tekstu — brytyjska reklama wciąż może być poruszająca i osobista (jak przykładowy ads o meltdownie dziecka). Redukuj natomiast *słownictwo marketingowo-hiperboliczne*, nie *treść emocjonalną opowieści*.

---

## 7. Zgodność z brytyjskimi regulacjami reklamowymi (ASA / CAP Code)

Reklamy w UK podlegają CAP Code (Committee of Advertising Practice), egzekwowanemu przez ASA (Advertising Standards Authority) — również w mediach społecznościowych, w tym płatne reklamy na Facebooku/Meta. To nie jest kwestia językowa, ale **agent powinien flagować te miejsca w tekście**, ponieważ dosłowne tłumaczenie z amerykańskiego może naruszać brytyjskie zasady, nawet jeśli oryginał był zgodny z prawem US (FTC ma inne, zwykle luźniejsze podejście).

Główne punkty do flagowania:
- **Twierdzenia zdrowotne/medyczne** (np. "helps with anxiety", "reduces symptoms of ADHD", "cures", "treats") — w UK wymagają autoryzowanego, specyficznego health claim. Nieautoryzowane ogólne twierdzenia zdrowotne są regularnie karane przez ASA, również dla suplementów i produktów wellness reklamowanych na Facebooku.
- **Testimoniale i recenzje klientów** — muszą być tak samo udokumentowane/prawdziwe jak każde inne twierdzenie reklamowe. Nie można chować nieuzasadnionego claimu za cytatem klienta.
- **"Before and after"** (zdjęcia przed/po) — podlegają dodatkowym zasadom dot. reprezentatywności wyniku.
- **Obrazy ciała / wagi** — ASA zwraca szczególną uwagę na reklamy sugerujące niezdrowe wzorce sylwetki.
- **Oznaczanie pochodzenia firmy** — reklama nie może sugerować, że firma działa w UK, jeśli faktycznie działa z zagranicy.

**Rekomendacja dla agenta:** jeśli oryginalny tekst US zawiera twierdzenie zdrowotne, finansowe ("oszczędzisz X") lub specyficzny wynik liczbowy, agent powinien przetłumaczyć tekst, ale dodać w komentarzu/metadanych flagę w stylu: `⚠️ claim do weryfikacji prawnej pod CAP Code przed publikacją w UK`. To nie jest coś, co agent może samodzielnie "zalegalizować" przez samo tłumaczenie.

---

## 8. System szkolny: mapowanie klas (US grade → UK year)

Kluczowe dla treści rodzinnych, np. "going back to school" czy wspomnień o dzieciach w konkretnym wieku.

| Wiek dziecka | US | UK |
| :--- | :--- | :--- |
| 4–5 lat | Pre-K / Preschool | Nursery → Reception (brak dokładnego odpowiednika 1:1, Reception to pierwszy obowiązkowy rok) |
| 5–6 lat | Kindergarten | Year 1 |
| 6–7 lat | 1st Grade | Year 2 |
| 7–8 lat | 2nd Grade | Year 3 |
| 8–9 lat | 3rd Grade | Year 4 |
| 9–10 lat | 4th Grade | Year 5 |
| 10–11 lat | 5th Grade | Year 6 |
| 11–12 lat | 6th Grade | Year 7 |
| 12–13 lat | 7th Grade | Year 8 |
| 13–14 lat | 8th Grade | Year 9 |
| 14–15 lat | 9th Grade / Freshman | Year 10 |
| 15–16 lat | 10th Grade / Sophomore | Year 11 |
| 16–17 lat | 11th Grade / Junior | Year 12 |
| 17–18 lat | 12th Grade / Senior | Year 13 |

Dodatkowe terminy:
- US "elementary school" → UK "primary school"
- US "middle school / junior high" → UK częściowo pokrywa się z końcem primary i początkiem secondary, nie ma dokładnego odpowiednika — bezpieczniej używać "secondary school" ogólnie
- US "high school" → UK "secondary school"
- US "report card" → UK "school report"
- US "principal" → UK "head teacher" / "headmaster/headmistress"
- US "field trip" → UK "school trip"
- US "recess" → UK "break" / "playtime"

---

## 9. Jednostki miar, data, czas, format liczb

### Jednostki
UK jest systemem **mieszanym** (nie czysto metrycznym) — to ważne, bo dosłowne przeliczenie "na metryczny" może brzmieć sztucznie dla brytyjskiego odbiorcy:

| Kontekst | UK | US |
| :--- | :--- | :--- |
| Odległość (drogi, dystans) | mile | mile (to samo, bez zmian) |
| Waga ciała (mowa potoczna) | stone i pounds (np. "11 stone 4") lub kg | pounds (lbs) |
| Waga produktu/jedzenia | gramy, kilogramy | pounds, ounces |
| Objętość płynów | litry (paliwo), ale piwo/mleko czasem w pintach | gallons, fluid ounces |
| Wzrost | feet/inches (potocznie) | feet/inches |
| Temperatura | Celsjusz (w pogodzie), czasem Fahrenheit potocznie u starszych | Fahrenheit |
| Rozmiar ubrań/butów | własny brytyjski rozmiar (różni się od US! UK 6 ≠ US 6 w butach i ubraniach) | własny amerykański rozmiar |

**Zasada dla agenta:** nie przeliczaj automatycznie jednostek bez kontekstu produktu. Jeśli ad mówi "losing 10 pounds", w UK naturalniej brzmi "losing a stone" (stone = 14 lbs, więc nie jest to dokładne 1:1 przeliczenie) albo zostawienie w kg — **to decyzja redakcyjna wymagająca wiedzy o grupie docelowej**, nie czysto mechaniczne tłumaczenie. Flaguj takie miejsca.

### Data
- **UK:** DD/MM/YYYY → `12/10/2026` = 12 października 2026
- **US:** MM/DD/YYYY → `12/10/2026` = 10 grudnia 2026
- W tekstach pisanych słownie zawsze preferuj format jednoznaczny: `12 October 2026` zamiast samych cyfr, żeby uniknąć pomyłki.

### Godzina
- **Aktualizacja właściciela, 17 października 2026 — godziny w Antkach:** w obu wersjach UK (localized i rewritten) zapisuj godziny cyframi: `nine at night` → `9 pm`, `half past seven in the morning` → `7.30 am`. Zachowaj dokładną godzinę, minuty i porę dnia; nie dopowiadaj `am`/`pm`, jeśli źródło ich nie rozstrzyga. To zmiana zapisu, nie wartości faktu. Dotyczy copy czytanego, nie skryptów do lektora — w narracji audio godziny pozostają słownie. Użytkownik rozszerzył zasadę w copy pisanym na okresy i dosłowne liczebności: `three months` → `3 months`, `Three detentions` → `3 detentions`. Zachowuj jednostkę i znaczenie; `a fortnight` pozostaje bez zmiany, bez przeliczania na `2 weeks`. Te konkretne korekty nie obejmują wieku. Pozostałe słowa i interpunkcję zachowuj bez zmian.
- **UK:** dwukropek lub kropka, małe litery bez kropek w skrócie: `9.30am`, `9:30am`, `17:45`
- **US:** zawsze dwukropek, często z kropkami w skrócie: `9:30 a.m.`, `9:30 AM`

### Zakresy czasowe (ważne przy promocjach "do piątku")
- **UK:** `Monday to Friday` — "to" domyślnie oznacza włącznie z piątkiem.
- **US:** `Monday through Friday` — "to" w US bywa niejednoznaczne, "through" jest bezpieczniejsze prawnie przy określaniu końca promocji.

### Numer telefonu
- **UK:** format krajowy `07xxx xxxxxx` (mobile) lub `0xxx xxx xxxx` (stacjonarny), numer międzynarodowy `+44`
- **US:** `(xxx) xxx-xxxx` lub `xxx-xxx-xxxx`, numer międzynarodowy `+1`

---

## 10. Checklist operacyjny dla agenta AI

Przed oddaniem finalnego tłumaczenia reklamy, agent powinien przejść przez tę listę:

1. **Pisownia** — wszystkie słowa z końcówkami -or/-er/-ize/-ense zamienione na -our/-re/-ise/-ence (sekcja 3).
2. **Cudzysłowy i kropki** — cudzysłów pojedynczy, kropka poza cudzysłowem (sekcja 1).
3. **Słownictwo rodzinne/domowe** — sprawdzone pod tabelą z sekcji 4 (diaper→nappy, mom→mum, itd.).
4. **Przyimki** — "at the weekend", "fill in", "cater for" (sekcja 2).
5. **Czas gramatyczny w nagłówkach/powiadomieniach** — rozważ Present Perfect zamiast Past Simple tam, gdzie brzmi to bardziej "na żywo" (sekcja 2).
6. **Hype words** — zidentyfikuj i stonuj słowa z tabeli w sekcji 6, zachowując emocjonalny ciężar narracji.
7. **Claimy zdrowotne/finansowe/liczbowe** — oznacz flagą do weryfikacji prawnej (sekcja 7), nie usuwaj ich samodzielnie, ale nie tłumacz ich jako czegoś "bezpiecznego" bez ostrzeżenia.
8. **Jednostki, data, godzina, waluta** — sprawdzone i, jeśli wymagają decyzji biznesowej (np. przeliczenie ceny/VAT), oznaczone do weryfikacji przez człowieka (sekcja 5 i 9).
9. **System szkolny** — jeśli pojawia się grade/klasa, zamień zgodnie z tabelą w sekcji 8.
10. **Ton całości** — przeczytaj końcowy tekst jako całość: czy produkt wskakuje zbyt wcześnie i zbyt nachalnie jak w typowym US ad, czy można przesunąć go bliżej końca narracji, zgodnie z UK "soft sell" (sekcja 6)?

---

## 11. Przykład zastosowania — Twoja przykładowa reklama

Poniżej Twój oryginalny tekst US i jego wersja po zastosowaniu powyższych reguł. Treść emocjonalna i struktura narracji zostały zachowane (to dobry przykład tekstu, który nie wymaga zmiany tonu — opowieść o meltdownie działa tak samo mocno w UK), zmianie uległy głównie pisownia, słownictwo i drobne detale.

**Oryginał (US):**
> The screaming started over socks.
> Not itchy socks. Not dirty socks.
> Just… socks.
> It was 7:15 AM.
> We were already running late for school.
> One second he was fine.
> The next — full meltdown.
> Crying.
> Kicking.
> Screaming so loud my other kids covered their ears.
> By 7:30, we were all rattled.
> He was still in his pajamas.
> I was sweating and fighting back tears.
> And the day hadn't even started yet.

**Wersja UK:**
> The screaming started over socks.
> Not itchy socks. Not dirty socks.
> Just… socks.
> It was 7.15am.
> We were already running late for school.
> One second he was fine.
> The next – full meltdown.
> Crying.
> Kicking.
> Screaming so loud my other kids covered their ears.
> By 7.30am, we were all rattled.
> He was still in his pyjamas.
> I was sweating and fighting back tears.
> And the day hadn't even started yet.

**Co się zmieniło i dlaczego:**
- `7:15 AM` → `7.15am` (brytyjski format godziny, sekcja 9).
- `pajamas` → `pyjamas` (pisownia, sekcja 3).
- Em-dash `—` → spaced en-dash ` – ` (sekcja 1).
- Reszta tekstu pozostała bez zmian celowo: nie ma tu amerykańskiego słownictwa rodzinnego wymagającego podmiany (nie pojawia się "mom", "diaper" ani inne słowo z tabeli w sekcji 4), nie ma hype words do stonowania, a narracja emocjonalna jest już w stylu "soft sell" — produkt nie pojawia się w ogóle w tym fragmencie, co pasuje do brytyjskiego podejścia opisanego w sekcji 6. Gdyby dalsza część reklamy wprowadzała produkt zdaniem w stylu *"This is why I'm OBSESSED with [Product] — it's a total game-changer for meltdowns"*, agent powinien przekształcić to na coś w rodzaju *"This is why [Product] has made such a difference for us during meltdowns like this"*.

---

## 12. Źródła i uwagi metodologiczne

Reguły w sekcjach 1–5 i 8–9 są ugruntowanymi, stabilnymi różnicami językowymi (nie zmieniają się z czasem, więc agent może je stosować jako sztywne reguły). Reguły w sekcjach 6–7 (ton głosu, regulacje ASA/CAP) są oparte na aktualnych praktykach rynkowych i mogą ewoluować — warto je okresowo weryfikować, szczególnie zasady ASA/CAP dot. twierdzeń zdrowotnych w reklamach social media, które są obecnie przedmiotem wzmożonego nadzoru (liczne decyzje ASA w 2025 wobec reklam na Facebooku dot. suplementów i produktów wellness).
