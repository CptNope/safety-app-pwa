# Privacy Policy

**Last Updated:** November 12, 2025

## Our Commitment to Privacy

The Harm Reduction Guide PWA ("the App") is designed with **privacy as a core principle**. We believe harm reduction information should be accessible without surveillance or data collection.

## TL;DR (Summary)

✅ **We collect ZERO personal data**  
✅ **No tracking or analytics**  
✅ **No user accounts or registration**  
✅ **All data stays on your device**  
✅ **No cookies (except for local storage)**  
✅ **No third-party tracking scripts**  
✅ **Fully functional offline**  
✅ **Open-source and auditable**

---

## 1. Information We Do NOT Collect

We do **NOT collect, store, transmit, or process** any of the following:

### 1.1 Personal Information
- ❌ Names, email addresses, phone numbers
- ❌ IP addresses or device identifiers
- ❌ Location data (GPS or network-based)
- ❌ Demographic information
- ❌ User accounts or authentication credentials

### 1.2 Usage Information
- ❌ Pages viewed or tabs accessed
- ❌ Search queries or substances looked up
- ❌ Time spent in the App
- ❌ Button clicks or interactions
- ❌ Test results or notes
- ❌ Browsing history

### 1.3 Technical Information
- ❌ Browser type or version
- ❌ Operating system
- ❌ Screen resolution or device type
- ❌ Referrer URLs
- ❌ Network information

### 1.4 Third-Party Analytics
- ❌ Google Analytics
- ❌ Facebook Pixel
- ❌ Mixpanel, Amplitude, or similar services
- ❌ Any other tracking or analytics platforms

**We have ZERO analytics. We cannot see who uses the App or how it's used.**

---

## 2. How the App Works (Locally)

### 2.1 Progressive Web App (PWA)

The App is a **static Progressive Web App** that runs entirely in your browser:

1. **First Visit**: Your browser downloads HTML, JavaScript, CSS, and JSON data files
2. **Service Worker**: Caches all files locally for offline use
3. **All Subsequent Use**: Runs entirely from cached files on your device
4. **No Server Calls**: After initial load, no network requests to our servers

### 2.2 Local Storage Only

The App uses browser-native storage mechanisms for functionality:

#### Service Worker Cache
- **Purpose**: Store app files for offline access
- **Data Stored**: HTML, JavaScript, CSS, JSON database, icons
- **Location**: Your device only
- **Shared**: No - stays on your device

#### Local Storage / IndexedDB
- **Purpose**: Store user preferences (e.g., dark mode, last tab viewed)
- **Data Stored**: App settings only (no personal information)
- **Location**: Your device only
- **Shared**: No - stays on your device

### 2.3 You Control Your Data

- ✅ All data is stored locally on YOUR device
- ✅ You can clear all data anytime (browser settings)
- ✅ Uninstalling the PWA removes all local data
- ✅ No data is synced or backed up to our servers

---

## 3. External Links and Third-Party Services

### 3.1 Links to External Sites

The App contains links to third-party resources:

| Service | Purpose | When Accessed |
|---------|---------|---------------|
| **Wikipedia** | Substance pharmacology | When you click "View on Wikipedia" |
| **Erowid** | Experience reports | When you click "View on Erowid" |
| **DrugsData.org** | Lab testing service | When you visit Resources tab |
| **WEDINOS** | UK testing service | When you visit Resources tab |
| **Testing kit vendors** | Purchase reagent kits | When you visit Vendors tab |

### 3.2 No Tracking via Links

- ✅ We do NOT use tracking parameters in external links
- ✅ We do NOT receive referral data from these sites
- ✅ We do NOT know if/when you click external links

### 3.3 Third-Party Privacy Policies

When you click external links, you leave our App and are subject to those sites' privacy policies:

- **Wikipedia**: [wikimediafoundation.org/privacy](https://wikimediafoundation.org/privacy/)
- **Erowid**: Generally privacy-focused, see their site for details
- **Lab testing services**: Review their individual privacy policies

**We are not responsible for third-party privacy practices.**

---

## 4. Content Delivery Networks (CDNs)

### 4.1 First Load Only

On your **first visit**, the App loads libraries from CDNs:

- **React 18** from [unpkg.com](https://unpkg.com) or [cdnjs.com](https://cdnjs.com)
- **Tailwind CSS** from [cdn.tailwindcss.com](https://cdn.tailwindcss.com)
- **Babel Standalone** from CDNs

### 4.2 CDN Privacy

CDN providers may log:
- IP addresses for security and infrastructure purposes
- Request metadata (file requested, timestamp)

**We do not control or receive this data.** CDNs are standard web infrastructure.

### 4.3 After First Load

After the Service Worker caches files, **no CDN requests are made**. The App runs entirely offline from cached files.

---

## 5. Data Security

### 5.1 No Server = No Server Breaches

Since we don't collect or store data on servers:

- ✅ No user database to breach
- ✅ No personal information to leak
- ✅ No passwords to compromise
- ✅ No centralized point of failure

### 5.2 Local Data Security

Data stored on your device is subject to:

- Your device's security (lock screen, encryption)
- Your browser's security model (same-origin policy)
- Your own practices (sharing device, clearing data)

**You are responsible for securing your own device.**

### 5.3 HTTPS

The App should be served over HTTPS when hosted, which provides:

- Encryption of data in transit
- Protection against man-in-the-middle attacks
- Verification that you're accessing the legitimate app

---

## 6. Cookies and Similar Technologies

### 6.1 No Traditional Cookies

We do **NOT use cookies** for:

- ❌ Tracking users across sites
- ❌ Advertising or retargeting
- ❌ Analytics or usage monitoring
- ❌ User identification

### 6.2 Browser Storage APIs

The App uses standard browser storage APIs:

- **Service Worker Cache**: For offline functionality (PWA standard)
- **Local Storage**: For user preferences (dark mode, last tab)
- **IndexedDB**: For modular database loading (performance)

These are **not cookies** and are not shared across sites.

---

## 7. Children's Privacy

### 7.1 No Age Verification

The App does not collect age information or implement age gates.

### 7.2 COPPA Compliance

Since we collect **zero data**, we are compliant with the Children's Online Privacy Protection Act (COPPA).

### 7.3 Parental Guidance

This App contains information about substances and harm reduction. Parental discretion is advised.

---

## 8. International Users

### 8.1 No Geographic Restrictions

The App is accessible worldwide. We do not:

- Track user locations
- Restrict access by country
- Collect geographic data

### 8.2 GDPR Compliance (EU)

Since we collect **no personal data**, we are compliant with the General Data Protection Regulation (GDPR):

- ✅ No data collection = No data processing
- ✅ No user profiles = No right to access needed
- ✅ No data storage = No right to deletion needed
- ✅ No tracking = No cookie consent needed

### 8.3 CCPA Compliance (California)

Since we collect **no personal information**, the California Consumer Privacy Act (CCPA) does not apply. We have:

- ✅ No personal information to disclose
- ✅ No personal information to delete
- ✅ No personal information to sell (we don't sell data anyway)

---

## 9. Changes to This Privacy Policy

### 9.1 Updates

We may update this Privacy Policy if:

- App functionality changes (e.g., adding optional user accounts)
- Legal requirements change
- We want to clarify existing practices

### 9.2 Notification

Changes will be posted to the GitHub repository with an updated "Last Updated" date.

### 9.3 Continued Use

Continued use of the App after changes constitutes acceptance of the updated policy.

---

## 10. Open Source Transparency

### 10.1 Auditable Code

This App is **fully open-source**:

- 📂 Source code: [github.com/CptNope/safety-app-pwa](https://github.com/CptNope/safety-app-pwa)
- 🔍 You can inspect all code
- ✅ Verify no tracking or data collection
- 🤝 Community-audited

### 10.2 Self-Hosting

You can:

- Download the entire repository
- Host it yourself on your own server
- Modify it for your own use
- Run it completely air-gapped (offline)

**Full transparency. Full control.**

---

## 11. Your Rights

Since we collect **no personal data**, traditional data rights don't apply:

| Right | Status |
|-------|--------|
| **Right to Access** | N/A - We have no data about you |
| **Right to Deletion** | N/A - We have no data to delete |
| **Right to Portability** | N/A - We have no data to export |
| **Right to Correction** | N/A - We have no data to correct |
| **Right to Opt-Out** | N/A - Nothing to opt out of |

### 11.1 Clear Local Data

You can clear all local app data anytime:

**Chrome/Edge:**
1. Open DevTools (F12)
2. Go to Application → Storage
3. Click "Clear site data"

**Firefox:**
1. Open Developer Tools
2. Go to Storage tab
3. Clear local storage and cache

**Safari:**
1. Preferences → Privacy
2. Manage Website Data
3. Remove the app's data

---

## 12. Contact Information

This is an open-source project maintained by **Jeremy Anderson** ([@CptNope](https://github.com/CptNope)).

### 12.1 Questions or Concerns

For privacy-related questions:

- 📧 Open an issue on GitHub: [github.com/CptNope/safety-app-pwa/issues](https://github.com/CptNope/safety-app-pwa/issues)
- 📖 Review the source code
- 🔍 Audit the codebase yourself

### 12.2 Security Issues

If you discover a security vulnerability:

- Open a GitHub issue (or email privately if sensitive)
- Describe the issue and potential impact
- We will address it promptly

---

## 13. Summary: Our Privacy Promise

### ✅ What We DO

1. **Provide free, offline-capable harm reduction education**
2. **Use local storage for offline functionality only**
3. **Link to reputable third-party resources**
4. **Maintain open-source code for transparency**
5. **Respect your privacy completely**

### ❌ What We DON'T Do

1. **Collect personal information**
2. **Track your usage or searches**
3. **Use analytics or monitoring tools**
4. **Share data with third parties** (we have none to share)
5. **Require accounts or registration**
6. **Show ads or retarget you**
7. **Know who you are or what you look up**

---

## 14. Why Privacy Matters for Harm Reduction

We understand that:

- 🔒 **Privacy enables safety** - People need to access harm reduction info without fear
- ⚖️ **Stigma is real** - Substance use is heavily stigmatized and sometimes criminalized
- 🏥 **Health comes first** - People shouldn't choose between privacy and safety
- 🌍 **Everyone deserves access** - Harm reduction should be available to all

**That's why we built this app with zero tracking.** Your safety and privacy are paramount.

---

**Last Updated:** November 12, 2025

**Version:** 1.0

**License:** See LICENSE file in repository

---

**Remember: We can't see what you search, what tabs you visit, or how you use this app. It's truly private.** 💙
