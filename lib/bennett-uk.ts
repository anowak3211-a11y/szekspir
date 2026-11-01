/**
 * BENNETT & SEED UK — Fabryka Brytyjskich Antków / LFS (Long-Form Stories)
 *
 * Architektura: 5 Silo Angles × 30 Kompletnych LFS (Lunovyn 1:1 Rip + Bloom & Bond Hair/GLP-1):
 *   - Stage 1: Women's 50+ Bladder & Pelvic Floor (8 LFS -> /products/pumpkin-seed-oil-bladder-support)
 *   - Stage 2: Men's 50+ Prostate, TURP, Flomax & Night Flow (8 LFS -> /products/pumpkin-seed-oil-prostate-support & /pages/7-reasons-bladder-prostate)
 *   - Stage 3: Cholesterol, Statins & Heart / Circulation 50+ (6 LFS -> /pages/7-reasons-cholesterol)
 *   - Stage 4: Kidney & Urinary Filtration Support 50+ (4 LFS -> /pages/7-reasons-kidney & /products/pumpkin-seed-oil-kidney-support)
 *   - Stage 5: Women's 40+ Hair, Menopause, GLP-1 Mounjaro & BOFU Offer (4 LFS -> /products/pumpkin-seed-oil-hair-support & /products/pumpkin-seed-oil-softgels)
 */

import { BENNETT_UK_COPY_STAGE1 } from './bennett-uk-copy-stage1';
import { BENNETT_UK_COPY_STAGE2 } from './bennett-uk-copy-stage2';
import { BENNETT_UK_COPY_STAGE3 } from './bennett-uk-copy-stage3';
import { BENNETT_UK_COPY_STAGE4 } from './bennett-uk-copy-stage4';
import { BENNETT_UK_COPY_STAGE5 } from './bennett-uk-copy-stage5';

export type BennettUkAwarenessStageId =
  | 'stage1_unaware'
  | 'stage2_problem_aware'
  | 'stage3_solution_aware'
  | 'stage4_product_aware'
  | 'stage5_most_aware';

export type BennettUkSophisticationLevel = 3 | 4 | 5;

export type BennettUkProblemCluster =
  | 'BLADDER_WOMEN_50'
  | 'PROSTATE_MEN_50'
  | 'CHOLESTEROL_HEART_50'
  | 'KIDNEY_FILTRATION_50'
  | 'HAIR_MENOPAUSE_GLP1'
  | 'BOFU_BRAND_OFFER';

export interface BennettUkStageMeta {
  id: BennettUkAwarenessStageId;
  stageNumber: 1 | 2 | 3 | 4 | 5;
  shortLabel: string;
  title: string;
  subtitle: string;
  sophisticationLabel: string;
  sophisticationLevel: BennettUkSophisticationLevel;
  color: string;
  bgLight: string;
  borderColor: string;
  vocSummary: string;
}

export interface BennettUkFanpage {
  id: string;
  name: string;
  initials: string;
  role: string;
  badgeColor: string;
  avatarUrl?: string;
}

export interface BennettUkImageAsset {
  id: string;
  url: string;
  imageHash: string;
  label: string;
  adsetOrigin: string;
  adOrigin: string;
  aspectRatio: string;
  source?: 'ai' | 'meta';
  angleId?: string;
  kiePrompt?: string;
}

export interface BennettUkAnglePreset {
  id: string;
  number: number;
  code: string;
  title: string;
  shortTitle: string;
  stageId: BennettUkAwarenessStageId;
  stageNumber: 1 | 2 | 3 | 4 | 5;
  sophisticationLevel: BennettUkSophisticationLevel;
  sophisticationBadge: string;
  problemCluster: BennettUkProblemCluster;
  problemLabel: string;
  recommendedFanpageId: string;
  recommendedFanpageName: string;
  vocTrigger: string;
  mechanismCore: string;
  destinationUrl: string;
  defaultImageId: string;
  defaultImageUrl: string;
  defaultImageHash: string;
  createdDate?: string;
  updatedDate?: string;
}

export const BENNETT_UK_AD_ACCOUNT_ID = '1168927131917359';
export const BENNETT_UK_BLADDER_PDP_URL = 'https://bennettseed.co/products/comfort-flow-softgels';
export const BENNETT_UK_PROSTATE_PDP_URL = 'https://bennettseed.co/products/night-ease-softgels';
export const BENNETT_UK_KIDNEY_PDP_URL = 'https://bennettseed.co/products/daily-balance-softgels';
export const BENNETT_UK_SOFTGELS_PDP_URL = 'https://bennettseed.co/products/styrian-seed-softgels';
export const BENNETT_UK_HAIR_PDP_URL = 'https://bennettseed.co/products/daily-shine-softgels';

export const BENNETT_UK_BLADDER_ADV_URL = 'https://bennettseed.co/pages/7-reasons-unbroken-nights';
export const BENNETT_UK_PROSTATE_STORY_ADV_URL = 'https://bennettseed.co/pages/unbroken-night-story';
export const BENNETT_UK_PROSTATE_DR_ADV_URL = 'https://bennettseed.co/pages/james-bennett-night-guide';
export const BENNETT_UK_KIDNEY_ADV_URL = 'https://bennettseed.co/pages/7-reasons-daily-balance';
export const BENNETT_UK_CHOLESTEROL_ADV_URL = 'https://bennettseed.co/pages/7-reasons-plant-sterols';
export const BENNETT_UK_HAIR_ADV_URL = 'https://bennettseed.co/pages/5-ways-fuller-hair';

export const BENNETT_UK_PDP_URL = BENNETT_UK_BLADDER_PDP_URL;
export const BENNETT_UK_DEFAULT_URL = BENNETT_UK_BLADDER_PDP_URL;
export const BENNETT_UK_META_ACCOUNT_ID = BENNETT_UK_AD_ACCOUNT_ID;
export const BENNETT_UK_META_NATIVE_CAMPAIGN_ID = '';
export const BENNETT_UK_META_MAIN_CAMPAIGN_ID = '';
export const BENNETT_UK_HAIR_PIXEL_ID = '1440642884707325';
export const BENNETT_UK_META_PIXEL_ID = '1600980978391826';
export const BENNETT_UK_BACKUP_CONVERSION_EVENT = 'BS_Order_Confirmed';

export const BENNETT_UK_FANPAGES: BennettUkFanpage[] = [
  {
    id: '1424554760734318',
    name: 'Dr Claire Foster',
    initials: 'CF',
    role: 'Female UK GP & Medical Authority (#01 GP 3:00 AM Knickers, #19 Blood Pressure, #26 Kidney, #31 Urologist 3 Things)',
    badgeColor: '#1d4ed8',
    avatarUrl: '/bennett-uk-images/Avatar_Dr_Rebecca_Bennett_1245606625294738.jpg',
  },
  {
    id: '1432534613265585',
    name: 'Richard Foster',
    initials: 'RF',
    role: 'Male Consultant Urologist & GP Authority (#24 Kidney Filtration GP & #34 Urologist Refused Tamsulosin at 54)',
    badgeColor: '#0369a1',
    avatarUrl: '/bennett-uk-images/Avatar_Dr_Richard_Foster.jpg',
  },
  {
    id: '1415703161625474',
    name: 'Carys Morgan',
    initials: 'CM',
    role: '1st-Person UK Woman 50+ Persona (#02 Pad Every Morning, #07/#08 Bottle Check, #11/#13 Wife on Husband, #17/#18/#20 Cholesterol, #27/#28 Hair & GLP-1)',
    badgeColor: '#be185d',
    avatarUrl: '/bennett-uk-images/Avatar_Catherine_Hughes_1185356244671594.jpg',
  },
  {
    id: '1402524776268549',
    name: 'David T. Yorkshire Notes',
    initials: 'DT',
    role: '1st-Person UK Man 55+ Persona (#05 90-Min Alarm, #06 High Street Toilets, #14 Longer Than a Car, #15 Threw Away 6 Bottles, #16 Heating Engineer 1991 Trial)',
    badgeColor: '#b45309',
    avatarUrl: '/bennett-uk-images/Avatar_David_Thornton_UK.jpg',
  },
  {
    id: '1327661883769549',
    name: 'Bennett & Seed UK',
    initials: 'BS',
    role: 'Official Brand Page — BOFU & Guarantee Only (#29 Most Bladder Products Mask, #30 Buy 2 Get 1 Free Offer)',
    badgeColor: '#15803d',
    avatarUrl: '/bennett-uk-images/Avatar_Bennett_And_Seed_Logo_UK.jpg',
  },
  {
    id: '1277952565400407',
    name: 'Over 50s Health & Wellbeing UK (Health Daily UK)',
    initials: 'OH',
    role: 'UK 50+ Community & Editorial (#03 H&B Cranberry, #04 Continence Nurse, #09/#10/#12/#32/#33 Prostate Editorial, #21/#22 Cholesterol, #23/#25 Kidney)',
    badgeColor: '#ea580c',
    avatarUrl: '/bennett-uk-images/Avatar_Margot_Whitaker_1178801805316348.jpg',
  },
];

export const BENNETT_UK_STAGES: Record<BennettUkAwarenessStageId, BennettUkStageMeta> = {
  stage1_unaware: {
    id: 'stage1_unaware',
    stageNumber: 1,
    shortLabel: 'Kąt 1 · Bladder 50+ (8)',
    title: 'KĄT 1: WOMEN’S 50+ BLADDER & PELVIC FLOOR (8 LFS · 57% Zasięgu Lunovyn)',
    subtitle: 'Przebieranie bielizny o 3:00 w nocy, wkładki co rano, porażka żurawiny z H&B i mapa toalet przy autostradzie M1',
    sophisticationLabel: 'Lunovyn Top Spenders #1 · Δ7-Phytosterols & Pelvic Floor Tone',
    sophisticationLevel: 4,
    color: '#be185d',
    bgLight: '#fdf2f8',
    borderColor: '#fbcfe8',
    vocSummary:
      'At 3:00 AM changing knickers 3rd time, woman past 50 pad every morning, surgical nurse 25 years, NHS nurse mother on 2 bladder meds, 90-min alarm & bottle label test.',
  },
  stage2_problem_aware: {
    id: 'stage2_problem_aware',
    stageNumber: 2,
    shortLabel: 'Kąt 2 · Prostate 50+ (12)',
    title: 'KĄT 2: MEN’S 50+ PROSTATE, TURP, FLOMAX & NIGHT FLOW (12 LFS · 5 Top Spenderów AdSpy USA Elivora + Lunovyn)',
    subtitle: 'Top 5 AdSpy USA: #1 Urolog 3 Błędy Flomax (1,416👍), #2 Please Don’t Buy (1,359👍), #3 Mąż Odmówił Flomaxu 4 Lata (1,170👍 · BS-10), #4 14 Lat Urology Ward (221👍), #5 Urolog Odmówił Tamsulozyny (112👍)',
    sophisticationLabel: 'AdSpy USA Top 5 Winners · 2,000mg Cold-Pressed Styrian Oil + Saw Palmetto',
    sophisticationLevel: 4,
    color: '#1d4ed8',
    bgLight: '#eff6ff',
    borderColor: '#bfdbfe',
    vocSummary:
      'Elivora AdSpy USA Top 5: #1 Urologist Stop 3 Things (1,416 rx), #2 Please Don’t Buy (1,359 rx), #3 Husband Refused Flomax 4y (1,170 rx · BS-10), #4 Dangerous Foods Urology Ward (221 rx), #5 Urologist Refused Tamsulosin (112 rx).',
  },
  stage3_solution_aware: {
    id: 'stage3_solution_aware',
    stageNumber: 3,
    shortLabel: 'Kąt 3 · Cholesterol 50+ (6)',
    title: 'KĄT 3: CHOLESTEROL, STATINS & HEART / CIRCULATION 50+ (6 LFS · Advertorial)',
    subtitle: 'Cholesterol „a bit high” po menopauzie, bóle łydek po statynach, 72-letni wdowiec na parkingu pod Tesco i blokada wchłaniania w jelitach',
    sophisticationLabel: 'Lunovyn Heart Community · Beta-Sitosterol + Omega-6/9 + Vitamin E',
    sophisticationLevel: 4,
    color: '#b45309',
    bgLight: '#fffbeb',
    borderColor: '#fde68a',
    vocSummary:
      'Sarah 58 Harrogate & sister Joanne on atorvastatin, why women stop statins in Year 1, slightly high BP, 72yo widower at Tesco car park, heart doctor widow & 6:00 AM neighbour.',
  },
  stage4_product_aware: {
    id: 'stage4_product_aware',
    stageNumber: 4,
    shortLabel: 'Kąt 4 · Kidney 50+ (4)',
    title: 'KĄT 4: KIDNEY & URINARY FILTRATION SUPPORT 50+ (4 LFS · 100% Compliant)',
    subtitle: 'Opuchnięte oczy rano, ślady po skarpetkach na kostkach, pianka w toalecie, zjazd energii o 15:00 i wsparcie filtracji bez rozcieńczania elektrolitów',
    sophisticationLabel: 'Compliant Urinary & Kidney Filtration · Unrefined Cold-Pressed <38°C',
    sophisticationLevel: 5,
    color: '#047857',
    bgLight: '#ecfdf5',
    borderColor: '#a7f3d0',
    vocSummary:
      'Renal specialist widow Margot Whitaker, doctor "we will keep an eye on it", my dad Peter puffy ankles & sock marks, silent filtration strain & 3:00 PM crash.',
  },
  stage5_most_aware: {
    id: 'stage5_most_aware',
    stageNumber: 5,
    shortLabel: 'Kąt 5 · Hair, GLP-1 & BOFU (4)',
    title: 'KĄT 5: WOMEN’S 40+ HAIR, MENOPAUSE PARTING, GLP-1 MOUNJARO & BOFU (4 LFS)',
    subtitle: 'Prześwitujący przedziałek pod światłem w łazience, wypadanie włosów na Mounjaro/Wegovy oraz bezpośrednie kreacje BOFU Buy 2, Get 1 Free',
    sophisticationLabel: 'Bloom & Bond + Lunovyn BOFU · Dual-Action DHT Blocker & 90-Day Guarantee',
    sophisticationLevel: 5,
    color: '#7c3aed',
    bgLight: '#f5f3ff',
    borderColor: '#ddd6fe',
    vocSummary:
      'Bathroom spotlight centre parting & hairdresser DHT revelation, GLP-1 Mounjaro 2.5 stone shedding recovery, and Lunovyn direct BOFU offer ads.',
  },
};

export const BENNETT_UK_IMAGE_LIBRARY: BennettUkImageAsset[] = [
  {
    id: 'fix-01-gp-3am-hospital-bed',
    url: '/bennett-uk-images/Fix_01_GP_3AM_Hospital_Bed_NHS.jpg',
    imageHash: '',
    label: 'LFS #01 · GP 3:00 AM NHS Ward & Night Exhaustion (Clean 1:1 Fix)',
    adsetOrigin: 'UK_BLADDER_W45+',
    adOrigin: 'bennett-01-gp-3am-changing-knickers',
    aspectRatio: '1:1',
    source: 'ai',
    angleId: 'bennett-01-gp-3am-changing-knickers',
  },
  {
    id: 'fix-02-woman-50-discreet-pad',
    url: '/bennett-uk-images/Fix_02_Woman_50_Discreet_Bladder_Pad_Bed.jpg',
    imageHash: '',
    label: 'LFS #02 · Woman Past 50 Discreet Bladder Pad on Bed (Clean 1:1 Fix)',
    adsetOrigin: 'UK_BLADDER_W45+',
    adOrigin: 'bennett-02-woman-50-pad-every-morning',
    aspectRatio: '1:1',
    source: 'ai',
    angleId: 'bennett-02-woman-50-pad-every-morning',
  },
  {
    id: 'fix-03-surgical-nurse-pads-progression',
    url: '/bennett-uk-images/Fix_03_Surgical_Nurse_Bedside_Pads_Progression.jpg',
    imageHash: '',
    label: 'LFS #03 · Surgical Nurse 25 Years: Progression of Pads on Nightstand (Clean 1:1 Fix)',
    adsetOrigin: 'UK_BLADDER_W45+',
    adOrigin: 'bennett-03-surgical-nurse-25-years',
    aspectRatio: '1:1',
    source: 'ai',
    angleId: 'bennett-03-surgical-nurse-25-years',
  },
  {
    id: 'lun-nhwc-1345',
    url: '/bennett-uk-images/Ad_Natural_Health_Wellness_Club_1345589167748159.png',
    imageHash: '',
    label: 'LFS #04 · NHS Nurse Mother on 2 Bladder Medications (Original 1:1)',
    adsetOrigin: 'UK_BLADDER_W45+',
    adOrigin: 'bennett-04-nurse-mother-2-bladder-meds',
    aspectRatio: '1:1',
    source: 'meta',
    angleId: 'bennett-04-nurse-mother-2-bladder-meds',
  },
  {
    id: 'fix-05-alarm-90-mins-bedside',
    url: '/bennett-uk-images/Fix_05_Alarm_Every_90_Mins_Bedside_Hands.jpg',
    imageHash: '',
    label: 'LFS #05 · 90-Minute Night Alarm (03:00 Digital Clock & Bedside Hands · Clean 1:1 Fix)',
    adsetOrigin: 'UK_BLADDER_W45+',
    adOrigin: 'bennett-05-alarm-90-min-intervals',
    aspectRatio: '1:1',
    source: 'ai',
    angleId: 'bennett-05-alarm-90-min-intervals',
  },
  {
    id: 'fix-06-high-street-toilets-leaflet',
    url: '/bennett-uk-images/Fix_06_High_Street_Toilets_Clinic_Leaflet.jpg',
    imageHash: '',
    label: 'LFS #06 · NHS Overactive Bladder & Pelvic Floor Leaflet (Clean 1:1 Fix)',
    adsetOrigin: 'UK_BLADDER_W45+',
    adOrigin: 'bennett-06-mapped-every-high-street-toilet',
    aspectRatio: '1:1',
    source: 'ai',
    angleId: 'bennett-06-mapped-every-high-street-toilet',
  },
  {
    id: 'fix-07-turn-bottle-check-2000mg',
    url: '/bennett-uk-images/Fix_07_Turn_Bottle_Around_Check_2000mg.jpg',
    imageHash: '',
    label: 'LFS #07 · Turn Bottle Around & Check 2,000mg vs Cheap Yellow Capsule (Clean 1:1 Fix)',
    adsetOrigin: 'UK_BLADDER_W45+',
    adOrigin: 'bennett-07-check-1-number-on-bottle-back',
    aspectRatio: '1:1',
    source: 'ai',
    angleId: 'bennett-07-check-1-number-on-bottle-back',
  },
  {
    id: 'fix-08-motorway-m1-services-pov',
    url: '/bennett-uk-images/Fix_08_Motorway_M1_Services_Car_POV.jpg',
    imageHash: '',
    label: 'LFS #08 · UK Motorway Services Toilets Sign & 2 Ruby Softgels in Car (Clean 1:1 Fix)',
    adsetOrigin: 'UK_BLADDER_W45+',
    adOrigin: 'bennett-08-every-toilet-front-door-to-m1',
    aspectRatio: '1:1',
    source: 'ai',
    angleId: 'bennett-08-every-toilet-front-door-to-m1',
  },
  {
    id: 'lun-nhwc-1571',
    url: '/bennett-uk-images/Ad_Natural_Health_Wellness_Club_1571135268018680.png',
    imageHash: '',
    label: 'LFS #09 & #19 · Dad Brian Davies TURP Surgery / Toilet Bowl (Original 1:1)',
    adsetOrigin: 'UK_PROSTATE_M50+',
    adOrigin: 'bennett-09-dad-brian-davies-turp-18-years',
    aspectRatio: '1:1',
    source: 'meta',
    angleId: 'bennett-09-dad-brian-davies-turp-18-years',
  },
  {
    id: 'fix-10-nhs-nurse-tamsulosin',
    url: '/bennett-uk-images/Fix_10_NHS_Nurse_Wife_Flomax_Tamsulosin.jpg',
    imageHash: '',
    label: 'LFS #10 · NHS Nurse Wife & Husband With Tamsulosin 400mcg Box (Clean 1:1 Fix)',
    adsetOrigin: 'UK_PROSTATE_M50+',
    adOrigin: 'bennett-10-nhs-nurse-husband-refused-flomax',
    aspectRatio: '1:1',
    source: 'ai',
    angleId: 'bennett-10-nhs-nurse-husband-refused-flomax',
  },
  {
    id: 'lun-catherine-1049',
    url: '/bennett-uk-images/Ad_Catherine_Hughes_1049223327991730.png',
    imageHash: '',
    label: 'LFS #11 · Husband Started Tamsulosin June 2024 (Original 1:1)',
    adsetOrigin: 'UK_PROSTATE_M50+',
    adOrigin: 'bennett-11-husband-tamsulosin-june-2024',
    aspectRatio: '1:1',
    source: 'meta',
    angleId: 'bennett-11-husband-tamsulosin-june-2024',
  },
  {
    id: 'lun-catherine-4662',
    url: '/bennett-uk-images/Ad_Catherine_Hughes_4662104310685847.png',
    imageHash: '',
    label: 'LFS #12 · 2 Men Same Age Same Urologist Surgical Tray (Original 1:1)',
    adsetOrigin: 'UK_PROSTATE_M50+',
    adOrigin: 'bennett-12-two-men-same-age-same-urologist',
    aspectRatio: '1:1',
    source: 'meta',
    angleId: 'bennett-12-two-men-same-age-same-urologist',
  },
  {
    id: 'lun-catherine-1754',
    url: '/bennett-uk-images/Ad_Catherine_Hughes_1754497739147004.jpg',
    imageHash: '',
    label: 'LFS #13 · Husband Tried Cheap PSO & Raw Pumpkin Seeds (Original 1:1)',
    adsetOrigin: 'UK_PROSTATE_M50+',
    adOrigin: 'bennett-13-husband-tried-cheap-pso-nothing',
    aspectRatio: '1:1',
    source: 'meta',
    angleId: 'bennett-13-husband-tried-cheap-pso-nothing',
  },
  {
    id: 'fix-14-prostate-supplements-graveyard',
    url: '/bennett-uk-images/Fix_14_Prostate_Supplements_Graveyard_Counter.jpg',
    imageHash: '',
    label: 'LFS #14 · 5 Failed Yellow-Capsule Bottles vs 2 Ruby Softgels (Clean 1:1 Fix)',
    adsetOrigin: 'UK_PROSTATE_M50+',
    adOrigin: 'bennett-14-buying-prostate-supplements-longer-than-car',
    aspectRatio: '1:1',
    source: 'ai',
    angleId: 'bennett-14-buying-prostate-supplements-longer-than-car',
  },
  {
    id: 'bs-03-red-vs-yellow',
    url: '/bennett-uk-images/03_Bennett_And_Seed_Macro_Red_vs_Yellow_Softgel.jpg',
    imageHash: '',
    label: 'LFS #15 · Ruby Styrian Softgel vs Cheap Yellow Capsule Macro',
    adsetOrigin: 'UK_PROSTATE_M50+',
    adOrigin: 'bennett-15-william-aikens-threw-away-6-bottles',
    aspectRatio: '1:1',
    source: 'ai',
    angleId: 'bennett-15-william-aikens-threw-away-6-bottles',
  },
  {
    id: 'bs-08-two-capsules-palm',
    url: '/bennett-uk-images/08_Bennett_And_Seed_Two_Capsules_Palm_Macro.jpg',
    imageHash: '',
    label: 'LFS #16 · 2 Ruby Softgels in Palm Macro (2,000mg Clinical Trial)',
    adsetOrigin: 'UK_PROSTATE_M50+',
    adOrigin: 'bennett-16-japan-1991-clinical-trial-prostate',
    aspectRatio: '1:1',
    source: 'ai',
    angleId: 'bennett-16-japan-1991-clinical-trial-prostate',
  },
  {
    id: 'fix-17-gp-cholesterol-slip',
    url: '/bennett-uk-images/Fix_17_GP_Cholesterol_Slip_Of_Paper.jpg',
    imageHash: '',
    label: 'LFS #17 · UK GP Consultation & "LDL 6.1 — Plant Phytosterols" Note (Clean 1:1 Fix)',
    adsetOrigin: 'UK_CHOLESTEROL_50+',
    adOrigin: 'bennett-17-women-50-65-cholesterol-bit-high',
    aspectRatio: '1:1',
    source: 'ai',
    angleId: 'bennett-17-women-50-65-cholesterol-bit-high',
  },
  {
    id: 'fix-18-statin-night-calf-cramp',
    url: '/bennett-uk-images/Fix_18_Statin_Night_Calf_Cramp_2AM.jpg',
    imageHash: '',
    label: 'LFS #18 · Why Women Stop Statins: Night Calf Cramp at 2:00 AM (Clean 1:1 Fix)',
    adsetOrigin: 'UK_CHOLESTEROL_50+',
    adOrigin: 'bennett-18-women-stop-statins-first-year',
    aspectRatio: '1:1',
    source: 'ai',
    angleId: 'bennett-18-women-stop-statins-first-year',
  },
  {
    id: 'fix-20-tesco-widower-car-park',
    url: '/bennett-uk-images/Fix_20_72yo_Widower_Tesco_Car_Park_Rain.jpg',
    imageHash: '',
    label: 'LFS #20 · 72yo Widower Crying in Car at Rainy Tesco Car Park (Clean 1:1 Fix)',
    adsetOrigin: 'UK_CHOLESTEROL_50+',
    adOrigin: 'bennett-20-72yo-stranger-sobbing-tesco-car-park',
    aspectRatio: '1:1',
    source: 'ai',
    angleId: 'bennett-20-72yo-stranger-sobbing-tesco-car-park',
  },
  {
    id: 'fix-21-cardiologist-widow-notebook',
    url: '/bennett-uk-images/Fix_21_Cardiologist_Widow_Notebook_Sterols.jpg',
    imageHash: '',
    label: 'LFS #21 · Heart Doctor Widow Notebook: "1. Oxidised LDL 2. Cold-Pressed Delta-7 Phytosterols" (Clean 1:1 Fix)',
    adsetOrigin: 'UK_CHOLESTEROL_50+',
    adOrigin: 'bennett-21-husband-top-heart-doctor-oxidised-ldl',
    aspectRatio: '1:1',
    source: 'ai',
    angleId: 'bennett-21-husband-top-heart-doctor-oxidised-ldl',
  },
  {
    id: 'fix-22-neighbour-6am-lawnmower',
    url: '/bennett-uk-images/Fix_22_Neighbour_6AM_Lawnmower_British_Garden.jpg',
    imageHash: '',
    label: 'LFS #22 · Neighbour 6:00 AM Lawnmower in Misty British Garden (Clean 1:1 Fix)',
    adsetOrigin: 'UK_CHOLESTEROL_50+',
    adOrigin: 'bennett-22-neighbour-mowed-lawn-6am-30-years',
    aspectRatio: '1:1',
    source: 'ai',
    angleId: 'bennett-22-neighbour-mowed-lawn-6am-30-years',
  },
  {
    id: 'lun-margot-1088',
    url: '/bennett-uk-images/Ad_Margot_Whitaker_1088491380596267.png',
    imageHash: '',
    label: 'LFS #23 · Renal Specialist Widow Filtration Story (Original 1:1)',
    adsetOrigin: 'UK_KIDNEY_50+',
    adOrigin: 'bennett-23-husband-renal-specialist-filtration',
    aspectRatio: '1:1',
    source: 'meta',
    angleId: 'bennett-23-husband-renal-specialist-filtration',
  },
  {
    id: 'fix-24-kidney-ankle-sock-marks',
    url: '/bennett-uk-images/Fix_24_Kidney_Ankle_Sock_Marks_Clean_No_UI.jpg',
    imageHash: '',
    label: 'LFS #24 · Deep Sock Marks on Swollen Ankle at 5:00 PM (Clean 1:1 Fix · No UI Bars)',
    adsetOrigin: 'UK_KIDNEY_50+',
    adOrigin: 'bennett-24-doctor-we-will-keep-an-eye-on-it',
    aspectRatio: '1:1',
    source: 'ai',
    angleId: 'bennett-24-doctor-we-will-keep-an-eye-on-it',
  },
  {
    id: 'lun-margot-1800',
    url: '/bennett-uk-images/Ad_Margot_Whitaker_1800175671274137.png',
    imageHash: '',
    label: 'LFS #25 · My Dad Peter Puffy Ankles & GP Consultation (Original 1:1)',
    adsetOrigin: 'UK_KIDNEY_50+',
    adOrigin: 'bennett-25-my-dad-peter-puffy-ankles-filtration',
    aspectRatio: '1:1',
    source: 'meta',
    angleId: 'bennett-25-my-dad-peter-puffy-ankles-filtration',
  },
  {
    id: 'fix-26-doctor-at-desk-clean',
    url: '/bennett-uk-images/Fix_26_Doctor_At_Desk_Clean_No_Garbled_Badge.jpg',
    imageHash: '',
    label: 'LFS #26 · UK Doctor at Consulting Desk (Clean 1:1 Fix · No Garbled Badge)',
    adsetOrigin: 'UK_KIDNEY_50+',
    adOrigin: 'bennett-26-silent-filtration-strain-feel-normal',
    aspectRatio: '1:1',
    source: 'ai',
    angleId: 'bennett-26-silent-filtration-strain-feel-normal',
  },
  {
    id: 'bs-05-uk-woman-bathroom',
    url: '/bennett-uk-images/05_Bennett_And_Seed_UK_Woman_Bathroom_Morning.jpg',
    imageHash: '',
    label: 'LFS #27 · UK Woman 49+ Bathroom Mirror Morning',
    adsetOrigin: 'UK_HAIR_W40+',
    adOrigin: 'bennett-27-hair-shower-plughole-widening-parting',
    aspectRatio: '1:1',
    source: 'ai',
    angleId: 'bennett-27-hair-shower-plughole-widening-parting',
  },
  {
    id: 'bs-07-scalp-brush-ritual',
    url: '/bennett-uk-images/07_Bennett_And_Seed_Flatlay_Ritual_Scalp_Brush.jpg',
    imageHash: '',
    label: 'LFS #28 · Hair & Scalp Brush Ritual Flatlay (GLP-1)',
    adsetOrigin: 'UK_HAIR_W40+',
    adOrigin: 'bennett-28-hair-glp1-mounjaro-shedding-recovery',
    aspectRatio: '1:1',
    source: 'ai',
    angleId: 'bennett-28-hair-glp1-mounjaro-shedding-recovery',
  },
  {
    id: 'fix-bofu-02-made-in-uk',
    url: '/bennett-uk-images/Fix_BOFU_02_Bennett_Made_In_UK_Table.jpg',
    imageHash: '',
    label: 'LFS #29 · BOFU "MADE IN THE UK" Bennett & Seed Table Graphic (1:1 Lunovyn Adaptation)',
    adsetOrigin: 'UK_BOFU_BRAND',
    adOrigin: 'bennett-29-bofu-most-bladder-products-mask',
    aspectRatio: '1:1',
    source: 'ai',
    angleId: 'bennett-29-bofu-most-bladder-products-mask',
  },
  {
    id: 'fix-bofu-01-b2g1-box',
    url: '/bennett-uk-images/Fix_BOFU_01_Bennett_Buy2Get1Free_Box.jpg',
    imageHash: '',
    label: 'LFS #30 · BOFU "LAST BATCH AVAILABLE — BUY 2 GET 1 FREE" Shipping Box (1:1 Lunovyn Adaptation)',
    adsetOrigin: 'UK_BOFU_BRAND',
    adOrigin: 'bennett-30-bofu-prostate-bladder-b2g1-offer',
    aspectRatio: '1:1',
    source: 'ai',
    angleId: 'bennett-30-bofu-prostate-bladder-b2g1-offer',
  },
  {
    id: 'bs-01-hero-packshot',
    url: '/bennett-uk-images/01_Bennett_And_Seed_Hero_White_Packshot.jpg',
    imageHash: '',
    label: 'Bennett & Seed Hero White Packshot 2,000mg',
    adsetOrigin: 'UK_BOFU_BRAND',
    adOrigin: 'bennett-29-bofu-most-bladder-products-mask',
    aspectRatio: '1:1',
    source: 'ai',
  },
  {
    id: 'bs-04-bundle-b2g1',
    url: '/bennett-uk-images/04_Bennett_And_Seed_Bundle_3_Jars_B2G1.jpg',
    imageHash: '',
    label: 'Bennett & Seed Buy 2, Get 1 FREE Bundle (3 Jars)',
    adsetOrigin: 'UK_BOFU_BRAND',
    adOrigin: 'bennett-30-bofu-prostate-bladder-b2g1-offer',
    aspectRatio: '1:1',
    source: 'ai',
  },
  {
    id: 'elivora-tt-07-urologist-scrubs',
    url: '/bennett-uk-images/Elivora_TT_07_facebook_1661284845612140.jpg',
    imageHash: '',
    label: 'LFS #31 · Senior Urologist in Teal Scrubs in Hospital Corridor (AdSpy USA #1 · 1,416👍)',
    adsetOrigin: 'UK_PROSTATE_M50+',
    adOrigin: 'bennett-31-elivora-urologist-stop-3-things-flomax',
    aspectRatio: '1:1',
    source: 'meta',
    angleId: 'bennett-31-elivora-urologist-stop-3-things-flomax',
  },
  {
    id: 'elivora-tt-14-urology-nurse-woodland',
    url: '/bennett-uk-images/Elivora_TT_14_facebook_1432680771707425.jpg',
    imageHash: '',
    label: 'LFS #33 · NHS Urology Ward Nurse 14 Years (AdSpy USA #4 · 221👍)',
    adsetOrigin: 'UK_PROSTATE_M50+',
    adOrigin: 'bennett-33-elivora-dangerous-foods-urology-ward',
    aspectRatio: '1:1',
    source: 'meta',
    angleId: 'bennett-33-elivora-dangerous-foods-urology-ward',
  },
  {
    id: 'elivora-adspy-04-low-vs-powerful-flow',
    url: '/bennett-uk-images/Fix_34_Low_vs_Powerful_Flow_1x1.jpg',
    imageHash: '',
    label: 'LFS #34 · Low Flow vs Powerful Flow Prostate Cross-Section (Clean 1:1 Fix · AdSpy USA #5)',
    adsetOrigin: 'UK_PROSTATE_M50+',
    adOrigin: 'bennett-34-elivora-urologist-refused-tamsulosin',
    aspectRatio: '1:1',
    source: 'meta',
    angleId: 'bennett-34-elivora-urologist-refused-tamsulosin',
  },
];

export const BENNETT_UK_PRESET_ANGLES: BennettUkAnglePreset[] = [
  // ==================== STAGE 1: WOMEN'S 50+ BLADDER (8 LFS) ====================
  {
    id: 'bennett-01-gp-3am-changing-knickers',
    number: 1,
    code: 'BS-01',
    title: 'At 3:00 AM I Was Standing in My Bathroom Changing My Knickers For the 3rd Time That Night (GP Story · 60d Top Spender)',
    shortTitle: '#01 · GP 3:00 AM Changing Knickers (60d Winner)',
    stageId: 'stage1_unaware',
    stageNumber: 1,
    sophisticationLevel: 4,
    sophisticationBadge: 'Mega-Winner #1 · 60 Dni Emisji Non-Stop',
    problemCluster: 'BLADDER_WOMEN_50',
    problemLabel: 'Nocne przebieranie bielizny o 3:00 i £914 wydane na wkładki',
    recommendedFanpageId: '1424554760734318',
    recommendedFanpageName: 'Dr Claire Foster',
    createdDate: '2026-10-27',
    updatedDate: '2026-11-01',
    vocTrigger: '„At 3:00 AM I Was Standing in My Bathroom Changing My Knickers For the 3rd Time That Night While My Husband Pretended Not to Notice...”',
    mechanismCore: '2,000mg Cold-Pressed Austrian Styrian Pumpkin Seed Oil (Δ7-phytosterols) + Saw Palmetto wspierające napięcie mięśni dna miednicy i zwieracza.',
    destinationUrl: BENNETT_UK_BLADDER_PDP_URL,
    defaultImageId: 'fix-01-gp-3am-hospital-bed',
    defaultImageUrl: '/bennett-uk-images/Fix_01_GP_3AM_Hospital_Bed_NHS.jpg',
    defaultImageHash: '',
  },
  {
    id: 'bennett-02-woman-50-pad-every-morning',
    number: 2,
    code: 'BS-02',
    title: 'If You Are a Woman Past 50 Who Puts a Pad in Her Underwear Every Morning for Her Bladder (H&B Cranberry Failure)',
    shortTitle: '#02 · Woman 50+ Pad Every Morning (H&B Failure)',
    stageId: 'stage1_unaware',
    stageNumber: 1,
    sophisticationLevel: 4,
    sophisticationBadge: 'Top Winner #2 · Kobiety 50+ Wkładki vs Żurawina',
    problemCluster: 'BLADDER_WOMEN_50',
    problemLabel: 'Codzienne wkładki urologiczne po 50-tce i brak efektu po żurawinie',
    recommendedFanpageId: '1415703161625474',
    recommendedFanpageName: 'Carys Morgan',
    createdDate: '2026-10-27',
    updatedDate: '2026-11-01',
    vocTrigger: '„If you are a woman past 50 who puts a pad in her underwear every morning, not because of her period, for her bladder...”',
    mechanismCore: 'Żurawina działa tylko na bakterie, a nie na osłabione po menopauzie tkanki dna miednicy. Styrian Δ7-sterols odżywiają mięśnie pęcherza od środka.',
    destinationUrl: BENNETT_UK_BLADDER_PDP_URL,
    defaultImageId: 'fix-02-woman-50-discreet-pad',
    defaultImageUrl: '/bennett-uk-images/Fix_02_Woman_50_Discreet_Bladder_Pad_Bed.jpg',
    defaultImageHash: '',
  },
  {
    id: 'bennett-03-surgical-nurse-25-years',
    number: 3,
    code: 'BS-03',
    title: 'I Have Been a Surgical Nurse for 25 Years, and Untreated Bladder Leakage Does Not Stay the Same',
    shortTitle: '#03 · Surgical Nurse 25 Years Operating Theatre',
    stageId: 'stage1_unaware',
    stageNumber: 1,
    sophisticationLevel: 4,
    sophisticationBadge: 'Top Winner #3 · Pielęgniarka Chirurgiczna 25 Lat',
    problemCluster: 'BLADDER_WOMEN_50',
    problemLabel: 'Postępujące osłabienie pęcherza u kobiet po 50. roku życia',
    recommendedFanpageId: '1277952565400407',
    recommendedFanpageName: 'Over 50s Health & Wellbeing UK (Health Daily UK)',
    createdDate: '2026-10-27',
    updatedDate: '2026-11-01',
    vocTrigger: '„I have been a surgical nurse for 25 years, and untreated bladder leakage does not stay the same - it gets worse, quietly...”',
    mechanismCore: 'Tłoczony na zimno poniżej 38°C olej ze styryjskich pestek dyni dostarcza fitosteroli wspierających elastyczność ściany pęcherza.',
    destinationUrl: BENNETT_UK_BLADDER_PDP_URL,
    defaultImageId: 'fix-03-surgical-nurse-pads-progression',
    defaultImageUrl: '/bennett-uk-images/Fix_03_Surgical_Nurse_Bedside_Pads_Progression.jpg',
    defaultImageHash: '',
  },
  {
    id: 'bennett-04-nurse-mother-2-bladder-meds',
    number: 4,
    code: 'BS-04',
    title: 'I Watched 2 Bladder Medications Slowly Take Over My Mother’s Life — Now My GP Wants to Put Me on the Same Ones',
    shortTitle: '#04 · Nurse: Mother on 2 Bladder Meds (20d Winner)',
    stageId: 'stage1_unaware',
    stageNumber: 1,
    sophisticationLevel: 4,
    sophisticationBadge: 'Top Winner #4 · Suchość w Ustach i Mgła vs Natura',
    problemCluster: 'BLADDER_WOMEN_50',
    problemLabel: 'Strach przed skutkami ubocznymi tabletek na pęcherz (suchość w ustach, zawroty)',
    recommendedFanpageId: '1277952565400407',
    recommendedFanpageName: 'Over 50s Health & Wellbeing UK (Health Daily UK)',
    createdDate: '2026-10-27',
    updatedDate: '2026-11-01',
    vocTrigger: '„I have watched 2 bladder medications slowly take over my mother’s life. Now my GP wants to put me on the same ones...”',
    mechanismCore: '100% wolny od leków suplement botaniczny (2,000mg Styrian Pumpkin Seed Oil) bez suchości w ustach, zaparć i porannego otumanienia.',
    destinationUrl: BENNETT_UK_BLADDER_PDP_URL,
    defaultImageId: 'lun-nhwc-1345',
    defaultImageUrl: '/bennett-uk-images/Ad_Natural_Health_Wellness_Club_1345589167748159.png',
    defaultImageHash: '',
  },
  {
    id: 'bennett-05-alarm-90-min-intervals',
    number: 5,
    code: 'BS-05',
    title: 'I Set an Alarm for 90-Minute Intervals Every Night for the Past 14 Months (Sceptical Trustpilot Reviewer)',
    shortTitle: '#05 · Alarm Every 90 Mins for 14 Months',
    stageId: 'stage1_unaware',
    stageNumber: 1,
    sophisticationLevel: 5,
    sophisticationBadge: 'Sofistykacja 5 · Zbuntowany Sceptyk (6 Słoiczków)',
    problemCluster: 'BLADDER_WOMEN_50',
    problemLabel: 'Budzik co 90 minut w nocy ze strachu przed mokrym łóżkiem',
    recommendedFanpageId: '1402524776268549',
    recommendedFanpageName: 'David T. Yorkshire Notes',
    createdDate: '2026-10-27',
    updatedDate: '2026-11-01',
    vocTrigger: '„I have set an alarm for 90-minute intervals every night for the past 14 months. I am the exact person who would leave a 1-star review...”',
    mechanismCore: 'Różnica między żółtym olejem paszowym z Amazona a rubinowo-zielonym olejem z bezłupinowej dyni styryjskiej (Cucurbita pepo var. styriaca).',
    destinationUrl: BENNETT_UK_BLADDER_PDP_URL,
    defaultImageId: 'fix-05-alarm-90-mins-bedside',
    defaultImageUrl: '/bennett-uk-images/Fix_05_Alarm_Every_90_Mins_Bedside_Hands.jpg',
    defaultImageHash: '',
  },
  {
    id: 'bennett-06-mapped-every-high-street-toilet',
    number: 6,
    code: 'BS-06',
    title: 'I Mapped the Location of Every Public Toilet on Every High Street I Use Regularly Without Thinking About It',
    shortTitle: '#06 · Mapped Every High Street Public Toilet',
    stageId: 'stage1_unaware',
    stageNumber: 1,
    sophisticationLevel: 5,
    sophisticationBadge: 'Sofistykacja 5 · Mapa Toalet na Mieście',
    problemCluster: 'BLADDER_WOMEN_50',
    problemLabel: 'Planowanie każdego wyjścia z domu wokół publicznych toalet',
    recommendedFanpageId: '1402524776268549',
    recommendedFanpageName: 'David T. Yorkshire Notes',
    createdDate: '2026-10-27',
    updatedDate: '2026-11-01',
    vocTrigger: '„I have mapped the location of every public toilet on every high street I use regularly and I did it without thinking about it...”',
    mechanismCore: 'Wyciszenie nadwrażliwych receptorów ściany pęcherza (false full-bladder alarms) dzięki pełnej dawce 2,000mg oleju tłoczonego na zimno.',
    destinationUrl: BENNETT_UK_BLADDER_PDP_URL,
    defaultImageId: 'fix-06-high-street-toilets-leaflet',
    defaultImageUrl: '/bennett-uk-images/Fix_06_High_Street_Toilets_Clinic_Leaflet.jpg',
    defaultImageHash: '',
  },
  {
    id: 'bennett-07-check-1-number-on-bottle-back',
    number: 7,
    code: 'BS-07',
    title: 'Before You Give Up on Bladder Supplements, Turn the Bottle Around and Check 1 Number on the Back (Tesco Car Park)',
    shortTitle: '#07 · Turn Bottle Around & Check 1 Number',
    stageId: 'stage1_unaware',
    stageNumber: 1,
    sophisticationLevel: 5,
    sophisticationBadge: 'Sofistykacja 5 · Test Etykiety 2,000mg',
    problemCluster: 'BLADDER_WOMEN_50',
    problemLabel: 'Incydent na parkingu pod Tesco i odkrycie zbyt niskiej dawki w tanich kapsułkach',
    recommendedFanpageId: '1415703161625474',
    recommendedFanpageName: 'Carys Morgan',
    createdDate: '2026-10-27',
    updatedDate: '2026-11-01',
    vocTrigger: '„Before you give up on bladder supplements, turn the bottle around and check 1 number on the back. I wish someone had told me that before Tesco...”',
    mechanismCore: 'Tanie kapsułki mają 250-400mg utlenionego oleju. Kliniczny próg nasycenia tkanek miednicy to 2,000mg zimnotłoczonego oleju styryjskiego dziennie.',
    destinationUrl: BENNETT_UK_BLADDER_PDP_URL,
    defaultImageId: 'fix-07-turn-bottle-check-2000mg',
    defaultImageUrl: '/bennett-uk-images/Fix_07_Turn_Bottle_Around_Check_2000mg.jpg',
    defaultImageHash: '',
  },
  {
    id: 'bennett-08-every-toilet-front-door-to-m1',
    number: 8,
    code: 'BS-08',
    title: 'I Knew Where Every Public Toilet Was Between My Front Door and the M1, and I Still Blamed the Supplements',
    shortTitle: '#08 · Every Public Toilet Front Door to M1',
    stageId: 'stage1_unaware',
    stageNumber: 1,
    sophisticationLevel: 5,
    sophisticationBadge: 'Sofistykacja 5 · Trasa M1 & Stacje Benzynowe',
    problemCluster: 'BLADDER_WOMEN_50',
    problemLabel: 'Strach przed jazdą autostradą M1 bez postoju co 40 minut',
    recommendedFanpageId: '1415703161625474',
    recommendedFanpageName: 'Carys Morgan',
    createdDate: '2026-10-27',
    updatedDate: '2026-11-01',
    vocTrigger: '„I knew where every public toilet was between my front door and the M1, and I still blamed the supplements...”',
    mechanismCore: '2 rubinowe kapsułki softgel dziennie (2,000mg Styrian Oil + 200mg Saw Palmetto) przywracają spokój w podróży w 4-8 tygodni.',
    destinationUrl: BENNETT_UK_BLADDER_PDP_URL,
    defaultImageId: 'fix-08-motorway-m1-services-pov',
    defaultImageUrl: '/bennett-uk-images/Fix_08_Motorway_M1_Services_Car_POV.jpg',
    defaultImageHash: '',
  },

  // ==================== STAGE 2: MEN'S 50+ PROSTATE (8 LFS) ====================
  {
    id: 'bennett-09-dad-brian-davies-turp-18-years',
    number: 9,
    code: 'BS-09',
    title: 'The Last Time My Dad Had an Erection Was 3 Days Before His Prostate Surgery. He Was 52. He Lived Another 18 Years (39d Winner)',
    shortTitle: '#09 · Dad Brian Davies TURP 18 Years (39d Winner)',
    stageId: 'stage2_problem_aware',
    stageNumber: 2,
    sophisticationLevel: 4,
    sophisticationBadge: 'Mega-Winner Prostaty #1 · 39 Dni Emisji Non-Stop',
    problemCluster: 'PROSTATE_MEN_50',
    problemLabel: 'Strach przed operacją TURP, utratą sprawności i wstawaniem 5 razy w nocy',
    recommendedFanpageId: '1277952565400407',
    recommendedFanpageName: 'Over 50s Health & Wellbeing UK (Health Daily UK)',
    createdDate: '2026-10-27',
    updatedDate: '2026-11-01',
    vocTrigger: '„The last time my dad had an erection was 3 days before his prostate surgery. He was 52. He lived another 18 years, completely unable to perform...”',
    mechanismCore: 'Wczesne wsparcie tkanek prostaty i szyi pęcherza za pomocą Δ7-fitosteroli i Saw Palmetto (hamowanie konwersji DHT bez skutków ubocznych).',
    destinationUrl: BENNETT_UK_PROSTATE_PDP_URL,
    defaultImageId: 'lun-nhwc-1571',
    defaultImageUrl: '/bennett-uk-images/Ad_Natural_Health_Wellness_Club_1571135268018680.png',
    defaultImageHash: '',
  },
  {
    id: 'bennett-10-nhs-nurse-husband-refused-flomax',
    number: 10,
    code: 'BS-10',
    title: 'My Husband Refused Flomax for 4 Years. Here Is What Happened to His Prostate (AdSpy USA #3 Top Spender · 1,170👍 + Lunovyn 34d Winner)',
    shortTitle: '#10 · Husband Refused Flomax 4y (AdSpy #3 · 1,170👍)',
    stageId: 'stage2_problem_aware',
    stageNumber: 2,
    sophisticationLevel: 4,
    sophisticationBadge: 'AdSpy USA #3 Top Spender (1,170👍 / 93💬 / 139🔄) + 34d Winner',
    problemCluster: 'PROSTATE_MEN_50',
    problemLabel: 'Mąż pielęgniarki NHS odmawiający tamsulozyny/Flomaxu i wstający 4 razy w nocy (identyczny wspólny winner Elivora USA + Lunovyn)',
    recommendedFanpageId: '1277952565400407',
    recommendedFanpageName: 'Over 50s Health & Wellbeing UK (Health Daily UK)',
    createdDate: '2026-10-27',
    updatedDate: '2026-11-01',
    vocTrigger: '„My husband refused Flomax for 4 years. Here is what happened to his prostate. I have been an NHS nurse for 28 years...”',
    mechanismCore: 'Synergia 2,000mg zimnotłoczonego oleju ze styryjskich pestek dyni + 200mg Saw Palmetto pomaga utrzymać mocny strumień i pełne opróżnianie pęcherza.',
    destinationUrl: BENNETT_UK_PROSTATE_PDP_URL,
    defaultImageId: 'fix-10-nhs-nurse-tamsulosin',
    defaultImageUrl: '/bennett-uk-images/Fix_10_NHS_Nurse_Wife_Flomax_Tamsulosin.jpg',
    defaultImageHash: '',
  },
  {
    id: 'bennett-11-husband-tamsulosin-june-2024',
    number: 11,
    code: 'BS-11',
    title: 'My Husband Started Taking Tamsulosin in June 2024. Gave Up the Pint He Had With Dinner for 36 Years (36k-Char Epopeja)',
    shortTitle: '#11 · Husband on Tamsulosin June 2024 (36k Epopeja)',
    stageId: 'stage2_problem_aware',
    stageNumber: 2,
    sophisticationLevel: 4,
    sophisticationBadge: 'Winner Prostaty #3 · Kieruje na Advertorial 7 Reasons',
    problemCluster: 'PROSTATE_MEN_50',
    problemLabel: 'Brak poprawy snu mimo rezygnacji z herbaty po 16:00 i wieczornego piwa',
    recommendedFanpageId: '1415703161625474',
    recommendedFanpageName: 'Carys Morgan',
    createdDate: '2026-10-27',
    updatedDate: '2026-11-01',
    vocTrigger: '„My husband started taking tamsulosin in June 2024. Took it every evening without fail. Stopped drinking tea after 4. Gave up the pint...”',
    mechanismCore: 'Odżywienie receptorów prostaty i mięśnia wypieracza pęcherza fitosterolami Δ7, prowadzące czytelnika na przed-lander 7 Reasons.',
    destinationUrl: `${BENNETT_UK_BLADDER_ADV_URL}?v=m`,
    defaultImageId: 'lun-catherine-1049',
    defaultImageUrl: '/bennett-uk-images/Ad_Catherine_Hughes_1049223327991730.png',
    defaultImageHash: '',
  },
  {
    id: 'bennett-12-two-men-same-age-same-urologist',
    number: 12,
    code: 'BS-12',
    title: '2 Men. Same Age. Same Urologist. 1 Spent Years Getting Up 5 Times a Night — The Other Sleeps Through Till 6:30 AM',
    shortTitle: '#12 · 2 Men Same Age Same Urologist (35k Epopeja)',
    stageId: 'stage2_problem_aware',
    stageNumber: 2,
    sophisticationLevel: 4,
    sophisticationBadge: 'Winner Prostaty #4 · Kontrast 2 Pacjentów Urologa',
    problemCluster: 'PROSTATE_MEN_50',
    problemLabel: 'Dlaczego u jednego 60-latka nocne wstawanie mija, a drugi męczy się latami',
    recommendedFanpageId: '1277952565400407',
    recommendedFanpageName: 'Over 50s Health & Wellbeing UK (Health Daily UK)',
    createdDate: '2026-10-27',
    updatedDate: '2026-11-01',
    vocTrigger: '„2 men. Same age. Same urologist. 1 had spent years getting up 4 and 5 times a night, standing over that toilet in the dark...”',
    mechanismCore: 'Zimnotłoczony austriacki olej styryjski (bogaty w wolne fitosterole Δ7) w połączeniu z Saw Palmetto wspiera pełne opróżnianie pęcherza przed snem.',
    destinationUrl: `${BENNETT_UK_BLADDER_ADV_URL}?v=m`,
    defaultImageId: 'lun-catherine-4662',
    defaultImageUrl: '/bennett-uk-images/Ad_Catherine_Hughes_4662104310685847.png',
    defaultImageHash: '',
  },
  {
    id: 'bennett-13-husband-tried-cheap-pso-nothing',
    number: 13,
    code: 'BS-13',
    title: 'My Husband Tried Pumpkin Seed Oil for His Prostate and It Did Absolutely Nothing — Here Is Why',
    shortTitle: '#13 · Husband Tried Cheap PSO & It Did Nothing',
    stageId: 'stage2_problem_aware',
    stageNumber: 2,
    sophisticationLevel: 5,
    sophisticationBadge: 'Sofistykacja 5 · Zdemaskowanie Taniego Oleju z H&B',
    problemCluster: 'PROSTATE_MEN_50',
    problemLabel: 'Dlaczego tanie żółte kapsułki z pestek dyni za £9 nie działają na prostatę',
    recommendedFanpageId: '1415703161625474',
    recommendedFanpageName: 'Carys Morgan',
    createdDate: '2026-10-27',
    updatedDate: '2026-11-01',
    vocTrigger: '„My husband tried pumpkin seed oil for his prostate and it did absolutely nothing. Here is what I found out about why...”',
    mechanismCore: 'Wysoka temperatura (120°C) i heksan niszczą 80% fitosteroli w tanich kapsułkach. Tylko rubinowy olej tłoczony poniżej 38°C zachowuje aktywne sterole.',
    destinationUrl: BENNETT_UK_PROSTATE_PDP_URL,
    defaultImageId: 'lun-catherine-1754',
    defaultImageUrl: '/bennett-uk-images/Ad_Catherine_Hughes_1754497739147004.jpg',
    defaultImageHash: '',
  },
  {
    id: 'bennett-14-buying-prostate-supplements-longer-than-car',
    number: 14,
    code: 'BS-14',
    title: 'I Have Been Buying Prostate Supplements for Longer Than Some Blokes Keep a Car — Still Getting Up 4 Times a Night',
    shortTitle: '#14 · Buying Prostate Supplements Longer Than a Car',
    stageId: 'stage2_problem_aware',
    stageNumber: 2,
    sophisticationLevel: 5,
    sophisticationBadge: 'Sofistykacja 5 · 6 Lat Szukania od 56. do 62. Roku Życia',
    problemCluster: 'PROSTATE_MEN_50',
    problemLabel: '6 lat nieskutecznych tabletek z cynkiem, pokrzywą i suchym saw palmetto',
    recommendedFanpageId: '1402524776268549',
    recommendedFanpageName: 'David T. Yorkshire Notes',
    createdDate: '2026-10-27',
    updatedDate: '2026-11-01',
    vocTrigger: '„I have been buying prostate supplements for longer than some blokes keep a car. Still getting up 4 times a night. 6 years. I started at 56...”',
    mechanismCore: 'Fitosterole są rozpuszczalne w tłuszczach — suchy proszek w tabletce przelatuje przez układ pokarmowy, podczas gdy płynna matryca lipidowa 2,000mg wchłania się w 100%.',
    destinationUrl: BENNETT_UK_PROSTATE_PDP_URL,
    defaultImageId: 'fix-14-prostate-supplements-graveyard',
    defaultImageUrl: '/bennett-uk-images/Fix_14_Prostate_Supplements_Graveyard_Counter.jpg',
    defaultImageHash: '',
  },
  {
    id: 'bennett-15-william-aikens-threw-away-6-bottles',
    number: 15,
    code: 'BS-15',
    title: 'I Have Thrown Away 6 Bottles of Pumpkin Seed Oil — I Am the Exact Person Who Would Leave a 1-Star Review on Trustpilot',
    shortTitle: '#15 · William Aikens: Threw Away 6 Bottles of PSO',
    stageId: 'stage2_problem_aware',
    stageNumber: 2,
    sophisticationLevel: 5,
    sophisticationBadge: 'Sofistykacja 5 · Seria William Aikens 66yo',
    problemCluster: 'PROSTATE_MEN_50',
    problemLabel: 'Wyrzucenie 6 butelek zwykłego oleju przed odkryciem odmiany styryjskiej',
    recommendedFanpageId: '1402524776268549',
    recommendedFanpageName: 'David T. Yorkshire Notes',
    createdDate: '2026-10-27',
    updatedDate: '2026-11-01',
    vocTrigger: '„I have thrown away 6 bottles of pumpkin seed oil. I am the exact person this ad is written for, and the exact person who would leave a 1-star review...”',
    mechanismCore: 'Test pod światło: głęboka rubinowo-bursztynowa barwa kapsułki Bennett & Seed dowodzi obecności nieutlenionych karotenoidów i Δ7-steroli.',
    destinationUrl: BENNETT_UK_PROSTATE_PDP_URL,
    defaultImageId: 'bs-03-red-vs-yellow',
    defaultImageUrl: '/bennett-uk-images/03_Bennett_And_Seed_Macro_Red_vs_Yellow_Softgel.jpg',
    defaultImageHash: '',
  },
  {
    id: 'bennett-16-japan-1991-clinical-trial-prostate',
    number: 16,
    code: 'BS-16',
    title: 'In 1991, a Clinical Trial Proved That a Cold-Pressed Seed Oil Reduced Night-Time Bathroom Trips by More Than Half',
    shortTitle: '#16 · 1991 Clinical Trial: Night Trips Cut by Half',
    stageId: 'stage2_problem_aware',
    stageNumber: 2,
    sophisticationLevel: 5,
    sophisticationBadge: 'Sofistykacja 5 · Dowód Kliniczny 2,000mg/dzień',
    problemCluster: 'PROSTATE_MEN_50',
    problemLabel: 'Badania kliniczne nad dawką 2,000mg oleju z pestek dyni styryjskiej u mężczyzn 50+',
    recommendedFanpageId: '1402524776268549',
    recommendedFanpageName: 'David T. Yorkshire Notes',
    createdDate: '2026-10-27',
    updatedDate: '2026-11-01',
    vocTrigger: '„In 1991, a clinical trial conducted in Japan proved that a cold-pressed seed oil reduced night-time bathroom trips by more than half...”',
    mechanismCore: 'Kliniczna porcja 2,000mg tłoczonego na zimno oleju styryjskiego dziennie przez 6-12 tygodni zmniejsza częstotliwość nocnego wstawania i poprawia siłę strumienia.',
    destinationUrl: BENNETT_UK_PROSTATE_PDP_URL,
    defaultImageId: 'bs-08-two-capsules-palm',
    defaultImageUrl: '/bennett-uk-images/08_Bennett_And_Seed_Two_Capsules_Palm_Macro.jpg',
    defaultImageHash: '',
  },

  // ==================== ELIVORA ADSPY USA TOP 5 WINNERS (BS-31 to BS-34 + BS-10 above) ====================
  {
    id: 'bennett-31-elivora-urologist-stop-3-things-flomax',
    number: 31,
    code: 'BS-31',
    title: 'I’m a Urologist, and Here Are 3 Things Men Over 50 Need to Stop Doing Immediately If They Keep Getting Up at Night (AdSpy USA #1 · 1,416👍)',
    shortTitle: '#31 · AdSpy USA #1: Urologist Stop 3 Things (1,416👍)',
    stageId: 'stage2_problem_aware',
    stageNumber: 2,
    sophisticationLevel: 4,
    sophisticationBadge: 'AdSpy USA #1 Top Spender · 1,416 Reakcji (1,319👍 / 184💬 / 97🔄)',
    problemCluster: 'PROSTATE_MEN_50',
    problemLabel: '3 błędy mężczyzn 50+ przy nocnym wstawaniu: maskowanie objawów Flomaxem, sok żurawinowy i ignorowanie konwersji DHT',
    recommendedFanpageId: '1424554760734318',
    recommendedFanpageName: 'Dr Claire Foster',
    createdDate: '2026-11-01',
    updatedDate: '2026-11-01',
    vocTrigger: '„I’m a urologist, and here are 3 things men over 50 need to stop doing immediately if they keep getting up to pee at night. Number 1: Stop taking Flomax...”',
    mechanismCore: '2,000mg zimnotłoczonego oleju ze styryjskich pestek dyni + Saw Palmetto blokuje 5-alfa-reduktazę Typu I i II oraz dostarcza beta-sitosterol.',
    destinationUrl: BENNETT_UK_PROSTATE_PDP_URL,
    defaultImageId: 'elivora-tt-07-urologist-scrubs',
    defaultImageUrl: '/bennett-uk-images/Elivora_TT_07_facebook_1661284845612140.jpg',
    defaultImageHash: '',
  },
  {
    id: 'bennett-32-elivora-please-dont-buy-christopher',
    number: 32,
    code: 'BS-32',
    title: 'Please Don’t Buy Bennett & Seed Pumpkin Seed Oil Softgels — We Didn’t Warn You What Sleeping Through the Night Feels Like (AdSpy USA #2 · 1,359👍)',
    shortTitle: '#32 · AdSpy USA #2: Please Don’t Buy (1,359👍)',
    stageId: 'stage2_problem_aware',
    stageNumber: 2,
    sophisticationLevel: 5,
    sophisticationBadge: 'AdSpy USA #2 Top Spender · 1,359 Reakcji (1,313👍 / 76💬 / 100🔄)',
    problemCluster: 'PROSTATE_MEN_50',
    problemLabel: 'Reverse-psychology hook współzałożyciela o ojcu, który znikał z własnego życia przez nocne wstawanie, i wyprawie po zimnotłoczony olej do Styrii',
    recommendedFanpageId: '1277952565400407',
    recommendedFanpageName: 'Over 50s Health & Wellbeing UK (Health Daily UK)',
    createdDate: '2026-11-01',
    updatedDate: '2026-11-01',
    vocTrigger: '„Please don’t buy Bennett & Seed Pumpkin Seed Oil softgels. We told you it would help your prostate. We didn’t warn you what it feels like to sleep through the night again...”',
    mechanismCore: '2,000mg zimnotłoczonego oleju z austriackiej Styrii + Saw Palmetto (2 połówki tego samego problemu: mniej wytwarzanego DHT i blokada receptorów).',
    destinationUrl: BENNETT_UK_PROSTATE_PDP_URL,
    defaultImageId: 'bs-08-two-capsules-palm',
    defaultImageUrl: '/bennett-uk-images/08_Bennett_And_Seed_Two_Capsules_Palm_Macro.jpg',
    defaultImageHash: '',
  },
  {
    id: 'bennett-33-elivora-dangerous-foods-urology-ward',
    number: 33,
    code: 'BS-33',
    title: 'Here Are the Most Dangerous Foods for Your Prostate — I Spent 14 Years on an NHS Urology Ward Watching Men Find Out Too Late (AdSpy USA #4 · 221👍)',
    shortTitle: '#33 · AdSpy USA #4: Dangerous Foods Urology Ward (221👍)',
    stageId: 'stage2_problem_aware',
    stageNumber: 2,
    sophisticationLevel: 4,
    sophisticationBadge: 'AdSpy USA #4 Top Spender · 221 Reakcji (211👍 / 53💬 / 25🔄)',
    problemCluster: 'PROSTATE_MEN_50',
    problemLabel: '4 grupy żywności drażniące pęcherz i podbijające insulinę/DHT oraz cicha rekomendacja pielęgniarki z oddziału urologicznego',
    recommendedFanpageId: '1277952565400407',
    recommendedFanpageName: 'Over 50s Health & Wellbeing UK (Health Daily UK)',
    createdDate: '2026-11-01',
    updatedDate: '2026-11-01',
    vocTrigger: '„Here are the most dangerous foods for your prostate. I do not care if you do not believe me. I have spent 14 years on an NHS urology ward watching men find out too late...”',
    mechanismCore: 'Połączenie eliminacji wyzwalaczy zapalnych z 2,000mg zimnotłoczonego oleju styryjskiego + 200mg Saw Palmetto wyciszającym sygnał wzrostu DHT.',
    destinationUrl: BENNETT_UK_PROSTATE_PDP_URL,
    defaultImageId: 'elivora-tt-14-urology-nurse-woodland',
    defaultImageUrl: '/bennett-uk-images/Elivora_TT_14_facebook_1432680771707425.jpg',
    defaultImageHash: '',
  },
  {
    id: 'bennett-34-elivora-urologist-refused-tamsulosin',
    number: 34,
    code: 'BS-34',
    title: 'If You’re on Tamsulosin, You Should Know I’m a Urologist Who Refused It for My Own Prostate After Prescribing It to Thousands (AdSpy USA #5 · 112👍)',
    shortTitle: '#34 · AdSpy USA #5: Urologist Refused Tamsulosin (112👍)',
    stageId: 'stage2_problem_aware',
    stageNumber: 2,
    sophisticationLevel: 5,
    sophisticationBadge: 'AdSpy USA #5 Top Spender · 112 Reakcji (107👍 / 8🔄)',
    problemCluster: 'PROSTATE_MEN_50',
    problemLabel: 'Chirurg urolog po 3,000 zabiegów odmawia tamsulozyny w wieku 54 lat, gdy sam zaczyna wstawać 4 razy w nocy',
    recommendedFanpageId: '1432534613265585',
    recommendedFanpageName: 'Richard Foster',
    createdDate: '2026-11-01',
    updatedDate: '2026-11-01',
    vocTrigger: '„If you’re on Tamsulosin, you should know I’m a consultant urologist who refused it for my own prostate after prescribing it to thousands of men...”',
    mechanismCore: '2,000mg zimnotłoczonego oleju styryjskiego (rubinowy test na białym spodku) + Saw Palmetto uderzające w obie połówki problemu DHT.',
    destinationUrl: BENNETT_UK_PROSTATE_PDP_URL,
    defaultImageId: 'elivora-adspy-04-low-vs-powerful-flow',
    defaultImageUrl: '/bennett-uk-images/Fix_34_Low_vs_Powerful_Flow_1x1.jpg',
    defaultImageHash: '',
  },

  // ==================== STAGE 3: CHOLESTEROL & HEART 50+ (6 LFS) ====================
  {
    id: 'bennett-17-women-50-65-cholesterol-bit-high',
    number: 17,
    code: 'BS-17',
    title: 'Millions of British Women Between 50 and 65 Have Been Told Their Cholesterol Is “A Bit High” (Sarah, 58, Harrogate)',
    shortTitle: '#17 · Women 50-65 Told Cholesterol Is "A Bit High"',
    stageId: 'stage3_solution_aware',
    stageNumber: 3,
    sophisticationLevel: 4,
    sophisticationBadge: 'Cholesterol Winner #1 · Menopauza a Skok LDL',
    problemCluster: 'CHOLESTEROL_HEART_50',
    problemLabel: 'Wzrost cholesterolu u kobiet po 50-tce mimo zdrowej diety i spacerów',
    recommendedFanpageId: '1415703161625474',
    recommendedFanpageName: 'Carys Morgan',
    createdDate: '2026-10-28',
    updatedDate: '2026-11-01',
    vocTrigger: '„Millions of British women between 50 and 65 have been told their cholesterol is a bit high. My name is Sarah. I am 58. I live just outside Harrogate...”',
    mechanismCore: 'Beta-sitosterol i fitosterole Δ7 mają budowę zbliżoną do cholesterolu i konkurują z nim w jelitach, ograniczając jego wchłanianie do krwi.',
    destinationUrl: BENNETT_UK_CHOLESTEROL_ADV_URL,
    defaultImageId: 'fix-17-gp-cholesterol-slip',
    defaultImageUrl: '/bennett-uk-images/Fix_17_GP_Cholesterol_Slip_Of_Paper.jpg',
    defaultImageHash: '',
  },
  {
    id: 'bennett-18-women-stop-statins-first-year',
    number: 18,
    code: 'BS-18',
    title: 'A Huge Number of British Women Put on Statins Stop Taking Them Within the First Year — Here Is What I Learned at 58',
    shortTitle: '#18 · Why Women Stop Statins in Year 1 (Calf Aches)',
    stageId: 'stage3_solution_aware',
    stageNumber: 3,
    sophisticationLevel: 4,
    sophisticationBadge: 'Cholesterol Winner #2 · Zero Bólu Łydek i Mgły',
    problemCluster: 'CHOLESTEROL_HEART_50',
    problemLabel: 'Szukanie naturalnego wsparcia sterolami roślinnymi bez nocnych skurczów łydek',
    recommendedFanpageId: '1415703161625474',
    recommendedFanpageName: 'Carys Morgan',
    createdDate: '2026-10-28',
    updatedDate: '2026-11-01',
    vocTrigger: '„A huge number of British women put on statins stop taking them within the first year. This is what I did in the 6 months before my review...”',
    mechanismCore: '2,000mg zimnotłoczonego oleju styryjskiego dostarcza steroli roślinnych oraz kwasów Omega-6 (linolowego) i Omega-9 (oleinowego) wspierających profil lipidowy.',
    destinationUrl: BENNETT_UK_CHOLESTEROL_ADV_URL,
    defaultImageId: 'fix-18-statin-night-calf-cramp',
    defaultImageUrl: '/bennett-uk-images/Fix_18_Statin_Night_Calf_Cramp_2AM.jpg',
    defaultImageHash: '',
  },
  {
    id: 'bennett-19-doctor-slightly-high-bp-cardiac',
    number: 19,
    code: 'BS-19',
    title: 'I Have Referred Too Many Men With “Slightly High” Readings for Cardiac Workups Years Later to Stay Quiet About This',
    shortTitle: '#19 · Doctor: "Lose a Little Weight & Come Back"',
    stageId: 'stage3_solution_aware',
    stageNumber: 3,
    sophisticationLevel: 4,
    sophisticationBadge: 'Cholesterol Winner #3 · Perspektywa Lekarza',
    problemCluster: 'CHOLESTEROL_HEART_50',
    problemLabel: 'Bagatelizowanie granicznych wyników lipidogramu i ciśnienia po 50-tce',
    recommendedFanpageId: '1424554760734318',
    recommendedFanpageName: 'Dr Claire Foster',
    createdDate: '2026-10-28',
    updatedDate: '2026-11-01',
    vocTrigger: '„I have referred too many men with slightly high blood pressure for cardiac workups years later to stay quiet about this...”',
    mechanismCore: 'Naturalne tokoferole (witamina E), karotenoidy i nienasycone kwasy tłuszczowe chronią naczynia przed stresem oksydacyjnym.',
    destinationUrl: BENNETT_UK_CHOLESTEROL_ADV_URL,
    defaultImageId: 'lun-nhwc-1571',
    defaultImageUrl: '/bennett-uk-images/Ad_Natural_Health_Wellness_Club_1571135268018680.png',
    defaultImageHash: '',
  },
  {
    id: 'bennett-20-72yo-stranger-sobbing-tesco-car-park',
    number: 20,
    code: 'BS-20',
    title: 'I Helped a 72-Year-Old Stranger Load His Shopping Into His Boot at Tesco Last Tuesday and He Ended Up Sobbing in the Car Park',
    shortTitle: '#20 · 72yo Widower Sobbing in Tesco Car Park',
    stageId: 'stage3_solution_aware',
    stageNumber: 3,
    sophisticationLevel: 4,
    sophisticationBadge: 'Cholesterol Story #4 · Emocjonalny Hit z Tesco',
    problemCluster: 'CHOLESTEROL_HEART_50',
    problemLabel: 'Historia 72-letniego wdowca pod Tesco i dbania o serce oraz witalność po 60-tce',
    recommendedFanpageId: '1415703161625474',
    recommendedFanpageName: 'Carys Morgan',
    createdDate: '2026-10-28',
    updatedDate: '2026-11-01',
    vocTrigger: '„I helped a 72-year-old stranger load his shopping into his boot at Tesco last Tuesday and he ended up sobbing in the car park...”',
    mechanismCore: 'Kompleksowe wsparcie serca, lipidów i spokojnego snu dla seniorów w 2 łatwych do połknięcia kapsułkach dziennie.',
    destinationUrl: BENNETT_UK_CHOLESTEROL_ADV_URL,
    defaultImageId: 'fix-20-tesco-widower-car-park',
    defaultImageUrl: '/bennett-uk-images/Fix_20_72yo_Widower_Tesco_Car_Park_Rain.jpg',
    defaultImageHash: '',
  },
  {
    id: 'bennett-21-husband-top-heart-doctor-oxidised-ldl',
    number: 21,
    code: 'BS-21',
    title: 'My Husband Was 1 of Britain’s Top Heart Doctors — Why Oxidised LDL Inside Artery Walls Is the Real Conversation',
    shortTitle: '#21 · Heart Doctor Widow: Oxidised LDL vs Sterols',
    stageId: 'stage3_solution_aware',
    stageNumber: 3,
    sophisticationLevel: 5,
    sophisticationBadge: 'Sofistykacja 5 · Utlenianie LDL a Antyoksydanty',
    problemCluster: 'CHOLESTEROL_HEART_50',
    problemLabel: 'Rola antyoksydantów rozpuszczalnych w tłuszczach i fitosteroli w ochronie naczyń',
    recommendedFanpageId: '1277952565400407',
    recommendedFanpageName: 'Over 50s Health & Wellbeing UK (Health Daily UK)',
    createdDate: '2026-10-28',
    updatedDate: '2026-11-01',
    vocTrigger: '„My husband was 1 of Britain’s top heart doctors. He spent 31 years treating arterial health...”',
    mechanismCore: 'Nierafinowany olej styryjski tłoczony poniżej 38°C zachowuje pełne spektrum tokoferoli i fitosteroli chroniących lipidy przed utlenianiem.',
    destinationUrl: BENNETT_UK_CHOLESTEROL_ADV_URL,
    defaultImageId: 'fix-21-cardiologist-widow-notebook',
    defaultImageUrl: '/bennett-uk-images/Fix_21_Cardiologist_Widow_Notebook_Sterols.jpg',
    defaultImageHash: '',
  },
  {
    id: 'bennett-22-neighbour-mowed-lawn-6am-30-years',
    number: 22,
    code: 'BS-22',
    title: 'My Neighbour Mowed His Lawn at 6:00 AM Every Saturday for 30 Years — Until 1 Saturday Morning the Mower Stayed Silent',
    shortTitle: '#22 · Neighbour Mowed Lawn at 6:00 AM for 30 Years',
    stageId: 'stage3_solution_aware',
    stageNumber: 3,
    sophisticationLevel: 4,
    sophisticationBadge: 'Cholesterol Story #6 · Ciche Ryzyko Po 60-tce',
    problemCluster: 'CHOLESTEROL_HEART_50',
    problemLabel: 'Dlaczego pozorna kondycja po 60-tce nie zwalnia z dbania o profil lipidowy',
    recommendedFanpageId: '1277952565400407',
    recommendedFanpageName: 'Over 50s Health & Wellbeing UK (Health Daily UK)',
    createdDate: '2026-10-28',
    updatedDate: '2026-11-01',
    vocTrigger: '„My neighbour mowed his lawn at 6:00 AM every Saturday for 30 years. Then 1 morning the mower stayed silent...”',
    mechanismCore: 'Codzienna porcja 2,000mg steroli roślinnych i kwasów Omega-6/9 jako prosty poranny nawyk wspierający układ krążenia po 50-tce.',
    destinationUrl: BENNETT_UK_CHOLESTEROL_ADV_URL,
    defaultImageId: 'fix-22-neighbour-6am-lawnmower',
    defaultImageUrl: '/bennett-uk-images/Fix_22_Neighbour_6AM_Lawnmower_British_Garden.jpg',
    defaultImageHash: '',
  },

  // ==================== STAGE 4: KIDNEY & FILTRATION 50+ (4 LFS) ====================
  {
    id: 'bennett-23-husband-renal-specialist-filtration',
    number: 23,
    code: 'BS-23',
    title: 'My Husband Spent 28 Years Studying Kidney & Urinary Filtration in Britain — What Every Adult Over 50 Should Know',
    shortTitle: '#23 · Renal Specialist Widow (45k-Char Epopeja)',
    stageId: 'stage4_product_aware',
    stageNumber: 4,
    sophisticationLevel: 5,
    sophisticationBadge: 'Kidney Winner #1 · Wsparcie Filtracji i Odpływu (Compliant)',
    problemCluster: 'KIDNEY_FILTRATION_50',
    problemLabel: 'Zaleganie moczu, ciśnienie wsteczne i stres oksydacyjny w drogach moczowych po 50-tce',
    recommendedFanpageId: '1277952565400407',
    recommendedFanpageName: 'Over 50s Health & Wellbeing UK (Health Daily UK)',
    createdDate: '2026-10-29',
    updatedDate: '2026-11-01',
    vocTrigger: '„My husband spent 28 years studying kidney and urinary health in Britain. Here is what he wished every adult over 50 knew...”',
    mechanismCore: 'Sprawne, pełne opróżnianie pęcherza i antyoksydanty rozpuszczalne w tłuszczach (witamina E + karotenoidy) odciążają dolne i górne drogi moczowe.',
    destinationUrl: BENNETT_UK_KIDNEY_ADV_URL,
    defaultImageId: 'lun-margot-1088',
    defaultImageUrl: '/bennett-uk-images/Ad_Margot_Whitaker_1088491380596267.png',
    defaultImageHash: '',
  },
  {
    id: 'bennett-24-doctor-we-will-keep-an-eye-on-it',
    number: 24,
    code: 'BS-24',
    title: 'Nearly Half of Adults Over 50 With Sluggish Urinary Filtration Spend Months Being Told: “We Will Keep an Eye on It”',
    shortTitle: '#24 · Doctor: "We Will Keep an Eye on It"',
    stageId: 'stage4_product_aware',
    stageNumber: 4,
    sophisticationLevel: 5,
    sophisticationBadge: 'Kidney Winner #2 · Proaktywne Wsparcie Po 50-tce',
    problemCluster: 'KIDNEY_FILTRATION_50',
    problemLabel: 'Bierne czekanie vs codzienne odżywianie nabłonka dróg moczowych',
    recommendedFanpageId: '1432534613265585',
    recommendedFanpageName: 'Richard Foster',
    createdDate: '2026-10-29',
    updatedDate: '2026-11-01',
    vocTrigger: '„Nearly half of my patients with sluggish urinary numbers spend months being told: We will keep an eye on it...”',
    mechanismCore: '2,000mg czystego, mechanicznie tłoczonego oleju bez rozpuszczalników chemicznych i dwutlenku tytanu wspiera komfort dróg moczowych.',
    destinationUrl: BENNETT_UK_KIDNEY_ADV_URL,
    defaultImageId: 'fix-24-kidney-ankle-sock-marks',
    defaultImageUrl: '/bennett-uk-images/Fix_24_Kidney_Ankle_Sock_Marks_Clean_No_UI.jpg',
    defaultImageHash: '',
  },
  {
    id: 'bennett-25-my-dad-peter-puffy-ankles-filtration',
    number: 25,
    code: 'BS-25',
    title: 'My Dad, Peter, Started Noticing Deep Sock Marks Around His Ankles and 3 Night-Time Loo Trips 3 Years Ago',
    shortTitle: '#25 · My Dad Peter: Sock Marks & Night Trips',
    stageId: 'stage4_product_aware',
    stageNumber: 4,
    sophisticationLevel: 5,
    sophisticationBadge: 'Kidney Winner #3 · Opuchnięte Kostki i Nocne Wstawanie',
    problemCluster: 'KIDNEY_FILTRATION_50',
    problemLabel: 'Ślady po skarpetkach na kostkach wieczorem, poranna opuchlizna i 3 pobudki w nocy',
    recommendedFanpageId: '1277952565400407',
    recommendedFanpageName: 'Over 50s Health & Wellbeing UK (Health Daily UK)',
    createdDate: '2026-10-29',
    updatedDate: '2026-11-01',
    vocTrigger: '„My dad, Peter, started noticing deep sock marks around his ankles and 3 night-time loo trips 3 years ago...”',
    mechanismCore: 'Wsparcie naturalnego rytmu wypłukiwania płynów w ciągu dnia i wyciszenie nocnego parcia na pęcherz bez zalewania organizmu litrami wody na noc.',
    destinationUrl: BENNETT_UK_KIDNEY_PDP_URL,
    defaultImageId: 'lun-margot-1800',
    defaultImageUrl: '/bennett-uk-images/Ad_Margot_Whitaker_1800175671274137.png',
    defaultImageHash: '',
  },
  {
    id: 'bennett-26-silent-filtration-strain-feel-normal',
    number: 26,
    code: 'BS-26',
    title: 'The Most Frustrating Thing About Sluggish Urinary Filtration Past 50 Is How Normal You Feel Until the 3:00 PM Crash',
    shortTitle: '#26 · Silent Filtration Strain & 3:00 PM Crash',
    stageId: 'stage4_product_aware',
    stageNumber: 4,
    sophisticationLevel: 5,
    sophisticationBadge: 'Kidney Winner #4 · Zjazd Energii o 15:00 i Pianka',
    problemCluster: 'KIDNEY_FILTRATION_50',
    problemLabel: 'Poranne zmęczenie, przerwany sen i popołudniowy spadek sił po 50. roku życia',
    recommendedFanpageId: '1424554760734318',
    recommendedFanpageName: 'Dr Claire Foster',
    createdDate: '2026-10-29',
    updatedDate: '2026-11-01',
    vocTrigger: '„The most frustrating thing about sluggish urinary filtration is how normal you can feel while it is happening...”',
    mechanismCore: 'Czysta formuła 2 rubinowych kapsułek softgel dziennie z niezależnymi badaniami czystości (Third-Party Tested Lab Purity).',
    destinationUrl: BENNETT_UK_KIDNEY_PDP_URL,
    defaultImageId: 'fix-26-doctor-at-desk-clean',
    defaultImageUrl: '/bennett-uk-images/Fix_26_Doctor_At_Desk_Clean_No_Garbled_Badge.jpg',
    defaultImageHash: '',
  },

  // ==================== STAGE 5: HAIR 40+, GLP-1 & BOFU (4 LFS) ====================
  {
    id: 'bennett-27-hair-shower-plughole-widening-parting',
    number: 27,
    code: 'BS-27',
    title: 'I Stopped Turning On Our Bathroom Spotlight Because I Could See a 1cm Strip of Pink Scalp Down My Centre Parting',
    shortTitle: '#27 · Hair 45+: Bathroom Spotlight & Centre Parting',
    stageId: 'stage5_most_aware',
    stageNumber: 5,
    sophisticationLevel: 5,
    sophisticationBadge: 'Hair Winner #1 · Menopauza, DHT & Odpływ Prysznica',
    problemCluster: 'HAIR_MENOPAUSE_GLP1',
    problemLabel: 'Poszerzający się przedziałek po 45. roku życia i kłęby włosów w odpływie prysznica',
    recommendedFanpageId: '1415703161625474',
    recommendedFanpageName: 'Carys Morgan',
    createdDate: '2026-10-30',
    updatedDate: '2026-11-01',
    vocTrigger: '„I stopped turning on the big overhead spotlight in our bathroom 8 months ago because all I could see was pink scalp down my centre parting...”',
    mechanismCore: 'Dual-Action DHT Follicle Support: 2,000mg Styrian Pumpkin Seed Oil + 200mg Saw Palmetto blokuje obkurczanie cebulek przez DHT po spadku estrogenu.',
    destinationUrl: BENNETT_UK_HAIR_PDP_URL,
    defaultImageId: 'bs-05-uk-woman-bathroom',
    defaultImageUrl: '/bennett-uk-images/05_Bennett_And_Seed_UK_Woman_Bathroom_Morning.jpg',
    defaultImageHash: '',
  },
  {
    id: 'bennett-28-hair-glp1-mounjaro-shedding-recovery',
    number: 28,
    code: 'BS-28',
    title: 'I Lost 2.5 Stone on Mounjaro and Felt Incredible — Until I Pulled a Clump of Hair the Size of a Golf Ball From the Plughole',
    shortTitle: '#28 · GLP-1 Mounjaro / Wegovy Hair Shedding Recovery',
    stageId: 'stage5_most_aware',
    stageNumber: 5,
    sophisticationLevel: 5,
    sophisticationBadge: 'Hair Winner #2 · Kąt UK Mounjaro / Wegovy Shedding',
    problemCluster: 'HAIR_MENOPAUSE_GLP1',
    problemLabel: 'Gwałtowne wypadanie włosów w 3-4 miesiącu kuracji Mounjaro / Wegovy',
    recommendedFanpageId: '1415703161625474',
    recommendedFanpageName: 'Carys Morgan',
    createdDate: '2026-10-30',
    updatedDate: '2026-11-01',
    vocTrigger: '„I lost 2.5 stone on Mounjaro in 5 months and felt incredible - until I looked down at the shower plughole in Month 4...”',
    mechanismCore: 'Połączenie kwasów Omega-6/9, witaminy E oraz blokady DHT (Δ7-sterole + Saw Palmetto) chroni mieszki włosowe podczas szybkiej redukcji wagi.',
    destinationUrl: BENNETT_UK_HAIR_PDP_URL,
    defaultImageId: 'bs-07-scalp-brush-ritual',
    defaultImageUrl: '/bennett-uk-images/07_Bennett_And_Seed_Flatlay_Ritual_Scalp_Brush.jpg',
    defaultImageHash: '',
  },
  {
    id: 'bennett-29-bofu-most-bladder-products-mask',
    number: 29,
    code: 'BS-29',
    title: 'Most Bladder and Urinary Support Products Fall Short Because They Focus on Masking the Inconvenience',
    shortTitle: '#29 · BOFU: Why Most Bladder Products Only Mask It',
    stageId: 'stage5_most_aware',
    stageNumber: 5,
    sophisticationLevel: 5,
    sophisticationBadge: 'Lunovyn BOFU #1 · Kreacja z Fanpage’a Marki',
    problemCluster: 'BOFU_BRAND_OFFER',
    problemLabel: 'Bezpośrednia reklama edukacyjno-produktowa na ciepły i zimny ruch 50+',
    recommendedFanpageId: '1327661883769549',
    recommendedFanpageName: 'Bennett & Seed UK',
    createdDate: '2026-10-30',
    updatedDate: '2026-11-01',
    vocTrigger: '„Most bladder and urinary support products fall short because they focus on masking the inconvenience - not supporting the system behind it...”',
    mechanismCore: '2,000mg Cold-Pressed Austrian Styrian Pumpkin Seed Oil + Saw Palmetto z 90-dniową gwarancją zwrotu i darmową wysyłką Royal Mail Tracked.',
    destinationUrl: BENNETT_UK_BLADDER_PDP_URL,
    defaultImageId: 'fix-bofu-02-made-in-uk',
    defaultImageUrl: '/bennett-uk-images/Fix_BOFU_02_Bennett_Made_In_UK_Table.jpg',
    defaultImageHash: '',
  },
  {
    id: 'bennett-30-bofu-prostate-bladder-b2g1-offer',
    number: 30,
    code: 'BS-30',
    title: 'Looking to Support Your Prostate, Bladder & Hair Naturally? Claim Buy 2, Get 1 FREE + Free UK Tracked Delivery',
    shortTitle: '#30 · BOFU Offer: Buy 2, Get 1 FREE (Rated 4.8 | 5)',
    stageId: 'stage5_most_aware',
    stageNumber: 5,
    sophisticationLevel: 5,
    sophisticationBadge: 'Lunovyn BOFU #2 · Retargeting & Pakiet 3+2 / 2+1',
    problemCluster: 'BOFU_BRAND_OFFER',
    problemLabel: 'Bezpośrednia oferta pakietowa Buy 2, Get 1 Free z gwarancją 90 dni',
    recommendedFanpageId: '1327661883769549',
    recommendedFanpageName: 'Bennett & Seed UK',
    createdDate: '2026-10-30',
    updatedDate: '2026-11-01',
    vocTrigger: '„Looking to Support Your Prostate & Urinary Health Naturally? Experience the Power of Bennett & Seed Cold-Pressed Pumpkin Seed Oil...”',
    mechanismCore: 'Pakiet Buy 2, Get 1 Free (+25% rabatu w subskrypcji Loop) z darmową dostawą w UK i 90-dniową gwarancją zwrotu.',
    destinationUrl: BENNETT_UK_SOFTGELS_PDP_URL,
    defaultImageId: 'fix-bofu-01-b2g1-box',
    defaultImageUrl: '/bennett-uk-images/Fix_BOFU_01_Bennett_Buy2Get1Free_Box.jpg',
    defaultImageHash: '',
  },
];

export const BENNETT_UK_ALL_COPY: Record<
  string,
  {
    headline: string;
    description: string;
    primaryText: string;
  }
> = {
  ...BENNETT_UK_COPY_STAGE1,
  ...BENNETT_UK_COPY_STAGE2,
  ...BENNETT_UK_COPY_STAGE3,
  ...BENNETT_UK_COPY_STAGE4,
  ...BENNETT_UK_COPY_STAGE5,
};

export interface BennettUkGeneratedAd {
  id: string;
  angleId: string;
  code: string;
  title: string;
  stageId: BennettUkAwarenessStageId;
  sophisticationLevel: BennettUkSophisticationLevel;
  problemCluster: BennettUkProblemCluster;
  pageId: string;
  pageName: string;
  headline: string;
  description: string;
  primaryText: string;
  destinationUrl: string;
  cta: 'LEARN_MORE';
  imageUrl: string;
  imageHash: string;
  secondImageUrl?: string;
  secondImageHash?: string;
  wordCount: number;
  characterCount: number;
  auditPassed: boolean;
  auditWarnings: string[];
  auditFixesApplied: string[];
  createdAt: number;
  updatedAt: number;
}

export function sanitizeAndAuditBennettUk(
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
    fixes.push('Removed Markdown asterisks and ™ symbols.');
  }

  if (/\b(Lunovyn|Elivora)\b/i.test(primaryText) || /\b(Lunovyn|Elivora)\b/i.test(headline)) {
    primaryText = primaryText.replace(/\b(Lunovyn|Elivora)\b/gi, 'Bennett & Seed');
    headline = headline.replace(/\b(Lunovyn|Elivora)\b/gi, 'Bennett & Seed');
    fixes.push('Replaced competitor brand with Bennett & Seed.');
  }

  const wordCount = primaryText.split(/\s+/).filter(Boolean).length;
  const characterCount = primaryText.length;

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

export function buildAllBennettUkPrewrittenAds(): BennettUkGeneratedAd[] {
  const baseCreated = Date.parse('2026-10-30T18:00:00+01:00');
  const baseUpdated = Date.parse('2026-11-01T19:05:00+01:00');
  return BENNETT_UK_PRESET_ANGLES.map((preset, idx) => {
    const rawCopy = BENNETT_UK_ALL_COPY[preset.id] || {
      headline: preset.title,
      description: 'Cold-Pressed Styrian Pumpkin Seed Oil (2,000mg) + Saw Palmetto | 90-Day Guarantee',
      primaryText: '',
    };
    const audited = sanitizeAndAuditBennettUk(rawCopy.primaryText, rawCopy.headline, rawCopy.description);
    const isNewElivoraBatch = preset.number >= 31;
    const timestampOffset = isNewElivoraBatch
      ? (100 - preset.number) * 60_000
      : (30 - idx) * 60_000;
    return {
      id: `bennett-uk-${preset.code.toLowerCase()}`,
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
      destinationUrl: preset.destinationUrl || BENNETT_UK_BLADDER_PDP_URL,
      cta: 'LEARN_MORE',
      imageUrl: preset.defaultImageUrl,
      imageHash: preset.defaultImageHash,
      secondImageUrl: undefined,
      secondImageHash: undefined,
      wordCount: audited.wordCount,
      characterCount: audited.characterCount,
      auditPassed: audited.auditPassed,
      auditWarnings: audited.auditWarnings,
      auditFixesApplied: audited.auditFixesApplied,
      createdAt: (isNewElivoraBatch ? baseUpdated : baseCreated) + timestampOffset,
      updatedAt: baseUpdated + timestampOffset,
    };
  });
}
