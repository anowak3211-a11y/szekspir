import { ANTKI_PL_COPY_PART1 } from './antki-pl-copy-part1';
import { ANTKI_PL_COPY_PART2 } from './antki-pl-copy-part2';
import { ANTKI_PL_COPY_PART3 } from './antki-pl-copy-part3';
import { ANTKI_PL_COPY_PART4 } from './antki-pl-copy-part4';
import { ANTKI_PL_COPY_PART5 } from './antki-pl-copy-part5';
import { ANTKI_PL_COPY_PART6 } from './antki-pl-copy-part6';
import { ANTKI_DOROSLI_COPY_PART1 } from './antki-dorosli-copy-part1';
import { ANTKI_DOROSLI_COPY_PART2 } from './antki-dorosli-copy-part2';
import { ANTKI_DOROSLI_COPY_PART3 } from './antki-dorosli-copy-part3';
import { ANTKI_DOROSLI_COPY_PART4 } from './antki-dorosli-copy-part4';
import { ANTKI_DOROSLI_COPY_PART5 } from './antki-dorosli-copy-part5';
import { ANTKI_DOROSLI_COPY_PART6 } from './antki-dorosli-copy-part6';
import { ANTKI_PL_COPY_TESTPACK } from './antki-pl-copy-testpack';
import { ANTKI_SPORT_COPY_PART1 } from './antki-sport-copy-part1';
import { ANTKI_SPORT_COPY_PART2 } from './antki-sport-copy-part2';
import { ANTKI_SPORT_COPY_PART3 } from './antki-sport-copy-part3';
import { ANTKI_SPORT_COPY_PART4 } from './antki-sport-copy-part4';
import {
  ANTKI_PL_PRESET_ANGLES,
  ORTHOMAX_PL_DEFAULT_URL,
  getDefaultImageForAngle,
  sanitizeAndAuditAntkiPl,
  type AntkiPlGeneratedAd,
} from './antki-pl';

export const ANTKI_PL_ARGON_AUTHORED_COPY: Record<
  string,
  { headline: string; description: string; primaryText: string }
> = {
  ...ANTKI_PL_COPY_PART1,
  ...ANTKI_PL_COPY_PART2,
  ...ANTKI_PL_COPY_PART3,
  ...ANTKI_PL_COPY_PART4,
  ...ANTKI_PL_COPY_PART5,
  ...ANTKI_PL_COPY_PART6,
  ...ANTKI_DOROSLI_COPY_PART1,
  ...ANTKI_DOROSLI_COPY_PART2,
  ...ANTKI_DOROSLI_COPY_PART3,
  ...ANTKI_DOROSLI_COPY_PART4,
  ...ANTKI_DOROSLI_COPY_PART5,
  ...ANTKI_DOROSLI_COPY_PART6,
  ...ANTKI_PL_COPY_TESTPACK,
  ...ANTKI_SPORT_COPY_PART1,
  ...ANTKI_SPORT_COPY_PART2,
  ...ANTKI_SPORT_COPY_PART3,
  ...ANTKI_SPORT_COPY_PART4,
  'zal-v2-01-skierowanie-szpital': {
    headline: 'Miałam wyznaczony termin operacji stopy na listopad. Po tym 10-sekundowym teście u fizjoterapeuty skreśliłam skierowanie',
    description: '',
    primaryText: `W zeszły czwartek wyjęłam z szuflady skierowanie na oddział ortopedyczny, przekreśliłam je długopisem na pół i pierwszy raz od 3 lat rozpłakałam się przy kuchennym stole z ulgi, a nie z bólu.

Miałam iść pod nóż w listopadzie - prywatnie za 8200 zł, z wpisaniem w kalendarz 6 tygodni kuśtykania o kulach w sztywnym bucie pooperacyjnym. Gdyby ktoś powiedział mi pół roku temu, że uratuję moją prawą stopę i kolano przed skalpelem nie kolejną blokadą sterydową, tylko dynamicznymi wkładkami stabilizującymi łuk stopy Orthomax StepMax za 50 zł za parę, uznałabym to za żart.

Mam 56 lat. Na moją lewą stopę było już za późno - 2 lata temu przeszłam operację, mam w kości 2 tytanowe śruby i długą bliznę z boku palucha, która rwie przy każdej zmianie pogody. Pamiętam jak dziś 6 tygodni uwięzienia w domu, kiedy mąż musiał pomagać mi wejść pod prysznic, a każda wyprawa na zmianę opatrunku oznaczała ściskanie zębów z bólu.

Kiedy tej wiosny dokładnie ten sam piekący, kłujący ból pojawił się w mojej prawej stopie i zaczął ciągnąć aż do wewnętrznej strony kolana, ogarnęła mnie czarna rozpacz. Przez 7 dni po cichu obserwowałam własne ciało i widziałam, jak historia powtarza się krok po kroku. Rano o 6:00 szłam do łazienki jak na szczudłach, trzymając się framugi drzwi. W pracy nie byłam w stanie ustać w miejscu dłużej niż 2 minuty, bo śródstopie paliło żywym ogniem, jakbym stała boso na rozżarzonym węglu.

Próbowałam wszystkiego, żeby tylko nie wracać na stół operacyjny:
- Wizyty u ortopedów i badania: 650 zł (usłyszałam tylko: „taka pani uroda, widzimy się na zabiegu").
- 10 zabiegów fali uderzeniowej i ultradźwięki: 1100 zł (ból na kozetce taki, że człowiek odruchowo wyrywa nogę, a ulga minęła po 3 tygodniach).
- Silikonowe kliny między palce, opaski z plastikowym patykiem na noc i 6 tubek maści z diklofenakiem: 390 zł (efektów zero).
- Twarde wkładki termoplastyczne robione na wymiar w punkcie ortopedycznym: 420 zł. Były sztywne jak plastikowa deska, podnosiły stopę tak wysoko, że wysadzały mi piętę z każdego buta i po 3 dniach wylądowały w pudełku w szafie.

Łącznie wydałam 2560 zł, a prawa kostka uciekała do środka coraz bardziej.

Przełom nastąpił przypadkiem, gdy poszłam do młodego fizjoterapeuty, żeby rozmasował mi przeciążone prawe kolano. Spojrzał na moje zdarte od wewnętrznej strony botki stojące przy drzwiach i nawet nie kazał mi kłaść się na kozetce.

- Proszę zdjąć buty i stanąć boso przed lustrem - powiedział spokojnie.
Stanęłam na macie.
- Widzi pani swoją lewą, zoperowaną stopę? - zapytał.
- Widzę. Jest prosta przy palcu - odpowiedziałam.
- Przy palcu tak. Ale niech pani spojrzy na kostkę. Nadal wali się do środka, prawda? A teraz niech pani patrzy na prawą nogę.

Uklęknął przy moich stopach i dwoma palcami uniósł od spodu mój prawy łuk podłużny, jednocześnie ustawiając piętę w pionie. Trwało to może 10 sekund.

Wstrzymałam oddech. W lustrze zobaczyłam, jak moja prawa kostka natychmiast wraca na miejsce, wykrzywione do środka kolano prostuje się w osi, a piekące napięcie pod podeszwą znika w ułamku sekundy. Kiedy puścił dłoń - cała stopa znów rozlała się na boki jak namiot bez masztu, a kolano uciekło do wewnątrz.

- Chirurg wyciął pani w lewej stopie tylko skutek, ale zostawił przyczynę - wyjaśnił. - Pani więzadła po 50-tce straciły sprężystość. Kiedy robi pani 7000 kroków dziennie po twardych panelach i chodnikach, działa brutalna fizyka:

Zapadnięty łuk stopy i uciekająca do środka pięta
↓
Rotacja kości piszczelowej przy każdym kroku
↓
Wypychanie stawu przy paluchu na zewnątrz i miażdżenie wewnętrznej strony kolana
↓
Przekrzywienie miednicy i palący ból w lędźwiach

- Dopóki nie podeprzemy dynamicznie łuku i nie utrzymamy pięty w pionie, każde leczenie maścią, falą czy nawet skalpelem to walka z wiatrakami - dodał. - Ale nie może pani włożyć do buta sztywnej plastikowej deski za 400 zł, bo stopa potrzebuje amortyzacji i sprężyny, a nie gipsu.

Tego samego wieczoru na grupie dla kobiet po operacjach stóp przeczytałam o wkładkach Orthomax StepMax. Wkładki Orthomax StepMax są zrobione z elastycznej pianki - nie są twarde jak plastikowe wkładki ze sklepu medycznego za 400 zł, tylko miękko podpierają łuk stopy od dołu i trzymają piętę prosto przy chodzeniu, a przy tym wchodzą do zwykłych jesiennych botków bez wysadzania pięty.

Zamówiłam od razu Pakiet 1+1 GRATIS za 99,99 zł (wyszło 50 zł za parę - jedną parę włożyłam do moich czarnych botków, a drugą do kapci, w których chodzę po twardych kafelkach w domu).

Pierwsze 3 dni były dziwne - czułam pod stopą wyraźne, sprężyste podparcie dokładnie tam, gdzie wcześniej była pustka.
Po 2 tygodniach złapałam się na tym, że o 6:00 rano wstaję z łóżka i idę do kuchni zaparzyć herbatę normalnym krokiem, bez chwytania się ściany i bez uczucia stąpania po szkle.
Po 6 tygodniach pieczenie w prawym śródstopiu i kłucie w kolanie wyciszyły się tak bardzo, że w zeszły czwartek zadzwoniłam do kliniki i oficjalnie odwołałam listopadowy termin zabiegu.

Jeśli masz po 50-tce dość łykania tabletek, chowania spuchniętych stóp i słuchania, że zostaje Ci już tylko stół operacyjny albo zastrzyki - nie popełniaj mojego błędu z lewej nogi.

Teraz na oficjalnej stronie trwa promocja Pakiet 1+1 GRATIS (2 pary za 99,99 zł, czyli 50 zł za parę). Co najważniejsze, masz pełne 30 dni gwarancji zwrotu bez ryzyka - nawet jeśli będziesz w nich chodzić przez miesiąc, a nie poczujesz ulgi, oddadzą Ci pieniądze.

Sprawdź dostępność swojego rozmiaru tutaj:
https://orthomax.pl/products/orthomax-stepmax

P.S. Koniecznie weź pakiet 2 par i włóż drugą parę do obuwia domowego. Robimy po mieszkaniu na twardych panelach i płytkach ponad 3000 kroków dziennie - jeśli zdejmujesz buty po powrocie z pracy i chodzisz boso albo w płaskich kapciach, Twoje więzadła zapadają się od nowa.`,
  },
  'zal-v2-02-dwa-rtg-kolano-stopa': {
    headline: 'Ortopeda pokazał mi na ekranie 2 zdjęcia RTG i zapytał: „Woli pani podprzeć łuk stopy dzisiaj, czy za 4 lata wymieniamy kolano?"',
    description: '',
    primaryText: `Kiedy lekarz wyświetlił na monitorze zdjęcie stalowej endoprotezy kolana obok prześwietlenia mojej własnej stopy i stuknął niebieskim długopisem w ekran, w gabinecie zapadła głucha cisza.

- Pani Iwono, wybór należy do pani - powiedział krótko. - Albo ustawimy tę zapadniętą kostkę i łuk stopy dzisiaj za grosze, albo za 4 lata spotkamy się na oddziale na wycięciu stawu kolanowego. Decyzję podjęłam w 10 sekund, a moje kolana i pięty uratowały dynamiczne wkładki ortopedyczne Orthomax StepMax z pakietu 1+1 za 99,99 zł (50 zł za parę), które dzisiaj noszę w każdej parze butów.

Mam 54 lata i przez ostatnie 2 lata żyłam w przekonaniu, że moje kolana i biodra po prostu „zużyły się z wiekiem". Zaczęło się niewinnie - najpierw piekący ból pod piętą i śródstopiem po całym dniu na nogach, a potem chrupanie i kłucie po wewnętrznej stronie kolan przy każdym schodzeniu ze schodów.

Przez tydzień uważnie obserwowałam, jak bardzo ten ból odebrał mi normalne życie. Na spacerze z psem co 200 metrów szukałam wzrokiem ławki, udając przed sąsiadami, że sprawdzam coś w telefonie. W nocy budził mnie tępy ból łydek, a rano schodziłam z 1 piętra bokiem, dostawiając stopę do stopy jak 80-letnia staruszka i trzymając się oburącz barierki.

Wydałam w półtora roku małą fortunę na leczenie kolan i stóp:
- 3 zastrzyki z kwasu hialuronowego wbite igłą prosto w kolano: 1200 zł (ulga na 5 tygodni, potem ból wrócił).
- Seria zabiegów na NFZ (lasery, jonoforeza, pole magnetyczne i naświetlania lampą sollux): stracone 3 tygodnie i zero poprawy.
- Maści przeciwzapalne, kolagen w saszetkach do picia i blistry Ketonalu: 480 zł.
- Sztywne wkładki robione na zamówienie za 380 zł: twarde jak deska do krojenia, obcierały łuk stopy do krwi i wysadzały piętę z półbutów.

W sumie 2060 zł wyrzucone w błoto, a ja z miesiąca na miesiąc chodziłam coraz gorzej.

Dopiero na prywatnej konsultacji u specjalisty biomechaniki ruchu usłyszałam prawdę, o której nikt w przychodni rejonowej nawet się nie zająknął. Lekarz nie zaczął od badania kolana. Kazał mi zdjąć buty, podwinąć nogawki do połowy łydki i przejść 5 kroków po gabinecie.

- Niech pani spojrzy na swoje buty - pokazał na moje jesienne półbuty. Obcasy od wewnętrznej strony były starte pod skosem jak ścięte nożem.
- Myślałam, że teraz robią taką słabą gumę - bąknęłam.
- To nie guma, pani Bożeno. To pani kość piętowa ucieka pod kątem 12 stopni do środka przy każdym kroku. Proszę stanąć boso.

Podszedł, ujął dłońmi moje stopy i uniósł od spodu wewnętrzne sklepienie stopy o niecałe 2 centymetry.

- Proszę teraz ugiąć kolana. Boli? - zapytał.
Ugięłam. Pierwszy raz od kilkunastu miesięcy w prawym kolanie nie poczułam żadnego ukłucia.
- Nie boli... Jak to możliwe? - zapytałam w szoku.
- Bo pani kolano jest ofiarą, a winowajca siedzi w bucie - odpowiedział i pokazał mi długopisem na monitorze dwa zdjęcia RTG.

Wyjaśnił mi łańcuch, który niszczy stawy milionom kobiet po 45 roku życia:

Zapadnięty łuk stopy na twardym betonie i panelach
↓
Kość piętowa przechyla się do wewnątrz (nadmierna pronacja)
↓
Piszczel rotuje do środka jak wykręcana śruba
↓
Wewnętrzna część kolana ociera kością o kość przy każdym z 8000 kroków dziennie
↓
Biodro i kręgosłup lędźwiowy przejmują całe uderzenie od podłoża

- Wbijanie zastrzyków za 1200 zł w kolano bez wypoziomowania stopy to jak wymiana opon w samochodzie, który ma skrzywioną oś - powiedział wprost. - Za miesiąc zetrze je pani z powrotem. Musi pani podeprzeć łuk dynamicznie, przy każdym kroku w pracy i w domu.

Na forum dla osób ze zwyrodnieniem stawów kilkadziesiąt kobiet polecało wkładki Orthomax StepMax. Wkładki Orthomax StepMax są zrobione z elastycznej pianki - nie są twarde jak plastikowe wkładki ze sklepu medycznego za 400 zł, tylko miękko podpierają łuk stopy od dołu i trzymają piętę prosto przy chodzeniu, wybierając wstrząsy od twardego chodnika, zanim uderzą w kolano.

Wzięłam od razu Pakiet 1+1 GRATIS za 99,99 zł (czyli po 50 zł za parę). Jedną parę włożyłam do butów wyjściowych, a drugą do domowych kapci.

Po pierwszych 4 dniach przestały mi puchnąć kostki wieczorem.
Po 2 tygodniach zorientowałam się na klatce schodowej, że schodzę z 1 piętra normalnie, krok za krokiem, niosąc w obu rękach siatki z zakupami.
Dzisiaj mija 3 miesiąc. Nie wzięłam ani jednej tabletki przeciwbólowej od 7 tygodni, a wczoraj zrobiłam z psem 5 kilometrów po parku bez szukania ławki.

Nie czekaj, aż ortopeda pokaże Ci na monitorze endoprotezę. Dopóki staw można odciążyć ustawieniem osi stopy, masz szansę zatrzymać ten proces za ułamek ceny jednego zastrzyku.

Na stronie jest teraz aktywny Pakiet 1+1 GRATIS (2 pary za 99,99 zł) objęty 30-dniową gwarancją satysfakcji - możesz chodzić w nich przez pełne 30 dni, a jeśli nie poczujesz różnicy w kolanach i stopach, zwrócisz je bez problemu.

Kliknij tutaj i wybierz swój rozmiar:
https://orthomax.pl/products/orthomax-stepmax

P.S. Nie kupuj 1 pary z myślą, że będziesz ją przekładać z butów do kapci po powrocie do domu - po 3 dniach o tym zapomnisz, a chodzenie boso po twardych panelach w kuchni cofa cały efekt odciążenia kolan.`,
  },
  'zal-v2-03-pudelko-wstydu-2140zl': {
    headline: 'Wysypałam do pudełka po butach 2140 zł moich błędów: maści, silikonowe kliny i sztywne wkładki za 420 zł',
    description: '',
    primaryText: `Zrobiłam to zdjęcie wczoraj w kuchni, zanim wyrzuciłam całe to pudełko do śmietnika - leży w nim dokładnie 2140 zł moich naiwnych prób ratowania piekących stóp, ostrogi i rosnącego haluksa.

Przez półtora roku dawałam się naciągać na każdy gadżet z apteki i drogie zabiegi, podczas gdy rozwiązanie, które w końcu postawiło mnie na nogi i pozwoliło normalnie chodzić przez 8 godzin bez bólu, kosztowało 50 zł za parę (Pakiet 1+1 wkładek dynamicznych Orthomax StepMax za 99,99 zł).

Mam 52 lata. Przez lata wyrabiałam kilometrówki w pracy i po mieście w zwykłych, płaskich butach, nie mając pojęcia, że z każdym miesiącem mój łuk poprzeczny i podłużny zapadają się do zera. Tej jesieni doszło do tego, że po godzinie stania w kuchni czułam pod śródstopiem i piętą palący ogień, jakbym stała na rozżarzonym węglu, a kość przy dużym palcu zaczerwieniła się i rozepchała moje ulubione skórzane botki tak, że nie mogłam dopiąć zamka.

Przez tydzień zapisywałam każdy moment, w którym stopy odbierały mi godność. W pracy bałam się wstać zza biurka po godzinie siedzenia, bo przez pierwsze 5 kroków kuśtykałam na sztywnych kostkach i udawałam, że poprawiam szalik, żeby nikt nie widział mojego grymasu. W sklepie obuwniczym wyszłam z przymierzalni z czerwonymi ze wstydu policzkami, bo po 30 latach noszenia rozmiaru 38 musiałam poprosić o człapiące buty w rozmiarze 40, tylko po to, żeby zmieścić rozlaną na szerokość stopę.

Zobaczcie, co uzbierało się w moim pudełku po butach i dlaczego nic z tego nie zadziało:
- Silikonowe kliny między palce i plastikowe szyny na noc z rzepami: 240 zł (budziłam się w nocy z bólu, a po zdjęciu klinu paluch w 5 sekund wracał na stare miejsce).
- Żelowe podpiętki i miękkie wkładki z drogerii: 160 zł (ugniotły się na płaski naleśnik po tygodniu, a silikonowa podpiętka tylko paskudnie obtarła mi piętę na krótkim spacerze).
- 8 tubek żeli przeciwbólowych i maści na haluksy z apteki: 320 zł (smarowanie skóry nad wykrzywioną mechanicznie kością nic nie daje).
- Seria fali uderzeniowej i prądów prywatnie: 1000 zł.
- Twarde wkładki ortopedyczne robione na zamówienie: 420 zł. Jeden lekarz kazał mi je wyrobić za ponad 400 zł, a efekt był taki, że sztywny plastik wbijał mi się w podbicie jak kamień, wysadzał piętę z buta i po 3 dniach wyjęłam je w pracy w toalecie ze łzami w oczach.

Łącznie 2140 zł. Kiedy poszłam do niezależnego podologa i pokazałam mu te sztywne wkładki za 420 zł oraz garść silikonowych klinów, tylko pokręcił głową i postukał twardą wkładką o kant stołu.

- Niech pani posłucha tego dźwięku - powiedział. - Założyła pani na zmęczone stopy twardą deskę, a między palce włożyła kawałek silikonu. Czy naprawdę myśli pani, że haluks robi się na palcu, a ostroga bierze się z powietrza?
- A skąd się bierze? - zapytałam.
- Proszę stanąć boso na podłodze.

Kazał mi stanąć w rozkroku, po czym podłożył dłonie pod moje stopy i uniósł łuk podłużny oraz śródstopie.

- Niech pani spojrzy w dół na swoje stopy - powiedział.
Spojrzałam i zamarłam. Kiedy tylko uniósł moje sklepienie stopy, rozlana na boki stopa natychmiast zwęziła się o prawie centymetr, a duży palec sam wyprostował się w stawie bez żadnego silikonowego klina! Kiedy puścił - kostka poleciała do środka, a stopa znów rozpłaszczyła się na podłodze jak żelazko.

- Pani stopa to namiot, w którym runął główny maszt - wytłumaczył mi obrazowo. - Kiedy kostka ucieka do środka, uruchamia się domino:

Zapadnięcie łuku podłużnego i poprzecznego stopy
↓
Stopa rozlewa się na szerokość i wydłuża pod ciężarem ciała
↓
Przy każdym kroku odpycha się pani z bocznej krawędzi palucha, wypychając haluksa na zewnątrz
↓
Rozcięgno pod piętą naciąga się jak struna i szarpie kość piętową przy każdym z 8000 kroków dziennie

- Silikon między palcami nie podniesie pani kostki, a sztywna deska za 420 zł blokuje naturalną pracę mięśni - podsumował.

Jeszcze tego samego dnia znalazłam wkładki Orthomax StepMax i zamówiłam Pakiet 1+1 GRATIS za 99,99 zł (50 zł za parę). Wkładki Orthomax StepMax są zrobione z elastycznej pianki - nie są twarde jak plastikowe wkładki ze sklepu medycznego za 400 zł, tylko miękko podpierają łuk stopy od dołu i trzymają piętę prosto przy chodzeniu, a przy tym bez problemu zmieściły się do moich botków w rozmiarze 38.

W pierwszym tygodniu przestało mnie palić śródstopie po powrocie z pracy.
Po 3 tygodniach zapięłam bez żadnego siłowania zamek w moich zeszłorocznych skórzanych botkach, bo podparta stopa przestała rozlewać się na boki.
Po 2 miesiącach wyrzuciłam do kosza wszystkie maści i silikonowe separatory - mogę stać przy kuchence i chodzić po mieście godzinami bez wrażenia stąpania po rozżarzonym węglu.

Zanim wydasz kolejne 400 zł na twarde wkładki w punkcie medycznym albo kolejną tubkę żelu z apteki, daj swoim stopom prawdziwe, dynamiczne podparcie.

Teraz na stronie producenta odbierzesz Pakiet 1+1 GRATIS (2 pary za 99,99 zł, czyli 50 zł za parę) z pełną gwarancją na 30 dni.

Zamów swój rozmiar z gwarancją 30 dni tutaj:
https://orthomax.pl/products/orthomax-stepmax

P.S. W zestawie dostajesz 2 pary nie bez powodu - jedną włóż od razu do butów, w których wychodzisz z domu, a drugą do kapci albo butów zmiennych w pracy, żeby stopa nie zapadała się przez pozostałe 10 godzin dnia.`,
  },
  'zal-v2-04-szczudla-6-rano-korytarz': {
    headline: 'O 6:00 rano szłam do łazienki jak na szczudłach, trzymając się framugi. Myślałam, że po 50-tce to już kalectwo na całe życie',
    description: '',
    primaryText: `Przez 11 miesięcy każdy mój poranek o 6:00 wyglądał dokładnie tak samo: zanim w ogóle odważyłam się postawić stopę na parkiecie, siedziałam na brzegu łóżka i przez 2 minuty przyciągałam palce stóp do siebie, bojąc się pierwszego kroku jak ognia.

Pierwsze 10 metrów przez przedpokój do łazienki szłam jak na szczudłach, trzymając się kurczowo framugi drzwi i ściany, bo w prawą piętę i śródstopie wbijał się żywy gwóźdź. Dzisiaj wstaję z łóżka na pełne stopy bez żadnego bólu - a postawiły mnie na nogi nie kolejne zastrzyki sterydowe w piętę ani fala uderzeniowa za 1500 zł, tylko dynamiczne wkładki ortopedyczne Orthomax StepMax z pakietu 1+1 za 99,99 zł (50 zł za parę).

Mam 55 lat. Kiedy rok temu zaczął się ten poranny koszmar z rozcięgnem podeszwowym i ostrogą piętową, słyszałam od wszystkich wkoło, że „w tym wieku to normalne i trzeba swoje wycierpieć".

Przez 7 dni obserwowałam siebie i chciało mi się płakać z bezsilności. Nie tylko poranki były dramatem. Wystarczyło, że w ciągu dnia usiadłam na pół godziny do obiadu albo przed telewizorem - kiedy wstawałam z krzesła, stopy znów były sztywne jak z drewna, a ja musiałam zrobić 15 kuśtykających kroków po pokoju, żeby w ogóle „rozchodzić" piętę. Wieczorem turlałam pod stopą zamrożoną butelkę wody z zamrażarki i piłeczkę tenisową ze łzami w oczach, pytając męża, czy to już kalectwo do końca życia.

Przeszłam przez całą ścieżkę, którą doskonale zna każda kobieta z bólem pięt i stóp:
- 2 blokady sterydowe wbite długą igłą prosto w piętę: 500 zł. Pierwszy zastrzyk wyłączył ból na 4 tygodnie, ale potem nastąpił nawrót 2 razy gorszy niż wcześniej - bo wcześniej bolała mnie tylko pięta, a po zejściu blokady zaczęło boleć śródstopie, boczna krawędź stopy i kolano.
- 10 zabiegów fali uderzeniowej: 1200 zł (ból podczas zabiegu taki, że człowiek niemal kopie terapeutę, a poprawa minęła po miesiącu).
- Ultradźwięki, jonoforeza i okłady z liści kapusty oraz maści z apteki: 280 zł.
- Żelowe podpiętki z niebieskim kółkiem z apteki: 90 zł (pięta zapadała się w miękki żel, a łuk stopy wisiał w powietrzu i rwał jeszcze mocniej).

Wydałam 2070 zł, a każdego ranka o 6:00 dalej stałam w drzwiach sypialni z zaciśniętymi zębami.

Prawdziwą przyczynę wyjaśnił mi dopiero starszy fizjoterapeuta, do którego trafiłam z polecenia sąsiadki. Kiedy powiedziałam mu o zamrożonej butelce wody i żelowych podpiętkach pod samą piętę, kazał mi zdjąć kapcie i stanąć boso na podłodze.

- Niech pani spojrzy na swoje kostki - powiedział. - Widzi pani, jak lewa i prawa pięta uciekają do środka, a całe śródstopie leży płasko na parkiecie?
- Widzę, ale mnie boli pod piętą, a nie w kostce - odpowiedziałam.
- Bo pod piętą ma pani tylko miejsce pożaru, a podpalaczem jest zapadający się łuk stopy - odparł krótko.

Uklęknął, chwycił dłońmi moją prawą piętę, ustawił ją pionowo i podparł palcami mój łuk podłużny od spodu.
- Proszę teraz przenieść cały ciężar ciała na tę piętę - polecił.
Stanęłam całym ciężarem na prawej nodze. Ku mojemu niedowierzaniu kłujący „gwóźdź" pod piętą zniknął niemal całkowicie! Kiedy zabrał dłoń i kostka znów zapadła się do środka - ból pod piętą natychmiast wrócił jak ukłucie szpilką.

Wytłumaczył mi mechanizm, którego żaden lekarz od zastrzyków wcześniej mi nie narysował:

W nocy, kiedy śpisz, stopa opada, a naderwane rozcięgno pod piętą próbuje się zabliźnić w skróconej pozycji
↓
O 6:00 rano stajesz boso lub w płaskim kapciu na twardym parkiecie
↓
Niepodparty łuk stopy zapada się pod ciężarem ciała, a pięta ucieka do środka
↓
Rozcięgno naciąga się gwałtownie jak cięciwa łuku i pierwszym krokiem zrywasz całą nocną regenerację
↓
Przez kolejne 14 godzin robisz 8000 kroków na zapadniętym łuku, szarpiąc kość piętową w kółko

- Żadne fale uderzeniowe ani blokady pani nie wyleczą, jeśli rano po wyjściu z łóżka staje pani na płaskiej podeszwie i jednym krokiem rozrywa tkankę na nowo - powiedział. - Sama miękka podpiętka pod piętę też nic nie daje, bo śródstopie dalej wisi w powietrzu. Musi pani podeprzeć cały łuk podłużny i utrzymać piętę prosto od pierwszego kroku rano aż do wieczora.

Z jego gabinetu wyszłam z jednym postanowieniem: koniec z płaskimi kapciami i płaskimi butami. Zamówiłam wkładki Orthomax StepMax w Pakiecie 1+1 GRATIS za 99,99 zł (50 zł za parę). Wkładki Orthomax StepMax są zrobione z elastycznej pianki - nie są twarde jak plastikowe wkładki ze sklepu medycznego za 400 zł, tylko miękko podpierają łuk stopy od dołu i trzymają piętę prosto przy chodzeniu. Jedną parę włożyłam do krytych kapci stojących zaraz przy łóżku, a drugą do butów codziennych.

Już po 5 dniach poranny ból spadł o połowę - przestałam trzymać się framugi w korytarzu.
Po 3 tygodniach nocne mikrouszkodzenia wreszcie miały szansę się zagoić, bo żaden poranny krok ich nie zrywał.
Dzisiaj rano wstaję z łóżka płynnie, idę prosto do kuchni, a po godzinie siedzenia przy stole wstaję bez żadnego kuśtykania.

Jeśli każdy Twój poranek zaczyna się od strachu przed postawieniem pięty na podłodze, przestań zrywać własne więzadła płaskim obuwiem.

Odbierz na oficjalnej stronie Pakiet 1+1 GRATIS (2 pary za 99,99 zł, czyli 50 zł za parę). Masz pełne 30 dni gwarancji zwrotu bez ryzyka - możesz testować je przez 30 dni, a jeśli poranne „szczudła" nie znikną, oddadzą Ci co do grosza.

Sprawdź swój rozmiar tutaj:
https://orthomax.pl/products/orthomax-stepmax

P.S. Pamiętaj o żelaznej zasadzie przy ostrodze i rozcięgnie: druga para z zestawu 1+1 musi leżeć w kapciach tuż przy łóżku, żeby nawet pierwszy poranny krok o 6:00 rano był już na podpartym łuku stopy.`,
  },
  'zal-v2-05-skutek-vs-przyczyna-lustro': {
    headline: 'Dlaczego po operacji za 8100 zł ból i kość wracają? Fizjoterapeuta pokazał mi to w 10 sekund przed lustrem',
    description: '',
    primaryText: `Spojrzyjcie na to zdjęcie moich stóp przed lustrem w gabinecie: na lewej stopie widać długą bliznę po operacji za 8100 zł, po której kostka i tak dalej zapada się do środka, a na prawej dłonie fizjoterapeuty pokazują 10-sekundowy test, który uratował mnie przed drugim zabiegiem.

Przez 2 lata myślałam, że wycięcie kości skalpelem zamyka temat raz na zawsze. Dopiero kiedy ból wrócił, a druga stopa zaczęła puchnąć i wykrzywiać kolano, dowiedziałam się, że operacja usuwa tylko skutek, a prawdziwą przyczynę musiałam zatrzymać dynamicznymi wkładkami Orthomax StepMax z pakietu 1+1 za 99,99 zł (50 zł za parę).

Mam 55 lat. Kiedy szłam na operację lewej stopy, chirurg obiecywał, że po 6 tygodniach w bucie ortopedycznym zapomnę o problemie. Zapłaciłam 8100 zł, wycierpiałam tygodnie z nogą uniesioną na poduszce, wydałam kolejne 640 zł na taksówki na zmiany opatrunków i rehabilitację. Minęło kilkanaście miesięcy i przeżyłam lodowaty prysznic: lewa kostka znów zaczęła uciekać do środka, pod śródstopiem pojawił się piekący modzel, a w prawej stopie i prawym kolanie zaczął się dokładnie ten sam koszmar, bo przez miesiące oszczędzania lewej nogi przenosiłam cały ciężar ciała na prawą stronę.

Przez tydzień obserwowałam swoje stopy po kąpieli na ciemnych kafelkach w łazience. Zamiast normalnego wcięcia po wewnętrznej stronie widziałam dwa mokre, płaskie prostokąty. Po całym dniu w pracy moje kostki były spuchnięte jak bochenki, a łydki twarde jak kamień i łapały mnie nocne skurcze.

Próbowałam ratować się wszystkim, co polecali w aptece i przychodni:
- Operacja lewej stopy i dojazdy na opatrunki: 8740 zł.
- Maści z heparyną, żele przeciwzapalne i tabletki: 310 zł.
- Gotowe wkładki żelowe z marketu i apteki: 140 zł (były miękkie jak gąbka i pod ciężarem ciała zapadały się do zera).
- Sztywne wkładki korekcyjne robione na zamówienie za 400 zł: twardy profil wbijał się w moją bliznę pooperacyjną, a pięta wyskakiwała z buta przy każdym kroku.

Łącznie 9590 zł. Kiedy załamana poszłam do fizjoterapeuty specjalizującego się w biomechanice stopy, postawił za moimi plecami niskie lustro diagnostyczne i kazał mi stanąć boso na szarej macie.

- Proszę spojrzeć w lustro na swoje pięty od tyłu - powiedział.
Spojrzałam. Obie moje pięty, również ta w zoperowanej za 8100 zł lewej nodze, wyginały się do wewnątrz jak litera X.
- Dlaczego lewa stopa dalej ucieka, skoro mam w niej śruby? - zapytałam z niedowierzaniem.
- Bo śruby trzymają tylko pierwszą kość śródstopia przy palcu, a cała pani pięta i łuk podłużny wiszą w powietrzu bez żadnego wsparcia - odpowiedział spokojnie.

Założył niebieskie rękawiczki, uklęknął i swoimi dłońmi objął moją prawą piętę oraz uniósł łuk stopy od spodu.

- A teraz niech pani patrzy w lustro na prawą nogę i kolano - powiedział.
W ciągu 3 sekund moja prawa pięta stanęła równiutko w pionie, ścięgno Achillesa wyprostowało się jak struna, a kolano przestało uciekać do środka.
- Czuje pani ucisk w śródstopiu albo w kolanie?
- Nic. Kompletnie puściło - wydusiłam z siebie.

Wytłumaczył mi prostą fizykę, której nikt nie mówi pacjentkom przed zabiegiem:

Skalpel ścina narośl z boku stopy, ale nie naprawia rozciągniętych więzadeł pod kostką
↓
Wracasz po zabiegu do swoich zwykłych butów z płaską podeszwą w środku
↓
Przy każdym z 8000 kroków dziennie po betonie i panelach pięta znów wali się do wewnątrz
↓
Stopa rozlewa się na szerokość, miażdży nerwy pod palcami i ponownie wypycha staw na zewnątrz
↓
Przeciążona druga noga przejmuje podwójny ciężar i niszczy kolano dwa razy szybciej

- Niezależnie od tego, czy jest pani przed operacją, czy po niej, bez codziennego utrzymania pięty w pionie i elastycznego podparcia łuku grawitacja zawsze wygra - podsumował.

Polecono mi wtedy dynamiczne wkładki Orthomax StepMax. Wkładki Orthomax StepMax są zrobione z elastycznej pianki - nie są twarde jak plastikowe wkładki ze sklepu medycznego za 400 zł, tylko miękko podpierają łuk stopy od dołu i trzymają piętę prosto przy chodzeniu, nie drażniąc nawet wrażliwej stopy po zabiegu.

Zamówiłam Pakiet 1+1 GRATIS za 99,99 zł (50 zł za parę) - jedną parę włożyłam do półbutów do pracy, a drugą do butów codziennych.

Po tygodniu noszenia zniknęło pieczenie pod obiema stopami i nocne skurcze łydek.
Po miesiącu moja prawa stopa i kolano całkowicie przestały boleć przy chodzeniu po schodach, a lewa, zoperowana noga wreszcie dostała stabilne podparcie i przestała puchnąć wokół blizny.

Nie pozwól, żeby Twoje stopy i kolana płaciły cenę za chodzenie po twardym betonie bez podparcia łuku.

Skorzystaj z promocji Pakiet 1+1 GRATIS (2 pary wkładek Orthomax StepMax za 99,99 zł, czyli 50 zł za parę). Zamówienie chroni pełne 30 dni gwarancji zwrotu - możesz chodzić w nich przez miesiąc, a jeśli nie poczujesz ulgi, otrzymasz zwrot pieniędzy.

Wybierz swój rozmiar tutaj:
https://orthomax.pl/products/orthomax-stepmax

P.S. Nawet jeśli miałaś już kiedyś zabieg na jedną stopę albo kolano, tym bardziej musisz odciążyć obie nogi naraz - organizm podświadomie przenosi ciężar na zdrową stronę, przez co niszczy ją dwa razy szybciej.`,
  },
};

const TESTPACK_NATIVE_PAGE_NAME_MAP: Record<string, string> = {
  'pl-29-zal-wozek-inwalidzki-beata': 'Iwona Kożuchowska',
  'dorosli-01-sor-zablokowane-kolano': 'Iwona Kożuchowska',
  'dorosli-02-sor-rwa-kulszowa-kregoslup': 'Iwona Kożuchowska',
  'dorosli-03-sor-biodro-blokada-schody': 'Iwona Kożuchowska',
  'dorosli-04-sor-piekacy-nerwiak-przodostopie': 'Iwona Kożuchowska',
  'dorosli-12-ryciak-dorosli-ledzwie-dyskopatia': 'Iwona Kożuchowska',
  'dorosli-13-ryciak-dorosli-kolano-zwyrodnienie': 'Iwona Kożuchowska',
  'dorosli-14-ryciak-dorosli-biodro-asymetria': 'Iwona Kożuchowska',
  'dorosli-16-ostroga-pierwszy-krok-6-rano': 'Iwona Kożuchowska',
  'dorosli-17-ostroga-fala-uderzeniowa-1500zl': 'Iwona Kożuchowska',
  'dorosli-18-ostroga-zamrozona-butelka': 'Iwona Kożuchowska',
  'dorosli-19-ostroga-zelowe-podpietki-mit': 'Iwona Kożuchowska',
  'dorosli-21-haluks-zimowe-botki-zamek': 'Iwona Kożuchowska',
  'dorosli-22-haluks-wstyd-rozmiar-40': 'Iwona Kożuchowska',
  'dorosli-23-haluks-separatory-i-szyny-mit': 'Iwona Kożuchowska',
  'dorosli-26-zal-lewa-stopa-sruby-8200zl': 'Iwona Kożuchowska',
  'dorosli-27-zal-haluks-siostry-wrocil': 'Iwona Kożuchowska',
  'dorosli-28-zal-uchwyt-pod-prysznicem-52-lata': 'Iwona Kożuchowska',
  'dorosli-29-zal-za-5-lat-endoproteza': 'Iwona Kożuchowska',
  'dorosli-30-zal-artroskopia-kolana-powrot-bolu': 'Iwona Kożuchowska',
  'dorosli-31-praca-8h-na-nogach-kuchnia': 'Iwona Kożuchowska',
  'dorosli-32-praca-mit-twardych-wkladek-400zl': 'Iwona Kożuchowska',
  'dorosli-33-praca-12h-dyzur-szpitalny-beton': 'Iwona Kożuchowska',
  'zal-v2-01-skierowanie-szpital': 'Iwona Kożuchowska',
  'zal-v2-02-dwa-rtg-kolano-stopa': 'Iwona Kożuchowska',
  'zal-v2-03-pudelko-wstydu-2140zl': 'Iwona Kożuchowska',
  'zal-v2-04-szczudla-6-rano-korytarz': 'Iwona Kożuchowska',
  'zal-v2-05-skutek-vs-przyczyna-lustro': 'Iwona Kożuchowska',
  'tp-76-as-dzieci-kapcie-szkolne': 'Porady Mamy Gosi',
  'tp-77-as-dzieci-fizjo-okno': 'Centrum Dobrego Kroku',
  'tp-78-as-dorosli-szatnia-2dzien': 'Iwona Kożuchowska',
  'tp-79-al-dzieci-nalesnik-23zl': 'Porady Mamy Gosi',
  'tp-80-al-dorosli-zel-19zl': 'Centrum Dobrego Kroku',
  'tp-81-al-dorosli-podrobka-27zl': 'Karol Mikołajczyk',
  'sport-82-gory-zejscie-morskie-oko-kolana': 'Karol Mikołajczyk',
  'sport-83-gory-wyjeta-wkladka-800zl': 'Karol Mikołajczyk',
  'sport-84-gory-karkonosze-zona-schronisko': 'Iwona Kożuchowska',
  'sport-85-gory-fizjo-3x-masa-ciala': 'Centrum Dobrego Kroku',
  'sport-86-gory-palace-piety-po-20km': 'Iwona Kożuchowska',
  'sport-87-padel-poranny-gwozdz-w-piete': 'Karol Mikołajczyk',
  'sport-88-padel-hamowanie-bokiem-kostka': 'Karol Mikołajczyk',
  'sport-89-tenis-achilles-sztywny-jak-lina': 'Karol Mikołajczyk',
  'sport-90-padel-ranking-fizjo-kort': 'Centrum Dobrego Kroku',
  'sport-91-tenis-kobieta-pieczenie-srodstopia': 'Porady Mamy Gosi',
  'sport-92-pilka-syn-orlik-bol-piet-severa': 'Porady Mamy Gosi',
  'sport-93-pilka-dorosli-orlik-kolana-38lat': 'Karol Mikołajczyk',
  'sport-94-pilka-korki-tektura-test': 'Karol Mikołajczyk',
  'sport-95-pilka-ojciec-i-syn-pakiet-1plus1': 'Karol Mikołajczyk',
  'sport-96-pilka-zdarte-korki-od-srodka': 'Porady Mamy Gosi',
  'sport-97-bieganie-asfalt-piszczele-5km': 'Karol Mikołajczyk',
  'sport-98-marsze-nordic-walking-15tys-krokow': 'Iwona Kożuchowska',
  'sport-99-bieganie-slow-mo-pronacja-asfalt': 'Porady Mamy Gosi',
  'sport-100-hala-siatkowka-parkiet-ladowanie': 'Karol Mikołajczyk',
  'sport-101-bieganie-anti-allegro-zel-vs-sprezyna': 'Karol Mikołajczyk',
};

export function buildAllArgonPrewrittenAds(
  destinationUrl = ORTHOMAX_PL_DEFAULT_URL,
  pageName = 'Porady Mamy Gosi',
): AntkiPlGeneratedAd[] {
  const batch1Created = Date.parse('2026-10-18T11:00:00+02:00');
  const batch1Updated = Date.parse('2026-10-20T17:00:00+02:00');
  const batch2Created = Date.parse('2026-10-21T12:00:00+02:00');
  const batch2Updated = Date.parse('2026-10-23T18:00:00+02:00');
  const batch3Created = Date.parse('2026-10-29T14:30:00+01:00');
  const batch3Updated = Date.parse('2026-10-29T16:00:00+01:00');
  const batch4Created = Date.parse('2026-11-01T16:30:00+01:00');
  const batch4Updated = Date.parse('2026-11-01T16:40:00+01:00');
  const batch5Created = Date.parse('2026-11-01T19:30:00+01:00');
  const batch5Updated = Date.parse('2026-11-01T20:00:00+01:00');
  return ANTKI_PL_PRESET_ANGLES.map((angle, index) => {
    const isBatch5 = angle.number >= 82;
    const isBatch4 = angle.number >= 76 && angle.number < 82;
    const isBatch3 = angle.number >= 71 && angle.number < 76;
    const isBatch2 = angle.number >= 36 && angle.number < 71;
    const baseCreated = isBatch5
      ? batch5Created
      : isBatch4
      ? batch4Created
      : isBatch3
      ? batch3Created
      : isBatch2
      ? batch2Created
      : batch1Created;
    const baseUpdated = isBatch5
      ? batch5Updated
      : isBatch4
      ? batch4Updated
      : isBatch3
      ? batch3Updated
      : isBatch2
      ? batch2Updated
      : batch1Updated;
    const createdAt = baseCreated + index * 60_000;
    const updatedAt = baseUpdated + index * 60_000;
    const raw = ANTKI_PL_ARGON_AUTHORED_COPY[angle.id];
    if (!raw) {
      throw new Error(`Brak napisanego przez Argona tekstu dla kąta: ${angle.id}`);
    }
    const audited = sanitizeAndAuditAntkiPl(
      raw.primaryText,
      raw.headline || angle.defaultHeadline,
      raw.description,
      angle.defaultHeadline,
    );
    const defaultImg = getDefaultImageForAngle(angle.number);
    const resolvedPageName = TESTPACK_NATIVE_PAGE_NAME_MAP[angle.id] || pageName;
    const resolvedDestinationUrl = angle.defaultDestinationUrl || destinationUrl;
    return {
      id: `antek-pl-argon-${angle.code}`,
      angleId: angle.id,
      code: angle.code,
      title: angle.title,
      segment: angle.segment,
      funnelStage: angle.funnelStage,
      pageName: resolvedPageName,
      headline: audited.headline,
      description: audited.description,
      primaryText: audited.primaryText,
      destinationUrl: resolvedDestinationUrl,
      cta: 'LEARN_MORE',
      imageUrl: angle.defaultImageUrl || defaultImg.url,
      imageHash: angle.defaultImageHash || defaultImg.imageHash,
      secondImageUrl: angle.defaultSecondImageUrl,
      secondImageHash: angle.defaultSecondImageHash,
      wordCount: audited.wordCount,
      characterCount: audited.characterCount,
      auditPassed: audited.auditPassed,
      auditWarnings: audited.auditWarnings,
      auditFixesApplied: audited.auditFixesApplied,
      createdAt,
      updatedAt,
    };
  });
}
