import type { FC } from 'react';

interface SaveLoadToolbarProps {
  onSave: () => void;
  onLoad: () => void;
  onSnapshot: () => void;
}

export const SaveLoadToolbar: FC<SaveLoadToolbarProps> = ({ onSave, onLoad, onSnapshot }) => {
  return (
    <div className="flex gap-2.5" data-testid="save-load-toolbar">
      <button className="toolbar-btn" onClick={onSnapshot} data-testid="snapshot-btn" title="Create a history snapshot">Snapshot</button>
      <button className="toolbar-btn" onClick={onSave} data-testid="save-btn" title="Download JSON">Save File</button>
      <button className="toolbar-btn" onClick={onLoad} data-testid="load-btn" title="Load JSON">Load File</button>
    </div>
  );
};
