#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Deployment configuration
const DEPLOYMENT_SCHEDULE = {
  // Posts to deploy on specific dates - Multi-language support
  '2025-08-26': {
    'en': [
      '2025-08-17-programming-trends-content-analysis.html',
      '2025-08-16-shocking-truth-about-ai-technology.html'
    ],
    'it': [
      '2025-08-17-analisi-tendenze-programmazione.html'
    ],
    'de': [
      '2025-08-17-programmiertrends-content-analyse.html'
    ]
  },
  '2025-08-27': {
    'en': [
      '2025-08-15-5-data-science-insights-change-strategy.html',
      '2025-08-15-ai-technology-strategy-quietly-dominating.html'
    ],
    'it': [
      // Italian versions will be added here
    ],
    'de': [
      // German versions will be added here
    ]
  },
  '2025-08-28': {
    'en': [
      '2025-08-26-high-value-social-media-intelligence-report.html'
    ],
    'it': [
      '2025-08-26-rapporto-intelligence-social-media-alto-valore.html'
    ],
    'de': [
      '2025-08-26-hochwertige-social-media-intelligence-bericht.html'
    ]
  },
  '2025-08-29': {
    'en': [
      '2025-08-26-linkedin-lead-generation-viral-social-media-strategy.html'
    ],
    'it': [
      // Italian version to be created
    ],
    'de': [
      // German version to be created
    ]
  },
  '2025-08-30': {
    'en': [
      '2025-08-26-hidden-psychology-ai-content-viral-posts-analysis.html'
    ],
    'it': [
      // Italian version to be created
    ],
    'de': [
      // German version to be created
    ]
  },
  '2025-09-02': {
    'en': [
      '2025-08-26-advanced-lead-generation-strategies-social-media-intelligence.html'
    ],
    'it': [
      // Italian version to be created
    ],
    'de': [
      // German version to be created
    ]
  },
  '2025-09-03': {
    // Newsletter content deployment
    'en': [
      // Newsletter posts to be created
    ],
    'it': [
      // Italian newsletters
    ],
    'de': [
      // German newsletters
    ]
  },
  '2025-09-04': {
    // Additional content and guides
    'en': [
      // Content calendar posts, trend reports, etc.
    ]
  }
};

// Social media promotion schedule
const SOCIAL_PROMOTION = {
  twitter: {
    enabled: true,
    delay: 30, // minutes after blog deployment
    template: "🚀 New blog post: {TITLE}\n\n{EXCERPT}\n\nRead more: {URL}\n\n{HASHTAGS}"
  },
  linkedin: {
    enabled: true,
    delay: 60, // minutes after blog deployment
    template: "📊 Latest analysis: {TITLE}\n\n{EXCERPT}\n\nFull insights: {URL}"
  }
};

class BlogDeploymentManager {
  constructor() {
    this.baseDir = __dirname;
    this.today = new Date().toISOString().split('T')[0];
    this.deployedToday = {
      'en': [],
      'it': [],
      'de': []
    };
  }

  // Get posts scheduled for today
  getScheduledPosts() {
    const todaySchedule = DEPLOYMENT_SCHEDULE[this.today] || {};
    let allPosts = [];
    
    // Collect posts from all languages
    Object.keys(todaySchedule).forEach(lang => {
      if (Array.isArray(todaySchedule[lang])) {
        todaySchedule[lang].forEach(post => {
          allPosts.push({ file: post, language: lang });
        });
      }
    });
    
    return allPosts;
  }

  // Check if post exists
  postExists(filename) {
    return fs.existsSync(path.join(this.postsDir, filename));
  }

  // Deploy posts scheduled for today
  async deployScheduledPosts() {
    const scheduledPosts = this.getScheduledPosts();
    
    if (scheduledPosts.length === 0) {
      console.log(`📅 No posts scheduled for deployment on ${this.today}`);
      return;
    }

    console.log(`🚀 Deploying ${scheduledPosts.length} posts for ${this.today}:`);
    
    for (const postInfo of scheduledPosts) {
      const postPath = path.join(__dirname, postInfo.language, 'posts', postInfo.file);
      if (fs.existsSync(postPath)) {
        await this.deployPost(postInfo);
        this.deployedToday[postInfo.language].push(postInfo.file);
      } else {
        console.log(`❌ Post not found: ${postInfo.language}/${postInfo.file}`);
      }
    }

    // Update deployment log
    this.updateDeploymentLog();
    
    // Trigger social media promotion
    this.scheduleSocialPromotion();
  }

  // Deploy individual post
  async deployPost(postInfo) {
    try {
      console.log(`📝 Deploying: ${postInfo.language}/${postInfo.file}`);
      
      // Here you would add your actual deployment logic
      // Examples:
      // - Upload to hosting service
      // - Update CDN
      // - Notify subscribers
      
      // For demonstration, we'll just log
      console.log(`✅ Successfully deployed: ${postInfo.language}/${postInfo.file}`);
      
      // Add a small delay between deployments
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Failed to deploy ${postInfo.language}/${postInfo.file}:`, error.message);
    }
  }

  // Update deployment log
  updateDeploymentLog() {
    const totalPosts = Object.values(this.deployedToday).reduce((sum, posts) => sum + posts.length, 0);
    const logEntry = {
      date: this.today,
      deployedPosts: this.deployedToday,
      totalPosts: totalPosts,
      timestamp: new Date().toISOString()
    };

    const logFile = path.join(__dirname, 'deployment-log.json');
    let logs = [];

    if (fs.existsSync(logFile)) {
      logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    }

    logs.push(logEntry);
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
    
    console.log(`📊 Updated deployment log with ${totalPosts} posts`);
  }

  // Schedule social media promotion
  scheduleSocialPromotion() {
    if (!SOCIAL_PROMOTION.twitter.enabled && !SOCIAL_PROMOTION.linkedin.enabled) {
      return;
    }

    console.log('📱 Scheduling social media promotion...');
    
    // Flatten all deployed posts across languages
    let allDeployedPosts = [];
    Object.keys(this.deployedToday).forEach(lang => {
      this.deployedToday[lang].forEach(post => {
        allDeployedPosts.push({ filename: post, language: lang });
      });
    });
    
    // This would integrate with your social media automation tools
    // For now, we'll create a reminder file
    const promotionFile = path.join(__dirname, 'social-promotion-queue.json');
    const promotionQueue = {
      date: this.today,
      posts: allDeployedPosts.map(postInfo => ({
        filename: postInfo.filename,
        language: postInfo.language,
        title: this.extractTitleFromPost(postInfo.filename, postInfo.language),
        scheduledAt: new Date().toISOString()
      }))
    };

    fs.writeFileSync(promotionFile, JSON.stringify(promotionQueue, null, 2));
    console.log('✅ Social promotion queue updated');
  }

  // Extract title from HTML post (simplified)
  extractTitleFromPost(filename, language = 'en') {
    try {
      const filePath = path.join(__dirname, language, 'posts', filename);
      const content = fs.readFileSync(filePath, 'utf8');
      const titleMatch = content.match(/<title>(.*?)<\/title>/);
      return titleMatch ? titleMatch[1].replace(' | Gabriele Tanzi', '') : filename;
    } catch (error) {
      return filename;
    }
  }

  // Generate deployment report
  generateReport() {
    const totalPosts = Object.values(this.deployedToday).reduce((sum, posts) => sum + posts.length, 0);
    const reportData = {
      deploymentDate: this.today,
      totalPostsDeployed: totalPosts,
      deployedPosts: this.deployedToday,
      nextScheduled: this.getNextScheduledDate(),
      socialPromotionEnabled: SOCIAL_PROMOTION.twitter.enabled || SOCIAL_PROMOTION.linkedin.enabled
    };

    console.log('\n📋 DEPLOYMENT REPORT');
    console.log('====================');
    console.log(`Date: ${reportData.deploymentDate}`);
    console.log(`Posts Deployed: ${reportData.totalPostsDeployed}`);
    console.log(`English: ${this.deployedToday.en.length}, Italian: ${this.deployedToday.it.length}, German: ${this.deployedToday.de.length}`);
    console.log(`Next Scheduled: ${reportData.nextScheduled || 'No upcoming deployments'}`);
    console.log('====================\n');

    return reportData;
  }

  // Get next scheduled deployment date
  getNextScheduledDate() {
    const today = new Date(this.today);
    const scheduleKeys = Object.keys(DEPLOYMENT_SCHEDULE);
    
    for (const dateKey of scheduleKeys.sort()) {
      const scheduleDate = new Date(dateKey);
      if (scheduleDate > today && DEPLOYMENT_SCHEDULE[dateKey].length > 0) {
        return dateKey;
      }
    }
    return null;
  }
}

// Main execution
async function main() {
  console.log('🚀 Blog Deployment Manager Starting...\n');
  
  const manager = new BlogDeploymentManager();
  
  try {
    await manager.deployScheduledPosts();
    manager.generateReport();
    
    console.log('✅ Deployment completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = BlogDeploymentManager;
