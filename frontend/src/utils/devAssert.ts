/**
 * Dev Assertion Logger - Frontend
 * Runtime assertions with automatic anomaly detection and state snapshots.
 * 
 * Usage:
 *   devAssert.check('useWorksheet', 'ADD_ITEM', { 
 *     expected: 5, 
 *     actual: items.length,
 *     snapshot: () => ({ pages, items })
 *   });
 */

interface AssertionOptions {
    expected: unknown;
    actual: unknown;
    message?: string;
    snapshot?: () => unknown; // Lazy evaluation for performance
}

interface DevLogPayload {
    sessionId: string;
    level: 'event' | 'anomaly' | 'error';
    component: string;
    action: string;
    expected?: string;
    actual?: string;
    message?: string;
    stateSnapshot?: string;
    userAgent?: string;
}

class DevAssert {
    private sessionId: string;
    private apiUrl = '/api/dev/log';
    private isEnabled: boolean;

    constructor() {
        // Generate or retrieve session ID
        this.sessionId = this.getOrCreateSessionId();
        // Only enable in development
        this.isEnabled = import.meta.env.DEV;
    }

    private getOrCreateSessionId(): string {
        const key = 'dev_session_id';
        let id = sessionStorage.getItem(key);
        if (!id) {
            id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem(key, id);
        }
        return id;
    }

    /**
     * Check an assertion and log the result.
     * If expected !== actual, logs as anomaly with state snapshot.
     */
    async check(
        component: string,
        action: string,
        options: AssertionOptions
    ): Promise<boolean> {
        if (!this.isEnabled) return true;

        const { expected, actual, message, snapshot } = options;
        const passed = this.deepEqual(expected, actual);

        if (passed) {
            // Log as normal event
            await this.sendLog({
                sessionId: this.sessionId,
                level: 'event',
                component,
                action,
                message: message || `${action} completed successfully`,
            });
            return true;
        } else {
            // Log as anomaly with state snapshot
            const stateSnapshot = snapshot ? JSON.stringify(snapshot()) : undefined;

            await this.sendLog({
                sessionId: this.sessionId,
                level: 'anomaly',
                component,
                action,
                expected: this.stringify(expected),
                actual: this.stringify(actual),
                message: message || `Assertion failed: ${action}`,
                stateSnapshot,
                userAgent: navigator.userAgent,
            });

            // Show non-blocking toast in dev mode
            this.showDevToast(`⚠️ Assertion Failed: ${action}`, 'Expected: ' + this.stringify(expected) + ', Got: ' + this.stringify(actual));

            return false;
        }
    }

    /**
     * Log a simple event (no assertion).
     */
    async event(
        component: string,
        action: string,
        data?: Record<string, unknown>
    ): Promise<void> {
        if (!this.isEnabled) return;

        await this.sendLog({
            sessionId: this.sessionId,
            level: 'event',
            component,
            action,
            message: data ? JSON.stringify(data) : undefined,
        });
    }

    /**
     * Log an error.
     */
    async error(
        component: string,
        action: string,
        error: unknown,
        snapshot?: () => unknown
    ): Promise<void> {
        if (!this.isEnabled) return;

        const stateSnapshot = snapshot ? JSON.stringify(snapshot()) : undefined;

        await this.sendLog({
            sessionId: this.sessionId,
            level: 'error',
            component,
            action,
            message: String(error),
            stateSnapshot,
            userAgent: navigator.userAgent,
        });
    }

    /**
     * Get current session ID.
     */
    getSessionId(): string {
        return this.sessionId;
    }

    // Private helpers
    private async sendLog(payload: DevLogPayload): Promise<void> {
        try {
            await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
        } catch (err) {
            console.error('Failed to send dev log:', err);
        }
    }

    private deepEqual(a: unknown, b: unknown): boolean {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    private stringify(value: unknown): string {
        if (typeof value === 'string') return value;
        if (typeof value === 'number') return String(value);
        try {
            return JSON.stringify(value);
        } catch {
            return String(value);
        }
    }

    private showDevToast(title: string, message: string): void {
        // Simple console warning for now (can be upgraded to UI toast later)
        console.warn(`[DEV_ASSERT] ${title}\n${message}`);
    }
}

export const devAssert = new DevAssert();
export default devAssert;
