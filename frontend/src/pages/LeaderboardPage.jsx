import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Flame, Zap, ArrowUp } from 'lucide-react';
import AppShell from '../components/AppShell';

const LeaderboardPage = () => {
  const users = [
    { rank: 1, name: 'Aditya Sharma', score: 685, streak: 45, xp: 12400 },
    { rank: 2, name: 'Priya Patel', score: 672, streak: 32, xp: 11200 },
    { rank: 3, name: 'Karan (You)', score: 645, streak: 12, xp: 8900 },
    { rank: 4, name: 'Rahul Kumar', score: 620, streak: 18, xp: 7500 },
    { rank: 5, name: 'Sneha Gupta', score: 590, streak: 5, xp: 5400 },
    { rank: 6, name: 'Vikram Singh', score: 540, streak: 2, xp: 4100 },
  ];

  return (
    <AppShell hideSearch>
      <div className="max-w-[1000px] mx-auto p-4 md:p-8 pb-20">
        
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-glow">
            <Trophy size={40} className="text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">National Leaderboard</h1>
          <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto">
            Compete with thousands of NEET aspirants. Earn XP, maintain streaks, and climb to the top of the ranks!
          </p>
        </div>

        {/* Top 3 Podium (Desktop) */}
        <div className="hidden md:flex justify-center items-end gap-6 mb-16 h-64">
          {/* Rank 2 */}
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-1/4 bg-slate-100 rounded-t-3xl border-t border-l border-r border-slate-200 flex flex-col items-center justify-start pt-6 h-48 relative shadow-inner">
            <div className="absolute -top-10 w-20 h-20 rounded-full border-4 border-slate-100 bg-gradient-to-tr from-slate-300 to-slate-400 flex items-center justify-center text-white shadow-lg">
              <Medal size={32} />
            </div>
            <h3 className="font-bold text-slate-800 mt-6">{users[1].name}</h3>
            <p className="text-sm font-semibold text-slate-500">{users[1].score} Pts</p>
            <div className="text-4xl font-black text-slate-200 mt-auto mb-4">2</div>
          </motion.div>

          {/* Rank 1 */}
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="w-1/3 bg-gradient-to-t from-yellow-100 to-yellow-50 rounded-t-3xl border-t border-l border-r border-yellow-200 flex flex-col items-center justify-start pt-6 h-64 relative shadow-inner">
            <div className="absolute -top-12 w-24 h-24 rounded-full border-4 border-yellow-100 bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-glow">
              <Crown size={40} />
            </div>
            <h3 className="font-extrabold text-slate-800 mt-8 text-lg">{users[0].name}</h3>
            <p className="text-sm font-bold text-yellow-600">{users[0].score} Pts</p>
            <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full mt-2 shadow-sm">
              <Flame size={14} className="text-orange-500" /> <span className="text-xs font-bold text-slate-700">{users[0].streak} Day Streak</span>
            </div>
            <div className="text-6xl font-black text-yellow-200 mt-auto mb-4">1</div>
          </motion.div>

          {/* Rank 3 */}
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="w-1/4 bg-orange-50 rounded-t-3xl border-t border-l border-r border-orange-100 flex flex-col items-center justify-start pt-6 h-40 relative shadow-inner">
            <div className="absolute -top-10 w-20 h-20 rounded-full border-4 border-orange-50 bg-gradient-to-tr from-orange-300 to-orange-400 flex items-center justify-center text-white shadow-lg">
              <Medal size={32} />
            </div>
            <h3 className="font-bold text-slate-800 mt-6">{users[2].name}</h3>
            <p className="text-sm font-semibold text-slate-500">{users[2].score} Pts</p>
            <div className="text-4xl font-black text-orange-200 mt-auto mb-4">3</div>
          </motion.div>
        </div>

        {/* List View */}
        <div className="space-y-4">
          {users.map((u, i) => (
            <motion.div 
              key={u.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-center p-4 md:p-6 rounded-2xl border ${u.name.includes('You') ? 'bg-indigo-50 border-indigo-200 shadow-md' : 'bg-white border-slate-100 shadow-sm'} transition-transform hover:scale-[1.01]`}
            >
              <div className="w-12 text-center font-black text-slate-400 text-xl">{u.rank}</div>
              
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 mr-4 shrink-0">
                {u.name.charAt(0)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={`font-bold ${u.name.includes('You') ? 'text-indigo-800' : 'text-slate-800'}`}>{u.name}</h3>
                  {u.name.includes('You') && <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">You</span>}
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1"><Zap size={14} className="text-purple-500"/> {u.xp.toLocaleString()} XP</span>
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1"><Flame size={14} className="text-orange-500"/> {u.streak} Days</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl font-black text-slate-800">{u.score}</div>
                <div className="text-xs font-bold text-emerald-500 flex items-center gap-1 justify-end"><ArrowUp size={12}/> Top {(u.rank/12450 * 100).toFixed(1)}%</div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </AppShell>
  );
};

export default LeaderboardPage;
