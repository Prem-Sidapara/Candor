
function PostCard({ post }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <p className="text-gray-800 text-lg leading-relaxed">{post.content}</p>
            {post.image_url && (
                <img
                    src={post.image_url}
                    alt="Post attachment"
                    className="mt-3 rounded-lg w-full h-64 object-cover"
                />
            )}
            <div className="mt-4 flex items-center space-x-4 text-gray-500 text-sm">
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                {/* Add Vote Buttons Here Later */}
            </div>
        </div>
    );
}

export default PostCard;
