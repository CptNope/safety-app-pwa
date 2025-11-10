
/** @jsx React.createElement */
const {useState, useEffect, useRef} = React;

function useJSON(url){
  const [data,setData] = useState(null);
  useEffect(()=>{ fetch(url).then(r=>r.json()).then(setData).catch(()=>{}); },[url]);
  return {data};
}

const Banner = ({children, tone="info", actions=null}) => (
  <div className={
    "rounded-xl p-3 text-sm border " + (tone==="warn" ? "bg-amber-100/10 border-amber-300/30 text-amber-200" :
      tone==="success" ? "bg-emerald-100/10 border-emerald-300/30 text-emerald-200" :
      "bg-white/5 border-white/10 text-white")
  }>
    <div className="flex items-center justify-between gap-2">
      <div>{children}</div>
      {actions}
    </div>
  </div>
);

function InstallAndUpdateBar(){
  const [canInstall,setCanInstall] = useState(false);
  const [updateReady,setUpdateReady] = useState(false);
  const [reg,setReg] = useState(null);
  const waitingRef = useRef(null);
  const deferredPromptRef = useRef(null);

  useEffect(()=>{
    // beforeinstallprompt
    const onBIP = (e) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', onBIP);

    // Service worker registration with update hooks
    if ('serviceWorker' in navigator){
      navigator.serviceWorker.register('./sw.js').then(r => {
        setReg(r);
        r.addEventListener('updatefound', () => {
          const nw = r.installing;
          nw.addEventListener('statechange', () => {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              waitingRef.current = r.waiting || nw;
              setUpdateReady(true);
            }
          });
        });
      });
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Reload to load new version
        window.location.reload();
      });
    }

    return ()=>{ window.removeEventListener('beforeinstallprompt', onBIP); };
  },[]);

  const doInstall = async () => {
    const dp = deferredPromptRef.current;
    if (!dp) return;
    dp.prompt();
    await dp.userChoice;
    deferredPromptRef.current = null;
    setCanInstall(false);
  };

  const checkUpdates = async () => {
    try{
      if (reg?.update) await reg.update();
    }catch(e){/* noop */}
  };

  const applyUpdate = () => {
    const w = waitingRef.current || (reg && reg.waiting);
    if (w) { w.postMessage({type:'SKIP_WAITING'}); }
  };

  return (
    <div className="space-y-2">
      {canInstall && <Banner tone="success" actions={<div className="flex gap-2">
        <button onClick={doInstall} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/30 border border-emerald-400/60 text-emerald-100 hover:bg-emerald-500/40 transition">Install App</button>
      </div>}>This app can be installed.</Banner>}

      <Banner actions={<div className="flex flex-wrap gap-2">
        <button onClick={checkUpdates} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/20 border border-white/30 text-white hover:bg-white/25 transition">Check for updates</button>
        {updateReady && <button onClick={applyUpdate} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-sky-500/30 border border-sky-400/60 text-sky-100 hover:bg-sky-500/40 transition">Update now</button>}
      </div>}>
        PWA updates install silently. Click "Check for updates" to fetch a new version. {updateReady ? "New version ready—click Update now." : ""}
      </Banner>
    </div>
  );
}

function Chip({label,color}){
  const isNR = !color || color.toUpperCase()==="#00000000";
  const style = isNR ? {} : { background: color };
  return <span className="reagent-chip" data-nr={isNR?"true":"false"} style={style}>{label}</span>;
}

function QuickTest(){
  const {data} = useJSON('data/reagents.json');
  const [suspect,setSuspect] = useState('MDMA');
  const [search,setSearch] = useState('');
  const [showAllMyths,setShowAllMyths] = useState(false);
  
  // Reset showAllMyths when substance changes
  useEffect(() => {
    setShowAllMyths(false);
  }, [suspect]);
  
  if(!data) return null;
  
  // Filter substances based on search
  const allSubstances = Object.keys(data.substances).sort();
  const filteredSubstances = search 
    ? allSubstances.filter(k => k.toLowerCase().includes(search.toLowerCase()))
    : allSubstances;
  
  const s = data.substances[suspect];
  
  return (
    <div className="rounded-2xl border border-white/10 p-4 bg-white/5 space-y-3">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium">🔍 Search substances:</label>
          <input 
            type="text" 
            placeholder="Type to search (e.g., MDMA, LSD, Cocaine)..." 
            value={search} 
            onChange={e=>setSearch(e.target.value)}
            className="flex-1 min-w-[250px] bg-black/40 text-white rounded-lg px-3 py-2 border border-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500/50 placeholder:text-gray-500"
          />
          {search && (
            <button onClick={()=>setSearch('')} className="px-3 py-2 text-xs rounded-lg bg-white/10 border border-white/20 hover:bg-white/15 transition">
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium">Selected substance:</label>
          <select value={suspect} onChange={e=>setSuspect(e.target.value)} className="bg-black/40 text-white rounded-lg px-3 py-2 border border-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500/50">
            {filteredSubstances.map(k=><option key={k} value={k} className="bg-slate-800">{k}</option>)}
          </select>
          <span className="text-xs opacity-60">({filteredSubstances.length} of {allSubstances.length} substances)</span>
        </div>
      </div>
      
      {s.description && (
        <div className="rounded-xl p-4 bg-gradient-to-br from-slate-500/10 to-slate-600/10 border border-slate-400/30 space-y-3">
          <div className="flex items-center gap-2">
            <div className="text-lg font-bold text-slate-100">{suspect}</div>
            {s.class && <div className="text-xs px-2 py-1 rounded bg-slate-500/30 border border-slate-400/40 text-slate-200">{s.class}</div>}
          </div>
          
          {s.description.overview && (
            <div>
              <div className="text-sm font-semibold text-slate-200 mb-1">📋 Overview</div>
              <div className="text-sm text-slate-100 leading-relaxed">{s.description.overview}</div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {s.description.origins && (
              <div>
                <div className="text-sm font-semibold text-blue-200 mb-1">🧪 Origins & History</div>
                <div className="text-sm text-blue-100 leading-relaxed">{s.description.origins}</div>
              </div>
            )}
            
            {s.description.uses && (
              <div>
                <div className="text-sm font-semibold text-emerald-200 mb-1">💊 Uses</div>
                <div className="text-sm text-emerald-100 leading-relaxed">{s.description.uses}</div>
              </div>
            )}
          </div>
          
          {s.description.dangers && (
            <div className="rounded-lg p-3 bg-red-500/10 border border-red-400/30">
              <div className="text-sm font-semibold text-red-200 mb-1 flex items-center gap-1">
                ⚠️ Dangers & Risks
              </div>
              <div className="text-sm text-red-100 leading-relaxed">{s.description.dangers}</div>
            </div>
          )}
          
          {s.description.links && (
            <div className="rounded-lg p-3 bg-blue-500/10 border border-blue-400/30">
              <div className="text-sm font-semibold text-blue-200 mb-2">🔗 Resources & Information</div>
              <div className="flex flex-wrap gap-2">
                {s.description.links.wikipedia && (
                  <a href={s.description.links.wikipedia} target="_blank" rel="noopener noreferrer" 
                     className="text-xs px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-100 hover:bg-blue-500/30 transition-colors">
                    Wikipedia
                  </a>
                )}
                {s.description.links.erowid && (
                  <a href={s.description.links.erowid} target="_blank" rel="noopener noreferrer"
                     className="text-xs px-3 py-1.5 rounded-full bg-green-500/20 border border-green-400/40 text-green-100 hover:bg-green-500/30 transition-colors">
                    Erowid
                  </a>
                )}
                {s.description.links.psychonautwiki && (
                  <a href={s.description.links.psychonautwiki} target="_blank" rel="noopener noreferrer"
                     className="text-xs px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-100 hover:bg-purple-500/30 transition-colors">
                    PsychonautWiki
                  </a>
                )}
              </div>
            </div>
          )}
          
          {s.description.scientific_papers && s.description.scientific_papers.length > 0 && (
            <div className="rounded-lg p-3 bg-amber-500/10 border border-amber-400/30">
              <div className="text-sm font-semibold text-amber-200 mb-2">📚 Scientific Research</div>
              <div className="space-y-2">
                {s.description.scientific_papers.map((paper, idx) => (
                  <div key={idx} className="text-xs bg-black/20 rounded p-2 border border-white/5">
                    <div className="font-semibold text-amber-100 mb-0.5">{paper.title}</div>
                    <div className="text-slate-300 mb-0.5">{paper.authors} ({paper.year})</div>
                    <div className="text-slate-400 italic mb-1">{paper.journal}</div>
                    {paper.doi && (
                      <div className="text-blue-300 mb-1">
                        <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer" 
                           className="hover:underline">
                          DOI: {paper.doi}
                        </a>
                      </div>
                    )}
                    <div className="text-slate-200">{paper.summary}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {s.testing.map((t,i)=>(
          <div key={i} className="rounded-xl p-3 bg-black/20 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">{data.reagents[t.reagent].name}</div>
                <div className="text-xs opacity-70">Observe within {t.window_s[0]}–{t.window_s[1]}s</div>
              </div>
              <Chip label={t.alt} color={t.color}/>
            </div>
          </div>
        ))}
      </div>
      
      {data.vendors && (()=>{
        // Get reagents needed for this substance
        const neededReagents = s.testing.map(t => data.reagents[t.reagent].name);
        
        // Filter and enhance vendors with matching reagent info
        const relevantVendors = data.vendors
          .filter(v => 
            (v.category === 'harm_reduction' || v.category === 'professional_and_consumer') &&
            v.reagents && v.reagents.some(r => neededReagents.includes(r))
          )
          .map(v => {
            // Find which reagents this vendor has that we need
            const matchingReagents = v.reagents.filter(r => neededReagents.includes(r));
            return {...v, matchingReagents, matchCount: matchingReagents.length};
          })
          .sort((a, b) => b.matchCount - a.matchCount) // Sort by most matching reagents first
          .slice(0, 6); // Show max 6 vendors
        
        if(relevantVendors.length > 0) {
          const allReagentsMatch = relevantVendors.some(v => v.matchCount === neededReagents.length);
          
          return (
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-emerald-200 flex items-center gap-2">
                  🛒 Where to Buy Test Kits
                  <span className="text-xs font-normal opacity-70">({relevantVendors.length} vendor{relevantVendors.length > 1 ? 's' : ''})</span>
                </div>
                <button onClick={()=>{ const vendorsTab = document.querySelector('[data-tab="vendors"]'); if(vendorsTab) vendorsTab.click(); }} className="text-xs text-sky-300 hover:text-sky-200 underline">
                  View All Vendors
                </button>
              </div>
              <div className="text-xs text-gray-400 mb-2">
                {suspect} requires: <span className="font-semibold text-emerald-300">{neededReagents.join(', ')}</span>
                {allReagentsMatch && <span className="text-emerald-300"> (vendors below have all needed reagents)</span>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {relevantVendors.map(v => (
                  <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer" className="block rounded-lg border border-white/10 p-3 bg-white/5 hover:bg-white/10 transition">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">{v.name}</div>
                          <div className="text-xs opacity-70 truncate">{v.regions.join(', ')}</div>
                        </div>
                        <span className="text-xs text-sky-300">→</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {v.matchingReagents.map((reagent, i) => (
                          <span key={i} className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 font-medium">
                            {reagent}
                          </span>
                        ))}
                        {v.matchCount < neededReagents.length && (
                          <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-500/20 border border-amber-400/40 text-amber-200">
                            +{neededReagents.length - v.matchCount} more needed
                          </span>
                        )}
                      </div>
                      {v.price_range && <div className="text-xs text-emerald-300">{v.price_range}</div>}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          );
        }
        return null;
      })()}
      
      {s.other_methods && (
        <div className="text-sm">
          <div className="font-semibold mb-1">Other method notes</div>
          <ul className="list-disc ms-5 space-y-1">
            {Object.entries(s.other_methods).map(([k,v])=> <li key={k}><strong>{k.replace('_',' ')}</strong>: {v.summary} <em className="opacity-70">[{v.confidence}]</em></li>)}
          </ul>
        </div>
      )}
      {s.forms && s.forms.length > 0 && data.id_guide && (()=>{
        const sections = [];
        
        // Check for counterfeit pill warning (opioids, benzos in tablet/pill form)
        const isPillForm = s.forms.some(f => f.toLowerCase().includes('tablet') || f.toLowerCase().includes('pill'));
        const isOpioidOrBenzo = s.class && (s.class.toLowerCase().includes('opioid') || s.class.toLowerCase().includes('benzo'));
        if(isPillForm && isOpioidOrBenzo && data.id_guide.counterfeit_rx_pills) {
          sections.push({type: 'counterfeit', data: data.id_guide.counterfeit_rx_pills});
        }
        
        // Check for cutting agents
        const substanceLower = suspect.toLowerCase();
        const cuttingAgents = data.id_guide.common_cutting_agents;
        if(cuttingAgents) {
          let cutsField = null;
          if(substanceLower.includes('cocaine')) cutsField = 'cocaine_cuts';
          else if(substanceLower.includes('mdma')) cutsField = 'mdma_cuts';
          else if(substanceLower.includes('heroin')) cutsField = 'heroin_cuts';
          else if(substanceLower.includes('meth')) cutsField = 'meth_cuts';
          else if(substanceLower.includes('ketamine')) cutsField = 'ketamine_cuts';
          
          if(cutsField && cuttingAgents[cutsField]) {
            sections.push({type: 'cutting', field: cutsField, data: cuttingAgents});
          }
        }
        
        // Check for crystal characteristics
        const isCrystalForm = s.forms.some(f => f.toLowerCase().includes('crystal'));
        const crystalChars = data.id_guide.crystal_characteristics;
        if(isCrystalForm && crystalChars) {
          let crystalField = null;
          if(substanceLower.includes('mdma')) crystalField = 'mdma_crystal';
          else if(substanceLower.includes('meth')) crystalField = 'meth_crystal';
          else if(substanceLower.includes('dmt')) crystalField = 'dmt_crystal';
          
          if(crystalField && crystalChars[crystalField]) {
            sections.push({type: 'crystal', field: crystalField, data: crystalChars});
          }
        }
        
        // Get ID Guide sections for this substance's forms
        const relevantGuides = s.forms
          .map(form => {
            const formKey = form.toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, '');
            const guideKeys = {
              'blotter': 'blotter',
              'gel_tab': 'gel_tab',
              'capsule': 'capsule',
              'powder': 'powder',
              'tablet': 'tablet',
              'pressed_pill': 'tablet',
              'crystal': 'crystal',
              'microdot': 'microdot',
              'liquid': 'liquid',
              'mushroom': 'mushroom',
              'rock': 'rock_chunk',
              'crack': 'rock_chunk',
              'tar': 'rock_chunk'
            };
            const key = guideKeys[formKey] || formKey;
            return data.id_guide[key] ? {form, guide: data.id_guide[key]} : null;
          })
          .filter(Boolean);
        
        if(sections.length > 0 || relevantGuides.length > 0) {
          return (
            <div className="pt-3 border-t border-white/10">
              <details open className="space-y-3">
                <summary className="font-semibold text-sky-200 flex items-center gap-2 cursor-pointer hover:text-sky-100 transition">
                  🔍 Identification Guide
                  <span className="text-xs font-normal opacity-70">({suspect} specific information)</span>
                </summary>
                <div className="space-y-3 mt-3">
                  {/* Counterfeit Pills Warning */}
                  {sections.filter(s => s.type === 'counterfeit').map((section, idx) => (
                    <div key={`cf-${idx}`} className="rounded-xl p-3 bg-red-500/10 border border-red-400/30">
                      <div className="font-semibold text-red-200 mb-2">🚨 {section.data.name}</div>
                  {section.data.reality_check && (
                    <div className="mb-2">
                      <div className="text-xs font-semibold text-red-300 mb-1">⚠️ Critical Warning:</div>
                      <ul className="list-disc ms-5 text-sm space-y-0.5 text-red-100">
                        {section.data.reality_check.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                  {section.data.visual_tells && (
                    <div className="mb-2">
                      <div className="text-xs font-semibold text-amber-300 mb-1">Visual Identification:</div>
                      <ul className="list-disc ms-5 text-sm space-y-0.5 text-amber-100">
                        {section.data.visual_tells.slice(0, 4).map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                  {section.data.testing && (
                    <div>
                      <div className="text-xs font-semibold text-sky-300 mb-1">Testing:</div>
                      <ul className="list-disc ms-5 text-sm space-y-0.5 text-sky-100">
                        {section.data.testing.slice(0, 3).map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Cutting Agents */}
              {sections.filter(s => s.type === 'cutting').map((section, idx) => (
                <div key={`cut-${idx}`} className="rounded-xl p-3 bg-orange-500/10 border border-orange-400/30">
                  <div className="font-semibold text-orange-200 mb-2">⚗️ Common Cutting Agents</div>
                  <ul className="list-disc ms-5 text-sm space-y-0.5 text-orange-100">
                    {section.data[section.field].map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              ))}
              
              {/* Crystal Characteristics */}
              {sections.filter(s => s.type === 'crystal').map((section, idx) => (
                <div key={`crys-${idx}`} className="rounded-xl p-3 bg-purple-500/10 border border-purple-400/30">
                  <div className="font-semibold text-purple-200 mb-2">💎 Crystal Characteristics</div>
                  <ul className="list-disc ms-5 text-sm space-y-0.5 text-purple-100">
                    {section.data[section.field].map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              ))}
              
              {/* Form-specific guides */}
              {relevantGuides.map(({form, guide}, idx) => (
                <div key={idx} className="rounded-xl p-3 bg-sky-500/10 border border-sky-400/30">
                  <div className="font-semibold text-sky-200 mb-2">{guide.name}</div>
                  {guide.tips && (
                    <div className="mb-2">
                      <div className="text-xs font-semibold text-sky-300 mb-1">Testing Tips:</div>
                      <ul className="list-disc ms-5 text-sm space-y-0.5 text-sky-100">
                        {guide.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                      </ul>
                    </div>
                  )}
                  {guide.safety && (
                    <div className="mb-2">
                      <div className="text-xs font-semibold text-amber-300 mb-1">⚠️ Safety:</div>
                      <ul className="list-disc ms-5 text-sm space-y-0.5 text-amber-100">
                        {guide.safety.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                  {guide.uv_hacks && (
                    <div>
                      <div className="text-xs font-semibold text-purple-300 mb-1">UV Light Notes:</div>
                      <ul className="list-disc ms-5 text-sm space-y-0.5 text-purple-100">
                        {guide.uv_hacks.map((uv, i) => <li key={i}>{uv}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
                </div>
              </details>
            </div>
          );
        }
        return null;
      })()}
      
      {data.methods && data.methods.cards && (()=>{
        const relevantMethods = [];
        
        // Always show these essential methods
        const essentialIds = ['reagent_testing_basics', 'sample_collection', 'interpreting_results'];
        essentialIds.forEach(id => {
          const method = data.methods.cards.find(m => m.id === id);
          if(method) relevantMethods.push(method);
        });
        
        // Add fentanyl strips for opioids, stimulants, or if other_methods mentions it
        const needsFentanyl = s.class && (
          s.class.toLowerCase().includes('opioid') ||
          s.class.toLowerCase().includes('stimulant') ||
          s.class.toLowerCase().includes('phenethylamine') ||
          (s.forms && s.forms.some(f => f.toLowerCase().includes('pill') || f.toLowerCase().includes('tablet'))) ||
          (s.other_methods && s.other_methods.fentanyl_strips)
        );
        if(needsFentanyl) {
          const fentanylMethod = data.methods.cards.find(m => m.id === 'fentanyl_strips');
          if(fentanylMethod) relevantMethods.push(fentanylMethod);
        }
        
        // Add xylazine strips for opioids
        if(s.class && s.class.toLowerCase().includes('opioid')) {
          const xylazineMethod = data.methods.cards.find(m => m.id === 'xylazine_strips');
          if(xylazineMethod) relevantMethods.push(xylazineMethod);
        }
        
        // Add UV light method for blotter substances
        if(s.forms && s.forms.some(f => f.toLowerCase().includes('blotter'))) {
          const uvMethod = data.methods.cards.find(m => m.id === 'uv_light');
          if(uvMethod) relevantMethods.push(uvMethod);
        }
        
        // Add cocaine-specific tests
        const substanceLower = suspect.toLowerCase();
        if(substanceLower.includes('cocaine') || substanceLower.includes('crack')) {
          const bleachTest = data.methods.cards.find(m => m.id === 'bleach_test');
          if(bleachTest) relevantMethods.push(bleachTest);
          const morrisTest = data.methods.cards.find(m => m.id === 'morris_reagent');
          if(morrisTest) relevantMethods.push(morrisTest);
        }
        
        // Add pill ID databases for pills/tablets
        if(s.forms && s.forms.some(f => f.toLowerCase().includes('pill') || f.toLowerCase().includes('tablet'))) {
          const pillDb = data.methods.cards.find(m => m.id === 'pill_id_databases');
          if(pillDb) relevantMethods.push(pillDb);
        }
        
        // Add physical observation for crystals/powders/rocks
        if(s.forms && s.forms.some(f => {
          const form = f.toLowerCase();
          return form.includes('crystal') || form.includes('powder') || form.includes('rock') || form.includes('chunk');
        })) {
          const physObs = data.methods.cards.find(m => m.id === 'physical_observation');
          if(physObs) relevantMethods.push(physObs);
        }
        
        // Always add these important methods at the end
        const alwaysShowIds = [
          'reagent_storage',
          'cross_contamination',
          'marquis_limitations',
          'documentation',
          'lab_testing',
          'taste'
        ];
        alwaysShowIds.forEach(id => {
          const method = data.methods.cards.find(m => m.id === id);
          if(method && !relevantMethods.find(rm => rm.id === id)) {
            relevantMethods.push(method);
          }
        });
        
        if(relevantMethods.length > 0) {
          return (
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="font-semibold text-blue-200 flex items-center gap-2">
                🔬 Testing Methods & Best Practices
                <span className="text-xs font-normal opacity-70">({relevantMethods.length} method{relevantMethods.length > 1 ? 's' : ''})</span>
              </div>
              <div className="space-y-2">
                {relevantMethods.map((method, idx) => {
                  const typeColors = {
                    'essential': 'bg-blue-500/10 border-blue-400/30',
                    'critical': 'bg-red-500/10 border-red-400/30',
                    'screening': 'bg-purple-500/10 border-purple-400/30',
                    'auxiliary': 'bg-slate-500/10 border-slate-400/30',
                    'do-not': 'bg-red-500/10 border-red-400/30',
                    'safety': 'bg-amber-500/10 border-amber-400/30',
                    'clandestine': 'bg-indigo-500/10 border-indigo-400/30',
                    'advanced_reagent': 'bg-cyan-500/10 border-cyan-400/30',
                    'confirmation': 'bg-emerald-500/10 border-emerald-400/30'
                  };
                  const typeColor = typeColors[method.type] || 'bg-blue-500/10 border-blue-400/30';
                  const headerColors = {
                    'critical': 'text-red-200',
                    'do-not': 'text-red-300',
                    'safety': 'text-amber-200',
                    'clandestine': 'text-indigo-200',
                    'advanced_reagent': 'text-cyan-200',
                    'confirmation': 'text-emerald-200'
                  };
                  const headerColor = headerColors[method.type] || 'text-blue-200';
                  
                  return (
                    <details key={idx} className={`rounded-xl p-3 border ${typeColor}`}>
                      <summary className={`font-semibold ${headerColor} cursor-pointer hover:opacity-80 transition`}>
                        {method.name}
                        {method.type === 'critical' && <span className="ml-2 text-xs bg-red-500/30 px-2 py-0.5 rounded uppercase">CRITICAL</span>}
                        {method.type === 'essential' && <span className="ml-2 text-xs bg-blue-500/30 px-2 py-0.5 rounded uppercase">ESSENTIAL</span>}
                        {method.type === 'do-not' && <span className="ml-2 text-xs bg-red-500/30 px-2 py-0.5 rounded uppercase">⚠️ NEVER DO</span>}
                        {method.type === 'confirmation' && <span className="ml-2 text-xs bg-emerald-500/30 px-2 py-0.5 rounded uppercase">Gold Standard</span>}
                        {method.type === 'safety' && <span className="ml-2 text-xs bg-amber-500/30 px-2 py-0.5 rounded uppercase">Safety</span>}
                        {method.type === 'clandestine' && <span className="ml-2 text-xs bg-indigo-500/30 px-2 py-0.5 rounded uppercase">Advanced</span>}
                      </summary>
                      <div className="mt-2 space-y-2 text-sm">
                        {method.do && (
                          <div>
                            <div className="text-xs font-semibold text-emerald-300 mb-1">✓ Do:</div>
                            <ul className="list-disc ms-5 space-y-0.5 text-emerald-100">
                              {method.do.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                          </div>
                        )}
                        {method.dont && (
                          <div>
                            <div className="text-xs font-semibold text-red-300 mb-1">✗ Don't:</div>
                            <ul className="list-disc ms-5 space-y-0.5 text-red-100">
                              {method.dont.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                          </div>
                        )}
                        {method.notes && (
                          <div>
                            <div className="text-xs font-semibold text-amber-300 mb-1">ℹ️ Notes:</div>
                            <ul className="list-disc ms-5 space-y-0.5 text-amber-100">
                              {method.notes.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                          </div>
                        )}
                        {method.services && (
                          <div>
                            <div className="text-xs font-semibold text-sky-300 mb-1">🌐 Available Services:</div>
                            <ul className="list-disc ms-5 space-y-0.5 text-sky-100">
                              {method.services.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    </details>
                  );
                })}
              </div>
              {s.other_methods && (
                <div className="rounded-xl p-3 bg-indigo-500/10 border border-indigo-400/30 mt-2">
                  <div className="font-semibold text-indigo-200 mb-2">Additional Methods for {suspect}</div>
                  <div className="space-y-1 text-sm">
                    {Object.entries(s.other_methods).map(([methodKey, methodData]) => (
                      <div key={methodKey} className="text-indigo-100">
                        <span className="font-semibold capitalize">{methodKey.replace(/_/g, ' ')}:</span> {methodData.summary}
                        <span className="text-xs opacity-70 ml-1">[Confidence: {methodData.confidence}]</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }
        return null;
      })()}
      
      {s.notes && s.notes.length > 0 && (
        <div className="pt-3 border-t border-white/10 rounded-xl p-3 bg-amber-500/10 border border-amber-400/30">
          <div className="font-semibold text-amber-200 mb-2 flex items-center gap-2">
            ⚠️ Safety & Harm Reduction Notes
          </div>
          <ul className="list-disc ms-5 text-sm space-y-1 text-amber-100">
            {s.notes.map((note, i) => <li key={i}>{note}</li>)}
          </ul>
        </div>
      )}
      
      {data.medical_treatment && (()=>{
        // Map substance to appropriate emergency treatment category
        const substanceLower = suspect.toLowerCase();
        const classLower = (s.class || '').toLowerCase();
        let treatmentKey = null;
        
        // Determine which emergency treatment applies
        if(classLower.includes('opioid') || substanceLower.includes('heroin') || substanceLower.includes('fentanyl') || 
           substanceLower.includes('morphine') || substanceLower.includes('oxycodone') || substanceLower.includes('codeine') ||
           substanceLower.includes('kratom')) {
          treatmentKey = 'opioid_overdose';
        } else if(classLower.includes('benzodiazepine') || classLower.includes('thienodiazepine') || classLower.includes('gaba') ||
                  substanceLower.includes('phenibut') || substanceLower.includes('alprazolam') || substanceLower.includes('xanax') ||
                  substanceLower.includes('clonazepam') || substanceLower.includes('klonopin') || substanceLower.includes('diazepam') ||
                  substanceLower.includes('valium') || substanceLower.includes('etizolam') || substanceLower.includes('flualprazolam')) {
          treatmentKey = 'benzodiazepine_overdose';
        } else if(classLower.includes('phenethylamine') || classLower.includes('stimulant') || classLower.includes('cathinone') ||
                  classLower.includes('benzofuran') || classLower.includes('entactogen') ||
                  substanceLower.includes('mdma') || substanceLower.includes('cocaine') || substanceLower.includes('meth') ||
                  substanceLower.includes('amphetamine') || substanceLower.includes('cathinone') || substanceLower.includes('6-apb') ||
                  substanceLower.includes('5-apb') || substanceLower.includes('methylphenidate')) {
          treatmentKey = 'stimulant_overdose';
        } else if(classLower.includes('psychedelic') || classLower.includes('tryptamine') || classLower.includes('lysergamide') ||
                  substanceLower.includes('lsd') || substanceLower.includes('psilocybin') || substanceLower.includes('dmt') ||
                  substanceLower.includes('nbome') || substanceLower.includes('2c-') || substanceLower.includes('do') ||
                  substanceLower.includes('mescaline')) {
          treatmentKey = 'psychedelic_crisis';
        } else if(classLower.includes('dissociative') || substanceLower.includes('ketamine') || substanceLower.includes('pcp') ||
                  substanceLower.includes('dxm') || substanceLower.includes('mxe')) {
          treatmentKey = 'dissociative_toxicity';
        } else if(substanceLower.includes('ghb') || substanceLower.includes('gbl')) {
          treatmentKey = 'ghb_overdose';
        }
        
        // Show serotonin syndrome warning for MDMA
        const showSerotoninWarning = substanceLower.includes('mdma') || substanceLower.includes('molly');
        
        if(!treatmentKey && !showSerotoninWarning) return null;
        
        const mt = data.medical_treatment;
        const treatment = treatmentKey ? mt.hospital_treatments[treatmentKey] : null;
        
        return (
          <div className="pt-3 border-t-2 border-red-500/50 space-y-3">
            {/* Emergency Response - Always visible */}
            {mt.emergency_response && (
              <div className="rounded-xl p-4 bg-red-500/10 border-2 border-red-400/50">
                <div className="font-bold text-red-200 mb-2 text-lg flex items-center gap-2">
                  🚨 MEDICAL EMERGENCY RESPONSE
                </div>
                <div className="text-xs text-red-100 mb-3 font-semibold">
                  ⚠️ CALL 911 IMMEDIATELY if experiencing severe symptoms. Good Samaritan laws protect you in 47 states + DC.
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="font-semibold text-red-200">Immediate Actions:</div>
                    <ul className="list-disc ms-5 space-y-0.5 text-red-100">
                      {mt.emergency_response.steps.slice(0,4).map((s,i)=><li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="font-semibold text-emerald-200">What to Tell EMS:</div>
                    <ul className="list-disc ms-5 space-y-0.5 text-emerald-100">
                      {mt.emergency_response.what_to_tell_ems.slice(0,3).map((s,i)=><li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="font-semibold text-orange-200">DO NOT:</div>
                    <ul className="list-disc ms-5 space-y-0.5 text-orange-100">
                      {mt.emergency_response.do_not.slice(0,3).map((s,i)=><li key={i}>{s}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {/* Substance-Specific Hospital Treatment - Always visible */}
            {treatment && (
              <div className="rounded-xl p-4 bg-rose-500/10 border-2 border-rose-400/50 space-y-3">
                <div className="font-bold text-rose-200 text-lg">{treatment.name}</div>
                
                {treatment.signs && (
                  <div>
                    <div className="font-semibold text-red-200 flex items-center gap-1">⚠️ Emergency Signs:</div>
                    <ul className="list-disc ms-5 text-sm space-y-0.5 text-red-100 mt-1">
                      {treatment.signs.map((s,i)=><li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                
                {treatment.prehospital && (
                  <div>
                    <div className="font-semibold text-amber-200">Before Hospital Arrival:</div>
                    <ul className="list-disc ms-5 text-sm space-y-0.5 text-amber-100 mt-1">
                      {treatment.prehospital.map((s,i)=><li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                
                {treatment.hospital && (
                  <div>
                    <div className="font-semibold text-sky-200">Hospital Treatment:</div>
                    <ul className="list-disc ms-5 text-sm space-y-0.5 text-sky-100 mt-1">
                      {treatment.hospital.map((s,i)=><li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                
                {treatment.notes && (
                  <div className="rounded-lg p-2 bg-sky-500/10 border border-sky-400/30">
                    <div className="font-semibold text-sky-200 text-sm">Critical Notes:</div>
                    <ul className="list-disc ms-5 text-sm space-y-0.5 text-sky-100 mt-1">
                      {treatment.notes.map((s,i)=><li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {/* Serotonin Syndrome Warning for MDMA - Always visible */}
            {showSerotoninWarning && mt.hospital_treatments?.serotonin_syndrome && (
              <div className="rounded-xl p-4 bg-purple-500/10 border-2 border-purple-400/50 space-y-2">
                <div className="font-bold text-purple-200 flex items-center gap-2">
                  ⚠️ Serotonin Syndrome Risk (MDMA + Antidepressants)
                </div>
                <div className="text-xs text-purple-100 font-semibold">
                  NEVER combine MDMA with SSRIs, SNRIs, or MAOIs - can be life-threatening!
                </div>
                {mt.hospital_treatments.serotonin_syndrome.signs && (
                  <div>
                    <div className="font-semibold text-red-200 text-sm">Warning Signs:</div>
                    <ul className="list-disc ms-5 text-sm space-y-0.5 text-red-100">
                      {mt.hospital_treatments.serotonin_syndrome.signs.map((s,i)=><li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}
      
      {data.myths_and_misinformation && (()=>{
        // Find relevant myths for this substance
        const relevantMyths = [];
        const substanceLower = suspect.toLowerCase();
        
        // Expanded keywords to match for different substances
        const mythKeywords = {
          'fentanyl': ['fentanyl', 'carfentanil', 'opioid', 'overdose', 'naloxone', 'narcan'],
          'heroin': ['heroin', 'opioid', 'overdose', 'naloxone', 'narcan', 'speedball'],
          'cocaine': ['cocaine', 'crack', 'speedball', 'stimulant', 'levamisole'],
          'mdma': ['mdma', 'molly', 'ecstasy', 'sass', 'empathogen'],
          'mda': ['mda', 'sass', 'mdma', 'molly', 'ecstasy'],
          'lsd': ['lsd', 'acid', 'psychedelic', 'trip', 'flashback', 'blotter', 'nbome'],
          'psilocybin': ['mushroom', 'psilocybin', 'psychedelic', 'trip', 'shroom'],
          'dmt': ['dmt', 'psychedelic', 'trip', 'tryptamine'],
          '5-meo-dmt': ['dmt', 'psychedelic', 'trip', 'tryptamine'],
          'mescaline': ['mescaline', 'psychedelic', 'trip'],
          'methamphetamine': ['meth', 'methamphetamine', 'stimulant', 'amphetamine'],
          'amphetamine': ['amphetamine', 'adderall', 'stimulant', 'meth'],
          'ketamine': ['ketamine', 'dissociative', 'k-hole'],
          'pcp': ['pcp', 'dissociative', 'angel dust'],
          'dxm': ['dxm', 'dextromethorphan', 'dissociative', 'cough'],
          'ghb': ['ghb', 'date rape', 'depressant', 'overdose'],
          'alprazolam': ['xanax', 'alprazolam', 'benzo', 'benzodiazepine', 'withdrawal'],
          'clonazepam': ['klonopin', 'clonazepam', 'benzo', 'benzodiazepine', 'withdrawal'],
          'diazepam': ['valium', 'diazepam', 'benzo', 'benzodiazepine', 'withdrawal'],
          'etizolam': ['etizolam', 'benzo', 'research chemical', 'withdrawal'],
          'flualprazolam': ['flualprazolam', 'xanax', 'benzo', 'fake', 'counterfeit'],
          '2c-b': ['2c-b', '2c', 'psychedelic', 'trip'],
          '25i-nbome': ['nbome', '25i', 'blotter', 'fake lsd', 'psychedelic'],
          'kratom': ['kratom', 'opioid', 'withdrawal', 'natural'],
          'phenibut': ['phenibut', 'withdrawal', 'nootropic', 'gaba'],
          'cannabis': ['cannabis', 'marijuana', 'thc', 'weed', 'edible'],
          'codeine': ['codeine', 'lean', 'purple drank', 'opioid', 'cough syrup'],
          '6-apb': ['6-apb', 'benzo fury', 'empathogen', 'research chemical']
        };
        
        // Get keywords for this substance
        let keywords = [];
        for(const [key, words] of Object.entries(mythKeywords)) {
          if(substanceLower.includes(key)) {
            keywords = words;
            break;
          }
        }
        
        // Only add class-based keywords if no specific keywords found
        if(keywords.length === 0 && s.class) {
          const classLower = s.class.toLowerCase();
          if(classLower.includes('opioid')) keywords = ['opioid', 'naloxone', 'narcan'];
          else if(classLower.includes('psychedelic') || classLower.includes('tryptamine')) keywords = ['psychedelic', 'lsd', 'mushroom'];
          else if(classLower.includes('benzo')) keywords = ['benzo', 'benzodiazepine', 'xanax'];
          else if(classLower.includes('dissociative')) keywords = ['dissociative', 'ketamine'];
        }
        
        // Search through all myth categories with stricter matching
        if(keywords.length > 0 && data.myths_and_misinformation.categories) {
          data.myths_and_misinformation.categories.forEach(category => {
            if(category.myths) {
              category.myths.forEach(myth => {
                const mythText = (myth.myth + ' ' + myth.reality + ' ' + myth.truth).toLowerCase();
                
                // Require at least one primary keyword to match
                const primaryMatch = keywords.slice(0, 3).some(keyword => mythText.includes(keyword));
                
                // Or require the actual substance name to appear
                const substanceNameMatch = mythText.includes(substanceLower);
                
                // Only include if primary match or substance name appears
                if(primaryMatch || substanceNameMatch) {
                  relevantMyths.push({...myth, category: category.category});
                }
              });
            }
          });
        }
        
        // Sort by danger level
        const sortedMyths = relevantMyths
          .sort((a, b) => {
            const priority = {critical: 0, high: 1, medium: 2, low: 3};
            return priority[a.danger_level] - priority[b.danger_level];
          });
        
        // Show top 3 by default, all if showAllMyths is true
        const displayMyths = showAllMyths ? sortedMyths : sortedMyths.slice(0, 3);
        const hasMore = sortedMyths.length > 3;
        
        if(sortedMyths.length > 0) {
          return (
            <div className="pt-3 border-t border-white/10">
              <details className="space-y-3">
                <summary className="font-semibold text-amber-200 flex items-center gap-2 cursor-pointer hover:text-amber-100 transition">
                  ⚠️ Common Myths & Misinformation
                  <span className="text-xs font-normal opacity-70">({sortedMyths.length} debunked)</span>
                </summary>
                <div className="space-y-2 mt-3">
                  {displayMyths.map((myth, idx) => {
                    const colorClasses = {
                      critical: 'bg-red-500/10 border-red-400/30',
                      high: 'bg-orange-500/10 border-orange-400/30',
                      medium: 'bg-amber-500/10 border-amber-400/30',
                      low: 'bg-yellow-500/10 border-yellow-400/30'
                    };
                    const badgeColors = {
                      critical: 'bg-red-500/30 text-red-200',
                      high: 'bg-orange-500/30 text-orange-200',
                      medium: 'bg-amber-500/30 text-amber-200',
                      low: 'bg-yellow-500/30 text-yellow-200'
                    };
                    const colorClass = colorClasses[myth.danger_level] || colorClasses.medium;
                    const badgeColor = badgeColors[myth.danger_level] || badgeColors.medium;
                    
                    return (
                      <div key={idx} className={`rounded-xl p-3 border ${colorClass}`}>
                        <div className="flex items-start gap-2 mb-2">
                          <div className="flex-1">
                            <div className="font-semibold text-red-200 text-sm mb-1">
                              ❌ MYTH: "{myth.myth}"
                            </div>
                          </div>
                          <div className={`text-xs px-2 py-0.5 rounded ${badgeColor} font-semibold uppercase`}>
                            {myth.danger_level}
                          </div>
                        </div>
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="font-semibold text-amber-200">Reality:</span>
                            <span className="text-amber-100"> {myth.reality}</span>
                          </div>
                          <div className="pt-1 border-t border-white/10">
                            <span className="font-semibold text-emerald-200">✓ Truth:</span>
                            <span className="text-emerald-100"> {myth.truth}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {hasMore && (
                    <button 
                      onClick={() => setShowAllMyths(!showAllMyths)}
                      className="w-full mt-3 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-400/30 text-amber-200 text-sm font-medium hover:bg-amber-500/20 transition flex items-center justify-center gap-2"
                    >
                      {showAllMyths ? '▲ Show Less' : `▼ Show ${sortedMyths.length - 3} More Myth${sortedMyths.length - 3 > 1 ? 's' : ''}`}
                    </button>
                  )}
                </div>
              </details>
            </div>
          );
        }
        return null;
      })()}
      
      {s.links && (
        <div className="pt-3 border-t border-white/10 space-y-2">
          <div className="text-xs text-gray-300">
            <span className="font-semibold">📚 Learn More:</span> Visit these trusted resources for detailed information about this substance
          </div>
          <div className="flex flex-wrap gap-2">
            {s.links.wikipedia && (
              <a href={s.links.wikipedia} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500/30 border border-blue-400/50 text-blue-100 text-sm font-medium hover:bg-blue-500/40 transition group relative">
                📖 Wikipedia
                <div className="absolute hidden group-hover:block bottom-full left-0 mb-2 w-64 p-2 bg-slate-900 border border-blue-400/50 rounded-lg text-xs z-10">
                  <div className="font-semibold text-blue-200">Scientific Information</div>
                  <div className="text-gray-300">Pharmacology, chemistry, effects, risks, legal status, and medical uses</div>
                </div>
              </a>
            )}
            {s.links.erowid && (
              <a href={s.links.erowid} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/30 border border-emerald-400/50 text-emerald-100 text-sm font-medium hover:bg-emerald-500/40 transition group relative">
                🌿 Erowid
                <div className="absolute hidden group-hover:block bottom-full left-0 mb-2 w-64 p-2 bg-slate-900 border border-emerald-400/50 rounded-lg text-xs z-10">
                  <div className="font-semibold text-emerald-200">Experience Reports & Harm Reduction</div>
                  <div className="text-gray-300">User experiences, dosage info, effects timeline, safety tips, and trip reports</div>
                </div>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Swatches(){
  const {data} = useJSON('data/reagents.json');
  if(!data) return null;
  
  // Build a map of reagent -> substance -> color
  const reagentMap = {};
  Object.keys(data.reagents).forEach(reagentId => {
    reagentMap[reagentId] = [];
  });
  
  // Collect all substance reactions for each reagent
  Object.entries(data.substances).forEach(([substanceName, substanceData]) => {
    if(substanceData.testing) {
      substanceData.testing.forEach(test => {
        if(reagentMap[test.reagent]) {
          reagentMap[test.reagent].push({
            substance: substanceName,
            color: test.color,
            alt: test.alt
          });
        }
      });
    }
  });
  
  return (
    <div className="grid gap-3">
      {Object.entries(data.reagents).map(([reagentId, reagentInfo]) => {
        const reactions = reagentMap[reagentId];
        if(reactions.length === 0) return null;
        
        return (
          <div key={reagentId} className="rounded-2xl border border-white/10 p-4 bg-white/5 space-y-3">
            <div>
              <h3 className="font-semibold text-lg mb-1">{reagentInfo.name}</h3>
              <div className="text-xs opacity-70">{reagentInfo.notes}</div>
            </div>
            
            {(reagentInfo.origins || reagentInfo.usage || reagentInfo.strengths || reagentInfo.weaknesses) && (
              <details open className="rounded-xl p-3 bg-white/5 border border-white/10">
                <summary className="font-semibold text-blue-200 cursor-pointer hover:text-blue-100 transition text-sm">
                  📚 Learn About This Reagent
                </summary>
                <div className="mt-3 space-y-3 text-sm">
                  {reagentInfo.origins && (
                    <div>
                      <div className="font-semibold text-amber-200 mb-1">🧪 Origins & History</div>
                      <div className="text-gray-300 leading-relaxed">{reagentInfo.origins}</div>
                    </div>
                  )}
                  {reagentInfo.usage && (
                    <div>
                      <div className="font-semibold text-emerald-200 mb-1">💡 How To Use</div>
                      <div className="text-gray-300 leading-relaxed">{reagentInfo.usage}</div>
                    </div>
                  )}
                  {reagentInfo.strengths && (
                    <div>
                      <div className="font-semibold text-green-200 mb-1">✓ Strengths</div>
                      <ul className="list-disc ms-5 space-y-1 text-green-100">
                        {reagentInfo.strengths.map((strength, i) => <li key={i}>{strength}</li>)}
                      </ul>
                    </div>
                  )}
                  {reagentInfo.weaknesses && (
                    <div>
                      <div className="font-semibold text-orange-200 mb-1">⚠ Weaknesses & Limitations</div>
                      <ul className="list-disc ms-5 space-y-1 text-orange-100">
                        {reagentInfo.weaknesses.map((weakness, i) => <li key={i}>{weakness}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </details>
            )}
            
            <div>
              <div className="font-semibold text-sm text-slate-200 mb-2">Color Reactions ({reactions.length} substances)</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {reactions.map((r, i) => (
                  <div key={i} className="flex items-center justify-between bg-black/20 rounded-xl p-2">
                    <span className="text-sm font-medium">{r.substance}</span>
                    <Chip label={r.alt} color={r.color}/>
                  </div>
                ))}
              </div>
            </div>
            
            {data.vendors && (()=>{
              // Find vendors that sell this reagent
              const relevantVendors = data.vendors
                .filter(v => v.reagents && v.reagents.includes(reagentInfo.name))
                .filter(v => v.category === 'harm_reduction' || v.category === 'professional_and_consumer');
              
              if(relevantVendors.length > 0) {
                return (
                  <div>
                    <div className="font-semibold text-sm text-emerald-200 mb-2">
                      🛒 Where to Buy {reagentInfo.name} ({relevantVendors.length} vendor{relevantVendors.length > 1 ? 's' : ''})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {relevantVendors.map((v, idx) => (
                        <a 
                          key={idx}
                          href={v.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="rounded-xl p-3 bg-emerald-500/10 border border-emerald-400/30 hover:bg-emerald-500/20 transition group"
                        >
                          <div className="flex items-start justify-between mb-1">
                            <div className="font-semibold text-emerald-100 group-hover:text-emerald-50">{v.name}</div>
                            {v.price_range && <div className="text-xs text-emerald-300">{v.price_range}</div>}
                          </div>
                          <div className="text-xs text-emerald-200/70 mb-1">
                            {v.regions.join(', ')}
                          </div>
                          {v.notes && (
                            <div className="text-xs text-emerald-200/60 italic">{v.notes}</div>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        );
      })}
    </div>
  );
}

function News(){
  const {data} = useJSON('data/reagents.json');
  const [filter, setFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All Regions');
  const [preferredRegion, setPreferredRegion] = useState('All Regions'); // Pre-aggregation filter
  const [useLiveFeeds, setUseLiveFeeds] = useState(false);
  const [detectedRegion, setDetectedRegion] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [displayCount, setDisplayCount] = useState(10); // Show 10 initially
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  
  // Source selection - all enabled by default
  const [enabledSources, setEnabledSources] = useState({
    drugsdata: true,
    fda_recalls: true,
    fda_safety: true,
    dancesafe: true,
    erowid: true,
    dpa: true,
    nida: true,
    samhsa: true,
    maps: true,
    filterforwards: true,
    drugscience: true,
    cdc_overdose: true,
    harmreduction: true,
    transform: true,
    talkingdrugs: true,
    releaseuk: true,
    ssdp: true,
    emcdda: true,
    newsapi: false, // Disabled by default (requires API key)
    local: true
  });
  
  // ALWAYS call the safe hook (Rules of Hooks) - it handles everything internally
  // news-aggregator.js is loaded before app.js, so this function always exists
  // Pass preferredRegion to aggregator for location-aware news fetching
  const { news: liveNews, loading: liveLoading, error: liveError, lastUpdate, pagination, refresh } = 
    useSafeAggregatedNews({ 
      enabled: useLiveFeeds, 
      limit: null, 
      offset: 0,
      preferredRegion: preferredRegion !== 'All Regions' ? preferredRegion : null,
      enabledSources: enabledSources
    });
  
  // Detect user location (optional)
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Simple region detection based on coordinates
        const { latitude, longitude } = position.coords;
        let region = 'USA - Nationwide';
        
        // Very rough region detection (would need proper geocoding API for accuracy)
        if (latitude >= 49) region = 'Canada';
        else if (latitude >= 45 && longitude <= -110) region = 'USA - Pacific Northwest';
        else if (latitude >= 35 && latitude < 42 && longitude >= -125 && longitude <= -114) region = 'USA - California';
        else if (latitude >= 32 && latitude < 37 && longitude >= -115 && longitude <= -103) region = 'USA - Southwest';
        else if (latitude >= 37 && latitude < 45 && longitude >= -80 && longitude <= -70) region = 'USA - East Coast';
        else if (longitude >= -10 && longitude <= 30) {
          if (latitude >= 48 && latitude <= 62) region = 'UK - England';
          else if (latitude >= 40 && latitude <= 44) region = 'Spain';
          else if (latitude >= 45 && latitude <= 48) region = 'France';
        }
        
        setDetectedRegion(region);
        setPreferredRegion(region); // Set for live feed aggregation
        setRegionFilter(region); // Set for post-filter display
      },
      (error) => {
        setGeoError(error.message);
      }
    );
  };
  
  if(!data?.news) return (
    <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6">
      <p className="text-cyan-100">📰 News section coming soon! This will display harm reduction alerts, dangerous batch warnings, policy updates, and community news.</p>
    </div>
  );

  const news = data.news;
  
  // Combine local and live articles if using live feeds
  const allArticles = useLiveFeeds && liveNews && !liveError
    ? [...(news.articles || []), ...liveNews]
    : (news.articles || []);
  
  // Extract unique regions from all articles
  const allRegions = new Set(['All Regions']);
  allArticles.forEach(article => {
    if (article.regions && Array.isArray(article.regions)) {
      article.regions.forEach(region => allRegions.add(region));
    }
  });
  const regions = Array.from(allRegions);
  
  const categories = ['All', ...new Set(allArticles.map(a => a.category) || [])];
  
  // Filter by both category AND region
  const filtered = allArticles.filter(article => {
    const categoryMatch = filter === 'All' || article.category === filter;
    const regionMatch = regionFilter === 'All Regions' || 
      (article.regions && article.regions.includes(regionFilter));
    return categoryMatch && regionMatch;
  });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-cyan-500/50 bg-cyan-500/10 p-5 space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-cyan-200 mb-2">📰 {news.title || 'Harm Reduction News & Alerts'}</h3>
          <p className="text-sm text-cyan-100 leading-relaxed">
            {news.description || 'Stay informed about dangerous batches, contamination alerts, policy changes, and harm reduction developments.'}
          </p>
        </div>
        {news.disclaimer && (
          <div className="text-xs text-amber-200 bg-amber-500/10 border border-amber-400/30 rounded-lg p-3">
            {news.disclaimer}
          </div>
        )}
      </div>

      {/* Live Feeds Settings */}
      <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setUseLiveFeeds(!useLiveFeeds)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  useLiveFeeds ? 'bg-cyan-500' : 'bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  useLiveFeeds ? 'translate-x-6' : 'translate-x-1'
                }`}/>
              </button>
              <div>
                <div className="font-medium text-sm text-cyan-200">Live News Feeds</div>
                <div className="text-xs text-gray-400">
                  {useLiveFeeds ? 'Enabled - fetching from RSS feeds & APIs' : 'Disabled - showing manual updates only'}
                </div>
              </div>
            </div>
            {useLiveFeeds && refresh && (
              <button
                onClick={refresh}
                disabled={liveLoading}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/30 transition disabled:opacity-50"
              >
                {liveLoading ? '🔄 Loading...' : '🔄 Refresh'}
              </button>
            )}
          </div>

          {/* Location Preference for News Aggregation */}
          <div className="border-t border-cyan-500/20 pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-cyan-300">📍 News Location Preference</div>
              <button
                onClick={detectLocation}
                className="px-2 py-1 rounded text-xs bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 hover:bg-cyan-500/30 transition flex items-center gap-1"
              >
                🌍 Auto-Detect
              </button>
            </div>
            
            {detectedRegion && (
              <div className="text-xs text-cyan-300 bg-cyan-500/10 rounded px-2 py-1">
                ✓ Detected: {detectedRegion}
              </div>
            )}
            
            <select
              value={preferredRegion}
              onChange={(e) => {
                setPreferredRegion(e.target.value);
                setRegionFilter(e.target.value);
              }}
              className="w-full px-3 py-2 text-sm rounded-lg bg-gray-800 border border-cyan-500/30 text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="All Regions">🌍 All Regions (Global News)</option>
              <optgroup label="🇺🇸 United States">
                <option value="USA - Nationwide">USA - Nationwide</option>
                <option value="USA - Massachusetts">Massachusetts (Boston, Worcester)</option>
                <option value="USA - East Coast">East Coast (NY, NJ, PA, MA)</option>
                <option value="USA - Pacific Northwest">Pacific Northwest (WA, OR)</option>
                <option value="USA - California">California</option>
                <option value="USA - Southwest">Southwest (AZ, NV, NM)</option>
                <option value="USA - Texas">Texas</option>
                <option value="USA - Illinois">Illinois (Chicago)</option>
                <option value="USA - New York">New York</option>
              </optgroup>
              <optgroup label="🇨🇦 Canada">
                <option value="Canada">Canada - Nationwide</option>
                <option value="Canada - BC">British Columbia (Vancouver)</option>
                <option value="Canada - Ontario">Ontario (Toronto)</option>
              </optgroup>
              <optgroup label="🇬🇧 United Kingdom">
                <option value="UK - England">England</option>
                <option value="UK - Scotland">Scotland</option>
              </optgroup>
              <optgroup label="🌍 Europe">
                <option value="Spain">Spain</option>
                <option value="France">France</option>
                <option value="Netherlands">Netherlands</option>
                <option value="Portugal">Portugal</option>
              </optgroup>
            </select>
            
            <div className="text-xs text-gray-400">
              {preferredRegion !== 'All Regions' ? (
                <>✅ Fetching news relevant to <span className="text-cyan-300 font-medium">{preferredRegion}</span></>
              ) : (
                <>Showing global news from all regions</>
              )}
            </div>
          </div>
          
          {/* Source Selector */}
          <div className="border-t border-cyan-500/20 pt-3 space-y-2">
            <button
              onClick={() => setShowSourceSelector(!showSourceSelector)}
              className="w-full flex items-center justify-between text-xs font-medium text-cyan-300 hover:text-cyan-200 transition"
            >
              <span>🎛️ Customize News Sources ({Object.values(enabledSources).filter(Boolean).length}/{Object.keys(enabledSources).length} enabled)</span>
              <span className="text-gray-400">{showSourceSelector ? '▼' : '▶'}</span>
            </button>
            
            {showSourceSelector && (
              <div className="space-y-2 bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Select which sources to query:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEnabledSources(Object.keys(enabledSources).reduce((acc, key) => ({...acc, [key]: true}), {}))}
                      className="text-xs px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
                    >
                      All
                    </button>
                    <button
                      onClick={() => setEnabledSources(Object.keys(enabledSources).reduce((acc, key) => ({...acc, [key]: false}), {}))}
                      className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
                    >
                      None
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'drugsdata', label: 'DrugsData.org', type: 'Lab Results' },
                    { key: 'fda_recalls', label: 'FDA Recalls', type: 'Safety' },
                    { key: 'fda_safety', label: 'FDA Safety', type: 'Safety' },
                    { key: 'cdc_overdose', label: 'CDC Overdose', type: 'Federal' },
                    { key: 'dancesafe', label: 'DanceSafe', type: 'Community' },
                    { key: 'harmreduction', label: 'Harm Reduction Coalition', type: 'Community' },
                    { key: 'erowid', label: 'Erowid', type: 'Research' },
                    { key: 'dpa', label: 'Drug Policy Alliance', type: 'Policy' },
                    { key: 'transform', label: 'Transform Drug Policy', type: 'Policy' },
                    { key: 'talkingdrugs', label: 'TalkingDrugs', type: 'Policy' },
                    { key: 'ssdp', label: 'SSDP', type: 'Policy' },
                    { key: 'nida', label: 'NIDA', type: 'Research' },
                    { key: 'samhsa', label: 'SAMHSA', type: 'Federal' },
                    { key: 'maps', label: 'MAPS', type: 'Research' },
                    { key: 'emcdda', label: 'EMCDDA (EU)', type: 'Research' },
                    { key: 'filterforwards', label: 'Filter Magazine', type: 'Journalism' },
                    { key: 'drugscience', label: 'Drug Science UK', type: 'Research' },
                    { key: 'releaseuk', label: 'Release UK', type: 'Community' },
                    { key: 'newsapi', label: 'NewsAPI.org', type: 'Aggregator' }
                  ].map(source => (
                    <label key={source.key} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-cyan-500/10 rounded p-1.5 transition">
                      <input
                        type="checkbox"
                        checked={enabledSources[source.key] || false}
                        onChange={(e) => setEnabledSources({...enabledSources, [source.key]: e.target.checked})}
                        className="w-3.5 h-3.5 rounded border-cyan-500/50 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-cyan-100 truncate">{source.label}</div>
                        <div className="text-gray-500 text-xs">{source.type}</div>
                      </div>
                    </label>
                  ))}
                </div>
                
                {!enabledSources.newsapi && (
                  <div className="text-xs text-amber-200 bg-amber-500/10 border border-amber-400/30 rounded p-2">
                    💡 NewsAPI requires a free API key. See ADDING_REAL_NEWS.md
                  </div>
                )}
              </div>
            )}
          </div>
          
          {useLiveFeeds && lastUpdate && (
            <div className="text-xs text-gray-400 border-t border-cyan-500/20 pt-2">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
          
          {useLiveFeeds && liveError && (
            <div className="text-xs text-red-300 bg-red-500/10 rounded p-2">
              ⚠️ Error loading live feeds. Showing manual updates only.
            </div>
          )}
          
          {useLiveFeeds && liveLoading && (
            <div className="text-xs text-cyan-300">
              ⏳ Fetching latest news from multiple sources...
            </div>
          )}
        </div>

      {/* Region Filter with Geolocation */}
      {regions.length > 1 && (
        <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-medium text-sm text-purple-200">📍 Filter by Region</div>
            <button
              onClick={detectLocation}
              className="px-3 py-1 rounded-lg text-xs font-medium bg-purple-500/20 border border-purple-400/40 text-purple-200 hover:bg-purple-500/30 transition flex items-center gap-1"
            >
              🌍 Detect My Location
            </button>
          </div>
          
          {detectedRegion && (
            <div className="text-xs text-purple-300 bg-purple-500/10 rounded p-2">
              ✓ Detected region: {detectedRegion}
            </div>
          )}
          
          {geoError && (
            <div className="text-xs text-amber-300 bg-amber-500/10 rounded p-2">
              ⚠️ Location detection: {geoError}. Please select manually below.
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            {regions.map(region => (
              <button
                key={region}
                onClick={() => setRegionFilter(region)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  regionFilter === region
                    ? 'bg-purple-500/30 border border-purple-400/60 text-purple-100'
                    : 'bg-purple-500/10 border border-purple-400/30 text-purple-200 hover:bg-purple-500/20'
                }`}
              >
                {region} ({allArticles.filter(a => region === 'All Regions' || (a.regions && a.regions.includes(region))).length})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Filters */}
      {categories.length > 1 && (
        <div className="space-y-2">
          <div className="font-medium text-sm text-cyan-200">🏷️ Filter by Category</div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  filter === cat
                    ? 'bg-cyan-500/30 border border-cyan-400/60 text-cyan-100'
                    : 'bg-cyan-500/10 border border-cyan-400/30 text-cyan-200 hover:bg-cyan-500/20'
                }`}
              >
                {cat} ({filtered.filter(a => cat === 'All' || a.category === cat).length})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Article count and pagination info */}
      {filtered.length > 0 && (
        <div className="text-sm text-gray-400 pb-2">
          Showing {Math.min(displayCount, filtered.length)} of {filtered.length} articles
          {useLiveFeeds && pagination?.total > 0 && ` (${pagination.total} total from live feeds)`}
        </div>
      )}

      <div className="space-y-3">
        {filtered?.slice(0, displayCount).map((article, idx) => (
          <div key={idx} className={`rounded-2xl border p-5 space-y-3 ${
            article.priority === 'critical' ? 'border-red-500/50 bg-red-500/10' :
            article.priority === 'high' ? 'border-amber-500/50 bg-amber-500/10' :
            'border-white/10 bg-white/5'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {article.priority === 'critical' && <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/30 text-red-100 border border-red-400/50">🚨 CRITICAL</span>}
                  {article.priority === 'high' && <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/30 text-amber-100 border border-amber-400/50">⚠️ HIGH PRIORITY</span>}
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-gray-300">{article.category}</span>
                  <span className="text-xs text-gray-400">{article.date}</span>
                  {article.feed_source && (
                    <span className="px-2 py-0.5 rounded text-xs bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">📡 {article.feed_source}</span>
                  )}
                </div>
                <h4 className="font-bold text-base mb-2">
                  {article.source_url ? (
                    <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 transition-colors">
                      {article.title} <span className="text-cyan-400 text-sm">→</span>
                    </a>
                  ) : article.title}
                </h4>
                <p className="text-sm leading-relaxed mb-3">{article.summary}</p>
                
                {article.details && (
                  <div className="space-y-2 text-sm">
                    {article.details.map((detail, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-cyan-400">•</span>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                )}

                {article.regions && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    <span className="text-xs text-gray-400">Regions:</span>
                    {article.regions.map((region, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-xs bg-white/10 text-gray-300">{region}</span>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex items-center gap-3 text-xs">
                  {article.source && (
                    <div className="text-gray-400">
                      Source: {article.source_url ? (
                        <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:text-cyan-200 underline">
                          {article.source} ↗
                        </a>
                      ) : article.source}
                    </div>
                  )}
                  {article.author && (
                    <div className="text-gray-500">
                      By {article.author}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {(!filtered || filtered.length === 0) && (
          <div className="text-center py-8 text-gray-400">
            {useLiveFeeds && liveLoading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                <p>Loading live news feeds...</p>
              </div>
            ) : (
              <div>
                <p>No news articles found.</p>
                {!useLiveFeeds && (
                  <p className="mt-2 text-sm">Try enabling Live News Feeds for real-time articles.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Load More Button */}
      {filtered.length > displayCount && (
        <div className="pt-4 flex flex-col items-center gap-2">
          <button
            onClick={() => setDisplayCount(prev => prev + 10)}
            className="px-6 py-3 rounded-xl bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 hover:bg-cyan-500/30 transition-colors font-medium"
          >
            Load More ({filtered.length - displayCount} remaining)
          </button>
          <button
            onClick={() => setDisplayCount(filtered.length)}
            className="px-4 py-2 rounded-lg text-sm text-cyan-300 hover:text-cyan-200 underline"
          >
            Show All
          </button>
        </div>
      )}

      {/* Show Less Button */}
      {displayCount > 10 && filtered.length > 10 && displayCount >= filtered.length && (
        <div className="pt-4 flex justify-center">
          <button
            onClick={() => {
              setDisplayCount(10);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-300 underline"
          >
            ↑ Show Less
          </button>
        </div>
      )}
    </div>
  );
}

function Vendors(){
  const {data} = useJSON('data/reagents.json');
  const [region, setRegion] = useState('All');
  const [q, setQ] = useState('');
  if(!data?.vendors) return null;
  const regionSet = new Set(['All']); data.vendors.forEach(v=>v.regions.forEach(r=>regionSet.add(r)));
  const regions = Array.from(regionSet);
  const list = data.vendors.filter(v => (region==='All' || v.regions.includes(region)) && (!q || (v.name + ' ' + v.notes).toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs opacity-80">Region:</label>
        <select value={region} onChange={e=>setRegion(e.target.value)} className="bg-black/30 rounded-lg px-2 py-1 border border-white/10 text-xs">
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <input placeholder="Filter vendors…" value={q} onChange={e=>setQ(e.target.value)} className="bg-black/30 rounded-lg px-2 py-1 border border-white/10 text-xs flex-1 min-w-[200px]"/>
      </div>
      {list.map(v => (
        <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer" className="block rounded-2xl border border-white/10 p-4 bg-white/5 hover:bg-white/10 transition space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{v.name}</h3>
                {v.category === 'harm_reduction' && <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200">FREE</span>}
                {v.category === 'professional' && <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-200">Professional</span>}
                {v.category === 'professional_and_consumer' && <span className="px-2 py-0.5 text-[10px] rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-200">Public Available</span>}
              </div>
              <div className="text-xs opacity-70">Regions: {v.regions.join(', ')}</div>
              {v.price_range && <div className="text-xs text-amber-200 mt-1">Price: {v.price_range}</div>}
              <p className="text-sm text-sky-200/80 mt-2">{v.notes}</p>
            </div>
            <span className="px-2 py-1 text-xs rounded-full bg-sky-500/20 border border-sky-400/40 whitespace-nowrap">Visit</span>
          </div>
          
          {(v.reagents || v.products) && (
            <div className="pt-2 border-t border-white/10">
              <div className="text-xs font-semibold mb-1.5 opacity-80">{v.reagents ? 'Reagents Available:' : 'Products Available:'}</div>
              <div className="flex flex-wrap gap-1.5">
                {(v.reagents || v.products).map((item, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs rounded-md bg-white/10 border border-white/20 text-gray-300">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </a>
      ))}
    </div>
  );
}

function CounterfeitPillsWarning(){
  const {data} = useJSON('data/reagents.json');
  if(!data?.counterfeit_pills_warning) return null;
  const cpw = data.counterfeit_pills_warning;
  
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-red-600/70 bg-red-600/20 p-5">
        <h2 className="text-xl font-bold text-red-100 mb-3">{cpw.title}</h2>
        <div className="space-y-2 text-sm">
          <p className="text-red-50 font-semibold">{cpw.overview.warning}</p>
          <p className="text-red-100">{cpw.overview.scope}</p>
          <p className="text-red-100 font-bold">{cpw.overview.critical}</p>
        </div>
      </div>
      
      {cpw.most_counterfeited && (
        <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4 space-y-3">
          <h3 className="font-semibold text-lg text-orange-200">💊 {cpw.most_counterfeited.name}</h3>
          {cpw.most_counterfeited.pills.map((pill,i)=>(
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-1.5">
              <div className="font-bold text-orange-100">{pill.drug}</div>
              <div className="text-sm"><span className="font-semibold text-gray-300">Looks like:</span> {pill.appearance}</div>
              <div className="text-sm"><span className="font-semibold text-red-300">Reality:</span> {pill.reality}</div>
              <div className="text-sm"><span className="font-semibold text-amber-300">Prevalence:</span> {pill.prevalence}</div>
              <div className="text-sm"><span className="font-semibold text-sky-300">Visual tells:</span> {pill.visual_tells}</div>
            </div>
          ))}
        </div>
      )}
      
      {cpw.testing_strategies && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-emerald-200">🧪 {cpw.testing_strategies.name}</h3>
          
          {cpw.testing_strategies.critical_first_step && (
            <div className="rounded-xl border-2 border-emerald-500/50 bg-emerald-500/10 p-4 space-y-2">
              <div className="font-bold text-emerald-100 text-base">{cpw.testing_strategies.critical_first_step.title}</div>
              <div className="text-sm"><span className="font-semibold">Why:</span> {cpw.testing_strategies.critical_first_step.why}</div>
              <div className="text-sm"><span className="font-semibold">How:</span><ul className="list-disc ms-5 mt-1">{cpw.testing_strategies.critical_first_step.how.map((h,i)=><li key={i}>{h}</li>)}</ul></div>
              <div className="text-sm"><span className="font-semibold">Where to get:</span> {cpw.testing_strategies.critical_first_step.where_to_get}</div>
              <div className="text-sm text-yellow-200"><span className="font-semibold">⚠️ Limitations:</span> {cpw.testing_strategies.critical_first_step.limitations}</div>
            </div>
          )}
          
          {cpw.testing_strategies.colorimetric_reagents && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2 text-sm">
              <div className="font-semibold">{cpw.testing_strategies.colorimetric_reagents.title}</div>
              <div><span className="font-semibold">Purpose:</span> {cpw.testing_strategies.colorimetric_reagents.purpose}</div>
              <div><span className="font-semibold">Method:</span><ul className="list-disc ms-5 mt-1">{cpw.testing_strategies.colorimetric_reagents.method.map((m,i)=><li key={i}>{m}</li>)}</ul></div>
              <div><span className="font-semibold text-red-300">Red flags:</span><ul className="list-disc ms-5 mt-1">{cpw.testing_strategies.colorimetric_reagents.red_flags.map((r,i)=><li key={i}>{r}</li>)}</ul></div>
            </div>
          )}
          
          {cpw.testing_strategies.visual_inspection && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2 text-sm">
              <div className="font-semibold">{cpw.testing_strategies.visual_inspection.title}</div>
              <div className="text-yellow-200 font-semibold">⚠️ {cpw.testing_strategies.visual_inspection.warning}</div>
              <div><span className="font-semibold">What to check:</span><ul className="list-disc ms-5 mt-1 space-y-0.5">{cpw.testing_strategies.visual_inspection.what_to_check.map((w,i)=><li key={i}>{w}</li>)}</ul></div>
              <div className="text-red-200">⚠️ {cpw.testing_strategies.visual_inspection.note}</div>
            </div>
          )}
        </div>
      )}
      
      {cpw.current_trends && (
        <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4 space-y-3">
          <h3 className="font-semibold text-lg text-purple-200">📊 {cpw.current_trends.name}</h3>
          {cpw.current_trends.trends.map((trend,i)=>(
            <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-3 space-y-1 text-sm">
              <div className="font-bold text-purple-100">{trend.trend}</div>
              <div>{trend.description}</div>
              {trend.colors && <div><span className="font-semibold">Colors:</span> {trend.colors}</div>}
              {trend.danger && <div className="text-red-300"><span className="font-semibold">⚠️ Danger:</span> {trend.danger}</div>}
              {trend.response && <div><span className="font-semibold">Response:</span> {trend.response}</div>}
              {trend.testing && <div><span className="font-semibold">Testing:</span> {trend.testing}</div>}
              {trend.note && <div className="text-amber-200"><span className="font-semibold">Note:</span> {trend.note}</div>}
            </div>
          ))}
        </div>
      )}
      
      {cpw.harm_reduction_strategies && (
        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 space-y-3">
          <h3 className="font-semibold text-lg text-blue-200">🛡️ {cpw.harm_reduction_strategies.name}</h3>
          {cpw.harm_reduction_strategies.strategies.map((strat,i)=>(
            <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-3 space-y-1 text-sm">
              <div className="font-bold text-blue-100">{strat.strategy}</div>
              <div><span className="font-semibold">Why:</span> {strat.why}</div>
              {strat.how && <div><span className="font-semibold">How:</span> {strat.how}</div>}
              {strat.tools && <div><span className="font-semibold">Tools:</span> {strat.tools}</div>}
              {strat.where && <div><span className="font-semibold">Where:</span> {strat.where}</div>}
              {strat.note && <div className="text-amber-200">{strat.note}</div>}
            </div>
          ))}
        </div>
      )}
      
      {cpw.resources && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3">
          <h3 className="font-semibold text-lg text-emerald-200">📞 {cpw.resources.name}</h3>
          {cpw.resources.categories && cpw.resources.categories.map((cat,i)=>(
            <div key={i} className="space-y-2">
              <div className="font-semibold text-emerald-200 text-sm">{cat.category}</div>
              {cat.resources && cat.resources.map((res,j)=>(
                <div key={j} className="rounded-xl bg-white/5 border border-white/10 p-3 space-y-1 text-sm">
                  <div className="font-bold text-emerald-100">{res.name}</div>
                  <div>{res.service}</div>
                  {res.url && <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-sky-300 hover:text-sky-200 underline">{res.url}</a>}
                  {res.phone && <div className="font-semibold text-lg">{res.phone}</div>}
                  {res.note && <div className="text-gray-400 italic">{res.note}</div>}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      
      {cpw.bottom_line && (
        <div className="rounded-2xl border-2 border-red-500/50 bg-red-500/10 p-4">
          <div className="text-sm text-red-100 font-bold">{cpw.bottom_line.message}</div>
        </div>
      )}
    </div>
  );
}

function MedicalTreatment(){
  const {data} = useJSON('data/reagents.json');
  if(!data?.medical_treatment) return null;
  const mt = data.medical_treatment;
  
  return (
    <div className="space-y-4">
      <CounterfeitPillsWarning/>
      
      {mt.overview && (
        <div className="rounded-2xl border-2 border-red-500/50 bg-red-500/10 p-4">
          <h3 className="text-lg font-bold text-red-200 mb-2">⚠️ {mt.overview.title}</h3>
          <p className="text-sm text-red-100 mb-2">{mt.overview.warning}</p>
          <p className="text-sm text-red-100/80">{mt.overview.good_samaritan}</p>
        </div>
      )}
      
      {mt.emergency_response && (
        <div className="rounded-2xl border border-white/10 p-4 bg-white/5 space-y-3">
          <h3 className="font-semibold text-lg text-amber-200">🚨 {mt.emergency_response.name}</h3>
          <div className="space-y-2">
            <div className="font-semibold text-sm">Steps:</div>
            <ul className="list-disc ms-5 text-sm space-y-1">{mt.emergency_response.steps.map((s,i)=><li key={i}>{s}</li>)}</ul>
          </div>
          <div className="space-y-2">
            <div className="font-semibold text-sm text-emerald-200">What to tell EMS/911:</div>
            <ul className="list-disc ms-5 text-sm space-y-1">{mt.emergency_response.what_to_tell_ems.map((s,i)=><li key={i}>{s}</li>)}</ul>
          </div>
          <div className="space-y-2">
            <div className="font-semibold text-sm text-rose-200">DO NOT:</div>
            <ul className="list-disc ms-5 text-sm space-y-1">{mt.emergency_response.do_not.map((s,i)=><li key={i}>{s}</li>)}</ul>
          </div>
        </div>
      )}
      
      {mt.hospital_treatments && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">🏥 Hospital Treatments by Drug Class</h3>
          {Object.entries(mt.hospital_treatments).map(([key, treatment])=>(
            <div key={key} className="rounded-2xl border border-white/10 p-4 bg-white/5 space-y-3">
              <h4 className="font-semibold text-base text-sky-200">{treatment.name}</h4>
              {treatment.signs && (<div className="text-sm"><div className="font-semibold text-red-200">⚠️ Signs of Overdose:</div><ul className="list-disc ms-5 mt-1 space-y-0.5">{treatment.signs.map((s,i)=><li key={i}>{s}</li>)}</ul></div>)}
              {treatment.prehospital && (<div className="text-sm"><div className="font-semibold text-amber-200">Before Hospital:</div><ul className="list-disc ms-5 mt-1 space-y-0.5">{treatment.prehospital.map((s,i)=><li key={i}>{s}</li>)}</ul></div>)}
              {treatment.hospital && (<div className="text-sm"><div className="font-semibold text-emerald-200">Hospital Treatment:</div><ul className="list-disc ms-5 mt-1 space-y-0.5">{treatment.hospital.map((s,i)=><li key={i}>{s}</li>)}</ul></div>)}
              {treatment.common_interventions && (<div className="text-sm"><div className="font-semibold">Common Interventions:</div><ul className="list-disc ms-5 mt-1 space-y-0.5">{treatment.common_interventions.map((s,i)=><li key={i}>{s}</li>)}</ul></div>)}
              {treatment.notes && (<div className="text-sm text-sky-200/80"><div className="font-semibold">Notes:</div><ul className="list-disc ms-5 mt-1 space-y-0.5">{treatment.notes.map((s,i)=><li key={i}>{s}</li>)}</ul></div>)}
            </div>
          ))}
        </div>
      )}
      
      {mt.legal_protections && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3">
          <h3 className="font-semibold text-lg text-emerald-200">⚖️ {mt.legal_protections.name}</h3>
          {mt.legal_protections.good_samaritan_laws && (<div className="text-sm"><div className="font-semibold">Good Samaritan Laws:</div><ul className="list-disc ms-5 mt-1 space-y-0.5">{mt.legal_protections.good_samaritan_laws.map((s,i)=><li key={i}>{s}</li>)}</ul></div>)}
          {mt.legal_protections.naloxone_access && (<div className="text-sm"><div className="font-semibold">Naloxone Access:</div><ul className="list-disc ms-5 mt-1 space-y-0.5">{mt.legal_protections.naloxone_access.map((s,i)=><li key={i}>{s}</li>)}</ul></div>)}
        </div>
      )}
      
      {mt.after_treatment && (
        <div className="rounded-2xl border border-white/10 p-4 bg-white/5 space-y-2">
          <h3 className="font-semibold text-lg">💚 {mt.after_treatment.name}</h3>
          <ul className="list-disc ms-5 text-sm space-y-0.5">{mt.after_treatment.recommendations.map((s,i)=><li key={i}>{s}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

function IDGuide(){
  const {data} = useJSON('data/reagents.json');
  if(!data?.id_guide) return null;
  const keys = Object.keys(data.id_guide);
  return (
    <div className="grid gap-3">
      {keys.map(k=>{
        const g = data.id_guide[k];
        return (
          <div key={k} className="rounded-2xl border border-white/10 p-4 bg-white/5 space-y-2">
            <h3 className="font-semibold text-lg">{g.name}</h3>
            {g.common_substances && <div className="text-xs opacity-70 mb-1">
              Common: {g.common_substances.join(', ')}
            </div>}
            {g.common_targets && <div className="text-sm">
              <div className="font-semibold text-red-200">Common Targets</div>
              <ul className="list-disc ms-5">{g.common_targets.map((t,i)=><li key={i}>{t}</li>)}</ul>
            </div>}
            {g.visual_tells && <div className="text-sm">
              <div className="font-semibold text-amber-200">Visual Identification</div>
              <ul className="list-disc ms-5">{g.visual_tells.map((t,i)=><li key={i}>{t}</li>)}</ul>
            </div>}
            {g.reality_check && <div className="text-sm">
              <div className="font-semibold text-red-200">⚠️ Reality Check</div>
              <ul className="list-disc ms-5">{g.reality_check.map((t,i)=><li key={i}>{t}</li>)}</ul>
            </div>}
            {g.testing && <div className="text-sm">
              <div className="font-semibold text-emerald-200">Testing</div>
              <ul className="list-disc ms-5">{g.testing.map((t,i)=><li key={i}>{t}</li>)}</ul>
            </div>}
            {g.cocaine_cuts && <div className="text-sm">
              <div className="font-semibold">Cocaine Cuts</div>
              <ul className="list-disc ms-5">{g.cocaine_cuts.map((t,i)=><li key={i}>{t}</li>)}</ul>
            </div>}
            {g.mdma_cuts && <div className="text-sm">
              <div className="font-semibold">MDMA/Ecstasy Cuts</div>
              <ul className="list-disc ms-5">{g.mdma_cuts.map((t,i)=><li key={i}>{t}</li>)}</ul>
            </div>}
            {g.heroin_cuts && <div className="text-sm">
              <div className="font-semibold text-red-200">Heroin Cuts</div>
              <ul className="list-disc ms-5">{g.heroin_cuts.map((t,i)=><li key={i}>{t}</li>)}</ul>
            </div>}
            {g.meth_cuts && <div className="text-sm">
              <div className="font-semibold">Methamphetamine Cuts</div>
              <ul className="list-disc ms-5">{g.meth_cuts.map((t,i)=><li key={i}>{t}</li>)}</ul>
            </div>}
            {g.ketamine_cuts && <div className="text-sm">
              <div className="font-semibold">Ketamine Cuts</div>
              <ul className="list-disc ms-5">{g.ketamine_cuts.map((t,i)=><li key={i}>{t}</li>)}</ul>
            </div>}
            {g.detection_notes && <div className="text-sm">
              <div className="font-semibold text-sky-200">Detection Notes</div>
              <ul className="list-disc ms-5">{g.detection_notes.map((t,i)=><li key={i}>{t}</li>)}</ul>
            </div>}
            {g.mdma_crystal && <div className="text-sm">
              <div className="font-semibold">MDMA Crystal</div>
              <ul className="list-disc ms-5">{g.mdma_crystal.map((t,i)=><li key={i}>{t}</li>)}</ul>
            </div>}
            {g.meth_crystal && <div className="text-sm">
              <div className="font-semibold">Methamphetamine Crystal</div>
              <ul className="list-disc ms-5">{g.meth_crystal.map((t,i)=><li key={i}>{t}</li>)}</ul>
            </div>}
            {g.cocaine_appearance && <div className="text-sm">
              <div className="font-semibold">Cocaine Appearance</div>
              <ul className="list-disc ms-5">{g.cocaine_appearance.map((t,i)=><li key={i}>{t}</li>)}</ul>
            </div>}
            {g.ketamine_appearance && <div className="text-sm">
              <div className="font-semibold">Ketamine Appearance</div>
              <ul className="list-disc ms-5">{g.ketamine_appearance.map((t,i)=><li key={i}>{t}</li>)}</ul>
            </div>}
            {g.visual_notes && <div className="text-sm">
              <div className="font-semibold text-amber-200">Visual Notes</div>
              <ul className="list-disc ms-5">{g.visual_notes.map((t,i)=><li key={i}>{t}</li>)}</ul>
            </div>}
            {g.weight_observations && <div className="text-sm">
              <div className="font-semibold">Weight & Density</div>
              <ul className="list-disc ms-5">{g.weight_observations.map((t,i)=><li key={i}>{t}</li>)}</ul>
            </div>}
            {g.packaging_clues && <div className="text-sm">
              <div className="font-semibold">Packaging Clues</div>
              <ul className="list-disc ms-5">{g.packaging_clues.map((t,i)=><li key={i}>{t}</li>)}</ul>
            </div>}
            {g.tips && <div className="text-sm">
              <div className="font-semibold">Tips</div>
              <ul className="list-disc ms-5">{g.tips.map((t,i)=><li key={i}>{t}</li>)}</ul>
            </div>}
            {g.uv_hacks && <div className="text-sm text-sky-200">
              <div className="font-semibold">UV light</div>
              <ul className="list-disc ms-5">{g.uv_hacks.map((t,i)=><li key={i}>{t}</li>)}</ul>
            </div>}
            {g.safety && <div className="text-sm text-amber-200">
              <div className="font-semibold">⚠️ Safety</div>
              <ul className="list-disc ms-5">{g.safety.map((t,i)=><li key={i}>{t}</li>)}</ul>
            </div>}
          </div>
        )
      })}
    </div>
  );
}

function Methods(){
  const {data} = useJSON('data/reagents.json');
  if(!data?.methods) return null;
  const cards = data.methods.cards || [];
  return (
    <div className="space-y-3">
      {data.methods.overview?.note && <Banner tone="warn">{data.methods.overview.note}</Banner>}
      {cards.map(m => (
        <div key={m.id} className="rounded-2xl border border-white/10 p-4 bg-white/5 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{m.name}</h3>
            {m.type && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/15">{m.type}</span>}
          </div>
          {m.do && m.do.length>0 && (<div className="text-sm"><div className="font-semibold">Do</div><ul className="list-disc ms-5">{m.do.map((t,i)=><li key={i}>{t}</li>)}</ul></div>)}
          {m.dont && m.dont.length>0 && (<div className="text-sm text-rose-200"><div className="font-semibold">Avoid</div><ul className="list-disc ms-5">{m.dont.map((t,i)=><li key={i}>{t}</li>)}</ul></div>)}
          {m.services && m.services.length>0 && (<div className="text-sm text-emerald-200"><div className="font-semibold">Services</div><ul className="list-disc ms-5">{m.services.map((t,i)=><li key={i}>{t}</li>)}</ul></div>)}
          {m.notes && m.notes.length>0 && (<div className="text-sm text-sky-200"><div className="font-semibold">Notes</div><ul className="list-disc ms-5">{m.notes.map((t,i)=><li key={i}>{t}</li>)}</ul></div>)}
        </div>
      ))}
    </div>
  );
}

function FirstResponder(){
  const {data} = useJSON('data/reagents.json');
  if(!data?.first_responder) return null;
  const fr = data.first_responder;
  
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-blue-500/50 bg-blue-500/10 p-4">
        <h2 className="text-lg font-bold text-blue-200 mb-2">🚒 {fr.title}</h2>
        <p className="text-sm text-blue-100 mb-2">{fr.overview.description}</p>
        <p className="text-sm text-red-200 font-bold">⚠️ {fr.overview.critical}</p>
      </div>
      
      {fr.scene_safety && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-amber-200">⚠️ {fr.scene_safety.name}</h3>
          
          <div className="space-y-2">
            <div className="font-semibold text-base text-red-200">Primary Hazards</div>
            {fr.scene_safety.primary_hazards.map((h,i)=>(
              <div key={i} className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 space-y-1 text-sm">
                <div className="font-bold text-red-200">{h.hazard}</div>
                <div><span className="font-semibold">Danger:</span> {h.danger}</div>
                <div><span className="font-semibold">Signs:</span> {h.signs}</div>
                <div className="text-emerald-200"><span className="font-semibold">PPE Required:</span> {h.ppe}</div>
              </div>
            ))}
          </div>
          
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2 text-sm">
            <div className="font-semibold">Scene Assessment Steps</div>
            <ol className="list-decimal ms-5 space-y-0.5">{fr.scene_safety.scene_assessment_steps.map((s,i)=><li key={i}>{s}</li>)}</ol>
          </div>
          
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 space-y-2 text-sm">
            <div className="font-semibold text-red-200">If Responder Exposed</div>
            <ul className="list-disc ms-5 space-y-0.5">{fr.scene_safety.if_exposed.map((s,i)=><li key={i}>{s}</li>)}</ul>
          </div>
        </div>
      )}
      
      {fr.patient_assessment && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-emerald-200">🏥 {fr.patient_assessment.name}</h3>
          
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2 text-sm">
            <div className="font-semibold">Vital Signs Focus</div>
            <ul className="list-disc ms-5 space-y-0.5">{fr.patient_assessment.vital_signs_focus.map((v,i)=><li key={i}>{v}</li>)}</ul>
          </div>
          
          <div className="grid md:grid-cols-2 gap-3">
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-3 space-y-2 text-sm">
              <div className="font-semibold text-purple-200">Opioid Overdose Signs</div>
              <ul className="list-disc ms-5 space-y-0.5">{fr.patient_assessment.opioid_overdose_signs.map((s,i)=><li key={i}>{s}</li>)}</ul>
            </div>
            <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-3 space-y-2 text-sm">
              <div className="font-semibold text-orange-200">Stimulant Toxicity Signs</div>
              <ul className="list-disc ms-5 space-y-0.5">{fr.patient_assessment.stimulant_toxicity_signs.map((s,i)=><li key={i}>{s}</li>)}</ul>
            </div>
          </div>
          
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-2">
            <div className="font-bold text-emerald-200">💉 Naloxone Protocol</div>
            <div className="text-sm"><span className="font-semibold">Indication:</span> {fr.patient_assessment.naloxone_protocol.indication}</div>
            <div className="text-sm"><span className="font-semibold">Dosing:</span><ul className="list-disc ms-5 mt-1">{fr.patient_assessment.naloxone_protocol.dosing.map((d,i)=><li key={i}>{d}</li>)}</ul></div>
            <div className="text-sm"><span className="font-semibold text-amber-200">Special Considerations:</span><ul className="list-disc ms-5 mt-1">{fr.patient_assessment.naloxone_protocol.special_considerations.map((c,i)=><li key={i}>{c}</li>)}</ul></div>
            <div className="text-sm text-sky-200">{fr.patient_assessment.naloxone_protocol.public_access}</div>
          </div>
        </div>
      )}
      
      {fr.field_test_kits && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-sky-200">🧪 {fr.field_test_kits.name}</h3>
          <div className="text-sm text-amber-200 italic">{fr.field_test_kits.overview}</div>
          
          {fr.field_test_kits.kits.map((kit,i)=>(
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-sky-200">{kit.name}</div>
                  <div className="text-xs text-gray-400">{kit.manufacturer} • {kit.type}</div>
                </div>
                {kit.public_availability && kit.public_availability.includes('YES') && (
                  <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 whitespace-nowrap">Public Available</span>
                )}
              </div>
              
              <div className="text-sm space-y-1">
                <div><span className="font-semibold">For:</span> {kit.intended_for.join(', ')}</div>
                {Array.isArray(kit.substances_detected) && (
                  <div><span className="font-semibold">Detects:</span> {kit.substances_detected.join(', ')}</div>
                )}
                <div><span className="font-semibold">How it works:</span> {kit.how_it_works}</div>
                <div className="text-emerald-200"><span className="font-semibold">Advantages:</span> {kit.advantages.join(', ')}</div>
                <div className="text-amber-200"><span className="font-semibold">Limitations:</span> {kit.limitations.join(', ')}</div>
                <div><span className="font-semibold">Cost:</span> {kit.cost}</div>
                {kit.url && <a href={kit.url} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline inline-block mt-1">{kit.url}</a>}
                {kit.public_note && <div className="text-sky-300 font-semibold mt-1">ℹ️ {kit.public_note}</div>}
              </div>
            </div>
          ))}
          
          {fr.field_test_kits.public_available_summary && (
            <div className="rounded-xl border-2 border-emerald-500/50 bg-emerald-500/10 p-4 space-y-2">
              <div className="font-bold text-emerald-200">✅ Test Kits Available to Public:</div>
              <ul className="list-disc ms-5 text-sm space-y-1">{fr.field_test_kits.public_available_summary.map((s,i)=><li key={i}>{s}</li>)}</ul>
            </div>
          )}
        </div>
      )}
      
      {fr.post_exposure_protocol && (
        <div className="rounded-2xl border-2 border-red-500/50 bg-red-500/10 p-4 space-y-3">
          <h3 className="font-semibold text-lg text-red-200">⚠️ {fr.post_exposure_protocol.name}</h3>
          <div className="text-sm space-y-2">
            <div><span className="font-semibold">If Exposed:</span><ul className="list-disc ms-5 mt-1 space-y-0.5">{fr.post_exposure_protocol.if_responder_exposed.map((s,i)=><li key={i}>{s}</li>)}</ul></div>
            <div><span className="font-semibold text-amber-200">Symptoms:</span><ul className="list-disc ms-5 mt-1 space-y-0.5">{fr.post_exposure_protocol.symptoms_of_exposure.map((s,i)=><li key={i}>{s}</li>)}</ul></div>
            <div className="text-sky-200 italic"><span className="font-semibold">Important:</span> {fr.post_exposure_protocol.panic_vs_real_exposure}</div>
          </div>
        </div>
      )}
      
      {fr.training_resources && (
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 space-y-3">
          <h3 className="font-semibold text-lg text-blue-200">📚 {fr.training_resources.name}</h3>
          {fr.training_resources.recommended_training.map((t,i)=>(
            <div key={i} className="rounded-lg bg-white/5 border border-white/10 p-3 space-y-1 text-sm">
              <div className="font-bold text-blue-100">{t.topic}</div>
              <div><span className="font-semibold">Provider:</span> {t.provider}</div>
              <div>{t.description}</div>
              <a href={t.url} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline inline-block">{t.url}</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Myths(){
  const {data} = useJSON('data/reagents.json');
  if(!data?.myths_and_misinformation) return null;
  const myths = data.myths_and_misinformation;
  
  const getDangerBadge = (level) => {
    if(level === 'critical') return <span className="px-2 py-0.5 text-xs rounded-full bg-red-600/30 border border-red-500/50 text-red-100">CRITICAL</span>;
    if(level === 'high') return <span className="px-2 py-0.5 text-xs rounded-full bg-orange-600/30 border border-orange-500/50 text-orange-100">HIGH</span>;
    if(level === 'medium') return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-600/30 border border-yellow-500/50 text-yellow-100">MEDIUM</span>;
    if(level === 'low') return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-600/30 border border-blue-500/50 text-blue-100">LOW</span>;
    return null;
  };
  
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-amber-500/50 bg-amber-500/10 p-4">
        <h2 className="text-lg font-bold text-amber-200 mb-2">⚠️ {myths.title}</h2>
        <p className="text-sm text-amber-100">{myths.overview}</p>
      </div>
      
      {myths.categories.map((cat,i)=>(
        <div key={i} className="space-y-3">
          <h3 className="font-semibold text-lg text-sky-200">📌 {cat.category}</h3>
          
          {cat.myths.map((m,j)=>(
            <div key={j} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-red-400 font-bold">❌</span>
                    <h4 className="font-semibold text-red-200">MYTH: {m.myth}</h4>
                  </div>
                </div>
                {getDangerBadge(m.danger_level)}
              </div>
              
              <div className="text-sm space-y-2 pl-6">
                <div>
                  <span className="font-semibold text-gray-300">Reality: </span>
                  <span className="text-gray-200">{m.reality}</span>
                </div>
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3">
                  <span className="text-emerald-400 font-bold">✅ TRUTH: </span>
                  <span className="text-emerald-100">{m.truth}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
      
      <div className="rounded-2xl border-2 border-emerald-500/50 bg-emerald-500/10 p-5 space-y-3">
        <h3 className="text-lg font-bold text-emerald-200">✅ {myths.bottom_line.title}</h3>
        <ul className="list-disc ms-5 space-y-2 text-sm text-emerald-100">
          {myths.bottom_line.points.map((p,i)=><li key={i}>{p}</li>)}
        </ul>
      </div>
    </div>
  );
}

function Welcome(){
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-emerald-500/50 bg-emerald-500/10 p-6">
        <h2 className="text-2xl font-bold text-emerald-200 mb-3">📚 Welcome to Harm Reduction Guide</h2>
        <p className="text-sm text-emerald-100 leading-relaxed">
          This comprehensive guide provides evidence-based information about substance testing, identification, and harm reduction practices. Our goal is to promote safety through education.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 p-5 bg-white/5 space-y-4">
        <h3 className="font-semibold text-lg text-white">🎯 What This App Does</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2"><span className="text-emerald-400">✓</span><span><strong>Substance Testing:</strong> Search substances and see expected reagent test results with color swatches</span></li>
          <li className="flex gap-2"><span className="text-emerald-400">✓</span><span><strong>ID Guide:</strong> Visual identification of different substance forms (pills, crystals, powders)</span></li>
          <li className="flex gap-2"><span className="text-emerald-400">✓</span><span><strong>Testing Methods:</strong> Comprehensive guide to reagent testing, lab testing, and field methods</span></li>
          <li className="flex gap-2"><span className="text-emerald-400">✓</span><span><strong>Myths Debunked:</strong> Correct dangerous misinformation with evidence-based facts</span></li>
          <li className="flex gap-2"><span className="text-emerald-400">✓</span><span><strong>Emergency Info:</strong> Medical treatment protocols and overdose response</span></li>
          <li className="flex gap-2"><span className="text-emerald-400">✓</span><span><strong>Vendor List:</strong> Trusted sources for testing kits and harm reduction supplies</span></li>
          <li className="flex gap-2"><span className="text-emerald-400">✓</span><span><strong>Resources:</strong> Regional pill testing databases and lab analysis services</span></li>
        </ul>
      </div>

      <div className="rounded-2xl border border-white/10 p-5 bg-white/5 space-y-4">
        <h3 className="font-semibold text-lg text-white">📖 How to Use This Guide</h3>
        <ol className="space-y-3 text-sm list-decimal list-inside">
          <li><strong>Search for your substance</strong> in the Substance Testing tab to see expected reagent reactions</li>
          <li><strong>View color swatches</strong> to compare your test results visually</li>
          <li><strong>Check ID Guide</strong> for visual characteristics of different substance forms</li>
          <li><strong>Review testing methods</strong> to learn proper testing procedures</li>
          <li><strong>Read Myths section</strong> to avoid dangerous misinformation</li>
          <li><strong>Keep Emergency info</strong> accessible in case of adverse reactions</li>
          <li><strong>Use Resources tab</strong> to find pill testing results from your region</li>
        </ol>
      </div>

      <div className="rounded-2xl border-2 border-red-500/50 bg-red-500/10 p-5">
        <h3 className="font-semibold text-lg text-red-200 mb-2">⚠️ Important Disclaimers</h3>
        <ul className="space-y-2 text-sm text-red-100">
          <li className="flex gap-2"><span>•</span><span><strong>Educational Only:</strong> This app provides information for harm reduction purposes. It does not encourage illegal drug use.</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Presumptive Testing:</strong> Reagent tests are presumptive identification only. Lab testing (GC/MS) provides definitive results.</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>No Purity Information:</strong> Reagent tests show presence, NOT purity or concentration.</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Medical Emergencies:</strong> Always call emergency services (911) for overdoses or serious reactions.</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Test Every Batch:</strong> Different batches may contain different substances. Always test.</span></li>
        </ul>
      </div>

      <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-5">
        <h3 className="font-semibold text-lg text-sky-200 mb-2">🔬 Testing Best Practices</h3>
        <ul className="space-y-1.5 text-sm text-sky-100">
          <li>• Use multiple reagents for confirmation</li>
          <li>• Test in good lighting conditions</li>
          <li>• Use white ceramic plates or surfaces</li>
          <li>• Test a small sample (tip of a toothpick)</li>
          <li>• Always use fentanyl test strips on opioids and pressed pills</li>
          <li>• Consider lab testing (DrugsData.org, WEDINOS) for definitive results</li>
          <li>• Replace reagents every 6-12 months (they degrade over time)</li>
        </ul>
      </div>

      <div className="rounded-2xl border border-white/10 p-5 bg-white/5">
        <h3 className="font-semibold text-lg text-white mb-2">📱 Offline Access</h3>
        <p className="text-sm text-gray-300 mb-3">
          This is a Progressive Web App (PWA). After your first visit, it works offline! Add it to your home screen for quick access anytime, anywhere.
        </p>
        <PWAInstallButton/>
      </div>
    </div>
  );
}

function PWAInstallButton(){
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  
  useEffect(()=>{
    // Check if already installed
    if(window.matchMedia('(display-mode: standalone)').matches){
      setIsInstalled(true);
      return;
    }
    
    // Listen for the beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    
    // Check if already installed (iOS)
    if(window.navigator.standalone === true){
      setIsInstalled(true);
    }
    
    return ()=> window.removeEventListener('beforeinstallprompt', handler);
  },[]);
  
  const handleInstall = async () => {
    if(!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const {outcome} = await deferredPrompt.userChoice;
    
    if(outcome === 'accepted'){
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
  };
  
  if(isInstalled){
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/20 border border-emerald-400/40">
        <span className="text-emerald-400 text-xl">✓</span>
        <span className="text-sm text-emerald-200 font-medium">App installed! Access it from your home screen.</span>
      </div>
    );
  }
  
  if(!deferredPrompt){
    return (
      <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-400/30">
        <div className="text-sm text-sky-200 space-y-2">
          <p className="font-semibold">💡 How to Install (Manual)</p>
          <ul className="text-xs space-y-1 text-sky-100">
            <li><strong>Chrome/Edge (Desktop):</strong> Click the install icon in the address bar</li>
            <li><strong>Safari (iOS):</strong> Tap Share → Add to Home Screen</li>
            <li><strong>Chrome (Android):</strong> Tap Menu (⋮) → Install App</li>
          </ul>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <button 
        onClick={handleInstall}
        className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-500/20 to-sky-500/20 border border-emerald-400/40 hover:from-emerald-500/30 hover:to-sky-500/30 transition-all duration-200 group"
      >
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl group-hover:scale-110 transition-transform">📥</span>
          <span className="font-semibold text-emerald-200">Install App</span>
        </div>
      </button>
      <div className="text-xs text-gray-400 text-center">
        Works offline • No app store needed • Updates automatically
      </div>
    </div>
  );
}

function Resources(){
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-purple-500/50 bg-purple-500/10 p-5">
        <h2 className="text-xl font-bold text-purple-200 mb-2">🌍 Regional Pill Testing Databases</h2>
        <p className="text-sm text-purple-100">
          These services provide lab analysis results of street drugs submitted from specific regions. Check if substances matching your description have been tested recently.
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🇺🇸</span>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-white">DrugsData.org (USA - Nationwide)</h3>
              <p className="text-sm text-gray-300">Independent lab testing service. Submit samples anonymously for GC/MS analysis. Results published in searchable database. Covers all 50 states.</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <a href="https://drugsdata.org" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-200 hover:bg-purple-500/30 transition">Visit Database</a>
                <a href="https://drugsdata.org/send_sample.php" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/30 transition">Submit Sample</a>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🇬🇧</span>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-white">WEDINOS (Wales & UK)</h3>
              <p className="text-sm text-gray-300">Free drug testing service for Wales. Accepts postal samples from across UK. Published database of results with detailed chemical analysis.</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <a href="https://www.wedinos.org" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-200 hover:bg-purple-500/30 transition">Visit Database</a>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🇪🇸</span>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-white">Energy Control (Spain & International)</h3>
              <p className="text-sm text-gray-300">Spanish harm reduction organization. Offers drug checking services and publishes alerts. International mail-in service available.</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <a href="https://energycontrol-international.org" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-200 hover:bg-purple-500/30 transition">Visit Website</a>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🇨🇭</span>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-white">Saferparty (Switzerland - Zurich)</h3>
              <p className="text-sm text-gray-300">Drug checking and harm reduction in Zurich. Regular on-site testing events. Published database with pill images and lab results.</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <a href="https://www.saferparty.ch" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-200 hover:bg-purple-500/30 transition">Visit Database</a>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🇦🇹</span>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-white">CheckIt! (Austria - Vienna)</h3>
              <p className="text-sm text-gray-300">Drug checking service in Vienna. On-site testing at events and walk-in lab. Results database with pill warnings and alerts.</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <a href="https://checkit.wien" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-200 hover:bg-purple-500/30 transition">Visit Database</a>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🇨🇦</span>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-white">Get Your Drugs Tested (Canada - BC)</h3>
              <p className="text-sm text-gray-300">British Columbia drug checking services. Multiple locations across BC. Results published with alerts for dangerous substances.</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <a href="https://www.getyourdrugstested.com" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-200 hover:bg-purple-500/30 transition">Visit Website</a>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🇳🇱</span>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-white">Drugs Information and Monitoring System (Netherlands)</h3>
              <p className="text-sm text-gray-300">Dutch drug testing network (DIMS). Anonymous testing at multiple locations. Comprehensive database with pill images and analysis.</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <a href="https://www.drugs-test.nl" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-200 hover:bg-purple-500/30 transition">Visit Database</a>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🇫🇷</span>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-white">SINTES (France - Nationwide)</h3>
              <p className="text-sm text-gray-300">French national drug monitoring system. Collects and analyzes samples across France. Published reports and alerts.</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <a href="https://www.ofdt.fr/produits-et-addictions/de-z/sintes/" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-200 hover:bg-purple-500/30 transition">Visit Website</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-amber-500/50 bg-amber-500/10 p-5">
        <h3 className="font-semibold text-lg text-amber-200 mb-2">⚠️ Using Pill Databases</h3>
        <ul className="space-y-2 text-sm text-amber-100">
          <li className="flex gap-2"><span>•</span><span><strong>No Guarantee:</strong> Just because a pill LOOKS the same doesn't mean it contains the same substance</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Regional Variation:</strong> Pill presses and contents vary by location and time</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Always Test:</strong> Use these databases for information, but ALWAYS test your specific pill</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Check Dates:</strong> Recent results more relevant than old ones</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>High-Risk Alerts:</strong> Pay special attention to warnings about dangerous substances</span></li>
        </ul>
      </div>

      {/* Harm Reduction Organizations */}
      <div className="rounded-2xl border-2 border-emerald-500/50 bg-emerald-500/10 p-5 mt-6">
        <h2 className="text-xl font-bold text-emerald-200 mb-2">🤝 Harm Reduction Organizations</h2>
        <p className="text-sm text-emerald-100 mb-4">
          National and international organizations providing education, support, and advocacy for safer substance use.
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <h3 className="font-semibold text-white mb-2">🇺🇸 DanceSafe</h3>
          <p className="text-sm text-gray-300 mb-2">Promotes health and safety within nightlife and electronic music community. Sells testing kits, provides education, on-site services at events.</p>
          <a href="https://dancesafe.org" target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1.5 text-xs rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/30 transition">Visit Website</a>
        </div>

        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <h3 className="font-semibold text-white mb-2">🇺🇸 Harm Reduction Coalition</h3>
          <p className="text-sm text-gray-300 mb-2">National advocacy organization promoting harm reduction. Resources, training, syringe exchange support, overdose prevention.</p>
          <a href="https://harmreduction.org" target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1.5 text-xs rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/30 transition">Visit Website</a>
        </div>

        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <h3 className="font-semibold text-white mb-2">🌍 Erowid</h3>
          <p className="text-sm text-gray-300 mb-2">Comprehensive online library documenting psychoactive substances. Experience reports, dosage information, research, safety guides.</p>
          <a href="https://erowid.org" target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1.5 text-xs rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/30 transition">Visit Website</a>
        </div>

        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <h3 className="font-semibent text-white mb-2">🌍 PsychonautWiki</h3>
          <p className="text-sm text-gray-300 mb-2">Community-driven encyclopedia of psychoactive substances. Detailed pharmacology, effects, dosages, combinations, safety information.</p>
          <a href="https://psychonautwiki.org" target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1.5 text-xs rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/30 transition">Visit Website</a>
        </div>

        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <h3 className="font-semibold text-white mb-2">🇨🇦 TRIP! Project</h3>
          <p className="text-sm text-gray-300 mb-2">Toronto Raves Integrated Project. Harm reduction at events, drug checking, peer support, education for party-goers.</p>
          <a href="https://www.tripproject.ca" target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1.5 text-xs rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/30 transition">Visit Website</a>
        </div>
      </div>

      {/* Crisis Hotlines & Support */}
      <div className="rounded-2xl border-2 border-red-500/50 bg-red-500/10 p-5 mt-6">
        <h2 className="text-xl font-bold text-red-200 mb-2">📞 Crisis Hotlines & Support</h2>
        <p className="text-sm text-red-100 mb-4">
          24/7 helplines for overdose response, mental health crises, substance use support, and harm reduction guidance.
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <h3 className="font-semibold text-white mb-2">🚨 National Poison Control</h3>
          <p className="text-sm text-gray-300 mb-2">24/7 expert assistance for poisonings and overdoses. Medical advice, triage, guidance.</p>
          <div className="flex gap-2 flex-wrap">
            <a href="tel:1-800-222-1222" className="px-3 py-1.5 text-xs rounded-lg bg-red-500/20 border border-red-400/40 text-red-200 hover:bg-red-500/30 transition">📞 1-800-222-1222</a>
            <a href="https://www.poison.org" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs rounded-lg bg-red-500/20 border border-red-400/40 text-red-200 hover:bg-red-500/30 transition">Visit Website</a>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <h3 className="font-semibold text-white mb-2">🆘 SAMHSA National Helpline</h3>
          <p className="text-sm text-gray-300 mb-2">Free, confidential, 24/7 treatment referral and information service for substance use and mental health.</p>
          <div className="flex gap-2 flex-wrap">
            <a href="tel:1-800-662-4357" className="px-3 py-1.5 text-xs rounded-lg bg-red-500/20 border border-red-400/40 text-red-200 hover:bg-red-500/30 transition">📞 1-800-662-HELP (4357)</a>
            <a href="https://www.samhsa.gov/find-help/national-helpline" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs rounded-lg bg-red-500/20 border border-red-400/40 text-red-200 hover:bg-red-500/30 transition">Visit Website</a>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <h3 className="font-semibold text-white mb-2">💬 Crisis Text Line</h3>
          <p className="text-sm text-gray-300 mb-2">Free, 24/7 crisis support via text. Trained counselors for any crisis including substance use.</p>
          <div className="flex gap-2 flex-wrap">
            <span className="px-3 py-1.5 text-xs rounded-lg bg-red-500/20 border border-red-400/40 text-red-200">Text HOME to 741741</span>
            <a href="https://www.crisistextline.org" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs rounded-lg bg-red-500/20 border border-red-400/40 text-red-200 hover:bg-red-500/30 transition">Visit Website</a>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <h3 className="font-semibold text-white mb-2">🇨🇦 Canada Drug Rehab</h3>
          <p className="text-sm text-gray-300 mb-2">Canadian substance use support, referrals, crisis intervention. Bilingual English/French.</p>
          <div className="flex gap-2 flex-wrap">
            <a href="tel:1-877-254-3348" className="px-3 py-1.5 text-xs rounded-lg bg-red-500/20 border border-red-400/40 text-red-200 hover:bg-red-500/30 transition">📞 1-877-254-3348</a>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <h3 className="font-semibold text-white mb-2">🇬🇧 Frank UK</h3>
          <p className="text-sm text-gray-300 mb-2">UK drug advice and support. Confidential information about drugs, their effects, and where to get help.</p>
          <div className="flex gap-2 flex-wrap">
            <a href="tel:0300-123-6600" className="px-3 py-1.5 text-xs rounded-lg bg-red-500/20 border border-red-400/40 text-red-200 hover:bg-red-500/30 transition">📞 0300 123 6600</a>
            <a href="https://www.talktofrank.com" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs rounded-lg bg-red-500/20 border border-red-400/40 text-red-200 hover:bg-red-500/30 transition">Visit Website</a>
          </div>
        </div>
      </div>

      {/* Naloxone & Overdose Prevention */}
      <div className="rounded-2xl border-2 border-blue-500/50 bg-blue-500/10 p-5 mt-6">
        <h2 className="text-xl font-bold text-blue-200 mb-2">💉 Naloxone Distribution & Training</h2>
        <p className="text-sm text-blue-100 mb-4">
          Free naloxone (Narcan) programs and overdose response training. Naloxone reverses opioid overdoses and saves lives.
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <h3 className="font-semibold text-white mb-2">🇺🇸 NEXT Distro</h3>
          <p className="text-sm text-gray-300 mb-2">Mail-order harm reduction supplies. Free naloxone, fentanyl test strips, safer use supplies shipped discreetly.</p>
          <a href="https://nextdistro.org" target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1.5 text-xs rounded-lg bg-blue-500/20 border border-blue-400/40 text-blue-200 hover:bg-blue-500/30 transition">Visit Website</a>
        </div>

        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <h3 className="font-semibold text-white mb-2">🇺🇸 GetNaloxoneNow.org</h3>
          <p className="text-sm text-gray-300 mb-2">Find free naloxone near you. Search by ZIP code for local distribution programs, pharmacies, training events.</p>
          <a href="https://www.getnaloxonenow.org" target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1.5 text-xs rounded-lg bg-blue-500/20 border border-blue-400/40 text-blue-200 hover:bg-blue-500/30 transition">Find Naloxone</a>
        </div>

        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <h3 className="font-semibold text-white mb-2">🇺🇸 Narcan Direct</h3>
          <p className="text-sm text-gray-300 mb-2">Order free Narcan (naloxone nasal spray) by mail. No ID or insurance required. Ships to all 50 states.</p>
          <a href="https://narcandirect.com" target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1.5 text-xs rounded-lg bg-blue-500/20 border border-blue-400/40 text-blue-200 hover:bg-blue-500/30 transition">Order Free Narcan</a>
        </div>

        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <h3 className="font-semibold text-white mb-2">🇨🇦 Take Home Naloxone</h3>
          <p className="text-sm text-gray-300 mb-2">Canadian program providing free naloxone kits and training. Available at pharmacies, community health centers.</p>
          <a href="https://www.canada.ca/en/health-canada/services/opioids/naloxone.html" target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1.5 text-xs rounded-lg bg-blue-500/20 border border-blue-400/40 text-blue-200 hover:bg-blue-500/30 transition">Learn More</a>
        </div>
      </div>

      {/* Mobile Apps */}
      <div className="rounded-2xl border-2 border-cyan-500/50 bg-cyan-500/10 p-5 mt-6">
        <h2 className="text-xl font-bold text-cyan-200 mb-2">📱 Mobile Apps for Harm Reduction</h2>
        <p className="text-sm text-cyan-100 mb-4">
          Apps for drug identification, dosage calculation, interaction checking, and overdose prevention.
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <h3 className="font-semibold text-white mb-2">📱 Canary - Overdose Detection</h3>
          <p className="text-sm text-gray-300 mb-2">Motion-detection app for solo use. Alerts emergency contact if you stop moving. Free, iOS/Android.</p>
          <a href="https://canaryapp.org" target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1.5 text-xs rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/30 transition">Download App</a>
        </div>

        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <h3 className="font-semibold text-white mb-2">📱 KnowYourStuffNZ</h3>
          <p className="text-sm text-gray-300 mb-2">New Zealand drug checking app. Submit photos, get alerts, view test results from community drug checking services.</p>
          <a href="https://knowyourstuff.nz/app/" target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1.5 text-xs rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/30 transition">Learn More</a>
        </div>

        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <h3 className="font-semibold text-white mb-2">📱 Drugs Meter</h3>
          <p className="text-sm text-gray-300 mb-2">Dosage calculator, interaction checker, substance information. Covers 500+ substances with safety profiles.</p>
          <a href="https://drugs-meter.com" target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1.5 text-xs rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/30 transition">Visit Website</a>
        </div>
      </div>

      {/* Research & Education */}
      <div className="rounded-2xl border-2 border-indigo-500/50 bg-indigo-500/10 p-5 mt-6">
        <h2 className="text-xl font-bold text-indigo-200 mb-2">🔬 Research & Educational Resources</h2>
        <p className="text-sm text-indigo-100 mb-4">
          Evidence-based information, academic research, and professional training in harm reduction and drug science.
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <h3 className="font-semibold text-white mb-2">🔬 NIDA (National Institute on Drug Abuse)</h3>
          <p className="text-sm text-gray-300 mb-2">Federal research institute. Evidence-based information on drugs, addiction science, treatment approaches.</p>
          <a href="https://nida.nih.gov" target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1.5 text-xs rounded-lg bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 hover:bg-indigo-500/30 transition">Visit Website</a>
        </div>

        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <h3 className="font-semibold text-white mb-2">🇪🇺 EMCDDA (European Monitoring Centre)</h3>
          <p className="text-sm text-gray-300 mb-2">EU agency for drugs and drug addiction. Data, analysis, alerts on European drug situation.</p>
          <a href="https://www.emcdda.europa.eu" target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1.5 text-xs rounded-lg bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 hover:bg-indigo-500/30 transition">Visit Website</a>
        </div>

        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <h3 className="font-semibold text-white mb-2">🇬🇧 Drug Science UK</h3>
          <p className="text-sm text-gray-300 mb-2">Independent UK research charity. Evidence-based drug policy, safety information, harm reduction research.</p>
          <a href="https://www.drugscience.org.uk" target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1.5 text-xs rounded-lg bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 hover:bg-indigo-500/30 transition">Visit Website</a>
        </div>

        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <h3 className="font-semibold text-white mb-2">📚 The Loop</h3>
          <p className="text-sm text-gray-300 mb-2">UK drug safety testing organization. Multi-agency harm reduction service providing on-site testing at festivals and events.</p>
          <a href="https://wearetheloop.org" target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1.5 text-xs rounded-lg bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 hover:bg-indigo-500/30 transition">Visit Website</a>
        </div>
      </div>
    </div>
  );
}

function Addiction(){
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-teal-500/50 bg-teal-500/10 p-5">
        <h2 className="text-xl font-bold text-teal-200 mb-2">💊 Addiction & Treatment</h2>
        <p className="text-sm text-teal-100">
          Evidence-based information about addiction, recovery, and treatment options. Addiction is a medical condition, not a moral failing. Recovery is possible with proper support and treatment.
        </p>
      </div>

      <div className="rounded-2xl border-2 border-red-500/50 bg-red-500/10 p-5">
        <h3 className="font-semibold text-lg text-red-200 mb-2">🚨 Critical Warnings</h3>
        <ul className="space-y-2 text-sm text-red-100">
          <li className="flex gap-2"><span>⚠️</span><span><strong>Alcohol & Benzodiazepines:</strong> Withdrawal can be FATAL. NEVER quit cold turkey without medical supervision. Seizures can occur 2-5 days after stopping.</span></li>
          <li className="flex gap-2"><span>⚠️</span><span><strong>Opioids:</strong> Tolerance drops rapidly during abstinence. Same dose that was previously tolerated can cause fatal overdose. Start low if relapse occurs.</span></li>
          <li className="flex gap-2"><span>⚠️</span><span><strong>Medical Detox:</strong> Seek professional help for physical dependence. Home detox can be dangerous or fatal for some substances.</span></li>
        </ul>
      </div>

      {/* Opioids */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-orange-200">💉 Opioids (Heroin, Fentanyl, Oxycodone, etc.)</h3>
        
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
          <h4 className="font-semibold text-white">Medication-Assisted Treatment (MAT) - Most Effective</h4>
          <div className="text-sm space-y-2">
            <div>
              <p className="text-emerald-300 font-semibold mb-1">Methadone:</p>
              <p className="text-gray-300">Long-acting opioid agonist. Taken daily at clinic. Prevents withdrawal and cravings. Gold standard for opioid addiction. Reduces overdose risk by 50%+. Allows normal functioning.</p>
            </div>
            <div>
              <p className="text-emerald-300 font-semibold mb-1">Buprenorphine (Suboxone, Subutex):</p>
              <p className="text-gray-300">Partial opioid agonist. Can be prescribed by certified doctors for take-home use. Prevents withdrawal, reduces cravings, ceiling effect makes overdose less likely. Easier to taper than methadone.</p>
            </div>
            <div>
              <p className="text-emerald-300 font-semibold mb-1">Naltrexone (Vivitrol):</p>
              <p className="text-gray-300">Opioid antagonist. Blocks opioid effects. Requires full detox first (7-10 days opioid-free). Monthly injection available. No abuse potential but less effective than methadone/buprenorphine.</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
          <h4 className="font-semibold text-white">Withdrawal Timeline & Management</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• <strong>6-12 hours (short-acting):</strong> Anxiety, sweating, yawning, watery eyes</li>
            <li>• <strong>1-3 days:</strong> Peak symptoms - muscle aches, nausea, vomiting, diarrhea, insomnia</li>
            <li>• <strong>5-7 days:</strong> Physical symptoms subside</li>
            <li>• <strong>Weeks-months:</strong> Post-acute withdrawal - depression, anxiety, cravings</li>
          </ul>
          <p className="text-sm text-amber-200 mt-2">⚠️ Opioid withdrawal is NOT medically dangerous but extremely uncomfortable. Medical support highly recommended.</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h4 className="font-semibold text-white mb-2">Harm Reduction in Recovery</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• MAT is not "trading one drug for another" - it's evidence-based medicine</li>
            <li>• Staying on MAT indefinitely is often more successful than tapering</li>
            <li>• Keep naloxone available - relapse risk is highest early in recovery</li>
            <li>• If you relapse: Start with much lower dose (tolerance drops fast)</li>
            <li>• Fentanyl test strips - street opioids often contain fentanyl</li>
          </ul>
        </div>

        <div className="rounded-xl border-2 border-amber-500/50 bg-amber-500/10 p-4 space-y-3">
          <h4 className="font-semibold text-amber-200 mb-2">🍃 Kratom for Opioid Withdrawal (When MAT Unavailable)</h4>
          <p className="text-sm text-amber-100 mb-2">
            <strong>NOT FDA-approved</strong> but widely used for self-managed withdrawal when methadone/buprenorphine are inaccessible. Contains opioid receptor agonists (mitragynine, 7-hydroxymitragynine).
          </p>

          <div className="bg-red-600/20 border-2 border-red-500/60 rounded p-3 mb-3">
            <p className="text-red-200 font-bold mb-2">🚨 CRITICAL: 7-Hydroxymitragynine (7-OH) Fortified Products</p>
            <div className="text-sm text-red-100 space-y-2">
              <p><strong>EXTREME DANGER:</strong> Many kratom products (especially shots, extracts, tablets, vapes) are now fortified with isolated or synthetic 7-OH. This is NOT natural kratom.</p>
              
              <ul className="space-y-1 ml-4">
                <li>• <strong>13x more potent than morphine</strong> - Much stronger than plain leaf kratom</li>
                <li>• <strong>Rapid addiction:</strong> Physical dependence can develop in days/weeks vs months with plain leaf</li>
                <li>• <strong>Severe withdrawal:</strong> Comparable to prescription opioids, NOT mild like plain kratom</li>
                <li>• <strong>Higher overdose risk:</strong> Respiratory depression documented with high-dose 7-OH</li>
                <li>• <strong>Often unlabeled:</strong> Products don't disclose 7-OH content or claim "enhanced" without specifics</li>
                <li>• <strong>Synthetic versions:</strong> Some contain lab-synthesized 7-OH, not plant-derived</li>
              </ul>
              
              <p className="font-semibold mt-2">⚠️ AVOID THESE PRODUCTS:</p>
              <ul className="space-y-1 ml-4">
                <li>• Kratom "shots" (liquid extracts in small bottles)</li>
                <li>• "Extract" or "Enhanced" products</li>
                <li>• Tablets/capsules labeled "extra strength" or "ultra"</li>
                <li>• Any product with isolated 7-OH listed</li>
                <li>• Gas station brands (highest risk of fortification)</li>
                <li>• Products marketed as "synthetic kratom" or "legal opioid"</li>
              </ul>
              
              <p className="font-semibold mt-2 text-red-200">✅ SAFER OPTION: Plain leaf kratom powder only</p>
              <p>Natural kratom leaf contains ~66% mitragynine and ~2% 7-OH. This balance provides withdrawal relief with lower addiction/overdose risk. Isolated 7-OH products bypass natural safety mechanisms.</p>
              
              <p className="font-semibold mt-2 bg-red-700/30 p-2 rounded">If you're dependent on 7-OH products: DO NOT quit cold turkey. Taper slowly or seek medical help. Withdrawal is severe and dangerous.</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-3">
              <p className="text-emerald-300 font-semibold mb-1">✅ PROS:</p>
              <ul className="text-sm text-emerald-100 space-y-1">
                <li>• <strong>Reduces withdrawal symptoms:</strong> Can ease 60-80% of acute opioid withdrawal discomfort</li>
                <li>• <strong>Legal (most states):</strong> Available at smoke shops, online (banned in 6 states + some counties)</li>
                <li>• <strong>No prescription needed:</strong> Accessible when MAT isn't</li>
                <li>• <strong>Allows functioning:</strong> Can work, drive, care for family (unlike severe withdrawal)</li>
                <li>• <strong>Lower overdose risk:</strong> Ceiling effect on respiratory depression (safer than full opioids)</li>
                <li>• <strong>Easier to taper:</strong> Many successfully taper off kratom after stabilizing</li>
              </ul>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
              <p className="text-red-300 font-semibold mb-1">⚠️ CONS & RISKS:</p>
              <ul className="text-sm text-red-100 space-y-1">
                <li>• <strong>Physical dependence:</strong> Kratom itself is addictive. You're substituting one opioid for another</li>
                <li>• <strong>Withdrawal exists:</strong> Milder than heroin/fentanyl but real (flu-like, irritability, insomnia)</li>
                <li>• <strong>Quality control issues:</strong> No FDA regulation. Contamination with heavy metals, salmonella documented</li>
                <li>• <strong>Liver toxicity:</strong> Rare but serious cases reported. Monitor for jaundice, dark urine</li>
                <li>• <strong>Not complete recovery:</strong> Still physically dependent, not addressing root causes</li>
                <li>• <strong>Drug interactions:</strong> Dangerous with benzos, alcohol, other CNS depressants</li>
                <li>• <strong>Can be difficult to quit:</strong> Some stay on kratom long-term, develop tolerance</li>
              </ul>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3">
              <p className="text-blue-300 font-semibold mb-1">📊 SAFER USE GUIDELINES:</p>
              <ul className="text-sm text-blue-100 space-y-1">
                <li>• <strong>Starting dose:</strong> 2-4g powder, wait 45 min before redosing</li>
                <li>• <strong>Withdrawal management:</strong> 4-8g per dose, 2-4 times daily as needed</li>
                <li>• <strong>Don't exceed:</strong> 15-20g total per day (higher = more dependence)</li>
                <li>• <strong>Strains:</strong> Red vein (most sedating), Green (balanced), White (stimulating)</li>
                <li>• <strong>Stay hydrated:</strong> Kratom is constipating and dehydrating</li>
                <li>• <strong>Buy from tested vendors:</strong> Look for lab testing (avoid gas stations)</li>
                <li>• <strong>⚠️ PLAIN LEAF POWDER ONLY:</strong> NEVER use extracts, shots, or "enhanced" products (see 7-OH warning above). These cause rapid addiction and severe withdrawal.</li>
                <li>• <strong>Plan to taper:</strong> Don't use indefinitely. Once stable, slowly reduce dose</li>
              </ul>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded p-3">
              <p className="text-purple-300 font-semibold mb-1">⏱️ TAPERING OFF KRATOM:</p>
              <ul className="text-sm text-purple-100 space-y-1">
                <li>• <strong>Stabilize first:</strong> Use same dose for 1-2 weeks</li>
                <li>• <strong>Reduce slowly:</strong> 0.5-1g per dose every 3-5 days</li>
                <li>• <strong>Total timeline:</strong> 4-12 weeks depending on dose</li>
                <li>• <strong>Withdrawal symptoms:</strong> Mild compared to traditional opioids (plain leaf only - 7-OH products have severe withdrawal)</li>
                <li>• <strong>Support helps:</strong> r/quittingkratom community</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-amber-500/30 pt-3 mt-3">
            <p className="text-xs text-amber-200">
              <strong>⚠️ IMPORTANT:</strong> Kratom is a harm reduction tool when MAT is unavailable, NOT a first-line treatment. 
              If you can access methadone or buprenorphine, those are medically supervised and more effective long-term. 
              Kratom should be temporary bridge to proper treatment or carefully managed taper tool.
            </p>
          </div>
        </div>
      </div>

      {/* Alcohol */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-yellow-200">🍺 Alcohol</h3>
        
        <div className="rounded-xl border-2 border-red-500/50 bg-red-500/10 p-4">
          <h4 className="font-semibold text-red-200 mb-2">🚨 DANGEROUS WITHDRAWAL - Medical Supervision Required</h4>
          <p className="text-sm text-red-100">Alcohol withdrawal can cause FATAL seizures (delirium tremens). If drinking heavily daily, DO NOT quit without medical help. Hospital or detox facility provides medications to prevent seizures.</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
          <h4 className="font-semibold text-white">Medications for Alcohol Use Disorder</h4>
          <div className="text-sm space-y-2">
            <div>
              <p className="text-emerald-300 font-semibold mb-1">Naltrexone:</p>
              <p className="text-gray-300">Reduces cravings and pleasure from drinking. Can be used while still drinking (Sinclair Method). Oral daily or monthly injection (Vivitrol).</p>
            </div>
            <div>
              <p className="text-emerald-300 font-semibold mb-1">Acamprosate (Campral):</p>
              <p className="text-gray-300">Reduces cravings and post-acute withdrawal symptoms. Taken 3x daily after complete abstinence achieved.</p>
            </div>
            <div>
              <p className="text-emerald-300 font-semibold mb-1">Disulfiram (Antabuse):</p>
              <p className="text-gray-300">Makes you violently ill if you drink. Psychological deterrent. Requires full commitment to abstinence.</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
          <h4 className="font-semibold text-white">Safe Detox Protocol (Medical Setting Only)</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Benzodiazepines (Librium, Ativan) taper prevents seizures</li>
            <li>• Thiamine (vitamin B1) prevents Wernicke-Korsakoff syndrome</li>
            <li>• Monitoring vital signs and symptoms</li>
            <li>• Nutritional support and hydration</li>
            <li>• Timeline: 3-7 days for acute withdrawal, weeks for post-acute</li>
          </ul>
        </div>
      </div>

      {/* Benzodiazepines */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-pink-200">💊 Benzodiazepines (Xanax, Valium, Klonopin)</h3>
        
        <div className="rounded-xl border-2 border-red-500/50 bg-red-500/10 p-4">
          <h4 className="font-semibold text-red-200 mb-2">🚨 DANGEROUS WITHDRAWAL - NEVER Quit Cold Turkey</h4>
          <p className="text-sm text-red-100">Benzodiazepine withdrawal causes seizures that can be fatal. Withdrawal can last weeks to months. ALWAYS taper slowly under medical supervision. Cold turkey quitting can cause death.</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
          <h4 className="font-semibold text-white">Proper Tapering Approach</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Switch to long-acting benzo (diazepam/Valium) if using short-acting</li>
            <li>• Reduce dose by 5-10% every 1-2 weeks (slower for long-term use)</li>
            <li>• Ashton Manual protocol widely recommended</li>
            <li>• Can take 6-18 months for safe taper from high doses</li>
            <li>• Symptoms: anxiety, insomnia, tremors, perceptual changes, seizure risk</li>
            <li>• Protracted withdrawal possible (symptoms lasting months after cessation)</li>
          </ul>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h4 className="font-semibold text-white mb-2">Critical Safety Information</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Find a doctor experienced with benzo tapers (many don't understand severity)</li>
            <li>• Online communities (BenzoBuddies) provide peer support</li>
            <li>• Avoid alcohol and other sedatives during taper</li>
            <li>• Emergency protocol if seizure occurs: Call 911 immediately</li>
            <li>• Long-term use (&gt;6 months) makes withdrawal more severe</li>
          </ul>
        </div>
      </div>

      {/* Stimulants */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-red-200">⚡ Stimulants (Cocaine, Meth, Adderall)</h3>
        
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
          <h4 className="font-semibold text-white">Withdrawal & Recovery</h4>
          <p className="text-sm text-gray-300 mb-2">Stimulant withdrawal is not medically dangerous but causes severe depression, fatigue, and cravings. "Crash" phase can last days to weeks.</p>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• <strong>Crash (1-3 days):</strong> Exhaustion, hypersomnia, increased appetite, depression</li>
            <li>• <strong>Withdrawal (1-4 weeks):</strong> Anhedonia (can't feel pleasure), low energy, irritability, strong cravings</li>
            <li>• <strong>Extinction (weeks-months):</strong> Gradual return to baseline, intermittent cravings</li>
          </ul>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
          <h4 className="font-semibold text-white">Treatment Approaches</h4>
          <div className="text-sm space-y-2">
            <div>
              <p className="text-emerald-300 font-semibold mb-1">No FDA-approved medications (yet):</p>
              <p className="text-gray-300">Research ongoing for meth (bupropion + naltrexone shows promise). Cocaine (no effective medication currently).</p>
            </div>
            <div>
              <p className="text-emerald-300 font-semibold mb-1">Contingency Management:</p>
              <p className="text-gray-300">Most effective behavioral treatment. Rewards (vouchers, prizes) for negative drug tests. Proven to increase abstinence.</p>
            </div>
            <div>
              <p className="text-emerald-300 font-semibold mb-1">Cognitive Behavioral Therapy (CBT):</p>
              <p className="text-gray-300">Identify triggers, develop coping strategies, change thought patterns. Evidence-based for stimulant addiction.</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h4 className="font-semibold text-white mb-2">Harm Reduction Strategies</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Sleep and nutrition crucial during withdrawal (brain healing)</li>
            <li>• Exercise helps restore dopamine function</li>
            <li>• Avoid other stimulants during recovery (caffeine initially OK)</li>
            <li>• Relapse prevention: Identify triggers, avoid people/places/things</li>
            <li>• If using: Test for fentanyl, avoid mixing with opioids, stay hydrated</li>
          </ul>
        </div>
      </div>

      {/* Cannabis */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-green-200">🌿 Cannabis</h3>
        
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
          <h4 className="font-semibold text-white">Cannabis Use Disorder</h4>
          <p className="text-sm text-gray-300 mb-2">~9% of users develop dependence. Higher risk with daily use, high-THC products, early onset use. Withdrawal is real but mild.</p>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• <strong>Withdrawal (3-7 days peak):</strong> Irritability, anxiety, insomnia, decreased appetite, restlessness</li>
            <li>• <strong>Duration:</strong> 1-2 weeks for most symptoms</li>
            <li>• <strong>Treatment:</strong> No medications needed. Behavioral therapy helpful.</li>
            <li>• <strong>Sleep issues:</strong> May persist several weeks (melatonin, good sleep hygiene)</li>
          </ul>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h4 className="font-semibold text-white mb-2">Quitting Successfully</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Gradual reduction often easier than cold turkey</li>
            <li>• Exercise, hobbies to replace use patterns</li>
            <li>• CBD may help with anxiety (but verify no THC if testing)</li>
            <li>• Avoid triggers: friends who use, paraphernalia, routines</li>
            <li>• r/leaves community provides peer support</li>
          </ul>
        </div>
      </div>

      {/* General Treatment Resources */}
      <div className="rounded-2xl border-2 border-indigo-500/50 bg-indigo-500/10 p-5 mt-6">
        <h3 className="text-lg font-bold text-indigo-200 mb-3">🏥 Finding Treatment</h3>
        <div className="space-y-2 text-sm text-indigo-100">
          <div className="flex gap-2">
            <span>📞</span>
            <div>
              <p className="font-semibold">SAMHSA National Helpline: <a href="tel:1-800-662-4357" className="hover:text-indigo-50 underline">1-800-662-4357</a></p>
              <p className="text-indigo-200">Free, confidential, 24/7 treatment referral service</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span>🌐</span>
            <div>
              <p className="font-semibold"><a href="https://findtreatment.gov" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-50 underline">findtreatment.gov</a></p>
              <p className="text-indigo-200">Locate treatment facilities by ZIP code, insurance, services</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span>💊</span>
            <div>
              <p className="font-semibold"><a href="https://www.samhsa.gov/medication-assisted-treatment/practitioner-program-data/treatment-practitioner-locator" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-50 underline">SAMHSA MAT Locator</a></p>
              <p className="text-indigo-200">Find methadone/buprenorphine providers near you</p>
            </div>
          </div>
        </div>
      </div>

      {/* Support Groups */}
      <div className="space-y-3 mt-4">
        <h3 className="font-semibold text-lg text-blue-200">🤝 Support Groups & Communities</h3>
        <p className="text-sm text-gray-300">Multiple paths to recovery - find what works for you. Many programs offer in-person and online meetings.</p>
        
        {/* 12-Step Programs */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
          <h4 className="font-semibold text-white">Traditional 12-Step Programs</h4>
          <div className="text-sm text-gray-300 space-y-2">
            <div>
              <p className="text-cyan-300 font-semibold">Alcoholics Anonymous (AA)</p>
              <p>Oldest and largest recovery fellowship. Spiritual (not religious) program based on 12 steps. Free, worldwide availability. In-person and online meetings.</p>
              <p className="text-cyan-200 text-xs mt-1"><a href="https://www.aa.org" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-100 underline">🌐 aa.org</a> | 📱 Meeting Guide app | <a href="https://aa-intergroup.org" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-100 underline">💬 aa-intergroup.org</a> (online meetings)</p>
            </div>
            <div>
              <p className="text-cyan-300 font-semibold">Narcotics Anonymous (NA)</p>
              <p>12-step program for drug addiction. All substances welcomed. "Just for today" philosophy. Peer support focus.</p>
              <p className="text-cyan-200 text-xs mt-1"><a href="https://na.org" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-100 underline">🌐 na.org</a> | 💬 Virtual NA (online meetings)</p>
            </div>
            <div>
              <p className="text-cyan-300 font-semibold">Cocaine Anonymous (CA)</p>
              <p>12-step program specifically for cocaine and stimulant addiction. Welcomes all substance issues.</p>
              <p className="text-cyan-200 text-xs mt-1"><a href="https://ca.org" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-100 underline">🌐 ca.org</a></p>
            </div>
            <div>
              <p className="text-cyan-300 font-semibold">Al-Anon / Nar-Anon</p>
              <p>Support for family members and loved ones of people with addiction. Helps you cope and set boundaries.</p>
              <p className="text-cyan-200 text-xs mt-1"><a href="https://al-anon.org" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-100 underline">🌐 al-anon.org</a> | <a href="https://nar-anon.org" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-100 underline">nar-anon.org</a></p>
            </div>
          </div>
        </div>

        {/* Christian-Based Programs */}
        <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 space-y-3">
          <h4 className="font-semibold text-white">✝️ Christian-Based Recovery Programs</h4>
          <div className="text-sm text-gray-300 space-y-2">
            <div>
              <p className="text-purple-300 font-semibold">Celebrate Recovery</p>
              <p>Christ-centered 12-step program. Addresses all types of hurts, habits, and hang-ups. Large community, church-based meetings nationwide. Open to everyone.</p>
              <p className="text-purple-200 text-xs mt-1"><a href="https://www.celebraterecovery.com" target="_blank" rel="noopener noreferrer" className="hover:text-purple-100 underline">🌐 celebraterecovery.com</a> | 25,000+ churches worldwide | 💬 Online meetings available</p>
            </div>
            <div>
              <p className="text-purple-300 font-semibold">Teen Challenge</p>
              <p>Faith-based residential program. Long-term (12-15 months). Intensive Christian discipleship approach. Free or low-cost options available.</p>
              <p className="text-purple-200 text-xs mt-1"><a href="https://teenchallenge.org" target="_blank" rel="noopener noreferrer" className="hover:text-purple-100 underline">🌐 teenchallenge.org</a> | 📞 Find local center</p>
            </div>
            <div>
              <p className="text-purple-300 font-semibold">Alcoholics for Christ</p>
              <p>Combines AA principles with Christian faith. Christ-centered recovery focusing on spiritual healing. Meeting directory available.</p>
              <p className="text-purple-200 text-xs mt-1"><a href="https://alcoholicsforchrist.com" target="_blank" rel="noopener noreferrer" className="hover:text-purple-100 underline">🌐 alcoholicsforchrist.com</a></p>
            </div>
            <div>
              <p className="text-purple-300 font-semibold">Reformers Unanimous</p>
              <p>Addiction recovery program through local churches. Bible-based curriculum. Weekly meetings with accountability.</p>
              <p className="text-purple-200 text-xs mt-1"><a href="https://reformu.com" target="_blank" rel="noopener noreferrer" className="hover:text-purple-100 underline">🌐 reformu.com</a></p>
            </div>
            <div>
              <p className="text-purple-300 font-semibold">Setting Captives Free</p>
              <p>Online Christian discipleship courses for various addictions. Self-paced with mentorship. Free courses available.</p>
              <p className="text-purple-200 text-xs mt-1"><a href="https://settingcaptivesfree.com" target="_blank" rel="noopener noreferrer" className="hover:text-purple-100 underline">🌐 settingcaptivesfree.com</a> | 💬 Online mentorship included</p>
            </div>
          </div>
        </div>

        {/* Science-Based / Secular Programs */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
          <h4 className="font-semibold text-white">Science-Based & Secular Programs</h4>
          <div className="text-sm text-gray-300 space-y-2">
            <div>
              <p className="text-emerald-300 font-semibold">SMART Recovery</p>
              <p>Science-based alternative to 12-step. Focuses on self-empowerment, CBT techniques, motivational interviewing. Online and in-person meetings.</p>
              <p className="text-emerald-200 text-xs mt-1"><a href="https://www.smartrecovery.org" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-100 underline">🌐 smartrecovery.org</a> | 💬 Daily online meetings | 📱 SMART Recovery app</p>
            </div>
            <div>
              <p className="text-emerald-300 font-semibold">LifeRing Secular Recovery</p>
              <p>Non-religious, abstinence-based support. "Empower your sober self" approach. Peer-led meetings.</p>
              <p className="text-emerald-200 text-xs mt-1"><a href="https://lifering.org" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-100 underline">🌐 lifering.org</a> | 💬 Online meetings available</p>
            </div>
            <div>
              <p className="text-emerald-300 font-semibold">Women for Sobriety</p>
              <p>Program specifically for women. 13 statements of acceptance. Focuses on emotional and spiritual growth.</p>
              <p className="text-emerald-200 text-xs mt-1"><a href="https://womenforsobriety.org" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-100 underline">🌐 womenforsobriety.org</a></p>
            </div>
          </div>
        </div>

        {/* Alternative Spiritual Programs */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
          <h4 className="font-semibold text-white">Alternative Spiritual Programs</h4>
          <div className="text-sm text-gray-300 space-y-2">
            <div>
              <p className="text-amber-300 font-semibold">Refuge Recovery / Recovery Dharma</p>
              <p>Buddhist-based recovery program. Mindfulness, meditation, and Buddhist philosophy. Non-theistic approach.</p>
              <p className="text-amber-200 text-xs mt-1"><a href="https://recoverydharma.org" target="_blank" rel="noopener noreferrer" className="hover:text-amber-100 underline">🌐 recoverydharma.org</a> (merger of Refuge Recovery)</p>
            </div>
          </div>
        </div>

        {/* Online Communities */}
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 space-y-3">
          <h4 className="font-semibold text-white">💬 Online Communities & Forums</h4>
          <div className="text-sm text-gray-300 space-y-2">
            <p className="font-semibold text-cyan-300">Reddit Recovery Communities (Free, Anonymous, 24/7)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <p className="text-cyan-200">• <strong>r/stopdrinking</strong> - 500k+ members, daily check-ins</p>
                <p className="text-cyan-200">• <strong>r/OpiatesRecovery</strong> - Opioid addiction support</p>
                <p className="text-cyan-200">• <strong>r/redditorsinrecovery</strong> - All substances</p>
                <p className="text-cyan-200">• <strong>r/leaves</strong> - Cannabis addiction (200k+ members)</p>
                <p className="text-cyan-200">• <strong>r/stopsmoking</strong> - Nicotine/tobacco</p>
              </div>
              <div>
                <p className="text-cyan-200">• <strong>r/Stims</strong> - Stimulant recovery resources</p>
                <p className="text-cyan-200">• <strong>r/benzorecovery</strong> - Benzodiazepine tapering</p>
                <p className="text-cyan-200">• <strong>r/quittingkratom</strong> - Kratom dependence</p>
                <p className="text-cyan-200">• <strong>r/alcoholism</strong> - Alcohol support</p>
                <p className="text-cyan-200">• <strong>r/RecoveryWings</strong> - Peer mentorship</p>
              </div>
            </div>
            
            <p className="font-semibold text-cyan-300 mt-3">Other Online Resources</p>
            <div className="space-y-1">
              <p className="text-cyan-200">• <strong>In The Rooms</strong> (<a href="https://intherooms.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-100 underline">intherooms.com</a>) - Free online 12-step meetings, 24/7, all time zones</p>
              <p className="text-cyan-200">• <strong>Sober Grid</strong> (app) - Sober social network, 24/7 peer support</p>
              <p className="text-cyan-200">• <strong>I Am Sober</strong> (app) - Sobriety tracker with community features</p>
              <p className="text-cyan-200">• <strong>Tempest</strong> (<a href="https://jointempest.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-100 underline">jointempest.com</a>) - Online recovery courses and community</p>
              <p className="text-cyan-200">• <strong>She Recovers</strong> (<a href="https://sherecovers.org" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-100 underline">sherecovers.org</a>) - Community for women in recovery</p>
              <p className="text-cyan-200">• <strong>The Phoenix</strong> (<a href="https://thephoenix.org" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-100 underline">thephoenix.org</a>) - Free sober active community (fitness-based)</p>
            </div>
          </div>
        </div>

        {/* Harm Reduction Groups */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
          <h4 className="font-semibold text-white">Harm Reduction Communities</h4>
          <p className="text-sm text-gray-300">Support for people actively using or not ready for abstinence:</p>
          <div className="text-sm text-gray-300 space-y-1">
            <p>• <strong>Moderation Management</strong> (<a href="https://moderation.org" target="_blank" rel="noopener noreferrer" className="hover:text-gray-100 underline">moderation.org</a>) - Controlled drinking support</p>
            <p>• <strong>r/HarmReduction</strong> (Reddit) - Safer use strategies and support</p>
            <p>• <strong>DanceSafe</strong> community forums - Drug checking and safety</p>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 mt-3">
          <p className="text-sm text-blue-100">
            <strong>💡 TIP:</strong> Try multiple groups/programs. What works for one person may not work for another. Many people combine approaches (e.g., MAT + support group, therapy + online community). Recovery is personal - find your path.
          </p>
        </div>
      </div>

      {/* Key Principles */}
      <div className="rounded-2xl border-2 border-emerald-500/50 bg-emerald-500/10 p-5 mt-4">
        <h3 className="text-lg font-bold text-emerald-200 mb-2">✅ Core Recovery Principles</h3>
        <ul className="space-y-2 text-sm text-emerald-100">
          <li>• <strong>Addiction is a disease:</strong> Not a moral failing. Requires medical treatment.</li>
          <li>• <strong>MAT works:</strong> Medication-assisted treatment has highest success rates for opioids.</li>
          <li>• <strong>Harm reduction is valid:</strong> Reducing use/consequences is progress, not failure.</li>
          <li>• <strong>Relapse is common:</strong> Part of recovery for many. Learn and try again.</li>
          <li>• <strong>Multiple paths:</strong> What works for one person may not work for another.</li>
          <li>• <strong>Treat underlying issues:</strong> Mental health, trauma, chronic pain need addressing.</li>
          <li>• <strong>Support matters:</strong> Peer support, therapy, family - don't do it alone.</li>
        </ul>
      </div>
    </div>
  );
}

function App(){
  const [tab,setTab] = useState('welcome');
  const {data} = useJSON('data/reagents.json');
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <header className="space-y-3">
        <h1 className="text-xl md:text-2xl font-bold text-center sm:text-left">Harm Reduction Guide</h1>
        <nav className="flex flex-wrap gap-2 justify-center sm:justify-start">
          <button onClick={()=>setTab('welcome')} className={"px-3 py-2 text-sm font-medium rounded-lg transition "+(tab==='welcome'?'bg-emerald-500/30 border border-emerald-400/60 text-emerald-100':'bg-emerald-500/10 border border-emerald-400/30 text-emerald-200 hover:bg-emerald-500/20')}>📚 Welcome</button>
          <button onClick={()=>setTab('quick')} className={"px-3 py-2 text-sm font-medium rounded-lg transition "+(tab==='quick'?'bg-white/25 border border-white/40 text-white':'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/15')}>🧪 Substance Testing</button>
          <button onClick={()=>setTab('swatches')} className={"px-3 py-2 text-sm font-medium rounded-lg transition "+(tab==='swatches'?'bg-white/25 border border-white/40 text-white':'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/15')}>Swatches</button>
          <button onClick={()=>setTab('id')} className={"px-3 py-2 text-sm font-medium rounded-lg transition "+(tab==='id'?'bg-white/25 border border-white/40 text-white':'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/15')}>ID Guide</button>
          <button onClick={()=>setTab('methods')} className={"px-3 py-2 text-sm font-medium rounded-lg transition "+(tab==='methods'?'bg-white/25 border border-white/40 text-white':'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/15')}>Methods</button>
          <button onClick={()=>setTab('myths')} className={"px-3 py-2 text-sm font-medium rounded-lg transition "+(tab==='myths'?'bg-amber-500/30 border border-amber-400/60 text-amber-100':'bg-amber-500/10 border border-amber-400/30 text-amber-200 hover:bg-amber-500/20')}>❌ Myths</button>
          <button onClick={()=>setTab('addiction')} className={"px-3 py-2 text-sm font-medium rounded-lg transition "+(tab==='addiction'?'bg-teal-500/30 border border-teal-400/60 text-teal-100':'bg-teal-500/10 border border-teal-400/30 text-teal-200 hover:bg-teal-500/20')}>💊 Addiction</button>
          <button onClick={()=>setTab('resources')} className={"px-3 py-2 text-sm font-medium rounded-lg transition "+(tab==='resources'?'bg-purple-500/30 border border-purple-400/60 text-purple-100':'bg-purple-500/10 border border-purple-400/30 text-purple-200 hover:bg-purple-500/20')}>🌍 Resources</button>
          <button onClick={()=>setTab('responder')} className={"px-3 py-2 text-sm font-medium rounded-lg transition "+(tab==='responder'?'bg-blue-500/30 border border-blue-400/60 text-blue-100':'bg-blue-500/10 border border-blue-400/30 text-blue-200 hover:bg-blue-500/20')}>🚒 Responder</button>
          <button onClick={()=>setTab('emergency')} className={"px-3 py-2 text-sm font-medium rounded-lg transition "+(tab==='emergency'?'bg-red-500/30 border border-red-400/60 text-red-100':'bg-red-500/10 border border-red-400/30 text-red-200 hover:bg-red-500/20')}>🚨 Emergency</button>
          <button onClick={()=>setTab('news')} className={"px-3 py-2 text-sm font-medium rounded-lg transition "+(tab==='news'?'bg-cyan-500/30 border border-cyan-400/60 text-cyan-100':'bg-cyan-500/10 border border-cyan-400/30 text-cyan-200 hover:bg-cyan-500/20')}>📰 News</button>
          <button onClick={()=>setTab('vendors')} data-tab="vendors" className={"px-3 py-2 text-sm font-medium rounded-lg transition "+(tab==='vendors'?'bg-white/25 border border-white/40 text-white':'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/15')}>Vendors</button>
        </nav>
      </header>

      <InstallAndUpdateBar/>

      {data?.link_display_rules?.show_warning && <Banner tone="warn">{data.link_display_rules.warning_text}</Banner>}

      {tab==='welcome' && (<section className="space-y-3"><Welcome/></section>)}
      {tab==='quick' && (<section className="space-y-3"><h2 className="text-lg font-semibold">🧪 Substance Testing</h2><QuickTest/></section>)}
      {tab==='swatches' && (<section className="space-y-3"><h2 className="text-lg font-semibold">Reagent Swatches</h2><Swatches/></section>)}
      {tab==='id' && (<section className="space-y-3"><h2 className="text-lg font-semibold">Identification Guide</h2><IDGuide/></section>)}
      {tab==='methods' && (<section className="space-y-3"><h2 className="text-lg font-semibold">Other Methods</h2><Methods/></section>)}
      {tab==='myths' && (<section className="space-y-3"><h2 className="text-lg font-semibold text-amber-200">❌ Common Myths & Misinformation</h2><Myths/></section>)}
      {tab==='addiction' && (<section className="space-y-3"><h2 className="text-lg font-semibold text-teal-200">💊 Addiction & Treatment</h2><Addiction/></section>)}
      {tab==='resources' && (<section className="space-y-3"><h2 className="text-lg font-semibold text-purple-200">🌍 Testing Resources by Region</h2><Resources/></section>)}
      {tab==='responder' && (<section className="space-y-3"><h2 className="text-lg font-semibold text-blue-200">🚒 First Responder Protocols</h2><FirstResponder/></section>)}
      {tab==='emergency' && (<section className="space-y-3"><h2 className="text-lg font-semibold text-red-200">🚨 Emergency Medical Information</h2><MedicalTreatment/></section>)}
      {tab==='news' && (<section className="space-y-3"><h2 className="text-lg font-semibold text-cyan-200">📰 Harm Reduction News & Alerts</h2><News/></section>)}
      {tab==='vendors' && (<section className="space-y-3"><h2 className="text-lg font-semibold">Trusted Vendors</h2><Vendors/></section>)}

      <footer className="py-8 space-y-4">
        <div className="flex flex-wrap justify-center gap-3">
          <button className="px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-sm font-medium hover:bg-emerald-500/30 transition cursor-not-allowed" disabled title="Donate option coming soon">
            💚 Support This Project (Coming Soon)
          </button>
          <a href="https://github.com/CptNope/safety-app-pwa" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-400/40 text-blue-200 text-sm font-medium hover:bg-blue-500/30 transition inline-flex items-center gap-2">
            🐙 Contribute on GitHub
          </a>
        </div>
        <div className="text-xs text-gray-400 text-center space-y-1">
          <div>Built for education and harm reduction by <span className="text-white font-medium">Jeremy Anderson</span></div>
          <div>© {new Date().getFullYear()} • Open source • Community contributions welcome</div>
        </div>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
