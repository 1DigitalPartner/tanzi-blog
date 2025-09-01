#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class MediumFormatter {
  constructor() {
    this.baseUrl = 'https://tanzitech.com';
  }

  // Convert HTML to Medium-friendly Markdown
  htmlToMedium(htmlContent, originalUrl, language = 'en') {
    try {
      // Extract key components
      const title = this.extractTitle(htmlContent);
      const metaDescription = this.extractMetaDescription(htmlContent);
      const content = this.extractMainContent(htmlContent);
      
      // Convert to clean Markdown
      let markdown = this.convertToMarkdown(content);
      
      // Add Medium-specific formatting
      const mediumPost = this.formatForMedium({
        title,
        description: metaDescription,
        content: markdown,
        originalUrl,
        language
      });
      
      return mediumPost;
      
    } catch (error) {
      console.error('Error converting to Medium format:', error.message);
      return null;
    }
  }

  // Extract title from HTML
  extractTitle(htmlContent) {
    const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
    if (titleMatch) {
      return titleMatch[1].replace(' | Gabriele Tanzi', '').trim();
    }
    
    const h1Match = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (h1Match) {
      return this.cleanText(h1Match[1]);
    }
    
    return 'Untitled Post';
  }

  // Extract meta description
  extractMetaDescription(htmlContent) {
    const descMatch = htmlContent.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    if (descMatch) {
      return descMatch[1].trim();
    }
    
    // Fallback: extract from first paragraph
    const pMatch = htmlContent.match(/<p[^>]*>(.*?)<\/p>/i);
    if (pMatch) {
      const text = this.cleanText(pMatch[1]);
      return text.length > 160 ? text.substring(0, 157) + '...' : text;
    }
    
    return '';
  }

  // Extract main content (everything inside main article)
  extractMainContent(htmlContent) {
    // First try to extract content div (more specific)
    const contentMatch = htmlContent.match(/<div[^>]*class="content"[^>]*>([\s\S]*?)<\/div>(?:\s*<\/div>)*$/i);
    if (contentMatch) {
      return contentMatch[1];
    }
    
    // Try to extract the entire container and then get content inside
    const containerMatch = htmlContent.match(/<div[^>]*class="container"[^>]*>([\s\S]*?)<\/div>(?:\s*<\/body>)?(?:\s*<\/html>)?$/i);
    if (containerMatch) {
      let containerContent = containerMatch[1];
      
      // Now look for content div inside container
      const innerContentMatch = containerContent.match(/<div[^>]*class="content"[^>]*>([\s\S]*?)<\/div>/i);
      if (innerContentMatch) {
        return innerContentMatch[1];
      }
      
      // If no content div, return the whole container (minus header/hero sections)
      return containerContent;
    }
    
    // Try main and article tags
    const mainMatch = htmlContent.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
                     htmlContent.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    
    if (mainMatch) {
      return mainMatch[1];
    }
    
    // Fallback: extract body content but remove scripts and styles
    const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      let content = bodyMatch[1];
      // Remove script tags, style tags, and head content
      content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
      content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
      content = content.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
      return content;
    }
    
    return htmlContent;
  }

  // Convert HTML content to clean Markdown
  convertToMarkdown(htmlContent) {
    let markdown = htmlContent;
    
    // First remove unwanted elements completely
    markdown = markdown.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    markdown = markdown.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    markdown = markdown.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
    markdown = markdown.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
    markdown = markdown.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
    
    // Convert hero/title sections
    markdown = markdown.replace(/<div[^>]*class="[^"]*hero-title[^"]*"[^>]*>(.*?)<\/div>/gi, '\n# $1\n');
    markdown = markdown.replace(/<h1[^>]*class="[^"]*hero-title[^"]*"[^>]*>(.*?)<\/h1>/gi, '\n# $1\n');
    
    // Convert headers (h1-h6)
    markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n');
    markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n');
    markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n');
    markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n#### $1\n');
    markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '\n##### $1\n');
    markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '\n###### $1\n');
    
    // Convert special content boxes to emphasized paragraphs
    markdown = markdown.replace(/<div[^>]*class="[^"]*instagram-box[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, '\n\n**📸 INSTAGRAM INSIGHT:**\n$1\n');
    markdown = markdown.replace(/<div[^>]*class="[^"]*engagement-box[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, '\n\n**✅ ENGAGEMENT TIP:**\n$1\n');
    markdown = markdown.replace(/<div[^>]*class="[^"]*warning-box[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, '\n\n**⚠️ IMPORTANT:**\n$1\n');
    
    // Convert stats bar to formatted section
    markdown = markdown.replace(/<div[^>]*class="[^"]*stats-bar[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, (match, content) => {
      // Extract stat numbers and labels
      const stats = content.match(/<div[^>]*class="[^"]*stat[^"]*"[^>]*>([\s\S]*?)<\/div>/gi) || [];
      let statsText = '\n\n**📊 KEY STATISTICS:**\n';
      
      stats.forEach(stat => {
        const numberMatch = stat.match(/<div[^>]*class="[^"]*stat-number[^"]*"[^>]*>([^<]*?)<\/div>/i);
        const labelMatch = stat.match(/<div[^>]*class="[^"]*stat-label[^"]*"[^>]*>([^<]*?)<\/div>/i);
        if (numberMatch && labelMatch) {
          statsText += `• **${numberMatch[1].trim()}** ${labelMatch[1].trim()}\n`;
        }
      });
      
      return statsText + '\n';
    });
    
    // Convert highlighted data spans
    markdown = markdown.replace(/<span[^>]*class="[^"]*data-highlight[^"]*"[^>]*>([^<]*?)<\/span>/gi, '**$1**');
    
    // Convert paragraphs
    markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n');
    
    // Convert bold and italic
    markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
    markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
    markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
    
    // Convert links
    markdown = markdown.replace(/<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
    
    // Convert unordered lists
    markdown = markdown.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
      const items = content.match(/<li[^>]*>(.*?)<\/li>/gi) || [];
      return '\n' + items.map(item => {
        const text = item.replace(/<li[^>]*>(.*?)<\/li>/i, '$1');
        return `• ${this.cleanText(text)}`;
      }).join('\n') + '\n';
    });
    
    // Convert ordered lists
    markdown = markdown.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
      const items = content.match(/<li[^>]*>(.*?)<\/li>/gi) || [];
      return '\n' + items.map((item, index) => {
        const text = item.replace(/<li[^>]*>(.*?)<\/li>/i, '$1');
        return `${index + 1}. ${this.cleanText(text)}`;
      }).join('\n') + '\n';
    });
    
    // Convert blockquotes
    markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '\n> $1\n');
    
    // Convert code blocks
    markdown = markdown.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '\n```\n$1\n```\n');
    markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
    
    // Convert images
    markdown = markdown.replace(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/gi, '\n![Alt text]($1)\n*$2*\n');
    markdown = markdown.replace(/<img[^>]+src="([^"]+)"[^>]*>/gi, '\n![Image]($1)\n');
    
    // Convert horizontal rules
    markdown = markdown.replace(/<hr[^>]*>/gi, '\n---\n');
    
    // Convert line breaks
    markdown = markdown.replace(/<br\s*\/?>/gi, '\n');
    
    // Remove remaining HTML tags
    markdown = markdown.replace(/<[^>]+>/g, '');
    
    // Clean up HTML entities
    markdown = markdown.replace(/&amp;/g, '&');
    markdown = markdown.replace(/&lt;/g, '<');
    markdown = markdown.replace(/&gt;/g, '>');
    markdown = markdown.replace(/&quot;/g, '"');
    markdown = markdown.replace(/&#39;/g, "'");
    markdown = markdown.replace(/&nbsp;/g, ' ');
    
    // Clean up extra whitespace and lines
    markdown = markdown.replace(/\n{3,}/g, '\n\n');
    markdown = markdown.replace(/^\s+|\s+$/g, '');
    
    // Clean up excessive whitespace within lines
    markdown = markdown.replace(/^\s*$/gm, ''); // Remove empty lines with just whitespace
    markdown = markdown.replace(/\n\s*\n\s*\n/g, '\n\n'); // Reduce triple+ newlines to double
    markdown = markdown.replace(/^[ \t]+/gm, ''); // Remove leading whitespace on each line
    
    return markdown;
  }

  // Format content specifically for Medium
  formatForMedium({ title, description, content, originalUrl, language }) {
    const mediumPost = `# ${title}

${description ? `*${description}*\n\n` : ''}${content}

---

*Originally published on [TanziTech Blog](${originalUrl})*

*Follow me for more insights on AI, Data Science, and Digital Marketing.*

---

**Tags**: #DataScience #AI #Analytics #TechInsights #DigitalMarketing #LeadGeneration #SocialMediaStrategy`;

    return mediumPost;
  }

  // Clean text from HTML artifacts
  cleanText(text) {
    return text
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Convert single post to Medium format
  convertPost(postPath, outputDir = './medium-formatted') {
    try {
      if (!fs.existsSync(postPath)) {
        throw new Error(`Post not found: ${postPath}`);
      }
      
      const htmlContent = fs.readFileSync(postPath, 'utf8');
      const filename = path.basename(postPath, '.html');
      const language = postPath.includes('/en/') ? 'en' : 
                      postPath.includes('/it/') ? 'it' : 
                      postPath.includes('/de/') ? 'de' : 'en';
      
      const originalUrl = `${this.baseUrl}/${language}/posts/${path.basename(postPath)}`;
      
      const mediumContent = this.htmlToMedium(htmlContent, originalUrl, language);
      
      if (!mediumContent) {
        throw new Error('Failed to convert HTML to Medium format');
      }
      
      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const outputPath = path.join(outputDir, `${filename}.md`);
      fs.writeFileSync(outputPath, mediumContent, 'utf8');
      
      console.log(`✅ Converted: ${filename} -> ${outputPath}`);
      return outputPath;
      
    } catch (error) {
      console.error(`❌ Error converting ${postPath}:`, error.message);
      return null;
    }
  }

  // Convert all posts in a directory
  convertAllPosts(postsDir, outputDir = './medium-formatted') {
    try {
      const results = [];
      const languages = ['en', 'it', 'de'];
      
      languages.forEach(lang => {
        const langPostsDir = path.join(postsDir, lang, 'posts');
        
        if (fs.existsSync(langPostsDir)) {
          const posts = fs.readdirSync(langPostsDir)
            .filter(file => file.endsWith('.html'));
          
          console.log(`\n📝 Converting ${posts.length} ${lang.toUpperCase()} posts...`);
          
          posts.forEach(post => {
            const postPath = path.join(langPostsDir, post);
            const result = this.convertPost(postPath, path.join(outputDir, lang));
            
            if (result) {
              results.push({
                original: postPath,
                converted: result,
                language: lang
              });
            }
          });
        }
      });
      
      console.log(`\n🎉 Conversion complete! ${results.length} posts converted for Medium.`);
      return results;
      
    } catch (error) {
      console.error('❌ Error converting posts:', error.message);
      return [];
    }
  }

  // Generate conversion report
  generateReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      totalConverted: results.length,
      byLanguage: {},
      files: results
    };
    
    results.forEach(result => {
      if (!report.byLanguage[result.language]) {
        report.byLanguage[result.language] = 0;
      }
      report.byLanguage[result.language]++;
    });
    
    const reportPath = './medium-conversion-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 MEDIUM CONVERSION REPORT');
    console.log('===========================');
    console.log(`Total Converted: ${report.totalConverted}`);
    Object.keys(report.byLanguage).forEach(lang => {
      console.log(`${lang.toUpperCase()}: ${report.byLanguage[lang]} posts`);
    });
    console.log(`Report saved: ${reportPath}`);
    
    return report;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const formatter = new MediumFormatter();
  
  if (args.length === 0) {
    // Convert all posts
    console.log('🚀 Medium Formatter - Converting all posts...\n');
    const results = formatter.convertAllPosts('.');
    formatter.generateReport(results);
  } else {
    // Convert specific post
    const postPath = args[0];
    console.log(`🚀 Medium Formatter - Converting: ${postPath}\n`);
    formatter.convertPost(postPath);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = MediumFormatter;
