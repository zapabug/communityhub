import React from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// Import App with no SSR to prevent window not defined errors
const App = dynamic(() => import('../src/App'), {
  ssr: false,
});

export default function IndexPage() {
  return (
    <>
      <Head>
        <title>Mad FUN - Discover Madeira through Nostr</title>
        <meta name="description" content="A decentralized social exploration app for Madeira Island enthusiasts, built on the Nostr protocol." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <App />
    </>
  );
} 