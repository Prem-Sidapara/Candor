import { useEffect, useReducer, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import PostCard from './PostCard';
import getOrCreateUser from '../lib/identity';

// ─── Reducer ────────────────────────────────────────────────────────────────
// All feed state in one place — atomic transitions, one re-render per action
const initialState = {
    posts: [],
    myVotes: {},   // { [postId]: 'up' | 'down' }
    userId: null,
    loading: true,
    error: null,
};

function reducer(state, action) {
    switch (action.type) {
        case 'LOADED':
            return { ...state, loading: false, posts: action.posts };

        case 'ERROR':
            return { ...state, loading: false, error: action.message };

        case 'USER_READY':
            return { ...state, userId: action.userId };

        case 'MY_VOTES_LOADED':
            return { ...state, myVotes: action.map };

        // ✅ New post inserted via realtime — prepend instead of full re-fetch
        case 'POST_PREPEND':
            return {
                ...state,
                // Avoid duplicates (realtime can fire twice in StrictMode)
                posts: state.posts.some(p => p.id === action.post.id)
                    ? state.posts
                    : [action.post, ...state.posts],
            };

        default:
            return state;
    }
}

// ─── Feed ────────────────────────────────────────────────────────────────────
function Feed() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { posts, myVotes, userId, loading, error } = state;

    // ── Fetch initial posts ────────────────────────────────────────────────
    const fetchPosts = useCallback(async () => {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) dispatch({ type: 'ERROR', message: 'Posts load nahi hue. Refresh karo.' });
        else dispatch({ type: 'LOADED', posts: data ?? [] });
    }, []);

    // ── Fetch this user's existing votes ──────────────────────────────────
    const fetchMyVotes = useCallback(async (uid) => {
        if (!uid) return;

        const { data, error } = await supabase
            .from('post_votes')
            .select('post_id, vote_type')
            .eq('user_id', uid);

        if (error) {
            console.error('[Feed] fetchMyVotes failed:', error.message);
            return;
        }

        // Array → lookup map for O(1) access in PostCard
        const map = Object.fromEntries(
            (data ?? []).map(({ post_id, vote_type }) => [post_id, vote_type])
        );
        dispatch({ type: 'MY_VOTES_LOADED', map });
    }, []);

    // ── Bootstrap ─────────────────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;

        async function init() {
            // 1. Resolve identity
            try {
                const user = await getOrCreateUser();
                if (!cancelled) {
                    dispatch({ type: 'USER_READY', userId: user.id });
                    fetchMyVotes(user.id);
                }
            } catch (err) {
                // Identity failure is non-fatal — feed still loads, votes just disabled
                console.error('[Feed] Identity error:', err.message);
            }

            // 2. Load posts
            if (!cancelled) fetchPosts();
        }

        init();

        // ✅ Realtime: prepend new post — no full re-fetch, no extra DB round-trip
        const channel = supabase
            .channel('public:posts')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'posts',
            }, ({ new: post }) => {
                if (!cancelled) dispatch({ type: 'POST_PREPEND', post });
            })
            .subscribe();

        return () => {
            cancelled = true;
            supabase.removeChannel(channel);
        };
    }, [fetchPosts, fetchMyVotes]);

    // ── Render states ─────────────────────────────────────────────────────
    if (loading) return (
        <div className="grid grid-cols-2 gap-4 py-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse h-40" />
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
        <div className="grid grid-cols-2 gap-4 py-6">
            {posts.map((post) => (
                <PostCard
                    key={post.id}
                    post={post}
                    userId={userId}
                    myVote={myVotes[post.id] ?? null}
                />
            ))}
        </div>
    );
}

export default Feed;