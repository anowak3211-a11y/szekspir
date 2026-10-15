# Ads X-Ray — funkcje w Szekspirze

Aktualizacja: 15 października 2026. Wejście: https://szekspir.vercel.app/ads-xray lub kafelek ADS X-RAY na stronie głównej.

## Nowy układ

Trzy tryby w lewym menu, na telefonie w górnej nawigacji: **Warianty**, **Różnice**, **Lokalizacje**. Najpierw dodajesz teksty, potem otwierasz wynik. Główne działanie zawsze jest na końcu obszaru pracy. Ustawienia są w „Opcje”, zapisane porównania w „Historia”, a archiwum i filtry wewnątrz historii. Marki i edytorzy mają osobne okno. Edycja pełnych tekstów odbywa się przez „Edytuj teksty”; lokalizacje mają również ołówek przy każdym zdaniu. Widok mobilny układa teksty i wyniki pionowo.

## 1. Porównywanie wariantów reklam

- Od dwóch do sześciu tekstów, każdy z własną nazwą.
- Wybór tekstu bazowego i porównanie pozostałych wersji.
- Procent podobieństwa i macierz porównań par.
- Zaznaczenie zmienionych, dodanych i usuniętych fragmentów.
- Edycja w dedykowanych polach tekstowych, cofanie zmian i wspólne przewijanie lokalizacji.
- Przygaszanie identycznych fragmentów i regulacja wielkości tekstu.

Zastosowanie: sprawdzenie, czy sześć hooków to rzeczywiście sześć różnych otwarć, czy kosmetyczne zmiany.

## 2. AI Diff

- Mechaniczne porównanie słów, zdań lub znaków bez kosztu AI.
- Widok obok siebie i pod sobą, nawigacja między zmianami, wykrywanie przeniesionych fragmentów.
- Opcjonalne ignorowanie wielkości liter, interpunkcji, typografii i białych znaków.
- Osobny przycisk analizy semantycznej: duplikat, bliska parafraza, ta sama struktura, luźne podobieństwo albo różne teksty.
- Mapa: hook, lead, problem, mechanizm, dowód, oferta, CTA.
- Pary dosłownych cytatów, wyjaśnienie podobieństw niewidocznych dla zwykłego diffu i wskazówki różnicowania wariantów.

Zastosowanie: wykrywanie reklamy napisanej innymi słowami, lecz nadal opartej na tej samej obietnicy i historii. Wynik nie przewiduje ROAS ani oceny Meta.

## 3. Skrypty i lokalizacje

- Trzy kolumny: oryginał, English jako oś oraz Polski. Można porównywać sam oryginał i adaptację UK, zostawiając trzecią kolumnę pustą.
- Mechaniczne dopasowanie zdań; opcjonalnie dokładniejsze dopasowanie AI.
- Ręczne wiązanie zdań, wskazanie dodatków i brakujących odpowiedników.
- Edycja zdanie po zdaniu lub jako ciągły dokument.
- Cofnij/ponów, wspólne przewijanie, liczba słów i orientacyjny czas czytania.
- Zwykłe kopiowanie zachowuje tekst dokładnie. Osobny przycisk FB formatuje akapity, zachowując myślniki.

Zastosowanie: kontrola pominiętego zdania, zmienionej oferty albo fragmentu, który przesunął się podczas tłumaczenia.

## 4. Zapis i organizacja

- Lokalne szkice i ustawienia w przeglądarce.
- Szyfrowana historia serwerowa z marką, etykietą edytora, batchem, nazwą i linkiem do Ad Library.
- Filtrowanie po trybie, marce, edytorze i autorze.
- Ponowne otwieranie opłaconych wyników bez nowej analizy AI.
- Ostrzeżenie przed nadpisaniem oraz ochrona przed nadpisaniem nowszego zapisu ze starej karty.
- Archiwizacja zamiast trwałego usunięcia; przywracanie przez „Archiwum zapisów”.

Aktualne limity: 200 zapisów, łącznie 4 MB; pojedyncze porównanie do 2 MB; lista pokazuje do 100 pasujących wpisów. Lokalne szkice znikają po wyczyszczeniu danych przeglądarki.

## 5. Integracja z naszym procesem

Przy gotowym zadaniu Szekspira jest link „Compare in Ads X-Ray”. Przycisk importu pobiera zapisany oryginał i adaptację po potwierdzeniu zastąpienia lokalnego szkicu. Nie zmienia zadania, arkuszy ani reklam w Meta. Niezapisane poprawki trzeba wcześniej zapisać w Szekspirze.

Moduł, jego pliki i API wymagają istniejącego logowania 2FA. Etykiety edytorów w historii służą organizacji i nie tworzą nowych kont.

## AI i koszty

AI uruchamia się wyłącznie przyciskiem. Dostępny Sonnet 5.5 korzysta z istniejącej konfiguracji Szekspira. Okno przed uruchomieniem wyjaśnia płatność zależną od użycia; nie deklaruje limitu wydatku. Identyczne teksty są rozpoznawane bez płatnego wywołania.

Wyniki są zapamiętywane dla dokładnie tych samych danych. Niepewnego wywołania nie ponawiamy automatycznie. Jeśli druga kolumna analizy zawiedzie, wynik pierwszej zostaje. Płatne wywołania dostawcy nie były wykonywane w ramach testów wdrożenia.

Szczegóły techniczne, źródło i testy: [ADS-XRAY.md](ADS-XRAY.md).
