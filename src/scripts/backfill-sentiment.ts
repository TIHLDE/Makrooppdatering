import { prisma } from '@/lib/prisma';
import { analyzeSentimentFast } from '@/lib/sentiment';

/**
 * Backfill sentiment for all articles that don't have it
 */
async function backfillSentiment() {
  console.log('Starting sentiment backfill...\n');
  
  // Get articles without sentiment
  const articles = await prisma.newsItem.findMany({
    where: {
      sentiment: null,
    },
    select: {
      id: true,
      title: true,
      summary: true,
      assetType: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: 1000, // Process in batches
  });
  
  console.log(`Found ${articles.length} articles without sentiment\n`);
  
  let updated = 0;
  let failed = 0;
  
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    
    try {
      // Calculate sentiment
      const sentiment = analyzeSentimentFast({
        title: article.title,
        summary: article.summary || undefined,
        assetType: article.assetType,
      });
      
      // Update article
      await prisma.newsItem.update({
        where: { id: article.id },
        data: {
          sentiment: sentiment.score,
        },
      });
      
      updated++;
      
      // Progress every 50 articles
      if (updated % 50 === 0) {
        console.log(`✓ Progress: ${updated}/${articles.length} articles updated`);
      }
      
    } catch (error) {
      failed++;
      console.error(`✗ Failed to update article ${article.id}:`, error);
    }
  }
  
  console.log(`\n✓ Backfill complete!`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total: ${articles.length}`);
}

// Run if executed directly
if (require.main === module) {
  backfillSentiment()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Backfill failed:', error);
      process.exit(1);
    });
}

export { backfillSentiment };
