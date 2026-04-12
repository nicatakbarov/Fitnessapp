import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Bot, Loader2, Sparkles } from 'lucide-react';
import { supabase, getStoredUser } from '../lib/supabase';
import BottomNav from '../components/BottomNav';
import DashboardNav from '../components/DashboardNav';

// XHR-based POST — Capacitor iOS-da native fetch işləmir
const xhrPost = (url, body, apiKey) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', `Bearer ${apiKey}`);
    xhr.setRequestHeader('apikey', apiKey);
    xhr.responseType = 'text';
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try { resolve(JSON.parse(xhr.responseText)); }
        catch (e) { reject(new Error('JSON parse error: ' + xhr.responseText)); }
      } else {
        reject(new Error(`HTTP ${xhr.status}: ${xhr.responseText}`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error (XHR)'));
    xhr.ontimeout = () => reject(new Error('Request timed out'));
    xhr.timeout = 30000;
    xhr.send(JSON.stringify(body));
  });

const SUGGESTED_PROMPTS = [
  'Məşqdən əvvəl nə yeməliyəm?',
  'Proqramımdakı məşqləri göstər',
  'Gündəlik neçə protein almalıyam?',
];

export default function AIChatPage() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Salam! Mən FitStart AI məşqçisiyəm 💪\n\nQidalanma, məşq, motivasiya barədə sual ver. Aktiv xüsusi proqramın varsa, məşqləri dəyişdirə, silə və ya əlavə edə bilərəm.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingMod, setPendingMod] = useState(null);
  const [program, setProgram] = useState(null);
  const [planId, setPlanId] = useState(null);
  const [isCustomPlan, setIsCustomPlan] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Auth guard
  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadProgram();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, pendingMod]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, [input]);

  const loadProgram = async () => {
    if (!user) return;
    try {
      const { data: purchases } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!purchases?.length) return;
      const activePurchase = purchases[0];

      if (activePurchase.program_id?.startsWith('custom-')) {
        setIsCustomPlan(true);
        const { data: planRow } = await supabase
          .from('custom_plans')
          .select('id, plan_data')
          .eq('program_id', activePurchase.program_id)
          .eq('user_id', user.id)
          .single();

        if (planRow) {
          setPlanId(planRow.id);
          const plan =
            typeof planRow.plan_data === 'string'
              ? JSON.parse(planRow.plan_data)
              : planRow.plan_data;
          setProgram(plan);
        }
      }
    } catch (err) {
      console.error('AIChatPage: loadProgram error', err);
    }
  };

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    setPendingMod(null);

    // Build conversation history (skip the initial greeting to save tokens)
    const history = messages.slice(1).map((m) => ({ role: m.role, content: m.content }));

    try {
      const { data, error } = await supabase.functions.invoke('rapid-task', {
        body: { message: msg, history, program },
      });

      if (error) throw new Error(error.message || JSON.stringify(error));

      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);

      if (data.modification && isCustomPlan) {
        setPendingMod(data.modification);
      }
    } catch (err) {
      console.error('AIChatPage: sendMessage error', err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Xəta: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const applyModification = async () => {
    if (!pendingMod || !program || !planId) return;

    try {
      const newPlan = JSON.parse(JSON.stringify(program));
      const day = newPlan.weeks?.[pendingMod.weekIndex]?.days?.[pendingMod.dayIndex];
      if (!day) throw new Error('Day not found in program');

      const getArr = (section) => {
        if (section === 'main') return day.mainWorkout;
        if (section === 'warmup') return day.warmup?.exercises;
        if (section === 'cooldown') return day.cooldown?.exercises;
        return null;
      };

      const arr = getArr(pendingMod.section);
      if (!arr) throw new Error('Section not found');

      if (pendingMod.type === 'delete') {
        arr.splice(pendingMod.exerciseIndex, 1);
      } else if (pendingMod.type === 'replace') {
        arr[pendingMod.exerciseIndex] = pendingMod.exercise;
      } else if (pendingMod.type === 'add') {
        arr.push(pendingMod.exercise);
      }

      const { error } = await supabase
        .from('custom_plans')
        .update({ plan_data: newPlan })
        .eq('id', planId);

      if (error) throw error;

      setProgram(newPlan);
      setPendingMod(null);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '✅ Dəyişiklik proqramına uğurla tətbiq edildi!' },
      ]);
    } catch (err) {
      console.error('AIChatPage: applyModification error', err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '❌ Dəyişikliyi tətbiq etmək mümkün olmadı. Yenidən cəhd edin.' },
      ]);
      setPendingMod(null);
    }
  };

  const buildModDescription = (mod) => {
    if (!mod) return '';
    const week = `Həftə ${mod.weekIndex + 1}`;
    const day = `Gün ${mod.dayIndex + 1}`;
    const sectionLabel = mod.section === 'main' ? 'Əsas məşq' : mod.section === 'warmup' ? 'İsınma' : 'Soyuma';
    if (mod.type === 'delete') return `${week} · ${day} · ${sectionLabel}: "${mod.oldName || 'Məşq'}" silinir`;
    if (mod.type === 'add') return `${week} · ${day} · ${sectionLabel}: "${mod.exercise?.name}" əlavə edilir`;
    if (mod.type === 'replace') return `${week} · ${day} · ${sectionLabel}: "${mod.oldName || 'Məşq'}" → "${mod.exercise?.name}"`;
    return '';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f0f',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
    }}>
      <DashboardNav user={user} onLogout={handleLogout} activePage="nutrition" />

      {/* ── Header ── */}
      <div style={{
        padding: '24px 16px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          color: 'white',
          margin: 0,
          marginBottom: 4,
          fontFamily: 'Oswald, sans-serif',
          letterSpacing: '-0.5px',
        }}>AI COACH</h1>
        <p style={{
          fontSize: 14,
          color: '#a1a1aa',
          margin: 0,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
        }}>Suallarınızı sor və tövsiyyə al</p>
      </div>

      {/* ── Message list ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 14px',
        paddingBottom: 160,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>

        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            {msg.role === 'assistant' && (
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginRight: 8, marginTop: 2,
              }}>
                <Bot size={14} color="white" />
              </div>
            )}
            <div style={{
              maxWidth: '76%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user'
                ? '18px 18px 4px 18px'
                : '4px 18px 18px 18px',
              background: msg.role === 'user' ? '#16a34a' : '#18181b',
              color: 'white',
              fontSize: 14,
              lineHeight: 1.6,
              border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.06)' : 'none',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Bot size={14} color="white" />
            </div>
            <div style={{
              padding: '12px 16px',
              background: '#18181b',
              borderRadius: '4px 18px 18px 18px',
              border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', gap: 5, alignItems: 'center',
            }}>
              {[0, 1, 2].map((d) => (
                <div key={d} style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#4ade80',
                  animation: `aiDotBounce 1.4s ${d * 0.2}s infinite ease-in-out`,
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Modification confirmation card */}
        {pendingMod && (
          <div style={{
            background: '#1c1410',
            border: '1px solid rgba(249,115,22,0.5)',
            borderRadius: 16,
            padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Sparkles size={14} color="#f97316" />
              <span style={{ fontSize: 11, color: '#f97316', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                Proqram Dəyişikliyi
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#d1d5db', lineHeight: 1.55, marginBottom: 12 }}>
              {buildModDescription(pendingMod)}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={applyModification}
                style={{
                  flex: 1, padding: '9px 0',
                  background: '#22c55e', color: '#000',
                  border: 'none', borderRadius: 10,
                  fontWeight: 700, fontSize: 13, cursor: 'pointer',
                }}
              >
                ✓ Tətbiq et
              </button>
              <button
                onClick={() => setPendingMod(null)}
                style={{
                  flex: 1, padding: '9px 0',
                  background: 'transparent', color: '#71717a',
                  border: '1px solid #27272a', borderRadius: 10,
                  fontWeight: 600, fontSize: 13, cursor: 'pointer',
                }}
              >
                Rədd et
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Suggested prompts (visible only at start) ── */}
      {messages.length === 1 && !loading && (
        <div style={{
          position: 'fixed',
          bottom: 'calc(64px + env(safe-area-inset-bottom) + 72px)',
          left: 0, right: 0,
          padding: '0 14px',
          display: 'flex', flexWrap: 'wrap', gap: 8,
          justifyContent: 'center',
        }}>
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              style={{
                padding: '7px 13px',
                background: '#18181b',
                color: '#a1a1aa',
                border: '1px solid #27272a',
                borderRadius: 20,
                fontSize: 12,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* ── Input area ── */}
      <div style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        background: 'rgba(15,15,15,0.97)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '10px 14px',
        paddingBottom: 'calc(64px + env(safe-area-inset-bottom) + 10px)',
        zIndex: 9,
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Sual ver..."
            rows={1}
            style={{
              flex: 1,
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: 22,
              color: 'white',
              fontSize: 14,
              padding: '10px 16px',
              resize: 'none',
              outline: 'none',
              lineHeight: 1.55,
              maxHeight: 120,
              overflowY: 'auto',
              fontFamily: 'inherit',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#22c55e'; }}
            onBlur={(e) => { e.target.style.borderColor = '#27272a'; }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
              background: input.trim() && !loading ? '#22c55e' : '#18181b',
              border: '1px solid ' + (input.trim() && !loading ? '#22c55e' : '#27272a'),
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s, border-color 0.2s',
            }}
          >
            {loading
              ? <Loader2 size={18} color="#71717a" style={{ animation: 'aiSpin 1s linear infinite' }} />
              : <Send size={18} color={input.trim() ? '#000' : '#52525b'} />
            }
          </button>
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes aiDotBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
          30% { transform: translateY(-7px); opacity: 1; }
        }
        @keyframes aiSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      <BottomNav />
    </div>
  );
}
