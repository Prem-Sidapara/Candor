import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import useIdentity from "../hooks/useIdentity";

const MAX_CHARS = 500;
const MIN_CHARS = 10;

function CreatePostModal({ onClose, onPostCreated }) {
    const { user, loading: identityLoading } = useIdentity();
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const overlayRef = useRef(null);

    // Escape key se modal band karo
    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    // Sab kuch ek jagah validate karo
    const charCount = content.trim().length;
    const isValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS;

    async function handleSubmit() {
        if (!isValid || !user || submitting) return; // double-submit guard

        setSubmitting(true);
        setError(null);

        const { error: dbError } = await supabase
            .from("posts")
            .insert({ content: content.trim(), user_id: user.id });

        setSubmitting(false);

        if (dbError) {
            setError("Post nahi hua. Dobara try karo."); // user-friendly
            return;
        }

        onPostCreated?.(); // optional chaining — agar prop nahi diya toh crash nahi
        onClose();
    }

    // Overlay click se close (sirf overlay pe, content pe nahi)
    function handleOverlayClick(e) {
        if (e.target === overlayRef.current) onClose();
    }

    return (
        <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
        >
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                <h2 className="text-lg font-bold mb-4">Kya sach hai?</h2>

                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    maxLength={MAX_CHARS}
                    rows={4}
                    placeholder="Anonymously sach bol..."
                    className="w-full border rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                />

                {/* Char counter */}
                <p className={`text-xs text-right mt-1 ${charCount > MAX_CHARS * 0.9 ? "text-red-400" : "text-gray-400"}`}>
                    {charCount}/{MAX_CHARS}
                </p>

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                <div className="mt-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!isValid || submitting || identityLoading}
                        className="px-5 py-2 bg-black text-white text-sm rounded-full hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {submitting ? "Posting..." : "Post"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreatePostModal;