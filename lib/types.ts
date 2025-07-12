export interface UserProfile {
  id: string; // Corresponds to Firebase Auth UID
  created_at: string;
  email?: string;
  name?: string;
  bio?: string;
  mfa_enabled: boolean;
}

export interface Blog {
  id: string;
  blog_title: string;
  blog_content: string;
  blog_excerpt?: string;
  blog_category?: string;
  reading_time?: number; // in minutes
  related_blog_id_1?: string;
  related_blog_id_2?: string;
  blog_status: 'live' | 'draft';
  author_id?: string;
  posted_date?: string;
  cover_image?: string;
  header_image?: string;
  additional_images?: string[];
  created_at: string;
  updated_at: string;
} 