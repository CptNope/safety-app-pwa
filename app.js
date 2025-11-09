
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
           substanceLower.includes('morphine') || substanceLower.includes('oxycodone') || substanceLower.includes('codeine')) {
          treatmentKey = 'opioid_overdose';
        } else if(classLower.includes('phenethylamine') || classLower.includes('stimulant') || classLower.includes('cathinone') ||
                  substanceLower.includes('mdma') || substanceLower.includes('cocaine') || substanceLower.includes('meth') ||
                  substanceLower.includes('amphetamine') || substanceLower.includes('cathinone')) {
          treatmentKey = 'stimulant_overdose';
        } else if(classLower.includes('psychedelic') || classLower.includes('tryptamine') || classLower.includes('lysergamide') ||
                  substanceLower.includes('lsd') || substanceLower.includes('psilocybin') || substanceLower.includes('dmt') ||
                  substanceLower.includes('nbome') || substanceLower.includes('2c-') || substanceLower.includes('do')) {
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
        
        // Also match by class (add to existing keywords)
        if(s.class) {
          const classLower = s.class.toLowerCase();
          if(classLower.includes('opioid')) keywords.push('opioid', 'overdose', 'naloxone', 'narcan', 'heroin', 'fentanyl');
          if(classLower.includes('psychedelic') || classLower.includes('tryptamine')) keywords.push('psychedelic', 'trip', 'flashback', 'bad trip');
          if(classLower.includes('stimulant') || classLower.includes('phenethylamine')) keywords.push('stimulant', 'meth', 'cocaine', 'speedball');
          if(classLower.includes('benzo')) keywords.push('benzo', 'benzodiazepine', 'xanax', 'withdrawal', 'fake', 'counterfeit');
          if(classLower.includes('dissociative')) keywords.push('dissociative', 'ketamine', 'k-hole');
          if(classLower.includes('empathogen')) keywords.push('mdma', 'molly', 'ecstasy', 'empathogen');
        }
        
        // Add universal testing/safety keywords for all substances
        keywords.push('test', 'overdose', 'purity', 'adulterant', 'cut');
        
        // Remove duplicates
        keywords = [...new Set(keywords)];
        
        // Search through all myth categories
        if(keywords.length > 0 && data.myths_and_misinformation.categories) {
          data.myths_and_misinformation.categories.forEach(category => {
            if(category.myths) {
              category.myths.forEach(myth => {
                const mythText = (myth.myth + ' ' + myth.reality + ' ' + myth.truth).toLowerCase();
                if(keywords.some(keyword => mythText.includes(keyword))) {
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
              <div className="font-bold text-emerald-100 text-md">{cpw.testing_strategies.critical_first_step.title}</div>
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
          {cpw.resources.resources.map((res,i)=>(
            <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-3 space-y-1 text-sm">
              <div className="font-bold text-emerald-100">{res.name}</div>
              <div>{res.service}</div>
              {res.url && <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-sky-300 hover:text-sky-200 underline">{res.url}</a>}
              {res.phone && <div className="font-semibold text-lg">{res.phone}</div>}
              {res.note && <div className="text-gray-400 italic">{res.note}</div>}
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
              <h4 className="font-semibold text-md text-sky-200">{treatment.name}</h4>
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
            <div className="font-semibold text-md text-red-200">Primary Hazards</div>
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
          <li className="flex gap-2"><span className="text-emerald-400">✓</span><span><strong>Quick Test:</strong> Search substances and see expected reagent test results with color swatches</span></li>
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
          <li><strong>Search for your substance</strong> in the Quick Test tab to see expected reagent reactions</li>
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
          <button onClick={()=>setTab('quick')} className={"px-3 py-2 text-sm font-medium rounded-lg transition "+(tab==='quick'?'bg-white/25 border border-white/40 text-white':'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/15')}>Quick Test</button>
          <button onClick={()=>setTab('swatches')} className={"px-3 py-2 text-sm font-medium rounded-lg transition "+(tab==='swatches'?'bg-white/25 border border-white/40 text-white':'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/15')}>Swatches</button>
          <button onClick={()=>setTab('id')} className={"px-3 py-2 text-sm font-medium rounded-lg transition "+(tab==='id'?'bg-white/25 border border-white/40 text-white':'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/15')}>ID Guide</button>
          <button onClick={()=>setTab('methods')} className={"px-3 py-2 text-sm font-medium rounded-lg transition "+(tab==='methods'?'bg-white/25 border border-white/40 text-white':'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/15')}>Methods</button>
          <button onClick={()=>setTab('myths')} className={"px-3 py-2 text-sm font-medium rounded-lg transition "+(tab==='myths'?'bg-amber-500/30 border border-amber-400/60 text-amber-100':'bg-amber-500/10 border border-amber-400/30 text-amber-200 hover:bg-amber-500/20')}>❌ Myths</button>
          <button onClick={()=>setTab('resources')} className={"px-3 py-2 text-sm font-medium rounded-lg transition "+(tab==='resources'?'bg-purple-500/30 border border-purple-400/60 text-purple-100':'bg-purple-500/10 border border-purple-400/30 text-purple-200 hover:bg-purple-500/20')}>🌍 Resources</button>
          <button onClick={()=>setTab('responder')} className={"px-3 py-2 text-sm font-medium rounded-lg transition "+(tab==='responder'?'bg-blue-500/30 border border-blue-400/60 text-blue-100':'bg-blue-500/10 border border-blue-400/30 text-blue-200 hover:bg-blue-500/20')}>🚒 Responder</button>
          <button onClick={()=>setTab('emergency')} className={"px-3 py-2 text-sm font-medium rounded-lg transition "+(tab==='emergency'?'bg-red-500/30 border border-red-400/60 text-red-100':'bg-red-500/10 border border-red-400/30 text-red-200 hover:bg-red-500/20')}>🚨 Emergency</button>
          <button onClick={()=>setTab('vendors')} data-tab="vendors" className={"px-3 py-2 text-sm font-medium rounded-lg transition "+(tab==='vendors'?'bg-white/25 border border-white/40 text-white':'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/15')}>Vendors</button>
        </nav>
      </header>

      <InstallAndUpdateBar/>

      {data?.link_display_rules?.show_warning && <Banner tone="warn">{data.link_display_rules.warning_text}</Banner>}

      {tab==='welcome' && (<section className="space-y-3"><Welcome/></section>)}
      {tab==='quick' && (<section className="space-y-3"><h2 className="text-lg font-semibold">Quick Test</h2><QuickTest/></section>)}
      {tab==='swatches' && (<section className="space-y-3"><h2 className="text-lg font-semibold">Reagent Swatches</h2><Swatches/></section>)}
      {tab==='id' && (<section className="space-y-3"><h2 className="text-lg font-semibold">Identification Guide</h2><IDGuide/></section>)}
      {tab==='methods' && (<section className="space-y-3"><h2 className="text-lg font-semibold">Other Methods</h2><Methods/></section>)}
      {tab==='myths' && (<section className="space-y-3"><h2 className="text-lg font-semibold text-amber-200">❌ Common Myths & Misinformation</h2><Myths/></section>)}
      {tab==='resources' && (<section className="space-y-3"><h2 className="text-lg font-semibold text-purple-200">🌍 Testing Resources by Region</h2><Resources/></section>)}
      {tab==='responder' && (<section className="space-y-3"><h2 className="text-lg font-semibold text-blue-200">🚒 First Responder Protocols</h2><FirstResponder/></section>)}
      {tab==='emergency' && (<section className="space-y-3"><h2 className="text-lg font-semibold text-red-200">🚨 Emergency Medical Information</h2><MedicalTreatment/></section>)}
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
