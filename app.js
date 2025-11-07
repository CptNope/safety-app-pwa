
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
        <button onClick={doInstall} className="px-3 py-1.5 text-xs rounded-lg bg-emerald-500/20 border border-emerald-400/40 hover:bg-emerald-500/30">Install App</button>
      </div>}>This app can be installed.</Banner>}

      <Banner actions={<div className="flex gap-2">
        <button onClick={checkUpdates} className="px-3 py-1.5 text-xs rounded-lg bg-white/10 border border-white/20 hover:bg-white/15">Check for updates</button>
        {updateReady && <button onClick={applyUpdate} className="px-3 py-1.5 text-xs rounded-lg bg-sky-500/20 border border-sky-400/40 hover:bg-sky-500/30">Update now</button>}
      </div>}>
        PWA updates install silently. Click “Check for updates” to fetch a new version. {updateReady ? "New version ready—click Update now." : ""}
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
  if(!data) return null;
  const s = data.substances[suspect];
  return (
    <div className="rounded-2xl border border-white/10 p-4 bg-white/5 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm">Suspected substance:</label>
        <select value={suspect} onChange={e=>setSuspect(e.target.value)} className="bg-black/30 rounded-lg px-3 py-2 border border-white/10">
          {Object.keys(data.substances).map(k=><option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
    </div>
  );
}

function Swatches(){
  const entries = (name) => Object.entries({
    ...(name==='Simon’s'?{MDMA:'var(--simons-mdma)'}:{}),
    ...(name==='Marquis'?{MDMA:'var(--marquis-mdma)'}:{}),
    ...(name==='Mecke'?{MDMA:'var(--mecke-mdma)'}:{}),
    ...(name==='Mandelin'?{MDMA:'var(--mandelin-mdma)'}:{}),
  }).map(([sub,hex])=>({sub,hex}));
  return (
    <div className="grid gap-3">
      {["Simon’s","Marquis","Mecke","Mandelin"].map(n=>(
        <div key={n} className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <h3 className="font-semibold text-lg mb-1">{n}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {entries(n).map((e,i)=>(
              <div key={i} className="flex items-center justify-between bg-black/20 rounded-xl p-2">
                <span className="text-sm">{e.sub}</span>
                <Chip label={e.hex === '#00000000'?'No Reaction':e.hex} color={e.hex}/>
              </div>
            ))}
          </div>
        </div>
      ))}
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
        <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer" className="block rounded-2xl border border-white/10 p-4 bg-white/5 hover:bg-white/10 transition">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">{v.name}</h3>
              <div className="text-xs opacity-70">Regions: {v.regions.join(', ')}</div>
              <p className="text-sm text-sky-200/80 mt-1">{v.notes}</p>
            </div>
            <span className="px-2 py-1 text-xs rounded-full bg-sky-500/20 border border-sky-400/40">Visit</span>
          </div>
        </a>
      ))}
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
            {g.tips && <div className="text-sm">
              <div className="font-semibold">Tips</div>
              <ul className="list-disc ms-5">{g.tips.map((t,i)=><li key={i}>{t}</li>)}</ul>
            </div>}
            {g.uv_hacks && <div className="text-sm text-sky-200">
              <div className="font-semibold">UV light</div>
              <ul className="list-disc ms-5">{g.uv_hacks.map((t,i)=><li key={i}>{t}</li>)}</ul>
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
          {m.notes && m.notes.length>0 && (<div className="text-sm text-sky-200"><div className="font-semibold">Notes</div><ul className="list-disc ms-5">{m.notes.map((t,i)=><li key={i}>{t}</li>)}</ul></div>)}
        </div>
      ))}
    </div>
  );
}

function App(){
  const [tab,setTab] = useState('quick');
  const {data} = useJSON('data/reagents.json');
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold">Harm Reduction Guide (PWA)</h1>
        <nav className="flex gap-1 text-xs">
          <button onClick={()=>setTab('quick')} className={"px-2 py-1 rounded "+(tab==='quick'?'bg-white/20':'bg-white/5')}>Quick Test</button>
          <button onClick={()=>setTab('swatches')} className={"px-2 py-1 rounded "+(tab==='swatches'?'bg-white/20':'bg-white/5')}>Swatches</button>
          <button onClick={()=>setTab('id')} className={"px-2 py-1 rounded "+(tab==='id'?'bg-white/20':'bg-white/5')}>ID Guide</button>
          <button onClick={()=>setTab('methods')} className={"px-2 py-1 rounded "+(tab==='methods'?'bg-white/20':'bg-white/5')}>Methods</button>
          <button onClick={()=>setTab('vendors')} className={"px-2 py-1 rounded "+(tab==='vendors'?'bg-white/20':'bg-white/5')}>Vendors</button>
        </nav>
      </header>

      <InstallAndUpdateBar/>

      {data?.link_display_rules?.show_warning && <Banner tone="warn">{data.link_display_rules.warning_text}</Banner>}

      {tab==='quick' && (<section className="space-y-3"><h2 className="text-lg font-semibold">Quick Test</h2><QuickTest/></section>)}
      {tab==='swatches' && (<section className="space-y-3"><h2 className="text-lg font-semibold">Reagent Swatches</h2><Swatches/></section>)}
      {tab==='id' && (<section className="space-y-3"><h2 className="text-lg font-semibold">Identification Guide</h2><IDGuide/></section>)}
      {tab==='methods' && (<section className="space-y-3"><h2 className="text-lg font-semibold">Other Methods</h2><Methods/></section>)}
      {tab==='vendors' && (<section className="space-y-3"><h2 className="text-lg font-semibold">Trusted Vendors</h2><Vendors/></section>)}

      <footer className="text-xs opacity-70 py-8">Built for education and harm-reduction. {new Date().getFullYear()}</footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
