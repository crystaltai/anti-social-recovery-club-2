import { ThirdwebProvider } from '@thirdweb-dev/react';
import '@/styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <ThirdwebProvider
      activeChain='mumbai'
      clientId='518a9865e34648b3ae1c16c03b844ebd'
    >
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}
