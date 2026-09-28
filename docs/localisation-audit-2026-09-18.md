# Localisation audit — 18 September 2026

Scope: ordinary US→UK scripts, retail examples, source disclosure, Singing ad, regeneration and narration consistency.

Found and fixed:
- Main prompt prohibited CVS→Boots even in incidental shopping examples.
- Critic prohibited changes to names and lacked original transcript context.
- Critic application allowed spelling pairs only, silently discarding retail corrections.

Version: uk-faithful-2026-09-18-v14-retail.

Verified locally: TypeScript check; contextual retail correction through the full mocked localisation pipeline; narration equals corrected display meaning; availability/endorsement examples reject retail substitutions; brand-disclosure tests; Singing ad tests; draft-only regeneration tests; voice preservation and direction tests.

Limit: these are local tests, including mocked model responses. Live model audit was blocked by automatic approval review pending explicit permission to send sample scripts and product context to OpenAI. Model reliability on arbitrary source material has not been established by these tests. No existing job or editor script was overwritten. No claim that the supplied health assertions have been fact-checked.
