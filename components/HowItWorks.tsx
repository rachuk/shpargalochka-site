const steps = [
  { num: '01', title: 'Заповніть анкету', desc: 'Вкажіть ваші предмети, типи робіт та досвід. Це займе 5 хвилин.' },
  { num: '02', title: 'Пройдіть модерацію', desc: 'Наша команда перегляне вашу заявку протягом 24 годин.' },
  { num: '03', title: 'Почніть отримувати замовлення', desc: 'Бот надсилатиме вам замовлення за вашими предметами. Обирайте цікаві.' },
  { num: '04', title: 'Виконайте та отримайте оплату', desc: 'Здайте роботу, отримайте оплату на картку — все просто і прозоро.' },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Як це працює</h2>
        <div className="space-y-8">
          {steps.map(step => (
            <div key={step.num} className="flex gap-6 items-start">
              <div className="shrink-0 w-14 h-14 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center font-bold text-lg">{step.num}</div>
              <div>
                <h3 className="text-xl font-semibold mb-1">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
