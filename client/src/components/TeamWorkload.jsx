import React from 'react';
import { Users, AlertTriangle, ShieldAlert, Plus } from 'lucide-react';

export default function TeamWorkload({ users, onAddUserClick, selectedAssignee, onSelectAssignee }) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-200">Team Workload Balancing</h3>
          <span className="text-xs text-slate-400">
            (Pulse warning triggers if &gt; 5 tasks in progress)
          </span>
        </div>

        <button
          onClick={onAddUserClick}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-400" />
          <span>Add Member</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* All Users option for filtering */}
        <button
          onClick={() => onSelectAssignee(null)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition ${
            selectedAssignee === null
              ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-200'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-semibold text-slate-300">
            All
          </div>
          <span>All Team Members</span>
        </button>

        {/* Individual Users with Workload Status */}
        {users.map((user) => {
          const inProgressCount = user.workload?.inProgressCount || 0;
          const isBurnout = inProgressCount > 5;
          const isSelected = selectedAssignee === user.id;

          return (
            <div
              key={user.id}
              onClick={() => onSelectAssignee(isSelected ? null : user.id)}
              className={`relative cursor-pointer flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium border transition group ${
                isBurnout
                  ? 'bg-red-950/40 border-red-800/80 shadow-red-900/20 shadow-md'
                  : isSelected
                  ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-200'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {/* Avatar with Pulsing Red Alert when > 5 in-progress tasks */}
              <div
                className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isBurnout
                    ? 'animate-burnout-pulse border-2 border-red-500 bg-red-600/30'
                    : 'border border-slate-700 bg-slate-800'
                }`}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-slate-200 text-xs">
                    {user.name.charAt(0)}
                  </span>
                )}

                {isBurnout && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[9px] font-black border border-slate-900 shadow">
                    !
                  </span>
                )}
              </div>

              {/* User Details & Counter */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className={`font-semibold ${isBurnout ? 'text-red-200' : 'text-slate-200'}`}>
                    {user.name}
                  </span>
                  {isBurnout && (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-bounce" />
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <span
                    className={`font-medium ${
                      isBurnout ? 'text-red-300 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {inProgressCount} in progress
                  </span>
                  {isBurnout && (
                    <span className="px-1.5 py-0.5 rounded bg-red-900/80 text-red-200 text-[10px] font-semibold uppercase tracking-wider">
                      Burnout Risk
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
