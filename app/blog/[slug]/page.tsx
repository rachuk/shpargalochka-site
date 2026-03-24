import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getBlogPost, getBlogPosts } from '@/lib/blog-data';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getBlogPosts().map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: 'Стаття не знайдена' };
  return {
    title: post.title,
    description: post.description,
    openGraph: { title: `${post.title} | Шпаргалочка`, type: 'article', publishedTime: post.date },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Organization', name: 'Шпаргалочка' },
    publisher: { '@type': 'Organization', name: 'Шпаргалочка', url: 'https://shpargalochka.org.ua' },
    url: `https://shpargalochka.org.ua/blog/${post.slug}`,
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/blog" className="text-sm text-teal-700 hover:underline mb-6 inline-block">&larr; Усі статті</Link>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded">{post.category}</span>
        <span className="text-xs text-gray-400">{new Date(post.date).toLocaleDateString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>

      <h1 className="text-3xl font-bold mb-8">{post.title}</h1>

      <div
        className="prose prose-gray max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-p:leading-relaxed prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-900"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <div className="mt-12 bg-gray-50 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold mb-3">Потрібна допомога з навчальною роботою?</h2>
        <p className="text-gray-500 mb-6">Напишіть у Telegram-бот — підберемо автора для вашого завдання</p>
        <a href="https://t.me/Shpargalochka_bot" target="_blank" rel="noopener noreferrer"
          className="inline-block bg-teal-700 hover:bg-teal-800 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
          Написати в Telegram
        </a>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
