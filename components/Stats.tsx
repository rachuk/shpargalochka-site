export function Stats() {
  const stats = [
    { value: '3 000+', label: 'Виконаних замовлень' },
    { value: '400+', label: 'Активних авторів' },
    { value: '4.7', label: 'Середній рейтинг' },
    { value: '55', label: 'Типів робіт' },
  ];
  return (
    <section className="py-16 bg-teal-900 text-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(s => (
            <div key={s.label}>
              <div className="text-3xl md:text-4xl font-bold text-amber-400 mb-2">{s.value}</div>
              <div className="text-teal-200 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
