import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { supabase } from '../lib/supabase';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (signInError) throw signInError;
      const name = data.user.user_metadata?.name || data.user.email;
      localStorage.setItem('user', JSON.stringify({
        id: data.user.id,
        name,
        email: data.user.email,
      }));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-6 py-12" data-testid="login-page">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(34,197,94,0.05),transparent_50%)]" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Dumbbell className="w-10 h-10 text-green-500" />
          <span className="font-heading text-3xl font-bold text-white">FitStart</span>
        </Link>

        {/* Card */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm">
          <div className="text-center mb-8">
            <h1 className="font-heading text-2xl font-bold text-white uppercase mb-2">
              Welcome Back
            </h1>
            <p className="text-zinc-400">Sign in to continue your fitness journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm" data-testid="login-error">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                data-testid="login-email-input"
                className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 h-12 focus:border-green-500 focus:ring-green-500/20"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-300">Password</Label>
                <button
                  type="button"
                  className="text-sm text-green-500 hover:text-green-400 transition-colors"
                  data-testid="forgot-password-link"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  data-testid="login-password-input"
                  className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 h-12 pr-12 focus:border-green-500 focus:ring-green-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  data-testid="toggle-password-visibility"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              data-testid="login-submit-btn"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-zinc-900/50 px-4 text-sm text-zinc-500">or continue with</span>
            </div>
          </div>

          {/* Google OAuth (UI Only) */}
          <Button
            type="button"
            variant="outline"
            data-testid="google-oauth-btn"
            className="w-full bg-transparent border-zinc-700 text-white hover:bg-zinc-800 h-12 rounded-full"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Register Link */}
          <p className="text-center mt-8 text-zinc-400">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-green-500 hover:text-green-400 font-medium transition-colors"
              data-testid="register-link"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
