import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-32 text-center">
      <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
      <h1 className="text-2xl font-bold mb-3">Сторінку не знайдено</h1>
      <p className="text-gray-500 mb-8">Можливо, сторінку було видалено або ви перейшли за невірним посиланням.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/" className="bg-violet-700 hover:bg-violet-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors">На головну</Link>
        <Link href="/services" className="border border-gray-200 hover:border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors">Наші послуги</Link>
      </div>
    </div>
  );
}
