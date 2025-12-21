import { useReducer, useRef, useState } from 'react';
import type { WorksheetItem, ViewMode, WorksheetMetadata } from '../types/worksheet';

interface State {
  items: WorksheetItem[];
  selectedItem: WorksheetItem | null;
  mode: ViewMode;
  metadata: WorksheetMetadata;
}

type Action =
  | { type: 'SET_ITEMS'; payload: WorksheetItem[] }
  | { type: 'SET_SELECTED_ITEM'; payload: WorksheetItem | null }
  | { type: 'ADD_ITEM'; payload: { item: WorksheetItem; index: number } }
  | { type: 'UPDATE_ITEM'; payload: WorksheetItem }
  | { type: 'DELETE_ITEM'; payload: WorksheetItem }
  | { type: 'TOGGLE_MODE' }
  | { type: 'SET_MODE'; payload: ViewMode }
  | { type: 'UPDATE_METADATA'; payload: Partial<WorksheetMetadata> }
  | { type: 'ADD_VOCAB_TERM'; payload: { itemId: string; term: any } }
  | { type: 'ADD_TF_QUESTION'; payload: { itemId: string; question: any } };

function recalculatePromptNumbers(items: WorksheetItem[]): WorksheetItem[] {
  let count = 1;
  return items.map(item => {
    if (
      (item.type === 'MULTIPLE_CHOICE' ||
        item.type === 'TRUE_FALSE' ||
        item.type === 'MATCHING' ||
        item.type === 'CLOZE' ||
        item.type === 'TEXT' ||
        item.type === 'GRID' ||
        item.type === 'VOCAB') &&
      'showPromptNumber' in item &&
      item.showPromptNumber
    ) {
      return { ...item, promptNumber: count++ };
    }
    return item;
  });
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: recalculatePromptNumbers(action.payload) };
    case 'SET_SELECTED_ITEM':
      return { ...state, selectedItem: action.payload };
    case 'ADD_ITEM':
      const newItemsAdd = [...state.items];
      newItemsAdd.splice(action.payload.index, 0, action.payload.item);
      return { ...state, items: recalculatePromptNumbers(newItemsAdd) };
    case 'UPDATE_ITEM':
      const updatedItems = state.items.map(item => item.id === action.payload.id ? action.payload : item);
      const renumberedItems = recalculatePromptNumbers(updatedItems);
      const updatedSelectedItem = renumberedItems.find(item => item.id === action.payload.id) || null;
      return {
        ...state,
        items: renumberedItems,
        selectedItem: state.selectedItem && state.selectedItem.id === action.payload.id ? updatedSelectedItem : state.selectedItem,
      };
    case 'DELETE_ITEM':
      const filteredItems = state.items.filter(item => item.id !== action.payload.id);
      return {
        ...state,
        items: recalculatePromptNumbers(filteredItems),
        selectedItem: null,
      };
    case 'TOGGLE_MODE':
      return {
        ...state,
        mode: state.mode === 'student' ? 'teacher' : 'student'
      };
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'UPDATE_METADATA':
      return {
        ...state,
        metadata: { ...state.metadata, ...action.payload }
      };
    case 'ADD_VOCAB_TERM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.itemId && item.type === 'VOCAB'
            ? { ...item, terms: [...item.terms, action.payload.term] }
            : item
        )
      };
    case 'ADD_TF_QUESTION':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.itemId && item.type === 'TRUE_FALSE'
            ? { ...item, questions: [...item.questions, action.payload.question] }
            : item
        )
      };
    default:
      return state;
  }
}

const initialMetadata: WorksheetMetadata = {
  title: 'My Worksheet',
  subject: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  version: '1.0.0'
}

export function useWorksheet(initialItems: WorksheetItem[]) {
  const [state, dispatch] = useReducer(reducer, {
    items: initialItems,
    selectedItem: null,
    mode: 'teacher',
    metadata: initialMetadata
  });
  const draggedItemIndex = useRef<number | null>(null);
  const draggedOverItemIndex = useRef<number | null>(null);

  // Add state for visual feedback
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleSelectItem = (item: WorksheetItem | null) => {
    console.info(JSON.stringify({
      source: "AI_TRACE",
      action: "SELECT_ITEM",
      component: "useWorksheet",
      target: {
        testid: item ? `item-${item.id}` : 'null',
        label: item ? item.type : 'none',
        state: "selected"
      },
      payload: { itemId: item?.id }
    }));
    dispatch({ type: 'SET_SELECTED_ITEM', payload: item });
  };

  const updateItem = (updatedItem: WorksheetItem) => {
    console.info(JSON.stringify({
      source: "AI_TRACE",
      action: "UPDATE_ITEM",
      component: "useWorksheet",
      target: {
        testid: `item-${updatedItem.id}`,
        label: updatedItem.type,
        state: "updated"
      },
      payload: { itemId: updatedItem.id }
    }));
    dispatch({ type: 'UPDATE_ITEM', payload: updatedItem });
  };

  const addItem = (item: WorksheetItem, index: number) => {
    console.info(JSON.stringify({
      source: "AI_TRACE",
      action: "ADD_ITEM",
      component: "useWorksheet",
      target: {
        testid: `item-${item.id}`,
        label: item.type,
        state: "new"
      },
      payload: { index, type: item.type }
    }));
    dispatch({ type: 'ADD_ITEM', payload: { item, index } });
  };

  const deleteItem = (itemToDelete: WorksheetItem) => {
    console.info(JSON.stringify({
      source: "AI_TRACE",
      action: "DELETE_ITEM",
      component: "useWorksheet",
      target: {
        testid: `item-${itemToDelete.id}`,
        label: itemToDelete.type,
        state: "deleted"
      },
      payload: { itemId: itemToDelete.id }
    }));
    dispatch({ type: 'DELETE_ITEM', payload: itemToDelete });
  };

  const handleDragStart = (index: number) => {
    draggedItemIndex.current = index;
    setDraggingIndex(index); // Set visual state
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>, index: number) => {
    event.preventDefault();
    draggedOverItemIndex.current = index;
    setDragOverIndex(index); // Set visual state
  };

  const handleDragEnd = () => {
    setDraggingIndex(null); // Reset visual state
    setDragOverIndex(null);
  };

  const handleDrop = () => {
    if (draggedItemIndex.current === null || draggedOverItemIndex.current === null) return;

    const newItems = [...state.items];
    const [draggedItem] = newItems.splice(draggedItemIndex.current, 1);
    newItems.splice(draggedOverItemIndex.current, 0, draggedItem);

    dispatch({ type: 'SET_ITEMS', payload: newItems });
    draggedItemIndex.current = null;
    draggedOverItemIndex.current = null;
    handleDragEnd(); // Reset visual state after drop
  };

  const setItems = (newItems: WorksheetItem[]) => {
    dispatch({ type: 'SET_ITEMS', payload: newItems });
  };

  const toggleMode = () => {
    dispatch({ type: 'TOGGLE_MODE' });
  };

  const updateMetadata = (metadata: Partial<WorksheetMetadata>) => {
    dispatch({ type: 'UPDATE_METADATA', payload: metadata });
  }

  return {
    items: state.items,
    selectedItem: state.selectedItem,
    mode: state.mode,
    metadata: state.metadata,
    handleSelectItem,
    updateItem,
    addItem,
    deleteItem,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    draggingIndex,
    dragOverIndex,
    setItems,
    toggleMode,
    updateMetadata,
    addVocabTerm: (itemId: string, term: any) => dispatch({ type: 'ADD_VOCAB_TERM', payload: { itemId, term } }),
    addTFQuestion: (itemId: string, question: any) => dispatch({ type: 'ADD_TF_QUESTION', payload: { itemId, question } }),
  };
}
