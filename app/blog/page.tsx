import type { Metadata } from 'next';
import Link from 'next/link';
import { getBlogPosts } from '@/lib/blog-data';

export const metadata: Metadata = {
  title: 'Блог',
  description: 'Корисні статті для студентів: поради з написання курсових, дипломних робіт, оформлення за ДСТУ, підвищення унікальності.',
};

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Блог</h1>
      <p className="text-gray-500 mb-10">Корисні матеріали для студентів: інструкції, поради, гайди з написання та оформлення навчальних робіт</p>

      <div className="space-y-6">
        {posts.map(post => (
          <Link key={post.slug} href={`/blog/${post.slug}`}
            className="block bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded">{post.category}</span>
              <span className="text-xs text-gray-400">{new Date(post.date).toLocaleDateString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h2>
            <p className="text-gray-500 text-sm leading-relaxed">{post.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
