
export interface Note {
  id: string;
  title: string;
  content: string;
  parentId: string;
  createdAt: string;
}

export interface Folder {
  id: string;
  name: string;
  notes: Note[];
  position: number;
  isOpen?: boolean;
  isEditing?: boolean;
}