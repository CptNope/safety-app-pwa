/** @jsx React.createElement */
const {useState, useEffect} = React;

/**
 * ReagentCalculator Component
 * 
 * Interactive tool that helps identify unknown substances by combining
 * multiple reagent test results. Users select observed colors for each
 * reagent test, and the calculator shows matching substances with
 * confidence scores.
 * 
 * Key Features:
 * - Multi-reagent cross-referencing
 * - Confidence scoring based on number of matching tests
 * - Color-coded results for easy interpretation
 * - Educational warnings about presumptive testing limitations
 */
function ReagentCalculator({ data }) {
  const [selectedTests, setSelectedTests] = useState({});
  const [matches, setMatches] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Available reagents for testing
  const availableReagents = ['marquis', 'mecke', 'mandelin', 'simons', 'ehrlich', 'hofmann'];

  // Get unique color options for each reagent from the database
  const getColorOptionsForReagent = (reagentId) => {
    const colors = new Set();
    
    Object.entries(data.substances).forEach(([substanceName, substanceData]) => {
      if (substanceData.testing) {
        substanceData.testing.forEach(test => {
          if (test.reagent === reagentId) {
            colors.add(JSON.stringify({
              color: test.color,
              alt: test.alt
            }));
          }
        });
      }
    });

    return Array.from(colors).map(c => JSON.parse(c));
  };

  // Handle test selection
  const handleTestSelect = (reagentId, colorData) => {
    setSelectedTests(prev => ({
      ...prev,
      [reagentId]: colorData
    }));
  };

  // Clear a specific test
  const clearTest = (reagentId) => {
    setSelectedTests(prev => {
      const updated = { ...prev };
      delete updated[reagentId];
      return updated;
    });
  };

  // Clear all tests
  const clearAll = () => {
    setSelectedTests({});
    setShowResults(false);
    setMatches([]);
  };

  // Calculate matches when user clicks "Find Matches"
  const calculateMatches = () => {
    if (Object.keys(selectedTests).length === 0) {
      setMatches([]);
      setShowResults(false);
      return;
    }

    const results = [];

    Object.entries(data.substances).forEach(([substanceName, substanceData]) => {
      if (!substanceData.testing) return;

      let matchCount = 0;
      let totalSelectedTests = Object.keys(selectedTests).length;
      let matchedTests = [];
      let unmatchedTests = [];

      // Check each selected test
      Object.entries(selectedTests).forEach(([reagentId, selectedColor]) => {
        const substanceTest = substanceData.testing.find(t => t.reagent === reagentId);
        
        if (substanceTest) {
          // Check if colors match
          if (substanceTest.color === selectedColor.color && 
              substanceTest.alt === selectedColor.alt) {
            matchCount++;
            matchedTests.push({
              reagent: reagentId,
              expected: selectedColor.alt,
              color: selectedColor.color
            });
          } else {
            unmatchedTests.push({
              reagent: reagentId,
              observed: selectedColor.alt,
              expected: substanceTest.alt,
              expectedColor: substanceTest.color
            });
          }
        }
      });

      // Only include substances that match at least one test
      if (matchCount > 0) {
        const confidence = (matchCount / totalSelectedTests) * 100;
        results.push({
          name: substanceName,
          class: substanceData.class,
          matchCount,
          totalTests: totalSelectedTests,
          confidence,
          matchedTests,
          unmatchedTests,
          allTests: substanceData.testing
        });
      }
    });

    // Sort by confidence (highest first), then by match count
    results.sort((a, b) => {
      if (b.confidence !== a.confidence) {
        return b.confidence - a.confidence;
      }
      return b.matchCount - a.matchCount;
    });

    setMatches(results);
    setShowResults(true);
  };

  // Get confidence badge styling
  const getConfidenceBadge = (confidence) => {
    if (confidence === 100) {
      return { bg: 'bg-emerald-500/20', border: 'border-emerald-400/40', text: 'text-emerald-200', label: 'Perfect Match' };
    } else if (confidence >= 75) {
      return { bg: 'bg-green-500/20', border: 'border-green-400/40', text: 'text-green-200', label: 'Strong Match' };
    } else if (confidence >= 50) {
      return { bg: 'bg-yellow-500/20', border: 'border-yellow-400/40', text: 'text-yellow-200', label: 'Partial Match' };
    } else {
      return { bg: 'bg-orange-500/20', border: 'border-orange-400/40', text: 'text-orange-200', label: 'Weak Match' };
    }
  };

  const testsSelected = Object.keys(selectedTests).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-purple-400/30 bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-lg font-bold text-purple-200 flex items-center gap-2">
              <span>🧪</span>
              <span>Reagent Test Calculator</span>
            </h3>
            <p className="text-sm text-gray-300 mt-1">
              Narrow down substance identity by combining multiple reagent test results
            </p>
          </div>
          {testsSelected > 0 && (
            <button
              onClick={clearAll}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-400/40 text-red-200 hover:bg-red-500/30 transition"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Important Warning */}
        <div className="rounded-lg bg-amber-500/10 border border-amber-400/30 p-3">
          <div className="flex items-start gap-2">
            <span className="text-amber-400 text-lg">⚠️</span>
            <div className="flex-1 text-xs text-amber-100 space-y-1">
              <p className="font-semibold text-amber-200">Critical Limitations:</p>
              <ul className="list-disc ml-4 space-y-0.5">
                <li>Reagent tests are <strong>presumptive only</strong> - never definitive</li>
                <li>Multiple substances can produce identical color reactions</li>
                <li>Adulterants and cutting agents can alter results</li>
                <li>Always use multiple reagents for better accuracy</li>
                <li>Lab testing (GC/MS, FTIR) is the only definitive identification method</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Test Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {availableReagents.map(reagentId => {
          const reagent = data.reagents[reagentId];
          if (!reagent) return null;

          const colorOptions = getColorOptionsForReagent(reagentId);
          const isSelected = selectedTests[reagentId];

          return (
            <div key={reagentId} className={`rounded-xl border p-3 transition ${
              isSelected 
                ? 'bg-blue-500/10 border-blue-400/40' 
                : 'bg-white/5 border-white/10'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-sm">{reagent.name}</div>
                {isSelected && (
                  <button
                    onClick={() => clearTest(reagentId)}
                    className="text-xs text-red-300 hover:text-red-200 underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              
              <div className="text-xs text-gray-400 mb-2">{reagent.notes}</div>
              
              <select
                value={isSelected ? JSON.stringify(isSelected) : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    handleTestSelect(reagentId, JSON.parse(e.target.value));
                  }
                }}
                className="w-full bg-black/40 text-white rounded-lg px-2 py-1.5 text-xs border border-white/20 focus:border-white/40 focus:outline-none"
              >
                <option value="">Select observed color...</option>
                {colorOptions.map((option, idx) => (
                  <option key={idx} value={JSON.stringify(option)}>
                    {option.alt}
                  </option>
                ))}
              </select>

              {isSelected && (
                <div className="mt-2 flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded border-2 border-white/30"
                    style={{ backgroundColor: isSelected.color }}
                    title={isSelected.alt}
                  />
                  <span className="text-xs text-gray-300">{isSelected.alt}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Calculate Button */}
      {testsSelected > 0 && (
        <div className="flex items-center justify-center">
          <button
            onClick={calculateMatches}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold shadow-lg transition transform hover:scale-105"
          >
            🔍 Find Matches ({testsSelected} test{testsSelected > 1 ? 's' : ''} selected)
          </button>
        </div>
      )}

      {/* Results */}
      {showResults && (
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="mb-3">
            <h4 className="font-bold text-white mb-1">
              Results: {matches.length} possible match{matches.length !== 1 ? 'es' : ''} found
            </h4>
            <p className="text-xs text-gray-400">
              Ordered by confidence. Perfect matches (100%) mean all selected tests match.
            </p>
          </div>

          {matches.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm mb-2">❌ No matches found</p>
              <p className="text-xs">
                The selected color combinations don't match any substances in the database.
                This could indicate an unknown substance, adulterant, or testing error.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.slice(0, 10).map((match, idx) => {
                const badge = getConfidenceBadge(match.confidence);
                
                return (
                  <div key={idx} className={`rounded-lg border ${badge.border} ${badge.bg} p-3`}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <div className="font-bold text-white">{match.name}</div>
                        <div className="text-xs text-gray-300">{match.class}</div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded border ${badge.border} ${badge.text} font-semibold whitespace-nowrap`}>
                        {Math.round(match.confidence)}% ({match.matchCount}/{match.totalTests})
                      </div>
                    </div>

                    {/* Matched Tests */}
                    {match.matchedTests.length > 0 && (
                      <div className="mb-2">
                        <div className="text-xs font-semibold text-emerald-200 mb-1">
                          ✓ Matched Tests:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {match.matchedTests.map((test, i) => (
                            <div key={i} className="flex items-center gap-1 text-xs bg-emerald-500/20 border border-emerald-400/40 rounded px-2 py-0.5">
                              <span className="font-semibold">{data.reagents[test.reagent].name}:</span>
                              <div 
                                className="w-3 h-3 rounded border border-white/40"
                                style={{ backgroundColor: test.color }}
                              />
                              <span className="text-emerald-100">{test.expected}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Unmatched Tests */}
                    {match.unmatchedTests.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-red-200 mb-1">
                          ✗ Conflicting Tests:
                        </div>
                        <div className="space-y-1">
                          {match.unmatchedTests.map((test, i) => (
                            <div key={i} className="text-xs bg-red-500/10 border border-red-400/30 rounded px-2 py-1">
                              <span className="font-semibold text-red-200">{data.reagents[test.reagent].name}:</span>
                              <span className="text-red-100 ml-1">
                                Expected <strong>{test.expected}</strong> but you observed <strong>{test.observed}</strong>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {matches.length > 10 && (
                <div className="text-center text-xs text-gray-400 pt-2 border-t border-white/10">
                  Showing top 10 matches. {matches.length - 10} more substances partially match.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Educational Footer */}
      <div className="rounded-lg border border-blue-400/30 bg-blue-900/10 p-3">
        <div className="text-xs text-blue-100 space-y-2">
          <p className="font-semibold text-blue-200">💡 Best Practices for Accurate Results:</p>
          <ul className="list-disc ml-4 space-y-1">
            <li>Use at least <strong>3 different reagents</strong> for reliable identification</li>
            <li>Test in good lighting conditions - color interpretation is subjective</li>
            <li>Use a white ceramic surface for clearest color observation</li>
            <li>Observe reactions at the correct time window (varies by reagent)</li>
            <li>For blotter/LSD: <strong>Always use Ehrlich</strong> to rule out dangerous NBOMes</li>
            <li>For MDMA: <strong>Always use Simon's</strong> to distinguish from methamphetamine</li>
            <li>When in doubt, send a sample for lab testing (GC/MS, FTIR)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Export for use in app.js
window.ReagentCalculator = ReagentCalculator;
