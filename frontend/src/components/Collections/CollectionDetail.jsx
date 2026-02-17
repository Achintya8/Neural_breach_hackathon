import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { ArrowLeft, Lock, Globe, FolderOpen, Trash2, FileText, User } from 'lucide-react';

const CollectionDetail = () => {
    const { id } = useParams();
    const [collection, setCollection] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchCollection();
    }, [id]);

    const fetchCollection = async () => {
        try {
            const res = await api.get(`/collections/${id}`);
            setCollection(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching collection:', err);
            setLoading(false);
        }
    };

    const handleRemoveResource = async (resourceId) => {
        if (!window.confirm('Remove from collection?')) return;
        try {
            await api.delete(`/collections/${id}/resources/${resourceId}`);
            fetchCollection(); // Refresh
        } catch (err) {
            alert('Error removing resource');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading collection...</div>;
    if (!collection) return <div className="p-8 text-center">Collection not found</div>;

    const isOwner = collection.user_id === user.id;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link to="/collections" className="text-amber-700 hover:text-amber-800 flex items-center gap-2 mb-6">
                <ArrowLeft size={20} /> Back to Collections
            </Link>

            <div className="glass-card p-8 rounded-2xl mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-stone-900">{collection.title}</h1>
                            {collection.privacy === 'PRIVATE' ? (
                                <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <Lock size={12} /> Private
                                </span>
                            ) : (
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <Globe size={12} /> Public
                                </span>
                            )}
                        </div>
                        <p className="text-stone-600 mb-4">{collection.description}</p>
                        <div className="flex items-center gap-2 text-sm text-stone-500">
                            <span className="font-medium">Created by:</span>
                            <div className="flex items-center gap-1">
                                {collection.user?.profile_pic ? (
                                    <img src={collection.user.profile_pic} className="w-5 h-5 rounded-full" alt="" />
                                ) : (
                                    <User size={14} />
                                )}
                                {collection.user?.name}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                <FolderOpen className="text-amber-600" /> Resources ({collection.resources?.length || 0})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collection.resources?.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-stone-500 italic bg-stone-50 rounded-xl">
                        No resources in this collection yet.
                    </div>
                ) : (
                    collection.resources.map(resource => (
                        <div key={resource.id} className="glass-card p-5 rounded-xl group relative">
                            <Link to={`/resources/${resource.id}`} className="block">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                                        <FileText size={24} />
                                    </div>
                                    {isOwner && (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleRemoveResource(resource.id);
                                            }}
                                            className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                                            title="Remove from collection"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                                <h3 className="font-bold text-stone-900 mb-1 group-hover:text-amber-700 transition-colors line-clamp-1">
                                    {resource.title}
                                </h3>
                                <div className="text-xs text-stone-500 flex gap-2">
                                    <span>{resource.branch}</span>
                                    <span>•</span>
                                    <span>{resource.subject}</span>
                                </div>
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CollectionDetail;
