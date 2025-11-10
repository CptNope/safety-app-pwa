#!/usr/bin/env python3
"""
Split substances.json into semantic drug class categories for optimized loading.

This creates a substances/ subdirectory with:
- index.json (metadata for search)
- psychedelics.json
- stimulants.json
- depressants.json
- opioids.json
- dissociatives.json
- other.json
"""

import json
import os
from pathlib import Path
from collections import defaultdict

# Class mappings - map specific classes to broader categories
CLASS_MAPPINGS = {
    'psychedelics': [
        'ergoline (indole)',
        'ergoline (indole, lysergamide)',
        'tryptamine (indole)',
        'phenethylamine (psychedelic)',
        'phenethylamine (psychedelic amphetamine)',
        'phenethylamine (NBOMe series)',
    ],
    'stimulants': [
        'tropane alkaloid',  # Cocaine
        'amphetamine',
        'stimulant',
        'stimulant (pharmaceutical)',
        'phenethylamine (entactogen)',  # MDMA
        'benzofuran (entactogen)',  # 6-APB
        'cathinone',
    ],
    'depressants': [
        'benzodiazepine',
        'thienodiazepine (benzo analogue)',
        'benzodiazepine (designer)',
        'depressant (GHB/GBL)',
        'barbiturate',
        'GABA-B agonist (nootropic)',  # Phenibut
    ],
    'opioids': [
        'opioid',
        'opioid (semi-synthetic)',
        'synthetic opioid',
        'opioid agonist (plant alkaloids)',  # Kratom
    ],
    'dissociatives': [
        'arylcyclohexylamine (dissociative)',  # Ketamine, PCP
        'dissociative (morphinan)',  # DXM
        'dissociative',
    ],
}

def get_category(substance_class):
    """Determine which category a substance belongs to."""
    if not substance_class:
        return 'other'
    
    for category, classes in CLASS_MAPPINGS.items():
        if substance_class in classes:
            return category
    
    return 'other'

def create_substance_index(substances):
    """Create a searchable index with metadata only."""
    index = {
        "version": "2.0.0",
        "description": "Substance metadata index for search and navigation",
        "total_substances": len(substances),
        "substances": {}
    }
    
    for name, data in substances.items():
        category = get_category(data.get('class', ''))
        
        # Extract searchable metadata
        index["substances"][name] = {
            "name": name,
            "class": data.get('class', 'unknown'),
            "category": category,
            "forms": data.get('forms', []),
            "aliases": [],  # Could be extracted from description if available
        }
    
    return index

def split_substances_by_class(input_file, output_dir):
    """Split substances.json into category-based files."""
    
    print(f"📖 Reading {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Handle both formats: top-level dict or nested under 'substances'
    if 'substances' in data and isinstance(data['substances'], dict):
        substances = data['substances']
    else:
        substances = data
    
    print(f"✅ Found {len(substances)} substances")
    
    # Create output directory
    substances_dir = Path(output_dir) / 'substances'
    substances_dir.mkdir(parents=True, exist_ok=True)
    print(f"📁 Created {substances_dir}")
    
    # Group substances by category
    categorized = defaultdict(dict)
    stats = defaultdict(int)
    
    for name, substance_data in substances.items():
        category = get_category(substance_data.get('class', ''))
        categorized[category][name] = substance_data
        stats[category] += 1
    
    # Print statistics
    print("\n📊 Substance distribution:")
    for category, count in sorted(stats.items(), key=lambda x: -x[1]):
        print(f"  {category}: {count} substances")
    
    # Create index
    print("\n📑 Creating index.json...")
    index = create_substance_index(substances)
    index_path = substances_dir / 'index.json'
    with open(index_path, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)
    
    index_size = os.path.getsize(index_path) / 1024
    print(f"✅ Created index.json ({index_size:.1f} KB)")
    
    # Write category files
    print("\n📦 Creating category files...")
    total_size = 0
    
    for category, substances_in_category in sorted(categorized.items()):
        filename = f"{category}.json"
        filepath = substances_dir / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(substances_in_category, f, indent=2, ensure_ascii=False)
        
        file_size = os.path.getsize(filepath) / 1024
        total_size += file_size
        print(f"  ✅ {filename}: {len(substances_in_category)} substances ({file_size:.1f} KB)")
    
    total_size += index_size
    print(f"\n📊 Total size: {total_size:.1f} KB")
    print(f"💾 Files saved to: {substances_dir}")
    
    # Update modular index.json to include substances subdirectory
    update_modular_index(output_dir)
    
    return categorized, stats

def update_modular_index(output_dir):
    """Update the main modular/index.json to reference substance files."""
    index_path = Path(output_dir) / 'index.json'
    
    if index_path.exists():
        with open(index_path, 'r', encoding='utf-8') as f:
            index = json.load(f)
        
        # Remove old substances.json, add new structure
        if 'substances.json' in index.get('modules', []):
            index['modules'].remove('substances.json')
        
        # Add substances directory reference
        if 'substances/' not in index.get('modules', []):
            index['modules'].append('substances/')
        
        index['version'] = '2.1.0'  # Bump version
        index['description'] = 'Modular database with substance categories'
        
        with open(index_path, 'w', encoding='utf-8') as f:
            json.dump(index, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Updated {index_path}")

def main():
    # Paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    input_file = project_root / 'data' / 'modular' / 'substances.json'
    output_dir = project_root / 'data' / 'modular'
    
    print("🚀 Substance Database Optimization")
    print("=" * 50)
    
    if not input_file.exists():
        print(f"❌ Input file not found: {input_file}")
        print("💡 Run split_database.py first to create modular structure")
        return
    
    categorized, stats = split_substances_by_class(input_file, output_dir)
    
    print("\n" + "=" * 50)
    print("✅ Optimization complete!")
    print("\n📝 Next steps:")
    print("  1. Update DataLoader to support category-based loading")
    print("  2. Test the new structure")
    print("  3. Update service worker version")
    print("  4. Delete old substances.json (optional)")

if __name__ == '__main__':
    main()
