# 📰 Adding Real News Articles

## ✅ Database Now Clean!

**All example articles have been removed.** The news database is now empty and ready for real verified articles only.

## 🎉 NEW FEATURES (v74)

### More RSS Feeds Added!
The app now pulls from **11 sources** automatically when Live News Feeds are enabled:
1. **DrugsData.org** - Lab test results
2. **FDA Drug Recalls** - Official recalls  
3. **FDA Safety Alerts** - General safety news
4. **DanceSafe** - Harm reduction community
5. **Erowid** - Research and education
6. **Drug Policy Alliance** - Policy updates
7. **NIDA** - Research from NIH
8. **SAMHSA** - Federal substance abuse agency
9. **MAPS** - Psychedelic research
10. **Filter Magazine** - Harm reduction journalism
11. **Drug Science UK** - UK-based research

### NewsAPI.org Integration (Optional)
- Automatically searches major news outlets for harm reduction topics
- Requires free API key from https://newsapi.org
- Searches for: fentanyl, overdose, contamination, naloxone, harm reduction
- Can be configured in `news-aggregator.js`

### Load More / Pagination
- Initially shows 10 articles
- Click "Load More" to show 10 more at a time
- Click "Show All" to display everything
- Click "Show Less" to collapse back to 10

### Clickable Article Links
- Article titles now link directly to source
- Source names are clickable links
- All links open in new tabs
- Visual indicator (→) shows link is available

## How to Add Real News Articles

### Method 1: Manual Entry (Immediate)

Edit `data/reagents.json` and add real articles:

```json
{
  "date": "2024-11-09",
  "category": "Contamination Alert",
  "priority": "critical",
  "title": "🚨 [Real Article Title]",
  "summary": "[Brief summary from actual source]",
  "details": [
    "[Fact 1 from source]",
    "[Fact 2 from source]",
    "[Fact 3 from source]"
  ],
  "regions": ["USA - Massachusetts"],
  "source": "[Actual Source Name]",
  "source_url": "https://actual-source-url.com/article"
}
```

### Method 2: Live RSS Feeds (Automatic)

Enable Live News Feeds in the app - this pulls real articles from:
- **DrugsData.org** - Lab test results
- **FDA** - Drug recalls and safety alerts
- **DanceSafe** - Harm reduction news
- **Erowid** - Research updates
- **NIDA** - Scientific publications
- **Drug Policy Alliance** - Policy changes

## Real Sources for Boston/Worcester Area

### Official Health Departments
- **Boston Public Health Commission**: https://www.boston.gov/departments/public-health-commission
- **MA Department of Public Health**: https://www.mass.gov/orgs/department-of-public-health
- **Worcester Division of Public Health**: https://www.worcesterma.gov/health

### Harm Reduction Organizations
- **AHOPE Boston**: https://www.ahopeinthecity.org
- **Boston Health Care for the Homeless**: https://www.bhchp.org
- **Mass Harm Reduction Coalition**: Check local chapters

### News Outlets (Verify Stories)
- Boston Globe health reporting
- Worcester Telegram & Gazette
- State public health bulletins
- University health services alerts

## Where to Find Real Alerts

### National Sources
1. **DrugsData.org** - Lab-confirmed test results
   - URL: https://drugsdata.org
   - RSS: https://www.drugsdata.org/rss.xml

2. **FDA Drug Alerts** - Official recalls
   - URL: https://www.fda.gov/safety/recalls
   - RSS: Available on FDA site

3. **DanceSafe** - Harm reduction news
   - URL: https://dancesafe.org
   - RSS: https://dancesafe.org/feed/

### Regional Sources
1. **State Health Departments** - Overdose alerts
2. **Local Harm Reduction Orgs** - Community warnings
3. **University Health Services** - Campus-specific alerts
4. **Needle Exchange Programs** - Street-level intelligence

## Article Template for Real News

```json
{
  "date": "YYYY-MM-DD",
  "category": "Contamination Alert|Policy Update|Service Launch|Research|Community News|Counterfeit Pills",
  "priority": "critical|high|normal",
  "title": "🚨 [Actual headline from source]",
  "summary": "[1-2 sentence summary from original article]",
  "details": [
    "[Key point 1 - quote or paraphrase with attribution]",
    "[Key point 2 - quote or paraphrase with attribution]",
    "[Key point 3 - actionable information]",
    "[Key point 4 - resources or next steps]"
  ],
  "regions": ["USA - Massachusetts", "USA - East Coast"],
  "source": "[Original source name - e.g., Boston Public Health Commission]",
  "source_url": "https://[actual-url-to-original-article]"
}
```

## Verifying News Sources

### ✅ Trusted Sources:
- Government health departments (CDC, FDA, state/local health)
- Established harm reduction organizations (DanceSafe, Erowid, MAPS)
- Academic medical centers (BMC, Mass General, Johns Hopkins)
- Lab testing services (DrugsData, WEDINOS, Energy Control)
- Peer-reviewed journals (JAMA, Lancet, Drug & Alcohol Dependence)

### ❌ Avoid:
- Unverified social media posts
- Rumors without official confirmation
- Sensationalist media without fact-checking
- Anonymous sources without corroboration
- Outdated information (>6 months old for alerts)

## Ethical Guidelines

### DO:
✅ Cite original sources with URLs
✅ Verify information with multiple sources
✅ Update outdated articles
✅ Include actionable harm reduction advice
✅ Respect privacy (no names/identifying info)
✅ Use clear, non-judgmental language

### DON'T:
❌ Share unverified rumors
❌ Create panic with unconfirmed reports
❌ Include identifying information about individuals
❌ Sensationalize or exaggerate
❌ Share outdated contamination alerts
❌ Make medical claims without evidence

## Example: Converting Real Article to Database Entry

### Original Source
**Boston Globe, Nov 9, 2024**
"Boston Public Health Issues Alert on Fentanyl-Laced Cocaine"
https://bostonglobe.com/2024/11/09/health/fentanyl-cocaine-alert

**Article says:**
"Boston Public Health Commission issued an alert Friday after three fatal overdoses this week linked to cocaine contaminated with fentanyl. Officials urge all cocaine users to use fentanyl test strips..."

### Database Entry
```json
{
  "date": "2024-11-09",
  "category": "Contamination Alert",
  "priority": "critical",
  "title": "🚨 Fentanyl-Laced Cocaine Alert - Boston",
  "summary": "Boston Public Health Commission issued alert after three fatal overdoses this week linked to cocaine contaminated with fentanyl.",
  "details": [
    "Three fatal overdoses in Boston this week (Nov 4-8, 2024)",
    "Cocaine samples testing positive for fentanyl via test strips",
    "Officials urge all cocaine users to use fentanyl test strips before use",
    "Free test strips available at Boston syringe exchange sites",
    "Never use alone, always have naloxone available",
    "Source: Boston Globe, Nov 9, 2024"
  ],
  "regions": ["USA - Massachusetts", "USA - East Coast"],
  "source": "Boston Public Health Commission (via Boston Globe)",
  "source_url": "https://bostonglobe.com/2024/11/09/health/fentanyl-cocaine-alert"
}
```

## Updating the Database

1. **Find real article** from trusted source
2. **Verify information** with multiple sources if possible
3. **Convert to JSON** using template above
4. **Add to database** in `data/reagents.json` under `news.articles`
5. **Test display** - check app renders correctly
6. **Commit changes** with descriptive message

## 🔑 Enabling NewsAPI (Optional)

NewsAPI.org provides access to major news outlets and can automatically search for harm reduction news.

### Step 1: Get API Key
1. Go to https://newsapi.org
2. Sign up for free account (up to 100 requests/day)
3. Copy your API key

### Step 2: Enable in Code
Edit `news-aggregator.js`, find the `newsapi` source (around line 125):

```javascript
newsapi: {
  type: 'newsapi',
  name: 'NewsAPI.org',
  category: 'Contamination Alert',
  parser: 'newsapi',
  enabled: true,  // Change from false to true
  apiKey: 'YOUR_API_KEY_HERE',  // Paste your API key
  queries: [
    'fentanyl overdose',
    'drug contamination',
    'harm reduction',
    'naloxone',
    'drug checking'
  ]
}
```

### Step 3: Customize Search Terms
Add more queries to find relevant articles:
```javascript
queries: [
  'fentanyl overdose',
  'drug contamination',
  'harm reduction',
  'naloxone distribution',
  'drug checking service',
  'overdose prevention',
  'safe consumption site',
  'drug testing kit',
  'Boston fentanyl',  // Add local searches
  'Massachusetts overdose'
]
```

### Limits
- Free tier: 100 requests/day
- Searches last 7 days of articles
- 10 results per query
- Refreshes every hour when Live News Feeds are enabled

## Automation Ideas

### Future Enhancements:
1. **RSS Feed Parser** - Auto-import from trusted RSS feeds (✅ already implemented in `news-aggregator.js`)
2. **NewsAPI Integration** - Auto-search major news outlets (✅ already implemented, needs API key)
3. **Admin Interface** - Web form to add/edit articles
4. **Fact-Checking API** - Auto-verify with multiple sources
5. **Expiration Dates** - Auto-archive old contamination alerts
6. **User Submissions** - Community reporting with moderation
7. **Google Alerts Integration** - Email-based monitoring
8. **Regional News APIs** - Local health department feeds

## Legal Considerations

- **Copyright**: Summarize and cite sources, don't copy entire articles
- **Fair Use**: News reporting and public safety are protected
- **Attribution**: Always credit original source with URL
- **Liability**: Clearly mark as educational, not medical advice
- **Updates**: Remove/update articles when situations change

## Questions?

For questions about adding real news:
1. Check this guide
2. Review existing articles in `data/reagents.json`
3. Look at live feed implementation in `news-aggregator.js`
4. Open GitHub issue for clarification

---

**Remember**: The goal is to provide accurate, timely, actionable harm reduction information. When in doubt, cite your sources and encourage users to verify with official channels.
