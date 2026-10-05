import { useState, useEffect, useMemo } from 'react';

const API_URL = 'http://localhost:8000/api/projects';

const formatUsd = (value) =>
  value === null || value === undefined ? '—' : `$${Number(value).toLocaleString()}`;

export default function App() {
  const [projects, setProjects] = useState([]);
  const [funnel, setFunnel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters and sorting (applied on the client, no extra requests)
  const [search, setSearch] = useState('');
  const [maxFdv, setMaxFdv] = useState(''); // empty string = no additional FDV filter
  const [sortBy, setSortBy] = useState('market_cap');

  // Load the list once. The backend already applies the base criteria from the task.
  useEffect(() => {
    const controller = new AbortController();

    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_URL, { signal: controller.signal });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.detail || `HTTP ${res.status}`);
        }
        const data = await res.json();
        setProjects(Array.isArray(data.data) ? data.data : []);
        setFunnel(data.funnel || null);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setProjects([]);
        setError(`Failed to load data: ${err.message}`);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchProjects();
    return () => controller.abort();
  }, []);

  const visibleProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    const fdvLimit = maxFdv === '' ? null : Number(maxFdv);

    return projects
      .filter((p) => !query || (p.name || '').toLowerCase().includes(query) || (p.symbol || '').toLowerCase().includes(query))
      .filter((p) => fdvLimit === null || (p.fdv !== null && p.fdv !== undefined && p.fdv < fdvLimit))
      .sort((a, b) => (b[sortBy] ?? 0) - (a[sortBy] ?? 0));
  }, [projects, search, maxFdv, sortBy]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Cryptocurrency Project Filter</h1>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px', background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
        <div>
          <label><strong>Search: </strong></label>
          <input
            type="text"
            placeholder="Search by name (e.g. eth)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px', width: '200px' }}
          />
        </div>

        <div>
          <label><strong>FDV below ($): </strong></label>
          <input
            type="number"
            min="0"
            placeholder="no limit"
            value={maxFdv}
            onChange={(e) => setMaxFdv(e.target.value)}
            style={{ padding: '8px', width: '150px' }}
          />
        </div>

        <div>
          <label><strong>Sort by: </strong></label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '8px' }}>
            <option value="market_cap">Market Cap</option>
            <option value="volume_24h">24h Trading Volume</option>
          </select>
        </div>
      </div>

      {/* Status */}
      {loading && <p>Loading projects from backend... (the first request can take a while)</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Table */}
      {!loading && !error && (
        <>
          <p style={{ color: '#666' }}>
            Showing {visibleProjects.length} of {projects.length} projects
          </p>

          {visibleProjects.length === 0 ? (
            <div>
              <p>
                {projects.length === 0
                  ? 'The backend returned no projects matching all criteria.'
                  : 'No projects match your search / FDV filter.'}
              </p>
              {projects.length === 0 && funnel && (
                <details>
                  <summary>Why? Coins left after each backend filter</summary>
                  <pre>{JSON.stringify(funnel, null, 2)}</pre>
                </details>
              )}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ccc' }}>
                  <th>Project</th>
                  <th>Price ($)</th>
                  <th>Market Cap ($)</th>
                  <th>FDV ($)</th>
                  <th>24h Volume ($)</th>
                  <th>TVL ($)</th>
                </tr>
              </thead>
              <tbody>
                {visibleProjects.map((coin) => (
                  <tr key={coin.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0' }}>
                      <img src={coin.image} alt={coin.name} width="24" height="24" />
                      <strong>{coin.name}</strong> ({coin.symbol})
                    </td>
                    <td>{formatUsd(coin.current_price)}</td>
                    <td>{formatUsd(coin.market_cap)}</td>
                    <td>{formatUsd(coin.fdv)}</td>
                    <td>{formatUsd(coin.volume_24h)}</td>
                    <td>{formatUsd(coin.tvl_usd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}