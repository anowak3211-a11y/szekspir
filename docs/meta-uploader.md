# Uploader reklam Meta

Panel: `/uploader`. Konfiguracja dla właściciela: `/api/meta/setup`.

## Co robi

- Wczytuje istniejące zakładki `Upload*` z Admin workbook, tabelę TSV z cytowanymi wielowierszowymi komórkami albo JSON. Odczyt arkuszy nie zmienia wierszy, zatwierdzeń ani statusów produkcji.
- Każdy hook/VO ma osobny klucz i reklamę. Teksty, emoji, akapity i zatwierdzone URL są przechowywane dosłownie. Domyślny formularz zawiera 3 primary texts +1 headline +1 description; można importować i edytować 1–5 wariantów każdego rodzaju.
- Przesyła oryginalne filmy i obrazy bez ponownego kodowania. Filmy Drive są przesyłane zakresami bajtów przez połączenie Drive Szekspira; nie zmienia uprawnień udostępniania. Weryfikuje rozmiar/checksum oryginału i odpowiedź Range. Local files używają istniejącego transportu Blob/Supabase. Można podać istniejący account-library Video ID.
- Tworzy jedynie media, creative i ad w istniejącym zestawie. Nigdy nie tworzy/modyfikuje kampanii, zestawów, budżetów, odbiorców lub harmonogramów. Wymaga kampanii PAUSED; nowe reklamy mają PAUSED.
- Domyślnie ustawia Enhance CTA +inline comments jako jedyne opt-in. Jawne przełączniki w Settings sterują obsługiwanymi funkcjami dla obrazów, filmów i ręcznych karuzel. Katalog, automatyczne zmiany formatu i multi-advertiser pozostają wyłączone. Nie tworzy nowych kont Instagram. Tożsamość strony i dostępność profilu dla placements muszą być obsługiwane przez Meta; błąd nie jest obchodzony przez podpinanie innego profilu.
- Oznacza reklamę jako complete dopiero po odczycie native ad/creative i sprawdzeniu dosłownych tekstów, mediów, Page, URL, CTA i ustawień. To nie jest potwierdzenie zakończenia review Meta ani rozpoczęcia emisji.

## Integracja

[Przygotowana konfiguracja nowej aplikacji SZEKSPIR](meta-app-setup.md).

Natywna Meta Marketing API v26.0 (wersja konfigurowalna przez `META_API_VERSION`). Potrzebna własna aplikacja Meta i odpowiedni dostęp do kont/stron. Dane można zapisać bezpośrednio w prywatnym formularzu aplikacji w `/uploader` (szyfrowany store, sekret niewidoczny w odczycie) lub w Vercel ustawić prywatnie `META_APP_ID`, `META_APP_SECRET`, `META_LOGIN_CONFIG_ID`, zatwierdzić callback `https://szekspir.vercel.app/api/meta/callback`, a następnie użyć Facebook Login w panelu. Żądane zakresy: ads_management, ads_read, pages_show_list, pages_read_engagement. Nowe zgody właściciel potwierdza w normalnym ekranie Meta.

Alternatywnie istniejący token można zapisać w chronionym formularzu lub serwerowej zmiennej `META_ACCESS_TOKEN`. Połączenie jest sprawdzane przed zastąpieniem; tokeny nie wracają do klienta, URL przeglądarki, logów ani repo. Przechowywane są przez istniejący szyfrowany CAS store. Nie zmieniać klucza szyfrowania/state backendu w ramach instalacji.

Nowy prywatny topic kolejki: `szekspir-meta-upload`; consumer `/api/queues/meta-upload` jest rejestrowany w `vercel.json`. Jedna dostawa robi jeden zapisany krok. Nie wymaga otwartej przeglądarki ani nowego crona. Opóźnione retry respektuje backoff. OAuth, storage oraz transporty filmów wymagają rzeczywistego połączenia i uprawnień; offline testy nie dowodzą poprawnej publikacji na konkretnym koncie.

## Powtórzenia i niepotwierdzony wynik

Klucz kanoniczny: account +ad set +source key. Powtórzenie identycznej paczki używa zapisanych rekordów. Inne ustawienia tego samego klucza powodują konflikt, a nie nową reklamę. Snapshoty są niezmienne. Kolejka trzyma lease; zapisy CAS nigdy nie ponawiają wywołania Meta.

Przed nieodwracalnym zapisem zewnętrznym zapisywany jest pending intent. Timeout/crash przy tworzeniu filmu/creative/ad wymaga sprawdzenia wyniku. `Check result` wyszukuje dokładną nazwę w docelowym zestawie i weryfikuje creative; nie duplikuje adów. Przy przerwanym transferze Drive zachowuje session ID i zakres. Jawne retry nie kasuje istniejących Meta IDs. Gdy wynik pozostaje niejasny, właściciel musi sprawdzić Meta przed potwierdzeniem ponowienia.

## Weryfikacja

`node tests/meta-uploader.cjs` jest całkowicie offline: dokładność tekstów i TSV, duplicate guard, niezmienne snapshoty, PAUSED, brak parent writes, odzyskanie timeoutu bez ponownego create, backoff oraz pauza. Dodatkowo wymagane typecheck, core regressions i produkcyjny build. Nie uruchamiać live Sheet mutations ani tworzenia reklam jako rutynowego testu.

Pierwszy rzeczywisty test wymaga połączenia Meta i jawnie wybranej reklamy w panelu: sprawdzić jej oryginalny materiał, 3P/H1/D1, FB/Instagram identity, URL/CTA, wyłącznie dwa enhancements, parent OFF oraz native ID. Dopiero to potwierdza obsługę formatu/uprawnień tego konta.

## Referencje implementacji

[Meta AdAssetFeedSpec](https://github.com/facebook/facebook-python-business-sdk/blob/main/facebook_business/adobjects/adassetfeedspec.py), [creative features](https://github.com/facebook/facebook-python-business-sdk/blob/main/facebook_business/adobjects/adcreativefeaturesspec.py), [original video upload protocol](https://github.com/facebook/facebook-python-business-sdk/blob/main/facebook_business/video_uploader.py).

Ads Uploader jest opcjonalnym innym dostawcą publikacji; ten moduł nie instaluje go, nie kupuje abonamentu ani nie nadaje mu uprawnień. Jego publiczny MCP repo zawiera dokumentację/konfigurację, a nie kod serwera. Nie deklarować zweryfikowanej integracji z ich usługą bez osobnego logowania i testu.

## Ekrany i ustawienia na wzór Rapid Ads

- `/uploader`: pliki z komputera (wiele naraz/drag & drop), oryginalny link Drive/HTTPS, Video ID, arkusze Upload, TSV/JSON. Podgląd i zaznaczanie kreacji; double click lub Edit otwiera pełne warianty bez zmiany ich treści. Obrazy 24 MB i filmy 2 GB odpowiadają rzeczywistym limitom transportu, nie skopiowanemu opisowi 4 GB.
- Wybrane 2–10 gotowych obrazów można jawnie połączyć w karuzelę. Kopiuje literalne teksty pierwszej kreacji, zachowuje kolejność kart, odznacza źródła. Przed publikacją sprawdzić cały podgląd i właściwy zestaw.
- `/uploader/settings`: tożsamość FB (Instagram używa FB Page), 1–5 wariantów każdego rodzaju, do 24 szablonów na konto, przełączniki enhancement, URL/UTM i nazwy `{filename}`, `{index}`, `{date}`. Zmiany zapisuje prywatny CAS; nowsza wersja innej karty nie jest nadpisywana. Zastosowanie szablonu do istniejących kreacji jest osobną jawną akcją.
- `/uploader/dashboard`: rzeczywiste statystyki konta z Meta, okres 7/14/30 dni. Load performance odczytuje konto i wyniki; cache dziesięć minut ogranicza zapytania. Brak odpowiedzi pokazuje błąd, nie wymyślone statystyki.
- `/uploader/history`: zapisane paczki i ich potwierdzone wyniki z filtrem konta, typu mediów i nazwy. Źródłem jest moduł Szekspira; wcześniejsze publikacje przez inne narzędzia nie są liczone jako jego uploady.
- `/uploader/teams`: rzeczywisty przegląd dostępu właściciela; nie dodaje osobnych użytkowników ani uprawnień Meta. `/uploader/help`: instrukcja przepływu i odzyskiwania.
- Lokalny transfer przed zapisem paczki wymaga utrzymania karty; ostrzeżenie przed zamknięciem chroni niezapisane pliki/ustawienia. Zapisana paczka i Meta IDs są trwałe na serwerze.

Font Geist pochodzi z dostarczonych zasobów Next.js; licencja OFL znajduje się w `public/fonts/geist/OFL.txt`. Wygląd został odtworzony z ekranów użytkownika, bez pobierania prywatnego kodu Rapid Ads.

## Odzyskiwanie niezapisanej paczki — 15 października 2026

Przed zapisaniem paczki na serwerze `/uploader` zachowuje robocze kreacje w IndexedDB przeglądarki. Po odświeżeniu tej samej karty pokazuje Restore draft / Discard backup. Zachowuje literalne teksty, wybrane kreacje, ich kolejność, indywidualne cele i ustawienia oraz identyfikator zapisu paczki. Wysłane już pliki korzystają z ich istniejących URL; niedokończone oryginały są przechowywane lokalnie, jeżeli przeglądarka ma dostateczny limit. Przywrócenie nie wykonuje transferu ani publikacji; przerwany transfer wymaga jawnego Retry upload.

Kopia jest przypisana do karty i urządzenia. Nie obejmuje sekretów połączenia ani niezapisanych globalnych Settings. Błąd/quota storage jest widoczny, a ostrzeżenie przed opuszczeniem pozostaje aktywne. Zamknięcie karty może usunąć jej sessionStorage: ta funkcja służy do odświeżenia/powrotu w tej samej sesji, nie synchronizacji między urządzeniami. Potwierdzony zapis paczki na serwerze lub New upload usuwa bieżącą kopię lokalną. Nowy test `tests/meta-workspace-draft.cjs` używa fake-indexeddb; nie wywołuje Meta, storage serwera ani Sheets.
