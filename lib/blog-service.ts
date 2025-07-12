import { supabase } from './supabase';
import { Blog } from './types';

export const BlogService = {
  // Get all live blogs
  async getBlogs(): Promise<Blog[]> {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('blog_status', 'live')
      .order('posted_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get blog by ID
  async getBlog(id: string): Promise<Blog | null> {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', id)
      .eq('blog_status', 'live')
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get blogs by category
  async getBlogsByCategory(category: string): Promise<Blog[]> {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('blog_category', category)
      .eq('blog_status', 'live')
      .order('posted_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get related blogs
  async getRelatedBlogs(blogId: string): Promise<Blog[]> {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .or(`related_blog_id_1.eq.${blogId},related_blog_id_2.eq.${blogId}`)
      .eq('blog_status', 'live')
      .order('posted_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Search blogs
  async searchBlogs(query: string): Promise<Blog[]> {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .or(`blog_title.ilike.%${query}%,blog_content.ilike.%${query}%,blog_excerpt.ilike.%${query}%`)
      .eq('blog_status', 'live')
      .order('posted_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
}; 