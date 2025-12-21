import type { WorksheetTemplate } from '../types/worksheet';

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
        const template = JSON.parse(text) as WorksheetTemplate;

        // Validate structure
        if (!template.metadata || !template.items) {
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
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
};
