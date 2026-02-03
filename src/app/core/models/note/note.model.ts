
export interface Note {
  id: string;
  title: string;
  parentId: string;
  content?: string;
  createdAt: string;
}

export interface Folder {
  id: string;
  name: string;
  notes: Note[];
  position: number;
  isOpen?: boolean;
  isEditing?: boolean;
  isExpanded?: boolean;
}