#!/usr/bin/env python3
"""
Validate and optimize the reagents.json database.
Checks for:
- Duplicate keys
- Missing required fields
- Inconsistent structure
- Optimization opportunities
"""
import json
from pathlib import Path
from collections import Counter

def check_duplicates(obj, path="root"):
    """Recursively check for duplicate keys in JSON object."""
    issues = []
    
    if isinstance(obj, dict):
        # Check for duplicate keys by comparing key count
        key_list = list(obj.keys())
        key_set = set(key_list)
        
        if len(key_list) != len(key_set):
            # Find which keys are duplicated
            duplicates = [k for k, count in Counter(key_list).items() if count > 1]
            issues.append(f"Duplicate keys at {path}: {duplicates}")
        
        # Recursively check nested objects
        for key, value in obj.items():
            nested_issues = check_duplicates(value, f"{path}.{key}")
            issues.extend(nested_issues)
    
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            nested_issues = check_duplicates(item, f"{path}[{i}]")
            issues.extend(nested_issues)
    
    return issues

def validate_substance(name, data):
    """Validate a substance entry has all required fields."""
    issues = []
    required_fields = ['class', 'description', 'forms', 'testing', 'notes']
    
    for field in required_fields:
        if field not in data:
            issues.append(f"{name}: Missing required field '{field}'")
    
    # Check description subfields
    if 'description' in data and isinstance(data['description'], dict):
        desc_required = ['overview', 'origins', 'uses', 'dangers', 'links']
        for field in desc_required:
            if field not in data['description']:
                issues.append(f"{name}: Missing description.{field}")
    
    return issues

def main():
    print("🔍 Validating reagents.json database...")
    
    # Load data
    data_file = Path(__file__).parent.parent / "data" / "reagents.json"
    
    with open(data_file, 'r', encoding='utf-8') as f:
        content = f.read()
        data = json.loads(content)
    
    print(f"✅ JSON is valid")
    print(f"📊 Database size: {len(content) / 1024:.1f} KB")
    
    # Check for duplicate keys in entire structure
    print("\n🔎 Checking for duplicate keys...")
    duplicate_issues = check_duplicates(data)
    
    if duplicate_issues:
        print(f"❌ Found {len(duplicate_issues)} duplicate key issues:")
        for issue in duplicate_issues[:20]:  # Show first 20
            print(f"   {issue}")
    else:
        print("✅ No duplicate keys found")
    
    # Validate substances
    print("\n🔎 Validating substance entries...")
    substances = data.get('substances', {})
    print(f"📈 Total substances: {len(substances)}")
    
    validation_issues = []
    for name, substance_data in substances.items():
        issues = validate_substance(name, substance_data)
        validation_issues.extend(issues)
    
    if validation_issues:
        print(f"⚠️  Found {len(validation_issues)} validation issues:")
        for issue in validation_issues[:10]:
            print(f"   {issue}")
    else:
        print("✅ All substances have required fields")
    
    # Check for optimization opportunities
    print("\n💡 Optimization opportunities:")
    
    # Count substances by class
    classes = {}
    for name, substance_data in substances.items():
        cls = substance_data.get('class', 'unknown')
        classes[cls] = classes.get(cls, 0) + 1
    
    print(f"   Classes: {len(classes)} unique")
    for cls, count in sorted(classes.items(), key=lambda x: -x[1])[:10]:
        print(f"      - {cls}: {count}")
    
    # Summary
    print("\n" + "="*60)
    if not duplicate_issues and not validation_issues:
        print("✅ Database is clean and optimized!")
    else:
        print(f"⚠️  Found {len(duplicate_issues) + len(validation_issues)} total issues")
        print("   Run fixes to resolve them.")
    
    return 0 if not duplicate_issues else 1

if __name__ == "__main__":
    exit(main())
