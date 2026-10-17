# Wspólny rozwój Szekspira

Ustalenie użytkownika, 17 października 2026.

- Główna wersja: `main`, produkcja `https://szekspir.vercel.app`.
- Osobna wersja kodu Bakki77: `collab/bakki77`. Własny profil aplikacji, produkty, dokumenty i klucze są odrębne od gałęzi kodu.
- GitHub Actions sprawdza obie gałęzie i pull requesty. Nie otrzymuje produkcyjnych sekretów ani dostępu do płatnych usług. Nie uruchamiaj płatnych generacji lub zapisów do prawdziwych arkuszy jako testów.
- Łączenie zmian co trzy dni obsługuje automatyzacja tego czatu. Wymagane są aktualne testy obu zmian razem, zachowanie wszystkich zmian obu osób oraz brak konfliktów. Przy konflikcie, zmianie chronionych integracji lub niepowodzeniu testów pozostaw pull request do rozwiązania; nie stosuj force push, ours/theirs ani automatycznego odrzucania zmian drugiej osoby.
- Po scaleniu aktualizuj także gałąź współpracownika zwykłym fast-forward. Commit/push i potwierdzony deploy produkcyjny są wymagane przy publikacji zmian aplikacji. Zachowuj VMake legacy.
- Oddzielny adres testowy wymaga konfiguracji środowiska Preview. Obecnie Preview nie ma pełnej konfiguracji logowania i integracji; nie kopiuj tam produkcyjnych kluczy ani produkcyjnej bazy w ramach wygodnego skrótu. Brak działającego Preview nie oznacza, że zmiany kodu zostały wdrożone do aplikacji.
- Adres konta aplikacji pozostaje w prywatnym rejestrze profili; profil otrzymuje własny zestaw na Drive administratora. Zaproszenie GitHub musi zostać przyjęte przez Bakki77, zanim może wysyłać zmiany.
