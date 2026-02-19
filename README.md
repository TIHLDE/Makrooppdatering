# Makro Oppdatering
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



MIT
