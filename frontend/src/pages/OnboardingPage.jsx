import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=85&auto=format&fit=crop',
    accent: '#22c55e',
    accentRgb: '34,197,94',
    tag: 'WORKOUT TRACKING',
    title: 'Track Your\nWorkouts',
    subtitle: 'Log every session, mark exercises complete, and watch your strength grow day by day.',
  },
  {
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=900&q=85&auto=format&fit=crop',
    accent: '#a855f7',
    accentRgb: '168,85,247',
    tag: 'CUSTOM PLANS',
    title: 'Build Your\nOwn Plan',
    subtitle: 'Create a plan from scratch — choose exercises, sets, reps, and equipment that fits you.',
  },
  {
    image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=900&q=85&auto=format&fit=crop',
    accent: '#3b82f6',
    accentRgb: '59,130,246',
    tag: 'PROGRESS',
    title: 'See Your\nProgress',
    subtitle: 'Visual stats, streaks, personal records — stay motivated and never miss a milestone.',
  },
];

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState('left');
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  const finish = () => {
    localStorage.setItem('onboarding_done', 'true');
    navigate('/register');
  };

  const goNext = () => {
    if (animating) return;
    if (current < slides.length - 1) triggerTransition('left', current + 1);
    else finish();
  };

  const goTo = (index) => {
    if (animating || index === current) return;
    triggerTransition(index > current ? 'left' : 'right', index);
  };

  const triggerTransition = (dir, nextIndex) => {
    setAnimating(true);
    setDirection(dir);
    setVisible(false);
    setTimeout(() => {
      setCurrent(nextIndex);
      setVisible(true);
      setTimeout(() => setAnimating(false), 450);
    }, 300);
  };

  const slide = slides[current];
  const isLast = current === slides.length - 1;

  return (
    <div
      className="flex flex-col select-none"
      style={{ position: 'fixed', inset: 0, background: '#080808', overflow: 'hidden' }}
    >
      {/* ── TOP: Image section (58% height) ── */}
      <div style={{ position: 'relative', height: '58%', flexShrink: 0, overflow: 'hidden' }}>
        {/* Image */}
        <img
          src={slide.image}
          alt=""
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}
        />
        {/* Accent tint */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at 50% 60%, rgba(${slide.accentRgb}, 0.12) 0%, transparent 70%)`,
          transition: 'background 0.7s ease',
          pointerEvents: 'none',
        }} />
        {/* Bottom fade into dark */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
          background: 'linear-gradient(to bottom, transparent 0%, #080808 100%)',
          pointerEvents: 'none',
        }} />

        {/* Skip button */}
        <div
          className="absolute top-0 right-0 flex justify-end px-5 z-10"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 14px)' }}
        >
          {!isLast && (
            <button
              onClick={finish}
              style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '14px', fontWeight: 500,
                background: 'rgba(0,0,0,0.35)',
                backdropFilter: 'blur(8px)',
                padding: '6px 16px', borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              Skip
            </button>
          )}
        </div>
      </div>

      {/* ── BOTTOM: Content section (42% height) ── */}
      <div
        className="flex flex-col justify-between px-7"
        style={{
          flex: 1,
          paddingTop: '12px',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 96px)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : `translateY(${direction === 'left' ? '14px' : '-14px'})`,
          transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* Text block */}
        <div className="flex flex-col gap-3">
          {/* Tag */}
          <div>
            <span style={{
              color: slide.accent, fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em',
              background: `rgba(${slide.accentRgb}, 0.12)`,
              border: `1px solid rgba(${slide.accentRgb}, 0.25)`,
              padding: '4px 12px', borderRadius: '999px',
            }}>
              {slide.tag}
            </span>
          </div>
          {/* Title */}
          <h1
            className="font-heading font-bold text-white"
            style={{ fontSize: '2.4rem', whiteSpace: 'pre-line', letterSpacing: '-0.02em', lineHeight: 1.1 }}
          >
            {slide.title}
          </h1>
          {/* Subtitle */}
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', lineHeight: 1.6 }}>
            {slide.subtitle}
          </p>
        </div>

        {/* Dots + Arrow */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  style={{
                    height: '4px', width: i === current ? '28px' : '8px',
                    borderRadius: '999px',
                    background: i === current ? slide.accent : 'rgba(255,255,255,0.2)',
                    transition: 'all 0.35s cubic-bezier(0.22,1,0.36,1)',
                    border: 'none', cursor: 'pointer', padding: 0,
                  }}
                />
              ))}
            </div>
            <button
              onClick={goNext}
              className="active:scale-90 transition-transform"
              style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: slide.accent, border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 28px rgba(${slide.accentRgb}, 0.5)`,
                transition: 'background 0.4s ease, box-shadow 0.4s ease',
                cursor: 'pointer',
              }}
            >
              <ArrowRight style={{ color: '#000', width: '22px', height: '22px', strokeWidth: 2.5 }} />
            </button>
          </div>

          {/* Log in */}
          {isLast && (
            <button
              onClick={() => { localStorage.setItem('onboarding_done', 'true'); navigate('/login'); }}
              style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', textAlign: 'center' }}
            >
              Already have an account?{' '}
              <span style={{ color: slide.accent, fontWeight: 600 }}>Log in</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
