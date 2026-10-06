import React from 'react';
import { useArena } from '../context/ArenaContext';
import { Terminal, Trash2, X, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface SqlLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqlLogDrawer: React.FC<SqlLogDrawerProps> = ({ isOpen, onClose }) => {
  const { sqlLogs, clearSqlLogs } = useArena();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-[#090d18] border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-semibold text-slate-100 font-mono text-sm">MySQL InnoDB Query & Transaction Log</h2>
              <p className="text-[11px] text-slate-400 font-mono">Live SQL statements dispatched by Django ORM & Service Layer</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearSqlLogs}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
              title="Clear logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-cyan-950/30 border-b border-cyan-800/30 px-4 py-2.5 flex items-center justify-between text-xs text-cyan-300 font-mono">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>Logging live operations ({sqlLogs.length} statements captured)</span>
          </div>
          <span className="text-slate-400 text-[11px]">Engine: MySQL 8.0 / InnoDB</span>
        </div>

        {/* Logs list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 font-mono text-xs">
          {sqlLogs.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Terminal className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No queries logged yet. Perform a match simulation or call a REST API to observe SQL execution.</p>
            </div>
          ) : (
            sqlLogs.map((log) => {
              const isTransaction = log.type === 'TRANSACTION';
              const isLock = log.type === 'LOCK';
              const isRollback = log.status === 'ROLLBACK';

              return (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg border transition-all ${
                    isRollback
                      ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                      : isLock
                      ? 'bg-amber-950/30 border-amber-800/50 text-amber-200'
                      : isTransaction
                      ? 'bg-purple-950/30 border-purple-800/50 text-purple-200'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                          isRollback
                            ? 'bg-rose-900/80 text-rose-300'
                            : isLock
                            ? 'bg-amber-900/80 text-amber-300'
                            : isTransaction
                            ? 'bg-purple-900/80 text-purple-300'
                            : log.type === 'SELECT'
                            ? 'bg-blue-900/80 text-blue-300'
                            : 'bg-emerald-900/80 text-emerald-300'
                        }`}
                      >
                        {log.type}
                      </span>
                      <span className="text-slate-500">{log.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{log.durationMs}ms</span>
                      {isRollback ? (
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> ROLLBACK
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> OK
                        </span>
                      )}
                    </div>
                  </div>
                  <pre className="mt-1 whitespace-pre-wrap break-all text-xs text-slate-200 font-mono leading-relaxed selection:bg-cyan-900">
                    {log.sql}
                  </pre>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
