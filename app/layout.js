import './globals.css';

export const metadata = {
  title: 'Mydow — O Agente que Executa Tarefas de Alto Nível',
  description: 'Mydow é o agente de inteligência artificial que automatiza, decide e executa tarefas de alto nível para o seu negócio operar no próximo nível.',
  keywords: 'Mydow, agente IA, inteligência artificial, automação, alto desempenho, Michel Macedo',
  authors: [{ name: 'Michel Macedo Holding' }],
  creator: 'Michel Macedo Holding',
  publisher: 'Michel Macedo Holding',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Mydow',
  },
  openGraph: {
    title: 'Mydow — O Agente que Executa Tarefas de Alto Nível',
    description: 'O agente de IA que automatiza, decide e executa com maestria.',
    type: 'website',
    locale: 'pt_BR',
  },
  icons: {
    icon: '/images/mydow.png',
    apple: '/images/mydow.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#E87A2F',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Mydow" />
        <link rel="apple-touch-icon" href="/images/mydow.png" />
      </head>
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(reg) { console.log('Mydow SW registered:', reg.scope); },
                    function(err) { console.log('SW registration failed:', err); }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
