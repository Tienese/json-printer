import { type FC } from 'react';
import type { MatchingItem } from '../../../types/worksheet';
import { devAssert } from '../../../utils/devAssert';

interface Props {
  item: MatchingItem;
  onUpdate: (item: MatchingItem) => void;
}

export const MatchingEditor: FC<Props> = ({ item, onUpdate }) => {
  const handleAddPair = () => {
    const prevCount = item.pairs.length;
    if (prevCount >= 10) return;

    const newPairs = [...item.pairs, { left: 'New Term', right: 'New Definition' }];

    void devAssert.check('MatchingEditor', 'ADD_PAIR', {
      expected: { pairCount: prevCount + 1 },
      actual: { pairCount: newPairs.length },
      message: `Add pair to matching item`,
      snapshot: () => ({ itemId: item.id, pairs: newPairs })
    });

    onUpdate({ ...item, pairs: newPairs });
  };

  const handleRemovePair = (index: number) => {
    const prevCount = item.pairs.length;
    if (prevCount <= 2) return;

    const newPairs = item.pairs.filter((_, i) => i !== index);

    void devAssert.check('MatchingEditor', 'REMOVE_PAIR', {
      expected: { pairCount: prevCount - 1 },
      actual: { pairCount: newPairs.length },
      message: `Remove pair ${index} from matching item`,
      snapshot: () => ({ itemId: item.id, removedIndex: index, pairs: newPairs })
    });

    onUpdate({ ...item, pairs: newPairs });
  };


  return (
    <div className="prop-group" data-testid="matching-editor">
      <h4>Matching Properties</h4>

      <div className="flex items-center justify-between mb-2">
        <label className="prop-label m-0">Manage Pairs ({item.pairs.length}/10)</label>
        <button
          className="btn-add"
          onClick={handleAddPair}
          disabled={item.pairs.length >= 10}
          data-testid="matching-add-pair-btn"
        >
          + Add Pair
        </button>
      </div>

      <div className="space-y-1.5">
        {item.pairs.map((pair, index) => (
          <div key={index} className="flex items-center gap-1.5 p-1.5 bg-gray-50 rounded border border-gray-200" data-testid="matching-pair-row">
            <span className="flex-1 text-xs text-gray-700 truncate" title={`${pair.left} - ${pair.right}`}>
              {index + 1}. {pair.left || <span className="italic text-gray-400">Empty</span>}
            </span>
            <button
              className="btn-remove"
              onClick={() => handleRemovePair(index)}
              disabled={item.pairs.length <= 2}
              data-testid={`matching-remove-pair-${index}`}
              title="Remove pair"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <label className="prop-label checkbox-label mt-[15px]">
        <input
          type="checkbox"
          checked={item.showPromptNumber}
          onChange={(e) => onUpdate({ ...item, showPromptNumber: e.target.checked })}
        />
        Show question number
      </label>
    </div>
  );
};
