import React, { useState, useCallback, useMemo } from 'react';
import { useNostrFeed } from '../../hooks/useNostrFeed';
import ImageCard from '../../components/ImageFeed/ImageCard';

interface MadeiraImageFeedProps {
  hashtag?: string;
  minTrustScore?: number;
}

const MadeiraImageFeed: React.FC<MadeiraImageFeedProps> = ({
  hashtag = 'madeira',
  minTrustScore
}) => {
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  const {
    imageNotes,
    isLoading,
    error,
    refresh
  } = useNostrFeed({
    hashtag,
    minTrustScore,
    imagesOnly: true
  });

  const displayedNotes = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return imageNotes.slice(start, end);
  }, [imageNotes, page, itemsPerPage]);

  const totalPages = Math.ceil(imageNotes.length / itemsPerPage);

  const handlePrevPage = useCallback(() => {
    setPage(prev => Math.max(prev - 1, 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setPage(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-72">
        <div className="animate-pulse w-10 h-10 rounded-full bg-blue-200 mb-2"></div>
        <p>Loading images from Nostr...</p>
        <p className="text-xs text-gray-500 mt-1">This may take a moment to connect to relays</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-2">{error}</p>
        <div className="flex flex-col space-y-2 items-center">
          <button
            onClick={refresh}
            className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (imageNotes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="mb-2">No images found with #{hashtag}</p>
        <p className="text-xs text-gray-500 mb-4">
          This could be because:
          <br />• No posts with this hashtag have been found
          <br />• The connection to Nostr relays failed
          <br />• Images are still loading from the Nostr network
        </p>
        <div className="flex flex-col space-y-2 items-center">
          <button
            onClick={refresh}
            className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-medium">#{hashtag} Images</h3>
        <div className="flex items-center">
          <span className="text-sm mr-2">{imageNotes.length} images</span>
          <button
            onClick={refresh}
            className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedNotes.map((image) => (
          <ImageCard
            key={image.id}
            imageUrl={image.imageUrl}
            eventId={image.id}
            profileId={image.pubkey}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={handlePrevPage}
            disabled={page === 1}
            className={`px-3 py-1 rounded-md text-sm ${page === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
          >
            Previous
          </button>
          <span className="flex items-center text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={page === totalPages}
            className={`px-3 py-1 rounded-md text-sm ${page === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MadeiraImageFeed; 