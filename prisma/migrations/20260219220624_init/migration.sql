-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('EQUITY', 'ETF', 'FUND', 'CRYPTO', 'MACRO', 'GEOPOLITICS', 'POLITICS', 'OTHER');

-- CreateEnum
CREATE TYPE "QuizType" AS ENUM ('MULTIPLE_CHOICE', 'MATCH_PAIRS', 'FIND_CONNECTION');

-- CreateTable
CREATE TABLE "NewsItem" (
    "id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "url" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "language" TEXT NOT NULL DEFAULT 'en',
    "assetType" "AssetType" NOT NULL DEFAULT 'OTHER',
    "sentiment" DOUBLE PRECISION,
    "relevance" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "isDuplicate" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "NewsItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticker" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT,
    "assetType" "AssetType" NOT NULL,
    "exchange" TEXT,
    "country" TEXT,
    "sectorId" TEXT,

    CONSTRAINT "Ticker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sector" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Sector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketData" (
    "id" TEXT NOT NULL,
    "tickerId" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "priceChange" DOUBLE PRECISION,
    "priceChangePercent" DOUBLE PRECISION,
    "peRatio" DOUBLE PRECISION,
    "marketCap" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizSet" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "QuizType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dateFrom" TIMESTAMP(3) NOT NULL,
    "dateTo" TIMESTAMP(3) NOT NULL,
    "assetTypes" "AssetType"[],

    CONSTRAINT "QuizSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL,
    "quizSetId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "correct" INTEGER NOT NULL,
    "newsItemId" TEXT,
    "imageUrl" TEXT,
    "pairId" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizScore" (
    "id" TEXT NOT NULL,
    "quizSetId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userName" TEXT,
    "score" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "timeMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RssSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "assetType" "AssetType" NOT NULL DEFAULT 'OTHER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastFetched" TIMESTAMP(3),
    "fetchCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RssSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_NewsItemToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_NewsItemToTicker" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_NewsItemToSector" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CountryToNewsItem" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsItem_hash_key" ON "NewsItem"("hash");

-- CreateIndex
CREATE INDEX "NewsItem_publishedAt_idx" ON "NewsItem"("publishedAt");

-- CreateIndex
CREATE INDEX "NewsItem_assetType_idx" ON "NewsItem"("assetType");

-- CreateIndex
CREATE INDEX "NewsItem_source_idx" ON "NewsItem"("source");

-- CreateIndex
CREATE INDEX "NewsItem_hash_idx" ON "NewsItem"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Ticker_symbol_key" ON "Ticker"("symbol");

-- CreateIndex
CREATE INDEX "Ticker_symbol_idx" ON "Ticker"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Sector_name_key" ON "Sector"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MarketData_tickerId_key" ON "MarketData"("tickerId");

-- CreateIndex
CREATE INDEX "MarketData_peRatio_idx" ON "MarketData"("peRatio");

-- CreateIndex
CREATE UNIQUE INDEX "_NewsItemToTag_AB_unique" ON "_NewsItemToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_NewsItemToTag_B_index" ON "_NewsItemToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_NewsItemToTicker_AB_unique" ON "_NewsItemToTicker"("A", "B");

-- CreateIndex
CREATE INDEX "_NewsItemToTicker_B_index" ON "_NewsItemToTicker"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_NewsItemToSector_AB_unique" ON "_NewsItemToSector"("A", "B");

-- CreateIndex
CREATE INDEX "_NewsItemToSector_B_index" ON "_NewsItemToSector"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CountryToNewsItem_AB_unique" ON "_CountryToNewsItem"("A", "B");

-- CreateIndex
CREATE INDEX "_CountryToNewsItem_B_index" ON "_CountryToNewsItem"("B");

-- AddForeignKey
ALTER TABLE "Ticker" ADD CONSTRAINT "Ticker_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketData" ADD CONSTRAINT "MarketData_tickerId_fkey" FOREIGN KEY ("tickerId") REFERENCES "Ticker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quizSetId_fkey" FOREIGN KEY ("quizSetId") REFERENCES "QuizSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_newsItemId_fkey" FOREIGN KEY ("newsItemId") REFERENCES "NewsItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizScore" ADD CONSTRAINT "QuizScore_quizSetId_fkey" FOREIGN KEY ("quizSetId") REFERENCES "QuizSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NewsItemToTag" ADD CONSTRAINT "_NewsItemToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "NewsItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NewsItemToTag" ADD CONSTRAINT "_NewsItemToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NewsItemToTicker" ADD CONSTRAINT "_NewsItemToTicker_A_fkey" FOREIGN KEY ("A") REFERENCES "NewsItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NewsItemToTicker" ADD CONSTRAINT "_NewsItemToTicker_B_fkey" FOREIGN KEY ("B") REFERENCES "Ticker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NewsItemToSector" ADD CONSTRAINT "_NewsItemToSector_A_fkey" FOREIGN KEY ("A") REFERENCES "NewsItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NewsItemToSector" ADD CONSTRAINT "_NewsItemToSector_B_fkey" FOREIGN KEY ("B") REFERENCES "Sector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryToNewsItem" ADD CONSTRAINT "_CountryToNewsItem_A_fkey" FOREIGN KEY ("A") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryToNewsItem" ADD CONSTRAINT "_CountryToNewsItem_B_fkey" FOREIGN KEY ("B") REFERENCES "NewsItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
