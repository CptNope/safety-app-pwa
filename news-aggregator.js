/**
 * News Aggregator for Harm Reduction Guide
 * Fetches news from RSS feeds and public APIs
 */

class NewsAggregator {
  constructor(config = {}) {
    this.sources = config.sources || this.getDefaultSources();
    this.cache = new Map();
    this.cacheExpiry = config.cacheExpiry || 3600000; // 1 hour
    this.corsProxy = config.corsProxy || 'https://api.allorigins.win/raw?url=';
  }

  /**
   * Default news sources (RSS feeds and APIs)
   */
  getDefaultSources() {
    return {
      // Public Health & Drug Checking
      drugsdata: {
        type: 'api',
        name: 'DrugsData.org',
        url: 'https://www.drugsdata.org/rss.xml',
        category: 'Lab Results',
        parser: 'drugsdata'
      },
      
      // FDA Drug Alerts
      fda_recalls: {
        type: 'rss',
        name: 'FDA Drug Recalls',
        url: 'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/drug-recalls/rss.xml',
        category: 'Safety Alerts',
        parser: 'fda'
      },

      // Harm Reduction Organizations
      dancesafe: {
        type: 'rss',
        name: 'DanceSafe',
        url: 'https://dancesafe.org/feed/',
        category: 'Community News',
        parser: 'wordpress'
      },

      erowid: {
        type: 'rss',
        name: 'Erowid News',
        url: 'https://www.erowid.org/general/about/about_rss.xml',
        category: 'Research',
        parser: 'generic'
      },

      // Drug Policy Alliance
      dpa: {
        type: 'rss',
        name: 'Drug Policy Alliance',
        url: 'https://drugpolicy.org/rss.xml',
        category: 'Policy Update',
        parser: 'wordpress'
      },

      // NIDA Research
      nida: {
        type: 'rss',
        name: 'NIDA Research Updates',
        url: 'https://nida.nih.gov/rss/research-updates.xml',
        category: 'Research',
        parser: 'generic'
      },

      // Local fallback (manual entries from database)
      local: {
        type: 'local',
        name: 'Manual Updates',
        category: 'All',
        parser: 'local'
      }
    };
  }

  /**
   * Fetch news from all sources
   */
  async fetchAllNews(options = {}) {
    const { maxAge = this.cacheExpiry, forceRefresh = false } = options;
    
    // Check cache first
    if (!forceRefresh && this.isCacheValid('all', maxAge)) {
      return this.cache.get('all');
    }

    const results = await Promise.allSettled(
      Object.entries(this.sources).map(([key, source]) => 
        this.fetchSource(key, source)
      )
    );

    // Combine and sort all articles
    const allArticles = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value || [])
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Cache results
    this.cache.set('all', {
      articles: allArticles,
      timestamp: Date.now(),
      sources: results.map((r, i) => ({
        name: Object.keys(this.sources)[i],
        status: r.status,
        count: r.status === 'fulfilled' ? r.value?.length : 0
      }))
    });

    return this.cache.get('all');
  }

  /**
   * Fetch from a specific source
   */
  async fetchSource(key, source) {
    try {
      switch (source.type) {
        case 'rss':
          return await this.fetchRSS(source);
        case 'api':
          return await this.fetchAPI(source);
        case 'local':
          return await this.fetchLocal();
        default:
          console.warn(`Unknown source type: ${source.type}`);
          return [];
      }
    } catch (error) {
      console.error(`Error fetching ${key}:`, error);
      return [];
    }
  }

  /**
   * Fetch and parse RSS feed
   */
  async fetchRSS(source) {
    const url = `${this.corsProxy}${encodeURIComponent(source.url)}`;
    const response = await fetch(url);
    const text = await response.text();
    
    // Parse XML
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');
    
    // Check for parse errors
    if (xml.querySelector('parsererror')) {
      throw new Error('Failed to parse RSS feed');
    }

    // Extract items
    const items = Array.from(xml.querySelectorAll('item'));
    
    return items.map(item => {
      const title = item.querySelector('title')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';
      const description = item.querySelector('description')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || '';
      const category = item.querySelector('category')?.textContent || source.category;

      return {
        date: this.parseDate(pubDate),
        category: this.mapCategory(category),
        priority: 'normal',
        title: this.cleanHTML(title),
        summary: this.cleanHTML(description).substring(0, 300) + '...',
        source: source.name,
        source_url: link,
        feed_source: source.name
      };
    });
  }

  /**
   * Fetch from API endpoints
   */
  async fetchAPI(source) {
    if (source.parser === 'drugsdata') {
      return await this.fetchDrugsData(source);
    }
    
    return [];
  }

  /**
   * Fetch DrugsData lab results
   */
  async fetchDrugsData(source) {
    try {
      const url = `${this.corsProxy}${encodeURIComponent(source.url)}`;
      const response = await fetch(url);
      const text = await response.text();
      
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');
      
      const items = Array.from(xml.querySelectorAll('item'));
      
      return items.slice(0, 10).map(item => {
        const title = item.querySelector('title')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '';
        const description = item.querySelector('description')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || '';

        // Parse DrugsData results for priority
        let priority = 'normal';
        const lowerTitle = title.toLowerCase();
        const lowerDesc = description.toLowerCase();
        
        if (lowerTitle.includes('fentanyl') || lowerDesc.includes('fentanyl')) {
          priority = 'critical';
        } else if (lowerTitle.includes('unexpected') || lowerDesc.includes('not detected')) {
          priority = 'high';
        }

        return {
          date: this.parseDate(pubDate),
          category: 'Lab Results',
          priority: priority,
          title: this.cleanHTML(title),
          summary: this.cleanHTML(description),
          source: 'DrugsData.org',
          source_url: link,
          details: this.parseDrugsDataDetails(description),
          feed_source: 'DrugsData API'
        };
      });
    } catch (error) {
      console.error('DrugsData fetch error:', error);
      return [];
    }
  }

  /**
   * Fetch local (manual) news from database
   */
  async fetchLocal() {
    // This will be loaded from reagents.json
    const { data } = await dataLoader.loadModule('news');
    return data?.articles || [];
  }

  /**
   * Parse DrugsData description for details
   */
  parseDrugsDataDetails(description) {
    const cleaned = this.cleanHTML(description);
    const parts = cleaned.split(/[.!]/).filter(p => p.trim().length > 10);
    return parts.slice(0, 5);
  }

  /**
   * Map category names to standard format
   */
  mapCategory(category) {
    const mappings = {
      'drug recall': 'Safety Alerts',
      'alert': 'Contamination Alert',
      'research': 'Research',
      'policy': 'Policy Update',
      'news': 'Community News',
      'lab': 'Lab Results'
    };

    const lower = category.toLowerCase();
    for (const [key, value] of Object.entries(mappings)) {
      if (lower.includes(key)) return value;
    }

    return category || 'Community News';
  }

  /**
   * Parse various date formats
   */
  parseDate(dateString) {
    if (!dateString) return new Date().toISOString().split('T')[0];
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    
    return date.toISOString().split('T')[0];
  }

  /**
   * Clean HTML from RSS feed descriptions
   */
  cleanHTML(html) {
    if (!html) return '';
    
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  }

  /**
   * Check if cache is still valid
   */
  isCacheValid(key, maxAge) {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    const age = Date.now() - cached.timestamp;
    return age < maxAge;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const cached = this.cache.get('all');
    if (!cached) return null;

    return {
      totalArticles: cached.articles?.length || 0,
      sources: cached.sources,
      lastUpdate: new Date(cached.timestamp).toLocaleString(),
      cacheAge: Math.round((Date.now() - cached.timestamp) / 1000) + 's'
    };
  }
}

// Create singleton instance
const newsAggregator = new NewsAggregator();

// React hook for using aggregated news
function useAggregatedNews(options = {}) {
  const { enabled = true } = options;
  const [news, setNews] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [lastUpdate, setLastUpdate] = React.useState(null);

  React.useEffect(() => {
    // Don't fetch if disabled
    if (!enabled) {
      setNews(null);
      setLoading(false);
      setError(null);
      return;
    }

    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const result = await newsAggregator.fetchAllNews(options);
        
        if (mounted) {
          setNews(result.articles || []);
          setLastUpdate(new Date(result.timestamp));
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
          console.error('News aggregation error:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    // Auto-refresh every hour
    const interval = setInterval(load, 3600000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [enabled]);

  const refresh = React.useCallback(async () => {
    if (!enabled) return;
    
    setLoading(true);
    try {
      const result = await newsAggregator.fetchAllNews({ forceRefresh: true });
      setNews(result.articles || []);
      setLastUpdate(new Date(result.timestamp));
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  return { news, loading, error, lastUpdate, refresh };
}

// Safe wrapper hook that can ALWAYS be called (even if aggregator doesn't exist)
// This prevents React Hooks violations
function useSafeAggregatedNews(options = {}) {
  const { enabled = false } = options;
  const [news, setNews] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [lastUpdate, setLastUpdate] = React.useState(null);

  React.useEffect(() => {
    // Check if aggregator exists and is enabled
    if (!enabled || typeof newsAggregator === 'undefined') {
      setNews(null);
      setLoading(false);
      setError(null);
      return;
    }

    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const result = await newsAggregator.fetchAllNews(options);
        
        if (mounted) {
          setNews(result.articles || []);
          setLastUpdate(new Date(result.timestamp));
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
          console.error('News aggregation error:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    // Auto-refresh every hour
    const interval = setInterval(load, 3600000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [enabled]);

  const refresh = React.useCallback(async () => {
    if (!enabled || typeof newsAggregator === 'undefined') return;
    
    setLoading(true);
    try {
      const result = await newsAggregator.fetchAllNews({ forceRefresh: true });
      setNews(result.articles || []);
      setLastUpdate(new Date(result.timestamp));
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  return { news, loading, error, lastUpdate, refresh };
}
