# ⚡ Performance Optimization Guide

## Core Web Vitals Targets

### **Current Status:** Good (PWA with service worker)
### **Goal:** Lighthouse score 95+ in all categories

---

## 🎯 Priority Optimizations

### **1. Largest Contentful Paint (LCP)** - Target: < 2.5s
- [ ] Preload hero fonts
- [ ] Inline critical CSS
- [ ] Optimize React bundle size
- [ ] Use CDN for static assets

### **2. First Input Delay (FID)** - Target: < 100ms
- [ ] Code splitting (React.lazy)
- [ ] Defer non-critical JavaScript
- [ ] Remove unused dependencies

### **3. Cumulative Layout Shift (CLS)** - Target: < 0.1
- [ ] Set width/height on ALL images
- [ ] Reserve space for dynamic content
- [ ] Avoid inserting content above existing

---

## 🚀 Quick Wins

### **Defer Non-Critical JS:**
```html
<script defer src="./non-critical.js"></script>
```

### **Preload Critical Resources:**
```html
<link rel="preload" href="./data/reagents.json" as="fetch" crossorigin>
```

### **Test Performance:**
```bash
npm run lighthouse
```

---

## 📊 Monitoring

Use Google Search Console and PageSpeed Insights to track improvements.

**Target Scores:**
- Performance: 95+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+
- PWA: 90+
