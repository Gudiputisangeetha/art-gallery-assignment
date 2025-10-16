// src/components/SelectionPanel.tsx
import React, { useState } from 'react';
import { Button } from 'primereact/button';

type Props = {
  selectedCount: number;
  onSelectAllOnPage: () => void;
  onDeselectAllOnPage: () => void;
  onClearAll: () => void;
  onAutoSelectNext: (count: number) => void;
};

export default function SelectionPanel({ selectedCount, onSelectAllOnPage, onDeselectAllOnPage, onClearAll, onAutoSelectNext }: Props) {
  const [autoCount, setAutoCount] = useState(10);

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <div style={{ marginRight: 8 }}>
        <strong>{selectedCount}</strong> selected
      </div>
      <Button label="Select all on page" onClick={onSelectAllOnPage} />
      <Button label="Deselect all on page" onClick={onDeselectAllOnPage} />
      <Button label="Clear all" onClick={onClearAll} />
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input
          type="number"
          value={autoCount}
          onChange={e => setAutoCount(Number(e.target.value))}
          style={{ width: 64, padding: 6 }}
        />
        {/* make this button visually primary - prime's 'severity' or 'className' can be used */}
        <Button label={`Auto-select ${autoCount}`} onClick={() => onAutoSelectNext(autoCount)} className="p-button-primary" />
      </div>
    </div>
  );
}
