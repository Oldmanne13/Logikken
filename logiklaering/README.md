# LogikLab

En lille statisk undervisningswebapp til GitHub Pages.

## Kredsløb

Appen simulerer det faste kredsløb:

`OUT = (A AND C) AND NOT(B OR D)`

## Funktioner

- Fire klikbare inputs: A, B, C og D
- Eleven skal forudsige OUT, før simulatoren afslører signalerne
- Klassisk gate-diagram med AND, OR og NOT
- Minecraft-inspireret redstone-visning af samme logik
- Regelbaseret læringsassistent med progressive hints og modspørgsmål
- Eksempler på gode måder at bede en AI om hjælp uden at bede om facit
- Sandhedstabel med alle 16 kombinationer
- Ingen backend og ingen API-nøgle nødvendig

## Kør lokalt

Åbn `index.html` direkte i en browser.

## GitHub Pages

1. Opret et nyt GitHub repository.
2. Upload `index.html`, `style.css` og `script.js` til roden.
3. Gå til **Settings → Pages**.
4. Vælg **Deploy from a branch**.
5. Vælg `main` og `/ (root)`.

## Bemærkning om redstone-visningen

Redstone-visningen er en pædagogisk Minecraft-inspireret model, der viser signalflow og komponenttyper. Den er ikke tænkt som en nøjagtig blok-for-blok byggevejledning i Minecraft.
