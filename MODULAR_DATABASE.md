# 🗂️ Modular Database Architecture

## Overview

The Harm Reduction Guide now supports a **modular database architecture** for improved scalability, maintainability, and performance. The monolithic 4787-line `reagents.json` file has been split into 10 focused modules.

## 📊 Benefits

### **Performance**
- ⚡ **Lazy loading** - Load only the data you need, when you need it
- 🚀 **Faster initial page load** - Critical modules load first
- 💾 **Reduced memory usage** - Smaller individual files
- 📱 **Better mobile performance** - Optimized for slower connections

### **Scalability**
- 📈 **Easier to grow** - Add new substances without touching other modules
- 🔧 **Simpler maintenance** - Edit one module without affecting others
- 👥 **Team collaboration** - Multiple people can work on different modules
- 🔄 **Version control** - Better Git diffs, clearer change history

### **Developer Experience**
- 🎯 **Focused editing** - Work with 100-line files instead of 4700-line files
- 🐛 **Easier debugging** - Isolate issues to specific modules
- 📝 **Better organization** - Logical separation of concerns
- 🧪 **Easier testing** - Test individual modules independently

## 🏗 Structure

### **Before (Monolithic)**
```
data/
└── reagents.json (249.9 KB, 4787 lines)
```

### **After (Modular)**
```
data/
├── reagents.json (preserved for backward compatibility)
└── modular/
    ├── index.json (0.1 KB) - Module registry
    ├── reagents.json (12.6 KB) - Reagent definitions
    ├── substances.json (107.0 KB) - Substance database
    ├── id_guide.json (12.5 KB) - Identification guides
    ├── methods.json (18.8 KB) - Testing methods
    ├── vendors.json (7.2 KB) - Supplier information
    ├── first_responder.json (15.9 KB) - EMS/LEO protocols
    ├── counterfeit_pills.json (22.3 KB) - Fake pill warnings
    ├── medical_treatment.json (13.4 KB) - Emergency protocols
    ├── myths.json (34.8 KB) - Myth debunking
    └── config.json (0.1 KB) - App configuration
```

**Total modular size:** 244.6 KB (5.3 KB less than monolithic!)

## 🔧 How It Works

### **Automatic Mode Detection**

The `DataLoader` class automatically detects which mode to use:

1. **Checks for modular structure** (`data/modular/index.json`)
2. **Falls back to monolithic** if modular not available
3. **Transparent to the app** - works with both modes

### **Lazy Loading Example**

```javascript
// Load only what you need
const { data: substances } = useModularData('substances');
const { data: reagents } = useModularData('reagents');

// Or load everything (backward compatible)
const { data } = useJSON('data/reagents.json');
```

### **Progressive Loading**

```javascript
// Preload critical modules first
await dataLoader.preloadCritical(); // Loads: reagents, substances, config

// Then load other modules on-demand
const methods = await dataLoader.loadModule('methods');
const myths = await dataLoader.loadModule('myths');
```

## 📦 Module Descriptions

| Module | Size | Lines | Contains |
|--------|------|-------|----------|
| **reagents.json** | 12.6 KB | ~140 | Reagent definitions (Marquis, Mecke, Mandelin, Simon's, Ehrlich, Hofmann) with origins, usage, strengths, weaknesses |
| **substances/** | 162 KB | ~2900 | 42 substance entries split into 6 categories (psychedelics, stimulants, depressants, opioids, dissociatives, other) with index for search |
| **substances/index.json** | 9.3 KB | ~110 | Searchable metadata for all substances (name, class, category, forms) |
| **substances/psychedelics.json** | 73.3 KB | ~1300 | 21 psychedelics (LSD + analogues, psilocybin, DMT, 2C-x, DOx, NBOMes, etc.) |
| **substances/depressants.json** | 25.3 KB | ~460 | 7 depressants (benzodiazepines, GHB, phenibut) |
| **substances/stimulants.json** | 11.3 KB | ~200 | 3 stimulants (cocaine, MDMA, MDA) |
| **substances/opioids.json** | 16.7 KB | ~310 | 4 opioids (heroin, fentanyl, carfentanil, kratom) |
| **substances/dissociatives.json** | 11.1 KB | ~200 | 3 dissociatives (ketamine, PCP, DXM) |
| **substances/other.json** | 15.0 KB | ~270 | 4 other substances (cannabis, nitrous oxide, etc.) |
| **id_guide.json** | 12.5 KB | ~230 | Visual identification guides for 10 form types (blotter, pills, powders, crystals) |
| **methods.json** | 18.8 KB | ~450 | Testing methods (reagent testing, fentanyl strips, UV testing, lab testing) |
| **vendors.json** | 7.2 KB | ~140 | Trusted suppliers by region (USA, EU, International) |
| **first_responder.json** | 15.9 KB | ~320 | EMS/LEO protocols, naloxone administration, field testing |
| **counterfeit_pills.json** | 22.3 KB | ~380 | DEA warnings, visual identification, testing strategies, resources |
| **medical_treatment.json** | 13.4 KB | ~240 | Emergency response, Good Samaritan laws, hospital treatments by drug class |
| **myths.json** | 34.8 KB | ~580 | 60 myths across 10 categories with danger levels and corrections |
| **config.json** | 0.1 KB | ~5 | App configuration and display rules |

## 🚀 Usage

### **For End Users**

Nothing changes! The app automatically uses the best available mode:
- If modular files exist → uses modular (faster)
- If not → falls back to monolithic (still works)

### **For Developers**

#### **Option 1: Use Modular Data (Recommended)**

```javascript
function MyComponent() {
  const { data, loading, error } = useModularData('substances');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{/* Use data */}</div>;
}
```

#### **Option 2: Load Substance Categories**

```javascript
// Load only psychedelics (73 KB vs 162 KB all)
const psychedelics = await dataLoader.loadModule('substances/psychedelics.json');

// Or search via index first (9 KB)
const index = await dataLoader.loadModule('substances/index.json');
const mdmaCategory = index.substances.MDMA.category; // 'stimulants'
const stimulants = await dataLoader.loadModule(`substances/${mdmaCategory}.json`);
```

#### **Option 3: Load Multiple Modules**

```javascript
async function loadData() {
  const [reagents, psychedelics, myths] = await dataLoader.loadModules([
    'reagents',
    'substances/psychedelics',
    'myths'
  ]);
  
  console.log('Loaded:', { reagents, psychedelics, myths });
}
```

#### **Option 4: Backward Compatible (Loads All)**

```javascript
function App() {
  const { data } = useJSON('data/reagents.json');
  
  // data contains all modules in monolithic format
  return <div>{/* Use data */}</div>;
}
```

## 🔄 Migration Guide

### **Splitting the Database**

Run the Python script to regenerate modular files:

```bash
python scripts/split_database.py
```

This will:
1. Read `data/reagents.json`
2. Create `data/modular/` directory
3. Split into 10 module files
4. Generate `index.json` registry
5. Preserve original file

### **Adding New Substances**

**Before (Monolithic):**
```bash
# Edit 4787-line file, risk breaking other sections
vim data/reagents.json
```

**After (Modular):**
```bash
# Edit only the 1900-line substances file
vim data/modular/substances.json

# Or just add to monolithic and re-split
vim data/reagents.json
python scripts/split_database.py
```

## 📈 Performance Comparison

| Metric | Monolithic | Modular | Improvement |
|--------|-----------|---------|-------------|
| **Initial Load** | 299 KB | 12.7 KB (critical only) | **🚀 96% faster** |
| **Memory Usage** | 299 KB | ~50 KB (typical) | **💾 83% less** |
| **View LSD Details** | Loads all 299 KB | Loads psychedelics 73 KB + index 9 KB = 82 KB | **⚡ 73% less data** |
| **Search Substances** | Loads all 299 KB | Loads index only 9 KB | **⚡ 97% less data** |
| **Edit Safety** | High risk | Low risk | **✅ Isolated changes** |
| **Git Conflicts** | Common | Rare | **👥 Better collaboration** |
| **Loading Myths Tab** | Loads all 299 KB | Loads 34.8 KB | **⚡ 88% less data** |

## 🔮 Future Enhancements

### **Phase 1: Dynamic Imports (2026 Q1)**
```javascript
// Code splitting with dynamic imports
const Myths = React.lazy(() => import('./components/Myths'));
const myths = await import('data/modular/myths.json');
```

### **Phase 2: CDN Optimization (2026 Q2)**
```javascript
// Serve modules from CDN
const CDN_BASE = 'https://cdn.example.com/harm-reduction-db/v2/';
const substances = await fetch(`${CDN_BASE}substances.json`);
```

### **Phase 3: Differential Updates (2026 Q3)**
```javascript
// Only download changed modules
const updates = await checkForUpdates();
if (updates.substances) {
  await dataLoader.updateModule('substances');
}
```

### **Phase 4: Compression (2026 Q4)**
```javascript
// Use MessagePack or Protocol Buffers
const substances = await loadCompressed('substances.msgpack');
// 50% smaller than JSON
```

## 🛠️ Maintenance

### **Updating Modular Files**

1. **Edit monolithic file** (`data/reagents.json`)
2. **Run split script**: `python scripts/split_database.py`
3. **Test**: Open app and verify all tabs work
4. **Commit**: Both monolithic and modular files

### **Cache Management**

```javascript
// Clear cache to force reload
dataLoader.clearCache();

// Check cache stats
const stats = dataLoader.getCacheStats();
console.log(stats);
// {
//   cachedModules: 3,
//   modules: ['reagents', 'substances', 'config'],
//   approximateSize: '132.3 KB'
// }
```

## 🔍 Debugging

### **Check Which Mode Is Active**

```javascript
const mode = await dataLoader.detectMode();
console.log('Mode:', mode); // 'modular' or 'monolithic'
```

### **Verify Module Loading**

```javascript
try {
  const substances = await dataLoader.loadModule('substances');
  console.log('✅ Loaded', Object.keys(substances).length, 'substances');
} catch (error) {
  console.error('❌ Failed to load substances:', error);
}
```

### **Test Fallback**

```bash
# Rename modular directory to test fallback
mv data/modular data/modular-backup

# Open app - should use monolithic mode
# Then restore
mv data/modular-backup data/modular
```

## 📝 File Format

### **index.json** (Module Registry)
```json
{
  "version": "2.0.0",
  "modules": [
    "reagents.json",
    "substances.json",
    "..."
  ],
  "description": "Modular database structure for scalability"
}
```

### **Module Files**
Each module is a standalone JSON file containing its section of the original database:

```json
// data/modular/reagents.json
{
  "marquis": { "name": "Marquis", "..." },
  "mecke": { "name": "Mecke", "..." }
}
```

## 🤝 Contributing

When adding new data:

1. **Edit monolithic file** for simplicity
2. **Run split script** to update modular files
3. **Test both modes** work correctly
4. **Commit all files** (monolithic + modular)
5. **Update service worker version**

## 📊 Statistics

- **Original file**: 5471 lines, 299.0 KB
- **Modular files**: 15 modules (10 base + 6 substance categories), 290.1 KB total
- **Largest module**: `substances/psychedelics.json` (73.3 KB) - 21 substances
- **Smallest module**: `config.json` (0.1 KB)
- **Average substance category**: 25.5 KB
- **Substance breakdown**:
  - Psychedelics: 21 (50% of database)
  - Depressants: 7 (17%)
  - Opioids: 4 (10%)
  - Other: 4 (10%)
  - Stimulants: 3 (7%)
  - Dissociatives: 3 (7%)

---

**Questions?** Open an issue on GitHub or check the [main README](README.md) for more information.
