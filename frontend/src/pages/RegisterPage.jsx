import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell, Eye, EyeOff, Loader2, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const RegisterPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) navigate('/dashboard', { replace: true });
  }, [navigate]);

  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading]                     = useState(false);
  const [error, setError]                             = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirm_password: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const passwordsMatch =
    formData.password === formData.confirm_password && formData.confirm_password !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setError('Şifrələr uyğun deyil');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { name: formData.name } },
      });
      if (signUpError) {
        setError(signUpError.message || 'Qeydiyyat uğursuz oldu. Yenidən cəhd edin.');
        return;
      }
      if (!data.user) {
        setError('Bu email artıq qeydiyyatlıdır. Daxil olun.');
        return;
      }
      localStorage.setItem('user', JSON.stringify({
        id: data.user.id,
        name: formData.name,
        email: formData.email,
      }));
      navigate('/browse');
    } catch (err) {
      setError(err?.message || 'Qeydiyyat uğursuz oldu. Yenidən cəhd edin.');
    } finally {
      setIsLoading(false);
    }
  };

  /* ── shared input style ── */
  const inputStyle = {
    width: '100%',
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: 12,
    color: 'white',
    fontSize: 15,
    padding: '13px 16px',
    outline: 'none',
    boxSizing: 'border-box',
    WebkitAppearance: 'none',
    fontFamily: 'inherit',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none', marginBottom: 28 }}>
          <Dumbbell size={36} color="#22c55e" />
          <span style={{ color: 'white', fontWeight: 800, fontSize: 26 }}>FitStart</span>
        </Link>

        {/* Card */}
        <div style={{
          background: 'rgba(24,24,27,0.8)',
          border: '1px solid #27272a',
          borderRadius: 24,
          padding: '28px 24px',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1 style={{ color: 'white', fontWeight: 800, fontSize: 22, marginBottom: 6 }}>
              Hesab yarat
            </h1>
            <p style={{ color: '#71717a', fontSize: 14 }}>Fitness səyahətinə bu gün başla</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 10, padding: '10px 14px', color: '#f87171', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            {/* Ad */}
            <div>
              <label style={{ color: '#a1a1aa', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>
                Ad Soyad
              </label>
              <input
                name="name"
                type="text"
                placeholder="Adınızı daxil edin"
                value={formData.name}
                onChange={handleChange}
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#22c55e'}
                onBlur={e => e.target.style.borderColor = '#27272a'}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ color: '#a1a1aa', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>
                Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#22c55e'}
                onBlur={e => e.target.style.borderColor = '#27272a'}
              />
            </div>

            {/* Şifrə */}
            <div>
              <label style={{ color: '#a1a1aa', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>
                Şifrə
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{ ...inputStyle, paddingRight: 48 }}
                  onFocus={e => e.target.style.borderColor = '#22c55e'}
                  onBlur={e => e.target.style.borderColor = '#27272a'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', padding: 4,
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.password && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  {formData.password.length >= 6
                    ? <Check size={13} color="#22c55e" />
                    : <X size={13} color="#71717a" />}
                  <span style={{ fontSize: 12, color: formData.password.length >= 6 ? '#4ade80' : '#71717a' }}>
                    Minimum 6 simvol
                  </span>
                </div>
              )}
            </div>

            {/* Şifrə təkrar */}
            <div>
              <label style={{ color: '#a1a1aa', fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>
                Şifrəni təsdiqlə
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  name="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                  style={{
                    ...inputStyle,
                    paddingRight: 48,
                    borderColor: formData.confirm_password
                      ? (passwordsMatch ? '#22c55e' : '#ef4444')
                      : '#27272a',
                  }}
                  onFocus={e => {
                    if (!formData.confirm_password) e.target.style.borderColor = '#22c55e';
                  }}
                  onBlur={e => {
                    if (!formData.confirm_password) e.target.style.borderColor = '#27272a';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(p => !p)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', padding: 4,
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.confirm_password && (
                <p style={{ fontSize: 12, marginTop: 5, color: passwordsMatch ? '#4ade80' : '#f87171' }}>
                  {passwordsMatch ? 'Şifrələr uyğundur' : 'Şifrələr uyğun deyil'}
                </p>
              )}
            </div>

            {/* Göndər */}
            <button
              type="submit"
              disabled={isLoading || !passwordsMatch}
              style={{
                width: '100%', padding: '14px',
                borderRadius: 50,
                background: isLoading || !passwordsMatch ? '#27272a' : '#22c55e',
                color: isLoading || !passwordsMatch ? '#71717a' : '#000',
                border: 'none',
                cursor: isLoading || !passwordsMatch ? 'not-allowed' : 'pointer',
                fontWeight: 700, fontSize: 15,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginTop: 4,
                transition: 'background 0.2s',
              }}
            >
              {isLoading
                ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Hesab yaradılır...</>
                : 'Hesab yarat'}
            </button>
          </form>

          {/* Login link */}
          <p style={{ textAlign: 'center', marginTop: 20, color: '#71717a', fontSize: 14 }}>
            Artıq hesabın var?{' '}
            <Link to="/login" style={{ color: '#22c55e', fontWeight: 600, textDecoration: 'none' }}>
              Daxil ol
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: #52525b; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #18181b inset;
          -webkit-text-fill-color: white;
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
