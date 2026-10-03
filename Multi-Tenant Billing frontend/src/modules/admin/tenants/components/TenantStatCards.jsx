import React from 'react';
import { Users, Calendar, CalendarX, Rocket, Clock } from 'lucide-react';

const TenantStatCards = ({ stats = { all: 248, freeTrial: 56, freeTrialEnded: 28, upgraded: 112, planExpired: 52 } }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {/* Card 1: All */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-sm flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
          <Users size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase truncate">All</div>
          <div className="text-xl sm:text-2xl font-black text-indigo-600 truncate">{stats.all}</div>
        </div>
      </div>

      {/* Card 2: Free Trial */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-sm flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
          <Calendar size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase truncate">Free Trial</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 truncate">{stats.freeTrial}</div>
        </div>
      </div>

      {/* Card 3: Free Trial Ended */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-sm flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
          <CalendarX size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase truncate" title="Free Trial Ended">Free Trial Ended</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 truncate">{stats.freeTrialEnded}</div>
        </div>
      </div>

      {/* Card 4: Upgraded */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-sm flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
          <Rocket size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase truncate">Upgraded</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 truncate">{stats.upgraded}</div>
        </div>
      </div>

      {/* Card 5: Plan Expired */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-sm flex items-center gap-3 min-w-0 col-span-2 sm:col-span-1 lg:col-span-1">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
          <Clock size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase truncate">Plan Expired</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 truncate">{stats.planExpired}</div>
        </div>
      </div>
    </div>
  );
};

export default TenantStatCards;
