import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { Plus, Lock, Globe, Trash2, FolderOpen } from 'lucide-react';

const CollectionList = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCollection, setNewCollection] = useState({ title: '', description: '', privacy: 'PRIVATE' });
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            const res = await api.get('/collections?type=my');
            setCollections(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching collections:', err);
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/collections', newCollection);
            setShowCreateModal(false);
            setNewCollection({ title: '', description: '', privacy: 'PRIVATE' });
            fetchCollections();
        } catch (err) {
            alert('Error creating collection');
        }
    };

    const handleDelete = async (id, e) => {
        e.preventDefault(); // Prevent navigation
        if (!window.confirm('Delete this collection?')) return;
        try {
            await api.delete(`/collections/${id}`);
            fetchCollections();
        } catch (err) {
            alert('Error deleting collection');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading collections...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-stone-900 flex items-center gap-2">
                    <FolderOpen className="text-amber-600" /> My Collections
                </h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} /> New Collection
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                        <FolderOpen size={48} className="mx-auto text-stone-300 mb-4" />
                        <h3 className="text-lg font-medium text-stone-900">No collections yet</h3>
                        <p className="text-stone-500 mb-4">Create collections to organize your favorite resources.</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="text-amber-600 font-medium hover:underline"
                        >
                            Create your first collection
                        </button>
                    </div>
                ) : (
                    collections.map(collection => (
                        <Link
                            key={collection.id}
                            to={`/collections/${collection.id}`}
                            className="glass-card p-6 rounded-xl hover:shadow-xl transition-all group relative block"
                        >
                            <div className="absolute top-4 right-4">
                                {collection.privacy === 'PRIVATE' ? (
                                    <Lock size={16} className="text-stone-400" />
                                ) : (
                                    <Globe size={16} className="text-green-500" />
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-stone-900 mb-2 group-hover:text-amber-700 transition-colors">
                                {collection.title}
                            </h3>
                            <p className="text-stone-500 text-sm mb-4 line-clamp-2 h-10">
                                {collection.description || 'No description'}
                            </p>

                            <div className="flex items-center justify-between text-xs text-stone-400 border-t border-stone-100 pt-4">
                                <span>{collection.resources?.length || 0} resources</span>
                                <button
                                    onClick={(e) => handleDelete(collection.id, e)}
                                    className="p-2 hover:bg-red-50 text-stone-400 hover:text-red-500 rounded-full transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-fade-in">
                        <h2 className="text-2xl font-bold text-stone-900 mb-6">Create Collection</h2>
                        <form onSubmit={handleCreate}>
                            <div className="mb-4">
                                <label className="block text-stone-700 mb-2 font-medium">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={newCollection.title}
                                    onChange={e => setNewCollection({ ...newCollection, title: e.target.value })}
                                    className="glass-input w-full"
                                    placeholder="e.g., Exam Prep"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-stone-700 mb-2 font-medium">Description</label>
                                <textarea
                                    value={newCollection.description}
                                    onChange={e => setNewCollection({ ...newCollection, description: e.target.value })}
                                    className="glass-input w-full h-24"
                                    placeholder="What's this collection about?"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-stone-700 mb-2 font-medium">Privacy</label>
                                <select
                                    value={newCollection.privacy}
                                    onChange={e => setNewCollection({ ...newCollection, privacy: e.target.value })}
                                    className="glass-input w-full"
                                >
                                    <option value="PRIVATE">Private (Only me)</option>
                                    <option value="PUBLIC">Public (Everyone)</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary px-6 py-2"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollectionList;
