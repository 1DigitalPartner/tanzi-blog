#!/bin/bash
# Scheduled Crossposting Execution Script
# Run this via cron to execute delayed crossposts

cd "/Users/gabrieletanzi/social_media_agent/blog_deploy"

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
  
  console.log(`Executing ${dueJobs.length} scheduled crossposts...`);
  
  Promise.all(dueJobs.map(job => manager.executeCrosspost(job))).then(() => {
    fs.writeFileSync(queueFile, JSON.stringify(queueData, null, 2));
    console.log('✅ Scheduled crossposts completed');
  }).catch(err => {
    console.error('❌ Crosspost execution failed:', err.message);
  });
} else {
  console.log('📅 No crosspost queue found');
}
"