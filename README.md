# Hei Kaja! 👋

Dette er en nettside som viser økonomiske nyheter og har quizzer om finans.

## Viktig! Spør Tri om hjelp med innstillinger først

**Før du begynner** - programmet trenger en spesiell kode for å koble til databasen. Spør Tri om:
- `.env` filen (den hemmelige koden)

Tri har allerede satt opp databasen, så du trenger bare å få filen av han.

## Hvordan starte programmet

### Første gang (gjør dette én gang):

1. **Åpne Terminal**
   - Trykk `Cmd + Mellomrom` på tastaturet
   - Skriv "terminal"
   - Trykk Enter

2. **Gå til mappen**
   ```bash
   cd /Users/trile/Desktop/freetime/projects/web/makrooppdatering
   ```

3. **Installer programmet**
   ```bash
   npm install
   ```
   (Dette kan ta noen minutter)

4. **Få .env filen fra Tri**
   - Spør Tri om å gi deg `.env` filen
   - Legg den i mappen (samme sted som package.json)

5. **Sett opp databasen**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

6. **Legg inn testdata (valgfritt)**
   ```bash
   npm run db:seed
   ```
   (Dette legger inn eksempel-nyheter og quizzer)

### Hver gang du vil starte:

1. **Gå til mappen**
   ```bash
   cd /Users/trile/Desktop/freetime/projects/web/makrooppdatering
   ```

2. **Start programmet**
   ```bash
   npm run dev
   ```

3. **Se programmet**
   - Åpne nettleseren
   - Gå til: http://localhost:3000

4. **Stoppe programmet**
   - Trykk `Ctrl + C` i terminalen

---

**Funker det ikke?** Spør Claude om hjelp! 😊
