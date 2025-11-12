/** @jsx React.createElement */

// Reusable legal page section component
const LegalSection = ({title, children, variant = 'default'}) => {
  const colors = {
    default: 'border-white/10 bg-white/5',
    warn: 'border-amber-400/30 bg-amber-500/10',
    info: 'border-blue-400/30 bg-blue-500/10',
    success: 'border-emerald-400/30 bg-emerald-500/10'
  };
  
  return (
    <div className={`rounded-xl p-4 border ${colors[variant]}`}>
      {title && <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>}
      <div className="text-sm text-white/90 space-y-2">
        {children}
      </div>
    </div>
  );
};

function TermsOfService(){
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="rounded-2xl border-2 border-purple-500/50 bg-purple-500/5 p-6">
        <h2 className="text-2xl font-bold text-purple-200 mb-2">📄 Terms of Service</h2>
        <p className="text-xs text-gray-400">Last Updated: November 12, 2025</p>
      </div>

      <LegalSection title="1. Acceptance of Terms">
        <p>By accessing or using the Harm Reduction Guide PWA ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.</p>
      </LegalSection>

      <LegalSection title="2. Description of Service">
        <p>The Harm Reduction Guide is a <strong>free, open-source, educational Progressive Web Application</strong> designed to provide:</p>
        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
          <li>Substance testing information (reagent reactions, test protocols)</li>
          <li>Harm reduction education and safety information</li>
          <li>Emergency response protocols</li>
          <li>Educational resources on substance identification</li>
          <li>Links to professional testing services and harm reduction organizations</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Educational Purpose Only" variant="warn">
        <p className="font-semibold text-amber-200 mb-2">3.1 Not Medical Advice</p>
        <p>This App is for <strong>educational and informational purposes only</strong>. It is NOT:</p>
        <ul className="list-none space-y-1 ml-2 mt-2">
          <li>❌ Medical advice, diagnosis, or treatment</li>
          <li>❌ A substitute for professional medical consultation</li>
          <li>❌ A substitute for laboratory testing (GC/MS analysis)</li>
          <li>❌ Definitive substance identification</li>
          <li>❌ Legal advice or guidance</li>
        </ul>
        
        <p className="font-semibold text-amber-200 mt-4 mb-2">3.2 Emergency Situations</p>
        <p className="text-amber-100"><strong>In case of emergency, ALWAYS call 911 or your local emergency services immediately.</strong> Do not rely on this App as a substitute for emergency medical care.</p>
        
        <p className="font-semibold text-amber-200 mt-4 mb-2">3.3 Reagent Test Limitations</p>
        <p>Reagent tests are <strong>presumptive tests only</strong> and are NOT definitive. They can produce false positives, false negatives, miss dangerous adulterants, and fail to detect certain substances.</p>
      </LegalSection>

      <LegalSection title="4. No Encouragement of Illegal Activity">
        <p>This App does <strong>NOT encourage, promote, or condone illegal drug use</strong>. The information provided is for:</p>
        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
          <li>Educational reference and academic research</li>
          <li>Harm reduction for individuals who choose to use substances</li>
          <li>First responder and medical professional training</li>
          <li>Understanding the limitations of presumptive testing</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Disclaimer of Warranties">
        <p>THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We make no guarantees about:</p>
        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
          <li>Accuracy, completeness, or timeliness of information</li>
          <li>Availability or uninterrupted access</li>
          <li>Fitness for any particular purpose</li>
        </ul>
        <p className="mt-2">Information may become outdated. New substances and adulterants emerge constantly. Always verify with current sources.</p>
      </LegalSection>

      <LegalSection title="6. Limitation of Liability">
        <p><strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW</strong>, the creators, contributors, and maintainers shall NOT be liable for any damages arising from use of this App, including but not limited to:</p>
        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
          <li>Injury, death, or health consequences</li>
          <li>Legal consequences or criminal prosecution</li>
          <li>Property damage or financial loss</li>
          <li>Reliance on inaccurate or outdated information</li>
        </ul>
      </LegalSection>

      <LegalSection title="7. User Responsibilities">
        <p>By using this App, you agree to:</p>
        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
          <li>Use the information for educational purposes only</li>
          <li>Verify information with professional sources</li>
          <li>Not rely solely on this App for critical decisions</li>
          <li>Comply with all applicable laws in your jurisdiction</li>
          <li>Not redistribute or commercially exploit the content</li>
        </ul>
      </LegalSection>

      <LegalSection title="8. Open Source License">
        <p>This App is open-source software. The codebase is available on GitHub for review, contribution, and auditing. See the LICENSE file in the repository for specific terms.</p>
      </LegalSection>

      <LegalSection title="9. Changes to Terms">
        <p>We reserve the right to modify these Terms at any time. Continued use of the App after changes constitutes acceptance of new terms. Check this page periodically for updates.</p>
      </LegalSection>

      <LegalSection title="10. Governing Law">
        <p>These Terms are governed by the laws applicable to open-source educational resources. Disputes shall be resolved through good-faith discussion and, if necessary, mediation.</p>
      </LegalSection>

      <LegalSection title="11. Contact" variant="info">
        <p>Questions about these Terms? Open an issue on GitHub:</p>
        <a href="https://github.com/CptNope/safety-app-pwa/issues" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline">
          github.com/CptNope/safety-app-pwa/issues
        </a>
      </LegalSection>

      <div className="text-center text-xs text-gray-400 pt-4 border-t border-white/10">
        <p>By using this App, you acknowledge that you have read, understood, and agree to these Terms of Service.</p>
      </div>
    </div>
  );
}

function PrivacyPolicy(){
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="rounded-2xl border-2 border-purple-500/50 bg-purple-500/5 p-6">
        <h2 className="text-2xl font-bold text-purple-200 mb-2">🔒 Privacy Policy</h2>
        <p className="text-xs text-gray-400">Last Updated: November 12, 2025</p>
      </div>

      <LegalSection variant="success">
        <h3 className="text-xl font-bold text-emerald-200 mb-3">TL;DR (Summary)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-emerald-100">
          <div>✅ We collect ZERO personal data</div>
          <div>✅ No tracking or analytics</div>
          <div>✅ No user accounts</div>
          <div>✅ All data stays on your device</div>
          <div>✅ No cookies (except local storage)</div>
          <div>✅ No third-party tracking</div>
          <div>✅ Fully functional offline</div>
          <div>✅ Open-source and auditable</div>
        </div>
      </LegalSection>

      <LegalSection title="1. Information We Do NOT Collect">
        <p className="font-semibold mb-2">We do NOT collect, store, transmit, or process any of the following:</p>
        
        <p className="font-semibold text-white mt-3">1.1 Personal Information</p>
        <ul className="list-none space-y-1 ml-2">
          <li>❌ Names, email addresses, phone numbers</li>
          <li>❌ IP addresses or device identifiers</li>
          <li>❌ Location data (GPS or network-based)</li>
          <li>❌ Demographic information</li>
          <li>❌ User accounts or authentication credentials</li>
        </ul>
        
        <p className="font-semibold text-white mt-3">1.2 Usage Information</p>
        <ul className="list-none space-y-1 ml-2">
          <li>❌ Pages viewed or tabs accessed</li>
          <li>❌ Search queries or substances looked up</li>
          <li>❌ Time spent in the App</li>
          <li>❌ Button clicks or interactions</li>
          <li>❌ Test results or notes</li>
        </ul>
        
        <p className="font-semibold text-white mt-3">1.3 Technical Information</p>
        <ul className="list-none space-y-1 ml-2">
          <li>❌ Browser type or version</li>
          <li>❌ Operating system</li>
          <li>❌ Screen resolution</li>
          <li>❌ Referrer URLs</li>
        </ul>
      </LegalSection>

      <LegalSection title="2. How the App Works (Client-Side Only)">
        <p>This is a <strong>Progressive Web App (PWA)</strong> that runs entirely in your browser:</p>
        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
          <li><strong>No backend servers:</strong> No database, no API, no server-side processing</li>
          <li><strong>Static files only:</strong> HTML, CSS, JavaScript, and JSON data files</li>
          <li><strong>Local storage:</strong> Browser cache stores app files for offline use</li>
          <li><strong>No network requests:</strong> After initial load, works completely offline</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Local Storage (Your Device Only)">
        <p>The App uses browser storage technologies to function:</p>
        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
          <li><strong>Service Worker Cache:</strong> Stores app files for offline functionality</li>
          <li><strong>LocalStorage:</strong> May store user preferences (e.g., last viewed tab)</li>
        </ul>
        <p className="mt-2 text-white"><strong>Important:</strong> This data NEVER leaves your device. It's not transmitted anywhere. You can clear it anytime via browser settings.</p>
      </LegalSection>

      <LegalSection title="4. Third-Party Services">
        <p className="font-semibold mb-2">CDN Resources (Initial Load Only):</p>
        <p>The App loads libraries from CDNs:</p>
        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
          <li>Tailwind CSS (cdn.tailwindcss.com)</li>
          <li>React & ReactDOM (unpkg.com)</li>
          <li>Babel (unpkg.com)</li>
        </ul>
        <p className="mt-2">These CDNs may log basic request data (IP address, user agent) per their own privacy policies. We have no control over or access to this data.</p>
        <p className="mt-2 font-semibold">After installation as a PWA, the App works fully offline without any CDN requests.</p>
      </LegalSection>

      <LegalSection title="5. External Links">
        <p>The App contains links to external resources (harm reduction organizations, testing labs, GitHub). When you click these links, you leave the App and are subject to those sites' privacy policies.</p>
      </LegalSection>

      <LegalSection title="6. No Analytics or Tracking">
        <p>We explicitly DO NOT use:</p>
        <ul className="list-none space-y-1 ml-2 mt-2">
          <li>❌ Google Analytics</li>
          <li>❌ Facebook Pixel</li>
          <li>❌ Hotjar or similar tools</li>
          <li>❌ Advertising networks</li>
          <li>❌ Error tracking services (e.g., Sentry)</li>
          <li>❌ Any form of user tracking or telemetry</li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Your Rights">
        <p>Since we collect no data, there's nothing to:</p>
        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
          <li>Request access to</li>
          <li>Request deletion of</li>
          <li>Request correction of</li>
          <li>Opt out of</li>
        </ul>
        <p className="mt-2">You have complete control. Clear your browser cache/storage to remove all App data from your device.</p>
      </LegalSection>

      <LegalSection title="8. Children's Privacy">
        <p>The App does not target or knowingly collect data from anyone, including children under 13. Since we collect NO data from anyone, COPPA compliance is inherent.</p>
      </LegalSection>

      <LegalSection title="9. International Users">
        <p>The App is accessible worldwide and stores no data. There are no data transfers because there's no data collection.</p>
      </LegalSection>

      <LegalSection title="10. Security">
        <p>Since we don't collect data, there's no centralized data to breach. The App uses HTTPS when served over the web. All data stays on your device, protected by your device's security.</p>
      </LegalSection>

      <LegalSection title="11. Changes to Privacy Policy">
        <p>Any changes will be posted on this page. Since we collect no data, changes are unlikely. Check periodically if concerned.</p>
      </LegalSection>

      <LegalSection title="12. Open Source Transparency" variant="info">
        <p>The entire codebase is open-source and auditable on GitHub. You can verify our privacy claims by reviewing the code:</p>
        <a href="https://github.com/CptNope/safety-app-pwa" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline">
          github.com/CptNope/safety-app-pwa
        </a>
      </LegalSection>

      <div className="text-center text-xs text-gray-400 pt-4 border-t border-white/10">
        <p><strong>Bottom Line:</strong> Your privacy is absolute. We literally cannot spy on you because we collect nothing.</p>
      </div>
    </div>
  );
}

function AccessibilityStatement(){
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="rounded-2xl border-2 border-purple-500/50 bg-purple-500/5 p-6">
        <h2 className="text-2xl font-bold text-purple-200 mb-2">♿ Accessibility Statement</h2>
        <p className="text-xs text-gray-400">WCAG 2.1 Level AA Compliant • Last Updated: November 12, 2025</p>
      </div>

      <LegalSection variant="success">
        <h3 className="text-xl font-bold text-emerald-200 mb-3">Our Commitment</h3>
        <p className="text-emerald-100">The Harm Reduction Guide is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply <strong>WCAG 2.1 Level AA</strong> standards.</p>
      </LegalSection>

      <LegalSection title="Conformance Status">
        <p><strong className="text-emerald-300">This application is fully conformant</strong> with WCAG 2.1 Level AA. Fully conformant means that the content fully conforms to the accessibility standard without any exceptions.</p>
      </LegalSection>

      <LegalSection title="Accessibility Features">
        <div className="space-y-3">
          <div>
            <p className="font-semibold text-white">✅ Keyboard Navigation</p>
            <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
              <li>All interactive elements keyboard accessible</li>
              <li>Tab order follows logical reading order</li>
              <li>Focus indicators clearly visible (2px cyan outline)</li>
              <li>Skip navigation link for main content</li>
            </ul>
          </div>
          
          <div>
            <p className="font-semibold text-white">✅ Screen Reader Support</p>
            <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
              <li>ARIA roles properly implemented (tablist, tab, tabpanel)</li>
              <li>ARIA labels on all icon-only buttons</li>
              <li>Decorative emojis hidden from screen readers</li>
              <li>Live region announces tab changes</li>
              <li>Form labels properly associated</li>
              <li>Semantic HTML throughout</li>
            </ul>
          </div>
          
          <div>
            <p className="font-semibold text-white">✅ Visual Design</p>
            <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
              <li>Color contrast ratios meet 4.5:1 minimum</li>
              <li>Text resizing supports up to 200% zoom</li>
              <li>No color-only information</li>
              <li>High contrast mode support</li>
            </ul>
          </div>
          
          <div>
            <p className="font-semibold text-white">✅ Forms and Controls</p>
            <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
              <li>Proper label association (htmlFor + id)</li>
              <li>Descriptive aria-labels</li>
              <li>Clear error messaging</li>
              <li>Placeholder text provides examples</li>
            </ul>
          </div>
        </div>
      </LegalSection>

      <LegalSection title="Keyboard Shortcuts" variant="info">
        <div className="space-y-2">
          <div className="flex justify-between"><span>Skip to main content:</span><code className="text-blue-300">Tab → Enter</code></div>
          <div className="flex justify-between"><span>Navigate tabs:</span><code className="text-blue-300">Tab / Shift+Tab</code></div>
          <div className="flex justify-between"><span>Activate tab:</span><code className="text-blue-300">Enter or Space</code></div>
          <div className="flex justify-between"><span>Navigate dropdowns:</span><code className="text-blue-300">Arrow keys</code></div>
        </div>
      </LegalSection>

      <LegalSection title="Screen Reader Testing">
        <p>This application has been tested with:</p>
        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
          <li><strong>NVDA</strong> (Windows) - Latest version</li>
          <li><strong>JAWS</strong> (Windows) - JAWS 2024</li>
          <li><strong>VoiceOver</strong> (macOS/iOS) - Latest version</li>
          <li><strong>TalkBack</strong> (Android) - Latest version</li>
        </ul>
      </LegalSection>

      <LegalSection title="Browser Support">
        <p>Supported browsers with assistive technologies:</p>
        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
          <li>Chrome 90+ (Windows, macOS, Android)</li>
          <li>Firefox 88+ (Windows, macOS, Android)</li>
          <li>Safari 14+ (macOS, iOS)</li>
          <li>Edge 90+ (Windows, macOS)</li>
        </ul>
      </LegalSection>

      <LegalSection title="Technical Implementation">
        <p className="mb-2">WCAG 2.1 AA criteria met include:</p>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li><strong>Perceivable:</strong> Text alternatives, color contrast, resizable text</li>
          <li><strong>Operable:</strong> Keyboard accessible, no timing, skip navigation, focus visible</li>
          <li><strong>Understandable:</strong> Readable, predictable, input assistance</li>
          <li><strong>Robust:</strong> Valid HTML, proper ARIA</li>
        </ul>
      </LegalSection>

      <LegalSection title="Known Limitations">
        <ul className="list-disc list-inside ml-4 space-y-2">
          <li><strong>Color swatches:</strong> While text descriptions are provided, actual color perception cannot be conveyed to users with vision impairments. Each reagent includes descriptive text.</li>
          <li><strong>External resources:</strong> Third-party lab reports and resources may not be accessible (outside our control).</li>
        </ul>
      </LegalSection>

      <LegalSection title="Feedback and Contact" variant="info">
        <p>We welcome feedback on accessibility. If you encounter barriers:</p>
        <p className="mt-2"><strong>Report via GitHub:</strong></p>
        <a href="https://github.com/CptNope/safety-app-pwa/issues" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline">
          github.com/CptNope/safety-app-pwa/issues
        </a>
        <p className="mt-3">Tag with label: <code className="text-blue-300">accessibility</code></p>
        <p className="mt-2">We aim to respond within <strong>3 business days</strong>.</p>
      </LegalSection>

      <LegalSection title="Additional Resources">
        <ul className="space-y-2">
          <li>📚 <a href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline">WCAG 2.1 Quick Reference</a></li>
          <li>📚 <a href="https://developer.mozilla.org/en-US/docs/Web/Accessibility" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline">MDN Accessibility Guide</a></li>
          <li>📚 <a href="https://webaim.org/resources/" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline">WebAIM Resources</a></li>
        </ul>
      </LegalSection>

      <div className="text-center text-xs text-gray-400 pt-4 border-t border-white/10">
        <p><strong>Last Reviewed:</strong> November 12, 2025 • <strong>Next Review:</strong> Quarterly</p>
        <p className="mt-2">This application is committed to ongoing accessibility improvements. Thank you for helping us build a more inclusive resource. ♿💙</p>
      </div>
    </div>
  );
}
