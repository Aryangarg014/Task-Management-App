import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { Plus, ListTodo, Clock, CheckCircle2 } from 'lucide-react';

const columnIcons = {
  'To-Do': <ListTodo className="w-4 h-4 text-indigo-400" />,
  'In Progress': <Clock className="w-4 h-4 text-amber-400" />,
  Done: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
};

const columnHeaderColors = {
  'To-Do': 'border-t-2 border-t-indigo-500',
  'In Progress': 'border-t-2 border-t-amber-500',
  Done: 'border-t-2 border-t-emerald-500',
};

export default function KanbanColumn({ columnId, title, tasks, onAddTask, onDeleteTask, onEditTask }) {
  return (
    <div className={`flex flex-col bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden min-h-[500px] ${columnHeaderColors[title] || ''}`}>
      {/* Column Header with Task Counter */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
        <div className="flex items-center gap-2.5">
          {columnIcons[title]}
          <h3 className="font-bold text-slate-200 text-sm tracking-wide">{title}</h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            {tasks.length}
          </span>
        </div>

        <button
          onClick={() => onAddTask(title)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          title={`Add task to ${title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Droppable Task Container */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 space-y-3 transition-colors duration-200 overflow-y-auto max-h-[calc(100vh-280px)] ${
              snapshot.isDraggingOver ? 'bg-indigo-950/20' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
              />
            ))}
            {provided.placeholder}

            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="h-32 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-500 italic">
                No tasks in {title}
              </div>
            )}
          </div>
        )}
      </Droppable>

      {/* Quick Add Footer */}
      <div className="p-3 border-t border-slate-800/60 bg-slate-900/20">
        <button
          onClick={() => onAddTask(title)}
          className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );
}
