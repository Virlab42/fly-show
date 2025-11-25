import localFont from "next/font/local";
import "./globals.scss";
import Header from "../../components/Header/Header";
import Bootstrap from "../../components/Bootstrap/Bootstrap";
import { CartProvider } from "@/cart/add/cart";
import Footer from "../../components/Footer/Footer";
import Cart from "../../components/Cart/cart";
import CartButton from "../../components/CartButton/CartButton";
import YandexMetrika from "../../components/YandexMetrika/YandexMEtrika";
import Confidentiality from "../../components/Confidentiality/confidentiality";
import ModalForm from "../../components/ModalForm/ModalForm";
import Script from "next/script";

const montserrat = localFont({
  src: "./fonts/Montserrat-VariableFont_wght.ttf",
  variable: "--font-montserrat",
  weight: "100 900",
});

export const metadata = {
  icons: {
    icon: [
      { rel: 'icon', type: 'image/svg+xml', url: '/favicon/favicon.svg' },
      { rel: 'icon', type: 'image/png', sizes: '96x96', url: '/favicon/favicon-96x96.png' },
    ],
    shortcut: '/favicon/favicon.ico',
    apple: '/favicon/apple-touch-icon.png',
  },
  manifest: '/favicon/site.webmanifest',
};

const muller = localFont({
  src: [
    { path: './fonts/MullerMedium.ttf', weight: '500', style: 'normal' },
    { path: './fonts/MullerBold.ttf', weight: '600', style: 'normal' },
    { path: './fonts/MullerExtraBold.ttf', weight: '700', style: 'normal' },
  ],
});

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        {/* ✅ Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1443768100032837');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>

      <body className={`${montserrat.variable}`}>
        <CartProvider>
          <YandexMetrika />
          <Bootstrap />
          <ModalForm />
          <Header />
          {children}
          <Footer />
          <Cart />
          <CartButton />
          <Confidentiality />

          {/* ✅ Noscript fallback */}
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src="https://www.facebook.com/tr?id=1443768100032837&ev=PageView&noscript=1"
            />
          </noscript>
        </CartProvider>
      </body>
    </html>
  );
}
