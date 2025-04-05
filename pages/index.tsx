import React from 'react';
import { Feed } from '../components/Feed';
import { useLogin } from 'nostr-hooks';

export default function Home() {
  const { loginWithExtension, loginFromLocalStorage } = useLogin();

  React.useEffect(() => {
    // Try to login from local storage on page load
    loginFromLocalStorage();
  }, [loginFromLocalStorage]);

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Nostr Social Graph</h1>
        <button
          onClick={() => loginWithExtension()}
          className="px-4 py-2 bg-purple-500 text-white rounded"
        >
          Login with Extension
        </button>
      </header>
      <main>
        <Feed />
      </main>
    </div>
  );
} 