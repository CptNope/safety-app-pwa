# 🚀 GitHub Pages Deployment Guide

## Quick Deploy (Automated via GitHub Actions)

### **Step 1: Commit and Push Changes**

```bash
# Add all SEO improvements
git add .

# Commit
git commit -m "Add SEO optimizations, 3D viewer, reagent calculator"

# Push to GitHub
git push origin main
```

### **Step 2: Enable GitHub Pages**

1. Go to your repository: https://github.com/CptNope/safety-app-pwa
2. Click **Settings** tab
3. Scroll down to **Pages** (left sidebar)
4. Under **Build and deployment**:
   - Source: **GitHub Actions**
5. Save

### **Step 3: Wait for Deployment**

- GitHub Actions will automatically build and deploy
- Check the **Actions** tab to see progress
- Deployment takes ~2-3 minutes
- Your site will be live at: `https://cptnope.github.io/safety-app-pwa/`

---

## What the Workflow Does

The `.github/workflows/deploy.yml` file:

1. ✅ Triggers on every push to `main` branch
2. ✅ Installs Node.js and dependencies
3. ✅ Runs `npm run build`
4. ✅ Deploys the `build/` folder to GitHub Pages
5. ✅ Updates automatically on every commit

---

## Manual Deployment (Alternative)

If you prefer manual control:

### **Option A: Deploy from Local Build**

```bash
# Build locally
npm run build

# Install gh-pages package
npm install -g gh-pages

# Deploy build folder
gh-pages -d build
```

### **Option B: Push Build to gh-pages Branch**

```bash
# Build
npm run build

# Create orphan branch
git checkout --orphan gh-pages

# Remove everything
git rm -rf .

# Copy build contents
cp -r build/* .

# Commit and push
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages --force

# Go back to main
git checkout main
```

Then in GitHub Settings → Pages:
- Source: **Deploy from a branch**
- Branch: **gh-pages** / **(root)**

---

## Custom Domain (Optional)

### **Add Your Own Domain:**

1. In your repo, create `build/CNAME` with your domain:
   ```
   harmreduction.yourdomain.com
   ```

2. Update `build-script.js` to copy CNAME:
   ```javascript
   const itemsToCopy = [
     // ... existing items
     'CNAME'
   ];
   ```

3. In your DNS settings, add CNAME record:
   ```
   harmreduction  →  cptnope.github.io
   ```

4. In GitHub Settings → Pages:
   - Custom domain: `harmreduction.yourdomain.com`
   - ✅ Enforce HTTPS

---

## Update Canonical URLs

After deployment, update these files:

### **index.html**
```html
<!-- Change from -->
<link rel="canonical" href="https://safety-app-pwa.netlify.app/"/>

<!-- To -->
<link rel="canonical" href="https://cptnope.github.io/safety-app-pwa/"/>
```

### **robots.txt**
```
# Change
Sitemap: https://safety-app-pwa.netlify.app/sitemap.xml

# To
Sitemap: https://cptnope.github.io/safety-app-pwa/sitemap.xml
```

### **sitemap.xml**
```xml
<!-- Update all URLs from -->
<loc>https://safety-app-pwa.netlify.app/</loc>

<!-- To -->
<loc>https://cptnope.github.io/safety-app-pwa/</loc>
```

---

## Troubleshooting

### **Issue: Pages not updating**

1. Check Actions tab for errors
2. Clear GitHub Pages cache:
   - Settings → Pages → Click "Custom domain" box
   - Enter then remove a dummy domain
   - This forces rebuild

### **Issue: 404 errors**

GitHub Pages needs `404.html`:
```bash
# Copy index.html as 404.html in build script
cp build/index.html build/404.html
```

Update `build-script.js`:
```javascript
// After copying files
console.log('📄 Creating 404.html for SPA routing...');
fs.copySync('./build/index.html', './build/404.html');
```

### **Issue: Assets not loading**

If using subdirectory (`/safety-app-pwa/`), update paths:
```html
<!-- In index.html, use relative paths -->
<script src="./app.js"></script>
<!-- NOT /app.js -->
```

---

## Monitoring Deployment

### **GitHub Actions Status:**
- ✅ Green check = Deployed successfully
- ❌ Red X = Build failed (check logs)
- 🟡 Yellow dot = Building...

### **View Your Site:**
```
https://cptnope.github.io/safety-app-pwa/
```

### **Test After Deployment:**
1. Open in browser
2. Check all tabs work
3. Test 3D molecule viewer
4. Test reagent calculator
5. Verify offline mode (disconnect WiFi)

---

## SEO After Deployment

### **1. Submit to Google Search Console**
```
https://search.google.com/search-console
```
- Add property: `https://cptnope.github.io/safety-app-pwa/`
- Submit sitemap: `https://cptnope.github.io/safety-app-pwa/sitemap.xml`

### **2. Test Social Previews**

**Facebook:**
```
https://developers.facebook.com/tools/debug/
```

**Twitter:**
```
https://cards-dev.twitter.com/validator
```

### **3. Monitor Performance**

**Google PageSpeed Insights:**
```
https://pagespeed.web.dev/
Enter: https://cptnope.github.io/safety-app-pwa/
```

---

## Deployment Checklist

Before deploying:
- [ ] Update canonical URLs to GitHub Pages domain
- [ ] Update sitemap.xml URLs
- [ ] Update robots.txt sitemap location
- [ ] Add .gitignore (exclude node_modules, build/)
- [ ] Test build locally (`npm run build`)
- [ ] Commit all changes
- [ ] Push to main branch
- [ ] Enable GitHub Pages in repo settings
- [ ] Wait for Actions to complete
- [ ] Test live site
- [ ] Submit to Google Search Console

After deployment:
- [ ] Test all features
- [ ] Verify SEO meta tags
- [ ] Check social media previews
- [ ] Test offline functionality
- [ ] Monitor analytics

---

## Automatic Updates

Every time you push to `main`:
1. GitHub Actions runs automatically
2. Builds the site
3. Deploys to GitHub Pages
4. Live site updates in ~2 minutes

---

## Summary

✅ **Automated deployment** via GitHub Actions  
✅ **No manual builds** required  
✅ **Free hosting** on GitHub Pages  
✅ **HTTPS enabled** automatically  
✅ **Custom domain** support (optional)  

**Your site will be live at:**
```
https://cptnope.github.io/safety-app-pwa/
```

**Next steps:**
1. Commit and push changes
2. Enable GitHub Pages
3. Wait 2-3 minutes
4. Your SEO-optimized site is live! 🎉
