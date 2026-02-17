import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { Download, Star, User, Calendar, BookOpen, Shield, ArrowLeft, MessageSquare, Eye, X } from 'lucide-react';

const ResourceDetail = () => {
    const { id } = useParams();
    const [resource, setResource] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);

    useEffect(() => {
        const fetchResourceAndReviews = async () => {
            try {
                const [resData, reviewsData] = await Promise.all([
                    api.get(`/resources/${id}`),
                    api.get(`/resources/${id}/reviews`)
                ]);
                setResource(resData.data);
                setReviews(reviewsData.data);
            } catch (err) {
                console.error('Error fetching details:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchResourceAndReviews();
    }, [id]);

    const handleDownload = async () => {
        try {
            setDownloadLoading(true);
            const res = await api.get(`/resources/download/${id}`);
            window.open(res.data.downloadUrl, '_blank');
        } catch (err) {
            alert('Error generating download link');
        } finally {
            setDownloadLoading(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post(`/resources/${id}/reviews`, newReview);
            // Update reviews list (if new, add; if exists, update - for simplicity here just re-fetch or append)
            // Since API returns the review, let's just append for now if not exists, or map. 
            // Better to re-fetch to get user details populated if API doesn't return joined user
            const reviewsData = await api.get(`/resources/${id}/reviews`);
            setReviews(reviewsData.data);
            setNewReview({ rating: 5, comment: '' });
        } catch (err) {
            alert('Error submitting review');
        }
    };

    const handlePreview = async () => {
        try {
            setPreviewLoading(true);
            const res = await api.get(`/resources/preview/${id}`);
            window.open(res.data.previewUrl, '_blank');
        } catch (err) {
            alert('Error loading preview');
        } finally {
            setPreviewLoading(false);
        }
    };

    if (loading) return <div className="text-stone-600 text-center mt-20">Loading...</div>;
    if (!resource) return <div className="text-stone-600 text-center mt-20">Resource not found</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Link to="/dashboard" className="text-amber-700 hover:text-amber-800 flex items-center gap-2 mb-6">
                <ArrowLeft size={20} /> Back to Dashboard
            </Link>

            <div className="glass-card p-8 rounded-2xl mb-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-stone-900 mb-2">{resource.title}</h1>
                        <div className="flex flex-wrap gap-4 text-stone-500 text-sm">
                            <span className="flex items-center gap-1"><BookOpen size={16} /> {resource.subject}</span>
                            <span className="flex items-center gap-1"><Calendar size={16} /> Sem {resource.semester} • {resource.year} • {resource.branch}</span>
                            <span className="flex items-center gap-1"><Shield size={16} className={resource.privacy_level === 'PRIVATE' ? 'text-red-500' : 'text-green-600'} /> {resource.privacy_level}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePreview}
                            className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Eye size={20} /> Preview
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={downloadLoading}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Download size={20} /> {downloadLoading ? 'Generating...' : 'Download'}
                        </button>
                    </div>
                </div>

                <div className="text-stone-700 leading-relaxed mb-6">
                    {resource.description || 'No description provided.'}
                </div>

                <div className="border-t border-stone-200 pt-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-100 p-2 rounded-full">
                            <User className="text-amber-700" size={24} />
                        </div>
                        <div>
                            <div className="text-stone-900 font-medium">{resource.uploader?.name || 'Unknown User'}</div>
                            <div className="text-stone-500 text-sm">{resource.uploader?.college}</div>
                        </div>
                    </div>
                    <div className="text-stone-500 text-sm">
                        Uploaded on {new Date(resource.created_at).toLocaleDateString()}
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* ... existing review section ... */}
                <div className="glass-card p-6 rounded-xl h-fit">
                    <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                        <Star className="text-yellow-500" /> Rate & Review
                    </h3>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div>
                            <label className="block text-stone-700 mb-2">Rating</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setNewReview({ ...newReview, rating: star })}
                                        className={`p-1 transition-colors ${newReview.rating >= star ? 'text-yellow-500' : 'text-stone-300'}`}
                                    >
                                        <Star fill={newReview.rating >= star ? 'currentColor' : 'none'} size={28} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-stone-700 mb-2">Your Review</label>
                            <textarea
                                value={newReview.comment}
                                onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                                className="glass-input w-full h-32"
                                placeholder="Was this resource helpful?"
                            />
                        </div>
                        <button type="submit" className="w-full btn-primary font-medium">
                            Submit Review
                        </button>
                    </form>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                        <MessageSquare className="text-blue-500" /> Recent Reviews
                    </h3>
                    {reviews.length === 0 ? (
                        <div className="text-stone-500 italic">No reviews yet. Be the first!</div>
                    ) : (
                        reviews.map(review => (
                            <div key={review.id} className="glass-card p-4 rounded-xl">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-stone-900">{review.user?.name}</span>
                                        <span className="text-stone-500 text-xs">{new Date(review.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex text-yellow-500">
                                        {[...Array(review.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                    </div>
                                </div>
                                <p className="text-stone-700 text-sm">{review.comment}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>


        </div>
    );
};

export default ResourceDetail;
