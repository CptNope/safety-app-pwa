# 📰 Adding Real News Articles

## Important: Current Articles Are Examples

**The news articles currently in the database are FICTIONAL EXAMPLES** meant to demonstrate the news system functionality. They are based on realistic harm reduction scenarios but are not actual published news articles.

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

## Automation Ideas

### Future Enhancements:
1. **RSS Feed Parser** - Auto-import from trusted RSS feeds (already implemented in `news-aggregator.js`)
2. **Admin Interface** - Web form to add/edit articles
3. **Fact-Checking API** - Auto-verify with multiple sources
4. **Expiration Dates** - Auto-archive old contamination alerts
5. **User Submissions** - Community reporting with moderation

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
