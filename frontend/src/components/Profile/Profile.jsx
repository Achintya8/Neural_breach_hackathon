import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { Edit, Trash2, Eye, Download, Star } from 'lucide-react';

const Profile = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editResource, setEditResource] = useState(null); // Resource being edited
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        privacy_level: 'PUBLIC'
    });

    useEffect(() => {
        const fetchMyResources = async () => {
            try {
                const res = await api.get('/resources/my-resources');
                setResources(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMyResources();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this resource?')) {
            try {
                await api.delete(`/resources/${id}`);
                setResources(resources.filter(res => res.id !== id));
            } catch (err) {
                alert('Failed to delete resource');
            }
        }
    };

    const handleEditClick = (resource) => {
        setEditResource(resource);
        setFormData({
            title: resource.title,
            description: resource.description,
            privacy_level: resource.privacy_level
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/resources/${editResource.id}`, formData);
            setResources(resources.map(r => r.id === editResource.id ? res.data : r));
            setEditResource(null);
        } catch (err) {
            alert('Failed to update resource');
        }
    };

    if (loading) return <div className="text-center mt-20 text-stone-600">Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* User Info */}
            <div className="glass-card p-8 rounded-2xl mb-8 flex items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-linear-to-r from-amber-500 to-orange-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                    {user?.name?.charAt(0)}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">{user?.name}</h1>
                    <p className="text-stone-600">{user?.email}</p>
                    <div className="mt-2 flex gap-4 text-sm text-stone-500">
                        <span>{user?.college}</span>
                        <span>•</span>
                        <span>{resources.length} Uploads</span>
                    </div>
                </div>
            </div>

            {/* Uploads List */}
            <h2 className="text-2xl font-bold text-stone-900 mb-6">My Uploads</h2>

            {resources.length === 0 ? (
                <div className="text-center py-20 bg-stone-100 rounded-xl border border-dashed border-stone-300">
                    <p className="text-stone-500 text-lg mb-4">You haven't uploaded any resources yet.</p>
                    <Link to="/upload" className="btn-primary inline-flex items-center gap-2">
                        Upload Now
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map(resource => (
                        <div key={resource.id} className="glass-card rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${resource.type === 'NOTES' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                        {resource.type}
                                    </span>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEditClick(resource)} className="p-2 hover:bg-stone-100 rounded-full text-stone-600 hover:text-amber-600 transition-colors">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(resource.id)} className="p-2 hover:bg-stone-100 rounded-full text-stone-600 hover:text-red-600 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-stone-900 mb-2 line-clamp-1">{resource.title}</h3>
                                <p className="text-stone-600 text-sm mb-4 line-clamp-2">{resource.description}</p>

                                <div className="flex items-center gap-4 text-sm text-stone-500 mb-4">
                                    <span className="flex items-center gap-1"><Eye size={14} /> 120</span> {/* Mock data for now */}
                                    <span className="flex items-center gap-1"><Download size={14} /> 45</span>
                                    <span className="flex items-center gap-1 text-amber-500"><Star size={14} fill="currentColor" /> {resource.avgRating || 0}</span>
                                </div>

                                <Link to={`/resource/${resource.id}`} className="block w-full text-center py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editResource && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl animate-fade-in">
                        <h3 className="text-2xl font-bold text-stone-900 mb-6">Edit Resource</h3>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-stone-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="glass-input w-full"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-stone-700 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="glass-input w-full h-24"
                                />
                            </div>
                            <div>
                                <label className="block text-stone-700 mb-2">Privacy</label>
                                <select
                                    value={formData.privacy_level}
                                    onChange={e => setFormData({ ...formData, privacy_level: e.target.value })}
                                    className="glass-input w-full"
                                >
                                    <option value="PUBLIC">Public</option>
                                    <option value="PRIVATE">Private</option>
                                </select>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditResource(null)}
                                    className="flex-1 py-2 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 btn-primary"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
