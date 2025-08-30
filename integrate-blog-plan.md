# 🚀 Plan: Integrate tanzi-blog into tanzitech.com/blog

## 🎯 **Goal:**
Move all blog content from `tanzi-blog` repository to be served at `tanzitech.com/blog`

## 📋 **Current Situation:**
- ✅ **tanzitech.com** - Main site (Vercel)
- ✅ **tanzi-blog** - Blog with automation (GitHub Pages)
- ❌ **Need**: Blog accessible at tanzitech.com/blog

## 🛠️ **Integration Options:**

### **Option A: Move to Vercel (RECOMMENDED)**
1. **Copy blog content** from tanzi-blog to Vercel project
2. **Set up /blog route** in Vercel
3. **Move automation scripts** to Vercel project
4. **Keep GitHub Actions** for automation
5. **Update crosspost URLs** to tanzitech.com/blog

### **Option B: Subdomain**
1. **Set up blog.tanzitech.com** → GitHub Pages
2. **Keep automation** in tanzi-blog
3. **Update crosspost URLs** to blog.tanzitech.com

### **Option C: Proxy/Redirect**
1. **Keep blog on GitHub Pages**
2. **Set up proxy** from tanzitech.com/blog → GitHub Pages
3. **Configure in Vercel** or Cloudflare

## 📁 **Files to move (Option A):**

From `tanzi-blog` repository:
```
- /en/posts/*.html
- /it/posts/*.html  
- /de/posts/*.html
- audit.html → /blog/audit
- deploy-schedule.js
- crosspost-automation.js
- medium-formatter.js
- .github/workflows/*.yml
- package.json (merge scripts)
```

## 🔄 **Automation Updates Needed:**

1. **Update crosspost URLs:**
   ```javascript
   // Old: https://1digitalpartner.github.io/tanzi-blog/
   // New: https://tanzitech.com/blog/
   ```

2. **Update GitHub Actions:**
   - Deploy to Vercel instead of GitHub Pages
   - Update deployment paths
   - Configure Vercel integration

3. **Update portfolio links:**
   ```javascript
   // Old: https://1digitalpartner.github.io/tanzi-blog/audit.html
   // New: https://tanzitech.com/blog/audit
   ```

## ⚡ **Quick Implementation (Option A):**

1. **Create /blog folder** in Vercel project
2. **Copy all content** from tanzi-blog
3. **Update automation scripts** with new URLs
4. **Test deployment**
5. **Update portfolio links**
6. **Delete tanzi-blog** repository

## 🎯 **Benefits of Option A:**
- ✅ Everything under one domain
- ✅ No more GitHub Pages complexity
- ✅ Faster loading (Vercel CDN)
- ✅ Unified analytics
- ✅ Simplified deployment

## 📋 **Implementation Steps:**

1. **First**: Complete repository cleanup
2. **Second**: Copy content to Vercel
3. **Third**: Update automation
4. **Fourth**: Test everything
5. **Fifth**: Update portfolio
6. **Sixth**: Delete tanzi-blog repo

---
**Recommended: Option A - Move everything to Vercel for maximum simplicity!**
