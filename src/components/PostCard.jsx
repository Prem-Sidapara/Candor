import { useMemo } from 'react';
import useVote from '../hooks/useVote';

const ACCENTS = [
    { bg: '#8b5cf6', to: '#a78bfa' }, // violet
    { bg: '#ec4899', to: '#fb7185' }, // pink
    { bg: '#3b82f6', to: '#22d3ee' }, // blue
    { bg: '#f59e0b', to: '#fb923c' }, // amber
    { bg: '#10b981', to: '#2dd4bf' }, // emerald
];

// ✅ Helper — computes vote button style based on active state
// Extracted here so it's not re-declared inside the component on every render
function voteButtonStyle(isActive, activeColor, activeBg, disabled) {
    return {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 8px',
        borderRadius: '999px',
        border: '1px solid',
        borderColor: isActive ? activeColor : '#e5e7eb',
        background: isActive ? activeBg : 'transparent',
        color: isActive ? activeColor : '#9ca3af',
        fontWeight: isActive ? 700 : 400,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.15s ease',
        fontSize: '12px',
    };
}

/**
 * PostCard
 * props:
 *   post    — post row from DB
 *   userId  — anonymous_users.id (uuid) of the current user
 *   myVote  — 'up' | 'down' | null  (user's pre-existing vote, from Feed)
 */
function PostCard({ post, userId, myVote = null }) {
    // ✅ accent lookup is deterministic — stable across renders
    const accent = ACCENTS[(post.id ?? 0) % ACCENTS.length];

    const { counts, userVote, isVoting, error: voteError, castVote } = useVote({
        postId: post.id,
        initialUp: post.upvotes ?? 0,
        initialDown: post.downvotes ?? 0,
        myVote,
        userId,
    });

    // ✅ Computed values via useMemo — not recalculated on unrelated re-renders
    const netScore = useMemo(() => counts.up - counts.down, [counts]);

    const formattedDate = useMemo(
        () => new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        [post.created_at]
    );

    const isDisabled = isVoting || userId == null;

    const upStyle = useMemo(
        () => voteButtonStyle(userVote === 'up', '#7c3aed', '#ede9fe', isDisabled),
        [userVote, isDisabled]
    );
    const downStyle = useMemo(
        () => voteButtonStyle(userVote === 'down', '#e11d48', '#ffe4e6', isDisabled),
        [userVote, isDisabled]
    );

    const netScoreStyle = useMemo(() => ({
        minWidth: '28px',
        textAlign: 'center',
        fontWeight: 700,
        color: netScore > 0 ? '#7c3aed' : netScore < 0 ? '#e11d48' : '#9ca3af',
        fontSize: '12px',
    }), [netScore]);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden">
            {/* Accent bar */}
            <div
                style={{
                    height: '5px',
                    background: `linear-gradient(to right, ${accent.bg}, ${accent.to})`,
                }}
            />

            <div className="p-5 flex flex-col flex-1">
                {/* Topic tag */}
                {post.topic && (
                    <span className="inline-block text-xs font-semibold text-violet-600 bg-violet-50 rounded-full px-3 py-0.5 mb-3 self-start">
                        #{post.topic}
                    </span>
                )}

                {/* Content — 5-line clamp */}
                <p
                    className="text-gray-800 text-sm leading-relaxed flex-1"
                    style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 5,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {post.content}
                </p>

                {/* Image */}
                {post.image_url && (
                    <img
                        src={post.image_url}
                        alt="Post attachment"
                        className="mt-3 rounded-xl w-full h-40 object-cover"
                    />
                )}

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-gray-400 text-xs">
                    <span>🕒 {formattedDate}</span>

                    <div className="flex items-center gap-2">
                        {/* Upvote */}
                        <button onClick={() => castVote('up')} disabled={isDisabled} title="Upvote" style={upStyle}>
                            ▲ {counts.up}
                        </button>

                        {/* Net score */}
                        <span style={netScoreStyle}>
                            {netScore > 0 ? '+' : ''}{netScore}
                        </span>

                        {/* Downvote */}
                        <button onClick={() => castVote('down')} disabled={isDisabled} title="Downvote" style={downStyle}>
                            ▼ {counts.down}
                        </button>

                        {/* Comment count */}
                        <span className="hover:text-violet-500 cursor-pointer transition ml-1">
                            💬 {post.comment_count ?? 0}
                        </span>
                    </div>
                </div>

                {/* Vote error feedback */}
                {voteError && (
                    <p style={{ color: '#e11d48', fontSize: '11px', marginTop: '6px', textAlign: 'right' }}>
                        ⚠️ {voteError}
                    </p>
                )}
            </div>
        </div>
    );
}

export default PostCard;
