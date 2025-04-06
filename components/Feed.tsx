import React, { useState } from 'react';

export const Feed: React.FC = () => {
  const [events, setEvents] = useState<Array<{ id: string, content: string, pubkey: string }>>([
    { id: '1', content: 'This is a mock post', pubkey: 'npub1...' },
    { id: '2', content: 'Another mock post for testing', pubkey: 'npub2...' },
    { id: '3', content: 'Third test post', pubkey: 'npub3...' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = () => {
    setIsLoading(true);
    // Simulate loading more posts
    setTimeout(() => {
      setEvents([
        ...events,
        { id: '4', content: 'Newly loaded post', pubkey: 'npub4...' },
        { id: '5', content: 'Another new post', pubkey: 'npub5...' }
      ]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div>
      {events.map((event) => (
        <div key={event.id} className="p-4 border-b">
          <p>{event.content}</p>
          <small>by {event.pubkey}</small>
        </div>
      ))}
      <button 
        onClick={loadMore} 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        {isLoading ? 'Loading...' : 'Load More'}
      </button>
    </div>
  );
}; 