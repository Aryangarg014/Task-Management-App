import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Calendar, User, Trash2, Edit2, AlertTriangle } from 'lucide-react';

const priorityColors = {
  Low: 'bg-slate-800 text-slate-300 border-slate-700',
  Medium: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
  High: 'bg-orange-950/60 text-orange-300 border-orange-800/60',
  Urgent: 'bg-rose-950/60 text-rose-300 border-rose-800/60 animate-pulse',
};

export default function TaskCard({ task, index, onDelete, onEdit }) {
  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group relative bg-slate-900/90 backdrop-blur-sm border rounded-xl p-4 transition-all duration-200 shadow-md ${
            snapshot.isDragging
              ? 'border-indigo-500 shadow-indigo-500/20 shadow-xl rotate-1 scale-105 z-50 ring-2 ring-indigo-500/40'
              : 'border-slate-800 hover:border-slate-700 hover:shadow-slate-900/50'
          }`}
        >
          {/* Header & Priority Tag */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                priorityColors[task.priority] || priorityColors.Medium
              }`}
            >
              {task.priority === 'Urgent' && (
                <AlertTriangle className="inline w-3 h-3 mr-1 -mt-0.5" />
              )}
              {task.priority}
            </span>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <button
                onClick={() => onEdit(task)}
                className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition"
                title="Edit task"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Title */}
          <h4 className="font-semibold text-slate-100 text-sm mb-1 line-clamp-2 leading-snug">
            {task.title}
          </h4>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Footer Metadata */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80 mt-2">
            {/* Due Date */}
            {formattedDate ? (
              <div className="flex items-center gap-1 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{formattedDate}</span>
              </div>
            ) : (
              <span />
            )}

            {/* Assignee Avatar */}
            {task.assignee ? (
              <div className="flex items-center gap-1.5" title={`Assigned to ${task.assignee.name}`}>
                {task.assignee.avatarUrl ? (
                  <img
                    src={task.assignee.avatarUrl}
                    alt={task.assignee.name}
                    className="w-6 h-6 rounded-full border border-slate-700 object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-medium flex items-center justify-center text-[10px]">
                    {task.assignee.name.charAt(0)}
                  </div>
                )}
                <span className="text-[11px] font-medium text-slate-300 max-w-[90px] truncate">
                  {task.assignee.name.split(' ')[0]}
                </span>
              </div>
            ) : (
              <span className="text-[11px] italic text-slate-600">Unassigned</span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
