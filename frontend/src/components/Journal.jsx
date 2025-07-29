  const Journal = ({ journal, onEdit, onDelete }) => {
    return (
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow relative hover:scale-[1.02] transition-transform group">
        <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={() => onEdit(journal.id)}
            className="w-8 h-8 bg-gray-100 dark:bg-zinc-700 hover:scale-110 transition rounded-md flex items-center justify-center"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(journal.id)}
            className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center justify-center"
          >
            🗑️
          </button>
        </div>

        <p className="absolute top-3 right-3 text-xs text-gray-500 dark:text-gray-300">
          {journal.createdat.split("T")[0]}
        </p>

        <h3 className="text-lg font-semibold break-words text-center mt-6">
          {journal.name}
        </h3>
      </div>
    );
  };

  export default Journal;