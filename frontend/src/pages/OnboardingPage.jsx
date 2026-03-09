import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Dumbbell, ArrowRight, Check } from 'lucide-react';
import { Button } from '../components/ui/button';

const OnboardingPage = () => {
    const navigate = useNavigate();
    const [selection, setSelection] = useState(null); // 'home' or 'gym'

    const handleContinue = () => {
        if (!selection) return;

        // Store preference
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...userData, exerciseLocation: selection }));

        // Redirect based on choice
        if (selection === 'home') {
            navigate('/browse'); // They can see the Home program there
        } else {
            navigate('/browse'); // They can see Gym programs there
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-6 py-12">
            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative w-full max-w-2xl text-center">
                <h1 className="font-heading text-4xl md:text-5xl font-bold text-white uppercase mb-4 tracking-tight">
                    Where will you <span className="text-green-500">train?</span>
                </h1>
                <p className="text-zinc-400 text-lg mb-12 max-w-md mx-auto">
                    We'll customize your experience based on your environment. You can change this later.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {/* Home Option */}
                    <button
                        onClick={() => setSelection('home')}
                        className={`group relative flex flex-col items-center p-8 rounded-3xl border-2 transition-all duration-500 ${selection === 'home'
                                ? 'bg-green-500/10 border-green-500 shadow-[0_0_40px_-10px_rgba(34,197,94,0.3)]'
                                : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                            }`}
                    >
                        <div className={`w-20 h-20 rounded-2xl mb-6 flex items-center justify-center transition-all duration-500 ${selection === 'home' ? 'bg-green-500 text-black scale-110' : 'bg-zinc-800 text-zinc-400 group-hover:scale-110 group-hover:bg-zinc-700'
                            }`}>
                            <Home className="w-10 h-10" />
                        </div>
                        <h3 className={`text-2xl font-bold uppercase mb-2 ${selection === 'home' ? 'text-white' : 'text-zinc-300'}`}>Home</h3>
                        <p className="text-zinc-500 text-sm">No equipment, bodyweight focused system.</p>

                        {selection === 'home' && (
                            <div className="absolute top-4 right-4 animate-in zoom-in duration-300">
                                <div className="bg-green-500 rounded-full p-1">
                                    <Check className="w-4 h-4 text-black font-bold" />
                                </div>
                            </div>
                        )}
                    </button>

                    {/* Gym Option */}
                    <button
                        onClick={() => setSelection('gym')}
                        className={`group relative flex flex-col items-center p-8 rounded-3xl border-2 transition-all duration-500 ${selection === 'gym'
                                ? 'bg-green-500/10 border-green-500 shadow-[0_0_40px_-10px_rgba(34,197,94,0.3)]'
                                : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                            }`}
                    >
                        <div className={`w-20 h-20 rounded-2xl mb-6 flex items-center justify-center transition-all duration-500 ${selection === 'gym' ? 'bg-green-500 text-black scale-110' : 'bg-zinc-800 text-zinc-400 group-hover:scale-110 group-hover:bg-zinc-700'
                            }`}>
                            <Dumbbell className="w-10 h-10" />
                        </div>
                        <h3 className={`text-2xl font-bold uppercase mb-2 ${selection === 'gym' ? 'text-white' : 'text-zinc-300'}`}>Gym</h3>
                        <p className="text-zinc-500 text-sm">Full access to weights and machines.</p>

                        {selection === 'gym' && (
                            <div className="absolute top-4 right-4 animate-in zoom-in duration-300">
                                <div className="bg-green-500 rounded-full p-1">
                                    <Check className="w-4 h-4 text-black font-bold" />
                                </div>
                            </div>
                        )}
                    </button>
                </div>

                <Button
                    onClick={handleContinue}
                    disabled={!selection}
                    className={`h-16 px-12 rounded-full font-bold text-lg uppercase tracking-wider transition-all duration-500 group ${selection
                            ? 'bg-green-600 hover:bg-green-700 text-white scale-105 shadow-xl shadow-green-900/20'
                            : 'bg-zinc-800 text-zinc-500 opacity-50 cursor-not-allowed'
                        }`}
                >
                    Begin Journey <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>
        </div>
    );
};

export default OnboardingPage;
