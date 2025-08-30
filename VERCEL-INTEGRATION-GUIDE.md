# 🚀 Complete Guide: Integrate Blog Proxy into tanzitech.com

## 🎯 **The Situation:**
- Your **tanzitech.com** is already deployed on Vercel (working perfectly)
- You need to add **blog proxy** to the existing project
- We created a vercel.json but it deployed to a new project instead

## ✅ **Solution: Add Proxy to Existing tanzitech.com Project**

### **Step 1: Access Your tanzitech.com Vercel Project**
1. Go to: https://vercel.com/dashboard
2. Find your **tanzitech.com project** (the one that's currently live)
3. Click on it

### **Step 2: Add/Update vercel.json**
In your **tanzitech.com project**, add this vercel.json file:

```json
{
  "rewrites": [
    {
      "source": "/blog/:path*",
      "destination": "https://1digitalpartner.github.io/tanzi-blog/:path*"
    },
    {
      "source": "/blog",
      "destination": "https://1digitalpartner.github.io/tanzi-blog/"
    },
    {
      "source": "/audit",
      "destination": "https://1digitalpartner.github.io/tanzi-blog/audit.html"
    }
  ],
  "headers": [
    {
      "source": "/blog/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600"
        }
      ]
    }
  ]
}
```

### **Step 3: Deploy the Updated Configuration**

**Option A: Via Vercel Dashboard (EASIEST)**
1. In your tanzitech.com project settings
2. Go to "Functions" or "Settings" 
3. Look for "vercel.json" or "Rewrites" section
4. Add the proxy configuration above
5. Click "Deploy"

**Option B: Via Git Repository**
1. Add the vercel.json to your main tanzitech.com repository
2. Push to main branch
3. Vercel will auto-deploy

**Option C: Via CLI (from your main site repo)**
```bash
# Navigate to your main tanzitech.com project directory
cd /path/to/your/main/site
# Copy our vercel.json there
cp /Users/gabrieletanzi/social_media_agent/blog_deploy/vercel.json .
# Deploy
vercel --prod
```

### **Step 4: Test the Proxy**
After deployment (5-10 minutes):
- https://tanzitech.com/blog → Should show your GitHub Pages blog
- https://tanzitech.com/audit → Should show your audit page

### **Step 5: Update Portfolio Links**
Once working, update your portfolio.html:
```javascript
// Change from:
"https://1digitalpartner.github.io/tanzi-blog/audit.html"
// To:
"https://tanzitech.com/audit"
```

## 🔍 **What This Accomplishes:**

✅ **tanzitech.com/blog** → Your GitHub Pages blog  
✅ **tanzitech.com/audit** → Your audit page  
✅ **All automation stays the same** → No code changes needed  
✅ **Clean URLs** → Professional appearance  
✅ **SEO benefits** → Everything under one domain  

## 🚨 **Important Notes:**

1. **Don't delete the new Vercel project** we just created until this works
2. **Your automation will keep working** exactly as before
3. **GitHub Pages stays active** - we're just proxying to it
4. **Test thoroughly** before updating portfolio links

## 📞 **Next Steps:**
1. Add vercel.json to your **main tanzitech.com Vercel project**
2. Deploy the changes
3. Test the URLs
4. Update portfolio links
5. Celebrate! 🎉

---
**The goal: tanzitech.com/blog works while keeping all your automation intact!**
