import { useState } from 'react';

interface InsertBlockProps {
  onAddItem: (type: 'TEXT' | 'GRID' | 'VOCAB') => void;
}

export function InsertBlock({ onAddItem }: InsertBlockProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="insert-block-container no-print">
      <button className="insert-block-button" onClick={() => setIsOpen(!isOpen)}>+</button>
      {isOpen && (
        <div className="insert-block-menu">
          <button onClick={() => { onAddItem('TEXT'); setIsOpen(false); }}>Text</button>
          <button onClick={() => { onAddItem('GRID'); setIsOpen(false); }}>Grid</button>
          <button onClick={() => { onAddItem('VOCAB'); setIsOpen(false); }}>Vocab</button>
        </div>
      )}
    </div>
  );
}
