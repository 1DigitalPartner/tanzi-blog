#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const BlogDeploymentManager = require('./deploy-schedule.js');
const CrosspostingManager = require('./crosspost-automation.js');

/**
 * Integrated Blog Deployment and Crossposting System
 * Combines blog deployment with automatic social media crossposting
 */
class IntegratedDeploymentSystem {
  constructor() {
    this.deploymentManager = new BlogDeploymentManager();
    this.crosspostManager = new CrosspostingManager();
    this.baseDir = __dirname;
    this.today = new Date().toISOString().split('T')[0];
  }

  // Deploy blog posts and automatically schedule crossposting
  async deployWithCrossposting() {
    console.log('🚀 Integrated Deployment & Crossposting System Starting...\n');

    try {
      // Step 1: Deploy scheduled blog posts
      console.log('📝 Step 1: Deploying scheduled blog posts...');
      await this.deploymentManager.deployScheduledPosts();
      
      // Step 2: Get deployed posts from deployment log
      const deployedPosts = this.getDeployedPostsToday();
      
      if (deployedPosts.length === 0) {
        console.log('📅 No posts deployed today - skipping crossposting');
        return;
      }

      console.log(`\n🌐 Step 2: Scheduling crossposting for ${deployedPosts.length} deployed posts...`);

      // Step 3: Schedule crossposting for each deployed post
      deployedPosts.forEach(postInfo => {
        const postPath = path.join(this.baseDir, postInfo.language, 'posts', postInfo.filename);
        const deploymentTime = new Date();
        
        this.crosspostManager.scheduleCrosspost(postPath, postInfo.language, deploymentTime);
      });

      // Step 4: Save integrated crosspost queue
      this.crosspostManager.saveCrosspostQueue();
      
      // Step 5: Generate comprehensive report
      this.generateIntegratedReport(deployedPosts);

      // Step 6: Execute immediate crossposting (for platforms with short delays)
      await this.executeImmediateCrossposts();

      console.log('\n✅ Integrated deployment and crossposting completed successfully!');

    } catch (error) {
      console.error('❌ Integrated deployment failed:', error.message);
      throw error;
    }
  }

  // Get posts that were deployed today from deployment log
  getDeployedPostsToday() {
    const logFile = path.join(this.baseDir, 'deployment-log.json');
    const deployedPosts = [];

    try {
      if (!fs.existsSync(logFile)) return deployedPosts;

      const logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
      const todayLogs = logs.filter(log => log.date === this.today);

      todayLogs.forEach(log => {
        if (log.deployedPosts && typeof log.deployedPosts === 'object' && !Array.isArray(log.deployedPosts)) {
          // New format with language separation
          Object.keys(log.deployedPosts).forEach(language => {
            if (Array.isArray(log.deployedPosts[language])) {
              log.deployedPosts[language].forEach(filename => {
                deployedPosts.push({ filename, language });
              });
            }
          });
        } else if (Array.isArray(log.deployedPosts)) {
          // Legacy format
          log.deployedPosts.forEach(filename => {
            deployedPosts.push({ filename, language: 'en' });
          });
        }
      });

    } catch (error) {
      console.error('Error reading deployment log:', error.message);
    }

    return deployedPosts;
  }

  // Execute crossposting for platforms with immediate posting (15-30 minute delays)
  async executeImmediateCrossposts() {
    console.log('\n📱 Step 3: Executing immediate crossposts (Twitter, LinkedIn)...');
    
    const queueFile = path.join(this.baseDir, 'crosspost-queue.json');
    if (!fs.existsSync(queueFile)) return;

    const queueData = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
    const immediatePlatforms = ['twitter', 'linkedin'];
    
    const immediateJobs = queueData.queue.filter(job => 
      immediatePlatforms.includes(job.platform) && job.status === 'scheduled'
    );

    console.log(`🎯 Found ${immediateJobs.length} immediate crosspost jobs`);

    for (const job of immediateJobs) {
      const scheduledTime = new Date(job.scheduledTime);
      const now = new Date();
      const delay = scheduledTime.getTime() - now.getTime();

      if (delay <= 30 * 60 * 1000) { // Within 30 minutes
        console.log(`⏰ Executing crosspost to ${job.platform} for: ${job.contentAnalysis.title}`);
        
        // Simulate crosspost execution
        await this.simulateDelayedExecution(Math.max(delay, 0));
        await this.crosspostManager.executeCrosspost(job);
      }
    }

    // Update queue file with execution results
    fs.writeFileSync(queueFile, JSON.stringify(queueData, null, 2));
  }

  // Simulate delay before execution
  async simulateDelayedExecution(delayMs) {
    if (delayMs > 0) {
      console.log(`⏳ Waiting ${Math.round(delayMs / 1000 / 60)} minutes before crossposting...`);
      await new Promise(resolve => setTimeout(resolve, Math.min(delayMs, 5000))); // Cap at 5 seconds for demo
    }
  }

  // Generate comprehensive integrated report
  generateIntegratedReport(deployedPosts) {
    const crosspostStats = this.crosspostManager.generateAnalyticsReport();
    
    console.log('\n📊 INTEGRATED DEPLOYMENT REPORT');
    console.log('================================');
    console.log(`Date: ${this.today}`);
    console.log(`Blog Posts Deployed: ${deployedPosts.length}`);
    console.log(`Crossposts Scheduled: ${crosspostStats.totalPosts}`);
    console.log('\nDeployment Breakdown:');
    
    const languageBreakdown = {};
    deployedPosts.forEach(post => {
      languageBreakdown[post.language] = (languageBreakdown[post.language] || 0) + 1;
    });
    
    Object.keys(languageBreakdown).forEach(lang => {
      console.log(`  ${lang.toUpperCase()}: ${languageBreakdown[lang]} posts`);
    });

    console.log('\nCrossposting Schedule:');
    Object.keys(crosspostStats.platforms).forEach(platform => {
      console.log(`  ${platform}: ${crosspostStats.platforms[platform]} posts`);
    });

    console.log('\nContent Categories:');
    Object.keys(crosspostStats.categories).forEach(category => {
      console.log(`  ${category}: ${crosspostStats.categories[category]} crossposts`);
    });

    console.log('================================\n');

    // Save integrated report
    const reportData = {
      date: this.today,
      deployedPosts,
      crosspostStats,
      generatedAt: new Date().toISOString()
    };

    fs.writeFileSync(
      path.join(this.baseDir, 'integrated-report.json'), 
      JSON.stringify(reportData, null, 2)
    );
  }

  // Setup scheduled crossposting execution
  setupScheduledCrossposting() {
    const cronScript = `#!/bin/bash
# Scheduled Crossposting Execution Script
# Run this via cron to execute delayed crossposts

cd "${this.baseDir}"

# Execute crossposts scheduled for current time
node -e "
const fs = require('fs');
const CrosspostingManager = require('./crosspost-automation.js');

const manager = new CrosspostingManager();
const queueFile = './crosspost-queue.json';

if (fs.existsSync(queueFile)) {
  const queueData = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
  const now = new Date();
  
  const dueJobs = queueData.queue.filter(job => {
    const scheduledTime = new Date(job.scheduledTime);
    const timeDiff = Math.abs(now.getTime() - scheduledTime.getTime());
    return job.status === 'scheduled' && timeDiff <= 15 * 60 * 1000; // Within 15 minutes
  });
  
  console.log(\`Executing \${dueJobs.length} scheduled crossposts...\`);
  
  Promise.all(dueJobs.map(job => manager.executeCrosspost(job))).then(() => {
    fs.writeFileSync(queueFile, JSON.stringify(queueData, null, 2));
    console.log('✅ Scheduled crossposts completed');
  }).catch(err => {
    console.error('❌ Crosspost execution failed:', err.message);
  });
} else {
  console.log('📅 No crosspost queue found');
}
"`;

    fs.writeFileSync(path.join(this.baseDir, 'execute-scheduled-crossposts.sh'), cronScript);
    console.log('📋 Scheduled crossposting script created: execute-scheduled-crossposts.sh');
    
    return cronScript;
  }
}

// Main execution
async function main() {
  const integratedSystem = new IntegratedDeploymentSystem();
  
  try {
    await integratedSystem.deployWithCrossposting();
    integratedSystem.setupScheduledCrossposting();
    
    console.log('🎉 SYSTEM READY!');
    console.log('================');
    console.log('✅ Blog deployment completed');
    console.log('✅ Crossposting scheduled');
    console.log('✅ Immediate posts executed');
    console.log('✅ Scheduled execution setup');
    console.log('');
    console.log('📋 Monitoring Files:');
    console.log('  • deployment-log.json - Blog deployment history');
    console.log('  • crosspost-queue.json - Crossposting schedule');
    console.log('  • integrated-report.json - Combined analytics');
    console.log('  • social-promotion-queue.json - Social media promotion');
    console.log('');
    console.log('⚡ Automation Commands:');
    console.log('  • npm run deploy - Deploy blog posts');
    console.log('  • node crosspost-automation.js - Schedule crossposts');
    console.log('  • ./execute-scheduled-crossposts.sh - Execute delayed posts');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ System deployment failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = IntegratedDeploymentSystem;
