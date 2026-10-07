// Fundo do card de poker: duas cartas e pilhas de fichas desenhadas em código.
const SPADE = "M0,-14 C6,-6 14,-2 14,5 C14,11 8,13 3,10 L5,17 L-5,17 L-3,10 C-8,13 -14,11 -14,5 C-14,-2 -6,-6 0,-14 Z";

function Card({ x, y, rot, rank, red }: { x: number; y: number; rot: number; rank: string; red?: boolean }) {
  const fill = red ? "var(--accent)" : "#111111";
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x="-62" y="-88" width="124" height="176" rx="10" className="pk-card" />
      <text x="-48" y="-56" className="pk-rank" fill={fill}>{rank}</text>
      <path d={SPADE} transform="translate(-41 -32) scale(0.75)" fill={fill} />
      <path d={SPADE} transform="translate(0 12) scale(2.4)" fill={fill} />
    </g>
  );
}

function Stack({ x, y, n, color }: { x: number; y: number; n: number; color: string }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <g key={i} transform={`translate(${x} ${y - i * 7})`}>
          <ellipse rx="26" ry="9" fill={color} className="pk-chip" />
          <ellipse rx="26" ry="9" fill="none" className="pk-chip-edge" />
        </g>
      ))}
    </g>
  );
}

export function Poker() {
  return (
    <svg className="life-candles" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Card x={160} y={200} rot={-12} rank="A" />
      <Card x={240} y={190} rot={9} rank="K" red />
      <Stack x={92} y={330} n={5} color="var(--accent)" />
      <Stack x={150} y={340} n={3} color="#eeeeea" />
      <Stack x={300} y={325} n={6} color="#2a2a27" />
    </svg>
  );
}
