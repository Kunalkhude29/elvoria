import type { Metadata } from "next";
import { Playfair_Display, Inter, Allura } from "next/font/google";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import CheckoutDrawer from "../components/CheckoutDrawer";
import SearchOverlay from "../components/SearchOverlay";
import { Providers } from "../providers";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const allura = Allura({
  weight: "400",
  variable: "--font-script",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ELVORIA | detailed luxury",
  description: "Modern gold and silver jewellery for everyday elegance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${inter.variable} ${allura.variable} antialiased bg-ivory text-neutral-900`}
      >
        <Providers>
          {children}
          <Footer />
          <CartDrawer />
          <CheckoutDrawer />
          <SearchOverlay />
        </Providers>
      </body>
    </html>
  );
}
