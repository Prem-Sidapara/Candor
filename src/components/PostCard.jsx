
const ACCENTS = [
    { bg: '#8b5cf6', to: '#a78bfa' }, // violet
    { bg: '#ec4899', to: '#fb7185' }, // pink
    { bg: '#3b82f6', to: '#22d3ee' }, // blue
    { bg: '#f59e0b', to: '#fb923c' }, // amber
    { bg: '#10b981', to: '#2dd4bf' }, // emerald
];

function PostCard({ post }) {
    const accent = ACCENTS[(post.id ?? 0) % ACCENTS.length];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden">
            {/* Accent bar — inline style avoids Tailwind dynamic class issue */}
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

                {/* Content — inline style clamp for v4 safety */}
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
                    <span>
                        🕒 {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex items-center gap-3">
                        <span className="hover:text-rose-400 cursor-pointer transition">
                            ❤️ {post.vote_count ?? 0}
                        </span>
                        <span className="hover:text-violet-500 cursor-pointer transition">
                            💬 {post.comment_count ?? 0}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PostCard;
