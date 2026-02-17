import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import ParticleBackground from '../Layout/ParticleBackground';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Particle Background with 40% opacity */}
            <div className="absolute inset-0 z-0">
                <div style={{ opacity: 0.4 }}>
                    <ParticleBackground />
                </div>
            </div>

            {/* Background Blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
            <div className="absolute -bottom-8 left-20 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center gap-8 max-w-4xl w-full">
                {/* Hero Headline */}
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold gradient-text mb-2 animate-bounce-in drop-shadow-lg">
                        This is the last time you'll ever type
                    </h1>
                    <h1 className="text-4xl md:text-5xl lg:text-5xl font-extrabold text-amber-600 animate-bounce-in drop-shadow-2xl" style={{ animationDelay: '0.2s' }}>
                        "Bro send PDF."
                    </h1>
                </div>

                {/* Login Card */}
                <div className="max-w-md w-full space-y-8 glass-card p-10 rounded-2xl animate-bounce-in hover-glow" style={{ animationDelay: '0.4s' }}>
                    <div className="animate-fade-in">
                        <h2 className="mt-6 text-center text-4xl font-extrabold gradient-text">
                            Welcome Back
                        </h2>
                        <p className="mt-2 text-center text-sm text-stone-600">
                            Sign in to access your resources
                        </p>
                        {error && <div className="mt-4 p-3 bg-red-100 text-red-700 text-sm rounded border border-red-200 text-center">{error}</div>}
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                        <div className="space-y-4">
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
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded bg-white"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-stone-600">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link to="/forgot-password" className="font-medium text-amber-600 hover:text-amber-500">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-amber-700 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-lg transform transition-all hover:scale-[1.02]"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>
                    <div className="text-center">
                        <p className="text-sm text-stone-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-medium text-amber-600 hover:text-amber-500">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
