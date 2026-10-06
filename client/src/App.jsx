import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import KanbanColumn from './components/KanbanColumn';
import TeamWorkload from './components/TeamWorkload';
import CreateTaskModal from './components/CreateTaskModal';
import AddUserModal from './components/AddUserModal';
import {
  Kanban,
  Plus,
  Filter,
  RefreshCw,
  FolderKanban,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedAssigneeFilter, setSelectedAssigneeFilter] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [initialTaskStatus, setInitialTaskStatus] = useState('To-Do');
  const [editingTask, setEditingTask] = useState(null);

  // Fetch Projects and Users on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch Tasks when project or filter changes
  useEffect(() => {
    if (selectedProjectId) {
      fetchTasks();
    }
  }, [selectedProjectId, priorityFilter, selectedAssigneeFilter]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [projectsRes, usersRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/users'),
      ]);

      const projectsData = await projectsRes.json();
      const usersData = await usersRes.json();

      setProjects(projectsData);
      setUsers(usersData);

      if (projectsData.length > 0) {
        setSelectedProjectId(projectsData[0].id);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      let url = `/api/tasks?projectId=${selectedProjectId}`;
      if (priorityFilter !== 'All') {
        url += `&priority=${priorityFilter}`;
      }
      if (selectedAssigneeFilter) {
        url += `&assigneeId=${selectedAssigneeFilter}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  };

  // Drag and Drop Handler
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const targetStatus = destination.droppableId;

    // Optimistic UI Update
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === draggableId ? { ...t, status: targetStatus } : t
      )
    );

    try {
      const res = await fetch(`/api/tasks/${draggableId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      });

      if (!res.ok) {
        throw new Error('Status update failed');
      }

      // Refresh users workload counts (to trigger/clear red pulse burnout warnings live)
      fetchUsers();
    } catch (err) {
      console.error('Error persisting drag & drop status:', err);
      // Revert tasks if backend update failed
      fetchTasks();
    }
  };

  // Create or Update Task
  const handleSaveTask = async (taskData) => {
    try {
      if (taskData.id) {
        // Update
        const res = await fetch(`/api/tasks/${taskData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        });
        if (res.ok) {
          fetchTasks();
          fetchUsers();
        }
      } else {
        // Create
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...taskData,
            projectId: selectedProjectId,
          }),
        });
        if (res.ok) {
          fetchTasks();
          fetchUsers();
        }
      }
    } catch (err) {
      console.error('Failed to save task:', err);
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        fetchUsers();
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Add New User to System
  const handleAddUser = async (userData) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (res.ok) {
        const newUser = await res.json();
        if (selectedProjectId) {
          await fetch(`/api/projects/${selectedProjectId}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: newUser.id, role: 'MEMBER' }),
          });
        }
        fetchUsers();
      }
    } catch (err) {
      console.error('Failed to add user:', err);
    }
  };

  const openAddTaskModal = (status = 'To-Do') => {
    setEditingTask(null);
    setInitialTaskStatus(status);
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const columns = ['To-Do', 'In Progress', 'Done'];

  const currentProject = projects.find((p) => p.id === selectedProjectId);

  // Check if any user has burnout warning
  const burnoutUsers = users.filter((u) => u.workload?.isBurnoutWarning);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Kanban className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base tracking-tight text-white">
                  TaskFlow Kanban
                </h1>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800">
                  Pro
                </span>
              </div>
              <p className="text-xs text-slate-400">Streamlined Task Management & Workload Balancing</p>
            </div>
          </div>

          {/* Project Selector & Actions */}
          <div className="flex items-center flex-wrap gap-3">
            {/* Project Select */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
              <FolderKanban className="w-4 h-4 text-indigo-400" />
              <select
                value={selectedProjectId || ''}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Create Task Button */}
            <button
              onClick={() => openAddTaskModal('To-Do')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Burnout Alert Banner (if any user has > 5 tasks in progress) */}
        {burnoutUsers.length > 0 && (
          <div className="bg-red-950/60 border border-red-800/80 rounded-2xl p-4 flex items-center justify-between gap-4 animate-in fade-in duration-300 shadow-xl shadow-red-950/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/50 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-5 h-5 text-red-400 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-200">
                  Workload Burnout Warning Active!
                </h4>
                <p className="text-xs text-red-300/80 mt-0.5">
                  {burnoutUsers.map((u) => u.name).join(', ')}{' '}
                  {burnoutUsers.length === 1 ? 'has' : 'have'} more than 5 tasks in "In Progress". Their avatar is pulsing red in the team workload panel.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-red-900 text-red-100 rounded-full border border-red-700 shrink-0">
              🚨 Overloaded
            </span>
          </div>
        )}

        {/* Team Workload Balancing Section */}
        <TeamWorkload
          users={users}
          onAddUserClick={() => setIsUserModalOpen(true)}
          selectedAssignee={selectedAssigneeFilter}
          onSelectAssignee={setSelectedAssigneeFilter}
        />

        {/* Controls Bar: Priority Filter & Refresh */}
        <div className="flex items-center justify-between gap-4 bg-slate-900/40 border border-slate-800/60 p-3 rounded-2xl">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-300">Filter Priority:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {['All', 'Low', 'Medium', 'High', 'Urgent'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium border transition ${
                    priorityFilter === p
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              fetchTasks();
              fetchUsers();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs font-medium transition"
            title="Refresh tasks"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* 3-Column Drag and Drop Kanban Board */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((colTitle) => {
              const colTasks = tasks.filter((t) => t.status === colTitle);

              return (
                <KanbanColumn
                  key={colTitle}
                  columnId={colTitle}
                  title={colTitle}
                  tasks={colTasks}
                  onAddTask={openAddTaskModal}
                  onDeleteTask={handleDeleteTask}
                  onEditTask={openEditTaskModal}
                />
              );
            })}
          </div>
        </DragDropContext>
      </main>

      {/* Task Creation / Editing Modal */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        users={users}
        initialStatus={initialTaskStatus}
        taskToEdit={editingTask}
      />

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onAddUser={handleAddUser}
      />
    </div>
  );
}
