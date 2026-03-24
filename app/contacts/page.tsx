import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Контакти', description: "Зв'яжіться з нами через Telegram-бот або електронну пошту." };

const FAQ_ITEMS = [
  { q: 'Як замовити роботу?', a: 'Напишіть у наш Telegram-бот, опишіть завдання — і ми підберемо автора.' },
  { q: 'Скільки коштує робота?', a: 'Ціна залежить від типу роботи, обсягу та термінів. Автор запропонує ціну після ознайомлення із завданням.' },
  { q: 'Які гарантії?', a: 'Безкоштовні доопрацювання, контроль якості через рейтинги, конфіденційність замовлень.' },
  { q: 'Як стати автором?', a: "Заповніть анкету на сторінці \"Стати автором\" — і ми зв'яжемося з вами протягом 24 годин." },
];

const FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map(item => ({
    '@type': 'Question', name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

const TelegramIcon = () => (
  <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

export default function ContactsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Контакти</h1>
      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        <a href="https://t.me/Shpargalochka_bot" target="_blank" rel="noopener noreferrer" className="block p-8 rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all text-center">
          <div className="flex justify-center mb-4"><TelegramIcon /></div>
          <h2 className="text-xl font-bold mb-2">Telegram-бот</h2>
          <p className="text-gray-600 text-sm mb-4">Основний канал зв&apos;язку. Тут ви можете замовити роботу, відстежити статус та зв&apos;язатися з підтримкою.</p>
          <span className="text-teal-700 font-semibold">@Shpargalochka_bot</span>
        </a>
        <a href="mailto:support@shpargalochka.org.ua" className="block p-8 rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all text-center">
          <div className="flex justify-center mb-4"><EmailIcon /></div>
          <h2 className="text-xl font-bold mb-2">Email</h2>
          <p className="text-gray-600 text-sm mb-4">Для офіційних звернень, пропозицій співпраці та питань щодо партнерства.</p>
          <span className="text-teal-700 font-semibold">support@shpargalochka.org.ua</span>
        </a>
      </div>
      <div className="bg-gray-50 rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-4">Часті питання</h2>
        <div className="space-y-4">
          {FAQ_ITEMS.map(item => (
            <details key={item.q} className="group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                {item.q}
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              </summary>
              <p className="text-gray-600 text-sm mt-2">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }} />
    </div>
  );
}
