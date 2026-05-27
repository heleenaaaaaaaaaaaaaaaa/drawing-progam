# Zadání: Drawing app (kreslicí aplikace)

## Cíl
Webová kreslicí aplikace postavená na HTML5 Canvas. Uživatel kreslí myší (volitelně prstem), vybírá barvy a šířku tahu, může gumovat, mazat plátno, vrátit krok zpět a stáhnout výsledek jako PNG.

## Povinné funkce (must-have)
1. **Canvas** (např. 800×600, případně responzivní)
2. **Štětec** — kreslení myší (`mousedown` → `mousemove` → `mouseup`)
3. **Volba barvy** — `<input type="color">` nebo paleta předvolených barev
4. **Volba tloušťky tahu** — slider, např. 1-50 px
5. **Guma** — mazání části kresby
6. **Clear** — vyčistit celé plátno
7. **Undo** (krok zpět) — minimálně jeden krok, ideálně neomezeně
8. **Stáhnout jako PNG** — tlačítko, které stáhne obsah canvasu jako obrázek

## Volitelná vylepšení (nice-to-have)
- **Redo** (krok vpřed)
- Geometrické tvary: čára, obdélník, kruh
- Výplň (fill bucket)
- Color picker s historií posledních barev
- Volba pozadí (bílé / průhledné / barevné)
- Touch support (mobil/tablet)
- Vrstvy
- Volba velikosti plátna
- Kapátko (pick color from canvas)
- Klávesové zkratky (Ctrl+Z pro undo)

## Edge cases — testuj!
- ⚠️ **Undo na začátku** (nic ke vrácení) → nesmí spadnout, tlačítko může být disabled
- ⚠️ **Redo po nové akci** → historie redo se musí vymazat (jinak vznikají divné branchings)
- Kreslení mimo canvas → kresba se nesmí "lepit" mimo plátno
- Změna barvy/tloušťky uprostřed tahu → nesmí zpětně přebarvit dříve nakreslené
- Rychlé pohyby myší → tah musí být **spojitý** (čára, ne tečky)
- Mouseup mimo canvas (vyjedeš a pustíš tlačítko venku) → tah se musí korektně ukončit

## Tip k implementaci — spojitá čára
Mezi `mousemove` událostmi je mezera (browser nesample každý pixel). Pokud se nakreslí jen bod na pozici kurzoru, vznikají **tečky místo čáry**.

Řešení: spojovat poslední pozici s novou pomocí `ctx.lineTo()` a `ctx.stroke()`, nastavit `ctx.lineCap = 'round'` a `ctx.lineJoin = 'round'`.

## Tip k implementaci — Undo
Nejjednodušší přístup: po **každém dokončeném tahu** (na `mouseup`) uložit stav canvasu pomocí `canvas.toDataURL()` nebo `ctx.getImageData()` do pole. Undo = obnovit předchozí položku.

**Pozor:** ukládat ne při každém `mousemove` (to by zaplnilo paměť), ale jen jednou po dokončení tahu.

## Technické požadavky
- HTML + CSS + JavaScript (vanilla)
- HTML5 Canvas API
- Bez frameworků a velkých knihoven
- Bez backendu

## Akceptační kritéria
- [ ] Mohu kreslit myší — vznikne **spojitá čára**, ne tečky
- [ ] Mohu změnit barvu a tloušťku, změny platí pro nové tahy
- [ ] Guma funguje (libovolnou metodou — bílá barva nebo `globalCompositeOperation = 'destination-out'`)
- [ ] Clear vyčistí celé plátno
- [ ] Undo vrátí poslední tah; opakovaný undo vrací další tahy zpět
- [ ] Stažení PNG funguje — soubor se uloží a otevře se jako obrázek
- [ ] Aplikace nepadá při neobvyklém užití (undo bez akce, kresba mimo canvas)

## Časový odhad
- Implementace: 30-40 min
- Ladění undo a edge cases: 15-20 min

## Tip pro práci s AI agentem
Canvas a undo jsou oblasti, kde se kvalita AI řešení **hodně liší.** Některá řešení uloží jen kompletní bitmapu (vyžaduje hodně paměti, ale je to spolehlivé), jiná historii tahů (čistší, paměťově lehčí, ale složitější na implementaci a snadno se v tom udělá bug).

**Testy po implementaci:**
1. Nakresli jeden tah → klikni undo → měl by zmizet
2. Nakresli tah A → undo → nakresli tah B → undo → měl by zmizet jen B (A je pryč z předchozího undo). Ne všechna řešení tohle zvládají.
3. 10× nakresli něco → 10× undo → plátno by mělo být prázdné, aplikace nesmí spadnout
4. Stáhni PNG → otevři ho — vypadá to jako kresba?
5. Změň tloušťku uprostřed tahu (mousedown → změna slideru → mousemove) — tah by neměl zpětně změnit tloušťku

**Bonus test:** nakresli rychlou klikatici (rychlý pohyb myší). Pokud vznikají oddělené tečky místo čáry, agent neimplementoval spojování bodů přes `lineTo()`.
