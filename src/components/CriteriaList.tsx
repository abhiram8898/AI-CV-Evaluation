import { useState } from "react";

export type CriteriaItem = {
  id: number;
  label: string;
  dislike?: boolean;
  reason?: string;
  rating?: number | string;
};

type CriteriaListProps = {
  initial?: CriteriaItem[];
  selectOptions?: string[];
  needsRating?: boolean;
  title: string;
  items?: CriteriaItem[];
  onAddItem?: (label: string) => void;
  onRemoveItem?: (id: number) => void;
  onUpdateRating?: (id: number, rating: number) => void;
};

export default function CriteriaList({
  items = [],
  selectOptions = [],
  needsRating = false,
  title,
  onAddItem,
  onRemoveItem,
  onUpdateRating,
}: Readonly<CriteriaListProps>) {
  const [selected, setSelected] = useState("");
  const [localItems, setLocalItems] = useState(items);
  const [isHovered, setIsHovered] = useState<number | null>(null);

  function addItem() {
    if (!selected) {
      showToast("Please select a value", "error");
      return;
    }
    const newItem = {
      id: Date.now(),
      label: selected,
      dislike: false,
      reason: "",
      rating: "",
    };
    if (onAddItem) {
      onAddItem(selected);
    } else {
      setLocalItems((prev) => [...prev, newItem]);
    }
    setSelected("");
    showToast("Added successfully");
  }

  function removeItem(id: number) {
    if (onRemoveItem) {
      onRemoveItem(id);
    } else {
      setLocalItems((prev) => prev.filter((i) => i.id !== id));
    }
  }

  function toggleDislike(id: number) {
    setLocalItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, dislike: !i.dislike } : i))
    );
  }

  function updateItem(id: number, changes: Partial<CriteriaItem>) {
    setLocalItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...changes } : i))
    );
  }

  function showToast(msg: string, type: "success" | "error" = "success") {
    const n = document.createElement("div");
    n.className = `fixed top-6 right-6 z-50 px-4 py-3 rounded-lg text-white font-medium text-sm shadow-lg backdrop-blur-sm border border-white/10 ${
      type === "error" ? "bg-red-500" : "bg-green-500"
    }`;
    n.textContent = msg;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 1800);
  }

  const displayItems = onAddItem ? items : localItems;

  return (
    <div className="bg-linear-to-br from-white to-gray-50 rounded-xl p-6 shadow-sm border border-white/80">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <i className="fa-solid fa-list text-blue-500 text-sm"></i>
        {title}
      </h3>

      <ul className="space-y-3 mb-6">
        {displayItems.map((item) => (
          <li
            key={item.id}
            className={`bg-white rounded-lg p-3 border border-gray-200 shadow-sm transition-all duration-200 ${
              isHovered === item.id
                ? "transform -translate-y-0.5 shadow-md"
                : ""
            }`}
            onMouseEnter={() => setIsHovered(item.id)}
            onMouseLeave={() => setIsHovered(null)}
          >
            <div className="flex justify-between items-center gap-3">
              <div className="flex-1 text-sm font-medium text-gray-700">
                {item.label}
              </div>

              {needsRating && (
                <select
                  className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-700 text-sm min-w-24"
                  value={item.rating || ""}
                  onChange={(e) => {
                    if (onUpdateRating) {
                      onUpdateRating(item.id, parseInt(e.target.value));
                    } else {
                      updateItem(item.id, { rating: e.target.value });
                    }
                  }}
                >
                  <option value="">Rate…</option>
                  <option value="1">1 - Beginner</option>
                  <option value="2">2 - Basic</option>
                  <option value="3">3 - Intermediate</option>
                  <option value="4">4 - Advanced</option>
                  <option value="5">5 - Expert</option>
                </select>
              )}

              <div className="flex gap-1">
                <button
                  className={`p-2 border rounded-md transition-colors ${
                    item.dislike
                      ? "bg-red-50 border-red-200 text-red-600"
                      : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                  onClick={() => toggleDislike(item.id)}
                  title="Dislike"
                >
                  <i className="fa-solid fa-thumbs-down text-xs"></i>
                </button>
                <button
                  className="p-2 border border-red-200 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                  onClick={() => removeItem(item.id)}
                  title="Delete"
                >
                  <i className="fa-solid fa-trash text-xs"></i>
                </button>
              </div>
            </div>

            <div
              className={`mt-3 transition-all duration-300 overflow-hidden ${
                item.dislike ? "max-h-32" : "max-h-0"
              }`}
            >
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none min-h-20"
                placeholder="Why is this not suitable?"
                value={item.reason || ""}
                onChange={(e) =>
                  updateItem(item.id, { reason: e.target.value })
                }
              />
            </div>
          </li>
        ))}
      </ul>

      <div className="flex gap-3 items-center">
        <select
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 text-sm"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">Add new {title.toLowerCase()}…</option>
          {selectOptions.map((option, idx) => (
            <option key={idx} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button
          className="px-4 py-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none rounded-md text-sm font-medium flex items-center gap-2 transition-all duration-200 hover:shadow-md"
          onClick={addItem}
        >
          <i className="fa-solid fa-plus text-xs"></i>
          Add
        </button>
      </div>
    </div>
  );
}
