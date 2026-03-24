interface HeroProps { onApply: () => void; }

export function Hero({ onApply }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-indigo-900 text-white">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-400 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-teal-400 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-5xl mx-auto px-4 py-24 md:py-32">
        <div className="text-center">
          <div className="inline-block mb-6 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-amber-300">
            Шпаргалочка — платформа для авторів
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Заробляйте на своїх
            <span className="block text-amber-400">знаннях та навичках</span>
          </h1>
          <p className="text-lg md:text-xl text-teal-200 max-w-2xl mx-auto mb-10">
            Приєднуйтесь до команди авторів Шпаргалочки. Обирайте замовлення, працюйте
            у зручний час, отримуйте гроші швидко та без зайвих проблем.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onApply}
              className="bg-amber-500 hover:bg-amber-400 text-gray-900 px-8 py-4 rounded-xl text-lg font-bold transition-colors cursor-pointer">
              Стати автором
            </button>
            <a href="https://t.me/Shpargalochka_bot" target="_blank" rel="noopener noreferrer"
              className="border-2 border-white/30 hover:border-white/60 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors text-center">
              Написати в Telegram
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
