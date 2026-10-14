# Uploader reklam Meta

Panel: `/uploader`. Konfiguracja dla właściciela: `/api/meta/setup`.

## Co robi

- Wczytuje istniejące zakładki `Upload*` z Admin workbook, tabelę TSV z cytowanymi wielowierszowymi komórkami albo JSON. Odczyt arkuszy nie zmienia wierszy, zatwierdzeń ani statusów produkcji.
- Każdy hook/VO ma osobny klucz i reklamę. Teksty, emoji, akapity i zatwierdzone URL są przechowywane dosłownie. Domyślny formularz zawiera 3 primary texts +1 headline +1 description; można importować 1–5 primary texts.
- Przesyła oryginalne filmy i obrazy bez ponownego kodowania. Filmy Drive są przesyłane zakresami bajtów przez połączenie Drive Szekspira; nie zmienia uprawnień udostępniania. Weryfikuje rozmiar/checksum oryginału i odpowiedź Range. Local files używają istniejącego transportu Blob/Supabase. Można podać istniejący account-library Video ID.
- Tworzy jedynie media, creative i ad w istniejącym zestawie. Nigdy nie tworzy/modyfikuje kampanii, zestawów, budżetów, odbiorców lub harmonogramów. Wymaga kampanii PAUSED; nowe reklamy mają PAUSED.
- Ustawia Enhance CTA +inline comments jako jedyne opt-in, wyłącza pozostałe wymienione automatyczne funkcje, katalog, multi-advertiser i carousel. Nie tworzy nowych kont Instagram. Tożsamość strony i dostępność profilu dla placements muszą być obsługiwane przez Meta; błąd nie jest obchodzony przez podpinanie innego profilu.
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
