import { ThirdwebProvider } from '@thirdweb-dev/react';
import '@/styles/globals.css';

const activeChain = 'mumbai';

export default function App({ Component, pageProps }) {
  return (
    <ThirdwebProvider activeChain={activeChain}>
      <main className={poppins.variable}>
        <Component {...pageProps} />
      </main>
    </ThirdwebProvider>
  );
}

// Import fonts
import { Poppins } from 'next/font/google';
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700', '900'],
  variable: '--font-poppins',
});
