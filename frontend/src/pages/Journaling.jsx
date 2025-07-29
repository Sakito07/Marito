import React, { useEffect, useState } from "react";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Edit3, 
  Trash2, 
  Eye, 
  Heart, 
  Star, 
  Clock, 
  Tag,
  X,
  Save,
  FileText,
  Zap,
  TrendingUp,
  BookMarked,
  Smile,
  Sun,
  Moon,
  Cloud,
  CloudRain
} from "lucide-react";

const EnhancedJournaling = () => {
  const [notes, setNotes] = useState([]);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ name: "", content: "", mood: "neutral", tags: "", category: "personal" });
  const [activeJournal, setActiveJournal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterMood, setFilterMood] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  const categories = {
    personal: { color: "#3B82F6", icon: "👤", label: "Personal" },
    work: { color: "#059669", icon: "💼", label: "Work" },
    travel: { color: "#F59E0B", icon: "✈️", label: "Travel" },
    goals: { color: "#8B5CF6", icon: "🎯", label: "Goals" },
    gratitude: { color: "#EC4899", icon: "🙏", label: "Gratitude" },
    dreams: { color: "#06B6D4", icon: "💭", label: "Dreams" },
    learning: { color: "#10B981", icon: "📚", label: "Learning" },
    creative: { color: "#F97316", icon: "🎨", label: "Creative" }
  };

  const moods = {
    amazing: { color: "#10B981", icon: Sun, label: "Amazing" },
    happy: { color: "#3B82F6", icon: Smile, label: "Happy" },
    neutral: { color: "#6B7280", icon: Cloud, label: "Neutral" },
    sad: { color: "#EF4444", icon: CloudRain, label: "Sad" },
    stressed: { color: "#F59E0B", icon: Zap, label: "Stressed" }
  };

  useEffect(() => {
    getJournals();
  }, []);

  useEffect(() => {
    if (activeJournal && 
        activeJournal.originalContent !== undefined && 
        activeJournal.content !== undefined && 
        activeJournal.content !== activeJournal.originalContent) {
      const timer = setTimeout(() => {
        autoSaveJournal();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [activeJournal?.content]);

  const getJournals = async () => {
    try {
      const res = await fetch("http://localhost:3000/journal", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error fetching journals:", errorData.error);
        return;
      }
      const journals = await res.json();
      const enhancedJournals = journals.map(journal => ({
        ...journal,
        mood: journal.mood || "neutral",
        tags: journal.tags || "",
        category: journal.category || "personal",
        favorite: journal.favorite || false,
        content: journal.content || "" // Ensure content is never null
      }));
      setNotes(enhancedJournals);
    } catch (error) {
      console.error("Request failed:", error);
    }
  };

  const createJournal = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    try {
      const res = await fetch("http://localhost:3000/journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ 
          name: form.name, 
          content: form.content || "",
          mood: form.mood,
          tags: form.tags,
          category: form.category
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error creating journal:", errorData.error);
        return;
      }

      const newJournal = await res.json();
      setNotes((prev) => [{ 
        ...newJournal, 
        mood: form.mood, 
        tags: form.tags, 
        category: form.category,
        content: newJournal.content || ""
      }, ...prev]);
    } catch (error) {
      console.error("Request failed:", error);
    }

    resetForm();
  };

  const editJournal = async (id) => {
    if (!form.name.trim()) return;

    try {
      const res = await fetch("http://localhost:3000/journal", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ 
          id, 
          name: form.name, 
          content: form.content || "",
          mood: form.mood,
          tags: form.tags,
          category: form.category
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error updating journal:", errorData.error);
        return;
      }

      const updatedJournal = await res.json();
      setNotes((prev) =>
        prev.map((j) => (j.id === updatedJournal.id ? {
          ...updatedJournal,
          mood: form.mood,
          tags: form.tags,
          category: form.category,
          content: updatedJournal.content || ""
        } : j))
      );
    } catch (error) {
      console.error("Request failed:", error);
    }

    resetForm();
  };

  const autoSaveJournal = async () => {
    if (!activeJournal) return;
    
    setIsAutoSaving(true);
    try {
      const res = await fetch("http://localhost:3000/journal", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ 
          id: activeJournal.id, 
          name: activeJournal.name, 
          content: activeJournal.content || "",
          mood: activeJournal.mood,
          tags: activeJournal.tags,
          category: activeJournal.category
        }),
      });

      if (res.ok) {
        const updatedJournal = await res.json();
        setActiveJournal(prev => ({ 
          ...prev, 
          originalContent: prev.content,
          content: updatedJournal.content || ""
        }));
     
        setNotes(prev => prev.map(note => 
          note.id === updatedJournal.id ? { 
            ...updatedJournal, 
            content: updatedJournal.content || ""
          } : note
        ));
      }
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
    setIsAutoSaving(false);
  };

  const deleteJournal = async (id) => {
    if (!confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) return;

    try {
      const res = await fetch("http://localhost:3000/journal", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error deleting journal:", errorData.error);
        return;
      }

      setNotes((prev) => prev.filter((j) => j.id !== id));
     
      if (activeJournal && activeJournal.id === id) {
        setActiveJournal(null);
      }
    } catch (error) {
      console.error("Request failed:", error);
    }
  };

 
  const toggleFavorite = async (id) => {
    try {
      const res = await fetch("http://localhost:3000/journal/favorite", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error toggling favorite:", errorData.error);
        return;
      }

      const updatedJournal = await res.json();
      
    
      setNotes(prev => 
        prev.map(note => 
          note.id === id ? { ...note, favorite: updatedJournal.favorite } : note
        )
      );

     
      if (activeJournal && activeJournal.id === id) {
        setActiveJournal(prev => ({ ...prev, favorite: updatedJournal.favorite }));
      }
    } catch (error) {
      console.error("Request failed:", error);
    }
  };

  const handleEditClick = (id) => {
    const journal = notes.find((j) => j.id === id);
    if (journal) {
      setForm({ 
        name: journal.name || "", 
        content: journal.content || "",
        mood: journal.mood || "neutral",
        tags: journal.tags || "",
        category: journal.category || "personal"
      });
      setEditingNoteId(id);
      setShowDialog(true);
    }
  };

  const resetForm = () => {
    setShowDialog(false);
    setEditingNoteId(null);
    setForm({ name: "", content: "", mood: "neutral", tags: "", category: "personal" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingNoteId) {
      editJournal(editingNoteId);
    } else {
      createJournal(e);
    }
  };


  const closeActiveJournal = () => {

    const currentJournal = activeJournal;
    
    if (currentJournal && 
        currentJournal.originalContent !== undefined && 
        currentJournal.content !== undefined &&
        currentJournal.content !== currentJournal.originalContent) {
      if (window.confirm('You have unsaved changes. Do you want to save before closing?')) {
      
        autoSaveJournal().then(() => {
          setActiveJournal(null);
        }).catch((error) => {
          console.error('Failed to save before closing:', error);
         
          if (window.confirm('Save failed. Close anyway?')) {
            setActiveJournal(null);
          }
        });
        return;
      }
    }
    setActiveJournal(null);
  };

  const openJournal = (journal) => {
    setActiveJournal({
      ...journal,
      originalContent: journal.content || "",
      content: journal.content || ""
    });
  };

  const filteredAndSortedNotes = notes
    .filter(note => {
      const matchesSearch = note.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (note.tags && note.tags.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === "all" || note.category === filterCategory;
      const matchesMood = filterMood === "all" || note.mood === filterMood;
      return matchesSearch && matchesCategory && matchesMood;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdat) - new Date(a.createdat);
        case "oldest":
          return new Date(a.createdat) - new Date(b.createdat);
        case "alphabetical":
          return a.name.localeCompare(b.name);
        case "favorites":
          return (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0);
        default:
          return 0;
      }
    });

  const getStats = () => {
    const total = notes.length;
    const thisMonth = notes.filter(note => {
      const noteDate = new Date(note.createdat);
      const now = new Date();
      return noteDate.getMonth() === now.getMonth() && noteDate.getFullYear() === now.getFullYear();
    }).length;
    const favorites = notes.filter(note => note.favorite).length;
    const streak = calculateWritingStreak();
    return { total, thisMonth, favorites, streak };
  };

  const calculateWritingStreak = () => {
    const sortedDates = notes
      .map(note => new Date(note.createdat).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort((a, b) => new Date(b) - new Date(a));

    let streak = 0;
    const today = new Date().toDateString();
    
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (sortedDates[i] === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getWordCount = (content) => {
    return content ? content.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-orange-900/20 dark:to-amber-900/20">
      <div className="container mx-auto p-6 max-w-7xl">

        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-secondary" />
            <h1 className="text-4xl font-bold text-primary ">
              My Journal
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Capture your thoughts, dreams, and memories
          </p>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-orange-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-xl">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Entries</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-orange-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.thisMonth}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-orange-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pink-100 dark:bg-pink-900 rounded-xl">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.favorites}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Favorites</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-orange-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.streak}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Day Streak</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-orange-100 dark:border-gray-700">
          <div className="flex flex-wrap gap-4 items-center justify-between">
   
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search journals, tags, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Categories</option>
                {Object.entries(categories).map(([key, cat]) => (
                  <option key={key} value={key}>{cat.icon} {cat.label}</option>
                ))}
              </select>

              <select
                value={filterMood}
                onChange={(e) => setFilterMood(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Moods</option>
                {Object.entries(moods).map(([key, mood]) => (
                  <option key={key} value={key}>{mood.label}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="alphabetical">A to Z</option>
                <option value="favorites">Favorites First</option>
              </select>
            </div>

            <button
              onClick={() => setShowDialog(true)}
              className="btn btn-primary hover:btn-secondary text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              New Entry
            </button>
          </div>
        </div>

        {filteredAndSortedNotes.length === 0 ? (
          <div className="text-center py-16">
            <BookMarked className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
              {notes.length === 0 ? "No entries yet" : "No matching entries"}
            </h2>
            <p className="text-gray-500 mb-6">
              {notes.length === 0 
                ? "Start your journaling journey today!" 
                : "Try adjusting your search or filters"
              }
            </p>
            {notes.length === 0 && (
              <button
                onClick={() => setShowDialog(true)}
                className="btn btn-secondary hover:btn-primary text-white px-6 py-3 rounded-xl font-medium"
              >
                Write Your First Entry
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedNotes.map((note) => {
              const category = categories[note.category] || categories.personal;
              const mood = moods[note.mood] || moods.neutral;
              const MoodIcon = mood.icon;
              const wordCount = getWordCount(note.content);
              const tags = note.tags ? note.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
              const isActiveJournal = activeJournal && activeJournal.id === note.id;

              return (
                <div
                  key={note.id}
                  className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
                >

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-xl text-white"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                          {note.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span style={{ color: mood.color }} className="flex items-center gap-1">
                            <MoodIcon className="w-4 h-4" />
                            {mood.label}
                          </span>
                          <span>•</span>
                          <span>{formatDate(note.createdat)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleFavorite(note.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          note.favorite 
                            ? 'text-pink-600 bg-pink-50 dark:bg-pink-900/20' 
                            : 'text-gray-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${note.favorite ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => openJournal(note)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditClick(note.id)}
                        disabled={isActiveJournal}
                        className={`p-2 rounded-lg transition-colors ${
                          isActiveJournal 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteJournal(note.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">
                      {note.content || "No content yet..."}
                    </p>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                      {tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs rounded-full">
                          +{tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {wordCount} words
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.ceil(wordCount / 200)} min read
                    </span>
                  </div>
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingNoteId ? "Edit Entry" : "New Journal Entry"}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6 flex-1 overflow-auto">
        
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Give your entry a title..."
                    required
                  />
                </div>


                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                    >
                      {Object.entries(categories).map(([key, cat]) => (
                        <option key={key} value={key}>{cat.icon} {cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mood
                    </label>
                    <select
                      value={form.mood}
                      onChange={(e) => setForm({ ...form, mood: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                    >
                      {Object.entries(moods).map(([key, mood]) => (
                        <option key={key} value={key}>{mood.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={form.tags}
                      onChange={(e) => setForm({ ...form, tags: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="travel, memories, reflection (comma separated)"
                    />
                  </div>
                </div>

  
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content
                  </label>
                  <textarea
                    value={form.content || ""}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="w-full h-96 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    placeholder="Start writing your thoughts..."
                  />
                  <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                    <span>{getWordCount(form.content)} words</span>
                    <span>~{Math.ceil(getWordCount(form.content) / 200)} min read</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-medium transition-colors"
                >
                  {editingNoteId ? "Update Entry" : "Create Entry"}
                </button>
              </div>
            </div>
          </div>
        )}


        {activeJournal && (
          <div
            className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center p-4"
            onClick={(e) => e.target === e.currentTarget && closeActiveJournal()}
          >
            <div className="bg-white dark:bg-gray-800 w-full max-w-4xl h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
   
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div 
                    className="p-3 rounded-xl text-white"
                    style={{ backgroundColor: categories[activeJournal.category]?.color || categories.personal.color }}
                  >
                    {categories[activeJournal.category]?.icon || categories.personal.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {activeJournal.name}
                    </h2>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(activeJournal.createdat)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {getWordCount(activeJournal.content)} words
                      </span>
                      {isAutoSaving && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-green-600">
                            <Save className="w-4 h-4" />
                            Saving...
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFavorite(activeJournal.id)}
                    className={`p-3 rounded-xl transition-colors ${
                      activeJournal.favorite 
                        ? 'text-pink-600 bg-pink-50 dark:bg-pink-900/20' 
                        : 'text-gray-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${activeJournal.favorite ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleEditClick(activeJournal.id)}
                    className="p-3 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-colors"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={closeActiveJournal}
                    className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

 
              <div className="flex-1 p-6 overflow-auto">
                <textarea
                  className="w-full h-full p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl border-none resize-none focus:outline-none text-lg leading-relaxed"
                  placeholder="Start writing your thoughts here..."
                  value={activeJournal.content || ""}
                  onChange={(e) =>
                    setActiveJournal({ ...activeJournal, content: e.target.value })
                  }
                />
              </div>


              <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {activeJournal.tags && (
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        <span>{activeJournal.tags}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      {React.createElement(moods[activeJournal.mood]?.icon || moods.neutral.icon, {
                        className: "w-4 h-4",
                        style: { color: moods[activeJournal.mood]?.color || moods.neutral.color }
                      })}
                      <span>{moods[activeJournal.mood]?.label || moods.neutral.label}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={closeActiveJournal}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Close
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

export default EnhancedJournaling;