import React from 'react';
import { useUser } from '../context/UserContext';

function calcWin(r0, r1, r2, betAmount) {
      if (r0.emoji === r1.emoji && r1.emoji === r2.emoji) return betAmount * r0.multiplier;
      const sevens = [r0, r1, r2].filter(r => r.label === '7').length;
      if (sevens === 2) return betAmount * 10;
      const cherries = [r0, r1, r2].filter(r => r.label === 'Cereja').length;
      if (cherries >= 1) return Math.floor(betAmount * 1.5);
      return 0;
}

export default function Slots() {
      const { balance, updateBalance } = useUser();
      const [bet, setBet] = useState(50);
      const [reels, setReels] = useState([{emoji:'7',label:'7',multiplier:50},{emoji:'7',label:'7',multiplier:50},{emoji:'7',label:'7',multiplier:50}]);
      const spin = () => {
              const currentBet = bet;
              updateBalance(-currentBet, 'Slots');
              const winAmount = calcWin(reels[0], reels[1], reels[2], currentBet);
              if (winAmount > 0) updateBalance(winAmount, 'Slots');
      };
      return (
              <div className="p-10 bg-black text-white min-h-screen">
                    <h1>SLOTS</h1>
                    <button onClick={spin} className="bg-yellow-500 p-4 text-black font-bold">GIRAR</button>
                    <p>Balance: {balance}GB</p>
              </div>
            );
}
