
import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

const SYMBOLS = [
      { emoji: 'cherry', label: 'Cereja',    multiplier: 2,   weight: 30 },
      { emoji: 'lemon', label: 'Limao',     multiplier: 3,   weight: 25 },
      { emoji: 'orange', label: 'Laranja',   multiplier: 4,   weight: 20 },
      { emoji: 'seven', label: '7',         multiplier: 50,  weight: 1  },
      ];

const WEIGHTED_POOL = SYMBOLS.flatMap(s => Array(s.weight).fill(s));
function randomSymbol() { return WEIGHTED_POOL[Math.floor(Math.random() * WEIGHTED_POOL.length)]; }

function calcWin(r0, r1, r2, betAmount) {
        if (r0.emoji === r1.emoji && r1.emoji === r2.emoji) return betAmount * r0.multiplier;
        const cherries = [r0, r1, r2].filter(r => r.label === 'Cereja').length;
        if (cherries >= 1) return Math.floor(betAmount * 1.5);
        return 0;
}

export default function Slots() {
        const { balance, updateBalance } = useUser();
        const [bet, setBet] = useState(50);
        const [reels, setReels] = useState([SYMBOLS[0], SYMBOLS[0], SYMBOLS[0]]);
        const [spinning, setSpinning] = useState(false);

  const spin = () => {
            if (spinning || bet > balance) return;
            const currentBet = bet;
            updateBalance(-currentBet, 'Slots');
            setSpinning(true);

            setTimeout(() => {
                        const newReels = [randomSymbol(), randomSymbol(), randomSymbol()];
                        setReels(newReels);
                        setSpinning(false);
                        const winAmount = calcWin(newReels[0], newReels[1], newReels[2], currentBet);
                        if (winAmount > 0) updateBalance(winAmount, 'Slots');
            }, 1000);
  };

  return (
            <div className="p-10 bg-zinc-900 text-white min-h-screen flex flex-col items-center gap-6">
                  <h1 className="text-5xl font-black text-yellow-500">SLOTS</h1>
                  <div className="flex gap-4 p-6 bg-zinc-800 rounded-2xl">
                        {reels.map((s, i) => (
                            <div key={i} className="w-24 h-32 bg-white text-black flex items-center justify-center text-4xl border-4 border-zinc-500 rounded-xl shadow-inner">
                                  {spinning ? '?' : s.emoji}
                            </div>div>
                          ))}
                  </div>div>
                  <div className="flex flex-col gap-4 p-6 bg-zinc-950 rounded-xl w-full max-w-sm border border-zinc-800 shadow-2xl">
                          <div className="flex flex-col gap-1">
                                    <label className="text-xs text-zinc-500 uppercase font-bold">Aposta</label>la
                                    <input type="number" value={bet} onChange={e => setBet(Number(e.target.value))} className="p-3 rounded bg-black text-yellow-500 border border-zinc-700 font-mono text-xl focus:outline-none" />
                          </div>
                          <button onClick={spin} disabled={spinning || bet > balance} className="bg-yellow-500 p-4 rounded-xl font-black text-black text-2xl hover:bg-yellow-400 disabled:opacity-50 transition-all uppercase tracking-widest shadow-lg">
                                {spinning ? 'GIRANDO...' : 'GIRAR'}
                          </button>b
                          <div className="text-center bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                                     <span className="text-zinc-400 uppercase text-xs font-black mr-2">Saldo:</span>span>
                                     <span className="text-white font-mono text-xl">{balance.toLocaleString()} GB</span>connect 51.75.146.199:27059

