import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
import CustomCursor from '@/components/ui/CustomCursor';

export const metadata: Metadata = {
  title: 'Sensei — AI-Powered Adaptive Learning Platform',
  description: 'Next-generation AI-powered adaptive learning ecosystem with gesture-based interaction, LangGraph agents, gamification, and 3D immersion.',
  keywords: ['AI', 'learning', 'education', 'adaptive', 'sensei', 'gesture', 'gamification'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bangers&family=Cinzel:wght@400;500;600;700;800;900&family=Cinzel+Decorative:wght@400;700;900&family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&family=Fredoka:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&family=Nunito:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400&family=Nunito+Sans:wght@300;400;600;700;800&family=Orbitron:wght@400;500;600;700;800;900&family=Patrick+Hand&family=Permanent+Marker&family=Rajdhani:wght@400;500;600;700&family=Raleway:wght@300;400;500;600;700;800&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <Providers>
          <CustomCursor />
          {children}
        </Providers>
      </body>
    </html>
  );
}
