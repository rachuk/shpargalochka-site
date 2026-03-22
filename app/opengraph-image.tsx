import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Шпаргалочка — оберіть автора за рейтингом та відгуками';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start',
        width: '100%', height: '100%', backgroundColor: '#111827', padding: '80px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '56px', height: '56px', backgroundColor: '#6d28d9', borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '32px', fontWeight: 700,
          }}>Ш</div>
          <span style={{ marginLeft: '16px', fontSize: '28px', color: '#9ca3af', fontWeight: 600 }}>Шпаргалочка</span>
        </div>
        <div style={{ fontSize: '56px', fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: '24px', maxWidth: '900px' }}>
          Оберіть автора за рейтингом, відгуками та ціною
        </div>
        <div style={{ fontSize: '24px', color: '#9ca3af', lineHeight: 1.5 }}>
          Платформа, де студенти знаходять перевірених виконавців
        </div>
      </div>
    ),
    { ...size }
  );
}
