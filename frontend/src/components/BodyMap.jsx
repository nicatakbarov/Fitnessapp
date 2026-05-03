const MUSCLE_GROUPS = [
  { id: 'chest',     label: 'Döş'     },
  { id: 'shoulders', label: 'Çiynlər' },
  { id: 'arms',      label: 'Qollar'  },
  { id: 'abs',       label: 'Qarın'   },
  { id: 'legs',      label: 'Ayaqlar' },
  { id: 'back',      label: 'Kürək'   },
  { id: 'glutes',    label: 'Omba'    },
];

export default function BodyMap({ selected = [], onChange }) {
  const toggle = (id) => {
    if (!onChange) return;
    onChange(selected.includes(id)
      ? selected.filter(x => x !== id)
      : [...selected, id]);
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 7,
      width: '100%',
    }}>
      {MUSCLE_GROUPS.map(m => {
        const on = selected.includes(m.id);
        return (
          <button
            key={m.id}
            onClick={() => toggle(m.id)}
            style={{
              padding: '12px 10px',
              borderRadius: 9,
              border: 'none',
              background: on ? 'rgba(34,197,94,0.15)' : '#1a1d24',
              color: on ? '#22c55e' : '#5a6070',
              fontSize: 14,
              fontWeight: on ? 700 : 400,
              cursor: 'pointer',
              textAlign: 'center',
              fontFamily: 'inherit',
              outline: on ? '1.5px solid rgba(34,197,94,0.4)' : '1px solid #22262f',
              transition: 'all 0.16s',
            }}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
