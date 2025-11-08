
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
          <div key={reagentId} className="rounded-2xl border border-white/10 p-4 bg-white/5">
            <h3 className="font-semibold text-lg mb-1">{reagentInfo.name}</h3>
            <div className="text-xs opacity-70 mb-2">{reagentInfo.notes}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {reactions.map((r, i) => (
                <div key={i} className="flex items-center justify-between bg-black/20 rounded-xl p-2">
                  <span className="text-sm font-medium">{r.substance}</span>
                  <Chip label={r.alt} color={r.color}/>
                </div>
              ))}
            </div>
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

function App(){
  const [tab,setTab] = useState('quick');
  const {data} = useJSON('data/reagents.json');
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <header className="space-y-3">
        <h1 className="text-xl md:text-2xl font-bold text-center sm:text-left">Harm Reduction Guide</h1>
        <nav className="flex flex-wrap gap-2 justify-center sm:justify-start">
          <button onClick={()=>setTab('quick')} className={"px-3 py-2 text-sm font-medium rounded-lg transition "+(tab==='quick'?'bg-white/25 border border-white/40 text-white':'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/15')}>Quick Test</button>
          <button onClick={()=>setTab('swatches')} className={"px-3 py-2 text-sm font-medium rounded-lg transition "+(tab==='swatches'?'bg-white/25 border border-white/40 text-white':'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/15')}>Swatches</button>
          <button onClick={()=>setTab('id')} className={"px-3 py-2 text-sm font-medium rounded-lg transition "+(tab==='id'?'bg-white/25 border border-white/40 text-white':'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/15')}>ID Guide</button>
          <button onClick={()=>setTab('methods')} className={"px-3 py-2 text-sm font-medium rounded-lg transition "+(tab==='methods'?'bg-white/25 border border-white/40 text-white':'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/15')}>Methods</button>
          <button onClick={()=>setTab('responder')} className={"px-3 py-2 text-sm font-medium rounded-lg transition "+(tab==='responder'?'bg-blue-500/30 border border-blue-400/60 text-blue-100':'bg-blue-500/10 border border-blue-400/30 text-blue-200 hover:bg-blue-500/20')}>🚒 Responder</button>
          <button onClick={()=>setTab('emergency')} className={"px-3 py-2 text-sm font-medium rounded-lg transition "+(tab==='emergency'?'bg-red-500/30 border border-red-400/60 text-red-100':'bg-red-500/10 border border-red-400/30 text-red-200 hover:bg-red-500/20')}>🚨 Emergency</button>
          <button onClick={()=>setTab('vendors')} className={"px-3 py-2 text-sm font-medium rounded-lg transition "+(tab==='vendors'?'bg-white/25 border border-white/40 text-white':'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/15')}>Vendors</button>
        </nav>
      </header>

      <InstallAndUpdateBar/>

      {data?.link_display_rules?.show_warning && <Banner tone="warn">{data.link_display_rules.warning_text}</Banner>}

      {tab==='quick' && (<section className="space-y-3"><h2 className="text-lg font-semibold">Quick Test</h2><QuickTest/></section>)}
      {tab==='swatches' && (<section className="space-y-3"><h2 className="text-lg font-semibold">Reagent Swatches</h2><Swatches/></section>)}
      {tab==='id' && (<section className="space-y-3"><h2 className="text-lg font-semibold">Identification Guide</h2><IDGuide/></section>)}
      {tab==='methods' && (<section className="space-y-3"><h2 className="text-lg font-semibold">Other Methods</h2><Methods/></section>)}
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
