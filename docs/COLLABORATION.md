# Wspólny rozwój Szekspira

Ustalenie użytkownika, 17 października 2026.

- Główna wersja: `main`, produkcja `https://szekspir.vercel.app`.
- Osobna wersja kodu Bakki77: `collab/bakki77`. Własny profil aplikacji, produkty, dokumenty i klucze są odrębne od gałęzi kodu.
- GitHub Actions sprawdza obie gałęzie i pull requesty. Nie otrzymuje produkcyjnych sekretów ani dostępu do płatnych usług. Nie uruchamiaj płatnych generacji lub zapisów do prawdziwych arkuszy jako testów.
- Łączenie zmian co trzy dni obsługuje automatyzacja tego czatu. Wymagane są aktualne testy obu zmian razem, zachowanie wszystkich zmian obu osób oraz brak konfliktów. Przy konflikcie, zmianie chronionych integracji lub niepowodzeniu testów pozostaw pull request do rozwiązania; nie stosuj force push, ours/theirs ani automatycznego odrzucania zmian drugiej osoby.
- Po scaleniu aktualizuj także gałąź współpracownika zwykłym fast-forward. Commit/push i potwierdzony deploy produkcyjny są wymagane przy publikacji zmian aplikacji. Zachowuj VMake legacy.
- Wybrany przez właściciela wariant: osobny interfejs Bakki, wspólny serwer i dane zalogowanego konta. Hosting `szekspir-bakki` śledzi `collab/bakki77`; docelowy adres to `https://szekspir-bakki.vercel.app`. Jedyna zmienna aplikacji na tym hostingu to niesekretny `APP_SHARED_API_ORIGIN=https://szekspir.vercel.app`. Nie kopiuj kluczy, konfiguracji bazy, danych Google ani tokena Blob. Zmiany API/workerów tej gałęzi działają dopiero po scaleniu z `main`.
- Interfejs przekazuje żądania API do stałego serwera z normalną sesją użytkownika. Zapis wymaga właściwego Origin interfejsu; nagłówki tożsamości i uprawnień maszyny nie są przekazywane. Zwykły użytkownik nadal korzysta ze swojego profilu, plików i kluczy. Przed konfiguracją własnego hasła użytkownik korzysta z zaproszenia e-mail w głównej aplikacji.
- `vercel.ts` zachowuje dotychczasową konfigurację serwera z `vercel.backend.json`. Tryb interfejsu nie rejestruje konsumentów kolejek ani cronów; nie może odbierać zadań produkcji. Bramkę Vercela na samym nowym hostingu wyłączono za wyraźną zgodą właściciela; logowanie Szekspira pozostaje wymagane dla danych.
- Adres konta aplikacji pozostaje w prywatnym rejestrze profili; profil otrzymuje własny zestaw na Drive administratora. Zaproszenie GitHub musi zostać przyjęte przez Bakki77, zanim może wysyłać zmiany.
