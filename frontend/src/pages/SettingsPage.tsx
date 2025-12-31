import { useState, useRef } from 'react';
import { useSettings } from '../hooks/useSettings';
import { SETTINGS_SCHEMA, DEFAULT_SETTINGS, type WorksheetSettings } from '../config/worksheetSettings';
import { Navbar } from '../components/Navbar';
import { ROUTES } from '../navigation/routes';

interface SettingsPageProps {
    onNavigate?: (route: string) => void;
}

type ViewMode = 'ui' | 'json';

export function SettingsPage({ onNavigate }: SettingsPageProps) {
    const { settings, updateSetting, resetSettings, exportSettings, importSettings, getUserOverrides } = useSettings();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('ui');
    const [jsonValue, setJsonValue] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);



    // Filter settings by search
    const filteredSchema = searchQuery
        ? SETTINGS_SCHEMA.filter(s =>
            s.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : SETTINGS_SCHEMA;

    // Group filtered settings
    const filteredGrouped = new Map<string, typeof SETTINGS_SCHEMA>();
    for (const setting of filteredSchema) {
        const existing = filteredGrouped.get(setting.category) || [];
        existing.push(setting);
        filteredGrouped.set(setting.category, existing);
    }

    const handleExport = () => {
        const json = exportSettings();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'worksheet-settings.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const json = event.target?.result as string;
            if (importSettings(json)) {
                alert('Settings imported successfully!');
            } else {
                alert('Failed to import settings. Invalid JSON.');
            }
            // Reset input to allow re-importing the same file
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    const handleOpenJsonEditor = () => {
        setJsonValue(exportSettings());
        setViewMode('json');
    };

    const handleSaveJson = () => {
        if (importSettings(jsonValue)) {
            setViewMode('ui');
        } else {
            alert('Invalid JSON format');
        }
    };

    // Get user overrides for display
    const userOverrides = getUserOverrides();
    const overrideCount = Object.keys(userOverrides).length;

    const isModified = (key: keyof WorksheetSettings) => {
        return settings[key] !== DEFAULT_SETTINGS[key];
    };

    const renderSettingInput = (setting: typeof SETTINGS_SCHEMA[0]) => {
        const value = settings[setting.key];

        switch (setting.type) {
            case 'boolean':
                return (
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={value as boolean}
                            onChange={(e) => updateSetting(setting.key, e.target.checked as any)}
                            className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-[var(--color-border)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--color-accent)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--color-surface)] after:border-[var(--color-border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-accent)]"></div>
                    </label>
                );

            case 'select':
                return (
                    <select
                        value={value as string}
                        onChange={(e) => updateSetting(setting.key, e.target.value as any)}
                        className="px-3 py-1.5 border theme-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] theme-surface theme-text"
                    >
                        {setting.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                );

            case 'number':
                return (
                    <input
                        type="number"
                        value={value as number}
                        onChange={(e) => updateSetting(setting.key, Number(e.target.value) as any)}
                        min={setting.min}
                        max={setting.max}
                        className="w-24 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                );

            case 'string':
            default:
                return (
                    <input
                        type="text"
                        value={value as string}
                        onChange={(e) => updateSetting(setting.key, e.target.value as any)}
                        className="w-40 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                );
        }
    };

    return (
        <div className="min-h-screen theme-elevated">
            <Navbar
                onBack={() => onNavigate?.(ROUTES.HOME)}
                actions={
                    <div className="flex gap-2">
                        <button
                            onClick={handleOpenJsonEditor}
                            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                        >
                            Edit JSON
                        </button>
                        <button
                            onClick={handleExport}
                            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                        >
                            Export
                        </button>
                        <button
                            onClick={handleImport}
                            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                        >
                            Import
                        </button>
                        <button
                            onClick={() => confirm('Reset all settings to defaults?') && resetSettings()}
                            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md"
                        >
                            Reset All
                        </button>
                    </div>
                }
            />

            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* UI Settings View */}
            {viewMode === 'ui' && (
                <div className="max-w-4xl mx-auto p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold theme-text">Settings</h1>
                        <p className="theme-text-secondary text-sm mt-1">Configure worksheet builder defaults</p>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search settings..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Settings Groups */}
                    <div className="space-y-6">
                        {Array.from(filteredGrouped.entries()).map(([category, categorySettings]) => (
                            <div key={category} className="theme-card overflow-hidden">
                                <div className="theme-card-header">
                                    <h2 className="text-sm font-semibold theme-text">{category}</h2>
                                </div>
                                <div className="divide-y divide-[var(--color-border)]">
                                    {categorySettings.map(setting => (
                                        <div key={setting.key} className="px-5 py-4 flex items-center justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-900">{setting.label}</span>
                                                    {isModified(setting.key) && (
                                                        <span className="w-2 h-2 rounded-full bg-blue-500" title="Modified" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">{setting.description}</p>
                                                <code className="text-[10px] text-gray-400 font-mono mt-1 block">{setting.key}</code>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {renderSettingInput(setting)}
                                                {isModified(setting.key) && (
                                                    <button
                                                        onClick={() => updateSetting(setting.key, DEFAULT_SETTINGS[setting.key])}
                                                        className="p-1 text-gray-400 hover:text-gray-600"
                                                        title="Reset to default"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* JSON Two-Panel View (VS Code style) */}
            {viewMode === 'json' && (
                <div className="max-w-6xl mx-auto p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">JSON Settings Editor</h2>
                            <p className="text-xs text-gray-500">
                                Left: All defaults (read-only) | Right: Your overrides ({overrideCount} changed)
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('ui')}
                                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                            >
                                ← Back to UI
                            </button>
                            <button
                                onClick={handleSaveJson}
                                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Left: Default Settings (read-only) */}
                        <div className="theme-card overflow-hidden">
                            <div className="px-4 py-2 theme-elevated border-b theme-border flex items-center justify-between">
                                <span className="text-xs font-semibold theme-text-secondary">DEFAULT SETTINGS</span>
                                <span className="text-[10px] theme-text-muted">read-only</span>
                            </div>
                            <pre className="p-4 text-xs font-mono theme-text-secondary overflow-auto max-h-[60vh] theme-elevated">
                                {JSON.stringify(DEFAULT_SETTINGS, null, 2)}
                            </pre>
                        </div>

                        {/* Right: User Overrides (editable) */}
                        <div className="theme-card overflow-hidden">
                            <div className="px-4 py-2 bg-[var(--color-accent)]/10 border-b border-[var(--color-accent)]/30 flex items-center justify-between">
                                <span className="text-xs font-semibold theme-accent">USER OVERRIDES</span>
                                <span className="text-[10px] theme-accent opacity-70">{overrideCount} changes</span>
                            </div>
                            <textarea
                                value={jsonValue}
                                onChange={(e) => setJsonValue(e.target.value)}
                                className="w-full p-4 text-xs font-mono border-none resize-none focus:outline-none focus:ring-0 theme-surface theme-text"
                                style={{ minHeight: '60vh' }}
                                spellCheck={false}
                                placeholder="{}"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
