export function CompassMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      <defs>
        <linearGradient id="goldRing" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#e8d7a5" />
          <stop offset="50%" stopColor="#c4a35a" />
          <stop offset="100%" stopColor="#8c6b2b" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="92" fill="none" stroke="url(#goldRing)" strokeWidth="2" />
      <circle cx="100" cy="100" r="78" fill="none" stroke="url(#goldRing)" strokeWidth="0.8" opacity="0.6" />
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * Math.PI * 2;
        const inner = i % 6 === 0 ? 68 : 72;
        return (
          <line
            key={i}
            x1={100 + Math.cos(a) * inner}
            y1={100 + Math.sin(a) * inner}
            x2={100 + Math.cos(a) * 78}
            y2={100 + Math.sin(a) * 78}
            stroke="#c4a35a"
            strokeWidth={i % 6 === 0 ? 1.6 : 0.6}
          />
        );
      })}
      <polygon points="100,28 108,100 100,92 92,100" fill="#c4a35a" />
      <polygon points="100,172 92,100 100,108 108,100" fill="#8c6b2b" />
      <circle cx="100" cy="100" r="6" fill="#102445" stroke="#e8d7a5" strokeWidth="2" />
      <text x="100" y="22" textAnchor="middle" fill="#e8d7a5" fontSize="10" letterSpacing="2">
        N
      </text>
    </svg>
  );
}
