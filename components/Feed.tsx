import React, { useEffect } from 'react';
import { useSubscription } from 'nostr-hooks';

export const Feed: React.FC = () => {
  const subId = 'global-feed';
  const { events, isLoading, loadMore, createSubscription } = useSubscription(subId);

  useEffect(() => {
    const filters = [{
      kinds: [1],
      limit: 50
    }];

    createSubscription(filters);
  }, [createSubscription]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {events.map((event) => (
        <div key={event.id} className="p-4 border-b">
          <p>{event.content}</p>
          <small>by {event.pubkey}</small>
        </div>
      ))}
      <button 
        onClick={() => loadMore()} 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Load More
      </button>
    </div>
  );
}; 