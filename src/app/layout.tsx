import type { Metadata } from "next";
import { Poppins, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { CartProvider } from "@/contexts/CartContext";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import { GlobalAudioPlayer } from "@/components/layout/GlobalAudioPlayer";
import { Footer } from "@/components/layout/Footer";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SUMVIBES - Marketplace Premium de Production Musicale",
  description: "La marketplace #1 pour les compositeurs visionnaires et les artistes en quête d'excellence. Achetez, vendez et collaborez dans un écosystème sécurisé.",
  keywords: ["beats", "production musicale", "marketplace", "compositeurs", "artistes", "hip-hop", "trap", "R&B"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎵</text></svg>" />
      </head>
      <body className={`${poppins.variable} ${cormorant.variable} antialiased min-h-screen flex flex-col`}>
        <AuthProvider>
          <CartProvider>
            <SocketProvider>
              <AudioPlayerProvider>
                <div className="flex-grow flex flex-col">
                  {children}
                </div>
                <Footer />
                <GlobalAudioPlayer />
              </AudioPlayerProvider>
            </SocketProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}