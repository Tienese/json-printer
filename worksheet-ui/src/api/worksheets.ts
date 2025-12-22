/**
 * Worksheet API Client
 * Endpoints for managing worksheet persistence
 */

import { api } from './client';

export interface WorksheetMetadata {
    gridCount: number;
    vocabCount: number;
    textCount: number;
    mcCount: number;
    tfCount: number;
    matchingCount: number;
    clozeCount: number;
}

export interface WorksheetSummary {
    id: number;
    name: string;
    type: 'AUTOSAVE' | 'SNAPSHOT' | 'TEMPLATE';
    parentId?: number;
    metadata?: string;
    createdAt: string;
    updatedAt: string;
}

export interface WorksheetFull extends WorksheetSummary {
    jsonContent: string;
}

export interface WorksheetCreate {
    name: string;
    jsonContent: string;
    type?: 'AUTOSAVE' | 'SNAPSHOT' | 'TEMPLATE';
    parentId?: number;
    metadata?: string;
}

export const worksheetApi = {
    /**
     * List all worksheets, optionally filtered by type
     */
    list: (type?: 'SNAPSHOT' | 'TEMPLATE' | 'AUTOSAVE') =>
        api.get<WorksheetSummary[]>(`/api/worksheets${type ? `?type=${type}` : ''}`),

    /**
     * Get a single worksheet by ID
     */
    get: (id: number) => api.get<WorksheetFull>(`/api/worksheets/${id}`),

    /**
     * Create a new worksheet
     */
    create: (data: WorksheetCreate) => api.post<WorksheetFull>('/api/worksheets', data),

    /**
     * Create/update autosave for a parent worksheet
     */
    autosave: (parentId: number, data: WorksheetCreate) =>
        api.post<WorksheetFull>(`/api/worksheets/${parentId}/autosave`, data),

    /**
     * Create a named snapshot
     */
    snapshot: (parentId: number, data: WorksheetCreate) =>
        api.post<WorksheetFull>(`/api/worksheets/${parentId}/snapshot`, data),

    /**
     * Update an existing worksheet
     */
    update: (id: number, data: Partial<WorksheetCreate>) =>
        api.put<WorksheetFull>(`/api/worksheets/${id}`, data),

    /**
     * Duplicate a worksheet
     */
    duplicate: (id: number) => api.post<WorksheetFull>(`/api/worksheets/${id}/duplicate`, {}),

    /**
     * Delete a worksheet
     */
    delete: (id: number) => api.delete<void>(`/api/worksheets/${id}`),

    /**
     * Get all templates
     */
    templates: () => api.get<WorksheetSummary[]>('/api/worksheets/templates'),
};
