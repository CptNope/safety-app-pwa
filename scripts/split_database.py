#!/usr/bin/env python3
"""
Split monolithic reagents.json into modular files for better scalability.
"""
import json
import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
MODULAR_DIR = DATA_DIR / "modular"
SOURCE_FILE = DATA_DIR / "reagents.json"

def main():
    print("🔧 Splitting monolithic database into modular files...")
    
    # Create modular directory
    MODULAR_DIR.mkdir(exist_ok=True)
    print(f"✅ Created directory: {MODULAR_DIR}")
    
    # Load source data
    print(f"📖 Loading {SOURCE_FILE}...")
    with open(SOURCE_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Define module mappings
    modules = {
        'reagents.json': data.get('reagents', {}),
        'substances.json': data.get('substances', {}),
        'id_guide.json': data.get('id_guide', {}),
        'methods.json': data.get('methods', {}),
        'vendors.json': data.get('vendors', []),
        'first_responder.json': data.get('first_responder', {}),
        'counterfeit_pills.json': data.get('counterfeit_pills_warning', {}),
        'medical_treatment.json': data.get('medical_treatment', {}),
        'myths.json': data.get('myths_and_misinformation', {}),
        'config.json': data.get('link_display_rules', {}),
    }
    
    # Write each module
    for filename, content in modules.items():
        filepath = MODULAR_DIR / filename
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(content, f, indent=2, ensure_ascii=False)
        
        # Calculate size
        size_kb = filepath.stat().st_size / 1024
        print(f"  ✅ {filename:<25} ({size_kb:.1f} KB)")
    
    # Create index file for module discovery
    index = {
        "version": "2.0.0",
        "modules": list(modules.keys()),
        "description": "Modular database structure for scalability"
    }
    
    index_path = MODULAR_DIR / "index.json"
    with open(index_path, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2)
    print(f"  ✅ index.json (module registry)")
    
    # Calculate total savings
    original_size = SOURCE_FILE.stat().st_size / 1024
    modular_total = sum((MODULAR_DIR / f).stat().st_size for f in modules.keys()) / 1024
    
    print(f"\n📊 Statistics:")
    print(f"  Original file: {original_size:.1f} KB")
    print(f"  Modular files: {modular_total:.1f} KB")
    print(f"  Overhead: {modular_total - original_size:.1f} KB")
    print(f"  Number of modules: {len(modules)}")
    
    print(f"\n✅ Database split complete!")
    print(f"   Modular files: {MODULAR_DIR}")
    print(f"   Original file preserved: {SOURCE_FILE}")
    
    return 0

if __name__ == "__main__":
    exit(main())
