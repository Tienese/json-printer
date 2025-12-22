import type { WorksheetTemplate } from '../types/worksheet';

/**
 * Normalize a loaded template to ensure it has the pages structure.
 * Handles legacy files that used flat `items` array.
 */
function normalizeTemplate(data: any): WorksheetTemplate {
  // If already has pages array, use it
  if (data.pages && Array.isArray(data.pages)) {
    return data as WorksheetTemplate;
  }

  // Legacy format: convert items to single page
  if (data.items && Array.isArray(data.items)) {
    return {
      metadata: data.metadata,
      pages: [{ id: crypto.randomUUID(), items: data.items }]
    };
  }

  // Invalid format: return empty template
  return {
    metadata: data.metadata || { title: 'Untitled', subject: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: '2.0' },
    pages: [{ id: crypto.randomUUID(), items: [] }]
  };
}

export const saveWorksheetToFile = (template: WorksheetTemplate): void => {
  const json = JSON.stringify(template, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const filename = template.metadata.title
    ? `${template.metadata.title.replace(/[^a-z0-9]/gi, '_')}.json`
    : `worksheet-${Date.now()}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};

export const loadWorksheetFromFile = (): Promise<WorksheetTemplate> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        // Normalize to handle both legacy and new formats
        const template = normalizeTemplate(data);

        // Validate structure
        if (!template.metadata || !template.pages) {
          throw new Error('Invalid worksheet format');
        }

        resolve(template);
      } catch (error) {
        reject(error);
      }
    };

    input.click();
  });
};

export const STORAGE_KEY = 'worksheet-autosave';

export const saveToLocalStorage = (template: WorksheetTemplate): boolean => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(template));
    return true;
  } catch {
    return false;
  }
};

export const loadFromLocalStorage = (): WorksheetTemplate | null => {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return null;
    const data = JSON.parse(json);
    return normalizeTemplate(data);
  } catch {
    return null;
  }
};
