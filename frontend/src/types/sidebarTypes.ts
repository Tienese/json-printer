import type { WorksheetItem, WorksheetMetadata } from './worksheet';

export interface ItemsState {
    items: WorksheetItem[];
    selectedItem: WorksheetItem | null;
    onSelectItem: (item: WorksheetItem | null) => void;
    onUpdate: (item: WorksheetItem) => void;
    onDelete: (item: WorksheetItem) => void;
    onReorderItems: (items: WorksheetItem[]) => void;
}

export interface MetadataState {
    metadata: WorksheetMetadata;
    onUpdateMetadata: (m: WorksheetMetadata) => void;
}

export interface PageState {
    currentPageIndex: number;
    totalPages: number;
    onPrevPage: () => void;
    onNextPage: () => void;
    onAddPage: () => void;
    onDeletePage: () => void;
}

export interface SidebarProps {
    itemsState: ItemsState;
    metadataState: MetadataState;
    pageState: PageState;
    onAddVocabTerm: (itemId: string, term: any) => void;
    onAddTFQuestion: (itemId: string, question: any) => void;
    isOpen: boolean;
    onToggle: () => void;
}
