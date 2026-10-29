/**
 * SARDIAN PL — Fabryka Polskich Antków Natywnych (Batch #1: 23 Przebudowane Antki na Starym Winner Desire + Batch #2: 15 Antków na 3 Nowych Desire = 38 Kreacji)
 *
 * Konto reklamowe Meta: act_1168927131917359
 * Kampania Native CBO: 120250060540350298 (CBO 5 nativ)
 * Docelowy URL (100% Product Page): https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie
 */

export type SardianAwarenessStageId =
  | 'stage1_batch1_winner_desire'
  | 'stage2_new_desire_a'
  | 'stage3_new_desire_b'
  | 'stage4_new_desire_c';

export type SardianSophisticationLevel = 3 | 4 | 5;

export type SardianProblemCluster =
  | 'K2_PRYSZNIC_ODPLYW'
  | 'K3_SZWAGIER_TURCJA'
  | 'K4_STARY_FRYZJER'
  | 'K5_REVERSE_FRYZJER'
  | 'K7_PERSPEKTYWA_ZONY'
  | 'NOWY_DESIRE_A_CZOP_DHT'
  | 'NOWY_DESIRE_B_ZEGAR_ANAGENU'
  | 'NOWY_DESIRE_C_REBOUND_SLS';

export interface SardianStageMeta {
  id: SardianAwarenessStageId;
  stageNumber: 1 | 2 | 3 | 4;
  shortLabel: string;
  title: string;
  subtitle: string;
  sophisticationLabel: string;
  sophisticationLevel: SardianSophisticationLevel;
  color: string;
  bgLight: string;
  borderColor: string;
  vocSummary: string;
}

export interface SardianFanpage {
  id: string;
  name: string;
  initials: string;
  role: string;
  badgeColor: string;
}

export interface SardianImageAsset {
  id: string;
  url: string;
  imageHash: string;
  label: string;
  adsetOrigin: string;
  adOrigin: string;
  aspectRatio: string;
  source?: 'ai' | 'meta';
  angleId?: string;
}

export interface SardianAnglePreset {
  id: string;
  number: number;
  code: string;
  title: string;
  shortTitle: string;
  stageId: SardianAwarenessStageId;
  stageNumber: 1 | 2 | 3 | 4;
  sophisticationLevel: SardianSophisticationLevel;
  sophisticationBadge: string;
  problemCluster: SardianProblemCluster;
  problemLabel: string;
  recommendedFanpageId: string;
  recommendedFanpageName: string;
  vocTrigger: string;
  mechanismCore: string;
  defaultImageId: string;
  defaultImageUrl: string;
  defaultImageHash: string;
}

export const SARDIAN_AD_ACCOUNT_ID = '1168927131917359';
export const SARDIAN_PDP_URL = 'https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie';
export const SARDIAN_META_ACCOUNT_ID = SARDIAN_AD_ACCOUNT_ID;
export const SARDIAN_META_NATIVE_CAMPAIGN_ID = '120250060540350298'; // CBO 5 nativ
export const SARDIAN_META_PIXEL_ID = '1583790409799378';
export const SARDIAN_DEFAULT_URL = SARDIAN_PDP_URL;

export const SARDIAN_FANPAGES: SardianFanpage[] = [
  {
    id: '1363490303507686',
    name: 'Karol Mikołajczyk',
    initials: 'KM',
    role: 'Profil Męski (1. os. r. męski: Kąty K2, K3, K4, K5 oraz Nowe Desire A1-A5, B1-B4, C1-C4)',
    badgeColor: '#b45309',
  },
  {
    id: '1276931235504931',
    name: 'Sardian',
    initials: 'SR',
    role: 'Oficjalny Profil Marki SARDIAN (Obowiązkowy dla 1. os. r. żeński: K7_V1-V5, ND_B5, ND_C5 oraz uniwersalny)',
    badgeColor: '#1e293b',
  },
];

export const SARDIAN_STAGES: Record<SardianAwarenessStageId, SardianStageMeta> = {
  stage1_batch1_winner_desire: {
    id: 'stage1_batch1_winner_desire',
    stageNumber: 1,
    shortLabel: 'Batch #1 · Stary Winner Desire (23)',
    title: 'Batch #1: 23 Przebudowane Antki na Starym Winner Desire (MD1 ROAS 2.82)',
    subtitle: '5 kątów wejścia (K2 Prysznic, K3 Szwagier Turcja, K4 Stary Fryzjer, K5 Reverse Fryzjer, K7 Żona) osadzonych w 100% na naszym najlepszym historycznym szkielecie: 70–80% uśpionych cebulek + 92 szampony (96% robi 0 z 3 rzeczy) + Formuła 3 z 3 (Rdest 90% vs 70% minoksydyl, Żeń-szeń + mentol, Biota Orientalis).',
    sophisticationLabel: 'Batch #1 · Proven Winner Desire',
    sophisticationLevel: 4,
    color: '#b45309',
    bgLight: '#fffbeb',
    borderColor: '#fcd34d',
    vocSummary: '„Myślałem, że cebulki są martwe, dopóki nie dowiedziałem się, że 70–80% wciąż żyje pod skórą, a 96% z 92 szamponów w Polsce robi 0 z 3 rzeczy.”',
  },
  stage2_new_desire_a: {
    id: 'stage2_new_desire_a',
    stageNumber: 2,
    shortLabel: 'Nowy Desire A · Czop Łojowo-DHT (5)',
    title: 'Batch #2 (Desire A): Czop Łojowo-DHT i Mikro-Zwłóknienie (Sebum-Cement)',
    subtitle: 'Dlaczego łysiejesz tylko na górze i w zakolach (a boki masz gęste jak u 20-latka) oraz dlaczego błyszcząca, napięta skóra w prześwitach to nie martwe cebulki, lecz woskowy czop łojowo-DHT.',
    sophisticationLabel: 'Batch #2 · Nowy Desire A (5 kopii)',
    sophisticationLevel: 5,
    color: '#1d4ed8',
    bgLight: '#eff6ff',
    borderColor: '#93c5fd',
    vocSummary: '„Zrób 5-sekundowy test 2 palców: nad uchem skóra jest miękka, a na czubku głowy twarda i błyszcząca od woskowego czopa DHT.”',
  },
  stage3_new_desire_b: {
    id: 'stage3_new_desire_b',
    stageNumber: 3,
    shortLabel: 'Nowy Desire B · 3-Tygodniowy Włos (5)',
    title: 'Batch #2 (Desire B): Skrócony Zegar Anagenu (Pułapka 3-Tygodniowego Włosa)',
    subtitle: 'Dlaczego na sitku odpływu pod prysznicem i na poduszce widzisz krótkie, 1–2 cm włoski: Twoje cebulki żyją i produkują nowe włosy, ale DHT skraca ich zegar wzrostu z 4 lat do 21 dni.',
    sophisticationLabel: 'Batch #2 · Nowy Desire B (5 kopii)',
    sophisticationLevel: 5,
    color: '#047857',
    bgLight: '#ecfdf5',
    borderColor: '#6ee7b7',
    vocSummary: '„Spojrzałem na sitko z odpływu pod światło: 8 na 10 moich wypadających włosów miało mniej niż 2 cm długości.”',
  },
  stage4_new_desire_c: {
    id: 'stage4_new_desire_c',
    stageNumber: 4,
    shortLabel: 'Nowy Desire C · Efekt Odbicia SLS (5)',
    title: 'Batch #2 (Desire C): Paradoks Szamponów z SLS (Efekt Odbicia / Rebound DHT)',
    subtitle: 'Jak mycie głowy drogeryjnym lub aptecznym szamponem z SLS zdziera barierę skóry i po 4 godzinach uruchamia paniczny wyrzut 2x większej dawki łoju nasyconego hormonem DHT.',
    sophisticationLabel: 'Batch #2 · Nowy Desire C (5 kopii)',
    sophisticationLevel: 5,
    color: '#7c3aed',
    bgLight: '#f5f3ff',
    borderColor: '#c4b5fd',
    vocSummary: '„Myjesz głowę o 7:00 rano, a o 14:00 włosy na czubku są już oklapnięte i prześwitują? To paniczny Efekt Odbicia DHT po siarczanach SLS.”',
  },
};

export const SARDIAN_IMAGE_LIBRARY: SardianImageAsset[] = [
  {
    "id": "K2_V1_PRYSZNIC_ODPLYW",
    "url": "/sardian-pl-images/K2_V1_PRYSZNIC_ODPLYW.jpg",
    "imageHash": "",
    "label": "K2_V1 · Czyste sitko odpływu pod prysznicem + SARDIAN na półce",
    "adsetOrigin": "Kąt 2: Prysznic & Odpływ",
    "adOrigin": "K2_V1_PRYSZNIC_ODPLYW",
    "aspectRatio": "1:1 (1024x1024)",
    "source": "ai",
    "angleId": "K2_V1_PRYSZNIC_ODPLYW"
  },
  {
    "id": "K2_V2_SITKO_W_DLONI_PRZED_PO",
    "url": "/sardian-pl-images/K2_V2_SITKO_W_DLONI_PRZED_PO.jpg",
    "imageHash": "",
    "label": "K2_V2 · Czyste metalowe sitko w mokrej dłoni po prysznicu",
    "adsetOrigin": "Kąt 2: Prysznic & Odpływ / Nowy Desire B",
    "adOrigin": "K2_V2_SITKO_W_DLONI_PRZED_PO",
    "aspectRatio": "1:1 (1024x1024)",
    "source": "ai",
    "angleId": "K2_V2_SITKO_W_DLONI_PRZED_PO"
  },
  {
    "id": "K2_V3_ZONA_PRZY_KABINIE",
    "url": "/sardian-pl-images/K2_V3_ZONA_PRZY_KABINIE.jpg",
    "imageHash": "",
    "label": "K2_V3 · Żona przyłapana z chusteczką przy odpływie kabiny",
    "adsetOrigin": "Kąt 2: Prysznic & Odpływ",
    "adOrigin": "K2_V3_ZONA_PRZY_KABINIE",
    "aspectRatio": "1:1 (1024x1024)",
    "source": "ai",
    "angleId": "K2_V3_ZONA_PRZY_KABINIE"
  },
  {
    "id": "K2_V4_RECEPTA_W_KOSZU_SARDIAN",
    "url": "/sardian-pl-images/K2_V4_RECEPTA_W_KOSZU_SARDIAN.jpg",
    "imageHash": "",
    "label": "K2_V4 · Zgnieciona recepta w koszu + SARDIAN w dłoni",
    "adsetOrigin": "Kąt 2 / Nowy Desire C",
    "adOrigin": "K2_V4_RECEPTA_W_KOSZU_SARDIAN",
    "aspectRatio": "1:1 (1024x1024)",
    "source": "ai",
    "angleId": "K2_V4_RECEPTA_W_KOSZU_SARDIAN"
  },
  {
    "id": "K2_V5_MOKRE_WLOSY_W_LUSTRZE",
    "url": "/sardian-pl-images/K2_V5_MOKRE_WLOSY_W_LUSTRZE.jpg",
    "imageHash": "",
    "label": "K2_V5 · Gęste mokre włosy w lustrze po prysznicu",
    "adsetOrigin": "Kąt 2 / Nowy Desire A",
    "adOrigin": "K2_V5_MOKRE_WLOSY_W_LUSTRZE",
    "aspectRatio": "1:1 (1024x1024)",
    "source": "ai",
    "angleId": "K2_V5_MOKRE_WLOSY_W_LUSTRZE"
  },
  {
    "id": "K3_V1_TRICHOSCOPE_KAMERA_CEBULKI",
    "url": "/sardian-pl-images/K3_V1_TRICHOSCOPE_KAMERA_CEBULKI.jpg",
    "imageHash": "",
    "label": "K3_V1 · Monitor z kamerą 200x u trychologa (zaczopowane vs czyste cebulki)",
    "adsetOrigin": "Kąt 3 / Nowy Desire A",
    "adOrigin": "K3_V1_TRICHOSCOPE_KAMERA_CEBULKI",
    "aspectRatio": "1:1 (1024x1024)",
    "source": "ai",
    "angleId": "K3_V1_TRICHOSCOPE_KAMERA_CEBULKI"
  },
  {
    "id": "K3_V2_DWAJ_SZWAGRZY_NA_GRILLU",
    "url": "/sardian-pl-images/K3_V2_DWAJ_SZWAGRZY_NA_GRILLU.jpg",
    "imageHash": "",
    "label": "K3_V2 · Dwaj szwagrzy na grillu w ogrodzie (czapka vs gęste włosy)",
    "adsetOrigin": "Kąt 3: Szwagier Turcja 17 000 zł",
    "adOrigin": "K3_V2_DWAJ_SZWAGRZY_NA_GRILLU",
    "aspectRatio": "1:1 (1024x1024)",
    "source": "ai",
    "angleId": "K3_V2_DWAJ_SZWAGRZY_NA_GRILLU"
  },
  {
    "id": "K3_V3_KARTKA_OD_TRYCHOLOGA",
    "url": "/sardian-pl-images/K3_V3_KARTKA_OD_TRYCHOLOGA.jpg",
    "imageHash": "",
    "label": "K3_V3 · Kartka od trychologa na stole obok butelki SARDIAN",
    "adsetOrigin": "Kąt 3 / Nowy Desire B",
    "adOrigin": "K3_V3_KARTKA_OD_TRYCHOLOGA",
    "aspectRatio": "1:1 (1024x1024)",
    "source": "ai",
    "angleId": "K3_V3_KARTKA_OD_TRYCHOLOGA"
  },
  {
    "id": "K3_V4_PAKIET_3_BUTELEK_W_PACZCE",
    "url": "/sardian-pl-images/K3_V4_PAKIET_3_BUTELEK_W_PACZCE.jpg",
    "imageHash": "",
    "label": "K3_V4 · Otwarta paczka z Paczkomatu: 3 butelki SARDIAN (Pakiet 2+1) + szczoteczka",
    "adsetOrigin": "Kąt 3 / Nowy Desire C",
    "adOrigin": "K3_V4_PAKIET_3_BUTELEK_W_PACZCE",
    "aspectRatio": "1:1 (1024x1024)",
    "source": "ai",
    "angleId": "K3_V4_PAKIET_3_BUTELEK_W_PACZCE"
  },
  {
    "id": "K3_V5_CZUBEK_GLOWY_Z_GORY_ODROST",
    "url": "/sardian-pl-images/K3_V5_CZUBEK_GLOWY_Z_GORY_ODROST.jpg",
    "imageHash": "",
    "label": "K3_V5 · Zdjęcie czubka głowy z góry (gęsta korona po 9 tygodniach)",
    "adsetOrigin": "Kąt 3 / Nowy Desire A",
    "adOrigin": "K3_V5_CZUBEK_GLOWY_Z_GORY_ODROST",
    "aspectRatio": "1:1 (1024x1024)",
    "source": "ai",
    "angleId": "K3_V5_CZUBEK_GLOWY_Z_GORY_ODROST"
  },
  {
    "id": "K4_V1_STARY_FRYZJER_BARBER",
    "url": "/sardian-pl-images/K4_V1_STARY_FRYZJER_BARBER.jpg",
    "imageHash": "",
    "label": "K4_V1 · 61-letni polski fryzjer męski z butelką SARDIAN w salonie",
    "adsetOrigin": "Kąt 4 / Nowy Desire A",
    "adOrigin": "K4_V1_STARY_FRYZJER_BARBER",
    "aspectRatio": "1:1 (1024x1024)",
    "source": "ai",
    "angleId": "K4_V1_STARY_FRYZJER_BARBER"
  },
  {
    "id": "K4_V2_FRYZJER_POKAZUJE_SKLAD",
    "url": "/sardian-pl-images/K4_V2_FRYZJER_POKAZUJE_SKLAD.jpg",
    "imageHash": "",
    "label": "K4_V2 · Fryzjer pokazuje palcem na butelkę SARDIAN na konsoli",
    "adsetOrigin": "Kąt 4 / Nowy Desire C",
    "adOrigin": "K4_V2_FRYZJER_POKAZUJE_SKLAD",
    "aspectRatio": "1:1 (1024x1024)",
    "source": "ai",
    "angleId": "K4_V2_FRYZJER_POKAZUJE_SKLAD"
  },
  {
    "id": "K4_V3_KLIENT_NA_FOTELU_GESTE_WLOSY",
    "url": "/sardian-pl-images/K4_V3_KLIENT_NA_FOTELU_GESTE_WLOSY.jpg",
    "imageHash": "",
    "label": "K4_V3 · Klient na fotelu z gęstą górą włosów pokazywaną w lusterku",
    "adsetOrigin": "Kąt 4: Stary Fryzjer 35 lat",
    "adOrigin": "K4_V3_KLIENT_NA_FOTELU_GESTE_WLOSY",
    "aspectRatio": "1:1 (1024x1024)",
    "source": "ai",
    "angleId": "K4_V3_KLIENT_NA_FOTELU_GESTE_WLOSY"
  },
  {
    "id": "K4_V4_MYJKA_FRYZJERSKA_PIANA",
    "url": "/sardian-pl-images/K4_V4_MYJKA_FRYZJERSKA_PIANA.jpg",
    "imageHash": "",
    "label": "K4_V4 · Myjka fryzjerska i gęsta ziołowa mikropiana SARDIAN",
    "adsetOrigin": "Kąt 4 / Nowy Desire A",
    "adOrigin": "K4_V4_MYJKA_FRYZJERSKA_PIANA",
    "aspectRatio": "1:1 (1024x1024)",
    "source": "ai",
    "angleId": "K4_V4_MYJKA_FRYZJERSKA_PIANA"
  },
  {
    "id": "K4_V5_SARDIAN_VS_DROGERIA_KOSZ",
    "url": "/sardian-pl-images/K4_V5_SARDIAN_VS_DROGERIA_KOSZ.jpg",
    "imageHash": "",
    "label": "K4_V5 · SARDIAN w dłoni vs kolorowy szampon z drogerii w koszu",
    "adsetOrigin": "Kąt 4 / Nowy Desire C",
    "adOrigin": "K4_V5_SARDIAN_VS_DROGERIA_KOSZ",
    "aspectRatio": "1:1 (1024x1024)",
    "source": "ai",
    "angleId": "K4_V5_SARDIAN_VS_DROGERIA_KOSZ"
  },
  {
    "id": "K5_V1_KLIENT_POV_MASZYNKA_I_SARDIAN",
    "url": "/sardian-pl-images/K5_V1_KLIENT_POV_MASZYNKA_I_SARDIAN.jpg",
    "imageHash": "",
    "label": "K5_V1 · POV klienta na fotelu: wyłączona maszynka + SARDIAN",
    "adsetOrigin": "Kąt 5: Reverse Fryzjer",
    "adOrigin": "K5_V1_KLIENT_POV_MASZYNKA_I_SARDIAN",
    "aspectRatio": "1:1 (1024x1024)",
    "source": "ai",
    "angleId": "K5_V1_KLIENT_POV_MASZYNKA_I_SARDIAN"
  },
  {
    "id": "K5_V2_KLIENT_POV_SARDIAN_NA_MYJCE",
    "url": "/sardian-pl-images/K5_V2_KLIENT_POV_SARDIAN_NA_MYJCE.jpg",
    "imageHash": "",
    "label": "K5_V2 · POV klienta: mokra butelka SARDIAN na rogu myjki fryzjerskiej",
    "adsetOrigin": "Kąt 5 / Nowy Desire B",
    "adOrigin": "K5_V2_KLIENT_POV_SARDIAN_NA_MYJCE",
    "aspectRatio": "1:1 (1024x1024)",
    "source": "ai",
    "angleId": "K5_V2_KLIENT_POV_SARDIAN_NA_MYJCE"
  },
  {
    "id": "K5_V3_KLIENT_POV_ZDJECIE_NA_KONSOLI",
    "url": "/sardian-pl-images/K5_V3_KLIENT_POV_ZDJECIE_NA_KONSOLI.jpg",
    "imageHash": "",
    "label": "K5_V3 · POV klienta: fryzjer stawia SARDIAN przed lustrem do zdjęcia",
    "adsetOrigin": "Kąt 5: Reverse Fryzjer",
    "adOrigin": "K5_V3_KLIENT_POV_ZDJECIE_NA_KONSOLI",
    "aspectRatio": "1:1 (1024x1024)",
    "source": "ai",
    "angleId": "K5_V3_KLIENT_POV_ZDJECIE_NA_KONSOLI"
  },
  {
    "id": "K7_V1_ZONA_LAZIENKA_PRYSZNIC",
    "url": "/sardian-pl-images/K7_V1_ZONA_LAZIENKA_PRYSZNIC.jpg",
    "imageHash": "",
    "label": "K7_V1 · Kobieca dłoń stawiająca SARDIAN + szczoteczkę pod prysznicem męża",
    "adsetOrigin": "Kąt 7 / Nowy Desire B (Fanpage: Sardian)",
    "adOrigin": "K7_V1_ZONA_LAZIENKA_PRYSZNIC",
    "aspectRatio": "1:1 (1024x1024)",
    "source": "ai",
    "angleId": "K7_V1_ZONA_LAZIENKA_PRYSZNIC"
  },
  {
    "id": "K7_V2_MAZ_PRZED_LUSTREM_Z_TYLU",
    "url": "/sardian-pl-images/K7_V2_MAZ_PRZED_LUSTREM_Z_TYLU.jpg",
    "imageHash": "",
    "label": "K7_V2 · Zdjęcie męża z korytarza, gdy dotyka zakoli przed lustrem",
    "adsetOrigin": "Kąt 7: Perspektywa Żony (Fanpage: Sardian)",
    "adOrigin": "K7_V2_MAZ_PRZED_LUSTREM_Z_TYLU",
    "aspectRatio": "1:1 (1024x1024)",
    "source": "ai",
    "angleId": "K7_V2_MAZ_PRZED_LUSTREM_Z_TYLU"
  },
  {
    "id": "K7_V3_ZESTAW_W_DLONIACH_ZONY",
    "url": "/sardian-pl-images/K7_V3_ZESTAW_W_DLONIACH_ZONY.jpg",
    "imageHash": "",
    "label": "K7_V3 · Zestaw SARDIAN + szczoteczka do masażu w dłoniach żony",
    "adsetOrigin": "Kąt 7: Perspektywa Żony (Fanpage: Sardian)",
    "adOrigin": "K7_V3_ZESTAW_W_DLONIACH_ZONY",
    "aspectRatio": "1:1 (1024x1024)",
    "source": "ai",
    "angleId": "K7_V3_ZESTAW_W_DLONIACH_ZONY"
  },
  {
    "id": "K7_V4_MAZ_PO_6_TYGODNIACH_USMIECH",
    "url": "/sardian-pl-images/K7_V4_MAZ_PO_6_TYGODNIACH_USMIECH.jpg",
    "imageHash": "",
    "label": "K7_V4 · Uśmiechnięty mąż po prysznicu z gęstymi włosami",
    "adsetOrigin": "Kąt 7: Perspektywa Żony (Fanpage: Sardian)",
    "adOrigin": "K7_V4_MAZ_PO_6_TYGODNIACH_USMIECH",
    "aspectRatio": "1:1 (1024x1024)",
    "source": "ai",
    "angleId": "K7_V4_MAZ_PO_6_TYGODNIACH_USMIECH"
  },
  {
    "id": "K7_V5_DWA_OPAKOWANIA_POD_PRYSZNICEM",
    "url": "/sardian-pl-images/K7_V5_DWA_OPAKOWANIA_POD_PRYSZNICEM.jpg",
    "imageHash": "",
    "label": "K7_V5 · 2 butelki SARDIAN pod prysznicem + szczoteczka",
    "adsetOrigin": "Kąt 7 / Nowy Desire C (Fanpage: Sardian)",
    "adOrigin": "K7_V5_DWA_OPAKOWANIA_POD_PRYSZNICEM",
    "aspectRatio": "1:1 (1024x1024)",
    "source": "ai",
    "angleId": "K7_V5_DWA_OPAKOWANIA_POD_PRYSZNICEM"
  }
];

export const SARDIAN_PRESET_ANGLES: SardianAnglePreset[] = [
  {
    "id": "sardian_k2_v1",
    "number": 1,
    "code": "K2_V1",
    "title": "K2_V1 · Przyłapałem żonę pod prysznicem przy sitku odpływu",
    "shortTitle": "Przyłapałem żonę pod prysznicem przy sitku odpływu",
    "stageId": "stage1_batch1_winner_desire",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Batch #1 · Winner Desire (ROAS 2.82)",
    "problemCluster": "K2_PRYSZNIC_ODPLYW",
    "problemLabel": "Kąt 2 · Prysznic, Sitko & Żona",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "Przyłapałem żonę pod prysznicem. Chowała przede mną moje własne włosy",
    "mechanismCore": "Stary Winner Desire (ROAS 2.82): 70-80% uśpionych cebulek żyje pod skórą + 92 szampony (96% robi 0 z 3 rzeczy) + Formuła 3 z 3 (Rdest 90% vs 70% minoksydyl, Żeń-szeń + mentol, Biota Orientalis)",
    "defaultImageId": "K2_V1_PRYSZNIC_ODPLYW",
    "defaultImageUrl": "/sardian-pl-images/K2_V1_PRYSZNIC_ODPLYW.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_k2_v2",
    "number": 2,
    "code": "K2_V2",
    "title": "K2_V2 · Czyste sitko w dłoni o 7:00 rano po prysznicu",
    "shortTitle": "Czyste sitko w dłoni o 7:00 rano po prysznicu",
    "stageId": "stage1_batch1_winner_desire",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Batch #1 · Winner Desire (ROAS 2.82)",
    "problemCluster": "K2_PRYSZNIC_ODPLYW",
    "problemLabel": "Kąt 2 · Prysznic, Sitko & Żona",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "Przez 2 lata bałem się spojrzeć w dół na sitko odpływu po prysznicu",
    "mechanismCore": "Stary Winner Desire (ROAS 2.82): 70-80% uśpionych cebulek żyje pod skórą + 92 szampony (96% robi 0 z 3 rzeczy) + Formuła 3 z 3 (Rdest 90% vs 70% minoksydyl, Żeń-szeń + mentol, Biota Orientalis)",
    "defaultImageId": "K2_V2_SITKO_W_DLONI_PRZED_PO",
    "defaultImageUrl": "/sardian-pl-images/K2_V2_SITKO_W_DLONI_PRZED_PO.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_k2_v3",
    "number": 3,
    "code": "K2_V3",
    "title": "K2_V3 · Żona przy kabinie prysznicowej — koniec udawania",
    "shortTitle": "Żona przy kabinie prysznicowej — koniec udawania",
    "stageId": "stage1_batch1_winner_desire",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Batch #1 · Winner Desire (ROAS 2.82)",
    "problemCluster": "K2_PRYSZNIC_ODPLYW",
    "problemLabel": "Kąt 2 · Prysznic, Sitko & Żona",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "Myślałem, że żona nie zauważa moich zakoli. Prawda zabolała bardziej",
    "mechanismCore": "Stary Winner Desire (ROAS 2.82): 70-80% uśpionych cebulek żyje pod skórą + 92 szampony (96% robi 0 z 3 rzeczy) + Formuła 3 z 3 (Rdest 90% vs 70% minoksydyl, Żeń-szeń + mentol, Biota Orientalis)",
    "defaultImageId": "K2_V3_ZONA_PRZY_KABINIE",
    "defaultImageUrl": "/sardian-pl-images/K2_V3_ZONA_PRZY_KABINIE.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_k2_v4",
    "number": 4,
    "code": "K2_V4",
    "title": "K2_V4 · Recepta od dermatologa w koszu na śmieci vs SARDIAN",
    "shortTitle": "Recepta od dermatologa w koszu na śmieci vs SARDIAN",
    "stageId": "stage1_batch1_winner_desire",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Batch #1 · Winner Desire (ROAS 2.82)",
    "problemCluster": "K2_PRYSZNIC_ODPLYW",
    "problemLabel": "Kąt 2 · Prysznic, Sitko & Żona",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "Wyrzuciłem receptę do kosza, kiedy przeczytałem o skutkach ubocznych",
    "mechanismCore": "Stary Winner Desire (ROAS 2.82): 70-80% uśpionych cebulek żyje pod skórą + 92 szampony (96% robi 0 z 3 rzeczy) + Formuła 3 z 3 (Rdest 90% vs 70% minoksydyl, Żeń-szeń + mentol, Biota Orientalis)",
    "defaultImageId": "K2_V4_RECEPTA_W_KOSZU_SARDIAN",
    "defaultImageUrl": "/sardian-pl-images/K2_V4_RECEPTA_W_KOSZU_SARDIAN.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_k2_v5",
    "number": 5,
    "code": "K2_V5",
    "title": "K2_V5 · Mokre włosy pod górną lampą w łazience po 10 tygodniach",
    "shortTitle": "Mokre włosy pod górną lampą w łazience po 10 tygodniach",
    "stageId": "stage1_batch1_winner_desire",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Batch #1 · Winner Desire (ROAS 2.82)",
    "problemCluster": "K2_PRYSZNIC_ODPLYW",
    "problemLabel": "Kąt 2 · Prysznic, Sitko & Żona",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "Pierwszy raz od 3 lat stanąłem z mokrymi włosami pod ostrym światłem",
    "mechanismCore": "Stary Winner Desire (ROAS 2.82): 70-80% uśpionych cebulek żyje pod skórą + 92 szampony (96% robi 0 z 3 rzeczy) + Formuła 3 z 3 (Rdest 90% vs 70% minoksydyl, Żeń-szeń + mentol, Biota Orientalis)",
    "defaultImageId": "K2_V5_MOKRE_WLOSY_W_LUSTRZE",
    "defaultImageUrl": "/sardian-pl-images/K2_V5_MOKRE_WLOSY_W_LUSTRZE.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_k3_v1",
    "number": 6,
    "code": "K3_V1",
    "title": "K3_V1 · Szwagier wydał 17 000 zł w Turcji vs ekran trychologa 200x",
    "shortTitle": "Szwagier wydał 17 000 zł w Turcji vs ekran trychologa 200x",
    "stageId": "stage1_batch1_winner_desire",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Batch #1 · Winner Desire (ROAS 2.82)",
    "problemCluster": "K3_SZWAGIER_TURCJA",
    "problemLabel": "Kąt 3 · Szwagier Turcja 17 000 zł vs Trycholog",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "Szwagier wydał 17 000 zł w Turcji. Po roku zapytał mnie, co zrobiłem z włosami",
    "mechanismCore": "Stary Winner Desire (ROAS 2.82): 70-80% uśpionych cebulek żyje pod skórą + 92 szampony (96% robi 0 z 3 rzeczy) + Formuła 3 z 3 (Rdest 90% vs 70% minoksydyl, Żeń-szeń + mentol, Biota Orientalis)",
    "defaultImageId": "K3_V1_TRICHOSCOPE_KAMERA_CEBULKI",
    "defaultImageUrl": "/sardian-pl-images/K3_V1_TRICHOSCOPE_KAMERA_CEBULKI.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_k3_v2",
    "number": 7,
    "code": "K3_V2",
    "title": "K3_V2 · Dwaj szwagrzy na grillu (czapka po Turcji vs gęsta góra)",
    "shortTitle": "Dwaj szwagrzy na grillu (czapka po Turcji vs gęsta góra)",
    "stageId": "stage1_batch1_winner_desire",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Batch #1 · Winner Desire (ROAS 2.82)",
    "problemCluster": "K3_SZWAGIER_TURCJA",
    "problemLabel": "Kąt 3 · Szwagier Turcja 17 000 zł vs Trycholog",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "Po lewej szwagier rok po przeszczepie w Turcji. Po prawej ja po 90 dniach SARDIAN",
    "mechanismCore": "Stary Winner Desire (ROAS 2.82): 70-80% uśpionych cebulek żyje pod skórą + 92 szampony (96% robi 0 z 3 rzeczy) + Formuła 3 z 3 (Rdest 90% vs 70% minoksydyl, Żeń-szeń + mentol, Biota Orientalis)",
    "defaultImageId": "K3_V2_DWAJ_SZWAGRZY_NA_GRILLU",
    "defaultImageUrl": "/sardian-pl-images/K3_V2_DWAJ_SZWAGRZY_NA_GRILLU.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_k3_v3",
    "number": 8,
    "code": "K3_V3",
    "title": "K3_V3 · Kartka od warszawskiego trychologa zamiast lotu do Stambułu",
    "shortTitle": "Kartka od warszawskiego trychologa zamiast lotu do Stambułu",
    "stageId": "stage1_batch1_winner_desire",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Batch #1 · Winner Desire (ROAS 2.82)",
    "problemCluster": "K3_SZWAGIER_TURCJA",
    "problemLabel": "Kąt 3 · Szwagier Turcja 17 000 zł vs Trycholog",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "Ta kartka od warszawskiego trychologa zaoszczędziła mi 17 000 zł na wyjazd do Turcji",
    "mechanismCore": "Stary Winner Desire (ROAS 2.82): 70-80% uśpionych cebulek żyje pod skórą + 92 szampony (96% robi 0 z 3 rzeczy) + Formuła 3 z 3 (Rdest 90% vs 70% minoksydyl, Żeń-szeń + mentol, Biota Orientalis)",
    "defaultImageId": "K3_V3_KARTKA_OD_TRYCHOLOGA",
    "defaultImageUrl": "/sardian-pl-images/K3_V3_KARTKA_OD_TRYCHOLOGA.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_k3_v4",
    "number": 9,
    "code": "K3_V4",
    "title": "K3_V4 · Paczka 3 butelek z Paczkomatu zamiast kliniki za 17 000 zł",
    "shortTitle": "Paczka 3 butelek z Paczkomatu zamiast kliniki za 17 000 zł",
    "stageId": "stage1_batch1_winner_desire",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Batch #1 · Winner Desire (ROAS 2.82)",
    "problemCluster": "K3_SZWAGIER_TURCJA",
    "problemLabel": "Kąt 3 · Szwagier Turcja 17 000 zł vs Trycholog",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "Zamiast lecieć do Stambułu za 17 000 zł, odebrałem z Paczkomatu te 3 butelki",
    "mechanismCore": "Stary Winner Desire (ROAS 2.82): 70-80% uśpionych cebulek żyje pod skórą + 92 szampony (96% robi 0 z 3 rzeczy) + Formuła 3 z 3 (Rdest 90% vs 70% minoksydyl, Żeń-szeń + mentol, Biota Orientalis)",
    "defaultImageId": "K3_V4_PAKIET_3_BUTELEK_W_PACZCE",
    "defaultImageUrl": "/sardian-pl-images/K3_V4_PAKIET_3_BUTELEK_W_PACZCE.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_k3_v5",
    "number": 10,
    "code": "K3_V5",
    "title": "K3_V5 · Czubek głowy z góry w dziennym świetle (46 lat, zero przeszczepu)",
    "shortTitle": "Czubek głowy z góry w dziennym świetle (46 lat, zero przeszczepu)",
    "stageId": "stage1_batch1_winner_desire",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Batch #1 · Winner Desire (ROAS 2.82)",
    "problemCluster": "K3_SZWAGIER_TURCJA",
    "problemLabel": "Kąt 3 · Szwagier Turcja 17 000 zł vs Trycholog",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "Mam 46 lat. Tak wygląda czubek mojej głowy po 10 tygodniach odblokowania mieszków",
    "mechanismCore": "Stary Winner Desire (ROAS 2.82): 70-80% uśpionych cebulek żyje pod skórą + 92 szampony (96% robi 0 z 3 rzeczy) + Formuła 3 z 3 (Rdest 90% vs 70% minoksydyl, Żeń-szeń + mentol, Biota Orientalis)",
    "defaultImageId": "K3_V5_CZUBEK_GLOWY_Z_GORY_ODROST",
    "defaultImageUrl": "/sardian-pl-images/K3_V5_CZUBEK_GLOWY_Z_GORY_ODROST.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_k4_v1",
    "number": 11,
    "code": "K4_V1",
    "title": "K4_V1 · Stary fryzjer męski (35 lat przy fotelu, od 1991 r.)",
    "shortTitle": "Stary fryzjer męski (35 lat przy fotelu, od 1991 r.)",
    "stageId": "stage1_batch1_winner_desire",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Batch #1 · Winner Desire (ROAS 2.82)",
    "problemCluster": "K4_STARY_FRYZJER",
    "problemLabel": "Kąt 4 · Stary Fryzjer Męski (35 lat stażu)",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "Strzygę polskich facetów od 35 lat. Powiem Ci wprost, dlaczego szampony z drogerii nie działają",
    "mechanismCore": "Stary Winner Desire (ROAS 2.82): 70-80% uśpionych cebulek żyje pod skórą + 92 szampony (96% robi 0 z 3 rzeczy) + Formuła 3 z 3 (Rdest 90% vs 70% minoksydyl, Żeń-szeń + mentol, Biota Orientalis)",
    "defaultImageId": "K4_V1_STARY_FRYZJER_BARBER",
    "defaultImageUrl": "/sardian-pl-images/K4_V1_STARY_FRYZJER_BARBER.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_k4_v2",
    "number": 12,
    "code": "K4_V2",
    "title": "K4_V2 · Fryzjer pokazuje skład SARDIAN na konsoli (92 szampony w Polsce)",
    "shortTitle": "Fryzjer pokazuje skład SARDIAN na konsoli (92 szampony w Polsce)",
    "stageId": "stage1_batch1_winner_desire",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Batch #1 · Winner Desire (ROAS 2.82)",
    "problemCluster": "K4_STARY_FRYZJER",
    "problemLabel": "Kąt 4 · Stary Fryzjer Męski (35 lat stażu)",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "92 szampony na wypadanie włosów w Polsce przebadane: 96% to czysty marketing",
    "mechanismCore": "Stary Winner Desire (ROAS 2.82): 70-80% uśpionych cebulek żyje pod skórą + 92 szampony (96% robi 0 z 3 rzeczy) + Formuła 3 z 3 (Rdest 90% vs 70% minoksydyl, Żeń-szeń + mentol, Biota Orientalis)",
    "defaultImageId": "K4_V2_FRYZJER_POKAZUJE_SKLAD",
    "defaultImageUrl": "/sardian-pl-images/K4_V2_FRYZJER_POKAZUJE_SKLAD.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_k4_v3",
    "number": 13,
    "code": "K4_V3",
    "title": "K4_V3 · Klient na fotelu po 8 tygodniach — musieliśmy użyć degażówek",
    "shortTitle": "Klient na fotelu po 8 tygodniach — musieliśmy użyć degażówek",
    "stageId": "stage1_batch1_winner_desire",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Batch #1 · Winner Desire (ROAS 2.82)",
    "problemCluster": "K4_STARY_FRYZJER",
    "problemLabel": "Kąt 4 · Stary Fryzjer Męski (35 lat stażu)",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "Chciał, żebym ogolił go na 3 mm. 8 tygodni później musiałem przerzedzać mu górę degażówkami",
    "mechanismCore": "Stary Winner Desire (ROAS 2.82): 70-80% uśpionych cebulek żyje pod skórą + 92 szampony (96% robi 0 z 3 rzeczy) + Formuła 3 z 3 (Rdest 90% vs 70% minoksydyl, Żeń-szeń + mentol, Biota Orientalis)",
    "defaultImageId": "K4_V3_KLIENT_NA_FOTELU_GESTE_WLOSY",
    "defaultImageUrl": "/sardian-pl-images/K4_V3_KLIENT_NA_FOTELU_GESTE_WLOSY.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_k4_v4",
    "number": 14,
    "code": "K4_V4",
    "title": "K4_V4 · Myjka fryzjerska i ziołowa mikropiana SARDIAN",
    "shortTitle": "Myjka fryzjerska i ziołowa mikropiana SARDIAN",
    "stageId": "stage1_batch1_winner_desire",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Batch #1 · Winner Desire (ROAS 2.82)",
    "problemCluster": "K4_STARY_FRYZJER",
    "problemLabel": "Kąt 4 · Stary Fryzjer Męski (35 lat stażu)",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "Dlaczego wyrzuciłem zwykłe szampony z myjki w moim salonie fryzjerskim",
    "mechanismCore": "Stary Winner Desire (ROAS 2.82): 70-80% uśpionych cebulek żyje pod skórą + 92 szampony (96% robi 0 z 3 rzeczy) + Formuła 3 z 3 (Rdest 90% vs 70% minoksydyl, Żeń-szeń + mentol, Biota Orientalis)",
    "defaultImageId": "K4_V4_MYJKA_FRYZJERSKA_PIANA",
    "defaultImageUrl": "/sardian-pl-images/K4_V4_MYJKA_FRYZJERSKA_PIANA.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_k4_v5",
    "number": 15,
    "code": "K4_V5",
    "title": "K4_V5 · SARDIAN w dłoni fryzjera vs drogeryjny szampon z SLS w koszu",
    "shortTitle": "SARDIAN w dłoni fryzjera vs drogeryjny szampon z SLS w koszu",
    "stageId": "stage1_batch1_winner_desire",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Batch #1 · Winner Desire (ROAS 2.82)",
    "problemCluster": "K4_STARY_FRYZJER",
    "problemLabel": "Kąt 4 · Stary Fryzjer Męski (35 lat stażu)",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "Wyrzuć szampon z SLS do kosza, zanim dobije pozostałe 80% Twoich żywych cebulek",
    "mechanismCore": "Stary Winner Desire (ROAS 2.82): 70-80% uśpionych cebulek żyje pod skórą + 92 szampony (96% robi 0 z 3 rzeczy) + Formuła 3 z 3 (Rdest 90% vs 70% minoksydyl, Żeń-szeń + mentol, Biota Orientalis)",
    "defaultImageId": "K4_V5_SARDIAN_VS_DROGERIA_KOSZ",
    "defaultImageUrl": "/sardian-pl-images/K4_V5_SARDIAN_VS_DROGERIA_KOSZ.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_k5_v1",
    "number": 16,
    "code": "K5_V1",
    "title": "K5_V1 · Reverse Fryzjer: Poprosiłem o maszynkę na 3 mm, a fryzjer pokazał mi SARDIAN",
    "shortTitle": "Reverse Fryzjer: Poprosiłem o maszynkę na 3 mm, a fryzjer pokazał mi SARDIAN",
    "stageId": "stage1_batch1_winner_desire",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Batch #1 · Winner Desire (ROAS 2.82)",
    "problemCluster": "K5_REVERSE_FRYZJER",
    "problemLabel": "Kąt 5 · Reverse Fryzjer (POV Klienta)",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "Poprosiłem fryzjera o maszynkę na 3 mm. Wyłączył ją i postawił przede mną tę butelkę",
    "mechanismCore": "Stary Winner Desire (ROAS 2.82): 70-80% uśpionych cebulek żyje pod skórą + 92 szampony (96% robi 0 z 3 rzeczy) + Formuła 3 z 3 (Rdest 90% vs 70% minoksydyl, Żeń-szeń + mentol, Biota Orientalis)",
    "defaultImageId": "K5_V1_KLIENT_POV_MASZYNKA_I_SARDIAN",
    "defaultImageUrl": "/sardian-pl-images/K5_V1_KLIENT_POV_MASZYNKA_I_SARDIAN.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_k5_v2",
    "number": 17,
    "code": "K5_V2",
    "title": "K5_V2 · Reverse Fryzjer: Zdjęcie ukradkiem przy myjce fryzjerskiej po mrowieniu",
    "shortTitle": "Reverse Fryzjer: Zdjęcie ukradkiem przy myjce fryzjerskiej po mrowieniu",
    "stageId": "stage1_batch1_winner_desire",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Batch #1 · Winner Desire (ROAS 2.82)",
    "problemCluster": "K5_REVERSE_FRYZJER",
    "problemLabel": "Kąt 5 · Reverse Fryzjer (POV Klienta)",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "Zrobiłem to zdjęcie ukradkiem przy myjce u mojego fryzjera. Poczułem mrowienie po 60 sekundach",
    "mechanismCore": "Stary Winner Desire (ROAS 2.82): 70-80% uśpionych cebulek żyje pod skórą + 92 szampony (96% robi 0 z 3 rzeczy) + Formuła 3 z 3 (Rdest 90% vs 70% minoksydyl, Żeń-szeń + mentol, Biota Orientalis)",
    "defaultImageId": "K5_V2_KLIENT_POV_SARDIAN_NA_MYJCE",
    "defaultImageUrl": "/sardian-pl-images/K5_V2_KLIENT_POV_SARDIAN_NA_MYJCE.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_k5_v3",
    "number": 18,
    "code": "K5_V3",
    "title": "K5_V3 · Reverse Fryzjer: Zrób zdjęcie etykiety na konsoli i wyrzuć drogeryjny szampon",
    "shortTitle": "Reverse Fryzjer: Zrób zdjęcie etykiety na konsoli i wyrzuć drogeryjny szampon",
    "stageId": "stage1_batch1_winner_desire",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Batch #1 · Winner Desire (ROAS 2.82)",
    "problemCluster": "K5_REVERSE_FRYZJER",
    "problemLabel": "Kąt 5 · Reverse Fryzjer (POV Klienta)",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "Fryzjer postawił tę butelkę przede mną i powiedział: Zrób zdjęcie etykiety i wyrzuć szampon z drogerii",
    "mechanismCore": "Stary Winner Desire (ROAS 2.82): 70-80% uśpionych cebulek żyje pod skórą + 92 szampony (96% robi 0 z 3 rzeczy) + Formuła 3 z 3 (Rdest 90% vs 70% minoksydyl, Żeń-szeń + mentol, Biota Orientalis)",
    "defaultImageId": "K5_V3_KLIENT_POV_ZDJECIE_NA_KONSOLI",
    "defaultImageUrl": "/sardian-pl-images/K5_V3_KLIENT_POV_ZDJECIE_NA_KONSOLI.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_k7_v1",
    "number": 19,
    "code": "K7_V1",
    "title": "K7_V1 · Perspektywa żony: Postawiłam czarną butelkę pod prysznicem 42-letniego męża",
    "shortTitle": "Perspektywa żony: Postawiłam czarną butelkę pod prysznicem 42-letniego męża",
    "stageId": "stage1_batch1_winner_desire",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Batch #1 · Winner Desire (ROAS 2.82)",
    "problemCluster": "K7_PERSPEKTYWA_ZONY",
    "problemLabel": "Kąt 7 · Perspektywa Żony (Fanpage: Sardian)",
    "recommendedFanpageId": "1276931235504931",
    "recommendedFanpageName": "Sardian",
    "vocTrigger": "Mój 42-letni mąż udawał, że zakola go nie obchodzą. Postawiłam to pod jego prysznicem",
    "mechanismCore": "Stary Winner Desire (ROAS 2.82): 70-80% uśpionych cebulek żyje pod skórą + 92 szampony (96% robi 0 z 3 rzeczy) + Formuła 3 z 3 (Rdest 90% vs 70% minoksydyl, Żeń-szeń + mentol, Biota Orientalis)",
    "defaultImageId": "K7_V1_ZONA_LAZIENKA_PRYSZNIC",
    "defaultImageUrl": "/sardian-pl-images/K7_V1_ZONA_LAZIENKA_PRYSZNIC.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_k7_v2",
    "number": 20,
    "code": "K7_V2",
    "title": "K7_V2 · Perspektywa żony: Zdjęcie męża z korytarza przed lustrem o poranku",
    "shortTitle": "Perspektywa żony: Zdjęcie męża z korytarza przed lustrem o poranku",
    "stageId": "stage1_batch1_winner_desire",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Batch #1 · Winner Desire (ROAS 2.82)",
    "problemCluster": "K7_PERSPEKTYWA_ZONY",
    "problemLabel": "Kąt 7 · Perspektywa Żony (Fanpage: Sardian)",
    "recommendedFanpageId": "1276931235504931",
    "recommendedFanpageName": "Sardian",
    "vocTrigger": "Widziałam, jak mąż codziennie rano stoi przed lustrem i dotyka swoich zakoli",
    "mechanismCore": "Stary Winner Desire (ROAS 2.82): 70-80% uśpionych cebulek żyje pod skórą + 92 szampony (96% robi 0 z 3 rzeczy) + Formuła 3 z 3 (Rdest 90% vs 70% minoksydyl, Żeń-szeń + mentol, Biota Orientalis)",
    "defaultImageId": "K7_V2_MAZ_PRZED_LUSTREM_Z_TYLU",
    "defaultImageUrl": "/sardian-pl-images/K7_V2_MAZ_PRZED_LUSTREM_Z_TYLU.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_k7_v3",
    "number": 21,
    "code": "K7_V3",
    "title": "K7_V3 · Perspektywa żony: Zestaw SARDIAN + szczoteczka w dłoniach żony",
    "shortTitle": "Perspektywa żony: Zestaw SARDIAN + szczoteczka w dłoniach żony",
    "stageId": "stage1_batch1_winner_desire",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Batch #1 · Winner Desire (ROAS 2.82)",
    "problemCluster": "K7_PERSPEKTYWA_ZONY",
    "problemLabel": "Kąt 7 · Perspektywa Żony (Fanpage: Sardian)",
    "recommendedFanpageId": "1276931235504931",
    "recommendedFanpageName": "Sardian",
    "vocTrigger": "Najlepszy prezent, jaki zrobiłam mężowi bez żadnej okazji (kosztował mniej niż perfumy)",
    "mechanismCore": "Stary Winner Desire (ROAS 2.82): 70-80% uśpionych cebulek żyje pod skórą + 92 szampony (96% robi 0 z 3 rzeczy) + Formuła 3 z 3 (Rdest 90% vs 70% minoksydyl, Żeń-szeń + mentol, Biota Orientalis)",
    "defaultImageId": "K7_V3_ZESTAW_W_DLONIACH_ZONY",
    "defaultImageUrl": "/sardian-pl-images/K7_V3_ZESTAW_W_DLONIACH_ZONY.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_k7_v4",
    "number": 22,
    "code": "K7_V4",
    "title": "K7_V4 · Perspektywa żony: Uśmiech męża po 9 tygodniach (czapka w szufladzie)",
    "shortTitle": "Perspektywa żony: Uśmiech męża po 9 tygodniach (czapka w szufladzie)",
    "stageId": "stage1_batch1_winner_desire",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Batch #1 · Winner Desire (ROAS 2.82)",
    "problemCluster": "K7_PERSPEKTYWA_ZONY",
    "problemLabel": "Kąt 7 · Perspektywa Żony (Fanpage: Sardian)",
    "recommendedFanpageId": "1276931235504931",
    "recommendedFanpageName": "Sardian",
    "vocTrigger": "Po 9 tygodniach mój mąż pierwszy raz od 2 lat wyszedł z domu bez czapki z daszkiem",
    "mechanismCore": "Stary Winner Desire (ROAS 2.82): 70-80% uśpionych cebulek żyje pod skórą + 92 szampony (96% robi 0 z 3 rzeczy) + Formuła 3 z 3 (Rdest 90% vs 70% minoksydyl, Żeń-szeń + mentol, Biota Orientalis)",
    "defaultImageId": "K7_V4_MAZ_PO_6_TYGODNIACH_USMIECH",
    "defaultImageUrl": "/sardian-pl-images/K7_V4_MAZ_PO_6_TYGODNIACH_USMIECH.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_k7_v5",
    "number": 23,
    "code": "K7_V5",
    "title": "K7_V5 · Perspektywa żony: 2 butelki SARDIAN pod prysznicem (mąż sam pilnuje zapasu)",
    "shortTitle": "Perspektywa żony: 2 butelki SARDIAN pod prysznicem (mąż sam pilnuje zapasu)",
    "stageId": "stage1_batch1_winner_desire",
    "stageNumber": 1,
    "sophisticationLevel": 4,
    "sophisticationBadge": "Batch #1 · Winner Desire (ROAS 2.82)",
    "problemCluster": "K7_PERSPEKTYWA_ZONY",
    "problemLabel": "Kąt 7 · Perspektywa Żony (Fanpage: Sardian)",
    "recommendedFanpageId": "1276931235504931",
    "recommendedFanpageName": "Sardian",
    "vocTrigger": "Najpierw pytał, po co kupiłam mu kolejny szampon. Dziś sam pilnuje, żeby pod prysznicem stał zapas",
    "mechanismCore": "Stary Winner Desire (ROAS 2.82): 70-80% uśpionych cebulek żyje pod skórą + 92 szampony (96% robi 0 z 3 rzeczy) + Formuła 3 z 3 (Rdest 90% vs 70% minoksydyl, Żeń-szeń + mentol, Biota Orientalis)",
    "defaultImageId": "K7_V5_DWA_OPAKOWANIA_POD_PRYSZNICEM",
    "defaultImageUrl": "/sardian-pl-images/K7_V5_DWA_OPAKOWANIA_POD_PRYSZNICEM.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_nd_a1",
    "number": 24,
    "code": "ND_A1",
    "title": "ND_A1 · [Nowy Desire A: Czop Łojowo-DHT] Kamera 200x u trychologa: żółty „cement” w porach",
    "shortTitle": "[Nowy Desire A: Czop Łojowo-DHT] Kamera 200x u trychologa: żółty „cement” w porach",
    "stageId": "stage2_new_desire_a",
    "stageNumber": 2,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Batch #2 · Nowy Desire A",
    "problemCluster": "NOWY_DESIRE_A_CZOP_DHT",
    "problemLabel": "Nowy Desire A · Czop Łojowo-DHT (Sebum-Cement)",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "Myślałem, że moje cebulki są martwe. Kamera w 200x powiększeniu pokazała żółty czop DHT",
    "mechanismCore": "Nowy Desire A: Napięcie czepca ścięgnistego + woskowy czop łojowo-DHT zamurowujący 70-80% żywych cebulek pod błyszczącą skórą",
    "defaultImageId": "K3_V1_TRICHOSCOPE_KAMERA_CEBULKI",
    "defaultImageUrl": "/sardian-pl-images/K3_V1_TRICHOSCOPE_KAMERA_CEBULKI.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_nd_a2",
    "number": 25,
    "code": "ND_A2",
    "title": "ND_A2 · [Nowy Desire A: Czop Łojowo-DHT] Test 2 palców: dlaczego łysiejesz tylko na górze?",
    "shortTitle": "[Nowy Desire A: Czop Łojowo-DHT] Test 2 palców: dlaczego łysiejesz tylko na górze?",
    "stageId": "stage2_new_desire_a",
    "stageNumber": 2,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Batch #2 · Nowy Desire A",
    "problemCluster": "NOWY_DESIRE_A_CZOP_DHT",
    "problemLabel": "Nowy Desire A · Czop Łojowo-DHT (Sebum-Cement)",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "Zrób teraz 5-sekundowy test 2 palców na czubku głowy i nad uchem",
    "mechanismCore": "Nowy Desire A: Napięcie czepca ścięgnistego + woskowy czop łojowo-DHT zamurowujący 70-80% żywych cebulek pod błyszczącą skórą",
    "defaultImageId": "K3_V5_CZUBEK_GLOWY_Z_GORY_ODROST",
    "defaultImageUrl": "/sardian-pl-images/K3_V5_CZUBEK_GLOWY_Z_GORY_ODROST.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_nd_a3",
    "number": 26,
    "code": "ND_A3",
    "title": "ND_A3 · [Nowy Desire A: Czop Łojowo-DHT] Dlaczego wcierki za 150 zł spływają po „wosku”",
    "shortTitle": "[Nowy Desire A: Czop Łojowo-DHT] Dlaczego wcierki za 150 zł spływają po „wosku”",
    "stageId": "stage2_new_desire_a",
    "stageNumber": 2,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Batch #2 · Nowy Desire A",
    "problemCluster": "NOWY_DESIRE_A_CZOP_DHT",
    "problemLabel": "Nowy Desire A · Czop Łojowo-DHT (Sebum-Cement)",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "Wydajesz 150 zł na wcierki i ampułki? Bez rozpuszczenia czopa DHT spływają jak po szybie",
    "mechanismCore": "Nowy Desire A: Napięcie czepca ścięgnistego + woskowy czop łojowo-DHT zamurowujący 70-80% żywych cebulek pod błyszczącą skórą",
    "defaultImageId": "K4_V4_MYJKA_FRYZJERSKA_PIANA",
    "defaultImageUrl": "/sardian-pl-images/K4_V4_MYJKA_FRYZJERSKA_PIANA.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_nd_a4",
    "number": 27,
    "code": "ND_A4",
    "title": "ND_A4 · [Nowy Desire A: Czop Łojowo-DHT] Błyszcząca skóra w zakolach wcale nie była łysa",
    "shortTitle": "[Nowy Desire A: Czop Łojowo-DHT] Błyszcząca skóra w zakolach wcale nie była łysa",
    "stageId": "stage2_new_desire_a",
    "stageNumber": 2,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Batch #2 · Nowy Desire A",
    "problemCluster": "NOWY_DESIRE_A_CZOP_DHT",
    "problemLabel": "Nowy Desire A · Czop Łojowo-DHT (Sebum-Cement)",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "Myślałem, że błyszcząca skóra w zakolach oznacza martwe cebulki. Myliłem się o 80%",
    "mechanismCore": "Nowy Desire A: Napięcie czepca ścięgnistego + woskowy czop łojowo-DHT zamurowujący 70-80% żywych cebulek pod błyszczącą skórą",
    "defaultImageId": "K2_V5_MOKRE_WLOSY_W_LUSTRZE",
    "defaultImageUrl": "/sardian-pl-images/K2_V5_MOKRE_WLOSY_W_LUSTRZE.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_nd_a5",
    "number": 28,
    "code": "ND_A5",
    "title": "ND_A5 · [Nowy Desire A: Czop Łojowo-DHT] Stary fryzjer o tym, czemu boki rosną, a góra się dusi",
    "shortTitle": "[Nowy Desire A: Czop Łojowo-DHT] Stary fryzjer o tym, czemu boki rosną, a góra się dusi",
    "stageId": "stage2_new_desire_a",
    "stageNumber": 2,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Batch #2 · Nowy Desire A",
    "problemCluster": "NOWY_DESIRE_A_CZOP_DHT",
    "problemLabel": "Nowy Desire A · Czop Łojowo-DHT (Sebum-Cement)",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "35 lat strzygę facetów: oto dlaczego boki rosną Ci jak szalone, a góra dusi się pod warstwą DHT",
    "mechanismCore": "Nowy Desire A: Napięcie czepca ścięgnistego + woskowy czop łojowo-DHT zamurowujący 70-80% żywych cebulek pod błyszczącą skórą",
    "defaultImageId": "K4_V1_STARY_FRYZJER_BARBER",
    "defaultImageUrl": "/sardian-pl-images/K4_V1_STARY_FRYZJER_BARBER.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_nd_b1",
    "number": 29,
    "code": "ND_B1",
    "title": "ND_B1 · [Nowy Desire B: Pułapka 3-Tygodniowego Włosa] 8 na 10 włosów na sitku miało mniej niż 2 cm",
    "shortTitle": "[Nowy Desire B: Pułapka 3-Tygodniowego Włosa] 8 na 10 włosów na sitku miało mniej niż 2 cm",
    "stageId": "stage3_new_desire_b",
    "stageNumber": 3,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Batch #2 · Nowy Desire B",
    "problemCluster": "NOWY_DESIRE_B_ZEGAR_ANAGENU",
    "problemLabel": "Nowy Desire B · Pułapka 3-Tygodniowego Włosa",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "Spojrzałem na sitko z odpływu pod światło: 8 na 10 moich wypadających włosów miało mniej niż 2 cm",
    "mechanismCore": "Nowy Desire B: Skrócony przez DHT zegar fazy wzrostu (anagenu) z 4 lat do 21 dni — młode 1-2 cm włoski wypadają zanim urosną",
    "defaultImageId": "K2_V2_SITKO_W_DLONI_PRZED_PO",
    "defaultImageUrl": "/sardian-pl-images/K2_V2_SITKO_W_DLONI_PRZED_PO.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_nd_b2",
    "number": 30,
    "code": "ND_B2",
    "title": "ND_B2 · [Nowy Desire B: Pułapka 3-Tygodniowego Włosa] Dlaczego nowe włosy żyją tylko 21 dni zamiast 4 lat",
    "shortTitle": "[Nowy Desire B: Pułapka 3-Tygodniowego Włosa] Dlaczego nowe włosy żyją tylko 21 dni zamiast 4 lat",
    "stageId": "stage3_new_desire_b",
    "stageNumber": 3,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Batch #2 · Nowy Desire B",
    "problemCluster": "NOWY_DESIRE_B_ZEGAR_ANAGENU",
    "problemLabel": "Nowy Desire B · Pułapka 3-Tygodniowego Włosa",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "Twoje cebulki wciąż produkują nowe włosy — ale hormon DHT wyrzuca je do odpływu po 21 dniach",
    "mechanismCore": "Nowy Desire B: Skrócony przez DHT zegar fazy wzrostu (anagenu) z 4 lat do 21 dni — młode 1-2 cm włoski wypadają zanim urosną",
    "defaultImageId": "K2_V1_PRYSZNIC_ODPLYW",
    "defaultImageUrl": "/sardian-pl-images/K2_V1_PRYSZNIC_ODPLYW.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_nd_b3",
    "number": 31,
    "code": "ND_B3",
    "title": "ND_B3 · [Nowy Desire B: Pułapka 3-Tygodniowego Włosa] Kartka od trychologa i reset fazy anagenu",
    "shortTitle": "[Nowy Desire B: Pułapka 3-Tygodniowego Włosa] Kartka od trychologa i reset fazy anagenu",
    "stageId": "stage3_new_desire_b",
    "stageNumber": 3,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Batch #2 · Nowy Desire B",
    "problemCluster": "NOWY_DESIRE_B_ZEGAR_ANAGENU",
    "problemLabel": "Nowy Desire B · Pułapka 3-Tygodniowego Włosa",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "Trycholog zapisał mi na kartce 4 składniki, które wydłużają życie włosa z 3 tygodni do lat",
    "mechanismCore": "Nowy Desire B: Skrócony przez DHT zegar fazy wzrostu (anagenu) z 4 lat do 21 dni — młode 1-2 cm włoski wypadają zanim urosną",
    "defaultImageId": "K3_V3_KARTKA_OD_TRYCHOLOGA",
    "defaultImageUrl": "/sardian-pl-images/K3_V3_KARTKA_OD_TRYCHOLOGA.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_nd_b4",
    "number": 32,
    "code": "ND_B4",
    "title": "ND_B4 · [Nowy Desire B: Pułapka 3-Tygodniowego Włosa] Fryzjer pokazał mi pod lampą „zatrzymany odrost”",
    "shortTitle": "[Nowy Desire B: Pułapka 3-Tygodniowego Włosa] Fryzjer pokazał mi pod lampą „zatrzymany odrost”",
    "stageId": "stage3_new_desire_b",
    "stageNumber": 3,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Batch #2 · Nowy Desire B",
    "problemCluster": "NOWY_DESIRE_B_ZEGAR_ANAGENU",
    "problemLabel": "Nowy Desire B · Pułapka 3-Tygodniowego Włosa",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "Fryzjer rozgarnął moje włosy grzebieniem pod lampą: „Zobacz, ile masz tu krótkich włosków, które nie mogą urosnąć”",
    "mechanismCore": "Nowy Desire B: Skrócony przez DHT zegar fazy wzrostu (anagenu) z 4 lat do 21 dni — młode 1-2 cm włoski wypadają zanim urosną",
    "defaultImageId": "K5_V2_KLIENT_POV_SARDIAN_NA_MYJCE",
    "defaultImageUrl": "/sardian-pl-images/K5_V2_KLIENT_POV_SARDIAN_NA_MYJCE.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_nd_b5",
    "number": 33,
    "code": "ND_B5",
    "title": "ND_B5 · [Nowy Desire B: Pułapka 3-Tygodniowego Włosa] Perspektywa żony: krótkie włoski męża na poduszce",
    "shortTitle": "[Nowy Desire B: Pułapka 3-Tygodniowego Włosa] Perspektywa żony: krótkie włoski męża na poduszce",
    "stageId": "stage3_new_desire_b",
    "stageNumber": 3,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Batch #2 · Nowy Desire B",
    "problemCluster": "NOWY_DESIRE_B_ZEGAR_ANAGENU",
    "problemLabel": "Nowy Desire B · Pułapka 3-Tygodniowego Włosa",
    "recommendedFanpageId": "1276931235504931",
    "recommendedFanpageName": "Sardian",
    "vocTrigger": "Zauważyłam na poduszce mojego 42-letniego męża dziesiątki króciutkich, 1-centymetrowych włosków",
    "mechanismCore": "Nowy Desire B: Skrócony przez DHT zegar fazy wzrostu (anagenu) z 4 lat do 21 dni — młode 1-2 cm włoski wypadają zanim urosną",
    "defaultImageId": "K7_V1_ZONA_LAZIENKA_PRYSZNIC",
    "defaultImageUrl": "/sardian-pl-images/K7_V1_ZONA_LAZIENKA_PRYSZNIC.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_nd_c1",
    "number": 34,
    "code": "ND_C1",
    "title": "ND_C1 · [Nowy Desire C: Efekt Odbicia DHT] Dlaczego szampon za 35 zł podwaja wyrzut DHT po 4 godzinach",
    "shortTitle": "[Nowy Desire C: Efekt Odbicia DHT] Dlaczego szampon za 35 zł podwaja wyrzut DHT po 4 godzinach",
    "stageId": "stage4_new_desire_c",
    "stageNumber": 4,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Batch #2 · Nowy Desire C",
    "problemCluster": "NOWY_DESIRE_C_REBOUND_SLS",
    "problemLabel": "Nowy Desire C · Efekt Odbicia SLS (Rebound DHT)",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "Myjesz głowę codziennie, żeby ratować włosy? Po 4 godzinach szampon z SLS podwaja wyrzut DHT do cebulek",
    "mechanismCore": "Nowy Desire C: Agresywne siarczany SLS w 96% drogeryjnych szamponów wywołują po 4h paniczny wyrzut 2x łoju z hormonem DHT",
    "defaultImageId": "K4_V5_SARDIAN_VS_DROGERIA_KOSZ",
    "defaultImageUrl": "/sardian-pl-images/K4_V5_SARDIAN_VS_DROGERIA_KOSZ.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_nd_c2",
    "number": 35,
    "code": "ND_C2",
    "title": "ND_C2 · [Nowy Desire C: Efekt Odbicia DHT] 92 szampony w Polsce przebadane pod kątem Rebound Sebum",
    "shortTitle": "[Nowy Desire C: Efekt Odbicia DHT] 92 szampony w Polsce przebadane pod kątem Rebound Sebum",
    "stageId": "stage4_new_desire_c",
    "stageNumber": 4,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Batch #2 · Nowy Desire C",
    "problemCluster": "NOWY_DESIRE_C_REBOUND_SLS",
    "problemLabel": "Nowy Desire C · Efekt Odbicia SLS (Rebound DHT)",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "Sprawdź tył swojego szamponu pod prysznicem: jeśli ma SLS na 2. miejscu, sam przyspieszasz zakola",
    "mechanismCore": "Nowy Desire C: Agresywne siarczany SLS w 96% drogeryjnych szamponów wywołują po 4h paniczny wyrzut 2x łoju z hormonem DHT",
    "defaultImageId": "K4_V2_FRYZJER_POKAZUJE_SKLAD",
    "defaultImageUrl": "/sardian-pl-images/K4_V2_FRYZJER_POKAZUJE_SKLAD.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_nd_c3",
    "number": 36,
    "code": "ND_C3",
    "title": "ND_C3 · [Nowy Desire C: Efekt Odbicia DHT] Dlaczego o 14:00 włosy na czubku są oklapnięte i widać skórę",
    "shortTitle": "[Nowy Desire C: Efekt Odbicia DHT] Dlaczego o 14:00 włosy na czubku są oklapnięte i widać skórę",
    "stageId": "stage4_new_desire_c",
    "stageNumber": 4,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Batch #2 · Nowy Desire C",
    "problemCluster": "NOWY_DESIRE_C_REBOUND_SLS",
    "problemLabel": "Nowy Desire C · Efekt Odbicia SLS (Rebound DHT)",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "Myjesz głowę o 7:00 rano, a o 14:00 włosy na czubku są już oklapnięte i prześwitują? To Efekt Odbicia DHT",
    "mechanismCore": "Nowy Desire C: Agresywne siarczany SLS w 96% drogeryjnych szamponów wywołują po 4h paniczny wyrzut 2x łoju z hormonem DHT",
    "defaultImageId": "K2_V4_RECEPTA_W_KOSZU_SARDIAN",
    "defaultImageUrl": "/sardian-pl-images/K2_V4_RECEPTA_W_KOSZU_SARDIAN.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_nd_c4",
    "number": 37,
    "code": "ND_C4",
    "title": "ND_C4 · [Nowy Desire C: Efekt Odbicia DHT] 90-dniowy detoks od szamponów z SLS (Pakiet 3 butelek)",
    "shortTitle": "[Nowy Desire C: Efekt Odbicia DHT] 90-dniowy detoks od szamponów z SLS (Pakiet 3 butelek)",
    "stageId": "stage4_new_desire_c",
    "stageNumber": 4,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Batch #2 · Nowy Desire C",
    "problemCluster": "NOWY_DESIRE_C_REBOUND_SLS",
    "problemLabel": "Nowy Desire C · Efekt Odbicia SLS (Rebound DHT)",
    "recommendedFanpageId": "1363490303507686",
    "recommendedFanpageName": "Karol Mikołajczyk",
    "vocTrigger": "Wyrzuciłem 4 drogeryjne szampony z SLS i zrobiłem 90-dniowy detoks cebulek tym pakietem",
    "mechanismCore": "Nowy Desire C: Agresywne siarczany SLS w 96% drogeryjnych szamponów wywołują po 4h paniczny wyrzut 2x łoju z hormonem DHT",
    "defaultImageId": "K3_V4_PAKIET_3_BUTELEK_W_PACZCE",
    "defaultImageUrl": "/sardian-pl-images/K3_V4_PAKIET_3_BUTELEK_W_PACZCE.jpg",
    "defaultImageHash": ""
  },
  {
    "id": "sardian_nd_c5",
    "number": 38,
    "code": "ND_C5",
    "title": "ND_C5 · [Nowy Desire C: Efekt Odbicia DHT] Perspektywa żony: mąż codziennie zalewał cebulki DHT po prysznicu",
    "shortTitle": "[Nowy Desire C: Efekt Odbicia DHT] Perspektywa żony: mąż codziennie zalewał cebulki DHT po prysznicu",
    "stageId": "stage4_new_desire_c",
    "stageNumber": 4,
    "sophisticationLevel": 5,
    "sophisticationBadge": "Batch #2 · Nowy Desire C",
    "problemCluster": "NOWY_DESIRE_C_REBOUND_SLS",
    "problemLabel": "Nowy Desire C · Efekt Odbicia SLS (Rebound DHT)",
    "recommendedFanpageId": "1276931235504931",
    "recommendedFanpageName": "Sardian",
    "vocTrigger": "Mój mąż mył głowę codziennie szamponem z apteki. Nie wiedział, że 4 godziny później sam zalewa cebulki DHT",
    "mechanismCore": "Nowy Desire C: Agresywne siarczany SLS w 96% drogeryjnych szamponów wywołują po 4h paniczny wyrzut 2x łoju z hormonem DHT",
    "defaultImageId": "K7_V5_DWA_OPAKOWANIA_POD_PRYSZNICEM",
    "defaultImageUrl": "/sardian-pl-images/K7_V5_DWA_OPAKOWANIA_POD_PRYSZNICEM.jpg",
    "defaultImageHash": ""
  }
];

export const SARDIAN_ALL_COPY: Record<string, { headline: string; description: string; primaryText: string }> = {
  "sardian_k2_v1": {
    "headline": "Przyłapałem żonę pod prysznicem. Chowała przede mną moje własne włosy",
    "description": "Sprawdź metodę 3 z 3 — 60 dni gwarancji zwrotu",
    "primaryText": "Przyłapałem żonę w sobotę rano pod prysznicem. Klęczała przy kabinie z kawałkiem papieru toaletowego w dłoni i szybko chowała coś za plecami, kiedy otworzyłem drzwi.\n \nMyślałem, że stłukła flakon perfum.\n \nZapytałem, co robi. Spojrzała na mnie z takim cichym współczuciem, którego żaden facet nie chce nigdy zobaczyć w oczach swojej kobiety.\n \n— Michał, ja po prostu wyciągam Twoje włosy z sitka po każdym Twoim myciu, żebyś się nie dołował przed pracą.\n \nWskazała na papier w dłoni. Czarny, mokry kłębek moich własnych włosów. Z jednego porannego prysznica.\n \nZamroziło mnie w środku. Miałem 39 lat. Od 2 lat udawałem przed nią i przed samym sobą, że zakola to tylko „wyższe czoło”, a prześwit na czubku głowy to wina ostrej żarówki w przedpokoju. A moja żona od miesięcy po cichu czyściła po mnie odpływ, żebym nie widział, w jakim tempie łysieję.\n\nJeszcze tego samego tygodnia umówiłem się na badanie kamerą do trychologa. Kiedy przyłożył głowicę powiększającą 200 razy do czubka mojej głowy i obrócił ekran w moją stronę, powiedział jedno zdanie, które pamiętam do dziś:\n \n„Te mieszki tutaj są już martwe. Tych już pan nie obudzi.”\n \nPokazał palcem na ekranie puste otwory w skórze głowy. Wyglądały jak dziury po gwoździach w ścianie. Zero włosa. Zero meszku. Zapytałem, ile ich jest.\n \n20% na czubku głowy i w zakolach.\n \n20% moich korzeni nie spało. Nie było osłabionych. Umarło na zawsze w czasie, kiedy ja przez 2 lata kupowałem kolejne szampony z drogerii i apteki, wierząc w reklamy z telewizji.\n \nAlpecin — 6 miesięcy. Nic.\nBiotebal — 4 miesiące. Nic.\nDX2 — 3 miesiące. Nic.\nPotem Loxon 5% wcierany 2 razy dziennie przez 8 miesięcy. Dopóki smarowałem, wypadanie trochę zwolniło, ale stałem się niewolnikiem butelki — wystarczyły 3 dni wyjazdu bez wcierki i odpływ znów był czarny. A o finasterydzie przeczytałem 1 wątek od 28-latka, któremu po 2 miesiącach całkowicie siadło libido, i wyrzuciłem receptę do kosza.\n \nTrycholog wytłumaczył mi w 3 minuty, dlaczego przez 2 lata wyrzucałem pieniądze w błoto.\n \nProblem nie polega na tym, że wypadają Ci włosy. Problem polega na tym, że Twoje korzenie są duszone pod skórą przez DHT (dihydrotestosteron), który odcina im dopływ krwi. Łysiejąca skóra głowy ma aż 2,6 razy słabsze ukrwienie niż zdrowa. Z każdym miesiącem niedotleniony korzeń produkuje cieńszy włos, aż w końcu najpierw zasypia, a potem umiera.\n \nCo gorsza, pokazał mi analizę 92 szamponów przeciw wypadaniu włosów sprzedawanych w Polsce: 96% ich reklamowanych składników nie miało żadnego poparcia klinicznego, a 30% zawierało agresywne siarczany SLS, które podrażniają mieszki i mogą wypadanie wręcz nasilać.\n \nAle potem powiedział rzecz, która uratowała moje włosy:\n \n„80% pana korzeni wciąż żyje. Część jest uśpiona przez DHT, ale dopóki w mieszku jest choćby mikroskopijny meszek — da się go obudzić. Tylko trzeba zrobić 3 rzeczy naraz w tym samym czasie. Nie 1. Nie 2. Wszystkie 3.”\n \n1. Zablokować DHT bezpośrednio u nasady, żeby przestał dusić cebulki.\n2. Rozszerzyć naczynia krwionośne w skórze głowy, żeby wpuścić do śpiących korzeni tlen i krew.\n3. Wydłużyć fazę wzrostu (anagenu), żeby nowy włos zdążył zgrubieć, zanim wypadnie.\n \nSpójrz na to, co stoi dziś w Twojej łazience:\nSzampony kofeinowe za 30 zł z drogerii? Robią 0 z 3.\nMinoksydyl (Loxon)? Robi 1 z 3 — rozszerza naczynia, ale nie blokuje DHT, więc po odstawieniu wszystko wypada.\nTabletki na receptę? Robią 1 z 3 — blokują DHT w całym ciele kosztem męskości, ale nie budzą uśpionych korzeni.\n \nZapytałem, czy istnieje cokolwiek bez recepty, co robi wszystkie 3 rzeczy naraz podczas zwykłego mycia. Wziął kartkę z biurka i zapisał mi jedną nazwę:\n \nSzampon SARDIAN (korzeń lukrecji + rdest wielokwiatowy + mięta pieprzowa + żeń-szeń + Biota Orientalis).\n \nWieczorem w domu sprawdziłem skład i badania w PubMed. 3 etapy w 1 myciu:\n- Korzeń lukrecji, rdest wielokwiatowy i Eclipta Prostrata miejscowo blokują enzym zamieniający testosteron w DHT w skórze głowy — ten sam cel co leki, ale bez skutków ubocznych.\n- Mięta pieprzowa i naturalny mentol natychmiast rozszerzają naczynia włosowate i przywracają krążenie.\n- Żeń-szeń (Ginsenozyd F2 — o 20% szybszy wzrost w badaniach) i Biota Orientalis budzą uśpione cebulki i wydłużają życie włosa.\nZero SLS. Zero silikonów.\n \nZamówiłem pakiet 2+1 z 60-dniową gwarancją zwrotu pieniędzy.\n \n1. mycie — po 60 sekundach poczułem wyraźne, głębokie mrowienie i chłód na skórze głowy. Pierwszy raz czułem, że coś faktycznie dociera pod skórę, a nie tylko myje włosy z wierzchu.\n \n2. tydzień — zniknęło swędzenie i przetłuszczanie na czubku głowy. Po prysznicu sam podniosłem sitko odpływu. Zamiast czarnego kłębka były 4 pojedyncze włosy. Zawołałem żonę do łazienki, żeby sama zobaczyła.\n \n5. tydzień — pod ostrym światłem nad lustrem zobaczyłem wzdłuż skroni gęsty, krótki meszek. Mieszki, które spały od 2 lat, zaczęły produkować nowe włosy.\n \n10. tydzień — prześwit na czubku głowy zamknął się na tyle, że przestałem zakładać czapkę z daszkiem na każde wyjście z domu.\n \nNie odzyskam tych 20% korzeni, które umarły, kiedy przez 2 lata udawałem, że problem nie istnieje. Te są martwe na zawsze. Ale pozostałe 80% uratowałem, bo zadziałałem na 3 etapy naraz, zanim okno się zamknęło.\n \nJeśli po prysznicu boisz się spojrzeć w dół na odpływ — nie czekaj, aż kolejne 10% Twoich mieszków przejdzie ze snu do śmierci.\n \n— Michał, 39 lat, Poznań\n \n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie\n \nP.S. Moja żona przyznała mi się później, że czyściła ten odpływ po moich kąpielach przez prawie 5 miesięcy. Dziś sitko po prysznicu jest czyste, a pod prysznicem stoi już 2. butelka SARDIAN.\n \nP.P.S. Masz pełne 60 dni gwarancji zwrotu pieniędzy (ocena 4,7 na 5 z ponad 4 700 opinii). Policz włosy na sitku jutro rano. Myj głowę szamponem SARDIAN przez 3 minuty dziennie i sprawdź odpływ za 3 tygodnie. Jeśli nie zobaczysz różnicy — zwracają 100% kasy."
  },
  "sardian_k2_v2": {
    "headline": "Przez 2 lata bałem się spojrzeć w dół na sitko odpływu po prysznicu",
    "description": "Sprawdź metodę 3 z 3 — 60 dni gwarancji zwrotu",
    "primaryText": "To zdjęcie zrobiłem dziś rano o 7:00, od razu po wyjściu spod prysznica.\n \nNa metalowym sitku w mojej dłoni nie ma kłębka włosów. Są 3 pojedyncze włoski.\n \nJeszcze 2 miesiące temu po każdym myciu głowy wyjmowałem z tego samego odpływu czarny, zbity czop moich własnych włosów. Miałem 39 lat i doszedłem do momentu, w którym przed wejściem pod prysznic czułem ścisk w żołądku, bo wiedziałem, co zobaczę na dole.\n \nPrzełom nastąpił w sobotę, kiedy wszedłem do łazienki i przyłapałem żonę, jak po cichu wybierała moje włosy z sitka papierem toaletowym, żebym się nie załamywał przed pracą.\n\nJeszcze tego samego tygodnia umówiłem się na badanie kamerą do trychologa. Kiedy przyłożył głowicę powiększającą 200 razy do czubka mojej głowy i obrócił ekran w moją stronę, powiedział jedno zdanie, które pamiętam do dziś:\n \n„Te mieszki tutaj są już martwe. Tych już pan nie obudzi.”\n \nPokazał palcem na ekranie puste otwory w skórze głowy. Wyglądały jak dziury po gwoździach w ścianie. Zero włosa. Zero meszku. Zapytałem, ile ich jest.\n \n20% na czubku głowy i w zakolach.\n \n20% moich korzeni nie spało. Nie było osłabionych. Umarło na zawsze w czasie, kiedy ja przez 2 lata kupowałem kolejne szampony z drogerii i apteki, wierząc w reklamy z telewizji.\n \nAlpecin — 6 miesięcy. Nic.\nBiotebal — 4 miesiące. Nic.\nDX2 — 3 miesiące. Nic.\nPotem Loxon 5% wcierany 2 razy dziennie przez 8 miesięcy. Dopóki smarowałem, wypadanie trochę zwolniło, ale stałem się niewolnikiem butelki — wystarczyły 3 dni wyjazdu bez wcierki i odpływ znów był czarny. A o finasterydzie przeczytałem 1 wątek od 28-latka, któremu po 2 miesiącach całkowicie siadło libido, i wyrzuciłem receptę do kosza.\n \nTrycholog wytłumaczył mi w 3 minuty, dlaczego przez 2 lata wyrzucałem pieniądze w błoto.\n \nProblem nie polega na tym, że wypadają Ci włosy. Problem polega na tym, że Twoje korzenie są duszone pod skórą przez DHT (dihydrotestosteron), który odcina im dopływ krwi. Łysiejąca skóra głowy ma aż 2,6 razy słabsze ukrwienie niż zdrowa. Z każdym miesiącem niedotleniony korzeń produkuje cieńszy włos, aż w końcu najpierw zasypia, a potem umiera.\n \nCo gorsza, pokazał mi analizę 92 szamponów przeciw wypadaniu włosów sprzedawanych w Polsce: 96% ich reklamowanych składników nie miało żadnego poparcia klinicznego, a 30% zawierało agresywne siarczany SLS, które podrażniają mieszki i mogą wypadanie wręcz nasilać.\n \nAle potem powiedział rzecz, która uratowała moje włosy:\n \n„80% pana korzeni wciąż żyje. Część jest uśpiona przez DHT, ale dopóki w mieszku jest choćby mikroskopijny meszek — da się go obudzić. Tylko trzeba zrobić 3 rzeczy naraz w tym samym czasie. Nie 1. Nie 2. Wszystkie 3.”\n \n1. Zablokować DHT bezpośrednio u nasady, żeby przestał dusić cebulki.\n2. Rozszerzyć naczynia krwionośne w skórze głowy, żeby wpuścić do śpiących korzeni tlen i krew.\n3. Wydłużyć fazę wzrostu (anagenu), żeby nowy włos zdążył zgrubieć, zanim wypadnie.\n \nSpójrz na to, co stoi dziś w Twojej łazience:\nSzampony kofeinowe za 30 zł z drogerii? Robią 0 z 3.\nMinoksydyl (Loxon)? Robi 1 z 3 — rozszerza naczynia, ale nie blokuje DHT, więc po odstawieniu wszystko wypada.\nTabletki na receptę? Robią 1 z 3 — blokują DHT w całym ciele kosztem męskości, ale nie budzą uśpionych korzeni.\n \nZapytałem, czy istnieje cokolwiek bez recepty, co robi wszystkie 3 rzeczy naraz podczas zwykłego mycia. Wziął kartkę z biurka i zapisał mi jedną nazwę:\n \nSzampon SARDIAN (korzeń lukrecji + rdest wielokwiatowy + mięta pieprzowa + żeń-szeń + Biota Orientalis).\n \nWieczorem w domu sprawdziłem skład i badania w PubMed. 3 etapy w 1 myciu:\n- Korzeń lukrecji, rdest wielokwiatowy i Eclipta Prostrata miejscowo blokują enzym zamieniający testosteron w DHT w skórze głowy — ten sam cel co leki, ale bez skutków ubocznych.\n- Mięta pieprzowa i naturalny mentol natychmiast rozszerzają naczynia włosowate i przywracają krążenie.\n- Żeń-szeń (Ginsenozyd F2 — o 20% szybszy wzrost w badaniach) i Biota Orientalis budzą uśpione cebulki i wydłużają życie włosa.\nZero SLS. Zero silikonów.\n \nZamówiłem pakiet 2+1 z 60-dniową gwarancją zwrotu pieniędzy.\n \n1. mycie — po 60 sekundach poczułem wyraźne, głębokie mrowienie i chłód na skórze głowy. Pierwszy raz czułem, że coś faktycznie dociera pod skórę, a nie tylko myje włosy z wierzchu.\n \n2. tydzień — zniknęło swędzenie i przetłuszczanie na czubku głowy. Po prysznicu sam podniosłem sitko odpływu. Zamiast czarnego kłębka były 4 pojedyncze włosy. Zawołałem żonę do łazienki, żeby sama zobaczyła.\n \n5. tydzień — pod ostrym światłem nad lustrem zobaczyłem wzdłuż skroni gęsty, krótki meszek. Mieszki, które spały od 2 lat, zaczęły produkować nowe włosy.\n \n10. tydzień — prześwit na czubku głowy zamknął się na tyle, że przestałem zakładać czapkę z daszkiem na każde wyjście z domu.\n \nNie odzyskam tych 20% korzeni, które umarły, kiedy przez 2 lata udawałem, że problem nie istnieje. Te są martwe na zawsze. Ale pozostałe 80% uratowałem, bo zadziałałem na 3 etapy naraz, zanim okno się zamknęło.\n \nJeśli po prysznicu boisz się spojrzeć w dół na odpływ — nie czekaj, aż kolejne 10% Twoich mieszków przejdzie ze snu do śmierci.\n \n— Michał, 39 lat, Poznań\n \n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie\n \nP.S. Moja żona przyznała mi się później, że czyściła ten odpływ po moich kąpielach przez prawie 5 miesięcy. Dziś sitko po prysznicu jest czyste, a pod prysznicem stoi już 2. butelka SARDIAN.\n \nP.P.S. Masz pełne 60 dni gwarancji zwrotu pieniędzy (ocena 4,7 na 5 z ponad 4 700 opinii). Policz włosy na sitku jutro rano. Myj głowę szamponem SARDIAN przez 3 minuty dziennie i sprawdź odpływ za 3 tygodnie. Jeśli nie zobaczysz różnicy — zwracają 100% kasy."
  },
  "sardian_k2_v3": {
    "headline": "Myślałem, że żona nie zauważa moich zakoli. Prawda zabolała bardziej",
    "description": "Sprawdź metodę 3 z 3 — 60 dni gwarancji zwrotu",
    "primaryText": "Każdy łysiejący facet wmawia sobie to samo kłamstwo: „Nikt jeszcze tego nie widzi, tylko ja zwracam na to uwagę pod ostrym światłem w łazience”.\n \nJa też tak myślałem. Mam 39 lat. Kiedy zakola poszły w górę o 2 cm, zacząłem czesać włosy inaczej. Kiedy na czubku głowy pojawił się prześwit, zacząłem nosić czapkę.\n \nAż w sobotę rano wszedłem do łazienki bez pukania i zobaczyłem żonę klęczącą przy otwartej kabinie prysznicowej. W ręku trzymała chusteczkę pełną moich mokrych włosów wyjętych z odpływu. Chowała je przede mną od 5 miesięcy, żebym nie widział, jak szybko łysieję.\n\nJeszcze tego samego tygodnia umówiłem się na badanie kamerą do trychologa. Kiedy przyłożył głowicę powiększającą 200 razy do czubka mojej głowy i obrócił ekran w moją stronę, powiedział jedno zdanie, które pamiętam do dziś:\n \n„Te mieszki tutaj są już martwe. Tych już pan nie obudzi.”\n \nPokazał palcem na ekranie puste otwory w skórze głowy. Wyglądały jak dziury po gwoździach w ścianie. Zero włosa. Zero meszku. Zapytałem, ile ich jest.\n \n20% na czubku głowy i w zakolach.\n \n20% moich korzeni nie spało. Nie było osłabionych. Umarło na zawsze w czasie, kiedy ja przez 2 lata kupowałem kolejne szampony z drogerii i apteki, wierząc w reklamy z telewizji.\n \nAlpecin — 6 miesięcy. Nic.\nBiotebal — 4 miesiące. Nic.\nDX2 — 3 miesiące. Nic.\nPotem Loxon 5% wcierany 2 razy dziennie przez 8 miesięcy. Dopóki smarowałem, wypadanie trochę zwolniło, ale stałem się niewolnikiem butelki — wystarczyły 3 dni wyjazdu bez wcierki i odpływ znów był czarny. A o finasterydzie przeczytałem 1 wątek od 28-latka, któremu po 2 miesiącach całkowicie siadło libido, i wyrzuciłem receptę do kosza.\n \nTrycholog wytłumaczył mi w 3 minuty, dlaczego przez 2 lata wyrzucałem pieniądze w błoto.\n \nProblem nie polega na tym, że wypadają Ci włosy. Problem polega na tym, że Twoje korzenie są duszone pod skórą przez DHT (dihydrotestosteron), który odcina im dopływ krwi. Łysiejąca skóra głowy ma aż 2,6 razy słabsze ukrwienie niż zdrowa. Z każdym miesiącem niedotleniony korzeń produkuje cieńszy włos, aż w końcu najpierw zasypia, a potem umiera.\n \nCo gorsza, pokazał mi analizę 92 szamponów przeciw wypadaniu włosów sprzedawanych w Polsce: 96% ich reklamowanych składników nie miało żadnego poparcia klinicznego, a 30% zawierało agresywne siarczany SLS, które podrażniają mieszki i mogą wypadanie wręcz nasilać.\n \nAle potem powiedział rzecz, która uratowała moje włosy:\n \n„80% pana korzeni wciąż żyje. Część jest uśpiona przez DHT, ale dopóki w mieszku jest choćby mikroskopijny meszek — da się go obudzić. Tylko trzeba zrobić 3 rzeczy naraz w tym samym czasie. Nie 1. Nie 2. Wszystkie 3.”\n \n1. Zablokować DHT bezpośrednio u nasady, żeby przestał dusić cebulki.\n2. Rozszerzyć naczynia krwionośne w skórze głowy, żeby wpuścić do śpiących korzeni tlen i krew.\n3. Wydłużyć fazę wzrostu (anagenu), żeby nowy włos zdążył zgrubieć, zanim wypadnie.\n \nSpójrz na to, co stoi dziś w Twojej łazience:\nSzampony kofeinowe za 30 zł z drogerii? Robią 0 z 3.\nMinoksydyl (Loxon)? Robi 1 z 3 — rozszerza naczynia, ale nie blokuje DHT, więc po odstawieniu wszystko wypada.\nTabletki na receptę? Robią 1 z 3 — blokują DHT w całym ciele kosztem męskości, ale nie budzą uśpionych korzeni.\n \nZapytałem, czy istnieje cokolwiek bez recepty, co robi wszystkie 3 rzeczy naraz podczas zwykłego mycia. Wziął kartkę z biurka i zapisał mi jedną nazwę:\n \nSzampon SARDIAN (korzeń lukrecji + rdest wielokwiatowy + mięta pieprzowa + żeń-szeń + Biota Orientalis).\n \nWieczorem w domu sprawdziłem skład i badania w PubMed. 3 etapy w 1 myciu:\n- Korzeń lukrecji, rdest wielokwiatowy i Eclipta Prostrata miejscowo blokują enzym zamieniający testosteron w DHT w skórze głowy — ten sam cel co leki, ale bez skutków ubocznych.\n- Mięta pieprzowa i naturalny mentol natychmiast rozszerzają naczynia włosowate i przywracają krążenie.\n- Żeń-szeń (Ginsenozyd F2 — o 20% szybszy wzrost w badaniach) i Biota Orientalis budzą uśpione cebulki i wydłużają życie włosa.\nZero SLS. Zero silikonów.\n \nZamówiłem pakiet 2+1 z 60-dniową gwarancją zwrotu pieniędzy.\n \n1. mycie — po 60 sekundach poczułem wyraźne, głębokie mrowienie i chłód na skórze głowy. Pierwszy raz czułem, że coś faktycznie dociera pod skórę, a nie tylko myje włosy z wierzchu.\n \n2. tydzień — zniknęło swędzenie i przetłuszczanie na czubku głowy. Po prysznicu sam podniosłem sitko odpływu. Zamiast czarnego kłębka były 4 pojedyncze włosy. Zawołałem żonę do łazienki, żeby sama zobaczyła.\n \n5. tydzień — pod ostrym światłem nad lustrem zobaczyłem wzdłuż skroni gęsty, krótki meszek. Mieszki, które spały od 2 lat, zaczęły produkować nowe włosy.\n \n10. tydzień — prześwit na czubku głowy zamknął się na tyle, że przestałem zakładać czapkę z daszkiem na każde wyjście z domu.\n \nNie odzyskam tych 20% korzeni, które umarły, kiedy przez 2 lata udawałem, że problem nie istnieje. Te są martwe na zawsze. Ale pozostałe 80% uratowałem, bo zadziałałem na 3 etapy naraz, zanim okno się zamknęło.\n \nJeśli po prysznicu boisz się spojrzeć w dół na odpływ — nie czekaj, aż kolejne 10% Twoich mieszków przejdzie ze snu do śmierci.\n \n— Michał, 39 lat, Poznań\n \n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie\n \nP.S. Moja żona przyznała mi się później, że czyściła ten odpływ po moich kąpielach przez prawie 5 miesięcy. Dziś sitko po prysznicu jest czyste, a pod prysznicem stoi już 2. butelka SARDIAN.\n \nP.P.S. Masz pełne 60 dni gwarancji zwrotu pieniędzy (ocena 4,7 na 5 z ponad 4 700 opinii). Policz włosy na sitku jutro rano. Myj głowę szamponem SARDIAN przez 3 minuty dziennie i sprawdź odpływ za 3 tygodnie. Jeśli nie zobaczysz różnicy — zwracają 100% kasy."
  },
  "sardian_k2_v4": {
    "headline": "Wyrzuciłem receptę do kosza, kiedy przeczytałem o skutkach ubocznych",
    "description": "Sprawdź metodę 3 z 3 — 60 dni gwarancji zwrotu",
    "primaryText": "W koszu na śmieci w mojej łazience leży zgnieciona recepta od dermatologa, za którą zapłaciłem 350 zł na prywatnej wizycie. A w ręku trzymam czarną butelkę, która faktycznie uratowała moje włosy bez rujnowania mojego zdrowia.\n \nMam 39 lat. Kiedy 2 miesiące temu przyłapałem żonę, jak po cichu czyściła sitko pod prysznicem z kłębków moich włosów, spanikowałem. Poszedłem do dermatologa. Po 4 minutach rozmowy bez patrzenia na moją głowę wypisał mi tabletki blokujące hormony w całym organizmie.\n \nWróciłem do domu, przeczytałem ulotkę i wątki facetów, którym po 1 miesiącu siadło libido na pół roku. Zgniotłem receptę, wrzuciłem ją do kosza i poszedłem na badanie kamerą do trychologa.\n\nJeszcze tego samego tygodnia umówiłem się na badanie kamerą do trychologa. Kiedy przyłożył głowicę powiększającą 200 razy do czubka mojej głowy i obrócił ekran w moją stronę, powiedział jedno zdanie, które pamiętam do dziś:\n \n„Te mieszki tutaj są już martwe. Tych już pan nie obudzi.”\n \nPokazał palcem na ekranie puste otwory w skórze głowy. Wyglądały jak dziury po gwoździach w ścianie. Zero włosa. Zero meszku. Zapytałem, ile ich jest.\n \n20% na czubku głowy i w zakolach.\n \n20% moich korzeni nie spało. Nie było osłabionych. Umarło na zawsze w czasie, kiedy ja przez 2 lata kupowałem kolejne szampony z drogerii i apteki, wierząc w reklamy z telewizji.\n \nAlpecin — 6 miesięcy. Nic.\nBiotebal — 4 miesiące. Nic.\nDX2 — 3 miesiące. Nic.\nPotem Loxon 5% wcierany 2 razy dziennie przez 8 miesięcy. Dopóki smarowałem, wypadanie trochę zwolniło, ale stałem się niewolnikiem butelki — wystarczyły 3 dni wyjazdu bez wcierki i odpływ znów był czarny. A o finasterydzie przeczytałem 1 wątek od 28-latka, któremu po 2 miesiącach całkowicie siadło libido, i wyrzuciłem receptę do kosza.\n \nTrycholog wytłumaczył mi w 3 minuty, dlaczego przez 2 lata wyrzucałem pieniądze w błoto.\n \nProblem nie polega na tym, że wypadają Ci włosy. Problem polega na tym, że Twoje korzenie są duszone pod skórą przez DHT (dihydrotestosteron), który odcina im dopływ krwi. Łysiejąca skóra głowy ma aż 2,6 razy słabsze ukrwienie niż zdrowa. Z każdym miesiącem niedotleniony korzeń produkuje cieńszy włos, aż w końcu najpierw zasypia, a potem umiera.\n \nCo gorsza, pokazał mi analizę 92 szamponów przeciw wypadaniu włosów sprzedawanych w Polsce: 96% ich reklamowanych składników nie miało żadnego poparcia klinicznego, a 30% zawierało agresywne siarczany SLS, które podrażniają mieszki i mogą wypadanie wręcz nasilać.\n \nAle potem powiedział rzecz, która uratowała moje włosy:\n \n„80% pana korzeni wciąż żyje. Część jest uśpiona przez DHT, ale dopóki w mieszku jest choćby mikroskopijny meszek — da się go obudzić. Tylko trzeba zrobić 3 rzeczy naraz w tym samym czasie. Nie 1. Nie 2. Wszystkie 3.”\n \n1. Zablokować DHT bezpośrednio u nasady, żeby przestał dusić cebulki.\n2. Rozszerzyć naczynia krwionośne w skórze głowy, żeby wpuścić do śpiących korzeni tlen i krew.\n3. Wydłużyć fazę wzrostu (anagenu), żeby nowy włos zdążył zgrubieć, zanim wypadnie.\n \nSpójrz na to, co stoi dziś w Twojej łazience:\nSzampony kofeinowe za 30 zł z drogerii? Robią 0 z 3.\nMinoksydyl (Loxon)? Robi 1 z 3 — rozszerza naczynia, ale nie blokuje DHT, więc po odstawieniu wszystko wypada.\nTabletki na receptę? Robią 1 z 3 — blokują DHT w całym ciele kosztem męskości, ale nie budzą uśpionych korzeni.\n \nZapytałem, czy istnieje cokolwiek bez recepty, co robi wszystkie 3 rzeczy naraz podczas zwykłego mycia. Wziął kartkę z biurka i zapisał mi jedną nazwę:\n \nSzampon SARDIAN (korzeń lukrecji + rdest wielokwiatowy + mięta pieprzowa + żeń-szeń + Biota Orientalis).\n \nWieczorem w domu sprawdziłem skład i badania w PubMed. 3 etapy w 1 myciu:\n- Korzeń lukrecji, rdest wielokwiatowy i Eclipta Prostrata miejscowo blokują enzym zamieniający testosteron w DHT w skórze głowy — ten sam cel co leki, ale bez skutków ubocznych.\n- Mięta pieprzowa i naturalny mentol natychmiast rozszerzają naczynia włosowate i przywracają krążenie.\n- Żeń-szeń (Ginsenozyd F2 — o 20% szybszy wzrost w badaniach) i Biota Orientalis budzą uśpione cebulki i wydłużają życie włosa.\nZero SLS. Zero silikonów.\n \nZamówiłem pakiet 2+1 z 60-dniową gwarancją zwrotu pieniędzy.\n \n1. mycie — po 60 sekundach poczułem wyraźne, głębokie mrowienie i chłód na skórze głowy. Pierwszy raz czułem, że coś faktycznie dociera pod skórę, a nie tylko myje włosy z wierzchu.\n \n2. tydzień — zniknęło swędzenie i przetłuszczanie na czubku głowy. Po prysznicu sam podniosłem sitko odpływu. Zamiast czarnego kłębka były 4 pojedyncze włosy. Zawołałem żonę do łazienki, żeby sama zobaczyła.\n \n5. tydzień — pod ostrym światłem nad lustrem zobaczyłem wzdłuż skroni gęsty, krótki meszek. Mieszki, które spały od 2 lat, zaczęły produkować nowe włosy.\n \n10. tydzień — prześwit na czubku głowy zamknął się na tyle, że przestałem zakładać czapkę z daszkiem na każde wyjście z domu.\n \nNie odzyskam tych 20% korzeni, które umarły, kiedy przez 2 lata udawałem, że problem nie istnieje. Te są martwe na zawsze. Ale pozostałe 80% uratowałem, bo zadziałałem na 3 etapy naraz, zanim okno się zamknęło.\n \nJeśli po prysznicu boisz się spojrzeć w dół na odpływ — nie czekaj, aż kolejne 10% Twoich mieszków przejdzie ze snu do śmierci.\n \n— Michał, 39 lat, Poznań\n \n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie\n \nP.S. Moja żona przyznała mi się później, że czyściła ten odpływ po moich kąpielach przez prawie 5 miesięcy. Dziś sitko po prysznicu jest czyste, a pod prysznicem stoi już 2. butelka SARDIAN.\n \nP.P.S. Masz pełne 60 dni gwarancji zwrotu pieniędzy (ocena 4,7 na 5 z ponad 4 700 opinii). Policz włosy na sitku jutro rano. Myj głowę szamponem SARDIAN przez 3 minuty dziennie i sprawdź odpływ za 3 tygodnie. Jeśli nie zobaczysz różnicy — zwracają 100% kasy."
  },
  "sardian_k2_v5": {
    "headline": "Pierwszy raz od 3 lat stanąłem z mokrymi włosami pod ostrym światłem",
    "description": "Sprawdź metodę 3 z 3 — 60 dni gwarancji zwrotu",
    "primaryText": "Każdy facet, któremu lecą włosy, zna ten najgorszy moment dnia: wychodzisz spod prysznica z mokrą głową, stajesz przed lustrem pod górną lampą i widzisz gołą skórę prześwitującą między sklejonymi pasmami.\n \nPrzez 3 lata po każdym myciu wycierałem głowę ręcznikiem przy zgaszonym głównym świetle, żeby na to nie patrzeć. A moja żona po cichu wybierała moje włosy z sitka w odpływie, żebym się nie dołował.\n \nDziś mam 39 lat i zrobiłem to zdjęcie po porannym prysznicu przy włączonych wszystkich lampach w łazience. Linia skroni jest z powrotem gęsta, a na sitku w odpływie zostały 4 włosy zamiast 30.\n\nJeszcze tego samego tygodnia umówiłem się na badanie kamerą do trychologa. Kiedy przyłożył głowicę powiększającą 200 razy do czubka mojej głowy i obrócił ekran w moją stronę, powiedział jedno zdanie, które pamiętam do dziś:\n \n„Te mieszki tutaj są już martwe. Tych już pan nie obudzi.”\n \nPokazał palcem na ekranie puste otwory w skórze głowy. Wyglądały jak dziury po gwoździach w ścianie. Zero włosa. Zero meszku. Zapytałem, ile ich jest.\n \n20% na czubku głowy i w zakolach.\n \n20% moich korzeni nie spało. Nie było osłabionych. Umarło na zawsze w czasie, kiedy ja przez 2 lata kupowałem kolejne szampony z drogerii i apteki, wierząc w reklamy z telewizji.\n \nAlpecin — 6 miesięcy. Nic.\nBiotebal — 4 miesiące. Nic.\nDX2 — 3 miesiące. Nic.\nPotem Loxon 5% wcierany 2 razy dziennie przez 8 miesięcy. Dopóki smarowałem, wypadanie trochę zwolniło, ale stałem się niewolnikiem butelki — wystarczyły 3 dni wyjazdu bez wcierki i odpływ znów był czarny. A o finasterydzie przeczytałem 1 wątek od 28-latka, któremu po 2 miesiącach całkowicie siadło libido, i wyrzuciłem receptę do kosza.\n \nTrycholog wytłumaczył mi w 3 minuty, dlaczego przez 2 lata wyrzucałem pieniądze w błoto.\n \nProblem nie polega na tym, że wypadają Ci włosy. Problem polega na tym, że Twoje korzenie są duszone pod skórą przez DHT (dihydrotestosteron), który odcina im dopływ krwi. Łysiejąca skóra głowy ma aż 2,6 razy słabsze ukrwienie niż zdrowa. Z każdym miesiącem niedotleniony korzeń produkuje cieńszy włos, aż w końcu najpierw zasypia, a potem umiera.\n \nCo gorsza, pokazał mi analizę 92 szamponów przeciw wypadaniu włosów sprzedawanych w Polsce: 96% ich reklamowanych składników nie miało żadnego poparcia klinicznego, a 30% zawierało agresywne siarczany SLS, które podrażniają mieszki i mogą wypadanie wręcz nasilać.\n \nAle potem powiedział rzecz, która uratowała moje włosy:\n \n„80% pana korzeni wciąż żyje. Część jest uśpiona przez DHT, ale dopóki w mieszku jest choćby mikroskopijny meszek — da się go obudzić. Tylko trzeba zrobić 3 rzeczy naraz w tym samym czasie. Nie 1. Nie 2. Wszystkie 3.”\n \n1. Zablokować DHT bezpośrednio u nasady, żeby przestał dusić cebulki.\n2. Rozszerzyć naczynia krwionośne w skórze głowy, żeby wpuścić do śpiących korzeni tlen i krew.\n3. Wydłużyć fazę wzrostu (anagenu), żeby nowy włos zdążył zgrubieć, zanim wypadnie.\n \nSpójrz na to, co stoi dziś w Twojej łazience:\nSzampony kofeinowe za 30 zł z drogerii? Robią 0 z 3.\nMinoksydyl (Loxon)? Robi 1 z 3 — rozszerza naczynia, ale nie blokuje DHT, więc po odstawieniu wszystko wypada.\nTabletki na receptę? Robią 1 z 3 — blokują DHT w całym ciele kosztem męskości, ale nie budzą uśpionych korzeni.\n \nZapytałem, czy istnieje cokolwiek bez recepty, co robi wszystkie 3 rzeczy naraz podczas zwykłego mycia. Wziął kartkę z biurka i zapisał mi jedną nazwę:\n \nSzampon SARDIAN (korzeń lukrecji + rdest wielokwiatowy + mięta pieprzowa + żeń-szeń + Biota Orientalis).\n \nWieczorem w domu sprawdziłem skład i badania w PubMed. 3 etapy w 1 myciu:\n- Korzeń lukrecji, rdest wielokwiatowy i Eclipta Prostrata miejscowo blokują enzym zamieniający testosteron w DHT w skórze głowy — ten sam cel co leki, ale bez skutków ubocznych.\n- Mięta pieprzowa i naturalny mentol natychmiast rozszerzają naczynia włosowate i przywracają krążenie.\n- Żeń-szeń (Ginsenozyd F2 — o 20% szybszy wzrost w badaniach) i Biota Orientalis budzą uśpione cebulki i wydłużają życie włosa.\nZero SLS. Zero silikonów.\n \nZamówiłem pakiet 2+1 z 60-dniową gwarancją zwrotu pieniędzy.\n \n1. mycie — po 60 sekundach poczułem wyraźne, głębokie mrowienie i chłód na skórze głowy. Pierwszy raz czułem, że coś faktycznie dociera pod skórę, a nie tylko myje włosy z wierzchu.\n \n2. tydzień — zniknęło swędzenie i przetłuszczanie na czubku głowy. Po prysznicu sam podniosłem sitko odpływu. Zamiast czarnego kłębka były 4 pojedyncze włosy. Zawołałem żonę do łazienki, żeby sama zobaczyła.\n \n5. tydzień — pod ostrym światłem nad lustrem zobaczyłem wzdłuż skroni gęsty, krótki meszek. Mieszki, które spały od 2 lat, zaczęły produkować nowe włosy.\n \n10. tydzień — prześwit na czubku głowy zamknął się na tyle, że przestałem zakładać czapkę z daszkiem na każde wyjście z domu.\n \nNie odzyskam tych 20% korzeni, które umarły, kiedy przez 2 lata udawałem, że problem nie istnieje. Te są martwe na zawsze. Ale pozostałe 80% uratowałem, bo zadziałałem na 3 etapy naraz, zanim okno się zamknęło.\n \nJeśli po prysznicu boisz się spojrzeć w dół na odpływ — nie czekaj, aż kolejne 10% Twoich mieszków przejdzie ze snu do śmierci.\n \n— Michał, 39 lat, Poznań\n \n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie\n \nP.S. Moja żona przyznała mi się później, że czyściła ten odpływ po moich kąpielach przez prawie 5 miesięcy. Dziś sitko po prysznicu jest czyste, a pod prysznicem stoi już 2. butelka SARDIAN.\n \nP.P.S. Masz pełne 60 dni gwarancji zwrotu pieniędzy (ocena 4,7 na 5 z ponad 4 700 opinii). Policz włosy na sitku jutro rano. Myj głowę szamponem SARDIAN przez 3 minuty dziennie i sprawdź odpływ za 3 tygodnie. Jeśli nie zobaczysz różnicy — zwracają 100% kasy."
  },
  "sardian_k3_v1": {
    "headline": "Szwagier wydał 17 000 zł w Turcji. Po roku zapytał mnie, co zrobiłem z włosami",
    "description": "3 etapy w 1 myciu — sprawdź z 60-dniową gwarancją",
    "primaryText": "Mój szwagier Tomek wydał w zeszłym roku 17 000 zł na przeszczep włosów w Stambule. Wrócił z opuchniętym czołem, czerwoną skorupą z tyłu głowy i przez 3 tygodnie spał na siedząco z poduszką podróżną na szyi.\n \nPrzez pierwsze 6 miesięcy był królem każdej rodzinnej imprezy. Pokazywał zdjęcia przed i po. Sam byłem o krok od przelania zaliczki do tej samej kliniki, bo w wieku 45 lat moje zakola i czubek głowy wyglądały coraz gorzej.\n \nAż miesiąc temu spotkaliśmy się u niego na grillu na działce.\n \nTomek cały wieczór przy ruszcie siedział w czapce z daszkiem. Kiedy poszliśmy do kuchni po piwo i zdjął czapkę, zobaczyłem dlaczego. Przód z przeszczepu został, ale zaraz za nim — na środku i czubku głowy — zrobiła się szeroka, łysa obręcz. Jego własne, nieprzeszczepione włosy wypadły dalej.\n \nSpojrzał na moją głowę pod lampą w kuchni, zamknął drzwi i zapytał:\n— Marek, a Ty gdzie w końcu robiłeś zabieg? W Warszawie czy w Turcji?\n \nZaśmiałem się.\n— Nigdzie nie leciałem. Wydałem ułamek tego co Ty na odblokowanie korzeni, które jeszcze miałem pod skórą.\n\nBo 3 miesiące wcześniej, zanim przelałem zaliczkę do Turcji, poszedłem na diagnostykę mikrokamerą do warszawskiego trychologa. Kiedy lekarz przyłożył głowicę 200x do mojej głowy i obrócił monitor w moją stronę, powiedział mi prawdę, o której kliniki transplantacji milczą:\n \n„Przeszczep przenosi cebulki z potylicy na przód, ale nie zatrzymuje DHT w skórze głowy. Jeśli nie odetnie pan DHT u nasady, reszta pana własnych włosów za linią przeszczepu i tak obumrze w ciągu 2 lat.”\n \nPotem wskazał palcem na ekranie moje mieszki włosowe.\n \n25% z nich to były puste otwory. Martwe. Na zawsze. Zmarnowałem je przez 3 lata kupowania aptecznych szamponów kofeinowych, biotyny i wcierek, które nie działały.\n \nAle pozostałe 75% moich korzeni na czubku głowy i w zakolach wciąż żyło! Były tylko skurczone i uśpione, bo DHT odcinał im dopływ krwi, a łysiejąca skóra głowy ma 2,6 razy gorsze ukrwienie niż zdrowa.\n \nTrycholog wytłumaczył mi prostą matematykę, której żaden producent z drogerii Ci nie powie:\n \nŻeby obudzić uśpione mieszki i zatrzymać proces zamierania kolejnych, musisz podczas mycia zrobić 3 rzeczy jednocześnie:\n1. Zablokować enzym zamieniający testosteron w DHT bezpośrednio w skórze głowy.\n2. Rozszerzyć naczynia krwionośne u nasady, żeby wtłoczyć do korzeni tlen i składniki odżywcze.\n3. Wydłużyć fazę aktywnego wzrostu (anagenu), żeby nowy włos urósł gruby i mocny.\n \nPrzeanalizowano 92 produkty na wypadanie włosów dostępne w Polsce — 96% ich reklamowanych składników nie ma potwierdzenia w badaniach, a 30% zawiera ostre detergenty SLS, które pogarszają stan mieszków.\n \nSzampony z drogerii i apteki za 30–50 zł? Robią 0 z 3.\nMinoksydyl (Loxon)? Robi 1 z 3 — pobudza krążenie, ale nie blokuje DHT, więc po odstawieniu wszystko leci od nowa.\nFinasteryd w tabletkach? Robi 1 z 3 — blokuje DHT w całym organizmie kosztem libido, ale nie pobudza krążenia w skórze.\n \nTrycholog wziął bloczek i zapisał mi na kartce jedną formułę, która łączy wszystkie 3 mechanizmy w 1 myciu:\n \nSzampon SARDIAN (rdest wielokwiatowy + korzeń lukrecji + żeń-szeń + Biota Orientalis + mięta pieprzowa).\n \nSprawdziłem badania tych składników jeszcze tego samego wieczoru:\n- Korzeń lukrecji, rdest wielokwiatowy i Eclipta Prostrata miejscowo blokują DHT bezpośrednio przy cebulkach — bez ingerencji w hormony całego ciała.\n- Mięta pieprzowa i naturalny mentol natychmiast otwierają mikrokrążenie (czuć wyraźne mrowienie już po 1 minucie trzymania piany).\n- Żeń-szeń (Ginsenozyd F2 — o 20% wyższe tempo wzrostu włosa w badaniach) i Biota Orientalis budzą uśpione korzenie do produkcji grubych pasm.\n \nZamiast wydawać 17 000 zł w Stambule, zamówiłem 3-miesięczny pakiet 2+1 SARDIAN z 60-dniową gwarancją zwrotu pieniędzy.\n \nPo 2 tygodniach — na sitku pod prysznicem zamiast 25 włosów zostawało ich 5 lub 6. Skóra głowy przestała swędzieć i błyszczeć się od łoju.\n \nPo 5 tygodniach — pod lampą w łazience zobaczyłem na skroniach gęsty, ciemny meszek. Cebulki, które na ekranie kamery były uśpione, ruszyły z miejsca.\n \nPo 10 tygodniach — korona głowy i linia czoła zagęściły się tak wyraźnie, że mój szwagier po przeszczepie w Turcji był przekonany, że sam po cichu poleciałem na zabieg.\n \nTych 25% martwych mieszków z ekranu już nigdy nie odzyskam. Ale uratowałem i obudziłem pozostałe 75%, zanim okno zamknęło się na dobre.\n \n— Marek, 45 lat, Warszawa\n \n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie\n \nP.S. Dzień po tamtym grillu wysłałem szwagrowi link do SARDIAN, żeby uratował włosy, które zostały mu za linią przeszczepu. Dziś obaj myjemy nim głowę codziennie przez 3 minuty pod prysznicem.\n \nP.P.S. Masz pełne 60 dni gwarancji zwrotu pieniędzy (4,7 na 5 z ponad 4 700 opinii). Sprawdź na własnej skórze głowy i odpływie pod prysznicem — jeśli nie zobaczysz różnicy, zwracają 100% wpłaty."
  },
  "sardian_k3_v2": {
    "headline": "Po lewej szwagier rok po przeszczepie w Turcji. Po prawej ja po 90 dniach SARDIAN",
    "description": "3 etapy w 1 myciu — sprawdź z 60-dniową gwarancją",
    "primaryText": "Na tym zdjęciu z rodzinnego grilla mój szwagier Tomek (44 lata) znów stoi w czapce z daszkiem, chociaż 14 miesięcy temu wydał 17 000 zł na przeszczep włosów w Turcji. Ja (45 lat) stoję obok niego z odkrytą głową, bez czapki i bez jednego przeszczepionego włosa.\n \nDlaczego facet po zabiegu za 17 000 zł znów chowa głowę pod daszkiem?\n \nBo kiedy poszliśmy do kuchni i zdjął czapkę, zobaczyłem, że za linią przeszczepionego przodu zrobiła mu się szeroka łysa obręcz — jego własne włosy wypadły dalej. Zamknął drzwi i sam zapytał mnie, w której klinice robiłem zabieg, że moja góra tak się zagęściła.\n\nBo 3 miesiące wcześniej, zanim przelałem zaliczkę do Turcji, poszedłem na diagnostykę mikrokamerą do warszawskiego trychologa. Kiedy lekarz przyłożył głowicę 200x do mojej głowy i obrócił monitor w moją stronę, powiedział mi prawdę, o której kliniki transplantacji milczą:\n \n„Przeszczep przenosi cebulki z potylicy na przód, ale nie zatrzymuje DHT w skórze głowy. Jeśli nie odetnie pan DHT u nasady, reszta pana własnych włosów za linią przeszczepu i tak obumrze w ciągu 2 lat.”\n \nPotem wskazał palcem na ekranie moje mieszki włosowe.\n \n25% z nich to były puste otwory. Martwe. Na zawsze. Zmarnowałem je przez 3 lata kupowania aptecznych szamponów kofeinowych, biotyny i wcierek, które nie działały.\n \nAle pozostałe 75% moich korzeni na czubku głowy i w zakolach wciąż żyło! Były tylko skurczone i uśpione, bo DHT odcinał im dopływ krwi, a łysiejąca skóra głowy ma 2,6 razy gorsze ukrwienie niż zdrowa.\n \nTrycholog wytłumaczył mi prostą matematykę, której żaden producent z drogerii Ci nie powie:\n \nŻeby obudzić uśpione mieszki i zatrzymać proces zamierania kolejnych, musisz podczas mycia zrobić 3 rzeczy jednocześnie:\n1. Zablokować enzym zamieniający testosteron w DHT bezpośrednio w skórze głowy.\n2. Rozszerzyć naczynia krwionośne u nasady, żeby wtłoczyć do korzeni tlen i składniki odżywcze.\n3. Wydłużyć fazę aktywnego wzrostu (anagenu), żeby nowy włos urósł gruby i mocny.\n \nPrzeanalizowano 92 produkty na wypadanie włosów dostępne w Polsce — 96% ich reklamowanych składników nie ma potwierdzenia w badaniach, a 30% zawiera ostre detergenty SLS, które pogarszają stan mieszków.\n \nSzampony z drogerii i apteki za 30–50 zł? Robią 0 z 3.\nMinoksydyl (Loxon)? Robi 1 z 3 — pobudza krążenie, ale nie blokuje DHT, więc po odstawieniu wszystko leci od nowa.\nFinasteryd w tabletkach? Robi 1 z 3 — blokuje DHT w całym organizmie kosztem libido, ale nie pobudza krążenia w skórze.\n \nTrycholog wziął bloczek i zapisał mi na kartce jedną formułę, która łączy wszystkie 3 mechanizmy w 1 myciu:\n \nSzampon SARDIAN (rdest wielokwiatowy + korzeń lukrecji + żeń-szeń + Biota Orientalis + mięta pieprzowa).\n \nSprawdziłem badania tych składników jeszcze tego samego wieczoru:\n- Korzeń lukrecji, rdest wielokwiatowy i Eclipta Prostrata miejscowo blokują DHT bezpośrednio przy cebulkach — bez ingerencji w hormony całego ciała.\n- Mięta pieprzowa i naturalny mentol natychmiast otwierają mikrokrążenie (czuć wyraźne mrowienie już po 1 minucie trzymania piany).\n- Żeń-szeń (Ginsenozyd F2 — o 20% wyższe tempo wzrostu włosa w badaniach) i Biota Orientalis budzą uśpione korzenie do produkcji grubych pasm.\n \nZamiast wydawać 17 000 zł w Stambule, zamówiłem 3-miesięczny pakiet 2+1 SARDIAN z 60-dniową gwarancją zwrotu pieniędzy.\n \nPo 2 tygodniach — na sitku pod prysznicem zamiast 25 włosów zostawało ich 5 lub 6. Skóra głowy przestała swędzieć i błyszczeć się od łoju.\n \nPo 5 tygodniach — pod lampą w łazience zobaczyłem na skroniach gęsty, ciemny meszek. Cebulki, które na ekranie kamery były uśpione, ruszyły z miejsca.\n \nPo 10 tygodniach — korona głowy i linia czoła zagęściły się tak wyraźnie, że mój szwagier po przeszczepie w Turcji był przekonany, że sam po cichu poleciałem na zabieg.\n \nTych 25% martwych mieszków z ekranu już nigdy nie odzyskam. Ale uratowałem i obudziłem pozostałe 75%, zanim okno zamknęło się na dobre.\n \n— Marek, 45 lat, Warszawa\n \n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie\n \nP.S. Dzień po tamtym grillu wysłałem szwagrowi link do SARDIAN, żeby uratował włosy, które zostały mu za linią przeszczepu. Dziś obaj myjemy nim głowę codziennie przez 3 minuty pod prysznicem.\n \nP.P.S. Masz pełne 60 dni gwarancji zwrotu pieniędzy (4,7 na 5 z ponad 4 700 opinii). Sprawdź na własnej skórze głowy i odpływie pod prysznicem — jeśli nie zobaczysz różnicy, zwracają 100% wpłaty."
  },
  "sardian_k3_v3": {
    "headline": "Ta kartka od warszawskiego trychologa zaoszczędziła mi 17 000 zł na wyjazd do Turcji",
    "description": "3 etapy w 1 myciu — sprawdź z 60-dniową gwarancją",
    "primaryText": "Miałem już odłożone 17 000 zł na przeszczep włosów w Stambule, do którego namawiał mnie mój szwagier Tomek.\n \nZanim kliknąłem przelew zaliczki, poszedłem na 1 prywatną konsultację z mikrokamerą do trychologa w Warszawie. Lekarz obejrzał moją skórę głowy w 200-krotnym powiększeniu, zamknął laptopa i napisał mi na tej kartce jedną nazwę wraz ze składnikami:\n \n„Szampon SARDIAN (rdest wielokwiatowy + żeń-szeń + Biota Orientalis — blokada DHT)”.\n \n10 tygodni później na rodzinnym grillu mój szwagier po przeszczepie w Turcji siedział w czapce z daszkiem i pytał mnie, w jakiej klinice robiłem zabieg.\n\nBo 3 miesiące wcześniej, zanim przelałem zaliczkę do Turcji, poszedłem na diagnostykę mikrokamerą do warszawskiego trychologa. Kiedy lekarz przyłożył głowicę 200x do mojej głowy i obrócił monitor w moją stronę, powiedział mi prawdę, o której kliniki transplantacji milczą:\n \n„Przeszczep przenosi cebulki z potylicy na przód, ale nie zatrzymuje DHT w skórze głowy. Jeśli nie odetnie pan DHT u nasady, reszta pana własnych włosów za linią przeszczepu i tak obumrze w ciągu 2 lat.”\n \nPotem wskazał palcem na ekranie moje mieszki włosowe.\n \n25% z nich to były puste otwory. Martwe. Na zawsze. Zmarnowałem je przez 3 lata kupowania aptecznych szamponów kofeinowych, biotyny i wcierek, które nie działały.\n \nAle pozostałe 75% moich korzeni na czubku głowy i w zakolach wciąż żyło! Były tylko skurczone i uśpione, bo DHT odcinał im dopływ krwi, a łysiejąca skóra głowy ma 2,6 razy gorsze ukrwienie niż zdrowa.\n \nTrycholog wytłumaczył mi prostą matematykę, której żaden producent z drogerii Ci nie powie:\n \nŻeby obudzić uśpione mieszki i zatrzymać proces zamierania kolejnych, musisz podczas mycia zrobić 3 rzeczy jednocześnie:\n1. Zablokować enzym zamieniający testosteron w DHT bezpośrednio w skórze głowy.\n2. Rozszerzyć naczynia krwionośne u nasady, żeby wtłoczyć do korzeni tlen i składniki odżywcze.\n3. Wydłużyć fazę aktywnego wzrostu (anagenu), żeby nowy włos urósł gruby i mocny.\n \nPrzeanalizowano 92 produkty na wypadanie włosów dostępne w Polsce — 96% ich reklamowanych składników nie ma potwierdzenia w badaniach, a 30% zawiera ostre detergenty SLS, które pogarszają stan mieszków.\n \nSzampony z drogerii i apteki za 30–50 zł? Robią 0 z 3.\nMinoksydyl (Loxon)? Robi 1 z 3 — pobudza krążenie, ale nie blokuje DHT, więc po odstawieniu wszystko leci od nowa.\nFinasteryd w tabletkach? Robi 1 z 3 — blokuje DHT w całym organizmie kosztem libido, ale nie pobudza krążenia w skórze.\n \nTrycholog wziął bloczek i zapisał mi na kartce jedną formułę, która łączy wszystkie 3 mechanizmy w 1 myciu:\n \nSzampon SARDIAN (rdest wielokwiatowy + korzeń lukrecji + żeń-szeń + Biota Orientalis + mięta pieprzowa).\n \nSprawdziłem badania tych składników jeszcze tego samego wieczoru:\n- Korzeń lukrecji, rdest wielokwiatowy i Eclipta Prostrata miejscowo blokują DHT bezpośrednio przy cebulkach — bez ingerencji w hormony całego ciała.\n- Mięta pieprzowa i naturalny mentol natychmiast otwierają mikrokrążenie (czuć wyraźne mrowienie już po 1 minucie trzymania piany).\n- Żeń-szeń (Ginsenozyd F2 — o 20% wyższe tempo wzrostu włosa w badaniach) i Biota Orientalis budzą uśpione korzenie do produkcji grubych pasm.\n \nZamiast wydawać 17 000 zł w Stambule, zamówiłem 3-miesięczny pakiet 2+1 SARDIAN z 60-dniową gwarancją zwrotu pieniędzy.\n \nPo 2 tygodniach — na sitku pod prysznicem zamiast 25 włosów zostawało ich 5 lub 6. Skóra głowy przestała swędzieć i błyszczeć się od łoju.\n \nPo 5 tygodniach — pod lampą w łazience zobaczyłem na skroniach gęsty, ciemny meszek. Cebulki, które na ekranie kamery były uśpione, ruszyły z miejsca.\n \nPo 10 tygodniach — korona głowy i linia czoła zagęściły się tak wyraźnie, że mój szwagier po przeszczepie w Turcji był przekonany, że sam po cichu poleciałem na zabieg.\n \nTych 25% martwych mieszków z ekranu już nigdy nie odzyskam. Ale uratowałem i obudziłem pozostałe 75%, zanim okno zamknęło się na dobre.\n \n— Marek, 45 lat, Warszawa\n \n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie\n \nP.S. Dzień po tamtym grillu wysłałem szwagrowi link do SARDIAN, żeby uratował włosy, które zostały mu za linią przeszczepu. Dziś obaj myjemy nim głowę codziennie przez 3 minuty pod prysznicem.\n \nP.P.S. Masz pełne 60 dni gwarancji zwrotu pieniędzy (4,7 na 5 z ponad 4 700 opinii). Sprawdź na własnej skórze głowy i odpływie pod prysznicem — jeśli nie zobaczysz różnicy, zwracają 100% wpłaty."
  },
  "sardian_k3_v4": {
    "headline": "Zamiast lecieć do Stambułu za 17 000 zł, odebrałem z Paczkomatu te 3 butelki",
    "description": "3 etapy w 1 myciu — sprawdź z 60-dniową gwarancją",
    "primaryText": "W tej paczce z Paczkomatu są 3 czarne butelki, które kosztowały mnie mniej niż 1 wizyta w gabinecie, a zrobiły z moimi włosami to, czego nie dały 3 lata aptecznych kuracji ani przeszczep mojego szwagra za 17 000 zł.\n \nMam 45 lat. Jeszcze 3 miesiące temu szukałem biletów lotniczych do Stambułu, bo patrzyłem na zakola w lustrze i myślałem, że moje mieszki włosowe są już martwe.\n \nOkazało się, że myliłem się w 75%.\n\nBo 3 miesiące wcześniej, zanim przelałem zaliczkę do Turcji, poszedłem na diagnostykę mikrokamerą do warszawskiego trychologa. Kiedy lekarz przyłożył głowicę 200x do mojej głowy i obrócił monitor w moją stronę, powiedział mi prawdę, o której kliniki transplantacji milczą:\n \n„Przeszczep przenosi cebulki z potylicy na przód, ale nie zatrzymuje DHT w skórze głowy. Jeśli nie odetnie pan DHT u nasady, reszta pana własnych włosów za linią przeszczepu i tak obumrze w ciągu 2 lat.”\n \nPotem wskazał palcem na ekranie moje mieszki włosowe.\n \n25% z nich to były puste otwory. Martwe. Na zawsze. Zmarnowałem je przez 3 lata kupowania aptecznych szamponów kofeinowych, biotyny i wcierek, które nie działały.\n \nAle pozostałe 75% moich korzeni na czubku głowy i w zakolach wciąż żyło! Były tylko skurczone i uśpione, bo DHT odcinał im dopływ krwi, a łysiejąca skóra głowy ma 2,6 razy gorsze ukrwienie niż zdrowa.\n \nTrycholog wytłumaczył mi prostą matematykę, której żaden producent z drogerii Ci nie powie:\n \nŻeby obudzić uśpione mieszki i zatrzymać proces zamierania kolejnych, musisz podczas mycia zrobić 3 rzeczy jednocześnie:\n1. Zablokować enzym zamieniający testosteron w DHT bezpośrednio w skórze głowy.\n2. Rozszerzyć naczynia krwionośne u nasady, żeby wtłoczyć do korzeni tlen i składniki odżywcze.\n3. Wydłużyć fazę aktywnego wzrostu (anagenu), żeby nowy włos urósł gruby i mocny.\n \nPrzeanalizowano 92 produkty na wypadanie włosów dostępne w Polsce — 96% ich reklamowanych składników nie ma potwierdzenia w badaniach, a 30% zawiera ostre detergenty SLS, które pogarszają stan mieszków.\n \nSzampony z drogerii i apteki za 30–50 zł? Robią 0 z 3.\nMinoksydyl (Loxon)? Robi 1 z 3 — pobudza krążenie, ale nie blokuje DHT, więc po odstawieniu wszystko leci od nowa.\nFinasteryd w tabletkach? Robi 1 z 3 — blokuje DHT w całym organizmie kosztem libido, ale nie pobudza krążenia w skórze.\n \nTrycholog wziął bloczek i zapisał mi na kartce jedną formułę, która łączy wszystkie 3 mechanizmy w 1 myciu:\n \nSzampon SARDIAN (rdest wielokwiatowy + korzeń lukrecji + żeń-szeń + Biota Orientalis + mięta pieprzowa).\n \nSprawdziłem badania tych składników jeszcze tego samego wieczoru:\n- Korzeń lukrecji, rdest wielokwiatowy i Eclipta Prostrata miejscowo blokują DHT bezpośrednio przy cebulkach — bez ingerencji w hormony całego ciała.\n- Mięta pieprzowa i naturalny mentol natychmiast otwierają mikrokrążenie (czuć wyraźne mrowienie już po 1 minucie trzymania piany).\n- Żeń-szeń (Ginsenozyd F2 — o 20% wyższe tempo wzrostu włosa w badaniach) i Biota Orientalis budzą uśpione korzenie do produkcji grubych pasm.\n \nZamiast wydawać 17 000 zł w Stambule, zamówiłem 3-miesięczny pakiet 2+1 SARDIAN z 60-dniową gwarancją zwrotu pieniędzy.\n \nPo 2 tygodniach — na sitku pod prysznicem zamiast 25 włosów zostawało ich 5 lub 6. Skóra głowy przestała swędzieć i błyszczeć się od łoju.\n \nPo 5 tygodniach — pod lampą w łazience zobaczyłem na skroniach gęsty, ciemny meszek. Cebulki, które na ekranie kamery były uśpione, ruszyły z miejsca.\n \nPo 10 tygodniach — korona głowy i linia czoła zagęściły się tak wyraźnie, że mój szwagier po przeszczepie w Turcji był przekonany, że sam po cichu poleciałem na zabieg.\n \nTych 25% martwych mieszków z ekranu już nigdy nie odzyskam. Ale uratowałem i obudziłem pozostałe 75%, zanim okno zamknęło się na dobre.\n \n— Marek, 45 lat, Warszawa\n \n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie\n \nP.S. Dzień po tamtym grillu wysłałem szwagrowi link do SARDIAN, żeby uratował włosy, które zostały mu za linią przeszczepu. Dziś obaj myjemy nim głowę codziennie przez 3 minuty pod prysznicem.\n \nP.P.S. Masz pełne 60 dni gwarancji zwrotu pieniędzy (4,7 na 5 z ponad 4 700 opinii). Sprawdź na własnej skórze głowy i odpływie pod prysznicem — jeśli nie zobaczysz różnicy, zwracają 100% wpłaty."
  },
  "sardian_k3_v5": {
    "headline": "Mam 46 lat. Tak wygląda czubek mojej głowy po 10 tygodniach odblokowania mieszków",
    "description": "3 etapy w 1 myciu — sprawdź z 60-dniową gwarancją",
    "primaryText": "Poprosiłem żonę, żeby zrobiła mi to zdjęcie czubka głowy z góry przy dziennym świetle. Mam 46 lat i zero przeszczepów.\n \nJeszcze 3 miesiące temu w tym samym miejscu miałem prześwit wielkości spodka od filiżanki, a mój szwagier Tomek namawiał mnie na lot do kliniki w Turcji za 17 000 zł. Kiedy spotkaliśmy się miesiąc temu na grillu, to on siedział w czapce z daszkiem i pytał mnie, co zrobiłem z włosami.\n\nBo 3 miesiące wcześniej, zanim przelałem zaliczkę do Turcji, poszedłem na diagnostykę mikrokamerą do warszawskiego trychologa. Kiedy lekarz przyłożył głowicę 200x do mojej głowy i obrócił monitor w moją stronę, powiedział mi prawdę, o której kliniki transplantacji milczą:\n \n„Przeszczep przenosi cebulki z potylicy na przód, ale nie zatrzymuje DHT w skórze głowy. Jeśli nie odetnie pan DHT u nasady, reszta pana własnych włosów za linią przeszczepu i tak obumrze w ciągu 2 lat.”\n \nPotem wskazał palcem na ekranie moje mieszki włosowe.\n \n25% z nich to były puste otwory. Martwe. Na zawsze. Zmarnowałem je przez 3 lata kupowania aptecznych szamponów kofeinowych, biotyny i wcierek, które nie działały.\n \nAle pozostałe 75% moich korzeni na czubku głowy i w zakolach wciąż żyło! Były tylko skurczone i uśpione, bo DHT odcinał im dopływ krwi, a łysiejąca skóra głowy ma 2,6 razy gorsze ukrwienie niż zdrowa.\n \nTrycholog wytłumaczył mi prostą matematykę, której żaden producent z drogerii Ci nie powie:\n \nŻeby obudzić uśpione mieszki i zatrzymać proces zamierania kolejnych, musisz podczas mycia zrobić 3 rzeczy jednocześnie:\n1. Zablokować enzym zamieniający testosteron w DHT bezpośrednio w skórze głowy.\n2. Rozszerzyć naczynia krwionośne u nasady, żeby wtłoczyć do korzeni tlen i składniki odżywcze.\n3. Wydłużyć fazę aktywnego wzrostu (anagenu), żeby nowy włos urósł gruby i mocny.\n \nPrzeanalizowano 92 produkty na wypadanie włosów dostępne w Polsce — 96% ich reklamowanych składników nie ma potwierdzenia w badaniach, a 30% zawiera ostre detergenty SLS, które pogarszają stan mieszków.\n \nSzampony z drogerii i apteki za 30–50 zł? Robią 0 z 3.\nMinoksydyl (Loxon)? Robi 1 z 3 — pobudza krążenie, ale nie blokuje DHT, więc po odstawieniu wszystko leci od nowa.\nFinasteryd w tabletkach? Robi 1 z 3 — blokuje DHT w całym organizmie kosztem libido, ale nie pobudza krążenia w skórze.\n \nTrycholog wziął bloczek i zapisał mi na kartce jedną formułę, która łączy wszystkie 3 mechanizmy w 1 myciu:\n \nSzampon SARDIAN (rdest wielokwiatowy + korzeń lukrecji + żeń-szeń + Biota Orientalis + mięta pieprzowa).\n \nSprawdziłem badania tych składników jeszcze tego samego wieczoru:\n- Korzeń lukrecji, rdest wielokwiatowy i Eclipta Prostrata miejscowo blokują DHT bezpośrednio przy cebulkach — bez ingerencji w hormony całego ciała.\n- Mięta pieprzowa i naturalny mentol natychmiast otwierają mikrokrążenie (czuć wyraźne mrowienie już po 1 minucie trzymania piany).\n- Żeń-szeń (Ginsenozyd F2 — o 20% wyższe tempo wzrostu włosa w badaniach) i Biota Orientalis budzą uśpione korzenie do produkcji grubych pasm.\n \nZamiast wydawać 17 000 zł w Stambule, zamówiłem 3-miesięczny pakiet 2+1 SARDIAN z 60-dniową gwarancją zwrotu pieniędzy.\n \nPo 2 tygodniach — na sitku pod prysznicem zamiast 25 włosów zostawało ich 5 lub 6. Skóra głowy przestała swędzieć i błyszczeć się od łoju.\n \nPo 5 tygodniach — pod lampą w łazience zobaczyłem na skroniach gęsty, ciemny meszek. Cebulki, które na ekranie kamery były uśpione, ruszyły z miejsca.\n \nPo 10 tygodniach — korona głowy i linia czoła zagęściły się tak wyraźnie, że mój szwagier po przeszczepie w Turcji był przekonany, że sam po cichu poleciałem na zabieg.\n \nTych 25% martwych mieszków z ekranu już nigdy nie odzyskam. Ale uratowałem i obudziłem pozostałe 75%, zanim okno zamknęło się na dobre.\n \n— Marek, 45 lat, Warszawa\n \n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie\n \nP.S. Dzień po tamtym grillu wysłałem szwagrowi link do SARDIAN, żeby uratował włosy, które zostały mu za linią przeszczepu. Dziś obaj myjemy nim głowę codziennie przez 3 minuty pod prysznicem.\n \nP.P.S. Masz pełne 60 dni gwarancji zwrotu pieniędzy (4,7 na 5 z ponad 4 700 opinii). Sprawdź na własnej skórze głowy i odpływie pod prysznicem — jeśli nie zobaczysz różnicy, zwracają 100% wpłaty."
  },
  "sardian_k4_v1": {
    "headline": "Strzygę polskich facetów od 35 lat. Powiem Ci wprost, dlaczego szampony z drogerii nie działają",
    "description": "Poznaj formułę 3 z 3 z 60-dniową gwarancją zwrotu",
    "primaryText": "Strzygę polskich facetów od 1991 roku. Przez 35 lat przy moim fotelu usiadło ponad 40 000 mężczyzn i kiedy tylko biorę grzebień do ręki, w 5 sekund widzę coś, o czym 9 na 10 z Was nie ma pojęcia.\n \nWidzę, jak facet w wieku 32, 38 czy 45 lat siada przed lustrem, spuszcza wzrok i mówi tym samym cichym głosem:\n— Panie Andrzeju, góra trochę dłużej, żeby przykryć prześwit, a boki krótko.\n \nAlbo jeszcze gorzej:\n— Jedziemy maszynką na 3 mm, bo już nie ma czego ratować.\n\nA kiedy rozgarniam klientowi włosy grzebieniem pod lampą fryzjerską, widzę na jego skórze głowy tysiące drobnych, jasnych włosków. Meszek.\n \nI krew mnie zalewa, bo wiem, że ten chłopak wcale nie jest łysy!\n \nNa jego czubku głowy może 15% lub 20% mieszków faktycznie obumarło. Ale pozostałe 80% korzeni wciąż tam jest i wciąż żyje — tylko zostało uśpione i przyduszone pod skórą głowy.\n \nTylko że z każdym miesiącem, w którym nic z tym nie robisz albo myjesz głowę marketowym szamponem, kolejne uśpione cebulki przekraczają granicę. Ze snu do śmierci. Cicho. Bez bólu. A martwego mieszka nie obudzi już nikt.\n \nPrzez 35 lat słuchałem na fotelu historii moich klientów, którzy wydawali tysiące złotych i wracali z coraz większymi zakolami.\n \nDlaczego? Bo w Polsce przebadano 92 produkty przeciw wypadaniu włosów z drogerii i aptek: 96% ich reklamowanych składników nie miało żadnego poparcia w badaniach klinicznych, a 30% zawierało agresywne detergenty SLS i silikony, które oblepiają ujścia mieszków i mogą wypadanie wręcz przyspieszać!\n \nŻeby uratować te 80% żywych korzeni na Twojej głowie, musisz podczas mycia zrobić 3 rzeczy jednocześnie. Nie 1. Nie 2. Wszystkie 3:\n \n1. Zablokować DHT bezpośrednio w skórze głowy — bo to ten hormon obkurcza cebulki i odcina im krew.\n2. Otworzyć krążenie w skórze głowy — bo łysiejący skalp ma aż 2,6 razy mniejsze ukrwienie niż zdrowy, więc korzenie duszą się bez tlenu.\n3. Wydłużyć fazę wzrostu włosa — żeby nowy meszek nie wypadł po 3 tygodniach, tylko zgrubiał w normalny, twardy włos.\n \nA teraz spójrz prawdzie w oczy, co stoi u Ciebie pod prysznicem:\nSzampony kofeinowe z drogerii i apteki za 30 zł? Robią 0 z 3 (piana spływa po 20 sekundach, a SLS podrażnia skórę).\nWcierki z minoksydylem (Loxon)? Robią 1 z 3 — rozszerzają naczynia, ale nie blokują DHT, więc jak odstawisz butelkę na tydzień, wszystko sypie się z powrotem.\nTabletki na receptę (finasteryd)? Robią 1 z 3 — blokują DHT w całym organizmie kosztem męskiego libido, ale nie ruszają ukrwienia skóry głowy.\n \nPół roku temu jeden z moich stałych klientów — 41-letni architekt, któremu od 3 lat robił się placek na czubku głowy — usiadł u mnie na fotelu po 2 miesiącach przerwy.\n \nWbiłem grzebień w jego włosy na koronie i zamarłem. Zamiast rzadkiego puszku pod palcami miałem sztywne, gęste włosy u samej nasady. Skóra nie prześwitywała pod lampą.\n \nZapytałem go, czy był na przeszczepie. Wyciągnął telefon i pokazał mi czarną butelkę szamponu SARDIAN, którą polecił mu trycholog.\n \nTego samego dnia zamówiłem 3 butelki do salonu na moją myjkę fryzjerską i sprawdziłem skład pod lupą. To jedyna formuła na rynku, która robi wszystkie 3 rzeczy w 1 myciu:\n- Korzeń lukrecji, rdest wielokwiatowy i Eclipta Prostrata blokują DHT bezpośrednio przy cebulkach (bez skutków ubocznych).\n- Mięta pieprzowa i naturalny mentol natychmiast rozszerzają naczynia krwionośne (moi klienci na myjce już po 60 sekundach czują mocne, chłodzące mrowienie — to znak, że krew ruszyła do cebulek).\n- Żeń-szeń (Ginsenozyd F2 — o 20% szybszy wzrost w badaniach) i Biota Orientalis zmuszają uśpione korzenie do produkcji grubych włosów.\nZero SLS. Zero parabenów. Zero silikonów.\n \nOd kiedy zacząłem pokazywać SARDIAN chłopakom, którzy siadają u mnie na fotelu z zakolami, widzę tę samą zmianę przy każdym kolejnym strzyżeniu:\n- Po 2 tygodniach mówią, że w odpływie pod prysznicem zostało 5 włosów zamiast 25.\n- Po 4–5 tygodniach, kiedy czeszę im skronie, pod grzebieniem wychodzi cała armia krótkich, nowych włosków („baby hair”).\n- Po 8–12 tygodniach przestają mnie prosić o „zaczesywanie prześwitu”, bo góra znów trzyma gęstość.\n \nJako fryzjer z 35-letnim stażem powiem Ci jedno: nie sięgaj po maszynkę i nie spisuj swoich włosów na straty, dopóki pod skórą masz żywe cebulki. Ale nie czekaj też kolejnego roku, aż te uśpione korzenie umrą na dobre.\n \n— Andrzej, 61 lat, mistrz fryzjerstwa męskiego\n \n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie\n \nP.S. Kiedy myjesz głowę szamponem SARDIAN, nie spłukuj piany po 15 sekundach jak zwykłego mydła. Wmasuj ją w zakola oraz czubek głowy i zostaw na pełne 2–3 minuty, aż poczujesz wyraźne mrowienie. Wtedy składniki robią swoją robotę.\n \nP.P.S. Producent daje 60 dni gwarancji zwrotu pieniędzy (ocena 4,7 na 5 z ponad 4 700 opinii). Przetestuj 1 lub 3 butelki pod własnym prysznicem — jeśli przy następnym strzyżeniu Twój fryzjer nie zauważy różnicy, odzyskasz każdą złotówkę."
  },
  "sardian_k4_v2": {
    "headline": "92 szampony na wypadanie włosów w Polsce przebadane: 96% to czysty marketing",
    "description": "Poznaj formułę 3 z 3 z 60-dniową gwarancją zwrotu",
    "primaryText": "Moi klienci w salonie często pytają mnie, dlaczego szampon kofeinowy z reklamy telewizyjnej za 35 zł nie zatrzymał im zakoli ani prześwitu na czubku głowy.\n \nStrzygę facetów od 1991 roku i zawsze odpowiadam im jednym zdaniem: bo zwykły szampon z drogerii robi 0 z 3 rzeczy, których potrzebują Twoje duszone przez DHT cebulki.\n \nWidzę to codziennie przy fotelu, kiedy facet po trzydziestce lub czterdziestce prosi mnie o ścięcie na 3 mm, bo myśli, że wyłysiał.\n\nA kiedy rozgarniam klientowi włosy grzebieniem pod lampą fryzjerską, widzę na jego skórze głowy tysiące drobnych, jasnych włosków. Meszek.\n \nI krew mnie zalewa, bo wiem, że ten chłopak wcale nie jest łysy!\n \nNa jego czubku głowy może 15% lub 20% mieszków faktycznie obumarło. Ale pozostałe 80% korzeni wciąż tam jest i wciąż żyje — tylko zostało uśpione i przyduszone pod skórą głowy.\n \nTylko że z każdym miesiącem, w którym nic z tym nie robisz albo myjesz głowę marketowym szamponem, kolejne uśpione cebulki przekraczają granicę. Ze snu do śmierci. Cicho. Bez bólu. A martwego mieszka nie obudzi już nikt.\n \nPrzez 35 lat słuchałem na fotelu historii moich klientów, którzy wydawali tysiące złotych i wracali z coraz większymi zakolami.\n \nDlaczego? Bo w Polsce przebadano 92 produkty przeciw wypadaniu włosów z drogerii i aptek: 96% ich reklamowanych składników nie miało żadnego poparcia w badaniach klinicznych, a 30% zawierało agresywne detergenty SLS i silikony, które oblepiają ujścia mieszków i mogą wypadanie wręcz przyspieszać!\n \nŻeby uratować te 80% żywych korzeni na Twojej głowie, musisz podczas mycia zrobić 3 rzeczy jednocześnie. Nie 1. Nie 2. Wszystkie 3:\n \n1. Zablokować DHT bezpośrednio w skórze głowy — bo to ten hormon obkurcza cebulki i odcina im krew.\n2. Otworzyć krążenie w skórze głowy — bo łysiejący skalp ma aż 2,6 razy mniejsze ukrwienie niż zdrowy, więc korzenie duszą się bez tlenu.\n3. Wydłużyć fazę wzrostu włosa — żeby nowy meszek nie wypadł po 3 tygodniach, tylko zgrubiał w normalny, twardy włos.\n \nA teraz spójrz prawdzie w oczy, co stoi u Ciebie pod prysznicem:\nSzampony kofeinowe z drogerii i apteki za 30 zł? Robią 0 z 3 (piana spływa po 20 sekundach, a SLS podrażnia skórę).\nWcierki z minoksydylem (Loxon)? Robią 1 z 3 — rozszerzają naczynia, ale nie blokują DHT, więc jak odstawisz butelkę na tydzień, wszystko sypie się z powrotem.\nTabletki na receptę (finasteryd)? Robią 1 z 3 — blokują DHT w całym organizmie kosztem męskiego libido, ale nie ruszają ukrwienia skóry głowy.\n \nPół roku temu jeden z moich stałych klientów — 41-letni architekt, któremu od 3 lat robił się placek na czubku głowy — usiadł u mnie na fotelu po 2 miesiącach przerwy.\n \nWbiłem grzebień w jego włosy na koronie i zamarłem. Zamiast rzadkiego puszku pod palcami miałem sztywne, gęste włosy u samej nasady. Skóra nie prześwitywała pod lampą.\n \nZapytałem go, czy był na przeszczepie. Wyciągnął telefon i pokazał mi czarną butelkę szamponu SARDIAN, którą polecił mu trycholog.\n \nTego samego dnia zamówiłem 3 butelki do salonu na moją myjkę fryzjerską i sprawdziłem skład pod lupą. To jedyna formuła na rynku, która robi wszystkie 3 rzeczy w 1 myciu:\n- Korzeń lukrecji, rdest wielokwiatowy i Eclipta Prostrata blokują DHT bezpośrednio przy cebulkach (bez skutków ubocznych).\n- Mięta pieprzowa i naturalny mentol natychmiast rozszerzają naczynia krwionośne (moi klienci na myjce już po 60 sekundach czują mocne, chłodzące mrowienie — to znak, że krew ruszyła do cebulek).\n- Żeń-szeń (Ginsenozyd F2 — o 20% szybszy wzrost w badaniach) i Biota Orientalis zmuszają uśpione korzenie do produkcji grubych włosów.\nZero SLS. Zero parabenów. Zero silikonów.\n \nOd kiedy zacząłem pokazywać SARDIAN chłopakom, którzy siadają u mnie na fotelu z zakolami, widzę tę samą zmianę przy każdym kolejnym strzyżeniu:\n- Po 2 tygodniach mówią, że w odpływie pod prysznicem zostało 5 włosów zamiast 25.\n- Po 4–5 tygodniach, kiedy czeszę im skronie, pod grzebieniem wychodzi cała armia krótkich, nowych włosków („baby hair”).\n- Po 8–12 tygodniach przestają mnie prosić o „zaczesywanie prześwitu”, bo góra znów trzyma gęstość.\n \nJako fryzjer z 35-letnim stażem powiem Ci jedno: nie sięgaj po maszynkę i nie spisuj swoich włosów na straty, dopóki pod skórą masz żywe cebulki. Ale nie czekaj też kolejnego roku, aż te uśpione korzenie umrą na dobre.\n \n— Andrzej, 61 lat, mistrz fryzjerstwa męskiego\n \n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie\n \nP.S. Kiedy myjesz głowę szamponem SARDIAN, nie spłukuj piany po 15 sekundach jak zwykłego mydła. Wmasuj ją w zakola oraz czubek głowy i zostaw na pełne 2–3 minuty, aż poczujesz wyraźne mrowienie. Wtedy składniki robią swoją robotę.\n \nP.P.S. Producent daje 60 dni gwarancji zwrotu pieniędzy (ocena 4,7 na 5 z ponad 4 700 opinii). Przetestuj 1 lub 3 butelki pod własnym prysznicem — jeśli przy następnym strzyżeniu Twój fryzjer nie zauważy różnicy, odzyskasz każdą złotówkę."
  },
  "sardian_k4_v3": {
    "headline": "Chciał, żebym ogolił go na 3 mm. 8 tygodni później musiałem przerzedzać mu górę degażówkami",
    "description": "Poznaj formułę 3 z 3 z 60-dniową gwarancją zwrotu",
    "primaryText": "Ten chłopak na moim fotelu ma 41 lat. 2 miesiące temu usiadł przed tym samym lustrem i powiedział zrezygnowanym głosem: „Panie Andrzeju, tniemy wszystko maszynką na 3 mm, nie będę już zaczesywał tej łysiny”.\n \nStrzygę polskich facetów od 35 lat i od razu zatrzymałem rękę z maszynką.\n\nA kiedy rozgarniam klientowi włosy grzebieniem pod lampą fryzjerską, widzę na jego skórze głowy tysiące drobnych, jasnych włosków. Meszek.\n \nI krew mnie zalewa, bo wiem, że ten chłopak wcale nie jest łysy!\n \nNa jego czubku głowy może 15% lub 20% mieszków faktycznie obumarło. Ale pozostałe 80% korzeni wciąż tam jest i wciąż żyje — tylko zostało uśpione i przyduszone pod skórą głowy.\n \nTylko że z każdym miesiącem, w którym nic z tym nie robisz albo myjesz głowę marketowym szamponem, kolejne uśpione cebulki przekraczają granicę. Ze snu do śmierci. Cicho. Bez bólu. A martwego mieszka nie obudzi już nikt.\n \nPrzez 35 lat słuchałem na fotelu historii moich klientów, którzy wydawali tysiące złotych i wracali z coraz większymi zakolami.\n \nDlaczego? Bo w Polsce przebadano 92 produkty przeciw wypadaniu włosów z drogerii i aptek: 96% ich reklamowanych składników nie miało żadnego poparcia w badaniach klinicznych, a 30% zawierało agresywne detergenty SLS i silikony, które oblepiają ujścia mieszków i mogą wypadanie wręcz przyspieszać!\n \nŻeby uratować te 80% żywych korzeni na Twojej głowie, musisz podczas mycia zrobić 3 rzeczy jednocześnie. Nie 1. Nie 2. Wszystkie 3:\n \n1. Zablokować DHT bezpośrednio w skórze głowy — bo to ten hormon obkurcza cebulki i odcina im krew.\n2. Otworzyć krążenie w skórze głowy — bo łysiejący skalp ma aż 2,6 razy mniejsze ukrwienie niż zdrowy, więc korzenie duszą się bez tlenu.\n3. Wydłużyć fazę wzrostu włosa — żeby nowy meszek nie wypadł po 3 tygodniach, tylko zgrubiał w normalny, twardy włos.\n \nA teraz spójrz prawdzie w oczy, co stoi u Ciebie pod prysznicem:\nSzampony kofeinowe z drogerii i apteki za 30 zł? Robią 0 z 3 (piana spływa po 20 sekundach, a SLS podrażnia skórę).\nWcierki z minoksydylem (Loxon)? Robią 1 z 3 — rozszerzają naczynia, ale nie blokują DHT, więc jak odstawisz butelkę na tydzień, wszystko sypie się z powrotem.\nTabletki na receptę (finasteryd)? Robią 1 z 3 — blokują DHT w całym organizmie kosztem męskiego libido, ale nie ruszają ukrwienia skóry głowy.\n \nPół roku temu jeden z moich stałych klientów — 41-letni architekt, któremu od 3 lat robił się placek na czubku głowy — usiadł u mnie na fotelu po 2 miesiącach przerwy.\n \nWbiłem grzebień w jego włosy na koronie i zamarłem. Zamiast rzadkiego puszku pod palcami miałem sztywne, gęste włosy u samej nasady. Skóra nie prześwitywała pod lampą.\n \nZapytałem go, czy był na przeszczepie. Wyciągnął telefon i pokazał mi czarną butelkę szamponu SARDIAN, którą polecił mu trycholog.\n \nTego samego dnia zamówiłem 3 butelki do salonu na moją myjkę fryzjerską i sprawdziłem skład pod lupą. To jedyna formuła na rynku, która robi wszystkie 3 rzeczy w 1 myciu:\n- Korzeń lukrecji, rdest wielokwiatowy i Eclipta Prostrata blokują DHT bezpośrednio przy cebulkach (bez skutków ubocznych).\n- Mięta pieprzowa i naturalny mentol natychmiast rozszerzają naczynia krwionośne (moi klienci na myjce już po 60 sekundach czują mocne, chłodzące mrowienie — to znak, że krew ruszyła do cebulek).\n- Żeń-szeń (Ginsenozyd F2 — o 20% szybszy wzrost w badaniach) i Biota Orientalis zmuszają uśpione korzenie do produkcji grubych włosów.\nZero SLS. Zero parabenów. Zero silikonów.\n \nOd kiedy zacząłem pokazywać SARDIAN chłopakom, którzy siadają u mnie na fotelu z zakolami, widzę tę samą zmianę przy każdym kolejnym strzyżeniu:\n- Po 2 tygodniach mówią, że w odpływie pod prysznicem zostało 5 włosów zamiast 25.\n- Po 4–5 tygodniach, kiedy czeszę im skronie, pod grzebieniem wychodzi cała armia krótkich, nowych włosków („baby hair”).\n- Po 8–12 tygodniach przestają mnie prosić o „zaczesywanie prześwitu”, bo góra znów trzyma gęstość.\n \nJako fryzjer z 35-letnim stażem powiem Ci jedno: nie sięgaj po maszynkę i nie spisuj swoich włosów na straty, dopóki pod skórą masz żywe cebulki. Ale nie czekaj też kolejnego roku, aż te uśpione korzenie umrą na dobre.\n \n— Andrzej, 61 lat, mistrz fryzjerstwa męskiego\n \n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie\n \nP.S. Kiedy myjesz głowę szamponem SARDIAN, nie spłukuj piany po 15 sekundach jak zwykłego mydła. Wmasuj ją w zakola oraz czubek głowy i zostaw na pełne 2–3 minuty, aż poczujesz wyraźne mrowienie. Wtedy składniki robią swoją robotę.\n \nP.P.S. Producent daje 60 dni gwarancji zwrotu pieniędzy (ocena 4,7 na 5 z ponad 4 700 opinii). Przetestuj 1 lub 3 butelki pod własnym prysznicem — jeśli przy następnym strzyżeniu Twój fryzjer nie zauważy różnicy, odzyskasz każdą złotówkę."
  },
  "sardian_k4_v4": {
    "headline": "Dlaczego wyrzuciłem zwykłe szampony z myjki w moim salonie fryzjerskim",
    "description": "Poznaj formułę 3 z 3 z 60-dniową gwarancją zwrotu",
    "primaryText": "Przy mojej myjce fryzjerskiej od 4 miesięcy stoi tylko jedna czarna butelka dla facetów, którym przerzedza się góra głowy.\n \nKiedy nakładam tę gęstą, ziołową pianę na głowę klienta i masuję skronie przez 2 minuty, każdy z nich pyta o to samo: „Panie Andrzeju, co to tak chłodzi i mrowi w skórę?”.\n \nOdpowiadam krótko: to nie jest zwykły szampon. To krew i tlen, które po latach wracają do Twoich uśpionych cebulek.\n\nA kiedy rozgarniam klientowi włosy grzebieniem pod lampą fryzjerską, widzę na jego skórze głowy tysiące drobnych, jasnych włosków. Meszek.\n \nI krew mnie zalewa, bo wiem, że ten chłopak wcale nie jest łysy!\n \nNa jego czubku głowy może 15% lub 20% mieszków faktycznie obumarło. Ale pozostałe 80% korzeni wciąż tam jest i wciąż żyje — tylko zostało uśpione i przyduszone pod skórą głowy.\n \nTylko że z każdym miesiącem, w którym nic z tym nie robisz albo myjesz głowę marketowym szamponem, kolejne uśpione cebulki przekraczają granicę. Ze snu do śmierci. Cicho. Bez bólu. A martwego mieszka nie obudzi już nikt.\n \nPrzez 35 lat słuchałem na fotelu historii moich klientów, którzy wydawali tysiące złotych i wracali z coraz większymi zakolami.\n \nDlaczego? Bo w Polsce przebadano 92 produkty przeciw wypadaniu włosów z drogerii i aptek: 96% ich reklamowanych składników nie miało żadnego poparcia w badaniach klinicznych, a 30% zawierało agresywne detergenty SLS i silikony, które oblepiają ujścia mieszków i mogą wypadanie wręcz przyspieszać!\n \nŻeby uratować te 80% żywych korzeni na Twojej głowie, musisz podczas mycia zrobić 3 rzeczy jednocześnie. Nie 1. Nie 2. Wszystkie 3:\n \n1. Zablokować DHT bezpośrednio w skórze głowy — bo to ten hormon obkurcza cebulki i odcina im krew.\n2. Otworzyć krążenie w skórze głowy — bo łysiejący skalp ma aż 2,6 razy mniejsze ukrwienie niż zdrowy, więc korzenie duszą się bez tlenu.\n3. Wydłużyć fazę wzrostu włosa — żeby nowy meszek nie wypadł po 3 tygodniach, tylko zgrubiał w normalny, twardy włos.\n \nA teraz spójrz prawdzie w oczy, co stoi u Ciebie pod prysznicem:\nSzampony kofeinowe z drogerii i apteki za 30 zł? Robią 0 z 3 (piana spływa po 20 sekundach, a SLS podrażnia skórę).\nWcierki z minoksydylem (Loxon)? Robią 1 z 3 — rozszerzają naczynia, ale nie blokują DHT, więc jak odstawisz butelkę na tydzień, wszystko sypie się z powrotem.\nTabletki na receptę (finasteryd)? Robią 1 z 3 — blokują DHT w całym organizmie kosztem męskiego libido, ale nie ruszają ukrwienia skóry głowy.\n \nPół roku temu jeden z moich stałych klientów — 41-letni architekt, któremu od 3 lat robił się placek na czubku głowy — usiadł u mnie na fotelu po 2 miesiącach przerwy.\n \nWbiłem grzebień w jego włosy na koronie i zamarłem. Zamiast rzadkiego puszku pod palcami miałem sztywne, gęste włosy u samej nasady. Skóra nie prześwitywała pod lampą.\n \nZapytałem go, czy był na przeszczepie. Wyciągnął telefon i pokazał mi czarną butelkę szamponu SARDIAN, którą polecił mu trycholog.\n \nTego samego dnia zamówiłem 3 butelki do salonu na moją myjkę fryzjerską i sprawdziłem skład pod lupą. To jedyna formuła na rynku, która robi wszystkie 3 rzeczy w 1 myciu:\n- Korzeń lukrecji, rdest wielokwiatowy i Eclipta Prostrata blokują DHT bezpośrednio przy cebulkach (bez skutków ubocznych).\n- Mięta pieprzowa i naturalny mentol natychmiast rozszerzają naczynia krwionośne (moi klienci na myjce już po 60 sekundach czują mocne, chłodzące mrowienie — to znak, że krew ruszyła do cebulek).\n- Żeń-szeń (Ginsenozyd F2 — o 20% szybszy wzrost w badaniach) i Biota Orientalis zmuszają uśpione korzenie do produkcji grubych włosów.\nZero SLS. Zero parabenów. Zero silikonów.\n \nOd kiedy zacząłem pokazywać SARDIAN chłopakom, którzy siadają u mnie na fotelu z zakolami, widzę tę samą zmianę przy każdym kolejnym strzyżeniu:\n- Po 2 tygodniach mówią, że w odpływie pod prysznicem zostało 5 włosów zamiast 25.\n- Po 4–5 tygodniach, kiedy czeszę im skronie, pod grzebieniem wychodzi cała armia krótkich, nowych włosków („baby hair”).\n- Po 8–12 tygodniach przestają mnie prosić o „zaczesywanie prześwitu”, bo góra znów trzyma gęstość.\n \nJako fryzjer z 35-letnim stażem powiem Ci jedno: nie sięgaj po maszynkę i nie spisuj swoich włosów na straty, dopóki pod skórą masz żywe cebulki. Ale nie czekaj też kolejnego roku, aż te uśpione korzenie umrą na dobre.\n \n— Andrzej, 61 lat, mistrz fryzjerstwa męskiego\n \n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie\n \nP.S. Kiedy myjesz głowę szamponem SARDIAN, nie spłukuj piany po 15 sekundach jak zwykłego mydła. Wmasuj ją w zakola oraz czubek głowy i zostaw na pełne 2–3 minuty, aż poczujesz wyraźne mrowienie. Wtedy składniki robią swoją robotę.\n \nP.P.S. Producent daje 60 dni gwarancji zwrotu pieniędzy (ocena 4,7 na 5 z ponad 4 700 opinii). Przetestuj 1 lub 3 butelki pod własnym prysznicem — jeśli przy następnym strzyżeniu Twój fryzjer nie zauważy różnicy, odzyskasz każdą złotówkę."
  },
  "sardian_k4_v5": {
    "headline": "Wyrzuć szampon z SLS do kosza, zanim dobije pozostałe 80% Twoich żywych cebulek",
    "description": "Poznaj formułę 3 z 3 z 60-dniową gwarancją zwrotu",
    "primaryText": "W moim koszu w salonie fryzjerskim lądują kolejne kolorowe butelki „szamponów przeciw wypadaniu” z supermarketu, które przynoszą mi klienci, żeby zapytać o skład.\n \nJako fryzjer męski z 35-letnim stażem powiem Ci brutalną prawdę: jeśli myjesz przerzedzone włosy tanim szamponem z agresywnymi siarczanami SLS, robisz swoim cebulkom dokładnie odwrotną przysługę.\n\nA kiedy rozgarniam klientowi włosy grzebieniem pod lampą fryzjerską, widzę na jego skórze głowy tysiące drobnych, jasnych włosków. Meszek.\n \nI krew mnie zalewa, bo wiem, że ten chłopak wcale nie jest łysy!\n \nNa jego czubku głowy może 15% lub 20% mieszków faktycznie obumarło. Ale pozostałe 80% korzeni wciąż tam jest i wciąż żyje — tylko zostało uśpione i przyduszone pod skórą głowy.\n \nTylko że z każdym miesiącem, w którym nic z tym nie robisz albo myjesz głowę marketowym szamponem, kolejne uśpione cebulki przekraczają granicę. Ze snu do śmierci. Cicho. Bez bólu. A martwego mieszka nie obudzi już nikt.\n \nPrzez 35 lat słuchałem na fotelu historii moich klientów, którzy wydawali tysiące złotych i wracali z coraz większymi zakolami.\n \nDlaczego? Bo w Polsce przebadano 92 produkty przeciw wypadaniu włosów z drogerii i aptek: 96% ich reklamowanych składników nie miało żadnego poparcia w badaniach klinicznych, a 30% zawierało agresywne detergenty SLS i silikony, które oblepiają ujścia mieszków i mogą wypadanie wręcz przyspieszać!\n \nŻeby uratować te 80% żywych korzeni na Twojej głowie, musisz podczas mycia zrobić 3 rzeczy jednocześnie. Nie 1. Nie 2. Wszystkie 3:\n \n1. Zablokować DHT bezpośrednio w skórze głowy — bo to ten hormon obkurcza cebulki i odcina im krew.\n2. Otworzyć krążenie w skórze głowy — bo łysiejący skalp ma aż 2,6 razy mniejsze ukrwienie niż zdrowy, więc korzenie duszą się bez tlenu.\n3. Wydłużyć fazę wzrostu włosa — żeby nowy meszek nie wypadł po 3 tygodniach, tylko zgrubiał w normalny, twardy włos.\n \nA teraz spójrz prawdzie w oczy, co stoi u Ciebie pod prysznicem:\nSzampony kofeinowe z drogerii i apteki za 30 zł? Robią 0 z 3 (piana spływa po 20 sekundach, a SLS podrażnia skórę).\nWcierki z minoksydylem (Loxon)? Robią 1 z 3 — rozszerzają naczynia, ale nie blokują DHT, więc jak odstawisz butelkę na tydzień, wszystko sypie się z powrotem.\nTabletki na receptę (finasteryd)? Robią 1 z 3 — blokują DHT w całym organizmie kosztem męskiego libido, ale nie ruszają ukrwienia skóry głowy.\n \nPół roku temu jeden z moich stałych klientów — 41-letni architekt, któremu od 3 lat robił się placek na czubku głowy — usiadł u mnie na fotelu po 2 miesiącach przerwy.\n \nWbiłem grzebień w jego włosy na koronie i zamarłem. Zamiast rzadkiego puszku pod palcami miałem sztywne, gęste włosy u samej nasady. Skóra nie prześwitywała pod lampą.\n \nZapytałem go, czy był na przeszczepie. Wyciągnął telefon i pokazał mi czarną butelkę szamponu SARDIAN, którą polecił mu trycholog.\n \nTego samego dnia zamówiłem 3 butelki do salonu na moją myjkę fryzjerską i sprawdziłem skład pod lupą. To jedyna formuła na rynku, która robi wszystkie 3 rzeczy w 1 myciu:\n- Korzeń lukrecji, rdest wielokwiatowy i Eclipta Prostrata blokują DHT bezpośrednio przy cebulkach (bez skutków ubocznych).\n- Mięta pieprzowa i naturalny mentol natychmiast rozszerzają naczynia krwionośne (moi klienci na myjce już po 60 sekundach czują mocne, chłodzące mrowienie — to znak, że krew ruszyła do cebulek).\n- Żeń-szeń (Ginsenozyd F2 — o 20% szybszy wzrost w badaniach) i Biota Orientalis zmuszają uśpione korzenie do produkcji grubych włosów.\nZero SLS. Zero parabenów. Zero silikonów.\n \nOd kiedy zacząłem pokazywać SARDIAN chłopakom, którzy siadają u mnie na fotelu z zakolami, widzę tę samą zmianę przy każdym kolejnym strzyżeniu:\n- Po 2 tygodniach mówią, że w odpływie pod prysznicem zostało 5 włosów zamiast 25.\n- Po 4–5 tygodniach, kiedy czeszę im skronie, pod grzebieniem wychodzi cała armia krótkich, nowych włosków („baby hair”).\n- Po 8–12 tygodniach przestają mnie prosić o „zaczesywanie prześwitu”, bo góra znów trzyma gęstość.\n \nJako fryzjer z 35-letnim stażem powiem Ci jedno: nie sięgaj po maszynkę i nie spisuj swoich włosów na straty, dopóki pod skórą masz żywe cebulki. Ale nie czekaj też kolejnego roku, aż te uśpione korzenie umrą na dobre.\n \n— Andrzej, 61 lat, mistrz fryzjerstwa męskiego\n \n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie\n \nP.S. Kiedy myjesz głowę szamponem SARDIAN, nie spłukuj piany po 15 sekundach jak zwykłego mydła. Wmasuj ją w zakola oraz czubek głowy i zostaw na pełne 2–3 minuty, aż poczujesz wyraźne mrowienie. Wtedy składniki robią swoją robotę.\n \nP.P.S. Producent daje 60 dni gwarancji zwrotu pieniędzy (ocena 4,7 na 5 z ponad 4 700 opinii). Przetestuj 1 lub 3 butelki pod własnym prysznicem — jeśli przy następnym strzyżeniu Twój fryzjer nie zauważy różnicy, odzyskasz każdą złotówkę."
  },
  "sardian_k5_v1": {
    "headline": "Poprosiłem fryzjera o maszynkę na 3 mm. Wyłączył ją i postawił przede mną tę butelkę",
    "description": "Obudź uśpione korzenie — 3 z 3 w 1 myciu (60 dni gwarancji)",
    "primaryText": "Usiadłem na fotelu u mojego fryzjera, spojrzałem w lustro pod tym bezlitosnym, ostrym światłem z góry i powiedziałem zdanie, które odkładałem przez 3 lata:\n \n— Tomek, nie kombinujemy już z zaczesywaniem. Weź maszynkę i jedziemy wszystko na 3 mm.\n \nMiałem 41 lat. Byłem zmęczony codziennym sprawdzaniem odpływu pod prysznicem, pilnowaniem wiatru na ulicy i patrzeniem, jak na każdym zdjęciu z wakacji moje czoło sięga coraz bliżej czubka głowy.\n \nTomek wziął maszynkę do ręki, ale jej nie włączył.\n \nZamiast tego wbił grzebień w moje włosy na czubku głowy, rozgarnął je pod lampą i powiedział:\n— Łukasz, jak chcesz, to ogolę Cię na zero w 2 minuty. Ale zanim to zrobię, wiedz jedno: Ty masz tu pod skórą jakieś 75% żywych cebulek, które produkują cienki meszek. Jak teraz odpuścisz, za 2 lata te mieszki będą martwe na zawsze.\n \nOdłożył maszynkę na konsolę i postawił obok niej matową, czarną butelkę szamponu SARDIAN. Zrobiłem jej to zdjęcie prosto z fotela.\n\nMój fryzjer Tomek wytłumaczył mi wtedy w 3 minuty to, czego przez 3 lata nie powiedział mi żaden dermatolog ani farmaceuta w aptece.\n \nMoje włosy nie wypadały dlatego, że „taki mój urok”. Moje korzenie były powoli duszone pod skórą przez hormon DHT, który odcinał im dopływ krwi. Łysiejąca skóra głowy ma aż 2,6 razy słabsze ukrwienie niż zdrowa. Pozbawiony tlenu korzeń z każdym cyklem wypuszcza coraz cieńszy włos, aż najpierw zasypia, a potem umiera.\n \nKiedy mieszek umrze — robi się pusty otwór. Tych martwych (u mnie około 25% na skroniach) nie obudzi już żaden szampon ani lek na świecie.\n \nAle pozostałe 75% moich korzeni tylko spało!\n \nDlaczego więc przez 3 lata nie pomogły mi Alpecin, Biotebal, DX2 ani Loxon?\nBo żeby obudzić uśpione przez DHT cebulki, musisz zrobić 3 rzeczy jednocześnie. Nie 1. Nie 2. Wszystkie 3:\n1. Zablokować DHT bezpośrednio u nasady włosa.\n2. Rozszerzyć naczynia krwionośne w skórze głowy, żeby wpuścić do korzeni krew i tlen.\n3. Wydłużyć fazę wzrostu (anagenu), żeby nowy włos zdążył zgrubieć, zanim wypadnie.\n \nPrzebadano 92 szampony przeciw wypadaniu włosów sprzedawane w Polsce — 96% ich reklamowanych składników nie ma żadnego potwierdzenia naukowego, a 30% zawiera agresywne siarczany SLS, które mogą wypadanie wręcz nasilać.\n- Zwykłe szampony z drogerii i apteki za 30 zł robią 0 z 3.\n- Minoksydyl (Loxon) robi 1 z 3 — pobudza krążenie, ale nie blokuje DHT, więc po odstawieniu wszystko wypada z powrotem.\n- Finasteryd w tabletkach robi 1 z 3 — blokuje DHT w całym organizmie kosztem libido, ale nie budzi uśpionych cebulek.\n \nTomek zaprowadził mnie na myjkę w salonie i umył mi głowę szamponem SARDIAN.\n \nTo jedyna formuła na rynku, która robi wszystkie 3 rzeczy w 1 myciu:\n- Korzeń lukrecji, rdest wielokwiatowy i Eclipta Prostrata miejscowo blokują enzym tworzący DHT bezpośrednio w skórze głowy — bez skutków ubocznych.\n- Mięta pieprzowa i naturalny mentol natychmiast otwierają mikrokrążenie — już po 60 sekundach na myjce poczułem mocne, chłodzące mrowienie na całym czubku głowy.\n- Żeń-szeń (Ginsenozyd F2 — o 20% wyższe tempo wzrostu w badaniach) i Biota Orientalis budzą uśpione mieszki i wydłużają życie włosa.\n \nTamtego dnia wyszedłem z salonu normalnie ostrzyżony, a jeszcze na parkingu w samochodzie zamówiłem z telefonu pakiet 2+1 SARDIAN z 60-dniową gwarancją zwrotu pieniędzy.\n \n2. tydzień — na sitku pod prysznicem zamiast kłębka włosów zostało ich może 5 lub 6. Swędzenie skóry głowy zniknęło całkowicie.\n \n5. tydzień — stanąłem pod lampą w łazience i zobaczyłem na zakolach gęsty, krótki meszek. Te 75% uśpionych cebulek, o których mówił mój fryzjer, zaczęło pracować.\n \n8. tydzień — wróciłem do Tomka na kolejne strzyżenie. Kiedy rozczesał mi górę grzebieniem, uśmiechnął się w lustrze i powiedział tylko: „Mówiłem Ci, żebyś nie chwytał za maszynkę”.\n \nJeśli siedzisz dziś przed lustrem i myślisz, że jedyne co Ci zostało to ogolić głowę na krótko — sprawdź najpierw, ile Twoich uśpionych korzeni czeka jeszcze na ratunek, zanim okno zamknie się na zawsze.\n \n— Łukasz, 41 lat, Gdańsk\n \n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie\n \nP.S. Tych 25% mieszków, które straciłem przez 3 lata mycia głowy marketowym szamponem, już nie odzyskam. Ale pozostałe 75% uratowałem, bo posłuchałem faceta, który ogląda męskie głowy od kilkunastu lat.\n \nP.P.S. Masz pełne 60 dni gwarancji zwrotu pieniędzy (ocena 4,7 na 5 z ponad 4 700 opinii). Myj głowę codziennie przez 3 minuty, obserwuj odpływ pod prysznicem i linię skroni. Jeśli nie zobaczysz różnicy — oddają 100% pieniędzy."
  },
  "sardian_k5_v2": {
    "headline": "Zrobiłem to zdjęcie ukradkiem przy myjce u mojego fryzjera. Poczułem mrowienie po 60 sekundach",
    "description": "Obudź uśpione korzenie — 3 z 3 w 1 myciu (60 dni gwarancji)",
    "primaryText": "Zrobiłem to zdjęcie telefonem zaraz po tym, jak wstałem z myjki u mojego fryzjera.\n \nMam 41 lat i od 2 lat za każdym razem, gdy szedłem na strzyżenie, czułem ten sam wstyd, kiedy fryzjer zapalał górną lampę nad moją przerzedzoną koroną głowy.\n \nW zeszłym miesiącu podczas mycia głowy przed strzyżeniem poczułem na skórze coś, czego nie czułem nigdy wcześniej — głębokie, chłodzące mrowienie, jakby ktoś włączył krążenie w mojej skórze głowy. Spojrzałem na róg czarnej umywalki. Stała tam ta matowa butelka z napisem SARDIAN.\n\nMój fryzjer Tomek wytłumaczył mi wtedy w 3 minuty to, czego przez 3 lata nie powiedział mi żaden dermatolog ani farmaceuta w aptece.\n \nMoje włosy nie wypadały dlatego, że „taki mój urok”. Moje korzenie były powoli duszone pod skórą przez hormon DHT, który odcinał im dopływ krwi. Łysiejąca skóra głowy ma aż 2,6 razy słabsze ukrwienie niż zdrowa. Pozbawiony tlenu korzeń z każdym cyklem wypuszcza coraz cieńszy włos, aż najpierw zasypia, a potem umiera.\n \nKiedy mieszek umrze — robi się pusty otwór. Tych martwych (u mnie około 25% na skroniach) nie obudzi już żaden szampon ani lek na świecie.\n \nAle pozostałe 75% moich korzeni tylko spało!\n \nDlaczego więc przez 3 lata nie pomogły mi Alpecin, Biotebal, DX2 ani Loxon?\nBo żeby obudzić uśpione przez DHT cebulki, musisz zrobić 3 rzeczy jednocześnie. Nie 1. Nie 2. Wszystkie 3:\n1. Zablokować DHT bezpośrednio u nasady włosa.\n2. Rozszerzyć naczynia krwionośne w skórze głowy, żeby wpuścić do korzeni krew i tlen.\n3. Wydłużyć fazę wzrostu (anagenu), żeby nowy włos zdążył zgrubieć, zanim wypadnie.\n \nPrzebadano 92 szampony przeciw wypadaniu włosów sprzedawane w Polsce — 96% ich reklamowanych składników nie ma żadnego potwierdzenia naukowego, a 30% zawiera agresywne siarczany SLS, które mogą wypadanie wręcz nasilać.\n- Zwykłe szampony z drogerii i apteki za 30 zł robią 0 z 3.\n- Minoksydyl (Loxon) robi 1 z 3 — pobudza krążenie, ale nie blokuje DHT, więc po odstawieniu wszystko wypada z powrotem.\n- Finasteryd w tabletkach robi 1 z 3 — blokuje DHT w całym organizmie kosztem libido, ale nie budzi uśpionych cebulek.\n \nTomek zaprowadził mnie na myjkę w salonie i umył mi głowę szamponem SARDIAN.\n \nTo jedyna formuła na rynku, która robi wszystkie 3 rzeczy w 1 myciu:\n- Korzeń lukrecji, rdest wielokwiatowy i Eclipta Prostrata miejscowo blokują enzym tworzący DHT bezpośrednio w skórze głowy — bez skutków ubocznych.\n- Mięta pieprzowa i naturalny mentol natychmiast otwierają mikrokrążenie — już po 60 sekundach na myjce poczułem mocne, chłodzące mrowienie na całym czubku głowy.\n- Żeń-szeń (Ginsenozyd F2 — o 20% wyższe tempo wzrostu w badaniach) i Biota Orientalis budzą uśpione mieszki i wydłużają życie włosa.\n \nTamtego dnia wyszedłem z salonu normalnie ostrzyżony, a jeszcze na parkingu w samochodzie zamówiłem z telefonu pakiet 2+1 SARDIAN z 60-dniową gwarancją zwrotu pieniędzy.\n \n2. tydzień — na sitku pod prysznicem zamiast kłębka włosów zostało ich może 5 lub 6. Swędzenie skóry głowy zniknęło całkowicie.\n \n5. tydzień — stanąłem pod lampą w łazience i zobaczyłem na zakolach gęsty, krótki meszek. Te 75% uśpionych cebulek, o których mówił mój fryzjer, zaczęło pracować.\n \n8. tydzień — wróciłem do Tomka na kolejne strzyżenie. Kiedy rozczesał mi górę grzebieniem, uśmiechnął się w lustrze i powiedział tylko: „Mówiłem Ci, żebyś nie chwytał za maszynkę”.\n \nJeśli siedzisz dziś przed lustrem i myślisz, że jedyne co Ci zostało to ogolić głowę na krótko — sprawdź najpierw, ile Twoich uśpionych korzeni czeka jeszcze na ratunek, zanim okno zamknie się na zawsze.\n \n— Łukasz, 41 lat, Gdańsk\n \n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie\n \nP.S. Tych 25% mieszków, które straciłem przez 3 lata mycia głowy marketowym szamponem, już nie odzyskam. Ale pozostałe 75% uratowałem, bo posłuchałem faceta, który ogląda męskie głowy od kilkunastu lat.\n \nP.P.S. Masz pełne 60 dni gwarancji zwrotu pieniędzy (ocena 4,7 na 5 z ponad 4 700 opinii). Myj głowę codziennie przez 3 minuty, obserwuj odpływ pod prysznicem i linię skroni. Jeśli nie zobaczysz różnicy — oddają 100% pieniędzy."
  },
  "sardian_k5_v3": {
    "headline": "Fryzjer postawił tę butelkę przede mną i powiedział: Zrób zdjęcie etykiety i wyrzuć szampon z drogerii",
    "description": "Obudź uśpione korzenie — 3 z 3 w 1 myciu (60 dni gwarancji)",
    "primaryText": "— Zrób sobie zdjęcie tej etykiety i zamów to do domu, zanim stracisz resztę góry — powiedział mój fryzjer i postawił tę czarną butelkę na konsoli prosto przed moim lustrem.\n \nMam 41 lat. Przez ostatnie 3 lata wydałem ponad 2 500 zł na apteczne szampony kofeinowe, wcierki i tabletki z biotyną, a zakola i tak cofały się z każdym półroczem. Dopiero mój fryzjer wytłumaczył mi, dlaczego wszystkie te produkty robiły 0 z 3 rzeczy potrzebnych moim cebulkom.\n\nMój fryzjer Tomek wytłumaczył mi wtedy w 3 minuty to, czego przez 3 lata nie powiedział mi żaden dermatolog ani farmaceuta w aptece.\n \nMoje włosy nie wypadały dlatego, że „taki mój urok”. Moje korzenie były powoli duszone pod skórą przez hormon DHT, który odcinał im dopływ krwi. Łysiejąca skóra głowy ma aż 2,6 razy słabsze ukrwienie niż zdrowa. Pozbawiony tlenu korzeń z każdym cyklem wypuszcza coraz cieńszy włos, aż najpierw zasypia, a potem umiera.\n \nKiedy mieszek umrze — robi się pusty otwór. Tych martwych (u mnie około 25% na skroniach) nie obudzi już żaden szampon ani lek na świecie.\n \nAle pozostałe 75% moich korzeni tylko spało!\n \nDlaczego więc przez 3 lata nie pomogły mi Alpecin, Biotebal, DX2 ani Loxon?\nBo żeby obudzić uśpione przez DHT cebulki, musisz zrobić 3 rzeczy jednocześnie. Nie 1. Nie 2. Wszystkie 3:\n1. Zablokować DHT bezpośrednio u nasady włosa.\n2. Rozszerzyć naczynia krwionośne w skórze głowy, żeby wpuścić do korzeni krew i tlen.\n3. Wydłużyć fazę wzrostu (anagenu), żeby nowy włos zdążył zgrubieć, zanim wypadnie.\n \nPrzebadano 92 szampony przeciw wypadaniu włosów sprzedawane w Polsce — 96% ich reklamowanych składników nie ma żadnego potwierdzenia naukowego, a 30% zawiera agresywne siarczany SLS, które mogą wypadanie wręcz nasilać.\n- Zwykłe szampony z drogerii i apteki za 30 zł robią 0 z 3.\n- Minoksydyl (Loxon) robi 1 z 3 — pobudza krążenie, ale nie blokuje DHT, więc po odstawieniu wszystko wypada z powrotem.\n- Finasteryd w tabletkach robi 1 z 3 — blokuje DHT w całym organizmie kosztem libido, ale nie budzi uśpionych cebulek.\n \nTomek zaprowadził mnie na myjkę w salonie i umył mi głowę szamponem SARDIAN.\n \nTo jedyna formuła na rynku, która robi wszystkie 3 rzeczy w 1 myciu:\n- Korzeń lukrecji, rdest wielokwiatowy i Eclipta Prostrata miejscowo blokują enzym tworzący DHT bezpośrednio w skórze głowy — bez skutków ubocznych.\n- Mięta pieprzowa i naturalny mentol natychmiast otwierają mikrokrążenie — już po 60 sekundach na myjce poczułem mocne, chłodzące mrowienie na całym czubku głowy.\n- Żeń-szeń (Ginsenozyd F2 — o 20% wyższe tempo wzrostu w badaniach) i Biota Orientalis budzą uśpione mieszki i wydłużają życie włosa.\n \nTamtego dnia wyszedłem z salonu normalnie ostrzyżony, a jeszcze na parkingu w samochodzie zamówiłem z telefonu pakiet 2+1 SARDIAN z 60-dniową gwarancją zwrotu pieniędzy.\n \n2. tydzień — na sitku pod prysznicem zamiast kłębka włosów zostało ich może 5 lub 6. Swędzenie skóry głowy zniknęło całkowicie.\n \n5. tydzień — stanąłem pod lampą w łazience i zobaczyłem na zakolach gęsty, krótki meszek. Te 75% uśpionych cebulek, o których mówił mój fryzjer, zaczęło pracować.\n \n8. tydzień — wróciłem do Tomka na kolejne strzyżenie. Kiedy rozczesał mi górę grzebieniem, uśmiechnął się w lustrze i powiedział tylko: „Mówiłem Ci, żebyś nie chwytał za maszynkę”.\n \nJeśli siedzisz dziś przed lustrem i myślisz, że jedyne co Ci zostało to ogolić głowę na krótko — sprawdź najpierw, ile Twoich uśpionych korzeni czeka jeszcze na ratunek, zanim okno zamknie się na zawsze.\n \n— Łukasz, 41 lat, Gdańsk\n \n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie\n \nP.S. Tych 25% mieszków, które straciłem przez 3 lata mycia głowy marketowym szamponem, już nie odzyskam. Ale pozostałe 75% uratowałem, bo posłuchałem faceta, który ogląda męskie głowy od kilkunastu lat.\n \nP.P.S. Masz pełne 60 dni gwarancji zwrotu pieniędzy (ocena 4,7 na 5 z ponad 4 700 opinii). Myj głowę codziennie przez 3 minuty, obserwuj odpływ pod prysznicem i linię skroni. Jeśli nie zobaczysz różnicy — oddają 100% pieniędzy."
  },
  "sardian_k7_v1": {
    "headline": "Mój 42-letni mąż udawał, że zakola go nie obchodzą. Postawiłam to pod jego prysznicem",
    "description": "Formuła 3 z 3 na uśpione cebulki — 60 dni gwarancji",
    "primaryText": "Mój 42-letni mąż Tomek przy kolegach zawsze obracał swoje zakola w żart. Mówił, że „mądrej głowy włosy się nie trzymają” i że „prawdziwy facet nie przejmuje się fryzurą”.\n \nAle ja jestem jego żoną i widziałam to, czego nie widzieli jego koledzy.\n \nWidziałam, jak każdego ranka przed pracą zamykał się w łazience i przez 5 minut stał bez ruchu przed lustrem, dotykając palcami cofniętej linii włosów i prześwitu na czubku głowy. Widziałam, jak na rodzinnych zdjęciach zawsze stawał z tyłu albo zakładał czapkę z daszkiem. I widziałam, ile jego włosów zostawało codziennie na sitku pod prysznicem i na poduszce.\n \nKupował po cichu kolejne szampony z apteki — Alpecin, Biotebal, DX2. Chował je do szafki. Po żadnym nic się nie zmieniało, a on z każdym miesiącem gasł w oczach.\n\nW końcu nie wytrzymałam i zapytałam moją przyjaciółkę, która od 12 lat jest trychologiem klinicznym w Krakowie, czy da się mu realnie pomóc bez faszerowania go lekami na receptę, które niszczą męskie libido.\n \nWytłumaczyła mi coś, co powinien przeczytać każdy mężczyzna (i każda żona):\n \nU 8 na 10 mężczyzn po 35. roku życia włosy nie wypadają przez „brak witamin”. Ich korzenie są powoli duszone pod skórą przez hormon DHT, który odcina cebulkom dopływ krwi. Łysiejąca skóra głowy ma aż 2,6 razy słabsze ukrwienie niż zdrowa!\n \nZ każdym tygodniem niedotleniony mieszek produkuje coraz cieńszy włos, aż w końcu zasypia, a potem obumiera na zawsze. Kiedy obumrze — nie pomoże już nic, poza przeszczepem za 17 000 zł.\n \nAle dopóki uśpione cebulki wciąż żyją pod skórą (a u większości mężczyzn to aż 70%–80% korzeni w miejscu prześwitu!), można je obudzić — pod warunkiem, że podczas mycia zrobisz 3 rzeczy jednocześnie:\n1. Zablokujesz DHT bezpośrednio w skórze głowy.\n2. Rozszerzysz naczynia krwionośne, żeby doprowadzić do korzeni krew i tlen.\n3. Wydłużysz fazę wzrostu włosa, żeby nowe pasma rosły grube i mocne.\n \nPrzyjaciółka pokazała mi wyniki analizy 92 szamponów przeciw wypadaniu włosów sprzedawanych w Polsce: 96% ich reklamowanych składników nie ma potwierdzenia w badaniach, a 30% zawiera agresywne siarczany SLS, które podrażniają skórę i nasilają wypadanie.\n- Zwykłe szampony kofeinowe z apteki robią 0 z 3.\n- Wcierki z minoksydylem (Loxon) robią 1 z 3 — działają tylko dopóki wcierasz je 2 razy dziennie, a po odstawieniu wszystko wypada.\n- Tabletki na receptę robią 1 z 3 — blokują hormony w całym ciele kosztem sypialni.\n \nPoleciła mi tylko 1 produkt, który łączy wszystkie 3 etapy w 1 myciu: szampon SARDIAN.\n \nW jego składzie:\n- Korzeń lukrecji, rdest wielokwiatowy i Eclipta Prostrata miejscowo blokują DHT u nasady włosów (bez żadnych skutków ubocznych).\n- Mięta pieprzowa i naturalny mentol błyskawicznie pobudzają krążenie w skórze głowy.\n- Żeń-szeń (Ginsenozyd F2 — o 20% wyższe tempo wzrostu w badaniach) i Biota Orientalis budzą uśpione cebulki do pracy.\n \nZamówiłam pakiet 2+1 ze szczoteczką do masażu skóry głowy (była objęta 60-dniową gwarancją zwrotu pieniędzy) i bez słowa postawiłam czarną butelkę na półce pod prysznicem, a stary szampon z drogerii wyrzuciłam do kosza.\n \nPo 1. myciu Tomek wyszedł z łazienki z ręcznikiem na szyi i zapytał:\n— Co to za czarny szampon pod prysznicem? Tak mocno mrowi i chłodzi skórę głowy, jakbym był na zabiegu.\n \nPo 2 tygodniach — kiedy sprzątałam łazienkę w sobotę, na sitku odpływu zamiast czarnego kłębka były dosłownie 4 włosy.\n \nPo 5 tygodniach — Tomek zawołał mnie wieczorem do łazienki, stanął pod górną lampą i pokazał palcem na skronie. Wzdłuż linii czoła wyrastał gęsty, ciemny meszek nowych włosów.\n \nPo 9 tygodniach — prześwit na czubku jego głowy zagęścił się tak wyraźnie, że w zeszłą niedzielę po raz pierwszy od 2 lat wyszedł na spacer bez czapki z daszkiem.\n \nJeśli widzisz, że Twój facet przeżywa utratę włosów, ale jest zbyt dumny, żeby samemu poprosić o pomoc — zrób ten krok za niego, zanim jego uśpione cebulki obumrą na dobre.\n \n— Marta, 38 lat, Kraków\n \n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie\n \nP.S. W zeszłym tygodniu Tomek sam zapytał mnie przy śniadaniu: „Kochanie, mamy jeszcze w szafce zapas tego czarnego szamponu, bo pierwsza butelka mi się kończy?”. Dobrze, że od razu wzięłam pakiet 3 sztuk.\n \nP.P.S. Masz pełne 60 dni gwarancji zwrotu pieniędzy (ocena 4,7 na 5 z ponad 4 700 opinii). Jeśli po 60 dniach nie zobaczycie czystego odpływu i nowych włosków na skroniach — zwracają 100% pieniędzy."
  },
  "sardian_k7_v2": {
    "headline": "Widziałam, jak mąż codziennie rano stoi przed lustrem i dotyka swoich zakoli",
    "description": "Formuła 3 z 3 na uśpione cebulki — 60 dni gwarancji",
    "primaryText": "Zrobiłam to zdjęcie z korytarza, kiedy mój 42-letni mąż Tomek myślał, że jeszcze śpię.\n \nStał przed lustrem w łazience przed wyjściem do pracy i przez dobre 3 minuty wpatrywał się w swoje cofające się zakola, próbując ułożyć włosy tak, żeby nie było widać prześwitu pod światłem.\n \nSerce mi pękło, bo przy ludziach zawsze udawał twardziela, którego łysienie kompletnie nie rusza. A w szafce pod umywalką chował kolejne niedziałające szampony z apteki.\n\nW końcu nie wytrzymałam i zapytałam moją przyjaciółkę, która od 12 lat jest trychologiem klinicznym w Krakowie, czy da się mu realnie pomóc bez faszerowania go lekami na receptę, które niszczą męskie libido.\n \nWytłumaczyła mi coś, co powinien przeczytać każdy mężczyzna (i każda żona):\n \nU 8 na 10 mężczyzn po 35. roku życia włosy nie wypadają przez „brak witamin”. Ich korzenie są powoli duszone pod skórą przez hormon DHT, który odcina cebulkom dopływ krwi. Łysiejąca skóra głowy ma aż 2,6 razy słabsze ukrwienie niż zdrowa!\n \nZ każdym tygodniem niedotleniony mieszek produkuje coraz cieńszy włos, aż w końcu zasypia, a potem obumiera na zawsze. Kiedy obumrze — nie pomoże już nic, poza przeszczepem za 17 000 zł.\n \nAle dopóki uśpione cebulki wciąż żyją pod skórą (a u większości mężczyzn to aż 70%–80% korzeni w miejscu prześwitu!), można je obudzić — pod warunkiem, że podczas mycia zrobisz 3 rzeczy jednocześnie:\n1. Zablokujesz DHT bezpośrednio w skórze głowy.\n2. Rozszerzysz naczynia krwionośne, żeby doprowadzić do korzeni krew i tlen.\n3. Wydłużysz fazę wzrostu włosa, żeby nowe pasma rosły grube i mocne.\n \nPrzyjaciółka pokazała mi wyniki analizy 92 szamponów przeciw wypadaniu włosów sprzedawanych w Polsce: 96% ich reklamowanych składników nie ma potwierdzenia w badaniach, a 30% zawiera agresywne siarczany SLS, które podrażniają skórę i nasilają wypadanie.\n- Zwykłe szampony kofeinowe z apteki robią 0 z 3.\n- Wcierki z minoksydylem (Loxon) robią 1 z 3 — działają tylko dopóki wcierasz je 2 razy dziennie, a po odstawieniu wszystko wypada.\n- Tabletki na receptę robią 1 z 3 — blokują hormony w całym ciele kosztem sypialni.\n \nPoleciła mi tylko 1 produkt, który łączy wszystkie 3 etapy w 1 myciu: szampon SARDIAN.\n \nW jego składzie:\n- Korzeń lukrecji, rdest wielokwiatowy i Eclipta Prostrata miejscowo blokują DHT u nasady włosów (bez żadnych skutków ubocznych).\n- Mięta pieprzowa i naturalny mentol błyskawicznie pobudzają krążenie w skórze głowy.\n- Żeń-szeń (Ginsenozyd F2 — o 20% wyższe tempo wzrostu w badaniach) i Biota Orientalis budzą uśpione cebulki do pracy.\n \nZamówiłam pakiet 2+1 ze szczoteczką do masażu skóry głowy (była objęta 60-dniową gwarancją zwrotu pieniędzy) i bez słowa postawiłam czarną butelkę na półce pod prysznicem, a stary szampon z drogerii wyrzuciłam do kosza.\n \nPo 1. myciu Tomek wyszedł z łazienki z ręcznikiem na szyi i zapytał:\n— Co to za czarny szampon pod prysznicem? Tak mocno mrowi i chłodzi skórę głowy, jakbym był na zabiegu.\n \nPo 2 tygodniach — kiedy sprzątałam łazienkę w sobotę, na sitku odpływu zamiast czarnego kłębka były dosłownie 4 włosy.\n \nPo 5 tygodniach — Tomek zawołał mnie wieczorem do łazienki, stanął pod górną lampą i pokazał palcem na skronie. Wzdłuż linii czoła wyrastał gęsty, ciemny meszek nowych włosów.\n \nPo 9 tygodniach — prześwit na czubku jego głowy zagęścił się tak wyraźnie, że w zeszłą niedzielę po raz pierwszy od 2 lat wyszedł na spacer bez czapki z daszkiem.\n \nJeśli widzisz, że Twój facet przeżywa utratę włosów, ale jest zbyt dumny, żeby samemu poprosić o pomoc — zrób ten krok za niego, zanim jego uśpione cebulki obumrą na dobre.\n \n— Marta, 38 lat, Kraków\n \n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie\n \nP.S. W zeszłym tygodniu Tomek sam zapytał mnie przy śniadaniu: „Kochanie, mamy jeszcze w szafce zapas tego czarnego szamponu, bo pierwsza butelka mi się kończy?”. Dobrze, że od razu wzięłam pakiet 3 sztuk.\n \nP.P.S. Masz pełne 60 dni gwarancji zwrotu pieniędzy (ocena 4,7 na 5 z ponad 4 700 opinii). Jeśli po 60 dniach nie zobaczycie czystego odpływu i nowych włosków na skroniach — zwracają 100% pieniędzy."
  },
  "sardian_k7_v3": {
    "headline": "Najlepszy prezent, jaki zrobiłam mężowi bez żadnej okazji (kosztował mniej niż perfumy)",
    "description": "Formuła 3 z 3 na uśpione cebulki — 60 dni gwarancji",
    "primaryText": "Nie czekałam na urodziny ani rocznicę mojego 42-letniego męża Tomka. Kiedy zobaczyłam, że po kolejnym „cudownym” szamponie z apteki za 45 zł odpływ pod naszym prysznicem nadal jest pełny jego włosów, a on coraz częściej chodzi w czapce z daszkiem, wzięłam sprawy w swoje ręce.\n\nW końcu nie wytrzymałam i zapytałam moją przyjaciółkę, która od 12 lat jest trychologiem klinicznym w Krakowie, czy da się mu realnie pomóc bez faszerowania go lekami na receptę, które niszczą męskie libido.\n \nWytłumaczyła mi coś, co powinien przeczytać każdy mężczyzna (i każda żona):\n \nU 8 na 10 mężczyzn po 35. roku życia włosy nie wypadają przez „brak witamin”. Ich korzenie są powoli duszone pod skórą przez hormon DHT, który odcina cebulkom dopływ krwi. Łysiejąca skóra głowy ma aż 2,6 razy słabsze ukrwienie niż zdrowa!\n \nZ każdym tygodniem niedotleniony mieszek produkuje coraz cieńszy włos, aż w końcu zasypia, a potem obumiera na zawsze. Kiedy obumrze — nie pomoże już nic, poza przeszczepem za 17 000 zł.\n \nAle dopóki uśpione cebulki wciąż żyją pod skórą (a u większości mężczyzn to aż 70%–80% korzeni w miejscu prześwitu!), można je obudzić — pod warunkiem, że podczas mycia zrobisz 3 rzeczy jednocześnie:\n1. Zablokujesz DHT bezpośrednio w skórze głowy.\n2. Rozszerzysz naczynia krwionośne, żeby doprowadzić do korzeni krew i tlen.\n3. Wydłużysz fazę wzrostu włosa, żeby nowe pasma rosły grube i mocne.\n \nPrzyjaciółka pokazała mi wyniki analizy 92 szamponów przeciw wypadaniu włosów sprzedawanych w Polsce: 96% ich reklamowanych składników nie ma potwierdzenia w badaniach, a 30% zawiera agresywne siarczany SLS, które podrażniają skórę i nasilają wypadanie.\n- Zwykłe szampony kofeinowe z apteki robią 0 z 3.\n- Wcierki z minoksydylem (Loxon) robią 1 z 3 — działają tylko dopóki wcierasz je 2 razy dziennie, a po odstawieniu wszystko wypada.\n- Tabletki na receptę robią 1 z 3 — blokują hormony w całym ciele kosztem sypialni.\n \nPoleciła mi tylko 1 produkt, który łączy wszystkie 3 etapy w 1 myciu: szampon SARDIAN.\n \nW jego składzie:\n- Korzeń lukrecji, rdest wielokwiatowy i Eclipta Prostrata miejscowo blokują DHT u nasady włosów (bez żadnych skutków ubocznych).\n- Mięta pieprzowa i naturalny mentol błyskawicznie pobudzają krążenie w skórze głowy.\n- Żeń-szeń (Ginsenozyd F2 — o 20% wyższe tempo wzrostu w badaniach) i Biota Orientalis budzą uśpione cebulki do pracy.\n \nZamówiłam pakiet 2+1 ze szczoteczką do masażu skóry głowy (była objęta 60-dniową gwarancją zwrotu pieniędzy) i bez słowa postawiłam czarną butelkę na półce pod prysznicem, a stary szampon z drogerii wyrzuciłam do kosza.\n \nPo 1. myciu Tomek wyszedł z łazienki z ręcznikiem na szyi i zapytał:\n— Co to za czarny szampon pod prysznicem? Tak mocno mrowi i chłodzi skórę głowy, jakbym był na zabiegu.\n \nPo 2 tygodniach — kiedy sprzątałam łazienkę w sobotę, na sitku odpływu zamiast czarnego kłębka były dosłownie 4 włosy.\n \nPo 5 tygodniach — Tomek zawołał mnie wieczorem do łazienki, stanął pod górną lampą i pokazał palcem na skronie. Wzdłuż linii czoła wyrastał gęsty, ciemny meszek nowych włosów.\n \nPo 9 tygodniach — prześwit na czubku jego głowy zagęścił się tak wyraźnie, że w zeszłą niedzielę po raz pierwszy od 2 lat wyszedł na spacer bez czapki z daszkiem.\n \nJeśli widzisz, że Twój facet przeżywa utratę włosów, ale jest zbyt dumny, żeby samemu poprosić o pomoc — zrób ten krok za niego, zanim jego uśpione cebulki obumrą na dobre.\n \n— Marta, 38 lat, Kraków\n \n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie\n \nP.S. W zeszłym tygodniu Tomek sam zapytał mnie przy śniadaniu: „Kochanie, mamy jeszcze w szafce zapas tego czarnego szamponu, bo pierwsza butelka mi się kończy?”. Dobrze, że od razu wzięłam pakiet 3 sztuk.\n \nP.P.S. Masz pełne 60 dni gwarancji zwrotu pieniędzy (ocena 4,7 na 5 z ponad 4 700 opinii). Jeśli po 60 dniach nie zobaczycie czystego odpływu i nowych włosków na skroniach — zwracają 100% pieniędzy."
  },
  "sardian_k7_v4": {
    "headline": "Po 9 tygodniach mój mąż pierwszy raz od 2 lat wyszedł z domu bez czapki z daszkiem",
    "description": "Formuła 3 z 3 na uśpione cebulki — 60 dni gwarancji",
    "primaryText": "Przez ostatnie 2 lata mój 42-letni mąż Tomek nie ruszał się z domu bez czapki z daszkiem. Zakładał ją na zakupy, na spacer z psem, na grilla u znajomych. Przy kolegach żartował z zakoli, ale w domu widziałam, jak bardzo go to gryzie.\n \nTo zdjęcie zrobiłam mu dziś rano, kiedy wychodził z łazienki. Czapka od miesiąca leży w szufladzie.\n\nW końcu nie wytrzymałam i zapytałam moją przyjaciółkę, która od 12 lat jest trychologiem klinicznym w Krakowie, czy da się mu realnie pomóc bez faszerowania go lekami na receptę, które niszczą męskie libido.\n \nWytłumaczyła mi coś, co powinien przeczytać każdy mężczyzna (i każda żona):\n \nU 8 na 10 mężczyzn po 35. roku życia włosy nie wypadają przez „brak witamin”. Ich korzenie są powoli duszone pod skórą przez hormon DHT, który odcina cebulkom dopływ krwi. Łysiejąca skóra głowy ma aż 2,6 razy słabsze ukrwienie niż zdrowa!\n \nZ każdym tygodniem niedotleniony mieszek produkuje coraz cieńszy włos, aż w końcu zasypia, a potem obumiera na zawsze. Kiedy obumrze — nie pomoże już nic, poza przeszczepem za 17 000 zł.\n \nAle dopóki uśpione cebulki wciąż żyją pod skórą (a u większości mężczyzn to aż 70%–80% korzeni w miejscu prześwitu!), można je obudzić — pod warunkiem, że podczas mycia zrobisz 3 rzeczy jednocześnie:\n1. Zablokujesz DHT bezpośrednio w skórze głowy.\n2. Rozszerzysz naczynia krwionośne, żeby doprowadzić do korzeni krew i tlen.\n3. Wydłużysz fazę wzrostu włosa, żeby nowe pasma rosły grube i mocne.\n \nPrzyjaciółka pokazała mi wyniki analizy 92 szamponów przeciw wypadaniu włosów sprzedawanych w Polsce: 96% ich reklamowanych składników nie ma potwierdzenia w badaniach, a 30% zawiera agresywne siarczany SLS, które podrażniają skórę i nasilają wypadanie.\n- Zwykłe szampony kofeinowe z apteki robią 0 z 3.\n- Wcierki z minoksydylem (Loxon) robią 1 z 3 — działają tylko dopóki wcierasz je 2 razy dziennie, a po odstawieniu wszystko wypada.\n- Tabletki na receptę robią 1 z 3 — blokują hormony w całym ciele kosztem sypialni.\n \nPoleciła mi tylko 1 produkt, który łączy wszystkie 3 etapy w 1 myciu: szampon SARDIAN.\n \nW jego składzie:\n- Korzeń lukrecji, rdest wielokwiatowy i Eclipta Prostrata miejscowo blokują DHT u nasady włosów (bez żadnych skutków ubocznych).\n- Mięta pieprzowa i naturalny mentol błyskawicznie pobudzają krążenie w skórze głowy.\n- Żeń-szeń (Ginsenozyd F2 — o 20% wyższe tempo wzrostu w badaniach) i Biota Orientalis budzą uśpione cebulki do pracy.\n \nZamówiłam pakiet 2+1 ze szczoteczką do masażu skóry głowy (była objęta 60-dniową gwarancją zwrotu pieniędzy) i bez słowa postawiłam czarną butelkę na półce pod prysznicem, a stary szampon z drogerii wyrzuciłam do kosza.\n \nPo 1. myciu Tomek wyszedł z łazienki z ręcznikiem na szyi i zapytał:\n— Co to za czarny szampon pod prysznicem? Tak mocno mrowi i chłodzi skórę głowy, jakbym był na zabiegu.\n \nPo 2 tygodniach — kiedy sprzątałam łazienkę w sobotę, na sitku odpływu zamiast czarnego kłębka były dosłownie 4 włosy.\n \nPo 5 tygodniach — Tomek zawołał mnie wieczorem do łazienki, stanął pod górną lampą i pokazał palcem na skronie. Wzdłuż linii czoła wyrastał gęsty, ciemny meszek nowych włosów.\n \nPo 9 tygodniach — prześwit na czubku jego głowy zagęścił się tak wyraźnie, że w zeszłą niedzielę po raz pierwszy od 2 lat wyszedł na spacer bez czapki z daszkiem.\n \nJeśli widzisz, że Twój facet przeżywa utratę włosów, ale jest zbyt dumny, żeby samemu poprosić o pomoc — zrób ten krok za niego, zanim jego uśpione cebulki obumrą na dobre.\n \n— Marta, 38 lat, Kraków\n \n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie\n \nP.S. W zeszłym tygodniu Tomek sam zapytał mnie przy śniadaniu: „Kochanie, mamy jeszcze w szafce zapas tego czarnego szamponu, bo pierwsza butelka mi się kończy?”. Dobrze, że od razu wzięłam pakiet 3 sztuk.\n \nP.P.S. Masz pełne 60 dni gwarancji zwrotu pieniędzy (ocena 4,7 na 5 z ponad 4 700 opinii). Jeśli po 60 dniach nie zobaczycie czystego odpływu i nowych włosków na skroniach — zwracają 100% pieniędzy."
  },
  "sardian_k7_v5": {
    "headline": "Najpierw pytał, po co kupiłam mu kolejny szampon. Dziś sam pilnuje, żeby pod prysznicem stał zapas",
    "description": "Formuła 3 z 3 na uśpione cebulki — 60 dni gwarancji",
    "primaryText": "Kiedy 2 miesiące temu postawiłam pierwszą czarną butelkę SARDIAN pod naszym prysznicem, mój 42-letni mąż Tomek tylko machnął ręką i powiedział: „Marta, przecież wiesz, że na męskie zakola żadne szampony nie działają”.\n \nMówił tak, bo wcześniej przez 2 lata sparzył się na aptecznych szamponach kofeinowych. Dziś pod naszym prysznicem stoi końcówka 1. butelki i świeżo otwarta 2. butelka, której pilnuje bardziej niż kluczyków do auta.\n\nW końcu nie wytrzymałam i zapytałam moją przyjaciółkę, która od 12 lat jest trychologiem klinicznym w Krakowie, czy da się mu realnie pomóc bez faszerowania go lekami na receptę, które niszczą męskie libido.\n \nWytłumaczyła mi coś, co powinien przeczytać każdy mężczyzna (i każda żona):\n \nU 8 na 10 mężczyzn po 35. roku życia włosy nie wypadają przez „brak witamin”. Ich korzenie są powoli duszone pod skórą przez hormon DHT, który odcina cebulkom dopływ krwi. Łysiejąca skóra głowy ma aż 2,6 razy słabsze ukrwienie niż zdrowa!\n \nZ każdym tygodniem niedotleniony mieszek produkuje coraz cieńszy włos, aż w końcu zasypia, a potem obumiera na zawsze. Kiedy obumrze — nie pomoże już nic, poza przeszczepem za 17 000 zł.\n \nAle dopóki uśpione cebulki wciąż żyją pod skórą (a u większości mężczyzn to aż 70%–80% korzeni w miejscu prześwitu!), można je obudzić — pod warunkiem, że podczas mycia zrobisz 3 rzeczy jednocześnie:\n1. Zablokujesz DHT bezpośrednio w skórze głowy.\n2. Rozszerzysz naczynia krwionośne, żeby doprowadzić do korzeni krew i tlen.\n3. Wydłużysz fazę wzrostu włosa, żeby nowe pasma rosły grube i mocne.\n \nPrzyjaciółka pokazała mi wyniki analizy 92 szamponów przeciw wypadaniu włosów sprzedawanych w Polsce: 96% ich reklamowanych składników nie ma potwierdzenia w badaniach, a 30% zawiera agresywne siarczany SLS, które podrażniają skórę i nasilają wypadanie.\n- Zwykłe szampony kofeinowe z apteki robią 0 z 3.\n- Wcierki z minoksydylem (Loxon) robią 1 z 3 — działają tylko dopóki wcierasz je 2 razy dziennie, a po odstawieniu wszystko wypada.\n- Tabletki na receptę robią 1 z 3 — blokują hormony w całym ciele kosztem sypialni.\n \nPoleciła mi tylko 1 produkt, który łączy wszystkie 3 etapy w 1 myciu: szampon SARDIAN.\n \nW jego składzie:\n- Korzeń lukrecji, rdest wielokwiatowy i Eclipta Prostrata miejscowo blokują DHT u nasady włosów (bez żadnych skutków ubocznych).\n- Mięta pieprzowa i naturalny mentol błyskawicznie pobudzają krążenie w skórze głowy.\n- Żeń-szeń (Ginsenozyd F2 — o 20% wyższe tempo wzrostu w badaniach) i Biota Orientalis budzą uśpione cebulki do pracy.\n \nZamówiłam pakiet 2+1 ze szczoteczką do masażu skóry głowy (była objęta 60-dniową gwarancją zwrotu pieniędzy) i bez słowa postawiłam czarną butelkę na półce pod prysznicem, a stary szampon z drogerii wyrzuciłam do kosza.\n \nPo 1. myciu Tomek wyszedł z łazienki z ręcznikiem na szyi i zapytał:\n— Co to za czarny szampon pod prysznicem? Tak mocno mrowi i chłodzi skórę głowy, jakbym był na zabiegu.\n \nPo 2 tygodniach — kiedy sprzątałam łazienkę w sobotę, na sitku odpływu zamiast czarnego kłębka były dosłownie 4 włosy.\n \nPo 5 tygodniach — Tomek zawołał mnie wieczorem do łazienki, stanął pod górną lampą i pokazał palcem na skronie. Wzdłuż linii czoła wyrastał gęsty, ciemny meszek nowych włosów.\n \nPo 9 tygodniach — prześwit na czubku jego głowy zagęścił się tak wyraźnie, że w zeszłą niedzielę po raz pierwszy od 2 lat wyszedł na spacer bez czapki z daszkiem.\n \nJeśli widzisz, że Twój facet przeżywa utratę włosów, ale jest zbyt dumny, żeby samemu poprosić o pomoc — zrób ten krok za niego, zanim jego uśpione cebulki obumrą na dobre.\n \n— Marta, 38 lat, Kraków\n \n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie\n \nP.S. W zeszłym tygodniu Tomek sam zapytał mnie przy śniadaniu: „Kochanie, mamy jeszcze w szafce zapas tego czarnego szamponu, bo pierwsza butelka mi się kończy?”. Dobrze, że od razu wzięłam pakiet 3 sztuk.\n \nP.P.S. Masz pełne 60 dni gwarancji zwrotu pieniędzy (ocena 4,7 na 5 z ponad 4 700 opinii). Jeśli po 60 dniach nie zobaczycie czystego odpływu i nowych włosków na skroniach — zwracają 100% pieniędzy."
  },
  "sardian_nd_a1": {
    "headline": "Myślałem, że moje cebulki są martwe. Kamera w 200x powiększeniu pokazała żółty czop DHT",
    "description": "Rozpuść czopy łojowo-DHT w 2 minuty pod prysznicem (60 dni gwarancji)",
    "primaryText": "Patrzysz teraz na zdjęcie monitora, które zrobiłem u trychologa w Warszawie.\n\nPo lewej stronie ekranu widać moją skórę w zakolach w 200-krotnym powiększeniu przed kuracją. Widzisz te żółtawe, woskowe kulki zatykające każde ujście włosa?\n\nMiałem 45 lat i byłem w 100% przekonany, że w moich zakolach nie ma już żadnych cebulek. Skóra była tam gładka, napięta i błyszcząca. Ale kiedy lekarz przyłożył kamerę, powiedział zdanie, które wbiło mnie w fotel:\n— Panie Marku, te cebulki pod spodem żyją. Są tylko zamurowane pod twardym czopem z łoju i hormonu DHT.\n\nDlaczego każdy facet łysieje dokładnie w ten sam sposób — zakola i czubek głowy cofają się z każdym rokiem, a boki nad uszami i tył nad karkiem zostają gęste jak u 20-latka, nawet u 70-letnich dziadków?\n\nPrzez lata wmawiano nam, że to „po prostu geny”. Ale prawda anatomiczna, którą widać pod kamerą trychoskopową w 200-krotnym powiększeniu, jest zupełnie inna.\n\nNa czubku głowy i w zakolach skóra leży bezpośrednio na twardym ścięgnie (czepcu ścięgnistym), które z wiekiem napina się na czaszce jak membrana bębna. To napięcie miażdży drobne naczynia włosowate i odcina dopływ tlenu.\n\nW tym samym czasie gruczoły łojowe na górze głowy robią coś jeszcze gorszego: pod wpływem męskiego hormonu DHT produkują gęsty, lepki łój nasycony DHT, który w ujściu mieszka włosowego miesza się z martwym naskórkiem i zastyga w twardy, żółtawy czop.\n\nTrycholodzy nazywają to zjawisko „cementem łojowo-DHT” (Sebum-Cement) oraz mikro-zwłóknieniem wokół mieszka.\n\nSprawdź to teraz własnymi 2 palcami:\n1. Złap skórę nad uchem — jest miękka, luźna, a włosy są tam grube.\n2. Dotknij skóry w zakolach albo na czubku głowy — jest twarda, napięta i błyszcząca jak wypolerowana.\n\nWiększość mężczyzn myśli, że ten połysk na zakolach oznacza „martwą skórę bez cebulek”.\nTo błąd.\n\nBadania kliniczne pokazują, że pod tą błyszczącą, zaczopowaną warstwą od 70% do 80% Twoich cebulek nadal żyje jeszcze przez 2 do 4 lat. Są po prostu uwięzione pod woskowym czopem nasyconym DHT — nowy włos nie ma siły przebić się na powierzchnię, a żadna droga wcierka ani ampułka za 200 zł nie jest w stanie przeniknąć przez tę zbitą barierę.\n\nZwykły szampon z drogerii ślizga się tylko po powierzchni tego czopa i robi 0 z 3 rzeczy potrzebnych do odblokowania mieszka.\n\nŻeby uwolnić uwięzione pod skórą cebulki, podczas każdego mycia w ciepłej wodzie muszą zadziałać jednocześnie 3 procesy:\n1. Rozpuszczenie woskowego czopa łojowego i odcięcie hormonu DHT w ujściu mieszka (zanim czop stwardnieje na dobre).\n2. Rozszerzenie ściśniętych naczyń krwionośnych pod napiętą skórą czubka głowy, żeby wtłoczyć tlen do uśpionej brodawki.\n3. Dostarczenie korzeniom budulca do wypchnięcia grubego włosa ponad powierzchnię skóry.\n\nSzampon SARDIAN Aktywujący Korzenie został zaprojektowany dokładnie jako codzienny „rozpuszczalnik czopów DHT” i aktywator krążenia w 1 kroku:\n\nPo pierwsze: Rdest wielokwiatowy (Polygonum multiflorum) oraz Biota Orientalis rozbijają nagromadzony w porach hormon DHT i oczyszczają ujście mieszka z woskowego czopa. W badaniach laboratoryjnych ekstrakt z rdestu wielokwiatowego wykazał aktywację fazy wzrostu w 90% badanych mieszków włosowych (w porównaniu do 70% w grupie kontrolnej z minoksydylem).\n\nPo drugie: Korzeń żeń-szenia i naturalny mentol z mięty pieprzowej uderzają w napiętą skórę na czubku głowy i otwierają mikrokrążenie. Już po 60 sekundach masażu pod prysznicem czujesz głębokie, chłodzące mrowienie — to fizyczny dowód, że krew przebija się do ściśniętych cebulek.\n\nPo trzecie: Korzeń lukrecji wygasza mikrostany zapalne wokół zaczopowanego mieszka, powstrzymując jego zwłóknienie.\n\nBadania nad tą kombinacją ekstraktów wykazały 2,6 razy większą przeżywalność komórek brodawki włosa oraz o 62% wyższą aktywność wzrostową cebulek.\n\nI nie musisz wierzyć na słowo:\n- W pierwszych 2 do 3 tygodniach z czubka głowy i zakoli znika tłusty, błyszczący film, a na sitku pod prysznicem zostaje o połowę mniej włosów.\n- Między 4. a 6. tygodniem odblokowane pory zaczynają wypuszczać nowe, krótkie włoski, a te istniejące stają się sztywniejsze u nasady.\n- Po 8 do 12 tygodniach prześwit pod ostrym światłem wyraźnie się zagęszcza.\n\nCałość zajmuje 2 minuty podczas zwykłego prysznica. Bez lepkich wcierek, bez tabletek na receptę rujnujących libido i bez wydawania 17 000 zł na przeszczep.\n\nCo więcej, SARDIAN daje pełną 60-dniową gwarancję zwrotu pieniędzy (a przy bestsellerowym Pakiecie 2+1 otrzymujesz 3. butelkę gratis, darmową dostawę oraz silikonową szczoteczkę do masażu, która mechanicznie pomaga rozbić czopy łojowe pod prysznicem).\n\nPonad 4 700 polskich mężczyzn oceniło już SARDIAN na 4,7 na 5 gwiazdek. Sprawdź dostępność, zanim Twoje uwięzione cebulki zwłóknieją na zawsze:\n\n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie"
  },
  "sardian_nd_a2": {
    "headline": "Zrób teraz 5-sekundowy test 2 palców na czubku głowy i nad uchem",
    "description": "Rozpuść czopy łojowo-DHT w 2 minuty pod prysznicem (60 dni gwarancji)",
    "primaryText": "Zanim przewiniesz dalej, zrób 5-sekundowy test: dotknij 2 palcami skóry tuż nad swoim uchem, a potem dotknij skóry na czubku głowy lub w zakolach.\n\nCzujesz różnicę? Nad uchem skóra jest miękka i luźna. A na górze głowy jest twarda, napięta jak bęben i pokryta śliskim filmem.\n\nPrzez 4 lata myślałem, że ten błyszczący prześwit na mojej koronie głowy to wyrok genetyczny, z którym nic się nie da zrobić. Dopiero to proste odkrycie anatomiczne uratowało moje włosy w wieku 46 lat.\n\nDlaczego każdy facet łysieje dokładnie w ten sam sposób — zakola i czubek głowy cofają się z każdym rokiem, a boki nad uszami i tył nad karkiem zostają gęste jak u 20-latka, nawet u 70-letnich dziadków?\n\nPrzez lata wmawiano nam, że to „po prostu geny”. Ale prawda anatomiczna, którą widać pod kamerą trychoskopową w 200-krotnym powiększeniu, jest zupełnie inna.\n\nNa czubku głowy i w zakolach skóra leży bezpośrednio na twardym ścięgnie (czepcu ścięgnistym), które z wiekiem napina się na czaszce jak membrana bębna. To napięcie miażdży drobne naczynia włosowate i odcina dopływ tlenu.\n\nW tym samym czasie gruczoły łojowe na górze głowy robią coś jeszcze gorszego: pod wpływem męskiego hormonu DHT produkują gęsty, lepki łój nasycony DHT, który w ujściu mieszka włosowego miesza się z martwym naskórkiem i zastyga w twardy, żółtawy czop.\n\nTrycholodzy nazywają to zjawisko „cementem łojowo-DHT” (Sebum-Cement) oraz mikro-zwłóknieniem wokół mieszka.\n\nSprawdź to teraz własnymi 2 palcami:\n1. Złap skórę nad uchem — jest miękka, luźna, a włosy są tam grube.\n2. Dotknij skóry w zakolach albo na czubku głowy — jest twarda, napięta i błyszcząca jak wypolerowana.\n\nWiększość mężczyzn myśli, że ten połysk na zakolach oznacza „martwą skórę bez cebulek”.\nTo błąd.\n\nBadania kliniczne pokazują, że pod tą błyszczącą, zaczopowaną warstwą od 70% do 80% Twoich cebulek nadal żyje jeszcze przez 2 do 4 lat. Są po prostu uwięzione pod woskowym czopem nasyconym DHT — nowy włos nie ma siły przebić się na powierzchnię, a żadna droga wcierka ani ampułka za 200 zł nie jest w stanie przeniknąć przez tę zbitą barierę.\n\nZwykły szampon z drogerii ślizga się tylko po powierzchni tego czopa i robi 0 z 3 rzeczy potrzebnych do odblokowania mieszka.\n\nŻeby uwolnić uwięzione pod skórą cebulki, podczas każdego mycia w ciepłej wodzie muszą zadziałać jednocześnie 3 procesy:\n1. Rozpuszczenie woskowego czopa łojowego i odcięcie hormonu DHT w ujściu mieszka (zanim czop stwardnieje na dobre).\n2. Rozszerzenie ściśniętych naczyń krwionośnych pod napiętą skórą czubka głowy, żeby wtłoczyć tlen do uśpionej brodawki.\n3. Dostarczenie korzeniom budulca do wypchnięcia grubego włosa ponad powierzchnię skóry.\n\nSzampon SARDIAN Aktywujący Korzenie został zaprojektowany dokładnie jako codzienny „rozpuszczalnik czopów DHT” i aktywator krążenia w 1 kroku:\n\nPo pierwsze: Rdest wielokwiatowy (Polygonum multiflorum) oraz Biota Orientalis rozbijają nagromadzony w porach hormon DHT i oczyszczają ujście mieszka z woskowego czopa. W badaniach laboratoryjnych ekstrakt z rdestu wielokwiatowego wykazał aktywację fazy wzrostu w 90% badanych mieszków włosowych (w porównaniu do 70% w grupie kontrolnej z minoksydylem).\n\nPo drugie: Korzeń żeń-szenia i naturalny mentol z mięty pieprzowej uderzają w napiętą skórę na czubku głowy i otwierają mikrokrążenie. Już po 60 sekundach masażu pod prysznicem czujesz głębokie, chłodzące mrowienie — to fizyczny dowód, że krew przebija się do ściśniętych cebulek.\n\nPo trzecie: Korzeń lukrecji wygasza mikrostany zapalne wokół zaczopowanego mieszka, powstrzymując jego zwłóknienie.\n\nBadania nad tą kombinacją ekstraktów wykazały 2,6 razy większą przeżywalność komórek brodawki włosa oraz o 62% wyższą aktywność wzrostową cebulek.\n\nI nie musisz wierzyć na słowo:\n- W pierwszych 2 do 3 tygodniach z czubka głowy i zakoli znika tłusty, błyszczący film, a na sitku pod prysznicem zostaje o połowę mniej włosów.\n- Między 4. a 6. tygodniem odblokowane pory zaczynają wypuszczać nowe, krótkie włoski, a te istniejące stają się sztywniejsze u nasady.\n- Po 8 do 12 tygodniach prześwit pod ostrym światłem wyraźnie się zagęszcza.\n\nCałość zajmuje 2 minuty podczas zwykłego prysznica. Bez lepkich wcierek, bez tabletek na receptę rujnujących libido i bez wydawania 17 000 zł na przeszczep.\n\nCo więcej, SARDIAN daje pełną 60-dniową gwarancję zwrotu pieniędzy (a przy bestsellerowym Pakiecie 2+1 otrzymujesz 3. butelkę gratis, darmową dostawę oraz silikonową szczoteczkę do masażu, która mechanicznie pomaga rozbić czopy łojowe pod prysznicem).\n\nPonad 4 700 polskich mężczyzn oceniło już SARDIAN na 4,7 na 5 gwiazdek. Sprawdź dostępność, zanim Twoje uwięzione cebulki zwłóknieją na zawsze:\n\n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie"
  },
  "sardian_nd_a3": {
    "headline": "Wydajesz 150 zł na wcierki i ampułki? Bez rozpuszczenia czopa DHT spływają jak po szybie",
    "description": "Rozpuść czopy łojowo-DHT w 2 minuty pod prysznicem (60 dni gwarancji)",
    "primaryText": "Przez 2 lata wcierałem w zakola i czubek głowy apteczne ampułki za 160 zł miesięcznie. Skóra piekła, włosy były posklejane, a zakola cofnęły się o kolejny centymetr.\n\nWiesz, dlaczego żadna wcierka ani odżywka nie zadziałała na moje włosy?\n\nBo nakładałem je na pory zatkane stwardniałym „cementem łojowo-DHT”. To tak, jakbyś podlewał trawę przez warstwę betonu i dziwił się, że nic nie rośnie.\n\nDlaczego każdy facet łysieje dokładnie w ten sam sposób — zakola i czubek głowy cofają się z każdym rokiem, a boki nad uszami i tył nad karkiem zostają gęste jak u 20-latka, nawet u 70-letnich dziadków?\n\nPrzez lata wmawiano nam, że to „po prostu geny”. Ale prawda anatomiczna, którą widać pod kamerą trychoskopową w 200-krotnym powiększeniu, jest zupełnie inna.\n\nNa czubku głowy i w zakolach skóra leży bezpośrednio na twardym ścięgnie (czepcu ścięgnistym), które z wiekiem napina się na czaszce jak membrana bębna. To napięcie miażdży drobne naczynia włosowate i odcina dopływ tlenu.\n\nW tym samym czasie gruczoły łojowe na górze głowy robią coś jeszcze gorszego: pod wpływem męskiego hormonu DHT produkują gęsty, lepki łój nasycony DHT, który w ujściu mieszka włosowego miesza się z martwym naskórkiem i zastyga w twardy, żółtawy czop.\n\nTrycholodzy nazywają to zjawisko „cementem łojowo-DHT” (Sebum-Cement) oraz mikro-zwłóknieniem wokół mieszka.\n\nSprawdź to teraz własnymi 2 palcami:\n1. Złap skórę nad uchem — jest miękka, luźna, a włosy są tam grube.\n2. Dotknij skóry w zakolach albo na czubku głowy — jest twarda, napięta i błyszcząca jak wypolerowana.\n\nWiększość mężczyzn myśli, że ten połysk na zakolach oznacza „martwą skórę bez cebulek”.\nTo błąd.\n\nBadania kliniczne pokazują, że pod tą błyszczącą, zaczopowaną warstwą od 70% do 80% Twoich cebulek nadal żyje jeszcze przez 2 do 4 lat. Są po prostu uwięzione pod woskowym czopem nasyconym DHT — nowy włos nie ma siły przebić się na powierzchnię, a żadna droga wcierka ani ampułka za 200 zł nie jest w stanie przeniknąć przez tę zbitą barierę.\n\nZwykły szampon z drogerii ślizga się tylko po powierzchni tego czopa i robi 0 z 3 rzeczy potrzebnych do odblokowania mieszka.\n\nŻeby uwolnić uwięzione pod skórą cebulki, podczas każdego mycia w ciepłej wodzie muszą zadziałać jednocześnie 3 procesy:\n1. Rozpuszczenie woskowego czopa łojowego i odcięcie hormonu DHT w ujściu mieszka (zanim czop stwardnieje na dobre).\n2. Rozszerzenie ściśniętych naczyń krwionośnych pod napiętą skórą czubka głowy, żeby wtłoczyć tlen do uśpionej brodawki.\n3. Dostarczenie korzeniom budulca do wypchnięcia grubego włosa ponad powierzchnię skóry.\n\nSzampon SARDIAN Aktywujący Korzenie został zaprojektowany dokładnie jako codzienny „rozpuszczalnik czopów DHT” i aktywator krążenia w 1 kroku:\n\nPo pierwsze: Rdest wielokwiatowy (Polygonum multiflorum) oraz Biota Orientalis rozbijają nagromadzony w porach hormon DHT i oczyszczają ujście mieszka z woskowego czopa. W badaniach laboratoryjnych ekstrakt z rdestu wielokwiatowego wykazał aktywację fazy wzrostu w 90% badanych mieszków włosowych (w porównaniu do 70% w grupie kontrolnej z minoksydylem).\n\nPo drugie: Korzeń żeń-szenia i naturalny mentol z mięty pieprzowej uderzają w napiętą skórę na czubku głowy i otwierają mikrokrążenie. Już po 60 sekundach masażu pod prysznicem czujesz głębokie, chłodzące mrowienie — to fizyczny dowód, że krew przebija się do ściśniętych cebulek.\n\nPo trzecie: Korzeń lukrecji wygasza mikrostany zapalne wokół zaczopowanego mieszka, powstrzymując jego zwłóknienie.\n\nBadania nad tą kombinacją ekstraktów wykazały 2,6 razy większą przeżywalność komórek brodawki włosa oraz o 62% wyższą aktywność wzrostową cebulek.\n\nI nie musisz wierzyć na słowo:\n- W pierwszych 2 do 3 tygodniach z czubka głowy i zakoli znika tłusty, błyszczący film, a na sitku pod prysznicem zostaje o połowę mniej włosów.\n- Między 4. a 6. tygodniem odblokowane pory zaczynają wypuszczać nowe, krótkie włoski, a te istniejące stają się sztywniejsze u nasady.\n- Po 8 do 12 tygodniach prześwit pod ostrym światłem wyraźnie się zagęszcza.\n\nCałość zajmuje 2 minuty podczas zwykłego prysznica. Bez lepkich wcierek, bez tabletek na receptę rujnujących libido i bez wydawania 17 000 zł na przeszczep.\n\nCo więcej, SARDIAN daje pełną 60-dniową gwarancję zwrotu pieniędzy (a przy bestsellerowym Pakiecie 2+1 otrzymujesz 3. butelkę gratis, darmową dostawę oraz silikonową szczoteczkę do masażu, która mechanicznie pomaga rozbić czopy łojowe pod prysznicem).\n\nPonad 4 700 polskich mężczyzn oceniło już SARDIAN na 4,7 na 5 gwiazdek. Sprawdź dostępność, zanim Twoje uwięzione cebulki zwłóknieją na zawsze:\n\n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie"
  },
  "sardian_nd_a4": {
    "headline": "Myślałem, że błyszcząca skóra w zakolach oznacza martwe cebulki. Myliłem się o 80%",
    "description": "Rozpuść czopy łojowo-DHT w 2 minuty pod prysznicem (60 dni gwarancji)",
    "primaryText": "Kiedy stawałem pod lampą w łazience z mokrymi włosami, skóra w moich zakolach i na czubku głowy odbijała światło jak lusterko.\n\nMiałem 39 lat i wszyscy wokół powtarzali mi to samo: „Jak skóra już błyszczy, to cebulki umarły, zbieraj na Turcję albo kupuj maszynkę”.\n\nDziś na zdjęciu widzisz moje mokre włosy po 9 tygodniach od momentu, w którym dowiedziałem się, czym naprawdę jest ten „połysk” w męskich zakolach.\n\nDlaczego każdy facet łysieje dokładnie w ten sam sposób — zakola i czubek głowy cofają się z każdym rokiem, a boki nad uszami i tył nad karkiem zostają gęste jak u 20-latka, nawet u 70-letnich dziadków?\n\nPrzez lata wmawiano nam, że to „po prostu geny”. Ale prawda anatomiczna, którą widać pod kamerą trychoskopową w 200-krotnym powiększeniu, jest zupełnie inna.\n\nNa czubku głowy i w zakolach skóra leży bezpośrednio na twardym ścięgnie (czepcu ścięgnistym), które z wiekiem napina się na czaszce jak membrana bębna. To napięcie miażdży drobne naczynia włosowate i odcina dopływ tlenu.\n\nW tym samym czasie gruczoły łojowe na górze głowy robią coś jeszcze gorszego: pod wpływem męskiego hormonu DHT produkują gęsty, lepki łój nasycony DHT, który w ujściu mieszka włosowego miesza się z martwym naskórkiem i zastyga w twardy, żółtawy czop.\n\nTrycholodzy nazywają to zjawisko „cementem łojowo-DHT” (Sebum-Cement) oraz mikro-zwłóknieniem wokół mieszka.\n\nSprawdź to teraz własnymi 2 palcami:\n1. Złap skórę nad uchem — jest miękka, luźna, a włosy są tam grube.\n2. Dotknij skóry w zakolach albo na czubku głowy — jest twarda, napięta i błyszcząca jak wypolerowana.\n\nWiększość mężczyzn myśli, że ten połysk na zakolach oznacza „martwą skórę bez cebulek”.\nTo błąd.\n\nBadania kliniczne pokazują, że pod tą błyszczącą, zaczopowaną warstwą od 70% do 80% Twoich cebulek nadal żyje jeszcze przez 2 do 4 lat. Są po prostu uwięzione pod woskowym czopem nasyconym DHT — nowy włos nie ma siły przebić się na powierzchnię, a żadna droga wcierka ani ampułka za 200 zł nie jest w stanie przeniknąć przez tę zbitą barierę.\n\nZwykły szampon z drogerii ślizga się tylko po powierzchni tego czopa i robi 0 z 3 rzeczy potrzebnych do odblokowania mieszka.\n\nŻeby uwolnić uwięzione pod skórą cebulki, podczas każdego mycia w ciepłej wodzie muszą zadziałać jednocześnie 3 procesy:\n1. Rozpuszczenie woskowego czopa łojowego i odcięcie hormonu DHT w ujściu mieszka (zanim czop stwardnieje na dobre).\n2. Rozszerzenie ściśniętych naczyń krwionośnych pod napiętą skórą czubka głowy, żeby wtłoczyć tlen do uśpionej brodawki.\n3. Dostarczenie korzeniom budulca do wypchnięcia grubego włosa ponad powierzchnię skóry.\n\nSzampon SARDIAN Aktywujący Korzenie został zaprojektowany dokładnie jako codzienny „rozpuszczalnik czopów DHT” i aktywator krążenia w 1 kroku:\n\nPo pierwsze: Rdest wielokwiatowy (Polygonum multiflorum) oraz Biota Orientalis rozbijają nagromadzony w porach hormon DHT i oczyszczają ujście mieszka z woskowego czopa. W badaniach laboratoryjnych ekstrakt z rdestu wielokwiatowego wykazał aktywację fazy wzrostu w 90% badanych mieszków włosowych (w porównaniu do 70% w grupie kontrolnej z minoksydylem).\n\nPo drugie: Korzeń żeń-szenia i naturalny mentol z mięty pieprzowej uderzają w napiętą skórę na czubku głowy i otwierają mikrokrążenie. Już po 60 sekundach masażu pod prysznicem czujesz głębokie, chłodzące mrowienie — to fizyczny dowód, że krew przebija się do ściśniętych cebulek.\n\nPo trzecie: Korzeń lukrecji wygasza mikrostany zapalne wokół zaczopowanego mieszka, powstrzymując jego zwłóknienie.\n\nBadania nad tą kombinacją ekstraktów wykazały 2,6 razy większą przeżywalność komórek brodawki włosa oraz o 62% wyższą aktywność wzrostową cebulek.\n\nI nie musisz wierzyć na słowo:\n- W pierwszych 2 do 3 tygodniach z czubka głowy i zakoli znika tłusty, błyszczący film, a na sitku pod prysznicem zostaje o połowę mniej włosów.\n- Między 4. a 6. tygodniem odblokowane pory zaczynają wypuszczać nowe, krótkie włoski, a te istniejące stają się sztywniejsze u nasady.\n- Po 8 do 12 tygodniach prześwit pod ostrym światłem wyraźnie się zagęszcza.\n\nCałość zajmuje 2 minuty podczas zwykłego prysznica. Bez lepkich wcierek, bez tabletek na receptę rujnujących libido i bez wydawania 17 000 zł na przeszczep.\n\nCo więcej, SARDIAN daje pełną 60-dniową gwarancję zwrotu pieniędzy (a przy bestsellerowym Pakiecie 2+1 otrzymujesz 3. butelkę gratis, darmową dostawę oraz silikonową szczoteczkę do masażu, która mechanicznie pomaga rozbić czopy łojowe pod prysznicem).\n\nPonad 4 700 polskich mężczyzn oceniło już SARDIAN na 4,7 na 5 gwiazdek. Sprawdź dostępność, zanim Twoje uwięzione cebulki zwłóknieją na zawsze:\n\n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie"
  },
  "sardian_nd_a5": {
    "headline": "35 lat strzygę facetów: oto dlaczego boki rosną Ci jak szalone, a góra dusi się pod warstwą DHT",
    "description": "Rozpuść czopy łojowo-DHT w 2 minuty pod prysznicem (60 dni gwarancji)",
    "primaryText": "Strzygę polskich facetów od 1991 roku. Przez 35 lat przy fotelu słyszałem to pytanie przynajmniej 5 000 razy:\n— Panie Andrzeju, dlaczego boki nad uszami muszę ścinać co 3 tygodnie, bo rosną jak szczotka, a na górze włosy stoją w miejscu i prześwitują?\n\nWiększość fryzjerów wzrusza ramionami i mówi: „Taka uroda”. Ale ja przez lata pracy z chłopakami, którzy uratowali swoje włosy bez przeszczepu, poznałem prawdziwą przyczynę.\n\nDlaczego każdy facet łysieje dokładnie w ten sam sposób — zakola i czubek głowy cofają się z każdym rokiem, a boki nad uszami i tył nad karkiem zostają gęste jak u 20-latka, nawet u 70-letnich dziadków?\n\nPrzez lata wmawiano nam, że to „po prostu geny”. Ale prawda anatomiczna, którą widać pod kamerą trychoskopową w 200-krotnym powiększeniu, jest zupełnie inna.\n\nNa czubku głowy i w zakolach skóra leży bezpośrednio na twardym ścięgnie (czepcu ścięgnistym), które z wiekiem napina się na czaszce jak membrana bębna. To napięcie miażdży drobne naczynia włosowate i odcina dopływ tlenu.\n\nW tym samym czasie gruczoły łojowe na górze głowy robią coś jeszcze gorszego: pod wpływem męskiego hormonu DHT produkują gęsty, lepki łój nasycony DHT, który w ujściu mieszka włosowego miesza się z martwym naskórkiem i zastyga w twardy, żółtawy czop.\n\nTrycholodzy nazywają to zjawisko „cementem łojowo-DHT” (Sebum-Cement) oraz mikro-zwłóknieniem wokół mieszka.\n\nSprawdź to teraz własnymi 2 palcami:\n1. Złap skórę nad uchem — jest miękka, luźna, a włosy są tam grube.\n2. Dotknij skóry w zakolach albo na czubku głowy — jest twarda, napięta i błyszcząca jak wypolerowana.\n\nWiększość mężczyzn myśli, że ten połysk na zakolach oznacza „martwą skórę bez cebulek”.\nTo błąd.\n\nBadania kliniczne pokazują, że pod tą błyszczącą, zaczopowaną warstwą od 70% do 80% Twoich cebulek nadal żyje jeszcze przez 2 do 4 lat. Są po prostu uwięzione pod woskowym czopem nasyconym DHT — nowy włos nie ma siły przebić się na powierzchnię, a żadna droga wcierka ani ampułka za 200 zł nie jest w stanie przeniknąć przez tę zbitą barierę.\n\nZwykły szampon z drogerii ślizga się tylko po powierzchni tego czopa i robi 0 z 3 rzeczy potrzebnych do odblokowania mieszka.\n\nŻeby uwolnić uwięzione pod skórą cebulki, podczas każdego mycia w ciepłej wodzie muszą zadziałać jednocześnie 3 procesy:\n1. Rozpuszczenie woskowego czopa łojowego i odcięcie hormonu DHT w ujściu mieszka (zanim czop stwardnieje na dobre).\n2. Rozszerzenie ściśniętych naczyń krwionośnych pod napiętą skórą czubka głowy, żeby wtłoczyć tlen do uśpionej brodawki.\n3. Dostarczenie korzeniom budulca do wypchnięcia grubego włosa ponad powierzchnię skóry.\n\nSzampon SARDIAN Aktywujący Korzenie został zaprojektowany dokładnie jako codzienny „rozpuszczalnik czopów DHT” i aktywator krążenia w 1 kroku:\n\nPo pierwsze: Rdest wielokwiatowy (Polygonum multiflorum) oraz Biota Orientalis rozbijają nagromadzony w porach hormon DHT i oczyszczają ujście mieszka z woskowego czopa. W badaniach laboratoryjnych ekstrakt z rdestu wielokwiatowego wykazał aktywację fazy wzrostu w 90% badanych mieszków włosowych (w porównaniu do 70% w grupie kontrolnej z minoksydylem).\n\nPo drugie: Korzeń żeń-szenia i naturalny mentol z mięty pieprzowej uderzają w napiętą skórę na czubku głowy i otwierają mikrokrążenie. Już po 60 sekundach masażu pod prysznicem czujesz głębokie, chłodzące mrowienie — to fizyczny dowód, że krew przebija się do ściśniętych cebulek.\n\nPo trzecie: Korzeń lukrecji wygasza mikrostany zapalne wokół zaczopowanego mieszka, powstrzymując jego zwłóknienie.\n\nBadania nad tą kombinacją ekstraktów wykazały 2,6 razy większą przeżywalność komórek brodawki włosa oraz o 62% wyższą aktywność wzrostową cebulek.\n\nI nie musisz wierzyć na słowo:\n- W pierwszych 2 do 3 tygodniach z czubka głowy i zakoli znika tłusty, błyszczący film, a na sitku pod prysznicem zostaje o połowę mniej włosów.\n- Między 4. a 6. tygodniem odblokowane pory zaczynają wypuszczać nowe, krótkie włoski, a te istniejące stają się sztywniejsze u nasady.\n- Po 8 do 12 tygodniach prześwit pod ostrym światłem wyraźnie się zagęszcza.\n\nCałość zajmuje 2 minuty podczas zwykłego prysznica. Bez lepkich wcierek, bez tabletek na receptę rujnujących libido i bez wydawania 17 000 zł na przeszczep.\n\nCo więcej, SARDIAN daje pełną 60-dniową gwarancję zwrotu pieniędzy (a przy bestsellerowym Pakiecie 2+1 otrzymujesz 3. butelkę gratis, darmową dostawę oraz silikonową szczoteczkę do masażu, która mechanicznie pomaga rozbić czopy łojowe pod prysznicem).\n\nPonad 4 700 polskich mężczyzn oceniło już SARDIAN na 4,7 na 5 gwiazdek. Sprawdź dostępność, zanim Twoje uwięzione cebulki zwłóknieją na zawsze:\n\n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie"
  },
  "sardian_nd_b1": {
    "headline": "Spojrzałem na sitko z odpływu pod światło: 8 na 10 moich wypadających włosów miało mniej niż 2 cm",
    "description": "Zresetuj zegar wzrostu włosa z 3 tygodni do 4 lat (60 dni gwarancji)",
    "primaryText": "Pewnego ranka po prysznicu nie wyrzuciłem od razu włosów z sitka do kosza. Położyłem je na białym ręczniku pod światłem w łazience i policzyłem.\n\nByło ich 34. Ale kiedy przyjrzałem się im z bliska, przeszedł mnie dreszcz: aż 26 z nich to nie były moje normalne, 5-centymetrowe włosy. To były krótkie, cieniutkie włoski o długości 1 do 1,5 centymetra.\n\nWypadały moje NOWE włosy, które urosły zaledwie w tym samym miesiącu! Wtedy odkryłem zjawisko „Pułapki 3-Tygodniowego Włosa”.\n\nCzy kiedykolwiek przyjrzałeś się z bliska włosom, które zostają na Twojej dłoni podczas mycia głowy albo na sitku odpływu pod prysznicem?\n\nWiększość facetów myśli, że wypadają im stare, długie włosy.\nAle jeśli spojrzysz pod światło, zobaczysz coś przerażającego: ponad połowa z nich to krótkie, cieniutkie, niemal przezroczyste włoski o długości 1 do 2 centymetrów, ze zwężoną końcówką.\n\nKiedy warszawski trycholog pokazał mi je na ekranie kamery, wytłumaczył mi zjawisko, o którym nie mówi żaden producent drogeryjnych szamponów: „Skrócony Zegar Anagenu” — czyli Pułapkę 3-Tygodniowego Włosa.\n\nPosłuchaj, jak to działa w Twojej skórze głowy:\n\nZdrowy męski włos (taki, jaki masz nad uszami i z tyłu głowy) ma fazę aktywnego wzrostu — tzw. anagen — zaprogramowaną na 3 do 6 lat. Przez ponad 1 000 dni cebulka nieprzerwanie pompuje w niego białko, dzięki czemu włos rośnie długi, ciemny i gruby jak żyłka.\n\nAle w zakolach i na czubku głowy hormon DHT robi z Twoimi cebulkami coś podstępnego.\nNie zabija ich od razu. Zamiast tego oblepia brodawkę włosa i przestawia jej biologiczny zegar wzrostu z 4 lat na zaledwie... 3 do 4 tygodni!\n\nRozumiesz, co to oznacza?\nTwoja cebulka nadal żyje! Nadal produkuje nowy włos! Ale ponieważ jej zegar anagenu jest zatruty przez DHT i odcięty od tlenu, po 21–28 dniach cebulka przedwcześnie wyrzuca ten młody, 1,5-centymetrowy włosek do odpływu pod prysznicem, zanim ten zdąży urosnąć i zagęścić fryzurę.\n\nDlatego masz na głowie od 70% do 80% żywych, pracujących cebulek, a mimo to z każdym miesiącem widzisz w lustrze coraz większy prześwit. Twoje włosy kręcą się w błędnym kole 3-tygodniowego życia.\n\nPrzebadano 92 szampony na wypadanie włosów sprzedawane w Polsce — 96% z nich robi 0 z 3 rzeczy potrzebnych, żeby zresetować ten skrócony zegar anagenu. Zwykły szampon kofeinowy z drogerii nie potrafi wydłużyć fazy wzrostu włosa ani o 1 dzień.\n\nŻeby wyrwać cebulkę z „Pułapki 3-tygodniowego włosa” i przywrócić jej wieloletni cykl wzrostu, podczas mycia musisz uderzyć w 3 punkty naraz:\n1. Zablokować hormon DHT oblepiający brodawkę włosa (żeby przestał przerywać fazę wzrostu po 3 tygodniach).\n2. Wtłoczyć krew i tlen do korzenia (żeby cebulka miała paliwo do utrzymania włosa przez lata).\n3. Wygasić stan zapalny mieszka i wzmocnić zakotwiczenie włosa w skórze.\n\nDokładnie w tym celu powstał Szampon SARDIAN Aktywujący Korzenie — jedyna w Polsce formuła łącząca 3 klinicznie przebadane mechanizmy wydłużania fazy anagenu w 1 myciu:\n\n1. Rdest wielokwiatowy (Polygonum multiflorum) oraz Biota Orientalis blokują DHT bezpośrednio przy brodawce włosa i wydłużają fazę aktywnego wzrostu (anagenu). W badaniach laboratoryjnych rdest wielokwiatowy wprowadził w fazę wzrostu aż 90% badanych mieszków włosowych (wobec 70% dla minoksydylu).\n2. Korzeń żeń-szenia + naturalny mentol z mięty pieprzowej gwałtownie rozszerzają naczynia krwionośne wokół cebulki — czujesz to jako wyraźne, chłodzące mrowienie już po 60 sekundach mycia.\n3. Korzeń lukrecji uspokaja stany zapalne wokół korzenia, dzięki czemu młody włos nie jest przedwcześnie wypychany ze skóry.\n\nW testach laboratoryjnych ta synergia składników wykazała 2,6 razy wyższą przeżywalność komórek brodawki włosa oraz o 62% silniejszą aktywność wzrostową.\n\nKiedy resetujesz zegar anagenu z SARDIAN, proces jest prosty do zaobserwowania:\n- Po 2–3 tygodniach z sitka pod prysznicem znikają krótkie, 1-centymetrowe włoski — bo przestają wypadać przedwcześnie.\n- Po 4–6 tygodniach młode włosy przekraczają barierę 3 tygodni, grubieją u nasady i zaczynają budować realną objętość.\n- Po 8–12 tygodniach zakola i korona głowy wypełniają się ciemnymi, mocnymi włosami, które zostają na głowie zamiast płynąć do kanalizacji.\n\nTo wszystko w 2 minuty pod prysznicem, z pełną 60-dniową gwarancją zwrotu pieniędzy (nawet za zużyte opakowania). Ponad 4 700 Polaków oceniło już SARDIAN na 4,7 na 5 gwiazdek.\n\nZatrzymaj wypadanie młodych włosów, zanim Twoje cebulki wyczerpią swój limit cykli:\n\n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie"
  },
  "sardian_nd_b2": {
    "headline": "Twoje cebulki wciąż produkują nowe włosy — ale hormon DHT wyrzuca je do odpływu po 21 dniach",
    "description": "Zresetuj zegar wzrostu włosa z 3 tygodni do 4 lat (60 dni gwarancji)",
    "primaryText": "Jeśli masz między 30 a 55 lat i widzisz, że Twoje włosy na górze głowy z roku na rok robią się coraz rzadsze, mam dla Ciebie jedną złą i jedną świetną wiadomość.\n\nDobra wiadomość: Twoje cebulki w zakolach i na czubku głowy w 70–80% wciąż żyją i wypuszczają nowe włosy każdego dnia.\n\nZła wiadomość: przez zatruty hormonem DHT „zegar wzrostu” te nowe włosy żyją na Twojej głowie tylko 3 tygodnie zamiast 4 lat i spływają do tego odpływu pod prysznicem, zanim zdążysz je zobaczyć w lustrze.\n\nCzy kiedykolwiek przyjrzałeś się z bliska włosom, które zostają na Twojej dłoni podczas mycia głowy albo na sitku odpływu pod prysznicem?\n\nWiększość facetów myśli, że wypadają im stare, długie włosy.\nAle jeśli spojrzysz pod światło, zobaczysz coś przerażającego: ponad połowa z nich to krótkie, cieniutkie, niemal przezroczyste włoski o długości 1 do 2 centymetrów, ze zwężoną końcówką.\n\nKiedy warszawski trycholog pokazał mi je na ekranie kamery, wytłumaczył mi zjawisko, o którym nie mówi żaden producent drogeryjnych szamponów: „Skrócony Zegar Anagenu” — czyli Pułapkę 3-Tygodniowego Włosa.\n\nPosłuchaj, jak to działa w Twojej skórze głowy:\n\nZdrowy męski włos (taki, jaki masz nad uszami i z tyłu głowy) ma fazę aktywnego wzrostu — tzw. anagen — zaprogramowaną na 3 do 6 lat. Przez ponad 1 000 dni cebulka nieprzerwanie pompuje w niego białko, dzięki czemu włos rośnie długi, ciemny i gruby jak żyłka.\n\nAle w zakolach i na czubku głowy hormon DHT robi z Twoimi cebulkami coś podstępnego.\nNie zabija ich od razu. Zamiast tego oblepia brodawkę włosa i przestawia jej biologiczny zegar wzrostu z 4 lat na zaledwie... 3 do 4 tygodni!\n\nRozumiesz, co to oznacza?\nTwoja cebulka nadal żyje! Nadal produkuje nowy włos! Ale ponieważ jej zegar anagenu jest zatruty przez DHT i odcięty od tlenu, po 21–28 dniach cebulka przedwcześnie wyrzuca ten młody, 1,5-centymetrowy włosek do odpływu pod prysznicem, zanim ten zdąży urosnąć i zagęścić fryzurę.\n\nDlatego masz na głowie od 70% do 80% żywych, pracujących cebulek, a mimo to z każdym miesiącem widzisz w lustrze coraz większy prześwit. Twoje włosy kręcą się w błędnym kole 3-tygodniowego życia.\n\nPrzebadano 92 szampony na wypadanie włosów sprzedawane w Polsce — 96% z nich robi 0 z 3 rzeczy potrzebnych, żeby zresetować ten skrócony zegar anagenu. Zwykły szampon kofeinowy z drogerii nie potrafi wydłużyć fazy wzrostu włosa ani o 1 dzień.\n\nŻeby wyrwać cebulkę z „Pułapki 3-tygodniowego włosa” i przywrócić jej wieloletni cykl wzrostu, podczas mycia musisz uderzyć w 3 punkty naraz:\n1. Zablokować hormon DHT oblepiający brodawkę włosa (żeby przestał przerywać fazę wzrostu po 3 tygodniach).\n2. Wtłoczyć krew i tlen do korzenia (żeby cebulka miała paliwo do utrzymania włosa przez lata).\n3. Wygasić stan zapalny mieszka i wzmocnić zakotwiczenie włosa w skórze.\n\nDokładnie w tym celu powstał Szampon SARDIAN Aktywujący Korzenie — jedyna w Polsce formuła łącząca 3 klinicznie przebadane mechanizmy wydłużania fazy anagenu w 1 myciu:\n\n1. Rdest wielokwiatowy (Polygonum multiflorum) oraz Biota Orientalis blokują DHT bezpośrednio przy brodawce włosa i wydłużają fazę aktywnego wzrostu (anagenu). W badaniach laboratoryjnych rdest wielokwiatowy wprowadził w fazę wzrostu aż 90% badanych mieszków włosowych (wobec 70% dla minoksydylu).\n2. Korzeń żeń-szenia + naturalny mentol z mięty pieprzowej gwałtownie rozszerzają naczynia krwionośne wokół cebulki — czujesz to jako wyraźne, chłodzące mrowienie już po 60 sekundach mycia.\n3. Korzeń lukrecji uspokaja stany zapalne wokół korzenia, dzięki czemu młody włos nie jest przedwcześnie wypychany ze skóry.\n\nW testach laboratoryjnych ta synergia składników wykazała 2,6 razy wyższą przeżywalność komórek brodawki włosa oraz o 62% silniejszą aktywność wzrostową.\n\nKiedy resetujesz zegar anagenu z SARDIAN, proces jest prosty do zaobserwowania:\n- Po 2–3 tygodniach z sitka pod prysznicem znikają krótkie, 1-centymetrowe włoski — bo przestają wypadać przedwcześnie.\n- Po 4–6 tygodniach młode włosy przekraczają barierę 3 tygodni, grubieją u nasady i zaczynają budować realną objętość.\n- Po 8–12 tygodniach zakola i korona głowy wypełniają się ciemnymi, mocnymi włosami, które zostają na głowie zamiast płynąć do kanalizacji.\n\nTo wszystko w 2 minuty pod prysznicem, z pełną 60-dniową gwarancją zwrotu pieniędzy (nawet za zużyte opakowania). Ponad 4 700 Polaków oceniło już SARDIAN na 4,7 na 5 gwiazdek.\n\nZatrzymaj wypadanie młodych włosów, zanim Twoje cebulki wyczerpią swój limit cykli:\n\n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie"
  },
  "sardian_nd_b3": {
    "headline": "Trycholog zapisał mi na kartce 4 składniki, które wydłużają życie włosa z 3 tygodni do lat",
    "description": "Zresetuj zegar wzrostu włosa z 3 tygodni do 4 lat (60 dni gwarancji)",
    "primaryText": "Kiedy poszedłem do trychologa z przekonaniem, że wyłysiałem jak mój ojciec, lekarz pokazał mi na ekranie tysiące krótkich włosków na moim czubku głowy i powiedział:\n— Panie Marku, Pan nie stracił cebulek. Pan stracił długość fazy anagenu. Pana włosy wypadają w 3. tygodniu życia, zamiast rosnąć przez 4 lata.\n\nWziął długopis i zapisał mi na tej kartce dokładną nazwę szamponu oraz 3 składniki botaniczne, które resetują zegar wzrostu w uśpionych mieszkach.\n\nCzy kiedykolwiek przyjrzałeś się z bliska włosom, które zostają na Twojej dłoni podczas mycia głowy albo na sitku odpływu pod prysznicem?\n\nWiększość facetów myśli, że wypadają im stare, długie włosy.\nAle jeśli spojrzysz pod światło, zobaczysz coś przerażającego: ponad połowa z nich to krótkie, cieniutkie, niemal przezroczyste włoski o długości 1 do 2 centymetrów, ze zwężoną końcówką.\n\nKiedy warszawski trycholog pokazał mi je na ekranie kamery, wytłumaczył mi zjawisko, o którym nie mówi żaden producent drogeryjnych szamponów: „Skrócony Zegar Anagenu” — czyli Pułapkę 3-Tygodniowego Włosa.\n\nPosłuchaj, jak to działa w Twojej skórze głowy:\n\nZdrowy męski włos (taki, jaki masz nad uszami i z tyłu głowy) ma fazę aktywnego wzrostu — tzw. anagen — zaprogramowaną na 3 do 6 lat. Przez ponad 1 000 dni cebulka nieprzerwanie pompuje w niego białko, dzięki czemu włos rośnie długi, ciemny i gruby jak żyłka.\n\nAle w zakolach i na czubku głowy hormon DHT robi z Twoimi cebulkami coś podstępnego.\nNie zabija ich od razu. Zamiast tego oblepia brodawkę włosa i przestawia jej biologiczny zegar wzrostu z 4 lat na zaledwie... 3 do 4 tygodni!\n\nRozumiesz, co to oznacza?\nTwoja cebulka nadal żyje! Nadal produkuje nowy włos! Ale ponieważ jej zegar anagenu jest zatruty przez DHT i odcięty od tlenu, po 21–28 dniach cebulka przedwcześnie wyrzuca ten młody, 1,5-centymetrowy włosek do odpływu pod prysznicem, zanim ten zdąży urosnąć i zagęścić fryzurę.\n\nDlatego masz na głowie od 70% do 80% żywych, pracujących cebulek, a mimo to z każdym miesiącem widzisz w lustrze coraz większy prześwit. Twoje włosy kręcą się w błędnym kole 3-tygodniowego życia.\n\nPrzebadano 92 szampony na wypadanie włosów sprzedawane w Polsce — 96% z nich robi 0 z 3 rzeczy potrzebnych, żeby zresetować ten skrócony zegar anagenu. Zwykły szampon kofeinowy z drogerii nie potrafi wydłużyć fazy wzrostu włosa ani o 1 dzień.\n\nŻeby wyrwać cebulkę z „Pułapki 3-tygodniowego włosa” i przywrócić jej wieloletni cykl wzrostu, podczas mycia musisz uderzyć w 3 punkty naraz:\n1. Zablokować hormon DHT oblepiający brodawkę włosa (żeby przestał przerywać fazę wzrostu po 3 tygodniach).\n2. Wtłoczyć krew i tlen do korzenia (żeby cebulka miała paliwo do utrzymania włosa przez lata).\n3. Wygasić stan zapalny mieszka i wzmocnić zakotwiczenie włosa w skórze.\n\nDokładnie w tym celu powstał Szampon SARDIAN Aktywujący Korzenie — jedyna w Polsce formuła łącząca 3 klinicznie przebadane mechanizmy wydłużania fazy anagenu w 1 myciu:\n\n1. Rdest wielokwiatowy (Polygonum multiflorum) oraz Biota Orientalis blokują DHT bezpośrednio przy brodawce włosa i wydłużają fazę aktywnego wzrostu (anagenu). W badaniach laboratoryjnych rdest wielokwiatowy wprowadził w fazę wzrostu aż 90% badanych mieszków włosowych (wobec 70% dla minoksydylu).\n2. Korzeń żeń-szenia + naturalny mentol z mięty pieprzowej gwałtownie rozszerzają naczynia krwionośne wokół cebulki — czujesz to jako wyraźne, chłodzące mrowienie już po 60 sekundach mycia.\n3. Korzeń lukrecji uspokaja stany zapalne wokół korzenia, dzięki czemu młody włos nie jest przedwcześnie wypychany ze skóry.\n\nW testach laboratoryjnych ta synergia składników wykazała 2,6 razy wyższą przeżywalność komórek brodawki włosa oraz o 62% silniejszą aktywność wzrostową.\n\nKiedy resetujesz zegar anagenu z SARDIAN, proces jest prosty do zaobserwowania:\n- Po 2–3 tygodniach z sitka pod prysznicem znikają krótkie, 1-centymetrowe włoski — bo przestają wypadać przedwcześnie.\n- Po 4–6 tygodniach młode włosy przekraczają barierę 3 tygodni, grubieją u nasady i zaczynają budować realną objętość.\n- Po 8–12 tygodniach zakola i korona głowy wypełniają się ciemnymi, mocnymi włosami, które zostają na głowie zamiast płynąć do kanalizacji.\n\nTo wszystko w 2 minuty pod prysznicem, z pełną 60-dniową gwarancją zwrotu pieniędzy (nawet za zużyte opakowania). Ponad 4 700 Polaków oceniło już SARDIAN na 4,7 na 5 gwiazdek.\n\nZatrzymaj wypadanie młodych włosów, zanim Twoje cebulki wyczerpią swój limit cykli:\n\n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie"
  },
  "sardian_nd_b4": {
    "headline": "Fryzjer rozgarnął moje włosy grzebieniem pod lampą: „Zobacz, ile masz tu krótkich włosków, które nie mogą urosnąć”",
    "description": "Zresetuj zegar wzrostu włosa z 3 tygodni do 4 lat (60 dni gwarancji)",
    "primaryText": "Podczas ostatniej wizyty w salonie mój fryzjer rozgarnął grzebieniem moje przerzedzone włosy na koronie głowy, przystawił lusterko i powiedział:\n— Przyjrzyj się uważnie pod światło. Widzisz ten gęsty dywanik króciutkich, 1-centymetrowych włosków między długimi włosami?\n\nByły ich tam setki! Zapytałem w szoku, dlaczego w takim razie moja fryzura prześwituje, skoro mam tyle nowych włosów. Wtedy wskazał na czarną butelkę szamponu SARDIAN stojącą na myjce.\n\nCzy kiedykolwiek przyjrzałeś się z bliska włosom, które zostają na Twojej dłoni podczas mycia głowy albo na sitku odpływu pod prysznicem?\n\nWiększość facetów myśli, że wypadają im stare, długie włosy.\nAle jeśli spojrzysz pod światło, zobaczysz coś przerażającego: ponad połowa z nich to krótkie, cieniutkie, niemal przezroczyste włoski o długości 1 do 2 centymetrów, ze zwężoną końcówką.\n\nKiedy warszawski trycholog pokazał mi je na ekranie kamery, wytłumaczył mi zjawisko, o którym nie mówi żaden producent drogeryjnych szamponów: „Skrócony Zegar Anagenu” — czyli Pułapkę 3-Tygodniowego Włosa.\n\nPosłuchaj, jak to działa w Twojej skórze głowy:\n\nZdrowy męski włos (taki, jaki masz nad uszami i z tyłu głowy) ma fazę aktywnego wzrostu — tzw. anagen — zaprogramowaną na 3 do 6 lat. Przez ponad 1 000 dni cebulka nieprzerwanie pompuje w niego białko, dzięki czemu włos rośnie długi, ciemny i gruby jak żyłka.\n\nAle w zakolach i na czubku głowy hormon DHT robi z Twoimi cebulkami coś podstępnego.\nNie zabija ich od razu. Zamiast tego oblepia brodawkę włosa i przestawia jej biologiczny zegar wzrostu z 4 lat na zaledwie... 3 do 4 tygodni!\n\nRozumiesz, co to oznacza?\nTwoja cebulka nadal żyje! Nadal produkuje nowy włos! Ale ponieważ jej zegar anagenu jest zatruty przez DHT i odcięty od tlenu, po 21–28 dniach cebulka przedwcześnie wyrzuca ten młody, 1,5-centymetrowy włosek do odpływu pod prysznicem, zanim ten zdąży urosnąć i zagęścić fryzurę.\n\nDlatego masz na głowie od 70% do 80% żywych, pracujących cebulek, a mimo to z każdym miesiącem widzisz w lustrze coraz większy prześwit. Twoje włosy kręcą się w błędnym kole 3-tygodniowego życia.\n\nPrzebadano 92 szampony na wypadanie włosów sprzedawane w Polsce — 96% z nich robi 0 z 3 rzeczy potrzebnych, żeby zresetować ten skrócony zegar anagenu. Zwykły szampon kofeinowy z drogerii nie potrafi wydłużyć fazy wzrostu włosa ani o 1 dzień.\n\nŻeby wyrwać cebulkę z „Pułapki 3-tygodniowego włosa” i przywrócić jej wieloletni cykl wzrostu, podczas mycia musisz uderzyć w 3 punkty naraz:\n1. Zablokować hormon DHT oblepiający brodawkę włosa (żeby przestał przerywać fazę wzrostu po 3 tygodniach).\n2. Wtłoczyć krew i tlen do korzenia (żeby cebulka miała paliwo do utrzymania włosa przez lata).\n3. Wygasić stan zapalny mieszka i wzmocnić zakotwiczenie włosa w skórze.\n\nDokładnie w tym celu powstał Szampon SARDIAN Aktywujący Korzenie — jedyna w Polsce formuła łącząca 3 klinicznie przebadane mechanizmy wydłużania fazy anagenu w 1 myciu:\n\n1. Rdest wielokwiatowy (Polygonum multiflorum) oraz Biota Orientalis blokują DHT bezpośrednio przy brodawce włosa i wydłużają fazę aktywnego wzrostu (anagenu). W badaniach laboratoryjnych rdest wielokwiatowy wprowadził w fazę wzrostu aż 90% badanych mieszków włosowych (wobec 70% dla minoksydylu).\n2. Korzeń żeń-szenia + naturalny mentol z mięty pieprzowej gwałtownie rozszerzają naczynia krwionośne wokół cebulki — czujesz to jako wyraźne, chłodzące mrowienie już po 60 sekundach mycia.\n3. Korzeń lukrecji uspokaja stany zapalne wokół korzenia, dzięki czemu młody włos nie jest przedwcześnie wypychany ze skóry.\n\nW testach laboratoryjnych ta synergia składników wykazała 2,6 razy wyższą przeżywalność komórek brodawki włosa oraz o 62% silniejszą aktywność wzrostową.\n\nKiedy resetujesz zegar anagenu z SARDIAN, proces jest prosty do zaobserwowania:\n- Po 2–3 tygodniach z sitka pod prysznicem znikają krótkie, 1-centymetrowe włoski — bo przestają wypadać przedwcześnie.\n- Po 4–6 tygodniach młode włosy przekraczają barierę 3 tygodni, grubieją u nasady i zaczynają budować realną objętość.\n- Po 8–12 tygodniach zakola i korona głowy wypełniają się ciemnymi, mocnymi włosami, które zostają na głowie zamiast płynąć do kanalizacji.\n\nTo wszystko w 2 minuty pod prysznicem, z pełną 60-dniową gwarancją zwrotu pieniędzy (nawet za zużyte opakowania). Ponad 4 700 Polaków oceniło już SARDIAN na 4,7 na 5 gwiazdek.\n\nZatrzymaj wypadanie młodych włosów, zanim Twoje cebulki wyczerpią swój limit cykli:\n\n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie"
  },
  "sardian_nd_b5": {
    "headline": "Zauważyłam na poduszce mojego 42-letniego męża dziesiątki króciutkich, 1-centymetrowych włosków",
    "description": "Zresetuj zegar wzrostu włosa z 3 tygodni do 4 lat (60 dni gwarancji)",
    "primaryText": "Kiedy zmieniałam pościel w naszej sypialni, zauważyłam na poduszce mojego 42-letniego męża coś dziwnego.\n\nMój mąż nosi włosy o długości około 6 centymetrów. Ale włoski, które codziennie zostawały na jego poduszce i w odpływie pod prysznicem, miały zaledwie 1 do 2 centymetrów długości i były cienkie jak pajęczyna.\n\nZaczęłam szukać przyczyny u trychologów i odkryłam coś, o czym nie miał pojęcia ani mój mąż, ani ja — jego nowe włosy wypadały już po 3 tygodniach od wyrośnięcia! Postawiłam tę czarną butelkę pod jego prysznicem.\n\nCzy kiedykolwiek przyjrzałeś się z bliska włosom, które zostają na Twojej dłoni podczas mycia głowy albo na sitku odpływu pod prysznicem?\n\nWiększość facetów myśli, że wypadają im stare, długie włosy.\nAle jeśli spojrzysz pod światło, zobaczysz coś przerażającego: ponad połowa z nich to krótkie, cieniutkie, niemal przezroczyste włoski o długości 1 do 2 centymetrów, ze zwężoną końcówką.\n\nKiedy warszawski trycholog pokazał mi je na ekranie kamery, wytłumaczył mi zjawisko, o którym nie mówi żaden producent drogeryjnych szamponów: „Skrócony Zegar Anagenu” — czyli Pułapkę 3-Tygodniowego Włosa.\n\nPosłuchaj, jak to działa w Twojej skórze głowy:\n\nZdrowy męski włos (taki, jaki masz nad uszami i z tyłu głowy) ma fazę aktywnego wzrostu — tzw. anagen — zaprogramowaną na 3 do 6 lat. Przez ponad 1 000 dni cebulka nieprzerwanie pompuje w niego białko, dzięki czemu włos rośnie długi, ciemny i gruby jak żyłka.\n\nAle w zakolach i na czubku głowy hormon DHT robi z Twoimi cebulkami coś podstępnego.\nNie zabija ich od razu. Zamiast tego oblepia brodawkę włosa i przestawia jej biologiczny zegar wzrostu z 4 lat na zaledwie... 3 do 4 tygodni!\n\nRozumiesz, co to oznacza?\nTwoja cebulka nadal żyje! Nadal produkuje nowy włos! Ale ponieważ jej zegar anagenu jest zatruty przez DHT i odcięty od tlenu, po 21–28 dniach cebulka przedwcześnie wyrzuca ten młody, 1,5-centymetrowy włosek do odpływu pod prysznicem, zanim ten zdąży urosnąć i zagęścić fryzurę.\n\nDlatego masz na głowie od 70% do 80% żywych, pracujących cebulek, a mimo to z każdym miesiącem widzisz w lustrze coraz większy prześwit. Twoje włosy kręcą się w błędnym kole 3-tygodniowego życia.\n\nPrzebadano 92 szampony na wypadanie włosów sprzedawane w Polsce — 96% z nich robi 0 z 3 rzeczy potrzebnych, żeby zresetować ten skrócony zegar anagenu. Zwykły szampon kofeinowy z drogerii nie potrafi wydłużyć fazy wzrostu włosa ani o 1 dzień.\n\nŻeby wyrwać cebulkę z „Pułapki 3-tygodniowego włosa” i przywrócić jej wieloletni cykl wzrostu, podczas mycia musisz uderzyć w 3 punkty naraz:\n1. Zablokować hormon DHT oblepiający brodawkę włosa (żeby przestał przerywać fazę wzrostu po 3 tygodniach).\n2. Wtłoczyć krew i tlen do korzenia (żeby cebulka miała paliwo do utrzymania włosa przez lata).\n3. Wygasić stan zapalny mieszka i wzmocnić zakotwiczenie włosa w skórze.\n\nDokładnie w tym celu powstał Szampon SARDIAN Aktywujący Korzenie — jedyna w Polsce formuła łącząca 3 klinicznie przebadane mechanizmy wydłużania fazy anagenu w 1 myciu:\n\n1. Rdest wielokwiatowy (Polygonum multiflorum) oraz Biota Orientalis blokują DHT bezpośrednio przy brodawce włosa i wydłużają fazę aktywnego wzrostu (anagenu). W badaniach laboratoryjnych rdest wielokwiatowy wprowadził w fazę wzrostu aż 90% badanych mieszków włosowych (wobec 70% dla minoksydylu).\n2. Korzeń żeń-szenia + naturalny mentol z mięty pieprzowej gwałtownie rozszerzają naczynia krwionośne wokół cebulki — czujesz to jako wyraźne, chłodzące mrowienie już po 60 sekundach mycia.\n3. Korzeń lukrecji uspokaja stany zapalne wokół korzenia, dzięki czemu młody włos nie jest przedwcześnie wypychany ze skóry.\n\nW testach laboratoryjnych ta synergia składników wykazała 2,6 razy wyższą przeżywalność komórek brodawki włosa oraz o 62% silniejszą aktywność wzrostową.\n\nKiedy resetujesz zegar anagenu z SARDIAN, proces jest prosty do zaobserwowania:\n- Po 2–3 tygodniach z sitka pod prysznicem znikają krótkie, 1-centymetrowe włoski — bo przestają wypadać przedwcześnie.\n- Po 4–6 tygodniach młode włosy przekraczają barierę 3 tygodni, grubieją u nasady i zaczynają budować realną objętość.\n- Po 8–12 tygodniach zakola i korona głowy wypełniają się ciemnymi, mocnymi włosami, które zostają na głowie zamiast płynąć do kanalizacji.\n\nTo wszystko w 2 minuty pod prysznicem, z pełną 60-dniową gwarancją zwrotu pieniędzy (nawet za zużyte opakowania). Ponad 4 700 Polaków oceniło już SARDIAN na 4,7 na 5 gwiazdek.\n\nZatrzymaj wypadanie młodych włosów, zanim Twoje cebulki wyczerpią swój limit cykli:\n\n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie"
  },
  "sardian_nd_c1": {
    "headline": "Myjesz głowę codziennie, żeby ratować włosy? Po 4 godzinach szampon z SLS podwaja wyrzut DHT do cebulek",
    "description": "Przerwij Efekt Odbicia DHT — formuła 3 z 3 bez SLS (60 dni gwarancji)",
    "primaryText": "Przez 3 lata robiłem dokładnie to, co robi 90% polskich facetów, którym zaczynają przerzedzać się włosy: kupowałem w drogerii i aptece kolejne „szampony przeciw wypadaniu” z kofeiną i myłem nimi głowę codziennie rano.\n\nEfekt? O 8:00 rano włosy były puszyste. O 14:00 w pracy były już przetłuszczone, przyklapnięte do skóry, a zakola cofały się z każdym miesiącem szybciej niż u kolegów, którzy myli głowę samą wodą.\n\nDopiero kiedy wyrzuciłem drogeryjną butelkę do kosza i poznałem zjawisko „Efektu Odbicia DHT”, zrozumiałem, że sam co rano pompowałem hormon łysienia do własnych cebulek.\n\nCzy zauważyłeś ten dziwny paradoks? Im bardziej przejmujesz się wypadaniem włosów i im częściej myjesz głowę „specjalnymi” szamponami z drogerii lub apteki za 35–50 zł, tym szybciej Twoje włosy na czubku głowy robią się cienkie, oklapnięte, a zakola cofają się jeszcze mocniej.\n\nTo nie jest przypadek ani Twoja wyobraźnia.\nTrycholodzy nazywają ten mechanizm „Efektem Odbicia Łojowo-DHT” (Rebound Sebum + DHT).\n\nKiedy przeanalizowano składy 92 najpopularniejszych szamponów przeciw wypadaniu włosów sprzedawanych w polskich drogeriach i aptekach, okazało się, że aż 96% z nich opiera się na agresywnych, tanich detergentach siarczanowych (SLS / SLES) z symboliczną kropelką kofeiny lub biotyny dla marketingu na etykiecie.\n\nZobacz, co dzieje się na Twojej głowie w ciągu 4 godzin po umyciu włosów takim szamponem:\n\n1. W 30 sekund pod prysznicem agresywny SLS zdziera ze skóry głowy naturalną warstwę ochronną do gołego naskórka. Tuż po wytarciu ręcznikiem włosy wydają się „czyste i puszyste”.\n2. Ale po 60 minutach przesuszona skóra głowy wpada w biologiczny alarm.\n3. Żeby się ratować, gruczoły łojowe uruchamiają „Efekt Odbicia” (Rebound) — w ciągu kolejnych 3–4 godzin pompują prosto do Twoich mieszków włosowych 2 razy więcej łoju niż normalnie!\n4. A co znajduje się w męskim łoju na czubku głowy i w zakolach? Najwyższe stężenie hormonu DHT — głównego zabójcy męskich cebulek włosowych!\n\nRozumiesz tę pułapkę?\nZa każdym razem, gdy myjesz głowę zwykłym szamponem z SLS, sam prowokujesz swoją skórę do zalania uśpionych cebulek podwójną falą hormonu DHT już kilka godzin po prysznicu! Dlatego o godzinie 14:00 Twoje włosy na górze są znowu przyklapnięte, a cebulki kurczą się z każdym tygodniem.\n\nDobra wiadomość jest taka, że dopóki mieszek włosowy nie uległ całkowitej atrofii, od 70% do 80% Twoich cebulek w prześwitach wciąż żyje. Musisz tylko przerwać błędne koło „Efektu Odbicia DHT” i dać cebulkom wszystkie 3 rzeczy, których potrzebują:\n\n1. Zablokować hormon DHT w mieszku bez zdzierania bariery ochronnej skóry.\n2. Pobudzić głębokie mikrokrążenie krwi i tlenu w korzeniach.\n3. Wygasić podrażnienie gruczołów łojowych i odżywić brodawkę włosa.\n\nDokładnie tak działa Szampon SARDIAN Aktywujący Korzenie — formuła bez agresywnego efektu odbicia, która zastępuje drogeryjną chemię 4 skoncentrowanymi ekstraktami botanicznymi:\n\nPo pierwsze: Rdest wielokwiatowy (Polygonum multiflorum) oraz Biota Orientalis neutralizują DHT bezpośrednio w ujściu mieszka i regulują pracę gruczołów łojowych. W badaniach laboratoryjnych rdest wielokwiatowy aktywował fazę wzrostu w 90% badanych mieszków włosowych (w porównaniu do 70% dla minoksydylu).\n\nPo drugie: Korzeń żeń-szenia i naturalny mentol z mięty pieprzowej otwierają naczynia włosowate pod skórą głowy — już po 60 sekundach mycia czujesz przyjemne, chłodzące mrowienie, które dotlenia uśpione cebulki.\n\nPo trzecie: Korzeń lukrecji łagodzi podrażnioną skórę głowy i przerywa paniczny wyrzut łoju po myciu, a dane laboratoryjne potwierdzają 2,6 razy większą przeżywalność komórek brodawki włosa oraz o 62% wyższą aktywność wzrostową.\n\nEfekt odstawienia szamponów z SLS i przejścia na SARDIAN poczujesz od pierwszego tygodnia:\n- Włosy przestają oklapywać po kilku godzinach od mycia, a po 2–3 tygodniach na sitku pod prysznicem zostaje ułamek dawnej liczby włosów.\n- Po 4–6 tygodniach odciążone od ciągłych wyrzutów DHT cebulki wypuszczają nowe, sztywne odrosty.\n- Po 8–12 tygodniach linia włosów i czubek głowy odzyskują zdrową gęstość, bez śladu podrażnień.\n\nNie ryzykujesz ani grosza: masz pełne 60 dni gwarancji zwrotu pieniędzy (testujesz przez 2 miesiące albo odzyskujesz 100% wpłaty). Ponad 4 700 polskich mężczyzn oceniło już SARDIAN na 4,7 na 5 gwiazdek.\n\nPrzerwij Efekt Odbicia DHT już przy następnym myciu głowy:\n\n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie"
  },
  "sardian_nd_c2": {
    "headline": "Sprawdź tył swojego szamponu pod prysznicem: jeśli ma SLS na 2. miejscu, sam przyspieszasz zakola",
    "description": "Przerwij Efekt Odbicia DHT — formuła 3 z 3 bez SLS (60 dni gwarancji)",
    "primaryText": "Idź teraz do łazienki, odwróć swój szampon „na wypadanie włosów” lub „przeciwłupieżowy” i przeczytaj 2. składnik po wodzie (Aqua).\n\nJeśli widzisz tam napis Sodium Laureth Sulfate (SLES) albo Sodium Lauryl Sulfate (SLS), trzymasz w ręku główny powód, przez który Twoje cebulki na czubku głowy kurczą się w podwójnym tempie.\n\nPrzebadano 92 szampony dla mężczyzn w Polsce — aż 96% z nich wywołuje na skórze głowy tzw. Efekt Odbicia Łojowo-DHT już w 4 godziny po wytarciu głowy ręcznikiem.\n\nCzy zauważyłeś ten dziwny paradoks? Im bardziej przejmujesz się wypadaniem włosów i im częściej myjesz głowę „specjalnymi” szamponami z drogerii lub apteki za 35–50 zł, tym szybciej Twoje włosy na czubku głowy robią się cienkie, oklapnięte, a zakola cofają się jeszcze mocniej.\n\nTo nie jest przypadek ani Twoja wyobraźnia.\nTrycholodzy nazywają ten mechanizm „Efektem Odbicia Łojowo-DHT” (Rebound Sebum + DHT).\n\nKiedy przeanalizowano składy 92 najpopularniejszych szamponów przeciw wypadaniu włosów sprzedawanych w polskich drogeriach i aptekach, okazało się, że aż 96% z nich opiera się na agresywnych, tanich detergentach siarczanowych (SLS / SLES) z symboliczną kropelką kofeiny lub biotyny dla marketingu na etykiecie.\n\nZobacz, co dzieje się na Twojej głowie w ciągu 4 godzin po umyciu włosów takim szamponem:\n\n1. W 30 sekund pod prysznicem agresywny SLS zdziera ze skóry głowy naturalną warstwę ochronną do gołego naskórka. Tuż po wytarciu ręcznikiem włosy wydają się „czyste i puszyste”.\n2. Ale po 60 minutach przesuszona skóra głowy wpada w biologiczny alarm.\n3. Żeby się ratować, gruczoły łojowe uruchamiają „Efekt Odbicia” (Rebound) — w ciągu kolejnych 3–4 godzin pompują prosto do Twoich mieszków włosowych 2 razy więcej łoju niż normalnie!\n4. A co znajduje się w męskim łoju na czubku głowy i w zakolach? Najwyższe stężenie hormonu DHT — głównego zabójcy męskich cebulek włosowych!\n\nRozumiesz tę pułapkę?\nZa każdym razem, gdy myjesz głowę zwykłym szamponem z SLS, sam prowokujesz swoją skórę do zalania uśpionych cebulek podwójną falą hormonu DHT już kilka godzin po prysznicu! Dlatego o godzinie 14:00 Twoje włosy na górze są znowu przyklapnięte, a cebulki kurczą się z każdym tygodniem.\n\nDobra wiadomość jest taka, że dopóki mieszek włosowy nie uległ całkowitej atrofii, od 70% do 80% Twoich cebulek w prześwitach wciąż żyje. Musisz tylko przerwać błędne koło „Efektu Odbicia DHT” i dać cebulkom wszystkie 3 rzeczy, których potrzebują:\n\n1. Zablokować hormon DHT w mieszku bez zdzierania bariery ochronnej skóry.\n2. Pobudzić głębokie mikrokrążenie krwi i tlenu w korzeniach.\n3. Wygasić podrażnienie gruczołów łojowych i odżywić brodawkę włosa.\n\nDokładnie tak działa Szampon SARDIAN Aktywujący Korzenie — formuła bez agresywnego efektu odbicia, która zastępuje drogeryjną chemię 4 skoncentrowanymi ekstraktami botanicznymi:\n\nPo pierwsze: Rdest wielokwiatowy (Polygonum multiflorum) oraz Biota Orientalis neutralizują DHT bezpośrednio w ujściu mieszka i regulują pracę gruczołów łojowych. W badaniach laboratoryjnych rdest wielokwiatowy aktywował fazę wzrostu w 90% badanych mieszków włosowych (w porównaniu do 70% dla minoksydylu).\n\nPo drugie: Korzeń żeń-szenia i naturalny mentol z mięty pieprzowej otwierają naczynia włosowate pod skórą głowy — już po 60 sekundach mycia czujesz przyjemne, chłodzące mrowienie, które dotlenia uśpione cebulki.\n\nPo trzecie: Korzeń lukrecji łagodzi podrażnioną skórę głowy i przerywa paniczny wyrzut łoju po myciu, a dane laboratoryjne potwierdzają 2,6 razy większą przeżywalność komórek brodawki włosa oraz o 62% wyższą aktywność wzrostową.\n\nEfekt odstawienia szamponów z SLS i przejścia na SARDIAN poczujesz od pierwszego tygodnia:\n- Włosy przestają oklapywać po kilku godzinach od mycia, a po 2–3 tygodniach na sitku pod prysznicem zostaje ułamek dawnej liczby włosów.\n- Po 4–6 tygodniach odciążone od ciągłych wyrzutów DHT cebulki wypuszczają nowe, sztywne odrosty.\n- Po 8–12 tygodniach linia włosów i czubek głowy odzyskują zdrową gęstość, bez śladu podrażnień.\n\nNie ryzykujesz ani grosza: masz pełne 60 dni gwarancji zwrotu pieniędzy (testujesz przez 2 miesiące albo odzyskujesz 100% wpłaty). Ponad 4 700 polskich mężczyzn oceniło już SARDIAN na 4,7 na 5 gwiazdek.\n\nPrzerwij Efekt Odbicia DHT już przy następnym myciu głowy:\n\n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie"
  },
  "sardian_nd_c3": {
    "headline": "Myjesz głowę o 7:00 rano, a o 14:00 włosy na czubku są już oklapnięte i prześwitują? To Efekt Odbicia DHT",
    "description": "Przerwij Efekt Odbicia DHT — formuła 3 z 3 bez SLS (60 dni gwarancji)",
    "primaryText": "Znasz to uczucie, kiedy rano o 7:00 po umyciu i wysuszeniu głowy Twoje włosy wyglądają całkiem nieźle, ale kiedy o 14:00 w biurze spojrzysz w lustro w toalecie, góra jest płaska, tłusta i widać pod nią gołą skórę?\n\nMyślałem, że mam po prostu „tłustą cerę” i muszę myć głowę jeszcze mocniejszym szamponem z apteki.\n\nNie wiedziałem, że to paniczna reakcja mojej skóry na siarczany SLS — i że ten południowy łój na czubku głowy to czysty koncentrat hormonu DHT, który dusił moje żywe cebulki.\n\nCzy zauważyłeś ten dziwny paradoks? Im bardziej przejmujesz się wypadaniem włosów i im częściej myjesz głowę „specjalnymi” szamponami z drogerii lub apteki za 35–50 zł, tym szybciej Twoje włosy na czubku głowy robią się cienkie, oklapnięte, a zakola cofają się jeszcze mocniej.\n\nTo nie jest przypadek ani Twoja wyobraźnia.\nTrycholodzy nazywają ten mechanizm „Efektem Odbicia Łojowo-DHT” (Rebound Sebum + DHT).\n\nKiedy przeanalizowano składy 92 najpopularniejszych szamponów przeciw wypadaniu włosów sprzedawanych w polskich drogeriach i aptekach, okazało się, że aż 96% z nich opiera się na agresywnych, tanich detergentach siarczanowych (SLS / SLES) z symboliczną kropelką kofeiny lub biotyny dla marketingu na etykiecie.\n\nZobacz, co dzieje się na Twojej głowie w ciągu 4 godzin po umyciu włosów takim szamponem:\n\n1. W 30 sekund pod prysznicem agresywny SLS zdziera ze skóry głowy naturalną warstwę ochronną do gołego naskórka. Tuż po wytarciu ręcznikiem włosy wydają się „czyste i puszyste”.\n2. Ale po 60 minutach przesuszona skóra głowy wpada w biologiczny alarm.\n3. Żeby się ratować, gruczoły łojowe uruchamiają „Efekt Odbicia” (Rebound) — w ciągu kolejnych 3–4 godzin pompują prosto do Twoich mieszków włosowych 2 razy więcej łoju niż normalnie!\n4. A co znajduje się w męskim łoju na czubku głowy i w zakolach? Najwyższe stężenie hormonu DHT — głównego zabójcy męskich cebulek włosowych!\n\nRozumiesz tę pułapkę?\nZa każdym razem, gdy myjesz głowę zwykłym szamponem z SLS, sam prowokujesz swoją skórę do zalania uśpionych cebulek podwójną falą hormonu DHT już kilka godzin po prysznicu! Dlatego o godzinie 14:00 Twoje włosy na górze są znowu przyklapnięte, a cebulki kurczą się z każdym tygodniem.\n\nDobra wiadomość jest taka, że dopóki mieszek włosowy nie uległ całkowitej atrofii, od 70% do 80% Twoich cebulek w prześwitach wciąż żyje. Musisz tylko przerwać błędne koło „Efektu Odbicia DHT” i dać cebulkom wszystkie 3 rzeczy, których potrzebują:\n\n1. Zablokować hormon DHT w mieszku bez zdzierania bariery ochronnej skóry.\n2. Pobudzić głębokie mikrokrążenie krwi i tlenu w korzeniach.\n3. Wygasić podrażnienie gruczołów łojowych i odżywić brodawkę włosa.\n\nDokładnie tak działa Szampon SARDIAN Aktywujący Korzenie — formuła bez agresywnego efektu odbicia, która zastępuje drogeryjną chemię 4 skoncentrowanymi ekstraktami botanicznymi:\n\nPo pierwsze: Rdest wielokwiatowy (Polygonum multiflorum) oraz Biota Orientalis neutralizują DHT bezpośrednio w ujściu mieszka i regulują pracę gruczołów łojowych. W badaniach laboratoryjnych rdest wielokwiatowy aktywował fazę wzrostu w 90% badanych mieszków włosowych (w porównaniu do 70% dla minoksydylu).\n\nPo drugie: Korzeń żeń-szenia i naturalny mentol z mięty pieprzowej otwierają naczynia włosowate pod skórą głowy — już po 60 sekundach mycia czujesz przyjemne, chłodzące mrowienie, które dotlenia uśpione cebulki.\n\nPo trzecie: Korzeń lukrecji łagodzi podrażnioną skórę głowy i przerywa paniczny wyrzut łoju po myciu, a dane laboratoryjne potwierdzają 2,6 razy większą przeżywalność komórek brodawki włosa oraz o 62% wyższą aktywność wzrostową.\n\nEfekt odstawienia szamponów z SLS i przejścia na SARDIAN poczujesz od pierwszego tygodnia:\n- Włosy przestają oklapywać po kilku godzinach od mycia, a po 2–3 tygodniach na sitku pod prysznicem zostaje ułamek dawnej liczby włosów.\n- Po 4–6 tygodniach odciążone od ciągłych wyrzutów DHT cebulki wypuszczają nowe, sztywne odrosty.\n- Po 8–12 tygodniach linia włosów i czubek głowy odzyskują zdrową gęstość, bez śladu podrażnień.\n\nNie ryzykujesz ani grosza: masz pełne 60 dni gwarancji zwrotu pieniędzy (testujesz przez 2 miesiące albo odzyskujesz 100% wpłaty). Ponad 4 700 polskich mężczyzn oceniło już SARDIAN na 4,7 na 5 gwiazdek.\n\nPrzerwij Efekt Odbicia DHT już przy następnym myciu głowy:\n\n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie"
  },
  "sardian_nd_c4": {
    "headline": "Wyrzuciłem 4 drogeryjne szampony z SLS i zrobiłem 90-dniowy detoks cebulek tym pakietem",
    "description": "Przerwij Efekt Odbicia DHT — formuła 3 z 3 bez SLS (60 dni gwarancji)",
    "primaryText": "Kiedy odebrałem z Paczkomatu tę paczkę z 3 czarnymi butelkami szamponu SARDIAN, pierwszą rzeczą, jaką zrobiłem po wejściu do łazienki, było wyrzucenie do kosza 4 napoczętych szamponów z drogerii i apteki.\n\nMam 44 lata i przez ostatnie 5 lat sam nieświadomie niszczyłem swoje mieszki włosowe codziennym „Efektem Odbicia DHT”. Zobacz, dlaczego odstawienie tanich detergentów na 90 dni całkowicie zmieniło moje zakola.\n\nCzy zauważyłeś ten dziwny paradoks? Im bardziej przejmujesz się wypadaniem włosów i im częściej myjesz głowę „specjalnymi” szamponami z drogerii lub apteki za 35–50 zł, tym szybciej Twoje włosy na czubku głowy robią się cienkie, oklapnięte, a zakola cofają się jeszcze mocniej.\n\nTo nie jest przypadek ani Twoja wyobraźnia.\nTrycholodzy nazywają ten mechanizm „Efektem Odbicia Łojowo-DHT” (Rebound Sebum + DHT).\n\nKiedy przeanalizowano składy 92 najpopularniejszych szamponów przeciw wypadaniu włosów sprzedawanych w polskich drogeriach i aptekach, okazało się, że aż 96% z nich opiera się na agresywnych, tanich detergentach siarczanowych (SLS / SLES) z symboliczną kropelką kofeiny lub biotyny dla marketingu na etykiecie.\n\nZobacz, co dzieje się na Twojej głowie w ciągu 4 godzin po umyciu włosów takim szamponem:\n\n1. W 30 sekund pod prysznicem agresywny SLS zdziera ze skóry głowy naturalną warstwę ochronną do gołego naskórka. Tuż po wytarciu ręcznikiem włosy wydają się „czyste i puszyste”.\n2. Ale po 60 minutach przesuszona skóra głowy wpada w biologiczny alarm.\n3. Żeby się ratować, gruczoły łojowe uruchamiają „Efekt Odbicia” (Rebound) — w ciągu kolejnych 3–4 godzin pompują prosto do Twoich mieszków włosowych 2 razy więcej łoju niż normalnie!\n4. A co znajduje się w męskim łoju na czubku głowy i w zakolach? Najwyższe stężenie hormonu DHT — głównego zabójcy męskich cebulek włosowych!\n\nRozumiesz tę pułapkę?\nZa każdym razem, gdy myjesz głowę zwykłym szamponem z SLS, sam prowokujesz swoją skórę do zalania uśpionych cebulek podwójną falą hormonu DHT już kilka godzin po prysznicu! Dlatego o godzinie 14:00 Twoje włosy na górze są znowu przyklapnięte, a cebulki kurczą się z każdym tygodniem.\n\nDobra wiadomość jest taka, że dopóki mieszek włosowy nie uległ całkowitej atrofii, od 70% do 80% Twoich cebulek w prześwitach wciąż żyje. Musisz tylko przerwać błędne koło „Efektu Odbicia DHT” i dać cebulkom wszystkie 3 rzeczy, których potrzebują:\n\n1. Zablokować hormon DHT w mieszku bez zdzierania bariery ochronnej skóry.\n2. Pobudzić głębokie mikrokrążenie krwi i tlenu w korzeniach.\n3. Wygasić podrażnienie gruczołów łojowych i odżywić brodawkę włosa.\n\nDokładnie tak działa Szampon SARDIAN Aktywujący Korzenie — formuła bez agresywnego efektu odbicia, która zastępuje drogeryjną chemię 4 skoncentrowanymi ekstraktami botanicznymi:\n\nPo pierwsze: Rdest wielokwiatowy (Polygonum multiflorum) oraz Biota Orientalis neutralizują DHT bezpośrednio w ujściu mieszka i regulują pracę gruczołów łojowych. W badaniach laboratoryjnych rdest wielokwiatowy aktywował fazę wzrostu w 90% badanych mieszków włosowych (w porównaniu do 70% dla minoksydylu).\n\nPo drugie: Korzeń żeń-szenia i naturalny mentol z mięty pieprzowej otwierają naczynia włosowate pod skórą głowy — już po 60 sekundach mycia czujesz przyjemne, chłodzące mrowienie, które dotlenia uśpione cebulki.\n\nPo trzecie: Korzeń lukrecji łagodzi podrażnioną skórę głowy i przerywa paniczny wyrzut łoju po myciu, a dane laboratoryjne potwierdzają 2,6 razy większą przeżywalność komórek brodawki włosa oraz o 62% wyższą aktywność wzrostową.\n\nEfekt odstawienia szamponów z SLS i przejścia na SARDIAN poczujesz od pierwszego tygodnia:\n- Włosy przestają oklapywać po kilku godzinach od mycia, a po 2–3 tygodniach na sitku pod prysznicem zostaje ułamek dawnej liczby włosów.\n- Po 4–6 tygodniach odciążone od ciągłych wyrzutów DHT cebulki wypuszczają nowe, sztywne odrosty.\n- Po 8–12 tygodniach linia włosów i czubek głowy odzyskują zdrową gęstość, bez śladu podrażnień.\n\nNie ryzykujesz ani grosza: masz pełne 60 dni gwarancji zwrotu pieniędzy (testujesz przez 2 miesiące albo odzyskujesz 100% wpłaty). Ponad 4 700 polskich mężczyzn oceniło już SARDIAN na 4,7 na 5 gwiazdek.\n\nPrzerwij Efekt Odbicia DHT już przy następnym myciu głowy:\n\n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie"
  },
  "sardian_nd_c5": {
    "headline": "Mój mąż mył głowę codziennie szamponem z apteki. Nie wiedział, że 4 godziny później sam zalewa cebulki DHT",
    "description": "Przerwij Efekt Odbicia DHT — formuła 3 z 3 bez SLS (60 dni gwarancji)",
    "primaryText": "Mój 42-letni mąż Tomek jest pedantem — mył głowę codziennie rano, używając najdroższych szamponów „przeciw wypadaniu włosów” z apteki.\n\nMimo to każdego popołudnia jego włosy na czubku głowy robiły się cienkie i przyklapnięte, a zakola z roku na rok cofały się coraz głębiej.\n\nDopiero kiedy sprawdziłam skład jego aptecznego szamponu i przeczytałam o „Efekcie Odbicia DHT”, zrozumiałam, że mój mąż po każdym porannym prysznicu nieświadomie podwajał dawkę hormonu łysienia w swoich cebulkach. Wymieniłam jego szampon na te czarne butelki.\n\nCzy zauważyłeś ten dziwny paradoks? Im bardziej przejmujesz się wypadaniem włosów i im częściej myjesz głowę „specjalnymi” szamponami z drogerii lub apteki za 35–50 zł, tym szybciej Twoje włosy na czubku głowy robią się cienkie, oklapnięte, a zakola cofają się jeszcze mocniej.\n\nTo nie jest przypadek ani Twoja wyobraźnia.\nTrycholodzy nazywają ten mechanizm „Efektem Odbicia Łojowo-DHT” (Rebound Sebum + DHT).\n\nKiedy przeanalizowano składy 92 najpopularniejszych szamponów przeciw wypadaniu włosów sprzedawanych w polskich drogeriach i aptekach, okazało się, że aż 96% z nich opiera się na agresywnych, tanich detergentach siarczanowych (SLS / SLES) z symboliczną kropelką kofeiny lub biotyny dla marketingu na etykiecie.\n\nZobacz, co dzieje się na Twojej głowie w ciągu 4 godzin po umyciu włosów takim szamponem:\n\n1. W 30 sekund pod prysznicem agresywny SLS zdziera ze skóry głowy naturalną warstwę ochronną do gołego naskórka. Tuż po wytarciu ręcznikiem włosy wydają się „czyste i puszyste”.\n2. Ale po 60 minutach przesuszona skóra głowy wpada w biologiczny alarm.\n3. Żeby się ratować, gruczoły łojowe uruchamiają „Efekt Odbicia” (Rebound) — w ciągu kolejnych 3–4 godzin pompują prosto do Twoich mieszków włosowych 2 razy więcej łoju niż normalnie!\n4. A co znajduje się w męskim łoju na czubku głowy i w zakolach? Najwyższe stężenie hormonu DHT — głównego zabójcy męskich cebulek włosowych!\n\nRozumiesz tę pułapkę?\nZa każdym razem, gdy myjesz głowę zwykłym szamponem z SLS, sam prowokujesz swoją skórę do zalania uśpionych cebulek podwójną falą hormonu DHT już kilka godzin po prysznicu! Dlatego o godzinie 14:00 Twoje włosy na górze są znowu przyklapnięte, a cebulki kurczą się z każdym tygodniem.\n\nDobra wiadomość jest taka, że dopóki mieszek włosowy nie uległ całkowitej atrofii, od 70% do 80% Twoich cebulek w prześwitach wciąż żyje. Musisz tylko przerwać błędne koło „Efektu Odbicia DHT” i dać cebulkom wszystkie 3 rzeczy, których potrzebują:\n\n1. Zablokować hormon DHT w mieszku bez zdzierania bariery ochronnej skóry.\n2. Pobudzić głębokie mikrokrążenie krwi i tlenu w korzeniach.\n3. Wygasić podrażnienie gruczołów łojowych i odżywić brodawkę włosa.\n\nDokładnie tak działa Szampon SARDIAN Aktywujący Korzenie — formuła bez agresywnego efektu odbicia, która zastępuje drogeryjną chemię 4 skoncentrowanymi ekstraktami botanicznymi:\n\nPo pierwsze: Rdest wielokwiatowy (Polygonum multiflorum) oraz Biota Orientalis neutralizują DHT bezpośrednio w ujściu mieszka i regulują pracę gruczołów łojowych. W badaniach laboratoryjnych rdest wielokwiatowy aktywował fazę wzrostu w 90% badanych mieszków włosowych (w porównaniu do 70% dla minoksydylu).\n\nPo drugie: Korzeń żeń-szenia i naturalny mentol z mięty pieprzowej otwierają naczynia włosowate pod skórą głowy — już po 60 sekundach mycia czujesz przyjemne, chłodzące mrowienie, które dotlenia uśpione cebulki.\n\nPo trzecie: Korzeń lukrecji łagodzi podrażnioną skórę głowy i przerywa paniczny wyrzut łoju po myciu, a dane laboratoryjne potwierdzają 2,6 razy większą przeżywalność komórek brodawki włosa oraz o 62% wyższą aktywność wzrostową.\n\nEfekt odstawienia szamponów z SLS i przejścia na SARDIAN poczujesz od pierwszego tygodnia:\n- Włosy przestają oklapywać po kilku godzinach od mycia, a po 2–3 tygodniach na sitku pod prysznicem zostaje ułamek dawnej liczby włosów.\n- Po 4–6 tygodniach odciążone od ciągłych wyrzutów DHT cebulki wypuszczają nowe, sztywne odrosty.\n- Po 8–12 tygodniach linia włosów i czubek głowy odzyskują zdrową gęstość, bez śladu podrażnień.\n\nNie ryzykujesz ani grosza: masz pełne 60 dni gwarancji zwrotu pieniędzy (testujesz przez 2 miesiące albo odzyskujesz 100% wpłaty). Ponad 4 700 polskich mężczyzn oceniło już SARDIAN na 4,7 na 5 gwiazdek.\n\nPrzerwij Efekt Odbicia DHT już przy następnym myciu głowy:\n\n👉 https://sprobujsardian.pl/products/sardian-szampon-aktywujacy-korzenie"
  }
};

export interface SardianPlGeneratedAd {
  id: string;
  angleId: string;
  code: string;
  title: string;
  stageId: SardianAwarenessStageId;
  sophisticationLevel: SardianSophisticationLevel;
  problemCluster: SardianProblemCluster;
  pageId: string;
  pageName: string;
  headline: string;
  description: string;
  primaryText: string;
  destinationUrl: string;
  cta: 'LEARN_MORE';
  imageUrl: string;
  imageHash: string;
  wordCount: number;
  characterCount: number;
  auditPassed: boolean;
  auditWarnings: string[];
  auditFixesApplied: string[];
  createdAt: number;
  updatedAt: number;
}

export function sanitizeAndAuditSardianPl(
  rawPrimaryText: string,
  rawHeadline: string,
  rawDescription: string,
): {
  primaryText: string;
  headline: string;
  description: string;
  wordCount: number;
  characterCount: number;
  auditPassed: boolean;
  auditWarnings: string[];
  auditFixesApplied: string[];
} {
  const fixes: string[] = [];
  const warnings: string[] = [];

  let primaryText = (rawPrimaryText || '').trim();
  let headline = (rawHeadline || '').trim();
  let description = (rawDescription || '').trim();

  if (/[*™]/.test(primaryText) || /[*™]/.test(headline) || /[*™]/.test(description)) {
    primaryText = primaryText.replace(/[*™]/g, '');
    headline = headline.replace(/[*™]/g, '');
    description = description.replace(/[*™]/g, '');
    fixes.push('Usunięto gwiazdki Markdown i symbole ™.');
  }

  const wordCount = primaryText.split(/\s+/).filter(Boolean).length;
  const characterCount = primaryText.length;

  if (wordCount < 450) {
    warnings.push(`Krótki tekst (${wordCount} słów - rekomendowane 550+ słów).`);
  }

  return {
    primaryText,
    headline,
    description,
    wordCount,
    characterCount,
    auditPassed: warnings.length === 0,
    auditWarnings: warnings,
    auditFixesApplied: fixes,
  };
}

export function buildAllSardianPrewrittenAds(): SardianPlGeneratedAd[] {
  const now = 1793000000000;
  return SARDIAN_PRESET_ANGLES.map((preset) => {
    const rawCopy = SARDIAN_ALL_COPY[preset.id] || {
      headline: preset.title,
      description: '60-dniowa gwarancja zwrotu · Formuła 3 z 3 na uśpione cebulki',
      primaryText: '',
    };
    const audited = sanitizeAndAuditSardianPl(rawCopy.primaryText, rawCopy.headline, rawCopy.description);
    return {
      id: `sardian-pl-${preset.code.toLowerCase()}`,
      angleId: preset.id,
      code: preset.code,
      title: preset.title,
      stageId: preset.stageId,
      sophisticationLevel: preset.sophisticationLevel,
      problemCluster: preset.problemCluster,
      pageId: preset.recommendedFanpageId,
      pageName: preset.recommendedFanpageName,
      headline: audited.headline,
      description: audited.description,
      primaryText: audited.primaryText,
      destinationUrl: SARDIAN_PDP_URL,
      cta: 'LEARN_MORE',
      imageUrl: preset.defaultImageUrl,
      imageHash: preset.defaultImageHash,
      wordCount: audited.wordCount,
      characterCount: audited.characterCount,
      auditPassed: audited.auditPassed,
      auditWarnings: audited.auditWarnings,
      auditFixesApplied: audited.auditFixesApplied,
      createdAt: now,
      updatedAt: now,
    };
  });
}
