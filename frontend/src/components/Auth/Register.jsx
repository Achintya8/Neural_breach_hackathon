import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        college: '',
        branch: '',
        semester: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { name, email, password, confirmPassword, college, branch, semester } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const res = await api.post('/auth/register', {
                name,
                email,
                password,
                college,
                branch,
                semester
            });

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Blobs */}
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>

            <div className="max-w-md w-full space-y-8 glass-card p-10 rounded-2xl relative z-10">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-stone-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-stone-600">
                        Join the collaborative learning community
                    </p>
                    {error && <div className="mt-4 p-3 bg-red-100 text-red-700 text-sm rounded border border-red-200 text-center">{error}</div>}
                </div>
                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div className="space-y-4">
                        <div>
                            <input
                                type="text"
                                name="name"
                                value={name}
                                onChange={onChange}
                                required
                                className="glass-input w-full"
                                placeholder="Full Name"
                            />
                        </div>
                        <div>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                required
                                className="glass-input w-full"
                                placeholder="Email Address"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <input
                                    type="text"
                                    name="college"
                                    value={college}
                                    onChange={onChange}
                                    required
                                    className="glass-input w-full"
                                    placeholder="College Name"
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    name="branch"
                                    value={branch}
                                    onChange={onChange}
                                    required
                                    className="glass-input w-full"
                                    placeholder="Branch (e.g. CSE)"
                                />
                            </div>
                        </div>
                        <div>
                            <select
                                name="semester"
                                value={semester}
                                onChange={onChange}
                                required
                                className="glass-input w-full text-stone-900"
                            >
                                <option value="" className="bg-white text-stone-500">Select Semester</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                    <option key={sem} value={sem} className="bg-white text-stone-900">{sem}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                required
                                className="glass-input w-full"
                                placeholder="Password"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={onChange}
                                required
                                className="glass-input w-full"
                                placeholder="Confirm Password"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-amber-700 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-lg transform transition-all hover:scale-[1.02]"
                        >
                            Sign up
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <p className="text-sm text-stone-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-amber-600 hover:text-amber-500">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
