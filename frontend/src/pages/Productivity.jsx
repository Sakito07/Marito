import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Plus, Check, Trash2, Timer, RotateCcw, Calendar, Flag, Edit3 } from 'lucide-react';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  
 
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('work');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const intervalRef = useRef(null);

  const API_BASE = 'http://localhost:3000';


  const phases = {
    work: { duration: 25 * 60, label: 'Work', color: 'bg-red-500' },
    shortBreak: { duration: 5 * 60, label: 'Short Break', color: 'bg-green-500' },
    longBreak: { duration: 15 * 60, label: 'Long Break', color: 'bg-blue-500' }
  };

  const priorityColors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  const priorityLabels = {
    high: 'High',
    medium: 'Medium',
    low: 'Low'
  };


  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []);


  useEffect(() => {
    if (isRunning && pomodoroTime > 0) {
      intervalRef.current = setInterval(() => {
        setPomodoroTime(time => {
          if (time <= 1) {
            handlePhaseComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, pomodoroTime]);


  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      setError(error.message);
      throw error;
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/task');
      setTasks(data);
      setError('');
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiCall('/task/stats');
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const createTask = async (taskData) => {
    try {
      const newTask = await apiCall('/task', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });
      setTasks(prev => [newTask, ...prev]);
      fetchStats();
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const updatedTask = await apiCall(`/task/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ));
      fetchStats();
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (id) => {
    try {
      await apiCall(`/task/${id}`, {
        method: 'DELETE',
      });
      setTasks(prev => prev.filter(task => task.id !== id));
      fetchStats();
      

      if (activeTaskId === id) {
        setActiveTaskId(null);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  const toggleTask = async (id) => {
    try {
      const updatedTask = await apiCall(`/task/${id}/toggle`, {
        method: 'POST',
      });
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ));
      fetchStats();
      return updatedTask;
    } catch (error) {
      console.error('Error toggling task:', error);
      throw error;
    }
  };

  const incrementPomodoro = async (taskId) => {
    try {
      const updatedTask = await apiCall(`/task/${taskId}/pomodoro`, {
        method: 'POST',
      });
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      return updatedTask;
    } catch (error) {
      console.error('Error incrementing pomodoro:', error);
      throw error;
    }
  };


  const handlePhaseComplete = async () => {
    playNotificationSound();
    
    if (currentPhase === 'work') {
      setCompletedPomodoros(prev => prev + 1);
      
     
      if (activeTaskId) {
        await incrementPomodoro(activeTaskId);
      }
      
      const nextPhase = (completedPomodoros + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
      setCurrentPhase(nextPhase);
      setPomodoroTime(phases[nextPhase].duration);
    } else {
      setCurrentPhase('work');
      setPomodoroTime(phases.work.duration);
    }
    
    setIsRunning(false);
  };

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio notification not available');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString();
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dueDate) < today;
  };

  const handleAddTask = async () => {
    if (newTask.trim()) {
      try {
        await createTask({ 
          title: newTask.trim(),
          description: newTaskDescription.trim() || null,
          priority: newTaskPriority,
          due_date: newTaskDueDate || null
        });
        setNewTask('');
        setNewTaskDescription('');
        setNewTaskPriority('medium');
        setNewTaskDueDate('');
        setError('');
      } catch (error) {
   
      }
    }
  };

  const handleEditTask = (task) => {
    setEditingTask({
      ...task,
      dueDate: task.dueDate || '',
      description: task.description || ''
    });
  };

  const saveEditTask = async () => {
    if (editingTask.title.trim()) {
      try {
        await updateTask(editingTask.id, {
          title: editingTask.title.trim(),
          description: editingTask.description?.trim() || null,
          priority: editingTask.priority,
          due_date: editingTask.dueDate || null
        });
        setEditingTask(null);
        setError('');
      } catch (error) {
 
      }
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    if (filter === 'overdue') return !task.completed && isOverdue(task.dueDate);
    if (filter === 'high') return task.priority === 'high';
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {

    const priorityOrder = { high: 3, medium: 2, low: 1 };
    
  
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
   
    if (a.priority !== b.priority) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
   
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    

    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const startPomodoro = (taskId = null) => {
    setActiveTaskId(taskId);
    setIsRunning(true);
  };

  const pausePomodoro = () => {
    setIsRunning(false);
  };

  const resetPomodoro = () => {
    setIsRunning(false);
    setPomodoroTime(phases[currentPhase].duration);
  };

  const resetSession = () => {
    setIsRunning(false);
    setCurrentPhase('work');
    setPomodoroTime(phases.work.duration);
    setCompletedPomodoros(0);
    setActiveTaskId(null);
  };

  const activeTask = tasks.find(task => task.id === activeTaskId);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Ultimate Task Manager</h1>
          <p className="text-gray-300">Stay focused with Pomodoro technique</p>
          {stats && (
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <span className="text-gray-300">Total: {stats.totalTasks}</span>
              <span className="text-green-400">Completed: {stats.completedTasks}</span>
              <span className="text-yellow-400">Pending: {stats.pendingTasks}</span>
              <span className="text-red-400">Overdue: {stats.overdue}</span>
              <span className="text-purple-400">Pomodoros: {stats.totalPomodoros}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6 text-red-200 text-center max-w-2xl mx-auto">
            {error}
          </div>
        )}

        <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto">
  
          <div className="col-span-12 lg:col-span-4 xl:col-span-3">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 sticky top-8">
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-4 h-4 rounded-full ${phases[currentPhase].color} mb-4`}>
                  <Timer className="w-2 h-2 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  {phases[currentPhase].label}
                </h2>
                
                {activeTask && (
                  <div className="mb-4 p-3 bg-white/10 rounded-xl">
                    <p className="text-sm text-gray-300 mb-1">Working on:</p>
                    <p className="text-white font-medium text-sm">{activeTask.title}</p>
                    <p className="text-xs text-gray-400">Pomodoros: {activeTask.pomodorosSpent || 0}</p>
                  </div>
                )}
                
                <div className="relative w-48 h-48 mx-auto mb-6">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - (phases[currentPhase].duration - pomodoroTime) / phases[currentPhase].duration)}`}
                      className="transition-all duration-1000 ease-linear"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-mono font-bold text-white">
                      {formatTime(pomodoroTime)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center gap-3 mb-4">
                  <button
                    onClick={() => isRunning ? pausePomodoro() : startPomodoro(activeTaskId)}
                    className="flex items-center gap-2 btn btn-primary hover:btn-secondary  px-4 py-2 rounded-full font-semibold transition-all duration-200 transform hover:scale-105"
                  >
                    {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isRunning ? 'Pause' : 'Start'}
                  </button>
                  <button
                    onClick={resetPomodoro}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-semibold transition-all duration-200"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-white/10 rounded-2xl p-3 mb-3">
                  <p className="text-white text-sm mb-2">Completed Today</p>
                  <div className="flex justify-center gap-1">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < completedPomodoros ? 'bg-green-400' : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-300 mt-1">{completedPomodoros}/8</p>
                </div>

                <button
                  onClick={resetSession}
                  className="text-xs text-gray-300 hover:text-white transition-colors"
                >
                  Reset session
                </button>
              </div>
            </div>
          </div>

      
          <div className="col-span-12 lg:col-span-8 xl:col-span-9">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              <h2 className="text-3xl font-semibold text-white mb-8">Tasks</h2>
              
         
              <div className="mb-8 bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-medium text-white mb-4">Add New Task</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                    placeholder="Enter task title..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <textarea
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="Description (optional)..."
                    rows="2"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-300 mb-2">Priority</label>
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="low" className="bg-gray-800">Low Priority</option>
                        <option value="medium" className="bg-gray-800">Medium Priority</option>
                        <option value="high" className="bg-gray-800">High Priority</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-300 mb-2">Due Date</label>
                      <input
                        type="date"
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleAddTask}
                        disabled={loading}
                        className="btn btn-primary disabled:opacity-50 text-white px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        {loading ? 'Adding...' : 'Add Task'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

       
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'pending', label: 'Pending' },
                  { key: 'completed', label: 'Completed' },
                  { key: 'overdue', label: 'Overdue' },
                  { key: 'high', label: 'High Priority' }
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      filter === f.key
                        ? 'btn btn-primary text-white'
                        : 'btn btn-secondary text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

            
              {loading ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  Loading tasks...
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`bg-white/10 border border-white/20 rounded-xl p-6 transition-all duration-200 hover:bg-white/20 ${
                        activeTaskId === task.id ? 'ring-2 ring-purple-500' : ''
                      } ${task.completed ? 'opacity-75' : ''}`}
                    >
                      {editingTask && editingTask.id === task.id ? (
                        <div className="space-y-4">
                          <input
                            type="text"
                            value={editingTask.title}
                            onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                          />
                          <textarea
                            value={editingTask.description || ''}
                            onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                            placeholder="Description (optional)..."
                            rows="2"
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-300 resize-none"
                          />
                          <div className="flex gap-4">
                            <select
                              value={editingTask.priority}
                              onChange={(e) => setEditingTask({...editingTask, priority: e.target.value})}
                              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                            >
                              <option value="low" className="bg-gray-800">Low</option>
                              <option value="medium" className="bg-gray-800">Medium</option>
                              <option value="high" className="bg-gray-800">High</option>
                            </select>
                            <input
                              type="date"
                              value={editingTask.dueDate || ''}
                              onChange={(e) => setEditingTask({...editingTask, dueDate: e.target.value})}
                              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={saveEditTask}
                              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingTask(null)}
                              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-start gap-4">
                            <button
                              onClick={() => toggleTask(task.id)}
                              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 mt-1 ${
                                task.completed
                                  ? 'bg-green-500 border-green-500'
                                  : 'border-white/30 hover:border-white/50'
                              }`}
                            >
                              {task.completed && <Check className="w-4 h-4 text-white" />}
                            </button>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <span
                                  className={`text-lg ${
                                    task.completed
                                      ? 'text-gray-400 line-through'
                                      : 'text-white'
                                  }`}
                                >
                                  {task.title}
                                </span>
                                <div className={`w-3 h-3 rounded-full ${priorityColors[task.priority]}`} />
                                <span className="text-xs text-gray-300 bg-white/10 px-2 py-1 rounded-full">
                                  {priorityLabels[task.priority]}
                                </span>
                                {task.pomodorosSpent > 0 && (
                                  <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-1 rounded-full">
                                    🍅 {task.pomodorosSpent}
                                  </span>
                                )}
                              </div>
                              
                              {task.description && (
                                <p className="text-sm text-gray-300 mb-2">{task.description}</p>
                              )}
                              
                              {task.dueDate && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="w-4 h-4" />
                                  <span className={`${
                                    isOverdue(task.dueDate) && !task.completed
                                      ? 'text-red-400'
                                      : 'text-gray-300'
                                  }`}>
                                    Due: {formatDate(task.dueDate)}
                                    {isOverdue(task.dueDate) && !task.completed && ' (Overdue)'}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2">
                              {!task.completed && (
                                <button
                                  onClick={() => startPomodoro(task.id)}
                                  className="text-purple-400 hover:text-purple-300 transition-colors p-2"
                                  title="Start Pomodoro for this task"
                                >
                                  <Play className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleEditTask(task)}
                                className="text-blue-400 hover:text-blue-300 transition-colors p-2"
                                title="Edit task"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="text-red-400 hover:text-red-300 transition-colors p-2"
                                title="Delete task"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {sortedTasks.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <div className="text-6xl mb-4">📝</div>
                      <p className="text-xl mb-2">
                        {filter === 'all' ? 'No tasks yet!' : `No ${filter} tasks.`}
                      </p>
                      <p>
                        {filter === 'all' ? 'Add your first task above to get started.' : 'Try changing the filter.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskManager;