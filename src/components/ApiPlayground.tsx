import React, { useState } from 'react';
import { useArena } from '../context/ArenaContext';
import { ALL_API_ENDPOINTS } from '../data/arenaxData';
import { ApiEndpoint } from '../types/arenax';
import {
  Send,
  Copy,
  Check,
  Code2,
  Server,
  Layers,
  Key,
  Database,
  FileJson,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const ApiPlayground: React.FC = () => {
  const {
    activePlayer,
    jwtAccessToken,
    players,
    gameSessions,
    matchHistory,
    addSqlLog,
  } = useArena();

  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(ALL_API_ENDPOINTS[0]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [requestPayload, setRequestPayload] = useState<string>(
    JSON.stringify(ALL_API_ENDPOINTS[0].defaultPayload || {}, null, 2)
  );
  const [includeAuthHeader, setIncludeAuthHeader] = useState<boolean>(true);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [responseOutput, setResponseOutput] = useState<{
    status: number;
    statusText: string;
    durationMs: number;
    headers: Record<string, string>;
    body: any;
  } | null>({
    status: 200,
    statusText: 'OK',
    durationMs: 14,
    headers: {
      'Content-Type': 'application/json',
      'X-Frame-Options': 'DENY',
      'Vary': 'Accept, Authorization',
    },
    body: {
      message: 'Select an API endpoint and click "Send Request" to test DRF response.',
      ready: true,
    },
  });

  const [activeInspectorTab, setActiveInspectorTab] = useState<'RESPONSE' | 'DRF_PYTHON'>('RESPONSE');
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);

  const categories = ['All', ...Array.from(new Set(ALL_API_ENDPOINTS.map((e) => e.category)))];

  const filteredEndpoints =
    activeCategory === 'All'
      ? ALL_API_ENDPOINTS
      : ALL_API_ENDPOINTS.filter((e) => e.category === activeCategory);

  const handleSelectEndpoint = (ep: ApiEndpoint) => {
    setSelectedEndpoint(ep);
    setRequestPayload(JSON.stringify(ep.defaultPayload || {}, null, 2));
    setCopiedCurl(false);
  };

  // Execute Simulated DRF API Call
  const handleExecuteRequest = () => {
    setIsExecuting(true);
    const start = performance.now();

    // Check Auth constraint if endpoint requires auth
    if (selectedEndpoint.requiresAuth && !includeAuthHeader) {
      setTimeout(() => {
        setIsExecuting(false);
        setResponseOutput({
          status: 401,
          statusText: 'Unauthorized',
          durationMs: 8,
          headers: {
            'Content-Type': 'application/json',
            'WWW-Authenticate': 'Bearer realm="api"',
          },
          body: {
            detail: 'Authentication credentials were not provided. Expected header: Authorization: Bearer <token>',
            code: 'not_authenticated',
          },
        });
      }, 150);
      return;
    }

    setTimeout(() => {
      const end = performance.now();
      const elapsed = Number((end - start + Math.random() * 15 + 10).toFixed(1));

      let resBody: any = {};
      let resStatus = 200;
      let resStatusText = 'OK';

      // Parse payload
      let parsedBody: any = {};
      try {
        if (requestPayload.trim()) {
          parsedBody = JSON.parse(requestPayload);
        }
      } catch {
        // Invalid JSON
        setResponseOutput({
          status: 400,
          statusText: 'Bad Request',
          durationMs: 6,
          headers: { 'Content-Type': 'application/json' },
          body: { detail: 'JSON parse error: Malformed request body payload.' },
        });
        setIsExecuting(false);
        return;
      }

      // Route response mock data based on ID
      switch (selectedEndpoint.id) {
        case 'auth-register':
          resStatus = 201;
          resStatusText = 'Created';
          resBody = {
            id: 8,
            username: parsedBody.username || 'Dev_Shadow',
            email: parsedBody.email || 'dev@arenax.gg',
            elo_rating: 1000,
            level: 1,
            access: jwtAccessToken,
            refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          };
          addSqlLog('INSERT', `INSERT INTO players (username, email, elo_rating) VALUES ('${resBody.username}', '${resBody.email}', 1000);`, 1.4);
          break;

        case 'auth-login':
          resStatus = 200;
          resBody = {
            access: jwtAccessToken,
            refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh_token_payload',
            player: {
              id: activePlayer.id,
              username: activePlayer.username,
              elo_rating: activePlayer.elo_rating,
              level: activePlayer.level,
            },
          };
          addSqlLog('SELECT', `SELECT * FROM auth_user WHERE username = '${parsedBody.username || activePlayer.username}';`, 0.8);
          break;

        case 'auth-refresh':
          resStatus = 200;
          resBody = {
            access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fresh_access_token_signature',
          };
          break;

        case 'player-me':
          resStatus = 200;
          resBody = {
            id: activePlayer.id,
            username: activePlayer.username,
            email: activePlayer.email,
            elo_rating: activePlayer.elo_rating,
            level: activePlayer.level,
            experience: activePlayer.experience,
            role: activePlayer.role,
            stats: activePlayer.stats,
            inventory: activePlayer.inventory,
          };
          addSqlLog('SELECT', `SELECT * FROM players INNER JOIN player_stats ON (players.id = player_stats.player_id) WHERE players.id = ${activePlayer.id}; -- (select_related)`, 1.2);
          break;

        case 'player-detail':
          const targetP = players.find((p) => p.id === 2) || players[0];
          resStatus = 200;
          resBody = {
            id: targetP.id,
            username: targetP.username,
            elo_rating: targetP.elo_rating,
            level: targetP.level,
            win_rate: targetP.stats.win_rate,
            matches_played: targetP.stats.matches_played,
          };
          addSqlLog('SELECT', `SELECT * FROM players WHERE id = 2;`, 0.6);
          break;

        case 'player-update-me':
          resStatus = 200;
          resBody = {
            id: activePlayer.id,
            username: activePlayer.username,
            email: parsedBody.email || activePlayer.email,
            elo_rating: activePlayer.elo_rating,
            updated: true,
          };
          addSqlLog('UPDATE', `UPDATE players SET email = '${resBody.email}' WHERE id = ${activePlayer.id};`, 1.3);
          break;

        case 'mm-join':
          resStatus = 201;
          resStatusText = 'Created';
          resBody = {
            queue_status: 'QUEUED',
            player_id: activePlayer.id,
            current_range: 100,
            elo_rating: activePlayer.elo_rating,
            server_time: new Date().toISOString(),
          };
          addSqlLog('INSERT', `INSERT INTO matchmaking_queue (player_id, elo_rating, status, current_range) VALUES (${activePlayer.id}, ${activePlayer.elo_rating}, 'WAITING', 100);`, 1.1);
          break;

        case 'mm-leave':
          resStatus = 200;
          resBody = {
            success: true,
            message: 'Player successfully dequeued from matchmaking pool.',
          };
          addSqlLog('DELETE', `DELETE FROM matchmaking_queue WHERE player_id = ${activePlayer.id};`, 0.7);
          break;

        case 'mm-status':
          resStatus = 200;
          resBody = {
            status: 'WAITING',
            seconds_in_queue: 12,
            current_range: 200,
            game_session_id: null,
          };
          break;

        case 'games-create':
          resStatus = 201;
          resStatusText = 'Created';
          resBody = {
            id: 102,
            session_token: 'sess-ec984-a1',
            status: 'ACTIVE',
            map_name: parsedBody.map_name || 'Cyber_Colosseum_01',
            player_a_id: parsedBody.player_a_id || 1,
            player_b_id: parsedBody.player_b_id || 2,
            started_at: new Date().toISOString(),
          };
          addSqlLog('INSERT', `INSERT INTO game_sessions (status, map_name, player_a_id, player_b_id) VALUES ('ACTIVE', 'Cyber_Colosseum_01', 1, 2);`, 1.5);
          break;

        case 'games-detail':
          const gSess = gameSessions[0] || {
            id: 101,
            session_token: 'sess-8392-fbc9',
            status: 'COMPLETED',
            map_name: 'Neo_Tokyo_Arena',
            winner_id: 1,
          };
          resStatus = 200;
          resBody = gSess;
          break;

        case 'games-result':
          resStatus = 200;
          resBody = {
            session_id: 101,
            status: 'COMPLETED',
            winner_id: parsedBody.winner_id || 1,
            elo_update: {
              player_a: { elo_before: 1500, elo_after: 1512, delta: +12 },
              player_b: { elo_before: 1485, elo_after: 1473, delta: -12 },
            },
            transaction_status: 'COMMITTED',
          };
          addSqlLog('TRANSACTION', 'BEGIN TRANSACTION; UPDATE game_sessions; UPDATE players; COMMIT;', 2.8);
          break;

        case 'leaderboard-all':
          resStatus = 200;
          resBody = {
            count: players.length,
            next: null,
            previous: null,
            results: [...players]
              .sort((a, b) => b.elo_rating - a.elo_rating)
              .map((p, rank) => ({
                rank: rank + 1,
                id: p.id,
                username: p.username,
                elo_rating: p.elo_rating,
                level: p.level,
                win_rate: p.stats.win_rate,
                wins: p.stats.wins,
              })),
          };
          addSqlLog('SELECT', 'SELECT * FROM players ORDER BY elo_rating DESC LIMIT 20; -- (Uses idx_elo_desc B-tree index)', 1.1);
          break;

        case 'leaderboard-top':
          resStatus = 200;
          resBody = [...players]
            .sort((a, b) => b.elo_rating - a.elo_rating)
            .slice(0, 3)
            .map((p, idx) => ({
              rank: idx + 1,
              username: p.username,
              elo: p.elo_rating,
              avatar: p.avatar,
            }));
          break;

        case 'rewards-list':
          resStatus = 200;
          resBody = [
            { id: 1, title: 'Ranked Placement Bonus', type: 'COINS', value: '500 Coins', claimed: true },
            { id: 2, title: 'Veteran Warrior Tier 1', type: 'XP', value: '1500 XP', claimed: false },
            { id: 3, title: 'Neon Blade Master Skin', type: 'SKIN', value: 'Legendary Skin', claimed: false },
          ];
          break;

        case 'rewards-claim':
          resStatus = 200;
          resBody = {
            reward_id: parsedBody.reward_id || 1,
            status: 'CLAIMED',
            reward_title: 'Veteran Warrior Tier 1',
            credited_to: activePlayer.username,
          };
          addSqlLog('INSERT', `INSERT INTO player_inventory (player_id, item_name) VALUES (${activePlayer.id}, 'Veteran Warrior Tier 1');`, 1.3);
          break;

        case 'achievements-all':
          resStatus = 200;
          resBody = [
            { id: 1, code: 'FIRST_BLOOD_WIN', name: 'First Victory', condition: 'wins >= 1', coins: 100 },
            { id: 2, code: 'WARRIOR_TEN', name: 'Gladiator of Ten', condition: 'wins >= 10', coins: 500 },
            { id: 3, code: 'ELITE_1500', name: 'Elite Contender', condition: 'elo_rating >= 1500', coins: 1000 },
          ];
          break;

        case 'achievements-me':
          resStatus = 200;
          resBody = activePlayer.achievements.map((a) => ({
            achievement_id: a.achievement_id,
            unlocked_at: a.unlocked_at,
          }));
          break;

        case 'matches-history':
          resStatus = 200;
          resBody = matchHistory.filter((m) => m.player_id === activePlayer.id);
          addSqlLog('SELECT', `SELECT * FROM match_history WHERE player_id = ${activePlayer.id} ORDER BY played_at DESC LIMIT 20;`, 0.9);
          break;

        case 'matches-detail':
          resStatus = 200;
          resBody = matchHistory[0] || { id: 101, result: 'WIN', elo_delta: 12 };
          break;

        default:
          resStatus = 200;
          resBody = { message: 'Success', endpoint: selectedEndpoint.path };
      }

      setResponseOutput({
        status: resStatus,
        statusText: resStatusText,
        durationMs: elapsed,
        headers: {
          'Content-Type': 'application/json',
          'X-Frame-Options': 'DENY',
          'Vary': 'Accept, Authorization',
          'Allow': `${selectedEndpoint.method}, OPTIONS`,
        },
        body: resBody,
      });

      setIsExecuting(false);
    }, 280);
  };

  const copyAsCurl = () => {
    let curl = `curl -X ${selectedEndpoint.method} "https://arenax-api.internal${selectedEndpoint.path}"`;
    if (selectedEndpoint.requiresAuth && includeAuthHeader) {
      curl += ` \\\n  -H "Authorization: Bearer ${jwtAccessToken}"`;
    }
    curl += ` \\\n  -H "Content-Type: application/json"`;
    if (selectedEndpoint.method !== 'GET' && selectedEndpoint.method !== 'DELETE' && requestPayload.trim()) {
      curl += ` \\\n  -d '${requestPayload.replace(/\n/g, '')}'`;
    }
    navigator.clipboard.writeText(curl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
              <Server className="w-4 h-4" />
              <span>Django REST Framework API Console</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">
              Interactive DRF REST API Explorer (20+ Endpoints)
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Execute live HTTP calls against the ArenaX backend API catalogue. Inspect request headers, JWT authentication, ModelSerializer logic, and MySQL queries triggered under the hood.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Total APIs:</span>
            <span className="px-2.5 py-1 bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 rounded-md font-bold">
              {ALL_API_ENDPOINTS.length} Endpoints
            </span>
          </div>
        </div>
      </div>

      {/* Categories Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-semibold shadow-xs'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Runner Grid (Sidebar + Request/Response Console) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endpoints List (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col h-[680px]">
          <div className="px-2 py-1.5 text-[11px] font-mono uppercase text-slate-400 border-b border-slate-800 flex justify-between items-center">
            <span>Endpoints ({filteredEndpoints.length})</span>
            <span className="text-[10px] text-slate-500">DRF Views</span>
          </div>

          <div className="flex-1 overflow-y-auto mt-2 space-y-1.5 pr-1 font-mono">
            {filteredEndpoints.map((ep) => {
              const isSelected = selectedEndpoint.id === ep.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500/60 text-slate-100 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        ep.method === 'GET'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                          : ep.method === 'POST'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                          : ep.method === 'PUT'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                          : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="text-xs font-semibold truncate text-slate-200">
                      {ep.name}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{ep.path}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Request & Response Playground (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* URL & Dispatch Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <span
                className={`px-3 py-2 rounded-lg text-xs font-bold font-mono self-start sm:self-auto ${
                  selectedEndpoint.method === 'GET'
                    ? 'bg-blue-950 text-blue-300 border border-blue-800'
                    : selectedEndpoint.method === 'POST'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : selectedEndpoint.method === 'PUT'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                {selectedEndpoint.method}
              </span>

              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 flex items-center">
                <span className="text-slate-500 mr-1 hidden md:inline">https://arenax-api.internal</span>
                <span>{selectedEndpoint.path}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyAsCurl}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors"
                  title="Copy cURL Command"
                >
                  {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{copiedCurl ? 'Copied' : 'cURL'}</span>
                </button>

                <button
                  disabled={isExecuting}
                  onClick={handleExecuteRequest}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs uppercase font-mono flex items-center gap-2 transition-all shadow-md shadow-cyan-600/30 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 fill-current" />
                  <span>{isExecuting ? 'Sending...' : 'Send Request'}</span>
                </button>
              </div>
            </div>

            {/* Endpoint description and auth toggle */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-slate-800/80">
              <span className="text-slate-400">{selectedEndpoint.description}</span>
              {selectedEndpoint.requiresAuth && (
                <label className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeAuthHeader}
                    onChange={(e) => setIncludeAuthHeader(e.target.checked)}
                    className="accent-cyan-400 rounded"
                  />
                  <span>Send JWT Header (<code className="text-amber-400">Bearer Token</code>)</span>
                </label>
              )}
            </div>
          </div>

          {/* Request Payload Editor (for POST / PUT) */}
          {selectedEndpoint.method !== 'GET' && selectedEndpoint.method !== 'DELETE' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                  <FileJson className="w-3.5 h-3.5 text-cyan-400" />
                  <span>JSON Request Body</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">application/json</span>
              </div>
              <textarea
                rows={4}
                value={requestPayload}
                onChange={(e) => setRequestPayload(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:border-cyan-500 outline-none selection:bg-cyan-900"
              />
            </div>
          )}

          {/* Response Console & DRF Inspector Tabs */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveInspectorTab('RESPONSE')}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
                    activeInspectorTab === 'RESPONSE'
                      ? 'bg-slate-800 text-cyan-300 font-bold border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Live HTTP Response
                </button>
                <button
                  onClick={() => setActiveInspectorTab('DRF_PYTHON')}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeInspectorTab === 'DRF_PYTHON'
                      ? 'bg-slate-800 text-cyan-300 font-bold border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Django DRF Code ({selectedEndpoint.drfView})</span>
                </button>
              </div>

              {responseOutput && activeInspectorTab === 'RESPONSE' && (
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span
                    className={`font-bold flex items-center gap-1 ${
                      responseOutput.status >= 200 && responseOutput.status < 300
                        ? 'text-emerald-400'
                        : responseOutput.status === 401
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {responseOutput.status === 200 || responseOutput.status === 201 ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5" />
                    )}
                    {responseOutput.status} {responseOutput.statusText}
                  </span>
                  <span className="text-slate-500">{responseOutput.durationMs}ms</span>
                </div>
              )}
            </div>

            {/* Tab 1: Live Response JSON */}
            {activeInspectorTab === 'RESPONSE' && responseOutput && (
              <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-800/80 font-mono text-xs overflow-x-auto max-h-[300px]">
                <pre className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {JSON.stringify(responseOutput.body, null, 2)}
                </pre>
              </div>
            )}

            {/* Tab 2: Django View & Serializer Python Code */}
            {activeInspectorTab === 'DRF_PYTHON' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-300 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500">View Class: </span>
                    <span className="text-cyan-400 font-bold">{selectedEndpoint.drfView}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Serializer: </span>
                    <span className="text-amber-300 font-bold">{selectedEndpoint.drfSerializer}</span>
                  </div>
                </div>

                <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-800/80 overflow-x-auto text-emerald-400 max-h-[280px]">
                  <pre className="whitespace-pre-wrap leading-relaxed">
                    {selectedEndpoint.drfCodeSnippet}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
