import type { MetadataRoute } from 'next';
import { getWorkTypes } from '@/lib/api';
import { getBlogPosts } from '@/lib/blog-data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const workTypes = await getWorkTypes().catch(() => []);
  const blogPosts = getBlogPosts();

  const staticPages: MetadataRoute.Sitemap = [
    { url: 'https://shpargalochka.org.ua/', changeFrequency: 'daily', priority: 1 },
    { url: 'https://shpargalochka.org.ua/services', changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://shpargalochka.org.ua/blog', changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://shpargalochka.org.ua/reviews', changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://shpargalochka.org.ua/authors', changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://shpargalochka.org.ua/about', changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://shpargalochka.org.ua/contacts', changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://shpargalochka.org.ua/privacy', changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://shpargalochka.org.ua/terms', changeFrequency: 'yearly', priority: 0.3 },
  ];

  const servicePages: MetadataRoute.Sitemap = workTypes.map(wt => ({
    url: `https://shpargalochka.org.ua/services/${wt.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map(post => ({
    url: `https://shpargalochka.org.ua/blog/${post.slug}`,
    lastModified: post.date,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...servicePages, ...blogPages];
}
