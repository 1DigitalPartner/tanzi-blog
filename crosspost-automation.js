#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Crossposting configuration for multiple platforms
const CROSSPOST_CONFIG = {
  platforms: {
    linkedin: {
      enabled: true,
      apiEndpoint: 'https://api.linkedin.com/v2/ugcPosts',
      maxLength: 3000,
      supportImages: true,
      supportVideos: false,
      hashtagLimit: 5,
      template: {
        visual_article: `🚀 New Analysis: {TITLE}

{EXCERPT}

Key insights:
{KEY_POINTS}

Read the full analysis: {URL}

{HASHTAGS}

#DataScience #AI #Analytics #SocialMedia #TechInsights`,
        
        newsletter: `📊 Weekly Intelligence Report: {TITLE}

{EXCERPT}

This week's highlights:
{HIGHLIGHTS}

Full report: {URL}

{HASHTAGS}`,

        trend_report: `📈 Market Trend Alert: {TITLE}

{SUMMARY}

🔍 What this means for your business:
{IMPLICATIONS}

Deep dive: {URL}

{HASHTAGS}`
      }
    },
    
    twitter: {
      enabled: true,
      apiEndpoint: 'https://api.twitter.com/2/tweets',
      maxLength: 280,
      supportImages: true,
      supportVideos: true,
      hashtagLimit: 3,
      threadEnabled: true,
      template: {
        visual_article: `🧠 {TITLE}

{SHORT_EXCERPT}

Thread below 👇

{HASHTAGS}

{URL}`,
        
        thread_continuation: `{THREAD_NUMBER}/{TOTAL_THREADS}

{CONTENT}

{HASHTAGS}`,

        newsletter: `📈 Weekly intel: {TITLE}

{SHORT_SUMMARY}

{URL}

{HASHTAGS}`,

        trend_report: `🚨 Trend Alert: {TITLE}

{KEY_INSIGHT}

More: {URL}

{HASHTAGS}`
      }
    },

    medium: {
      enabled: true,
      apiEndpoint: 'https://api.medium.com/v1/posts',
      maxLength: 100000,
      supportImages: true,
      supportVideos: false,
      useCustomFormatter: true,  // Flag to use MediumFormatter
      template: {
        visual_article: `{MEDIUM_FORMATTED_CONTENT}`,  // Will be replaced by MediumFormatter output
        
        newsletter: `# {TITLE}

{NEWSLETTER_CONTENT}

## Subscribe for More Insights

Get weekly intelligence reports delivered directly to your inbox.

---

*Read more analysis on [TanziTech Blog]({ORIGINAL_URL})*`
      }
    },

    reddit: {
      enabled: true,
      subreddits: [
        'MachineLearning',
        'datascience', 
        'artificial',
        'analytics',
        'socialmedia',
        'marketing',
        'entrepreneur'
      ],
      template: {
        visual_article: `{TITLE}

{EXCERPT}

I analyzed {DATA_POINTS} to understand {MAIN_TOPIC}. Here are the key findings:

{KEY_FINDINGS}

Full analysis with visualizations: {URL}

What's your take on these trends?`,
        
        newsletter: `Weekly Intelligence: {TITLE}

{SUMMARY}

This week I covered:
{TOPICS_LIST}

Full report: {URL}

Thoughts on these developments?`
      }
    },

    hackernews: {
      enabled: true,
      apiEndpoint: 'https://hacker-news.firebaseio.com/v0/item.json',
      template: {
        visual_article: `{TITLE} – {URL}`,
        trend_report: `Analysis: {TITLE} – {URL}`
      }
    },

    devto: {
      enabled: true,
      apiEndpoint: 'https://dev.to/api/articles',
      supportMarkdown: true,
      template: {
        visual_article: `---
title: {TITLE}
published: true
tags: ai, datascience, analytics, programming
canonical_url: {ORIGINAL_URL}
cover_image: {COVER_IMAGE}
---

{MARKDOWN_CONTENT}

---

*Originally published on [TanziTech Blog]({ORIGINAL_URL})*`
      }
    }
  },

  scheduling: {
    delays: {
      linkedin: 30,    // minutes after blog post
      twitter: 15,     // minutes after blog post  
      medium: 120,     // 2 hours after blog post
      reddit: 180,     // 3 hours after blog post
      hackernews: 240, // 4 hours after blog post
      devto: 360       // 6 hours after blog post
    },
    
    optimal_times: {
      linkedin: {
        days: ['tuesday', 'wednesday', 'thursday'],
        hours: [9, 10, 11, 14, 15]
      },
      twitter: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        hours: [9, 12, 15, 18]
      },
      reddit: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday'],
        hours: [10, 14, 20]
      }
    }
  }
};

// Content categorization for optimal crossposting
const CONTENT_CATEGORIES = {
  'visual_article': {
    platforms: ['linkedin', 'twitter', 'medium', 'devto'],
    priority: 'high',
    hashtags: {
      linkedin: ['#DataVisualization', '#Analytics', '#AI', '#BusinessIntelligence', '#TechInsights'],
      twitter: ['#DataViz', '#AI', '#Analytics'],
      medium: ['data-science', 'artificial-intelligence', 'analytics', 'visualization'],
      devto: ['ai', 'datascience', 'analytics', 'visualization']
    }
  },
  
  'newsletter': {
    platforms: ['linkedin', 'twitter', 'medium'],
    priority: 'medium',
    hashtags: {
      linkedin: ['#Newsletter', '#WeeklyIntel', '#MarketTrends', '#BusinessInsights'],
      twitter: ['#Newsletter', '#WeeklyIntel', '#Trends'],
      medium: ['newsletter', 'market-analysis', 'business-intelligence']
    }
  },
  
  'trend_report': {
    platforms: ['linkedin', 'twitter', 'reddit', 'hackernews'],
    priority: 'high',
    hashtags: {
      linkedin: ['#MarketTrends', '#TechTrends', '#IndustryAnalysis', '#FutureOfWork'],
      twitter: ['#TechTrends', '#MarketAnalysis', '#Innovation'],
      reddit: ['trending', 'analysis', 'technology']
    }
  },
  
  'lead_generation': {
    platforms: ['linkedin', 'medium'],
    priority: 'medium',
    hashtags: {
      linkedin: ['#LeadGeneration', '#B2BMarketing', '#SalesStrategy', '#BusinessGrowth'],
      medium: ['lead-generation', 'marketing', 'business-strategy']
    }
  },

  'ai_analysis': {
    platforms: ['linkedin', 'twitter', 'reddit', 'devto', 'hackernews'],
    priority: 'high',
    hashtags: {
      linkedin: ['#ArtificialIntelligence', '#AIAnalysis', '#MachineLearning', '#TechInnovation'],
      twitter: ['#AI', '#MachineLearning', '#TechAnalysis'],
      reddit: ['artificial', 'MachineLearning', 'technology'],
      devto: ['ai', 'machinelearning', 'data-science']
    }
  }
};

class CrosspostingManager {
  constructor() {
    this.baseDir = __dirname;
    this.crosspostQueue = [];
    this.scheduledPosts = new Map();
    this.analytics = {
      totalCrossposts: 0,
      successfulPosts: 0,
      failedPosts: 0,
      platformStats: {}
    };
  }

  // Analyze blog post content to determine category and extract key info
  analyzeContent(filePath, language = 'en') {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract metadata
      const title = this.extractTitle(content);
      const excerpt = this.extractExcerpt(content);
      const category = this.determineCategory(title, content);
      const keyPoints = this.extractKeyPoints(content);
      const images = this.extractImages(content);
      
      return {
        title,
        excerpt,
        category,
        keyPoints,
        images,
        language,
        wordCount: content.split(' ').length,
        hasVisuals: images.length > 0,
        readingTime: Math.ceil(content.split(' ').length / 250)
      };
    } catch (error) {
      console.error(`Error analyzing content: ${error.message}`);
      return null;
    }
  }

  // Extract title from HTML content
  extractTitle(content) {
    const titleMatch = content.match(/<title>(.*?)<\/title>/);
    return titleMatch ? titleMatch[1].replace(' | Gabriele Tanzi', '') : 'Untitled';
  }

  // Extract excerpt/description
  extractExcerpt(content) {
    const metaMatch = content.match(/<meta name="description" content="(.*?)"/);
    if (metaMatch) return metaMatch[1];
    
    // Fallback: extract from first paragraph
    const pMatch = content.match(/<p[^>]*>(.*?)<\/p>/);
    return pMatch ? pMatch[1].replace(/<[^>]+>/g, '').substring(0, 200) + '...' : '';
  }

  // Determine content category based on title and content
  determineCategory(title, content) {
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();
    
    if (titleLower.includes('psychology') || titleLower.includes('viral') || titleLower.includes('analysis')) {
      return 'visual_article';
    }
    if (titleLower.includes('newsletter') || titleLower.includes('weekly')) {
      return 'newsletter';
    }
    if (titleLower.includes('trend') || titleLower.includes('market')) {
      return 'trend_report';
    }
    if (titleLower.includes('lead generation') || titleLower.includes('strategy')) {
      return 'lead_generation';
    }
    if (titleLower.includes('ai') || titleLower.includes('artificial intelligence')) {
      return 'ai_analysis';
    }
    
    return 'visual_article'; // default
  }

  // Extract key points from content
  extractKeyPoints(content) {
    const points = [];
    
    // Look for bullet points or numbered lists
    const listMatches = content.match(/<li[^>]*>(.*?)<\/li>/g);
    if (listMatches) {
      listMatches.slice(0, 5).forEach(match => {
        const text = match.replace(/<[^>]+>/g, '').trim();
        if (text.length > 10) points.push(text);
      });
    }
    
    // Look for headings as key points
    const headingMatches = content.match(/<h[2-4][^>]*>(.*?)<\/h[2-4]>/g);
    if (headingMatches && points.length < 3) {
      headingMatches.slice(0, 3).forEach(match => {
        const text = match.replace(/<[^>]+>/g, '').trim();
        if (text.length > 10) points.push(text);
      });
    }
    
    return points;
  }

  // Extract images from content
  extractImages(content) {
    const images = [];
    const imgMatches = content.match(/<img[^>]+src="([^"]+)"/g);
    if (imgMatches) {
      imgMatches.forEach(match => {
        const srcMatch = match.match(/src="([^"]+)"/);
        if (srcMatch) images.push(srcMatch[1]);
      });
    }
    return images;
  }

  // Generate crosspost content for specific platform
  generatePlatformContent(contentAnalysis, platform, originalUrl) {
    const config = CROSSPOST_CONFIG.platforms[platform];
    const category = contentAnalysis.category;
    const template = config.template[category] || config.template.visual_article;
    
    // Special handling for Medium using the MediumFormatter
    if (platform === 'medium' && config.useCustomFormatter) {
      return this.getMediumFormattedContent(contentAnalysis.postPath, originalUrl, contentAnalysis.language);
    }
    
    let content = template
      .replace(/{TITLE}/g, contentAnalysis.title)
      .replace(/{EXCERPT}/g, this.truncateText(contentAnalysis.excerpt, platform === 'twitter' ? 100 : 300))
      .replace(/{URL}/g, originalUrl)
      .replace(/{ORIGINAL_URL}/g, originalUrl);

    // Add platform-specific content
    if (platform === 'twitter' && contentAnalysis.keyPoints.length > 0) {
      const keyPoints = contentAnalysis.keyPoints.slice(0, 3).map((point, i) => `${i + 1}. ${point}`).join('\n');
      content = content.replace(/{KEY_POINTS}/g, keyPoints);
    } else if (platform === 'linkedin') {
      const keyPoints = contentAnalysis.keyPoints.slice(0, 5).map(point => `• ${point}`).join('\n');
      content = content.replace(/{KEY_POINTS}/g, keyPoints);
    }

    // Add hashtags
    const hashtags = this.getHashtags(category, platform);
    content = content.replace(/{HASHTAGS}/g, hashtags);

    return content;
  }

  // Get appropriate hashtags for platform and category
  getHashtags(category, platform) {
    const categoryConfig = CONTENT_CATEGORIES[category];
    if (!categoryConfig || !categoryConfig.hashtags[platform]) {
      return '';
    }

    const hashtags = categoryConfig.hashtags[platform];
    const maxTags = CROSSPOST_CONFIG.platforms[platform].hashtagLimit || 5;
    
    return hashtags.slice(0, maxTags).join(' ');
  }

  // Get Medium-formatted content using the MediumFormatter
  getMediumFormattedContent(postPath, originalUrl, language = 'en') {
    try {
      const MediumFormatter = require('./medium-formatter.js');
      const formatter = new MediumFormatter();
      
      // Read HTML content
      const htmlContent = fs.readFileSync(postPath, 'utf8');
      
      // Convert to Medium format
      const mediumContent = formatter.htmlToMedium(htmlContent, originalUrl, language);
      
      if (mediumContent) {
        console.log(`✅ Generated Medium-formatted content for ${path.basename(postPath)}`);
        return mediumContent;
      } else {
        console.log(`⚠️  Using fallback template for ${path.basename(postPath)}`);
        return this.getFallbackMediumContent(postPath, originalUrl);
      }
      
    } catch (error) {
      console.log(`⚠️  Medium formatter error for ${path.basename(postPath)}: ${error.message}`);
      return this.getFallbackMediumContent(postPath, originalUrl);
    }
  }

  // Fallback Medium content if formatter fails
  getFallbackMediumContent(postPath, originalUrl) {
    const htmlContent = fs.readFileSync(postPath, 'utf8');
    const title = this.extractTitle(htmlContent);
    const excerpt = this.extractExcerpt(htmlContent);
    
    return `# ${title}

*${excerpt}*

{FULL_CONTENT}

---

*Originally published on [TanziTech Blog](${originalUrl})*

*Follow me for more insights on AI, Data Science, and Digital Marketing.*

---

**Tags**: #DataScience #AI #Analytics #TechInsights #DigitalMarketing`;
  }

  // Truncate text to fit platform limits
  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  // Schedule crosspost for a specific post
  scheduleCrosspost(postPath, language, deploymentDate) {
    const contentAnalysis = this.analyzeContent(postPath, language);
    if (!contentAnalysis) return;

    // Add postPath to contentAnalysis for Medium formatter
    contentAnalysis.postPath = postPath;

    const category = contentAnalysis.category;
    const categoryConfig = CONTENT_CATEGORIES[category];
    
    if (!categoryConfig) return;

    const originalUrl = this.generateBlogUrl(postPath, language);
    
    // Schedule for each platform
    categoryConfig.platforms.forEach(platform => {
      if (!CROSSPOST_CONFIG.platforms[platform].enabled) return;

      const delay = CROSSPOST_CONFIG.scheduling.delays[platform] || 60;
      const scheduledTime = new Date(deploymentDate);
      scheduledTime.setMinutes(scheduledTime.getMinutes() + delay);

      const crosspost = {
        id: `${Date.now()}_${platform}_${language}`,
        platform,
        language,
        postPath,
        originalUrl,
        content: this.generatePlatformContent(contentAnalysis, platform, originalUrl),
        scheduledTime: scheduledTime.toISOString(),
        status: 'scheduled',
        priority: categoryConfig.priority,
        category,
        contentAnalysis,
        attempts: 0,
        maxAttempts: 3
      };

      this.crosspostQueue.push(crosspost);
    });
  }

  // Generate blog URL for the post
  generateBlogUrl(postPath, language) {
    const filename = path.basename(postPath);
    const baseUrl = 'https://tanzitech.com'; // Your actual custom domain
    return `${baseUrl}/${language}/posts/${filename}`;
  }

  // Process all scheduled blog posts for crossposting
  scheduleAllBlogPosts() {
    const languages = ['en', 'it', 'de'];
    let totalScheduled = 0;

    languages.forEach(language => {
      const postsDir = path.join(this.baseDir, language, 'posts');
      if (!fs.existsSync(postsDir)) return;

      const postFiles = fs.readdirSync(postsDir).filter(file => file.endsWith('.html'));
      
      postFiles.forEach(postFile => {
        const postPath = path.join(postsDir, postFile);
        const deploymentDate = new Date(); // You can customize this based on your deployment schedule
        
        this.scheduleCrosspost(postPath, language, deploymentDate);
        totalScheduled++;
      });
    });

    console.log(`📅 Scheduled ${this.crosspostQueue.length} crossposts for ${totalScheduled} blog posts`);
    return this.crosspostQueue;
  }

  // Save crosspost queue to file
  saveCrosspostQueue() {
    const queueFile = path.join(this.baseDir, 'crosspost-queue.json');
    const queueData = {
      generated: new Date().toISOString(),
      totalCrossposts: this.crosspostQueue.length,
      platforms: [...new Set(this.crosspostQueue.map(cp => cp.platform))],
      languages: [...new Set(this.crosspostQueue.map(cp => cp.language))],
      queue: this.crosspostQueue
    };

    fs.writeFileSync(queueFile, JSON.stringify(queueData, null, 2));
    console.log(`💾 Crosspost queue saved to ${queueFile}`);
    return queueFile;
  }

  // Generate crosspost analytics report
  generateAnalyticsReport() {
    const report = {
      totalPosts: this.crosspostQueue.length,
      platforms: {},
      languages: {},
      categories: {},
      priorities: { high: 0, medium: 0, low: 0 }
    };

    this.crosspostQueue.forEach(crosspost => {
      // Platform stats
      report.platforms[crosspost.platform] = (report.platforms[crosspost.platform] || 0) + 1;
      
      // Language stats
      report.languages[crosspost.language] = (report.languages[crosspost.language] || 0) + 1;
      
      // Category stats
      report.categories[crosspost.category] = (report.categories[crosspost.category] || 0) + 1;
      
      // Priority stats
      report.priorities[crosspost.priority] = (report.priorities[crosspost.priority] || 0) + 1;
    });

    console.log('\n📊 CROSSPOSTING ANALYTICS');
    console.log('========================');
    console.log(`Total Scheduled: ${report.totalPosts}`);
    console.log(`Platforms: ${Object.keys(report.platforms).join(', ')}`);
    console.log(`Languages: ${Object.keys(report.languages).join(', ')}`);
    console.log('Platform Distribution:', report.platforms);
    console.log('Language Distribution:', report.languages);
    console.log('Category Distribution:', report.categories);
    console.log('========================\n');

    return report;
  }

  // Execute crossposting (placeholder for actual API calls)
  async executeCrosspost(crosspost) {
    try {
      console.log(`🚀 Crossposting to ${crosspost.platform} (${crosspost.language}): ${crosspost.contentAnalysis.title}`);
      
      // Here you would implement actual API calls to each platform
      // For now, we'll simulate the process
      await this.simulateApiCall(crosspost);
      
      crosspost.status = 'completed';
      crosspost.completedAt = new Date().toISOString();
      
      this.analytics.successfulPosts++;
      console.log(`✅ Successfully posted to ${crosspost.platform}`);
      
    } catch (error) {
      console.error(`❌ Failed to crosspost to ${crosspost.platform}: ${error.message}`);
      crosspost.status = 'failed';
      crosspost.error = error.message;
      crosspost.attempts++;
      
      this.analytics.failedPosts++;
      
      // Retry if under max attempts
      if (crosspost.attempts < crosspost.maxAttempts) {
        crosspost.status = 'retry';
        console.log(`🔄 Will retry crosspost to ${crosspost.platform}`);
      }
    }
  }

  // Simulate API call (replace with real implementation)
  async simulateApiCall(crosspost) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 90% success rate simulation
        if (Math.random() > 0.1) {
          resolve({ success: true, postId: `sim_${Date.now()}` });
        } else {
          reject(new Error('Simulated API failure'));
        }
      }, 1000);
    });
  }
}

// Main execution
async function main() {
  console.log('🌐 TanziTech Crossposting Manager Starting...\n');
  
  const manager = new CrosspostingManager();
  
  try {
    // Schedule all blog posts for crossposting
    manager.scheduleAllBlogPosts();
    
    // Save queue and generate report
    manager.saveCrosspostQueue();
    manager.generateAnalyticsReport();
    
    console.log('✅ Crossposting schedule created successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Configure API keys for each platform');
    console.log('2. Test crossposting with a single post');
    console.log('3. Set up automated execution via cron/scheduler');
    console.log('4. Monitor crosspost performance and adjust timing');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Crossposting setup failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = CrosspostingManager;
