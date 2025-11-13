# 🏗️ Semantic HTML Implementation Guide

## Current Status
The app uses React components with decent semantic structure (header, nav, main, footer already present).

## Improvements Needed

### **1. Article Tags for Substance Entries**

**Current (in QuickTest):**
```jsx
<div className="rounded-xl...">
  {/* Substance info */}
</div>
```

**Improved:**
```jsx
<article className="rounded-xl..." itemScope itemType="https://schema.org/Drug">
  <header>
    <h1 itemProp="name">{substanceName}</h1>
    <meta itemProp="drugClass" content={s.class}/>
  </header>
  
  <section aria-labelledby="description-heading">
    <h2 id="description-heading" className="sr-only">Description</h2>
    {s.description.overview}
  </section>
  
  <section aria-labelledby="testing-heading">
    <h2 id="testing-heading">Reagent Test Results</h2>
    {/* Test results */}
  </section>
</article>
```

### **2. Heading Hierarchy (H1-H6)**

**Best Practice:**
- ONE H1 per page (main title)
- H2 for major sections
- H3 for subsections
- Never skip levels

**Implementation:**
```jsx
// Main page
<h1>Dose Doctor - Drug Testing Database</h1>

  <h2>Substance Testing</h2>  // Tab section
  
    <h3>MDMA</h3>  // Substance name
    
      <h4>Marquis Reagent</h4>  // Test type
      
      <h4>Safety Information</h4>
```

### **3. Microdata for Rich Snippets**

Add itemProp attributes to existing elements:

```jsx
<article itemScope itemType="https://schema.org/Drug">
  <h2 itemProp="name">MDMA</h2>
  <p itemProp="description">{s.description.overview}</p>
  <span itemProp="drugClass">{s.class}</span>
  
  <div itemProp="warning">
    {s.description.dangers}
  </div>
</article>
```

### **4. Breadcrumb Navigation**

```jsx
<nav aria-label="Breadcrumb" className="text-sm">
  <ol itemScope itemType="https://schema.org/BreadcrumbList">
    <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
      <a itemProp="item" href="/">
        <span itemProp="name">Home</span>
      </a>
      <meta itemProp="position" content="1" />
    </li>
    <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
      <a itemProp="item" href="/#quick">
        <span itemProp="name">Substance Testing</span>
      </a>
      <meta itemProp="position" content="2" />
    </li>
    <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
      <span itemProp="name">{substanceName}</span>
      <meta itemProp="position" content="3" />
    </li>
  </ol>
</nav>
```

### **5. Time Elements for Freshness**

```jsx
<footer>
  <p>
    Last updated: 
    <time dateTime="2025-11-12" itemProp="dateModified">
      November 12, 2025
    </time>
  </p>
</footer>
```

## Priority Changes (Quick Wins)

### **Add to QuickTest Component:**
1. Wrap substance in `<article>` tag
2. Add proper heading hierarchy
3. Add "Last Updated" timestamp

### **Add to Welcome Component:**
1. Use `<h1>` for main title
2. Use `<section>` for each major block
3. Add proper ARIA labels

### **Add to All Components:**
1. Meaningful `<section>` tags
2. Proper heading levels
3. ARIA landmarks where needed

## Implementation Checklist

- [ ] Review all H1 usage (should be ONE per page)
- [ ] Add H2 for major sections
- [ ] Add H3 for subsections
- [ ] Wrap substances in `<article>` tags
- [ ] Add breadcrumbs (at least visual)
- [ ] Add "Last Updated" dates
- [ ] Add microdata (itemProp) where relevant
- [ ] Test with screen reader
- [ ] Validate HTML structure

## SEO Impact

- **+10-15% SEO score** from semantic HTML
- **Better content extraction** by search engines
- **Rich snippets** from microdata
- **Improved accessibility** (bonus SEO factor)

## Resources

- HTML5 Semantic Elements: https://developer.mozilla.org/en-US/docs/Web/HTML/Element
- Schema.org Drug: https://schema.org/Drug
- ARIA Best Practices: https://www.w3.org/WAI/ARIA/apg/
