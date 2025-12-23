import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_SETTINGS, type WorksheetSettings } from '../config/worksheetSettings';

const STORAGE_KEY = 'worksheet-settings';

/**
 * Hook for managing worksheet settings with localStorage persistence.
 */
export function useSettings() {
    const [settings, setSettings] = useState<WorksheetSettings>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
            }
        } catch {
            console.warn('Failed to load settings from localStorage');
        }
        return DEFAULT_SETTINGS;
    });

    // Persist to localStorage on change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch {
            console.warn('Failed to save settings to localStorage');
        }
    }, [settings]);

    // Update a single setting
    const updateSetting = useCallback(<K extends keyof WorksheetSettings>(
        key: K,
        value: WorksheetSettings[K]
    ) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    }, []);

    // Reset all settings to defaults
    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_SETTINGS);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    // Reset a single setting to default
    const resetSetting = useCallback(<K extends keyof WorksheetSettings>(key: K) => {
        setSettings(prev => ({ ...prev, [key]: DEFAULT_SETTINGS[key] }));
    }, []);

    // Export settings as JSON string
    const exportSettings = useCallback(() => {
        return JSON.stringify(settings, null, 2);
    }, [settings]);

    // Import settings from JSON string
    const importSettings = useCallback((json: string) => {
        try {
            const imported = JSON.parse(json);
            setSettings({ ...DEFAULT_SETTINGS, ...imported });
            return true;
        } catch {
            console.error('Failed to import settings');
            return false;
        }
    }, []);

    // Get a specific setting value
    const getSetting = useCallback(<K extends keyof WorksheetSettings>(key: K): WorksheetSettings[K] => {
        return settings[key];
    }, [settings]);

    return {
        settings,
        updateSetting,
        resetSettings,
        resetSetting,
        exportSettings,
        importSettings,
        getSetting,
    };
}
