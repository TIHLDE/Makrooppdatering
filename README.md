# Makro Oppdatering

En webapp som samler finansnyheter (aksjer, fond/ETF, krypto, makroøkonomi, geopolitikk) og presenterer dem med kraftige filtre og en quiz-modul for læring.

## Arkitekturvalg

### Database: Supabase (eller Neon)
- **Begrunnelse**: Supabase har god gratis-tier, enkel Prisma-integrasjon, og godt UI for datahåndtering
- Alternative: Neon for serverless Postgres med bedre cold-start ytelse

### Cron: Vercel Cron
- **Begrunnelse**: Integrert med Vercel deployment, enklere enn GitHub Actions, god for MVP
- Limit: Maks 2 cron jobs på hobby-plan

### Auth: Stubbet for MVP
- **Begrunnelse**: Reduserer kompleksitet. Kan enkelt legges til senere med NextAuth.js

## Hurtigstart (Lokal utvikling)

### 1. Installasjon
```bash
npm install
```

### 2. Miljøvariabler
```bash
cp .env.example .env
# Rediger .env med din database URL
```

### 3. Database setup
```bash
# Generer Prisma klient
npm run db:generate

# Kjør migrasjoner
npm run db:migrate

# Seed med testdata
npm run db:seed
```

### 4. Start utviklingsserver
```bash
npm run dev
```

Appen er nå tilgjengelig på http://localhost:3000

### 5. Kjør ingest (manuelt)
```bash
npm run ingest
```

Dette henter RSS-feeds og populerer databasen.

## Deploy til Vercel

### 1. Forberedelser
```bash
# Push kode til GitHub
git init
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Vercel Setup
1. Gå til [vercel.com](https://vercel.com) og importer repo
2. Legg til miljøvariabler i Vercel dashboard:
   - `DATABASE_URL` (fra Supabase/Neon)
3. Deploy!

### 3. Database migrasjoner på Vercel
```bash
# Lokal migrasjon
npm run db:migrate

# Eller bruk Prisma Studio for manuell datahåndtering
npm run db:studio
```

### 4. Cron job setup
Cron-jobbene er definert i `vercel.json`. De kjører automatisk på Vercel.

- **Development**: Kjør `npm run ingest` manuelt
- **Production**: Automatisk hver time via Vercel Cron

## Testing

```bash
# Kjør alle tester
npm run test:run

# Watch mode under utvikling
npm run test
```

## Prosjektstruktur

```
├── prisma/
│   ├── schema.prisma      # Database skjema
│   └── seed.ts            # Testdata
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── page.tsx       # Landingsside
│   │   ├── dashboard/     # Nyhetsfeed med filtre
│   │   ├── summary/       # Makro oppsummering
│   │   └── quiz/          # Quiz-modul
│   ├── components/        # React komponenter
│   ├── lib/               # Hjelpefunksjoner, Prisma client
│   ├── ingest/            # RSS ingestion & enrichment
│   ├── quiz/              # Quiz generering
│   └── scripts/           # CLI scripts (ingest)
├── tests/                 # Unit tester
└── vercel.json            # Cron konfigurasjon
```

## TODO / Roadmap v2

- [ ] **Ekte scraping**: Legg til støtte for nettside-scraping med Playwright/Puppeteer
- [ ] **Embeddings/Semantic search**: Integrer OpenAI embeddings for bedre søk
- [ ] **Sentiment analysis**: Automatisk sentiment-score på nyheter
- [ ] **Watchlists**: Bruker kan lagre favoritt-aksjer/fond
- [ ] **Notifications**: Push-varsler for viktige nyheter
- [ ] **Auth**: Full NextAuth.js integrasjon med brukerprofiler
- [ ] **Real-time data**: WebSocket for live prisoppdateringer
- [ ] **AI-genererte quizer**: GPT-basert quiz-generering fra nyheter
- [ ] **Embeddable widgets**: Tillat andre å embedde feed på sine sider

## Lisens

MIT
