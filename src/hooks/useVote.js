import { useReducer, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useVote — handles upvote/downvote logic for a single post.
 *
 * Best practices applied:
 *  ✅ useReducer   — atomic state transitions, no split-state inconsistency
 *  ✅ useRef guard — synchronous isVoting flag, fixes race condition on rapid clicks
 *  ✅ useRef state — castVote always reads latest state, no stale closure
 *  ✅ Stable deps  — castVote only depends on [postId, userId], PostCard won't re-render needlessly
 *  ✅ error state  — exposed so UI can show "Vote failed" feedback
 *  ✅ Optimistic UI with rollback
 *  ✅ Vote toggle (same vote = undo)
 */

// --- Pure reducer: all state transitions in one place ---
function reducer(state, action) {
    switch (action.type) {

        case 'OPTIMISTIC': {
            const { prevVote, nextVote, prevCounts } = action;
            const next = { ...prevCounts };

            // Remove old vote
            if (prevVote === 'up') next.up = Math.max(0, next.up - 1);
            if (prevVote === 'down') next.down = Math.max(0, next.down - 1);

            // Add new vote (null = toggle off, so nothing added)
            if (nextVote === 'up') next.up += 1;
            if (nextVote === 'down') next.down += 1;

            return { ...state, counts: next, userVote: nextVote, isVoting: true, error: null };
        }

        case 'SUCCESS':
            return { ...state, isVoting: false };

        case 'ROLLBACK':
            return {
                ...state,
                counts: action.prevCounts,
                userVote: action.prevVote,
                isVoting: false,
                error: 'Vote failed. Try again.',
            };

        default:
            return state;
    }
}

function useVote({ postId, initialUp = 0, initialDown = 0, myVote = null, userId }) {

    const [state, dispatch] = useReducer(reducer, {
        counts: { up: initialUp, down: initialDown },
        userVote: myVote,   // 'up' | 'down' | null
        isVoting: false,
        error: null,
    });

    // ✅ Ref-based guard — updates synchronously, no race condition
    const isVotingRef = useRef(false);

    // ✅ Always-latest state ref — castVote reads this, not stale closure
    const stateRef = useRef(state);
    stateRef.current = state;

    const castVote = useCallback(async (type) => {
        // Synchronous check — ref is never stale unlike useState
        if (isVotingRef.current || userId == null) return;
        isVotingRef.current = true;

        const { counts: prevCounts, userVote: prevVote } = stateRef.current;

        const isToggle = prevVote === type;       // same vote = undo
        const nextVote = isToggle ? null : type;  // null if toggle off

        // Optimistic update
        dispatch({ type: 'OPTIMISTIC', prevVote, nextVote, prevCounts });

        try {
            if (prevVote) {
                // Delete old vote (handles toggle + vote-switch both)
                const { error: delErr } = await supabase
                    .from('post_votes')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', userId);

                if (delErr) throw delErr;
            }

            if (!isToggle) {
                // Insert new vote
                const { error: insErr } = await supabase
                    .from('post_votes')
                    .insert({ post_id: postId, user_id: userId, vote_type: type });

                if (insErr) throw insErr;
            }

            dispatch({ type: 'SUCCESS' });

        } catch (err) {
            console.error('[useVote] Vote failed, rolling back:', err.message);
            dispatch({ type: 'ROLLBACK', prevCounts, prevVote });
        } finally {
            // Always release — even if component unmounts mid-flight, ref is safe
            isVotingRef.current = false;
        }

    }, [postId, userId]); // ✅ Only stable values — no stale closure, no needless re-renders

    return {
        counts: state.counts,
        userVote: state.userVote,
        isVoting: state.isVoting,
        error: state.error,      // ✅ Exposed — PostCard can show failure feedback
        castVote,
    };
}

export default useVote;
