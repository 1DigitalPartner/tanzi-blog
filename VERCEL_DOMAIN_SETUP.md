# 🌐 Vercel Domain Setup Guide for tanzitech.com

## Step 1: Deploy Your Sites to Vercel

### 1.1: Deploy Business Site

```bash
# 1. Push business site to GitHub
cd /Users/gabrieletanzi/social_media_agent/tanzi-business-site
git remote add origin https://github.com/YOUR_USERNAME/tanzi-business-site.git
git branch -M main
git push -u origin main
```

**In Vercel Dashboard:**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select `tanzi-business-site`
4. Click "Deploy"
5. Wait for deployment to complete

### 1.2: Deploy Blog Site

```bash
# 2. Push blog to GitHub  
cd /Users/gabrieletanzi/social_media_agent/blog_deploy
git remote add origin https://github.com/YOUR_USERNAME/tanzi-blog.git
git branch -M main
git push -u origin main
```

**In Vercel Dashboard:**
1. Click "New Project" again
2. Import `tanzi-blog` repository
3. Click "Deploy"

## Step 2: Connect tanzitech.com Domain

### 2.1: Configure Main Domain (Business Site)

1. **In Vercel Dashboard:**
   - Go to your `tanzi-business-site` project
   - Click "Settings" → "Domains"
   - Click "Add Domain"
   - Enter: `tanzitech.com`
   - Click "Add"

2. **Add WWW Subdomain:**
   - Click "Add Domain" again
   - Enter: `www.tanzitech.com`
   - Click "Add"

### 2.2: Configure Blog Subdomain

1. **In your blog project:**
   - Go to `tanzi-blog` project settings
   - Click "Settings" → "Domains"
   - Click "Add Domain"
   - Enter: `blog.tanzitech.com`
   - Click "Add"

## Step 3: Update DNS Records

### At Your Domain Registrar (where you registered tanzitech.com):

**For Main Domain:**
```
Type: A
Name: @
Value: 76.76.21.241
TTL: 3600

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**For Blog Subdomain:**
```
Type: CNAME
Name: blog
Value: cname.vercel-dns.com
TTL: 3600
```

### Common Registrars Instructions:

#### **GoDaddy:**
1. Go to GoDaddy DNS Management
2. Click "Add Record"
3. Select type (A or CNAME)
4. Enter values above

#### **Namecheap:**
1. Go to Domain List → Manage
2. Click "Advanced DNS"
3. Add records as shown above

#### **Cloudflare:**
1. Go to DNS settings
2. Click "Add record"
3. Enter the DNS values

## Step 4: Verify Setup

### Check Domain Connection:
1. **Wait 24-48 hours** for DNS propagation
2. Visit `https://tanzitech.com` → Should show business site
3. Visit `https://blog.tanzitech.com` → Should show blog
4. Check SSL certificate is active (🔒 icon)

### Troubleshooting:
- **DNS not propagating:** Use [whatsmydns.net](https://whatsmydns.net)
- **SSL issues:** Wait 24 hours, Vercel auto-generates SSL
- **Domain errors:** Check DNS records match exactly

## Step 5: Update Site Links

### After domain is connected, update internal links:

**Business Site Navigation:**
```html
<!-- Update blog links from /blog/ to https://blog.tanzitech.com -->
<li><a href="https://blog.tanzitech.com">Blog</a></li>
```

**Blog Back Links:**
```html
<!-- Update back to main site -->
<a href="https://tanzitech.com">← Back to Main Site</a>
```

## Step 6: Set Up Redirects

### In Business Site vercel.json:
```json
{
  "redirects": [
    {
      "source": "/blog",
      "destination": "https://blog.tanzitech.com",
      "permanent": true
    },
    {
      "source": "/blog/(.*)",
      "destination": "https://blog.tanzitech.com/$1",
      "permanent": true
    }
  ]
}
```

## Final Domain Structure:
- `tanzitech.com` → Main business site
- `www.tanzitech.com` → Redirects to main site
- `blog.tanzitech.com` → Blog site
- `info@tanzitech.com` → Your contact email

## Success Checklist:
- [ ] Business site deployed to Vercel
- [ ] Blog site deployed to Vercel  
- [ ] DNS records updated at registrar
- [ ] tanzitech.com shows business site
- [ ] blog.tanzitech.com shows blog
- [ ] SSL certificates active on both
- [ ] All links working between sites
- [ ] Email info@tanzitech.com working
