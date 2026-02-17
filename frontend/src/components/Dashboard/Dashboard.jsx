import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { Calendar, BookOpen, User, Tag, Shield, Search, Star, Download, Eye, Bookmark } from 'lucide-react';

const Dashboard = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        subject: '',
        semester: '',
        type: '',
        privacy_level: '',
        branch: '',
        sort: 'latest'
    });
    const [showCollectionModal, setShowCollectionModal] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);
    const [collections, setCollections] = useState([]);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.subject) params.append('subject', filters.subject);
            if (filters.semester) params.append('semester', filters.semester);
            if (filters.type) params.append('type', filters.type);
            if (filters.privacy_level) params.append('privacy_level', filters.privacy_level);
            if (filters.branch) params.append('branch', filters.branch);
            if (filters.sort) params.append('sort', filters.sort);

            const res = await api.get(`/resources?${params.toString()}`);
            setResources(res.data);
        } catch (err) {
            console.error('Error fetching resources:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, [filters]); // Re-fetch when filters change implementation usually needs debounce, but simple for now

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = (e) => {
        e.preventDefault(); // Keep original behavior of preventing default form submission
        // The instruction's handleSearch included setSearchTerm(e.target.value);
        // However, setSearchTerm is not defined and filters.search is already handled by handleFilterChange.
        // Assuming the intent was to trigger a search based on current filters.
        fetchResources();
    };

    const openCollectionModal = async (resource) => {
        setSelectedResource(resource);
        try {
            const res = await api.get('/collections?type=my');
            setCollections(res.data);
            setShowCollectionModal(true);
        } catch (err) {
            console.error('Error fetching collections:', err);
        }
    };

    const handleAddToCollection = async (collectionId) => {
        try {
            await api.post(`/collections/${collectionId}/resources`, {
                resourceId: selectedResource.id
            });
            alert('Added to collection!');
            setShowCollectionModal(false);
        } catch (err) {
            alert('Error adding to collection');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-stone-900">Resource Library</h1>
                <Link
                    to="/upload"
                    className="btn-primary flex items-center gap-2"
                >
                    <BookOpen size={20} />
                    Upload Resource
                </Link>
            </div>

            {/* Search and Filter Bar */}
            <div className="glass-card p-6 rounded-xl mb-8 space-y-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <form onSubmit={handleSearch} className="flex-1 flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 text-stone-400" size={20} />
                            <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                placeholder="Search by title, description, or subject..."
                                className="glass-input w-full pl-10"
                            />
                        </div>
                        <button type="submit" className="btn-primary">
                            Search
                        </button>
                    </form>

                    <div className="flex gap-4">
                        <select
                            name="sort"
                            value={filters.sort}
                            onChange={handleFilterChange}
                            className="glass-input w-40"
                        >
                            <option value="latest">Latest</option>
                            <option value="oldest">Oldest</option>
                            <option value="popular">Most Popular</option>
                            <option value="rated">Highest Rated</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <select
                        name="privacy_level"
                        value={filters.privacy_level}
                        onChange={handleFilterChange}
                        className="glass-input"
                    >
                        <option value="">All Privacy</option>
                        <option value="PUBLIC">Public</option>
                        <option value="PRIVATE">Private (My College)</option>
                    </select>

                    <select
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                        className="glass-input"
                    >
                        <option value="">All Types</option>
                        <option value="NOTES">Notes</option>
                        <option value="QUESTION_PAPER">Question Paper</option>
                        <option value="SOLUTION">Solution</option>
                        <option value="PROJECT_REPORT">Project Report</option>
                    </select>

                    <select
                        name="semester"
                        value={filters.semester}
                        onChange={handleFilterChange}
                        className="glass-input"
                    >
                        <option value="">All Semesters</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                            <option key={s} value={s}>Semester {s}</option>
                        ))}
                    </select>

                    <select
                        name="branch"
                        value={filters.branch}
                        onChange={handleFilterChange}
                        className="glass-input"
                    >
                        <option value="">All Branches</option>
                        <option value="CSE">CSE</option>
                        <option value="ECE">ECE</option>
                        <option value="ME">ME</option>
                        <option value="CE">CE</option>
                        <option value="EE">EE</option>
                        <option value="IT">IT</option>
                        <option value="OTHER">Other</option>
                    </select>

                    <input
                        type="text"
                        name="subject"
                        value={filters.subject}
                        onChange={handleFilterChange}
                        placeholder="Filter by Subject"
                        className="glass-input"
                    />
                </div>
            </div>

            {/* Resource Grid */}
            {loading ? (
                <div className="text-center text-stone-600 text-xl mt-12">Loading resources...</div>
            ) : resources.length === 0 ? (
                <div className="text-center text-stone-500 text-xl mt-12">No resources found. Upload one!</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map(resource => (
                        <div key={resource.id} className="glass-card p-6 rounded-xl hover:bg-amber-50/50 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${resource.type === 'NOTES' ? 'bg-blue-100 text-blue-700' :
                                    resource.type === 'QUESTION_PAPER' ? 'bg-red-100 text-red-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>
                                    {resource.type.replace('_', ' ')}
                                </div>
                                <div className="flex items-center gap-1 text-yellow-500">
                                    <Star size={16} fill="currentColor" />
                                    <span className="text-stone-900 text-sm font-medium">{resource.avgRating || '0'}</span>
                                    <span className="text-stone-500 text-xs">({resource.reviewCount})</span>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-stone-900 mb-2 line-clamp-1">{resource.title}</h3>
                            <p className="text-stone-600 text-sm mb-4 line-clamp-2">{resource.description}</p>

                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-stone-600 text-sm">
                                    <BookOpen size={16} className="text-amber-600" />
                                    <span>{resource.subject}</span>
                                </div>
                                <div className="flex items-center gap-2 text-stone-600 text-sm">
                                    <Calendar size={16} className="text-amber-600" />
                                    <span>Sem {resource.semester} • {resource.year} • {resource.branch}</span>
                                </div>
                                <div className="flex items-center gap-2 text-stone-600 text-sm">
                                    <User size={16} className="text-amber-600" />
                                    <span>{resource.uploader?.name}</span>
                                    <span className="text-stone-500 text-xs">({resource.uploader?.college})</span>
                                </div>
                                <div className="flex items-center gap-2 text-stone-600 text-sm">
                                    <Shield size={16} className={resource.privacy_level === 'PRIVATE' ? 'text-red-500' : 'text-green-600'} />
                                    <span>{resource.privacy_level}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-stone-500 mb-4">
                                <span className="flex items-center gap-1"><Eye size={14} /> {resource.views || 0}</span>
                                <span className="flex items-center gap-1"><Download size={14} /> {resource.downloads || 0}</span>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {resource.Tags && resource.Tags.map(tag => (
                                    <span key={tag.id} className="flex items-center gap-1 text-xs text-stone-600 bg-stone-200/50 px-2 py-1 rounded">
                                        <Tag size={12} /> {tag.name}
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-3 mt-auto">
                                <Link to={`/resources/${resource.id}`} className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-900 py-2 rounded-lg font-medium text-center transition-colors">
                                    View Details
                                </Link>
                                <button
                                    onClick={() => openCollectionModal(resource)}
                                    className="p-2 bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-700 rounded-lg transition-colors"
                                    title="Save to Collection"
                                >
                                    <Bookmark size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Collection Modal */}
            {showCollectionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-fade-in">
                        <h2 className="text-2xl font-bold text-stone-900 mb-4">Save to Collection</h2>
                        <p className="text-stone-600 mb-4 text-sm">
                            Select a collection to add <strong>{selectedResource?.title}</strong>
                        </p>

                        {collections.length === 0 ? (
                            <div className="text-center py-6 text-stone-500">
                                <p className="mb-3">You don't have any collections yet.</p>
                                <Link to="/collections" className="text-amber-600 hover:underline font-medium">
                                    Create one now →
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-80 overflow-y-auto mb-4">
                                {collections.map(collection => (
                                    <button
                                        key={collection.id}
                                        onClick={() => handleAddToCollection(collection.id)}
                                        className="w-full text-left p-3 bg-stone-50 hover:bg-amber-50 rounded-lg transition-colors border border-stone-200 hover:border-amber-300"
                                    >
                                        <div className="font-medium text-stone-900">{collection.title}</div>
                                        <div className="text-xs text-stone-500">{collection.resources?.length || 0} resources</div>
                                    </button>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => setShowCollectionModal(false)}
                            className="w-full py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
