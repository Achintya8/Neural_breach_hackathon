import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, LogOut, User, Menu, X } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = React.useState(false);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (location.pathname === '/login' || location.pathname === '/register') {
        return null;
    }

    return (
        <nav className="glass-card sticky top-0 z-50 rounded-none border-b border-stone-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/dashboard" className="flex items-center gap-2 text-stone-900 font-bold text-xl">
                            <BookOpen className="text-amber-700" />
                            <span>CampusShare</span>
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <Link to="/dashboard" className="text-stone-600 hover:text-stone-900 px-3 py-2 rounded-md font-medium transition-colors">
                                Dashboard
                            </Link>
                            <Link to="/profile" className="text-stone-600 hover:text-stone-900 px-3 py-2 rounded-md font-medium transition-colors">
                                Profile
                            </Link>
                            <Link to="/upload" className="text-stone-600 hover:text-stone-900 px-3 py-2 rounded-md font-medium transition-colors">
                                Upload
                            </Link>
                            <div className="flex items-center gap-4 ml-4">
                                <span className="text-amber-700 font-medium">{user.name}</span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
                                >
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-stone-500 hover:text-stone-900 p-2 rounded-md"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden glass-card mt-2 mx-4 rounded-xl p-4 space-y-2">
                    <Link to="/dashboard" className="text-stone-600 hover:text-stone-900 block px-3 py-2 rounded-md text-base font-medium">
                        Dashboard
                    </Link>
                    <Link to="/upload" className="text-stone-600 hover:text-stone-900 block px-3 py-2 rounded-md text-base font-medium">
                        Upload
                    </Link>
                    <div className="border-t border-stone-200 pt-4 mt-2">
                        <div className="flex items-center px-3 mb-3">
                            <div className="ml-3">
                                <div className="text-base font-medium leading-none text-stone-900">{user.name}</div>
                                <div className="text-sm font-medium leading-none text-stone-500 mt-1">{user.email}</div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full text-left text-red-600 hover:text-red-500 block px-3 py-2 rounded-md text-base font-medium"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
