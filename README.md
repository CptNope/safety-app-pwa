# Harm Reduction Guide (PWA)

A comprehensive, offline-capable Progressive Web App (PWA) for substance testing information and harm reduction education.

## ⚠️ Important Disclaimer

**This app is for educational purposes only.** Reagent tests are presumptive and do NOT provide definitive identification. Always:
- Use multiple reagent tests
- Consider laboratory confirmation when possible
- Never consume unidentified substances
- Follow proper safety protocols and use appropriate PPE
- Reagent tests cannot detect all adulterants or determine purity

## 📋 Overview

This PWA provides quick reference information for identifying substances using colorimetric reagent tests. It includes data on 27+ substances, covering everything from common recreational drugs to rare research chemicals.

### Key Features

- **📱 Installable PWA** - Works offline after installation
- **🧪 Quick Test Lookup** - Select a substance and instantly see expected reagent reactions
- **🎨 Color-Coded Results** - Visual representation of expected color changes
- **⏱️ Timing Windows** - Reaction time frames for each test
- **📚 Comprehensive Database** - 27 substances with detailed testing information
- **🔍 Multiple Tabs**:
  - Quick Test - Substance-specific reagent reactions
  - Swatches - Visual color reference for common reagents
  - ID Guide - Form-specific testing tips (blotter, pills, powders, etc.)
  - Methods - Overview of testing methods and protocols
  - Vendors - Trusted reagent kit suppliers

## 🚀 Getting Started

### Accessing the App

1. **Web Browser**: Open `index.html` in any modern web browser
2. **Local Server** (recommended for testing):
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (with http-server)
   npx http-server -p 8000
   ```
   Then navigate to `http://localhost:8000`

### Installation as PWA

1. Open the app in a compatible browser (Chrome, Edge, Safari, Firefox)
2. Click the "Install App" button when prompted, or
3. Use browser menu: "Install app" or "Add to Home Screen"
4. Launch from your device like any native app
5. Works offline after first load!

## 📖 How to Use

### Quick Test Tab

1. **Select Substance**: Use the dropdown to choose the suspected substance
2. **View Reagent Reactions**: See expected color changes for each reagent test
3. **Check Timing**: Note the observation window (typically 0-60 or 0-120 seconds)
4. **Read Notes**: Important safety and testing information specific to that substance

**Example**: For MDMA
- Marquis: Purple→indigo→black
- Mecke: Dark blue→black
- Mandelin: Very dark
- Simon's: Blue (confirms secondary amine)

### Swatches Tab

Visual color reference chart showing reagent reactions for common substances. Useful for quick comparison during testing.

### ID Guide Tab

Form-specific testing advice:
- **Blotter** - Tips for testing paper tabs (LSD, NBOMes, etc.)
- **Gel Tabs** - Testing gel/windowpane substances
- **Capsules** - Powder sample testing
- **Tablets/Pills** - Multi-point testing recommendations
- **Microdots** - Handling tiny samples

### Methods Tab

Overview of testing methods including:
- UV/Blacklight testing (limitations and uses)
- Test strip protocols (fentanyl, xylazine)
- Safety warnings (taste testing - DON'T DO IT)

### Vendors Tab

Filter by region to find trusted reagent kit suppliers:
- DanceSafe (US)
- PRO Test (EU/International)
- Field kit information for first responders

## 🧬 Substances Covered

### Stimulants
- MDMA, MDA, Methamphetamine, Amphetamine
- Cocaine
- 3-MMC, 4-MMC (Mephedrone)

### Psychedelics
- LSD, Psilocybin, DMT, 5-MeO-DMT, 4-AcO-DMT
- 2C-B, 2C-I, 2C-E
- Mescaline
- DOI, Bromo-DragonFLY
- 25I-NBOMe

### Dissociatives
- Ketamine, PCP, DXM

### Opioids
- Heroin, Fentanyl

### Depressants
- GHB

## 🔬 Reagents Explained

### Marquis
Broad presumptive test - reacts with most substance classes. First test in most protocols.

### Mecke
Excellent contrast for MDMA-like substances. Complements Marquis.

### Mandelin
Particularly useful for amphetamines and distinguishing substance classes.

### Simon's
Differentiates primary vs secondary amines:
- **Blue** = Secondary amine (MDMA)
- **No reaction** = Primary amine (MDA, Methamphetamine, Amphetamine)

### Ehrlich
Critical for indole detection:
- **Purple/Violet** = Indole present (LSD, psilocybin, DMT, tryptamines)
- **No reaction** = NOT an indole (NBOMes, DOx compounds)

**Essential for LSD verification** - distinguishes real LSD from dangerous substitutes like 25I-NBOMe.

### Hofmann
Modified Ehrlich test for indoles. Provides confirmation.

## 🏗️ Technical Details

### Project Structure

```
safety-app-pwa/
├── index.html              # Main HTML entry point
├── app.js                  # React application logic
├── sw.js                   # Service Worker (offline support)
├── manifest.webmanifest    # PWA manifest
├── data/
│   └── reagents.json       # Substance and reagent database
├── assets/
│   └── styles.css          # Custom styles
└── icons/                  # PWA icons
```

### Technologies Used

- **React 18** - UI framework
- **Tailwind CSS** - Styling via CDN
- **Service Worker** - Offline functionality and caching
- **Web App Manifest** - PWA capabilities
- **Babel Standalone** - JSX transformation

### Data Structure

The `reagents.json` file contains:

```json
{
  "reagents": { /* Reagent definitions */ },
  "substances": {
    "SubstanceName": {
      "class": "chemical class",
      "forms": ["powder", "pill"],
      "testing": [
        {
          "reagent": "marquis",
          "color": "#HEX_COLOR",
          "window_s": [0, 60],
          "alt": "human-readable color"
        }
      ],
      "notes": ["Important safety information"],
      "other_methods": { /* Alternative tests */ }
    }
  },
  "id_guide": { /* Form-specific tips */ },
  "methods": { /* Testing method cards */ },
  "vendors": [ /* Supplier information */ ]
}
```

### Service Worker Caching

The app uses a cache-first strategy:
1. Check cache for requested resource
2. Serve from cache if available (instant offline access)
3. Fetch from network if not cached
4. Fallback to index.html for navigation requests

**Version**: Cache version updates automatically trigger new installations.

## 🔄 Updates

### Checking for Updates

Click **"Check for updates"** in the app to fetch the latest version. When an update is ready, click **"Update now"** to reload with the new version.

### Manual Cache Clear

If you need to force a fresh version:
1. Open browser DevTools (F12)
2. Go to Application → Storage
3. Clear site data
4. Reload the page

## 🛠️ Development

### Adding New Substances

Edit `data/reagents.json`:

```json
"NewSubstance": {
  "class": "substance class",
  "forms": ["common forms"],
  "testing": [
    {
      "reagent": "reagent_id",
      "color": "#HEXCODE",
      "window_s": [start, end],
      "alt": "color description"
    }
  ],
  "notes": ["Safety notes"]
}
```

### Adding New Reagents

Add to the `reagents` section:

```json
"reagent_id": {
  "name": "Display Name",
  "notes": "Brief description"
}
```

### Updating Service Worker

When making changes, update the `VERSION` constant in `sw.js`:

```javascript
const VERSION = "v9-YYYYMMDDHHMMSS";
```

This ensures users get the latest version.

## 📱 Browser Support

- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Safari (Desktop & iOS)
- ✅ Firefox (Desktop & Mobile)
- ⚠️ Older browsers may lack PWA install support but app still functions

## 🔒 Privacy & Offline Use

- **No tracking**: Zero analytics or tracking scripts
- **No external dependencies** after first load (except CDN assets)
- **Fully offline** after installation
- **No data collection**: All usage is local to your device

## ⚖️ Legal & Safety

### Educational Purpose Only

This app is designed for:
- ✅ Educational reference
- ✅ Harm reduction information
- ✅ First responder training
- ✅ Understanding reagent testing limitations

### Not a Substitute For

- ❌ Laboratory confirmation
- ❌ Medical advice
- ❌ Legal guidance
- ❌ Definitive substance identification

### Safety Protocols

Always follow proper safety protocols:
1. Wear appropriate PPE (gloves, eye protection)
2. Work in ventilated area
3. Use multiple test methods
4. Never taste or touch unknown substances
5. Have naloxone available when opioids are suspected
6. Contact emergency services if needed

## 🤝 Contributing

### Reporting Issues

If you find errors in reagent data or have suggestions:
1. Check existing data against trusted sources (DanceSafe, Reagent Tests UK, etc.)
2. Provide source references for corrections
3. Include substance name and reagent in question

### Data Sources

Reagent data compiled from:
- DanceSafe educational materials
- Reagent Tests UK database
- Erowid testing resources
- Published harm reduction literature

## 📚 Additional Resources

- **DanceSafe**: https://dancesafe.org
- **Erowid**: https://www.erowid.org
- **Reagent Tests UK**: https://www.reagent-tests.uk
- **Drugs Data**: https://www.drugsdata.org (lab testing service)

## 📄 License

See LICENSE file for details.

---

**Remember**: Test your substances. Use multiple reagents. When in doubt, throw it out. Stay safe. 💙