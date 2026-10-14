# Nowa aplikacja Meta dla Szekspira

Konfiguracja przygotowana 14 października 2026. To instrukcja instalacji: nie oznacza, że aplikacja Meta została już utworzona ani że jej uprawnienia zostały zatwierdzone.

| Pole | Wartość |
| --- | --- |
| Proponowana nazwa | Szekspir Ads |
| Domena aplikacji | szekspir.vercel.app |
| Website URL | https://szekspir.vercel.app |
| OAuth redirect URI | https://szekspir.vercel.app/api/meta/callback |
| Privacy policy URL | https://szekspir.vercel.app/privacy |
| User data deletion instructions URL | https://szekspir.vercel.app/privacy#meta |
| Integracja reklamowa | Meta Marketing API |
| Uprawnienia żądane przez kod logowania | ads_management, ads_read, pages_show_list, pages_read_engagement |

## Kroki administratora

1. Otwórz [Meta for Developers — Apps](https://developers.facebook.com/apps/) i wybierz Create App. Kreator prosi najpierw o nazwę oraz istniejący kontaktowy adres e-mail. Proponowaną nazwą jest **Szekspir Ads**; użyj własnego prawidłowego adresu i portfolio posiadającego docelowe zasoby. Nie zakładaj nowego portfolio tylko dla tej instalacji.
2. Wybierz funkcje odpowiadające zarządzaniu reklamami przez Marketing API oraz logowaniu Facebook. Meta może wymagać weryfikacji firmy, uprawnień lub review; potwierdź wymagania wyświetlone dla tej konkretnej aplikacji. Nazwy etapów kreatora mogą się zmieniać.
3. Przed ostatecznym utworzeniem sprawdź nazwę, portfolio i warunki. Nadanie nowej aplikacji dostępu do reklam jest osobną decyzją właściciela. Sam deploy Szekspira niczego nie autoryzuje.
4. W ustawieniach aplikacji wprowadź domenę, Website URL i publiczne adresy z tabeli. W ustawieniach logowania ustaw dokładny OAuth redirect URI. Pozostaw HTTPS oraz walidację zgodności adresu zwrotnego włączone.
5. W **istniejącym** projekcie `szekspir` na Vercelu ustaw prywatnie `META_APP_ID` i `META_APP_SECRET` w środowisku Production. Zachowaj `APP_ORIGIN=https://szekspir.vercel.app` i pozostałe ustawienia storage/Drive; nie rotuj ich kluczy. Sekret należy wpisać bezpośrednio w Vercelu, bez czatu, arkusza, logów i repozytorium.
6. Zmiana zmiennych wymaga nowego deploymentu tego samego projektu. Po nim panel `/uploader` pokaże **Połącz przez Facebook**. W normalnym ekranie Meta wybierz właściwe zasoby i zatwierdź dokładny zakres. Role aplikacji, poziom dostępu i ograniczenia Meta muszą pozwalać na wybrane operacje; nie obchodź review ani ograniczeń profilu.
7. Pierwszy test wykonaj na jednej wybranej reklamie w istniejącej kampanii OFF. Sprawdź materiał, warianty tekstów, Page/Instagram identity, URL/CTA, enhancements i native ad ID. Offline testy nie potwierdzają kompatybilności konkretnego konta Meta.

## Sekrety i utrzymanie

App ID nie zastępuje tokenu. Sekret aplikacji pozostaje w konfiguracji serwera; token po Facebook Login zapisuje się w istniejącym szyfrowanym store. Po wygaśnięciu dostępu panel wymaga ponownego połączenia. Nie kopiuj tokenu Supermetrics ani cookies przeglądarki do aplikacji. Dostęp do kont innej firmy wymaga oddzielnego sprawdzenia uprawnień i wymagań Meta.

Alternatywną drogą jest token systemowy uzyskany prawidłowo dla tej aplikacji i odpowiednich zasobów. Administrator może zapisać go w chronionym formularzu uploadera albo `META_ACCESS_TOKEN`. Ta instrukcja nie tworzy użytkownika systemowego ani nie nadaje mu uprawnień.

[Instrukcja uploadera i wznowienia paczek](meta-uploader.md).
