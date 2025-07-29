import { useEffect, useState } from "react";
import {
  Plus,
  Target,
  Flame,
  Calendar,
  TrendingUp,
  Award,
  Edit2,
  Trash2,
  Check,
  X,
} from "lucide-react";

const HabitTracker = () => {
  const [habits, setHabits] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "health",
    frequency: "daily",
    target: 1,
    color: "#3B82F6",
  });
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [viewMode, setViewMode] = useState("today");
  const [statsData, setStatsData] = useState({
    totalHabits: 0,
    completedToday: 0,
    totalStreak: 0,
    totalCompletions: 0
  });
  const [loading, setLoading] = useState(true);

  const categories = {
    health: { icon: "💪", color: "#10B981", label: "Health" },
    productivity: { icon: "📈", color: "#3B82F6", label: "Productivity" },
    learning: { icon: "📚", color: "#8B5CF6", label: "Learning" },
    mindfulness: { icon: "🧘", color: "#06B6D4", label: "Mindfulness" },
    social: { icon: "👥", color: "#F59E0B", label: "Social" },
    creative: { icon: "🎨", color: "#EF4444", label: "Creative" },
    finance: { icon: "💰", color: "#059669", label: "Finance" },
    other: { icon: "⭐", color: "#6B7280", label: "Other" },
  };

  useEffect(() => {
    loadHabits();
    loadStats();
  }, []);

  const loadHabits = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/habit", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error fetching habits:", errorData.error);
        return;
      }
      
      const savedHabits = await res.json();
      console.log('Loaded habits:', savedHabits);
      setHabits(savedHabits);
    } catch (error) {
      console.error("Request failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch("http://localhost:3000/habit/stats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error fetching stats:", errorData.error);
        return;
      }
      
      const stats = await res.json();
      setStatsData(stats);
    } catch (error) {
      console.error("Request failed:", error);
    }
  };

  const createHabit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    
    try {
      const res = await fetch("http://localhost:3000/habit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          category: form.category,
          frequency: form.frequency,
          target: form.target,
          color: form.color,
        }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        console.error("Error creating habit:", data.error);
        return;
      }
      
      const newHabit = data;
      const updatedHabits = [newHabit, ...habits];
      setHabits(updatedHabits);
      loadStats();
      resetForm();
    } catch (error) {
      console.error("Request failed:", error);
    }
  };

  const editHabit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    
    try {
      const res = await fetch(`http://localhost:3000/habit/${editingHabitId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          category: form.category,
          frequency: form.frequency,
          target: form.target,
          color: form.color,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error updating habit:", errorData.error);
        return;
      }
      
      const updatedHabit = await res.json();
      const updatedHabits = habits.map((habit) =>
        habit.id === editingHabitId ? updatedHabit : habit
      );
      setHabits(updatedHabits);
      loadStats();  
      resetForm();
    } catch (error) {
      console.error("Request failed:", error);
    }
  };

  const deleteHabit = async (id) => {
    if (confirm("Are you sure you want to delete this habit?")) {
      try {
        const res = await fetch(`http://localhost:3000/habit/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Error deleting habit:", errorData.error);
          return;
        }
        
        const updatedHabits = habits.filter((habit) => habit.id !== id);
        setHabits(updatedHabits);
        loadStats(); 
      } catch (error) {
        console.error("Request failed:", error);
      }
    }
  };

  const toggleHabitComplete = async (habitId, date) => {
    try {
      const res = await fetch(`http://localhost:3000/habit/${habitId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ date }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error toggling habit completion:", errorData.error);
        return;
      }
      
      const updatedHabit = await res.json();
      const updatedHabits = habits.map((habit) =>
        habit.id === habitId ? updatedHabit : habit
      );
      setHabits(updatedHabits);
      loadStats();  
    } catch (error) {
      console.error("Request failed:", error);
    }
  };

  const handleEditClick = (id) => {
    const habit = habits.find((h) => h.id === id);
    if (habit) {
      setForm({
        name: habit.name,
        description: habit.description || "",
        category: habit.category,
        frequency: habit.frequency,
        target: habit.target,
        color: habit.color,
      });
      setEditingHabitId(id);
      setShowDialog(true);
    }
  };

  const resetForm = () => {
    setShowDialog(false);
    setEditingHabitId(null);
    setForm({
      name: "",
      description: "",
      category: "health",
      frequency: "daily",
      target: 1,
      color: "#3B82F6",
    });
  };

  const handleSubmit = (e) => {
    if (editingHabitId) {
      editHabit(e);
    } else {
      createHabit(e);
    }
  };

  const getWeekDates = () => {
    const today = new Date();
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  const getCompletionPercentage = (habit, date) => {
    const completed = habit?.completions?.[date] || 0;
    const target = habit?.target ?? 1;
    return Math.min((completed / target) * 100, 100);
  };

  const stats = () => {
    return statsData;
  };

  const weekDates = getWeekDates();
  const today = new Date().toISOString().split("T")[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Target className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 text-lg">Loading your habits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto p-6 max-w-7xl">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Target className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-primary">
              Habit Tracker
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-xl">
            Build better habits, one day at a time
          </p>
        </header>

   
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats().totalHabits}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Habits
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats().completedToday}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Completed Today
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-xl">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats().totalStreak}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Active Streaks
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats().totalCompletions}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Completions
                </p>
              </div>
            </div>
          </div>
        </div>

  
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowDialog(true)}
            className="btn btn-secondary hover:btn-primary text-white px-8 py-4 rounded-2xl font-semibold flex items-center gap-3 shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Add New Habit
          </button>
        </div>

        {habits.length === 0 ? (
          <div className="text-center py-16">
            <Target className="w-20 h-20 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No habits yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first habit to start building better routines!
            </p>
            <button
              onClick={() => setShowDialog(true)}
              className="btn btn-primary hover:btn-secondary text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Create Your First Habit
            </button>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {habits.map((habit) => {
              const todayProgress = getCompletionPercentage(habit, today);
              const isDayCompleted = (habit.completions?.[today] || 0) >= habit.target;
              const category = categories[habit.category];

              return (
                <div
                  key={habit.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
         
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-xl text-white text-lg"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {habit.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {category.label}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(habit.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

              
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Today Progress
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {habit.completions?.[today] || 0}/{habit.target}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all duration-300"
                        style={{
                          width: `${todayProgress}%`,
                          backgroundColor: category.color,
                        }}
                      />
                    </div>
                  </div>

             
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      This Week
                    </p>
                    <div className="flex gap-1">
                      {weekDates.map((date) => {
                        const dayProgress = getCompletionPercentage(habit, date);
                        const isDayCompleted = (habit.completions?.[date] || 0) >= habit.target;
                        const isToday = date === today;
                        
                        return (
                          <div
                            key={date}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium cursor-pointer transition-all ${
                              isToday ? "ring-2 ring-blue-500" : ""
                            }`}
                            style={{
                              backgroundColor: isDayCompleted
                                ? category.color
                                : "#E5E7EB",
                              color: isDayCompleted ? "white" : "#6B7280",
                            }}
                            onClick={() => toggleHabitComplete(habit.id, date)}
                          >
                            {new Date(date).getDate()}
                          </div>
                        );
                      })}
                    </div>
                  </div>

            
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {habit.streak || 0}
                      </p>
                      <p className="text-xs text-gray-500">Current Streak</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {habit.bestStreak || 0}
                      </p>
                      <p className="text-xs text-gray-500">Best Streak</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {habit.totalCompletions || 0}
                      </p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                  </div>

                
                  <button
                    onClick={() => toggleHabitComplete(habit.id, today)}
                    className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${
                      isDayCompleted
                        ? "bg-green-100 text-green-700 border-2 border-green-200"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-transparent hover:border-gray-300"
                    }`}
                  >
                    {isDayCompleted ? (
                      <span className="flex items-center justify-center gap-2">
                        <Check className="w-5 h-5" />
                        Completed!
                      </span>
                    ) : (
                      "Mark as Done"
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

 
        {showDialog && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && resetForm()}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingHabitId ? "Edit Habit" : "Create New Habit"}
                </h2>
                <button
                  type="button"
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Habit Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Drink 8 glasses of water"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Why is this habit important to you?"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(categories).map(([key, category]) => (
                      <option key={key} value={key}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Daily Target
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.target}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        target: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-colors"
                  >
                    {editingHabitId ? "Update" : "Create"} Habit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitTracker;