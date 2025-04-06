import React, { useState, useEffect } from 'react';
import { useNostr } from '../../context/NostrContext';

interface CommunityFeedProps {
    hashtags: string[];
}

interface Post {
    id: string;
    author: {
        id: string;
        name?: string;
        picture?: string;
    };
    content: string;
    createdAt: number;
    tags: string[];
}

const CommunityFeed: React.FC<CommunityFeedProps> = ({ hashtags }) => {
    const { ndk, isLoading, getTrustedProfiles } = useNostr();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!ndk || isLoading) return;

        setLoading(true);

        // For now, return mock data since we don't have real-time data
        const mockPosts: Post[] = [
            {
                id: '1',
                author: {
                    id: 'npub1dxd02kcjhgpkyrx60qnkd6j42kmc72u5lum0rp2ud8x5zfhnk4zscjj6hh',
                    name: 'MADTRIPS',
                    picture: 'https://i.pravatar.cc/150?img=1'
                },
                content: 'Just visited the amazing Fanal forest in Madeira! The fog creates such a mystical atmosphere. #madeira #fanal',
                createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
                tags: ['madeira', 'fanal']
            },
            {
                id: '2',
                author: {
                    id: 'npub1funchalx8v747rsee6ahsuyrcd2s3rnxlyrtumfex9lecpmgwars6hq8kc',
                    name: 'FUNCHAL',
                    picture: 'https://i.pravatar.cc/150?img=2'
                },
                content: 'The food festival in Funchal is happening this weekend! So many delicious traditional dishes to try. #funchal #madeira #food',
                createdAt: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
                tags: ['funchal', 'madeira', 'food']
            },
            {
                id: '3',
                author: {
                    id: 'npub1etgqcj9gc6yaxttuwu9eqgs3ynt2dzaudvwnrssrn2zdt2useaasfj8n6e',
                    name: 'COMMUNITY',
                    picture: 'https://i.pravatar.cc/150?img=3'
                },
                content: 'Planning to visit Madeira? Don\'t miss the levada walks, they offer stunning views of the island\'s natural beauty! #travelmadeira #visitmadeira',
                createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
                tags: ['travelmadeira', 'visitmadeira']
            }
        ];

        setPosts(mockPosts);
        setLoading(false);
    }, [ndk, isLoading, hashtags]);

    const formatTimeAgo = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);

        let interval = Math.floor(seconds / 31536000);
        if (interval > 1) return `${interval} years ago`;

        interval = Math.floor(seconds / 2592000);
        if (interval > 1) return `${interval} months ago`;

        interval = Math.floor(seconds / 86400);
        if (interval > 1) return `${interval} days ago`;

        interval = Math.floor(seconds / 3600);
        if (interval > 1) return `${interval} hours ago`;

        interval = Math.floor(seconds / 60);
        if (interval > 1) return `${interval} minutes ago`;

        return `${Math.floor(seconds)} seconds ago`;
    };

    if (loading) {
        return (
            <div className="flex justify-center p-6 bg-white rounded-lg shadow">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {posts.map(post => (
                <div key={post.id} className="p-4 bg-white rounded-lg shadow">
                    <div className="flex items-center mb-3">
                        {post.author.picture ? (
                            <img
                                src={post.author.picture}
                                className="w-10 h-10 rounded-full mr-3"
                                alt={post.author.name || 'User'}
                            />
                        ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                                <span className="text-gray-500">{post.author.name?.charAt(0) || '?'}</span>
                            </div>
                        )}
                        <div>
                            <div className="font-semibold">{post.author.name || post.author.id.slice(0, 8)}</div>
                            <div className="text-xs text-gray-500">{formatTimeAgo(post.createdAt)}</div>
                        </div>
                    </div>

                    <p className="mb-2">{post.content}</p>

                    <div className="flex flex-wrap gap-2">
                        {post.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CommunityFeed; 