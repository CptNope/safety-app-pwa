/**
 * Modular Data Loader for Harm Reduction Guide
 * Supports lazy loading, caching, and backward compatibility
 */

class DataLoader {
  constructor(config = {}) {
    this.mode = config.mode || 'auto'; // 'monolithic', 'modular', or 'auto'
    this.basePath = config.basePath || './data';
    this.cache = new Map();
    this.loading = new Map();
    this.monolithicFile = 'reagents.json';
    this.modularDir = 'modular';
  }

  /**
   * Detect which mode to use (modular if available, fallback to monolithic)
   */
  async detectMode() {
    if (this.mode !== 'auto') return this.mode;
    
    try {
      const indexPath = `${this.basePath}/${this.modularDir}/index.json`;
      const response = await fetch(indexPath);
      if (response.ok) {
        const index = await response.json();
        console.log(`✅ Modular database detected (v${index.version})`);
        return 'modular';
      }
    } catch (e) {
      console.log('ℹ️ Modular database not found, using monolithic mode');
    }
    
    return 'monolithic';
  }

  /**
   * Load a specific module
   */
  async loadModule(moduleName) {
    // Check cache first
    if (this.cache.has(moduleName)) {
      return this.cache.get(moduleName);
    }

    // Check if already loading
    if (this.loading.has(moduleName)) {
      return this.loading.get(moduleName);
    }

    // Start loading
    const loadPromise = this._fetchModule(moduleName);
    this.loading.set(moduleName, loadPromise);

    try {
      const data = await loadPromise;
      this.cache.set(moduleName, data);
      this.loading.delete(moduleName);
      return data;
    } catch (error) {
      this.loading.delete(moduleName);
      throw error;
    }
  }

  /**
   * Fetch module based on current mode
   */
  async _fetchModule(moduleName) {
    const detectedMode = await this.detectMode();
    
    if (detectedMode === 'modular') {
      return this._fetchModular(moduleName);
    } else {
      return this._fetchMonolithic(moduleName);
    }
  }

  /**
   * Fetch from modular structure
   */
  async _fetchModular(moduleName) {
    const path = `${this.basePath}/${this.modularDir}/${moduleName}.json`;
    const response = await fetch(path);
    
    if (!response.ok) {
      throw new Error(`Failed to load module: ${moduleName}`);
    }
    
    return response.json();
  }

  /**
   * Fetch from monolithic file
   */
  async _fetchMonolithic(moduleName) {
    // Load entire monolithic file if not cached
    if (!this.cache.has('_monolithic')) {
      const path = `${this.basePath}/${this.monolithicFile}`;
      const response = await fetch(path);
      
      if (!response.ok) {
        throw new Error('Failed to load monolithic database');
      }
      
      const data = await response.json();
      this.cache.set('_monolithic', data);
    }

    const monolithic = this.cache.get('_monolithic');
    
    // Map module names to monolithic keys
    const keyMap = {
      'reagents': 'reagents',
      'substances': 'substances',
      'id_guide': 'id_guide',
      'methods': 'methods',
      'vendors': 'vendors',
      'first_responder': 'first_responder',
      'counterfeit_pills': 'counterfeit_pills_warning',
      'medical_treatment': 'medical_treatment',
      'myths': 'myths_and_misinformation',
      'config': 'link_display_rules'
    };

    const key = keyMap[moduleName] || moduleName;
    return monolithic[key];
  }

  /**
   * Load multiple modules in parallel
   */
  async loadModules(moduleNames) {
    const promises = moduleNames.map(name => this.loadModule(name));
    return Promise.all(promises);
  }

  /**
   * Load all modules (for full compatibility)
   */
  async loadAll() {
    const modules = [
      'reagents',
      'substances',
      'id_guide',
      'methods',
      'vendors',
      'first_responder',
      'counterfeit_pills',
      'medical_treatment',
      'myths',
      'config'
    ];

    const results = await this.loadModules(modules);
    
    // Return in monolithic-compatible format
    return {
      reagents: results[0],
      substances: results[1],
      id_guide: results[2],
      methods: results[3],
      vendors: results[4],
      first_responder: results[5],
      counterfeit_pills_warning: results[6],
      medical_treatment: results[7],
      myths_and_misinformation: results[8],
      link_display_rules: results[9]
    };
  }

  /**
   * Preload critical modules
   */
  async preloadCritical() {
    const critical = ['reagents', 'substances', 'config'];
    console.log('⚡ Preloading critical modules:', critical);
    await this.loadModules(critical);
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const modules = Array.from(this.cache.keys());
    const totalSize = JSON.stringify(Array.from(this.cache.values())).length;
    
    return {
      cachedModules: modules.length,
      modules: modules,
      approximateSize: `${(totalSize / 1024).toFixed(1)} KB`
    };
  }
}

// Create singleton instance
const dataLoader = new DataLoader();

// React hook for using the data loader
function useModularData(moduleName) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const result = await dataLoader.loadModule(moduleName);
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [moduleName]);

  return { data, loading, error };
}

// Backward-compatible hook (loads all data like original)
function useJSON(path) {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        // Try to load all modules for full compatibility
        const result = await dataLoader.loadAll();
        if (mounted) {
          setData(result);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [path]);

  return { data };
}
