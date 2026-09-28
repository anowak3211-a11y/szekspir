import {EDITOR_WORKSPACES} from '@/lib/editor-workspaces';

export default function Home() {
  return (
    <main className="wrap home">
      <details className="home-product-menu"><summary><span aria-hidden="true">📦</span> Product <span className="product-chevron" aria-hidden="true">⌄</span></summary><div className="product-popover"><p>Keep your product briefs and UK offer details here. SZEKSPIR uses them when localising your ads.</p><a href="/product">Open product briefs →</a></div></details>
      <h1>🎬 Ad Ops</h1>
      <p className="sub">Pick a tool.</p>
      <div className="tiles">
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
        <a className="tile big" href="/antki">
          <span className="tile-icon">🐜</span>
          <span className="tile-title">ANTKI</span>
          <span className="tile-sub">Advertorials. Coming soon.</span>
        </a>
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
