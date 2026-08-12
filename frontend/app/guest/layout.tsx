import type { Metadata } from 'next';
import { Bebas_Neue, Cormorant_Garamond, Manrope, JetBrains_Mono } from 'next/font/google';

const bebas = Bebas_Neue({ variable: '--font-display', subsets: ['latin'], weight: '400' });
const cormorant = Cormorant_Garamond({
  variable: '--font-accent',
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['italic', 'normal'],
});
const manrope = Manrope({ variable: '--font-body', subsets: ['latin'], weight: ['400', '500', '600', '700'] });
const jetbrainsMono = JetBrains_Mono({ variable: '--font-mono-ticket', subsets: ['latin'], weight: ['500', '600'] });

export const metadata: Metadata = {
  title: 'CityScape Legacy Lounge & Bar — Reserve Your Table',
  description: 'Signature cocktails, rooftop views, and late-night parties in New Baneswor, Kathmandu.',
};

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${bebas.variable} ${cormorant.variable} ${manrope.variable} ${jetbrainsMono.variable} relative min-h-screen overflow-hidden`}
      style={{
        fontFamily: 'var(--font-body)',
        background: 'radial-gradient(ellipse at top, #0B0620 0%, #150A2E 30%, #2A0F3D 55%, #4A1642 78%, #0D0517 100%)',
      }}
    >
      {/* Stars layer */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage: `
            radial-gradient(1.5px 1.5px at 10% 15%, white, transparent),
            radial-gradient(1px 1px at 25% 8%, white, transparent),
            radial-gradient(2px 2px at 40% 22%, white, transparent),
            radial-gradient(1px 1px at 55% 5%, white, transparent),
            radial-gradient(1.5px 1.5px at 68% 18%, white, transparent),
            radial-gradient(1px 1px at 80% 10%, white, transparent),
            radial-gradient(2px 2px at 92% 25%, white, transparent),
            radial-gradient(1px 1px at 15% 35%, white, transparent),
            radial-gradient(1.5px 1.5px at 88% 40%, white, transparent),
            radial-gradient(1px 1px at 50% 32%, white, transparent),
            radial-gradient(1px 1px at 5% 28%, white, transparent),
            radial-gradient(1.5px 1.5px at 75% 3%, white, transparent),
            radial-gradient(1px 1px at 33% 12%, white, transparent)
          `,
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Party light glows */}
      <div
        className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full opacity-30 blur-3xl"
        style={{ background: '#FF3E80' }}
      />
      <div
        className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full opacity-25 blur-3xl"
        style={{ background: '#2FD9C4' }}
      />
      <div
        className="pointer-events-none absolute left-1/3 top-0 h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{ background: '#E8B44C' }}
      />

      <div className="relative">{children}</div>
    </div>
  );
}
