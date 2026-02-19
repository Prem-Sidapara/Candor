import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import PostCard from './PostCard';

function Feed() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetchPosts();
    }, []);

    async function fetchPosts() {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching:', error);
        else setPosts(data);
    }

    return (
        <div className="space-y-4 py-6">
            {posts.map((post) => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    );
}

export default Feed;
