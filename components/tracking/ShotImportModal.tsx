'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Check, AlertTriangle } from 'lucide-react';
import { useBag } from '@/lib/storage';
import { useAuth } from '@/lib/auth';
import {
  parseShotScopeExport,
  extractDate,
  buildImportSessions,
  ImportGroup,
  ShotScopeExport,
} from '@/lib/shotscope-import';
import { importShotsForClubs } from '@/lib/tracking-storage';
import { cn } from '@/lib/utils';

interface Props {
  onClose: () => void;
  onImported: () => void;
}

export default function ShotImportModal({ onClose, onImported }: Props) {
  const { bag } = useBag();
  const { user } = useAuth();
  const [groups, setGroups] = useState<ImportGroup[] | null>(null);
  const [date, setDate] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string) as ShotScopeExport;
        if (!json.shots || !Array.isArray(json.shots) || json.shots.length === 0) {
          setError('No shots found in file.');
          return;
        }
        const parsed = parseShotScopeExport(json, bag.clubs);
        setGroups(parsed);
        setDate(extractDate(json));
      } catch {
        setError('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  }, [bag.clubs]);

  const updateMapping = (index: number, clubId: string | null) => {
    if (!groups) return;
    const updated = [...groups];
    updated[index] = { ...updated[index], mappedClubId: clubId };
    setGroups(updated);
  };

  const handleImport = async () => {
    if (!groups || !date) return;
    setImporting(true);
    try {
      const sessions = buildImportSessions(groups);
      await importShotsForClubs(user?.uid ?? null, sessions, date);
      setDone(true);
      setTimeout(() => {
        onImported();
        onClose();
      }, 1200);
    } catch {
      setError('Import failed. Please try again.');
      setImporting(false);
    }
  };

  const mappedCount = groups?.filter((g) => g.mappedClubId).length ?? 0;
  const totalShots = groups?.filter((g) => g.mappedClubId).reduce((sum, g) => sum + g.shots.length, 0) ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4">
      <div className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-brand-dark border border-brand-muted/20 rounded-2xl p-5 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-brand-cream font-bold text-lg">Import Shots</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-cream transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* File picker */}
        {!groups && !done && (
          <div className="space-y-3">
            <p className="text-brand-muted text-sm">
              Import a ShotScope JSON export. Distances will be converted from yards to meters.
            </p>
            <label className="flex flex-col items-center gap-2 py-8 border-2 border-dashed border-brand-muted/20 rounded-xl cursor-pointer hover:border-brand-neon/30 transition-colors">
              <Upload size={28} className="text-brand-muted" />
              <span className="text-brand-cream text-sm font-medium">Choose JSON file</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        {/* Mapping UI */}
        {groups && !done && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-brand-muted text-xs font-bold uppercase tracking-widest">
                Date: <span className="text-brand-cream">{date}</span>
              </p>
              <p className="text-brand-muted text-xs">
                {totalShots} shots mapped
              </p>
            </div>

            <div className="space-y-2 max-h-[45vh] overflow-y-auto">
              {groups.map((group, i) => (
                <div
                  key={group.sourceClub}
                  className="flex items-center gap-3 bg-brand-black/40 rounded-xl px-3 py-2.5 border border-brand-muted/10"
                >
                  {/* Source */}
                  <div className="min-w-0 flex-shrink-0">
                    <p className="text-brand-cream text-sm font-bold">{group.sourceClub}</p>
                    <p className="text-brand-muted text-[10px]">{group.shots.length} shots</p>
                  </div>

                  <span className="text-brand-muted/40">→</span>

                  {/* Target selector */}
                  <select
                    value={group.mappedClubId ?? ''}
                    onChange={(e) => updateMapping(i, e.target.value || null)}
                    className="flex-1 min-w-0 bg-brand-dark border border-brand-muted/20 rounded-lg px-2 py-1.5
                               text-sm text-brand-cream focus:outline-none focus:border-brand-neon/50 transition-colors"
                  >
                    <option value="">— Skip —</option>
                    {bag.clubs
                      .sort((a, b) => b.carry - a.carry)
                      .map((club) => (
                        <option key={club.id} value={club.id}>
                          {club.name} ({club.carry}m)
                        </option>
                      ))}
                  </select>

                  {/* Match indicator */}
                  {group.mappedClubId && (
                    <Check size={14} className="text-green-400 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>

            {/* Import button */}
            <button
              onClick={handleImport}
              disabled={mappedCount === 0 || importing}
              className="btn-primary w-full flex items-center justify-center gap-2 !py-3
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {importing ? (
                <span className="animate-pulse">Importing…</span>
              ) : (
                <>
                  <Upload size={16} />
                  Import {totalShots} Shots
                </>
              )}
            </button>
          </div>
        )}

        {/* Success */}
        {done && (
          <div className="text-center py-6 space-y-2">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
              <Check size={24} className="text-green-400" />
            </div>
            <p className="text-brand-cream font-bold">Import Complete!</p>
            <p className="text-brand-muted text-sm">{totalShots} shots imported for {mappedCount} clubs.</p>
          </div>
        )}
      </div>
    </div>
  );
}
