# Harm Reduction Guide (PWA)

A comprehensive, offline-capable Progressive Web App (PWA) for substance testing information and harm reduction education.

**Created by Jeremy Anderson** • [Contribute on GitHub](https://github.com/CptNope/safety-app-pwa)

## ⚠️ Important Disclaimer

**This app is for educational purposes only.** Reagent tests are presumptive and do NOT provide definitive identification. Always:
- Use multiple reagent tests
- Consider laboratory confirmation when possible
- Never consume unidentified substances
- Follow proper safety protocols and use appropriate PPE
- Reagent tests cannot detect all adulterants or determine purity

## 📋 Overview

This PWA provides quick reference information for identifying substances using colorimetric reagent tests. It includes data on **55 substances**, covering everything from common recreational drugs to rare research chemicals, plus comprehensive emergency medical information.

### Key Features

- **📱 Installable PWA** - Works offline after installation
- **🧪 Quick Test Lookup** - Select a substance and instantly see expected reagent reactions
- **🎨 Color-Coded Results** - Visual representation of expected color changes
- **⏱️ Timing Windows** - Reaction time frames for each test
- **📚 Comprehensive Database** - 55 substances with detailed testing information
- **🔗 External Resources** - Wikipedia and Erowid links for every substance
- **🔍 Multiple Tabs**:
  - **Quick Test** - Substance-specific reagent reactions with Wikipedia/Erowid links
  - **Swatches** - Visual color reference showing all substances for each reagent
  - **ID Guide** - 10 form types with detailed testing tips (blotter, pills, powders, crystals, liquids, mushrooms, etc.)
  - **Methods** - Comprehensive testing protocols, safety procedures, and best practices
  - **🚨 Emergency** - Hospital treatment protocols, overdose response, and medical information by drug class
  - **Vendors** - Trusted reagent kit suppliers by region

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

### Emergency Tab 🚨

Comprehensive medical emergency information:
- **Immediate Response**: Step-by-step emergency actions before help arrives
- **What to Tell EMS**: Critical information for first responders
- **Hospital Treatments**: Medical protocols by drug class
  - Opioid overdose (naloxone, ventilation, monitoring)
  - Stimulant toxicity (cooling, sedation, cardiac care)
  - Psychedelic crisis (calm environment, talk-down technique)
  - Dissociative toxicity (supportive care, monitoring)
  - GHB overdose (airway protection, short duration)
  - Serotonin syndrome (cooling, benzodiazepines)
- **Legal Protections**: Good Samaritan laws, naloxone access
- **After Treatment**: Recovery recommendations and harm reduction

### Vendors Tab

Filter by region to find trusted reagent kit suppliers:
- DanceSafe (US)
- PRO Test (EU/International)
- Field kit information for first responders

## 🧬 Substances Covered (55 Total)

### Entactogens (3)
- MDMA, MDA, MDEA (MDE/Eve)

### Stimulants (3)
- Cocaine, Methamphetamine, Amphetamine

### Cathinones (9)
- 3-MMC, 4-MMC (Mephedrone), Methylone (bk-MDMA), MDPV, Alpha-PVP (Flakka)
- Ethylone (bk-MDEA), Pentedrone, Butylone (bk-MBDB), NEP

### Psychedelics - Tryptamines (11)
- LSD, DMT, 5-MeO-DMT, Psilocybin, 4-AcO-DMT
- AMT, 5-MeO-AMT, 5-MeO-MiPT (Moxy), 5-MeO-DiPT (Foxy)
- 4-HO-MET (Metocin), 4-HO-MiPT (Miprocin)

### Psychedelics - Phenethylamines (14)
- **2C-x Series (6)**: 2C-B, 2C-E, 2C-I, 2C-P, 2C-D, 2C-T-7
- **DOx Series (4)**: DOI, DOM, DOB, DOC
- **NBOMe Series (4)**: 25I-NBOMe, 25B-NBOMe, 25C-NBOMe, Bromo-DragonFLY
- **Mescaline Family (4)**: Mescaline, Allylescaline, Escaline, Proscaline

### Dissociatives (6)
- Ketamine, PCP, DXM
- 3-MeO-PCP, 3-MeO-PCE, MXE (Methoxetamine)

### Opioids (4)
- Heroin, Fentanyl, Morphine, Oxycodone

### Depressants (1)
- GHB

### Each Substance Entry Includes:
- ✅ Chemical class
- ✅ Common forms (powder, pill, blotter, etc.)
- ✅ 2-4 reagent test reactions with hex colors
- ✅ Timing windows for each reaction
- ✅ Safety notes and harm reduction info
- ✅ Wikipedia link (pharmacology)
- ✅ Erowid link (experience reports)

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

**Contributions are welcome!** Visit [github.com/CptNope/safety-app-pwa](https://github.com/CptNope/safety-app-pwa) to contribute.

### How to Contribute

1. **Fork the repository** on GitHub
2. **Add or correct data** in `data/reagents.json`
3. **Test your changes** locally
4. **Submit a pull request** with your improvements

### What We Need

- ✅ Additional substances with verified reagent reactions
- ✅ Corrections to existing data (with sources)
- ✅ Translations to other languages
- ✅ UI/UX improvements
- ✅ Bug fixes and performance improvements
- ✅ Documentation updates

### Reporting Issues

If you find errors in reagent data or have suggestions:
1. Open an issue on GitHub
2. Check existing data against trusted sources (DanceSafe, Reagent Tests UK, etc.)
3. Provide source references for corrections
4. Include substance name and reagent in question

### Data Sources

Reagent data compiled from:
- DanceSafe educational materials
- Reagent Tests UK database
- Erowid testing resources
- Published harm reduction literature

## 👨‍💻 Author

**Jeremy Anderson** ([@CptNope](https://github.com/CptNope))

This project is maintained and expanded based on community feedback. Thank you to all contributors who help make this resource more comprehensive and accurate.

## 📚 Additional Resources

- **DanceSafe**: https://dancesafe.org
- **Erowid**: https://www.erowid.org
- **Reagent Tests UK**: https://www.reagent-tests.uk
- **Drugs Data**: https://www.drugsdata.org (lab testing service)

## 📄 License

See LICENSE file for details.

---

**Remember**: Test your substances. Use multiple reagents. When in doubt, throw it out. Stay safe. 💙