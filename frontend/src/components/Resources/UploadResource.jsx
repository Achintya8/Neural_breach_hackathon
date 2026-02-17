import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const UploadResource = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        semester: '',
        year: '',
        type: 'NOTES',
        privacy_level: 'PUBLIC',
        branch: '',
        tags: ''
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const { title, description, subject, semester, year, type, privacy_level, branch, tags } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onFileChange = e => {
        setFile(e.target.files[0]);
    };

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (!file) {
            setMessage({ type: 'error', text: 'Please select a file to upload' });
            setLoading(false);
            return;
        }

        const data = new FormData();
        data.append('file', file);
        Object.keys(formData).forEach(key => data.append(key, formData[key]));

        try {
            await api.post('/resources', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage({ type: 'success', text: 'Resource uploaded successfully!' });
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.data?.message || 'Error uploading resource'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-stone-900 mb-6">Upload Resource</h2>

            {message && (
                <div className={`p-4 mb-6 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={onSubmit} className="glass-card p-8 rounded-xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-stone-700 mb-2">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={title}
                            onChange={onChange}
                            required
                            className="glass-input w-full"
                            placeholder="e.g. Data Structures Notes"
                        />
                    </div>
                    <div>
                        <label className="block text-stone-700 mb-2">Subject</label>
                        <input
                            type="text"
                            name="subject"
                            value={subject}
                            onChange={onChange}
                            required
                            className="glass-input w-full"
                            placeholder="e.g. Computer Science"
                        />
                    </div>
                    <div>
                        <label className="block text-stone-700 mb-2">Type</label>
                        <select
                            name="type"
                            value={type}
                            onChange={onChange}
                            className="glass-input w-full"
                        >
                            <option value="NOTES">Notes</option>
                            <option value="QUESTION_PAPER">Question Paper</option>
                            <option value="SOLUTION">Solution</option>
                            <option value="PROJECT_REPORT">Project Report</option>
                            <option value="STUDY_MATERIAL">Study Material</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-stone-700 mb-2">Branch</label>
                        <select
                            name="branch"
                            value={branch}
                            onChange={onChange}
                            required
                            className="glass-input w-full"
                        >
                            <option value="">Select Branch</option>
                            <option value="CSE">Computer Science (CSE)</option>
                            <option value="ECE">Electronics (ECE)</option>
                            <option value="ME">Mechanical (ME)</option>
                            <option value="CE">Civil (CE)</option>
                            <option value="EE">Electrical (EE)</option>
                            <option value="IT">Information Tech (IT)</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-stone-700 mb-2">Semester</label>
                            <select
                                name="semester"
                                value={semester}
                                onChange={onChange}
                                required
                                className="glass-input w-full"
                            >
                                <option value="">Select</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-stone-700 mb-2">Year</label>
                            <input
                                type="number"
                                name="year"
                                value={year}
                                onChange={onChange}
                                required
                                className="glass-input w-full"
                                placeholder="YYYY"
                                min="2000"
                                max="2099"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-stone-700 mb-2">Description</label>
                    <textarea
                        name="description"
                        value={description}
                        onChange={onChange}
                        className="glass-input w-full h-24"
                        placeholder="Brief description of the resource..."
                    />
                </div>

                <div>
                    <label className="block text-stone-700 mb-2">Tags (comma separated)</label>
                    <input
                        type="text"
                        name="tags"
                        value={tags}
                        onChange={onChange}
                        className="glass-input w-full"
                        placeholder="e.g. mid-term, algorithms, sorting"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-stone-700 mb-2">File (PDF, DOC, Images)</label>
                        <input
                            type="file"
                            onChange={onFileChange}
                            required
                            className="glass-input w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200"
                        />
                    </div>
                    <div>
                        <label className="block text-stone-700 mb-2">Privacy</label>
                        <select
                            name="privacy_level"
                            value={privacy_level}
                            onChange={onChange}
                            className="glass-input w-full"
                        >
                            <option value="PUBLIC">Public (Everyone)</option>
                            <option value="PRIVATE">Private (My College Only)</option>
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`btn-primary w-full py-3 px-4 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Uploading...' : 'Upload Resource'}
                </button>
            </form>
        </div>
    );
};

export default UploadResource;
