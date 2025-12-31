/**
 * AI Debug Logger - Structured console logging for AI browser debugging
 * 
 * When AI uses browser tools to test features, these logs provide context about:
 * - Current route/page
 * - App state (mode, selected items)
 * - User actions and state changes
 * - Component data snapshots
 */

type LogLevel = 'info' | 'action' | 'state' | 'mount' | 'error';

interface AILogEntry {
    source: 'AI_TRACE';
    level: LogLevel;
    timestamp: string;
    route?: string;
    component: string;
    event: string;
    data?: Record<string, unknown>;
}

function getTimestamp(): string {
    return new Date().toISOString().split('T')[1].slice(0, 12);
}

function formatForConsole(entry: AILogEntry): string {
    const prefix = `[AI_TRACE ${entry.level.toUpperCase()}]`;
    const time = entry.timestamp;
    const location = entry.route ? `${entry.route} > ${entry.component}` : entry.component;
    return `${prefix} ${time} | ${location} | ${entry.event}`;
}

export const aiLog = {
    /**
     * Log page/component mount with initial state
     */
    mount: (component: string, route: string, data?: Record<string, unknown>) => {
        const entry: AILogEntry = {
            source: 'AI_TRACE',
            level: 'mount',
            timestamp: getTimestamp(),
            route,
            component,
            event: 'MOUNTED',
            data
        };
        console.info(formatForConsole(entry), data ? '\n' + JSON.stringify(data, null, 2) : '');
    },

    /**
     * Log user action (click, type, select, etc.)
     */
    action: (component: string, event: string, data?: Record<string, unknown>) => {
        const entry: AILogEntry = {
            source: 'AI_TRACE',
            level: 'action',
            timestamp: getTimestamp(),
            component,
            event,
            data
        };
        console.info(formatForConsole(entry), data || '');
    },

    /**
     * Log state change (mode toggle, selection, etc.)
     */
    state: (component: string, event: string, data?: Record<string, unknown>) => {
        const entry: AILogEntry = {
            source: 'AI_TRACE',
            level: 'state',
            timestamp: getTimestamp(),
            component,
            event,
            data
        };
        console.info(formatForConsole(entry), data || '');
    },

    /**
     * Log snapshot of current data (for debugging complex state)
     */
    snapshot: (component: string, label: string, data: unknown) => {
        const entry: AILogEntry = {
            source: 'AI_TRACE',
            level: 'info',
            timestamp: getTimestamp(),
            component,
            event: `SNAPSHOT: ${label}`
        };
        console.info(formatForConsole(entry), '\n', data);
    },

    /**
     * Log error with context
     */
    error: (component: string, event: string, error: unknown) => {
        const entry: AILogEntry = {
            source: 'AI_TRACE',
            level: 'error',
            timestamp: getTimestamp(),
            component,
            event,
            data: { error: String(error) }
        };
        console.error(formatForConsole(entry), error);
    }
};

export default aiLog;
