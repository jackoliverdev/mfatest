-- Create the blogs table for dynamic blog system
CREATE TABLE public.blogs (
  id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  blog_title TEXT NOT NULL,
  blog_content TEXT NOT NULL,
  blog_excerpt TEXT,
  blog_category TEXT,
  reading_time INTEGER, -- in minutes
  related_blog_id_1 UUID REFERENCES public.blogs(id),
  related_blog_id_2 UUID REFERENCES public.blogs(id),
  blog_status TEXT NOT NULL DEFAULT 'draft' CHECK (blog_status IN ('live', 'draft')),
  author_id UUID REFERENCES public.users(id),
  posted_date TIMESTAMPTZ,
  cover_image TEXT, -- URL to cover image in Supabase storage
  header_image TEXT, -- URL to header image in Supabase storage
  additional_images TEXT[], -- Array of URLs to additional images
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_blogs_status ON public.blogs(blog_status);
CREATE INDEX idx_blogs_category ON public.blogs(blog_category);
CREATE INDEX idx_blogs_author ON public.blogs(author_id);
CREATE INDEX idx_blogs_posted_date ON public.blogs(posted_date);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_blogs_updated_at 
    BEFORE UPDATE ON public.blogs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 