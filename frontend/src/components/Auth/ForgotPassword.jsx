import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const onSubmit = async e => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const res = await api.post('/auth/forgot-password', { email });
            setMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset link');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

            <div className="max-w-md w-full space-y-8 glass-card p-10 rounded-2xl relative z-10">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                        Reset Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-300">
                        Enter your email to receive reset instructions
                    </p>
                    {message && <div className="mt-4 p-3 bg-green-500/20 text-green-100 text-sm rounded border border-green-500/50 text-center">{message}</div>}
                    {error && <div className="mt-4 p-3 bg-red-500/20 text-red-100 text-sm rounded border border-red-500/50 text-center">{error}</div>}
                </div>
                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="glass-input w-full"
                            placeholder="Email Address"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg transform transition-all hover:scale-[1.02]"
                        >
                            Send Reset Link
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
