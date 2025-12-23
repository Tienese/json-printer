import { useState, useRef } from 'react';
import { useSettings } from '../hooks/useSettings';
import { SETTINGS_SCHEMA, DEFAULT_SETTINGS, type WorksheetSettings } from '../config/worksheetSettings';
import { Navbar } from '../components/Navbar';
import { ROUTES } from '../navigation/routes';

interface SettingsPageProps {
    onNavigate?: (route: string) => void;
}

export function SettingsPage({ onNavigate }: SettingsPageProps) {
    const { settings, updateSetting, resetSettings, exportSettings, importSettings } = useSettings();
    const [searchQuery, setSearchQuery] = useState('');
    const [showJsonEditor, setShowJsonEditor] = useState(false);
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
        };
        reader.readAsText(file);
    };

    const handleOpenJsonEditor = () => {
        setJsonValue(exportSettings());
        setShowJsonEditor(true);
    };

    const handleSaveJson = () => {
        if (importSettings(jsonValue)) {
            setShowJsonEditor(false);
        } else {
            alert('Invalid JSON format');
        }
    };

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
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                );

            case 'select':
                return (
                    <select
                        value={value as string}
                        onChange={(e) => updateSetting(setting.key, e.target.value as any)}
                        className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
        <div className="min-h-screen bg-gray-50">
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

            <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500 text-sm mt-1">Configure worksheet builder defaults</p>
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
                        <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                                <h2 className="text-sm font-semibold text-gray-700">{category}</h2>
                            </div>
                            <div className="divide-y divide-gray-100">
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

            {/* JSON Editor Modal */}
            {showJsonEditor && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Edit Settings JSON</h2>
                            <button
                                onClick={() => setShowJsonEditor(false)}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 p-4 overflow-hidden">
                            <textarea
                                value={jsonValue}
                                onChange={(e) => setJsonValue(e.target.value)}
                                className="w-full h-full font-mono text-sm p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ minHeight: '400px' }}
                                spellCheck={false}
                            />
                        </div>
                        <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setShowJsonEditor(false)}
                                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveJson}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
