export type Idea = {
  id: string;
  content: string;
  sourceType: 'text' | 'voice' | 'image' | 'link';
  favorite: boolean;
  status: 'new' | 'expanded' | 'reviewing' | 'archived';
  createdAt: string;
  updatedAt: string;
};
