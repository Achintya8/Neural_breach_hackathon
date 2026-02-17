import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="glass-card mt-auto border-t border-stone-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col items-center justify-center gap-3">
                    <div className="flex items-center gap-2 text-stone-700">
                        <span className="font-medium">Vibe coded with</span>
                        <Heart size={16} className="text-red-500 fill-red-500 animate-pulse" />
                        <span className="font-medium">by</span>
                        <span className="font-bold text-amber-700">SegFault Society</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                        <span className="font-medium">Team:</span>
                        <span>Priya N</span>
                        <span>•</span>
                        <span>Achintya K</span>
                        <span>•</span>
                        <span>T G Pranav Hathwar</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
