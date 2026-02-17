import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, User, Reply, Trash2, CheckSquare, Square } from 'lucide-react';

const DiscussionSection = ({ resourceId, currentUserId }) => {
    const [discussions, setDiscussions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null); // ID of comment being replied to
    const [replyContent, setReplyContent] = useState('');

    // Load user info for "posting" since we don't have a backend join
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchDiscussions();
    }, [resourceId]);

    const fetchDiscussions = () => {
        try {
            const allDiscussions = JSON.parse(localStorage.getItem('resource_discussions') || '{}');
            const resourceComments = allDiscussions[resourceId] || [];
            setDiscussions(resourceComments);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching discussions from local storage:', err);
            setLoading(false);
        }
    };

    const saveDiscussions = (updatedComments) => {
        const allDiscussions = JSON.parse(localStorage.getItem('resource_discussions') || '{}');
        allDiscussions[resourceId] = updatedComments;
        localStorage.setItem('resource_discussions', JSON.stringify(allDiscussions));
        setDiscussions(updatedComments);
    };

    const handlePostComment = (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const comment = {
            id: Date.now().toString(),
            content: newComment,
            is_anonymous: isAnonymous,
            parent_id: null,
            resource_id: resourceId,
            user_id: currentUserId,
            created_at: new Date().toISOString(),
            user: {
                name: currentUser.name || 'Unknown',
                profile_pic: currentUser.profile_pic || null
            }
        };

        const updatedDiscussions = [...discussions, comment];
        saveDiscussions(updatedDiscussions);

        setNewComment('');
        setIsAnonymous(false);
    };

    const handlePostReply = (e, parentId) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        const reply = {
            id: Date.now().toString(),
            content: replyContent,
            is_anonymous: false, // Replies usually identifiable
            parent_id: parentId,
            resource_id: resourceId,
            user_id: currentUserId,
            created_at: new Date().toISOString(),
            user: {
                name: currentUser.name || 'Unknown',
                profile_pic: currentUser.profile_pic || null
            }
        };

        const updatedDiscussions = [...discussions, reply];
        saveDiscussions(updatedDiscussions);

        setReplyContent('');
        setReplyingTo(null);
    };

    const handleDelete = (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;

        // Filter out the comment AND any replies to it (simple cascade)
        const updatedDiscussions = discussions.filter(d => d.id !== commentId && d.parent_id !== commentId);
        saveDiscussions(updatedDiscussions);
    };

    // Helper to organize comments into a tree (or just filter for rendering)
    const rootComments = discussions.filter(d => !d.parent_id);
    const getReplies = (parentId) => discussions.filter(d => d.parent_id === parentId);

    const CommentItem = ({ comment, isReply = false }) => {
        const isOwner = comment.user_id === currentUserId;
        const replies = getReplies(comment.id);

        return (
            <div className={`${isReply ? 'ml-12 mt-3 pl-4 border-l-2 border-stone-200' : 'mb-6 glass-card p-4 rounded-xl'}`}>
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                        {comment.is_anonymous ? (
                            <div className="rounded-full p-1 bg-stone-200">
                                <User size={20} className="text-stone-500" />
                            </div>
                        ) : (
                            comment.user?.profile_pic ? (
                                <img src={comment.user.profile_pic} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-stone-200" />
                            ) : (
                                <div className="rounded-full p-1 bg-amber-100">
                                    <User size={20} className="text-amber-700" />
                                </div>
                            )
                        )}
                        <div>
                            <div className="font-bold text-stone-900 text-sm">
                                {comment.is_anonymous ? 'Anonymous User' : comment.user?.name}
                            </div>
                            <div className="text-stone-400 text-xs">
                                {new Date(comment.created_at).toLocaleDateString()} at {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                    {isOwner && (
                        <button onClick={() => handleDelete(comment.id)} className="text-stone-400 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>

                <div className="text-stone-800 text-sm mb-3 whitespace-pre-wrap">{comment.content}</div>

                {!isReply && (
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            className="flex items-center gap-1 text-stone-500 hover:text-amber-600 text-xs font-medium transition-colors"
                        >
                            <Reply size={14} /> {replyingTo === comment.id ? 'Cancel Reply' : 'Reply'}
                        </button>
                    </div>
                )}

                {/* Reply Form */}
                {replyingTo === comment.id && (
                    <form onSubmit={(e) => handlePostReply(e, comment.id)} className="mt-3 flex gap-2 animate-fade-in">
                        <input
                            type="text"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            className="flex-1 glass-input text-sm py-2"
                            autoFocus
                        />
                        <button type="submit" className="btn-primary py-2 px-3">
                            <Send size={16} />
                        </button>
                    </form>
                )}

                {/* Nested Replies */}
                {replies.length > 0 && (
                    <div className="mt-3">
                        {replies.map(reply => (
                            <CommentItem key={reply.id} comment={reply} isReply={true} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="mt-8">
            <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                <MessageCircle className="text-indigo-600" /> Discussion Forum
            </h3>

            {/* Main Post Form */}
            <div className="glass-card p-4 rounded-xl mb-8">
                <form onSubmit={handlePostComment}>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Ask a question or share your thoughts..."
                        className="glass-input w-full h-24 mb-3 resize-none"
                    />
                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            onClick={() => setIsAnonymous(!isAnonymous)}
                            className={`flex items-center gap-2 text-sm font-medium transition-colors ${isAnonymous ? 'text-indigo-600' : 'text-stone-500 hover:text-stone-700'}`}
                        >
                            {isAnonymous ? <CheckSquare size={18} /> : <Square size={18} />}
                            Ask Anonymously
                        </button>
                        <button type="button" onClick={handlePostComment} className="btn-primary flex items-center gap-2">
                            <Send size={18} /> Post
                        </button>
                    </div>
                </form>
            </div>

            {/* Discussion List */}
            {loading ? (
                <div className="text-center text-stone-500 py-4">Loading discussions...</div>
            ) : rootComments.length === 0 ? (
                <div className="text-center text-stone-400 py-8 italic bg-stone-50/50 rounded-xl border border-dashed border-stone-200">
                    No discussions yet. Start the conversation!
                </div>
            ) : (
                <div className="space-y-4">
                    {rootComments.map(comment => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default DiscussionSection;
