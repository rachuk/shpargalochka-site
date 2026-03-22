const WalletIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>;
const BookIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>;
const ClockIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TrendingIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.281m5.94 2.28l-2.28 5.941" /></svg>;
const ShieldIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>;
const BoltIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>;

const benefits = [
  { Icon: WalletIcon, title: 'Швидкі виплати', desc: 'Отримуйте оплату одразу після здачі роботи. Без затримок — виводьте на картку.' },
  { Icon: BookIcon, title: 'Широкий вибір замовлень', desc: 'Від рефератів до дисертацій, від економіки до програмування — знайдіть своє.' },
  { Icon: ClockIcon, title: 'Вільний графік', desc: 'Працюйте коли зручно. Обирайте замовлення, які вам цікаві та підходять за термінами.' },
  { Icon: TrendingIcon, title: 'Рейтинг і зростання', desc: 'Чим краще працюєте — тим більше замовлень отримуєте. Ваш рейтинг — ваш капітал.' },
  { Icon: ShieldIcon, title: 'Захист та підтримка', desc: "Ми завжди на зв'язку. Гарантія оплати, підтримка при спірних ситуаціях." },
  { Icon: BoltIcon, title: 'Зручний Telegram-бот', desc: 'Все через Telegram — нові замовлення, спілкування, здача робіт та фінанси.' },
];

export function Benefits() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">Чому автори обирають нас</h2>
        <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">Ми створили умови, в яких вам зручно працювати і заробляти</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map(b => (
            <div key={b.title} className="p-6 rounded-2xl border border-gray-100 hover:border-violet-200 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4 group-hover:bg-violet-100 transition-colors">
                <b.Icon />
              </div>
              <h3 className="text-xl font-semibold mb-2">{b.title}</h3>
              <p className="text-gray-600">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
