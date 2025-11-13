/** @jsx React.createElement */
const {useState, useEffect, useRef} = React;

/**
 * MoleculeViewer Component
 * 
 * Fetches molecular structure data from PubChem API and renders it in 3D
 * using 3Dmol.js library. Displays chemical name, formula, and interactive
 * 3D structure visualization.
 * 
 * Props:
 * - substanceName: Name of the substance to look up
 * - compoundName: Optional override for PubChem search (if common name differs)
 */
function MoleculeViewer({ substanceName, compoundName }) {
  const [moleculeData, setMoleculeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewerReady, setViewerReady] = useState(false);
  const viewerContainerRef = useRef(null);
  const viewerRef = useRef(null);

  // Mapping of common names to PubChem search terms
  const nameMapping = {
    'MDMA': 'Methylenedioxymethamphetamine',
    'MDA': 'Methylenedioxyamphetamine',
    'LSD': 'Lysergic acid diethylamide',
    '2C-B': '2,5-Dimethoxy-4-bromophenethylamine',
    '2C-I': '2,5-Dimethoxy-4-iodophenethylamine',
    '2C-E': '2,5-Dimethoxy-4-ethylphenethylamine',
    'DMT': 'N,N-Dimethyltryptamine',
    '5-MeO-DMT': '5-Methoxy-N,N-dimethyltryptamine',
    'Psilocybin': 'Psilocybin',
    'Psilocin': 'Psilocin',
    'THC': 'Tetrahydrocannabinol',
    'CBD': 'Cannabidiol',
    'Cocaine': 'Cocaine',
    'Heroin': 'Diacetylmorphine',
    'Methamphetamine': 'Methamphetamine',
    'Amphetamine': 'Amphetamine',
    'Ketamine': 'Ketamine',
    'GHB': 'gamma-Hydroxybutyric acid',
    '4-AcO-DMT': '4-Acetoxy-N,N-dimethyltryptamine',
    'Mescaline': 'Mescaline',
    'DXM': 'Dextromethorphan',
    'Fentanyl': 'Fentanyl',
    'Carfentanil': 'Carfentanil',
  };

  // Get the search term
  const searchTerm = compoundName || nameMapping[substanceName] || substanceName;

  useEffect(() => {
    if (!searchTerm) return;
    
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchMoleculeData() {
      try {
        // Step 1: Search PubChem for compound ID
        const searchUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(searchTerm)}/cids/JSON`;
        const searchResponse = await fetch(searchUrl);
        
        if (!searchResponse.ok) {
          throw new Error('Compound not found in PubChem database');
        }
        
        const searchData = await searchResponse.json();
        const cid = searchData.IdentifierList?.CID?.[0];
        
        if (!cid) {
          throw new Error('No compound ID found');
        }

        // Step 2: Fetch compound properties
        const propsUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/MolecularFormula,MolecularWeight,IUPACName/JSON`;
        const propsResponse = await fetch(propsUrl);
        const propsData = await propsResponse.json();

        // Step 3: Fetch 3D structure in SDF format
        const sdfUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/record/SDF`;
        const sdfResponse = await fetch(sdfUrl);
        const sdfData = await sdfResponse.text();

        if (cancelled) return;

        const properties = propsData.PropertyTable?.Properties?.[0];
        
        setMoleculeData({
          cid,
          formula: properties?.MolecularFormula || 'Unknown',
          weight: properties?.MolecularWeight || 'Unknown',
          iupacName: properties?.IUPACName || searchTerm,
          sdf: sdfData
        });
        
        setViewerReady(true);
        
      } catch (err) {
        if (!cancelled) {
          console.error('Molecule fetch error:', err);
          setError(err.message || 'Failed to load molecular structure');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchMoleculeData();

    return () => {
      cancelled = true;
    };
  }, [searchTerm]);

  // Initialize 3Dmol viewer when data is ready
  useEffect(() => {
    if (!viewerReady || !moleculeData || !viewerContainerRef.current) return;
    if (typeof $3Dmol === 'undefined') {
      setError('3Dmol.js library not loaded');
      return;
    }

    try {
      // Clear previous viewer
      viewerContainerRef.current.innerHTML = '';
      
      // Create new viewer
      const config = { 
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        antialias: true,
        cartoonQuality: 10
      };
      
      const viewer = $3Dmol.createViewer(viewerContainerRef.current, config);
      viewerRef.current = viewer;

      // Add molecule from SDF data
      viewer.addModel(moleculeData.sdf, 'sdf');
      
      // Set style: stick and sphere representation
      viewer.setStyle({}, {
        stick: { 
          radius: 0.15,
          colorscheme: 'default'
        },
        sphere: { 
          radius: 0.3,
          colorscheme: 'Jmol'
        }
      });

      // Add surface (semi-transparent)
      viewer.addSurface($3Dmol.SurfaceType.VDW, {
        opacity: 0.7,
        colorscheme: 'whiteCarbon'
      });

      viewer.zoomTo();
      viewer.zoom(1.2);
      viewer.rotate(45, {x: 1, y: 1, z: 0});
      viewer.render();

      // Add rotation animation
      let animationFrame;
      const rotate = () => {
        if (viewer && viewerContainerRef.current) {
          viewer.rotate(1, {x: 0, y: 1, z: 0});
          viewer.render();
          animationFrame = requestAnimationFrame(rotate);
        }
      };
      animationFrame = requestAnimationFrame(rotate);

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
      
    } catch (err) {
      console.error('3Dmol viewer error:', err);
      setError('Failed to render 3D structure');
    }
  }, [viewerReady, moleculeData]);

  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 p-4 bg-gradient-to-br from-blue-900/20 to-purple-900/20">
        <div className="flex items-center justify-center gap-3 py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
          <span className="text-sm text-gray-300">Loading molecular structure...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-yellow-500/30 bg-yellow-900/10 p-4">
        <div className="flex items-start gap-2">
          <span className="text-yellow-400 mt-0.5">ℹ️</span>
          <div className="flex-1 text-sm">
            <div className="font-semibold text-yellow-200 mb-1">Molecular Data Unavailable</div>
            <div className="text-yellow-100/70">{error}</div>
            <div className="text-xs text-yellow-100/50 mt-2">
              Note: Some substances may not be available in the PubChem database or may be listed under different names.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!moleculeData) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-blue-900/20 to-purple-900/20 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-white/5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-blue-200 flex items-center gap-2">
              <span>⚗️</span>
              <span>Molecular Structure</span>
            </h3>
            <div className="text-xs text-gray-400 mt-1">
              Interactive 3D visualization from PubChem database
            </div>
          </div>
          <a 
            href={`https://pubchem.ncbi.nlm.nih.gov/compound/${moleculeData.cid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-300 hover:text-blue-200 underline whitespace-nowrap"
          >
            View on PubChem →
          </a>
        </div>
      </div>

      {/* Molecular Properties */}
      <div className="p-4 bg-black/20 border-b border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <div className="text-xs text-gray-400 uppercase mb-1">Formula</div>
            <div className="font-mono font-semibold text-emerald-300">{moleculeData.formula}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase mb-1">Weight</div>
            <div className="font-mono font-semibold text-blue-300">{moleculeData.weight} g/mol</div>
          </div>
          <div className="sm:col-span-3">
            <div className="text-xs text-gray-400 uppercase mb-1">IUPAC Name</div>
            <div className="text-xs text-gray-200 break-words">{moleculeData.iupacName}</div>
          </div>
        </div>
      </div>

      {/* 3D Viewer */}
      <div className="relative">
        <div 
          ref={viewerContainerRef}
          className="w-full h-80 bg-gradient-to-br from-slate-900 to-slate-950"
          style={{ minHeight: '320px' }}
        />
        
        {/* Controls overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="rounded-lg bg-black/60 backdrop-blur-sm px-3 py-2 border border-white/20">
            <div className="text-xs text-white/90 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span>🖱️</span>
                <span className="font-medium">Drag to rotate</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔍</span>
                <span className="font-medium">Scroll to zoom</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-white/70">
                <span className="text-[10px]">PubChem CID: {moleculeData.cid}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-black/30 border-t border-white/10">
        <div className="text-xs text-gray-400 flex items-start gap-2">
          <span className="text-blue-400 mt-0.5">ℹ️</span>
          <div className="flex-1">
            <strong className="text-gray-300">Visualization Details:</strong> 
            <span className="ml-1">
              Structure data sourced from <a href="https://pubchem.ncbi.nlm.nih.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">PubChem</a>,
              a free chemical database maintained by the NIH. 
              Rendered using <a href="https://3dmol.csb.pitt.edu/" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">3Dmol.js</a>.
              Colors represent different atom types (Jmol color scheme).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export for use in app.js
window.MoleculeViewer = MoleculeViewer;
