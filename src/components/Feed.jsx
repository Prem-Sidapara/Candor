import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import PostCard from './PostCard';

function Feed() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // useCallback — stable reference, realtime callback mein safe use hoga
    const fetchPosts = useCallback(async () => {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) setError('Posts load nahi hue. Refresh karo.');
        else setPosts(data);

        setLoading(false);
    }, []);

    useEffect(() => {
        fetchPosts();

        // Real-time: naya post aaye toh feed refresh ho
        const channel = supabase
            .channel('public:posts')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'posts',
            }, fetchPosts)
            .subscribe();

        return () => supabase.removeChannel(channel); // cleanup — memory leak nahi
    }, [fetchPosts]);

    if (loading) return (
        <div className="space-y-4 py-6">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse h-28" />
            ))}
        </div>
    );

    if (error) return (
        <p className="text-center text-red-400 py-10">{error}</p>
    );

    if (posts.length === 0) return (
        <p className="text-center text-gray-400 py-10">Abhi koi post nahi. Pehle wale bano! 🎤</p>
    );

    return (
        <div className="space-y-4 py-6">
            {posts.map((post) => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    );
}

export default Feed;