import type { FC } from 'react';

interface SaveLoadToolbarProps {
  onSave: () => void;
  onLoad: () => void;
  onSnapshot: () => void;
  onSaveToCloud?: () => void;
  isSaving?: boolean;
}

export const SaveLoadToolbar: FC<SaveLoadToolbarProps> = ({
  onSave,
  onLoad,
  onSnapshot,
  onSaveToCloud,
  isSaving = false
}) => {
  return (
    <div className="flex gap-2.5" data-testid="save-load-toolbar">
      <button className="toolbar-btn" onClick={onSnapshot} data-testid="snapshot-btn" title="Create a history snapshot">Snapshot</button>
      {onSaveToCloud && (
        <button
          className="toolbar-btn"
          onClick={onSaveToCloud}
          data-testid="save-cloud-btn"
          title="Save to database"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : '☁ Save'}
        </button>
      )}
      <button className="toolbar-btn" onClick={onSave} data-testid="save-btn" title="Download JSON">↓ File</button>
      <button className="toolbar-btn" onClick={onLoad} data-testid="load-btn" title="Load JSON">↑ Load</button>
    </div>
  );
};
