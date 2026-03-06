export interface Story {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  content: string;
  category: string;
  likes: number;
  created_at: string;
}

export interface StoryComment {
  id: string;
  story_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export type View = 'home' | 'reader' | 'community' | 'saved';
