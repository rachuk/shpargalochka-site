import type { Metadata } from 'next';
import { AuthorsClient } from './client';

export const metadata: Metadata = {
  title: 'Стати автором',
  description: 'Приєднуйтесь до команди авторів Шпаргалочки. Заробляйте на знаннях — вільний графік, швидкі виплати, 55+ типів робіт.',
};

export default function AuthorsPage() {
  return <AuthorsClient />;
}
