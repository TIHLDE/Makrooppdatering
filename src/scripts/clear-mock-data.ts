#!/usr/bin/env tsx
import { prisma } from '@/lib/prisma';

async function clearMockData() {
  console.log('🧹 Clearing all mock/sample data...');
  
  try {
    // Delete sample news (identified by hash starting with 'sample-')
    const deletedNews = await prisma.newsItem.deleteMany({
      where: {
        hash: {
          startsWith: 'sample-',
        },
      },
    });
    
    console.log(`✅ Deleted ${deletedNews.count} sample news items`);
    
    // Delete sample quizzes
    const deletedQuizzes = await prisma.quizSet.deleteMany({
      where: {
        title: {
          contains: 'Market Movers',
        },
      },
    });
    
    console.log(`✅ Deleted ${deletedQuizzes.count} sample quizzes`);
    
    // Clean up orphaned tags
    const orphanedTags = await prisma.tag.deleteMany({
      where: {
        newsItems: {
          none: {},
        },
      },
    });
    
    console.log(`✅ Cleaned up ${orphanedTags.count} orphaned tags`);
    
    console.log('🎉 Mock data cleared successfully!');
    console.log('📡 Ready to fetch REAL data from RSS feeds');
    
  } catch (error) {
    console.error('Error clearing mock data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  clearMockData();
}

export { clearMockData };
