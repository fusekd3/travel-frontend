import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import Header from '../components/Header';
import { AuthProvider } from '../context/AuthContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Header />
        <div style={{ paddingTop: 64 }}>
          <Component {...pageProps} />
        </div>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default MyApp; 