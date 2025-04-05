import React from "react";
import type { AppProps } from "next/app";
import { NDKProvider } from "nostr-hooks";
import '../styles/globals.css';

const relayUrls = [
  "wss://relay.damus.io",
  "wss://nostr.fmt.wiz.biz",
  "wss://relay.nostr.band"
];

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NDKProvider 
      relayUrls={relayUrls}
      debug={true}
      enableOutboxModel={true}
    >
      <Component {...pageProps} />
    </NDKProvider>
  );
} 