import {EDITOR_WORKSPACES} from '@/lib/editor-workspaces';

export default function Home() {
  return (
    <main className="wrap home">
      <details className="home-product-menu"><summary><span aria-hidden="true">📦</span> Product <span className="product-chevron" aria-hidden="true">⌄</span></summary><div className="product-popover"><p>Keep your product briefs and UK offer details here. SZEKSPIR uses them when localising your ads.</p><a href="/product">Open product briefs →</a></div></details>
      <h1>🎬 Ad Ops</h1>
      <p className="sub">Pick a tool. <a href="/login">Account &amp; security</a></p>
      <div className="tiles">
        <a className="tile big" href="/uploader"><span className="tile-icon" aria-hidden="true"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 16V3m-5 5 5-5 5 5M4 15v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5"/></svg></span><span className="tile-title">Szekspir Ads</span><span className="tile-sub">Gotowe filmy i obrazy, zatwierdzone teksty oraz publikacja do Meta. Zapisane paczki i postęp każdej reklamy.</span></a>
        <a className="tile big" href="/ads-xray"><span className="tile-title">ADS X-RAY</span><span className="tile-sub">Porównaj skrypty, warianty i tłumaczenia. Różnice słów, mapa zdań, analiza podobieństwa AI i historia.</span></a>
        <a className="tile big" href="/antki"><span className="tile-icon">🐜</span><span className="tile-title">ANTKI</span><span className="tile-sub">Trendtrack image ads and long primary texts. Saved in the Admin Sheet with permanent Drive images.</span></a>
        <a className="tile big" href="/szekspir">
          <span className="tile-icon">🎭</span>
          <span className="tile-title">SZEKSPIR</span>
          <span className="tile-sub">
            US → UK ad localizer. Drop a video, get a British script with diff,
            faithful British phrasing and reliable export to the editors&apos; sheet.
          </span>
        </a>
        <a className="tile big" href="/szekspir-pl">
          <span className="tile-icon" aria-hidden="true">🇵🇱</span>
          <span className="tile-title">SZEKSPIR PL</span>
          <span className="tile-sub">Reklamy na polski rynek. Polski skrypt, alternatywne hooki i lektor po zatwierdzeniu tekstu.</span>
        </a>
        <a className="tile big" href="/szekspir/history">
          <span className="tile-icon">📜</span>
          <span className="tile-title">SCRIPT HISTORY</span>
          <span className="tile-sub">SZEKSPIR transcripts and localised scripts. Search, review and copy saved text.</span>
        </a>
        <a className="tile big" href="/advertorial">
          <span className="tile-icon">📰</span>
          <span className="tile-title">ADVERTORIAL</span>
          <span className="tile-sub">
            Long-form advertorial localization US → UK. Coming soon.
          </span>
        </a>
        <a className="tile big" href="/voice-swapper"><span className="tile-icon" aria-hidden="true"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 9h16m-4-4 4 4-4 4M20 15H4m4-4-4 4 4 4"/></svg></span><span className="tile-title">VOICE SWAPPER</span><span className="tile-sub">Usuń oryginalną mowę, zachowaj tło i podłóż gotowy voiceover z ElevenLabs. Odsłuch i eksport filmu.</span></a>
        <a className="tile big" href="/additional-files">
          <span className="tile-icon" aria-hidden="true">📎</span>
          <span className="tile-title">ADDITIONAL FILES</span>
          <span className="tile-sub">Correct a voiceover for an existing ad. Listen, approve and send the extra file to your editor.</span>
        </a>
        <details className="tile big admin-folder">
          <summary><span className="tile-icon">📁</span><span className="tile-title">ADMIN ⌄</span><span className="tile-sub">Workspaces, dashboard and script duplicate checker.</span></summary>
          <nav aria-label="Admin tools">
            <a href={`https://docs.google.com/spreadsheets/d/${EDITOR_WORKSPACES.find(editor => editor.id === 'mine')!.sheetId}/edit`} target="_blank" rel="noopener noreferrer">Admin editor workspace ↗</a>
            <a href="https://docs.google.com/spreadsheets/d/17o5TwwWgdjnkmRZIh8qQloGnhT3otWo8PGEw-nPrKRY/edit?gid=800#gid=800" target="_blank" rel="noopener noreferrer">Admin dashboard ↗</a>
            <a href="/admin/check-script">Check if an ad was already ripped →</a>
          </nav>
        </details>
      </div>
    </main>
  );
}
