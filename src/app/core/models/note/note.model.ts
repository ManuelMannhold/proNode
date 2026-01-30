
export interface Note {
  id: string;
  title: string;
  content: string;
  parentId: string;
  createdAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  notes: Note[];
  isOpen?: boolean;
  isEditing?: boolean;
}