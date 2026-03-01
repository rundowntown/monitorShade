import { useState, useCallback } from 'react';
import { Plus, Trash2, Play, Save, Pencil, Check, X } from 'lucide-react';
import { useProfiles } from '../hooks/useProfiles';
import { useMonitorStore } from '../stores/monitorStore';
import { Profile, AppMode, PROFILE_EMOJIS } from '../../shared/types';

export function ProfilesPage() {
  const { profiles, activeProfile, saveProfile, deleteProfile, applyProfile } = useProfiles();
  const { mode, selectedMonitors, monitorStates } = useMonitorStore();
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileEmoji, setNewProfileEmoji] = useState('🌙');
  const [showNewForm, setShowNewForm] = useState(false);
  const [filterMode, setFilterMode] = useState<AppMode | 'all'>('all');
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmoji, setEditEmoji] = useState('🌙');

  const filteredProfiles = Object.entries(profiles).filter(
    ([, p]) => filterMode === 'all' || p.mode === filterMode
  );

  const handleSaveNew = useCallback(async () => {
    const name = newProfileName.trim();
    if (!name || !/^[\w\s]+$/.test(name)) return;

    const profile: Profile = {
      name,
      emoji: newProfileEmoji,
      mode,
      monitorsSelected: selectedMonitors,
      brightnessValues: Object.fromEntries(
        selectedMonitors.map((id) => [id, monitorStates[id]?.brightness ?? 100])
      ),
      dimnessValues: Object.fromEntries(
        selectedMonitors.map((id) => [id, monitorStates[id]?.dimness ?? 50])
      ),
      overlayOpacityValues: Object.fromEntries(
        selectedMonitors.map((id) => [id, monitorStates[id]?.overlayOpacity ?? 0])
      ),
      hotkey: null,
    };

    await saveProfile(name, profile);
    setNewProfileName('');
    setNewProfileEmoji('🌙');
    setShowNewForm(false);
  }, [newProfileName, newProfileEmoji, mode, selectedMonitors, monitorStates, saveProfile]);

  const handleOverwrite = useCallback(async (name: string) => {
    const existing = profiles[name];
    if (!existing) return;

    const profile: Profile = {
      ...existing,
      monitorsSelected: selectedMonitors,
      brightnessValues: Object.fromEntries(
        selectedMonitors.map((id) => [id, monitorStates[id]?.brightness ?? 100])
      ),
      dimnessValues: Object.fromEntries(
        selectedMonitors.map((id) => [id, monitorStates[id]?.dimness ?? 50])
      ),
      overlayOpacityValues: Object.fromEntries(
        selectedMonitors.map((id) => [id, monitorStates[id]?.overlayOpacity ?? 0])
      ),
    };

    await saveProfile(name, profile);
  }, [profiles, selectedMonitors, monitorStates, saveProfile]);

  const startEditing = useCallback((name: string) => {
    const profile = profiles[name];
    setEditingName(name);
    setEditName(name);
    setEditEmoji(profile?.emoji || '🌙');
  }, [profiles]);

  const handleSaveEdit = useCallback(async () => {
    if (!editingName) return;
    const newName = editName.trim();
    if (!newName) return;

    const existing = profiles[editingName];
    if (!existing) return;

    if (newName !== editingName) {
      await deleteProfile(editingName);
    }

    await saveProfile(newName, { ...existing, name: newName, emoji: editEmoji });
    setEditingName(null);
  }, [editingName, editName, editEmoji, profiles, saveProfile, deleteProfile]);

  return (
    <div className="flex flex-col h-full p-5 gap-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-text-primary">Profiles</h1>
          <p className="text-xs text-text-muted mt-0.5">
            {Object.keys(profiles).length} saved
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-white/[0.03] p-0.5 text-xs">
            {(['all', 'auto', 'toggle'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setFilterMode(m)}
                className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                  filterMode === m ? 'bg-accent/15 text-accent' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                       bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
          >
            <Plus size={13} />
            New
          </button>
        </div>
      </div>

      {/* New profile form */}
      {showNewForm && (
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] animate-fade-in">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const idx = PROFILE_EMOJIS.indexOf(newProfileEmoji);
                setNewProfileEmoji(PROFILE_EMOJIS[(idx + 1) % PROFILE_EMOJIS.length]);
              }}
              className="shrink-0 w-9 h-9 rounded-lg bg-white/[0.04] text-lg flex items-center justify-center hover:bg-white/[0.08] transition-colors"
            >
              {newProfileEmoji}
            </button>
            <input
              type="text"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveNew()}
              placeholder="Profile name..."
              autoFocus
              className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-text-primary
                         placeholder:text-text-muted outline-none focus:ring-1 focus:ring-accent/40"
            />
            <button onClick={handleSaveNew} disabled={!newProfileName.trim()}
              className="px-3 py-2 rounded-lg bg-accent/15 text-accent text-xs font-medium hover:bg-accent/25 transition-colors disabled:opacity-30">
              Save
            </button>
            <button onClick={() => { setShowNewForm(false); setNewProfileName(''); setNewProfileEmoji('🌙'); }}
              className="px-3 py-2 rounded-lg text-text-muted text-xs hover:text-text-secondary transition-colors">
              Cancel
            </button>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {PROFILE_EMOJIS.map((e) => (
              <button key={e} onClick={() => setNewProfileEmoji(e)}
                className={`w-7 h-7 rounded-md text-sm flex items-center justify-center transition-all duration-100
                  ${newProfileEmoji === e ? 'bg-accent/20 ring-1 ring-accent/40 scale-110' : 'hover:bg-white/[0.06]'}`}>
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Profile list */}
      <div className="flex flex-col gap-2">
        {filteredProfiles.length === 0 && (
          <div className="text-center py-12 text-text-muted text-sm">
            No profiles {filterMode !== 'all' ? `in ${filterMode} mode` : 'yet'}
          </div>
        )}
        {filteredProfiles.map(([name, profile]) => {
          const isEditing = editingName === name;
          const isActive = activeProfile === name;

          return (
            <div key={name}
              className={`rounded-xl border transition-all duration-150 ${
                isActive ? 'bg-accent/5 border-accent/25' : 'bg-white/[0.02] border-white/[0.05] hover:border-white/[0.1]'
              }`}
            >
              {isEditing ? (
                <div className="flex flex-col gap-2 p-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const idx = PROFILE_EMOJIS.indexOf(editEmoji);
                        setEditEmoji(PROFILE_EMOJIS[(idx + 1) % PROFILE_EMOJIS.length]);
                      }}
                      className="shrink-0 w-9 h-9 rounded-lg bg-white/[0.04] text-lg flex items-center justify-center hover:bg-white/[0.08] transition-colors"
                    >
                      {editEmoji}
                    </button>
                    <input type="text" value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                      autoFocus
                      className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-text-primary outline-none focus:ring-1 focus:ring-accent/40" />
                    <button onClick={handleSaveEdit}
                      className="p-2 rounded-lg text-accent hover:bg-accent/10 transition-colors" title="Save changes">
                      <Check size={16} />
                    </button>
                    <button onClick={() => setEditingName(null)}
                      className="p-2 rounded-lg text-text-muted hover:bg-white/[0.04] transition-colors" title="Cancel">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {PROFILE_EMOJIS.map((e) => (
                      <button key={e} onClick={() => setEditEmoji(e)}
                        className={`w-7 h-7 rounded-md text-sm flex items-center justify-center transition-all duration-100
                          ${editEmoji === e ? 'bg-accent/20 ring-1 ring-accent/40 scale-110' : 'hover:bg-white/[0.06]'}`}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{profile.emoji || '🌙'}</span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-text-primary">{name}</span>
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <span className="capitalize px-1.5 py-0.5 rounded bg-white/[0.04] text-[10px]">{profile.mode}</span>
                        <span>{profile.monitorsSelected.length} monitor{profile.monitorsSelected.length !== 1 ? 's' : ''}</span>
                        {profile.hotkey && <span className="font-mono">{profile.hotkey}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => applyProfile(profile)}
                      className="p-2 rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-colors" title="Apply">
                      <Play size={15} />
                    </button>
                    <button onClick={() => startEditing(name)}
                      className="p-2 rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-colors" title="Edit name & emoji">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleOverwrite(name)}
                      className="p-2 rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-colors" title="Overwrite with current settings">
                      <Save size={15} />
                    </button>
                    <button onClick={() => deleteProfile(name)}
                      className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
