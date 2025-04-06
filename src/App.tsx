import React, { useEffect } from 'react';
import { NostrProvider } from './context/NostrContext';
import SocialGraph from './components/SocialGraph/SocialGraph';
import MadeiraImageFeed from './components/ImageFeed/MadeiraImageFeed';
import CommunityFeed from './components/Feed/CommunityFeed';

function App() {
  // Setup nostr-login when component mounts
  useEffect(() => {
    import('nostr-login')
      .then(async ({ init, launch }) => {
        init({
          perms: ['sign', 'encrypt', 'decrypt'],
          theme: 'dark',
          darkMode: true
        });

        // Make login button work
        const loginButton = document.getElementById('nostr-login-button');
        if (loginButton) {
          loginButton.addEventListener('click', () => {
            launch();
          });
        }
      })
      .catch((error) => console.error('Failed to load nostr-login', error));
  }, []);

  return (
    <NostrProvider>
      <div className="max-w-7xl mx-auto p-4">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Mad FUN</h1>
            <p className="text-gray-600">Discover Madeira through Nostr</p>
          </div>
          <button
            id="nostr-login-button"
            className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          >
            Sign In with Nostr
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-3 md:col-span-2">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Madeira Feed</h2>
              <MadeiraImageFeed hashtag="madeira" minTrustScore={50} />
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Community Feed</h2>
              <CommunityFeed hashtags={["madeira", "travelmadeira", "visitmadeira", "funchal", "fanal"]} />
            </div>
          </div>

          <div className="col-span-3 md:col-span-1">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Social Graph</h2>
              <SocialGraph />
            </div>
          </div>
        </div>

        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">© {new Date().getFullYear()} Mad FUN</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Powered by Nostr</p>
            </div>
          </div>
        </footer>
      </div>
    </NostrProvider>
  );
}

export default App; 