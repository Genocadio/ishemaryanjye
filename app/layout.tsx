import { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#16a34a"
}

export const metadata: Metadata = {
  title: "Ishema Ryanjye",
  description: "A card game teaching reproductive health and promoting equality",
  generator: "Ishema Ryanjye",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ishema Ryanjye"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* <meta name="apple-mobile-web-app-title" content="Ishema" /> */}
        
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                      console.log('ServiceWorker registration successful');
                    })
                    .catch(err => {
                      console.log('ServiceWorker registration failed: ', err);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className="font-sans">
        <Providers>
          {children}
          {/* <Toaster richColors position="top-center" /> */}
        </Providers>
      </body>
    </html>
  );
}
