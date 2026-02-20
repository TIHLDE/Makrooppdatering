# Makro Oppdatering

## Hvordan kjøre lokalt @kajasd

### 1. Installer avhengigheter
```bash
npm install
```

### 2. Sett opp database
Kopier miljøvariabler:
```bash
cp .env.example .env
```

Rediger `.env` og legg til din PostgreSQL database URL:
```
DATABASE_URL="postgresql://user:password@localhost:5432/makro"
```

### 3. Initialiser databasen
```bash
# Generer Prisma klient
npm run db:generate

# Kjør database migrasjoner
npm run db:migrate

# Seed med testdata
npm run db:seed
```

### 4. Start applikasjonen
```bash
npm run dev
```

Åpne http://localhost:3000 i nettleseren.

### 5. Hent nyheter (valgfritt)
```bash
npm run ingest
```

Dette henter RSS-feeds og legger dem i databasen.

---

## Andre nyttige kommandoer

```bash
# Kjør tester
npm run test:run

# Åpne database GUI
npm run db:studio

# Bygg for produksjon
npm run build
```
