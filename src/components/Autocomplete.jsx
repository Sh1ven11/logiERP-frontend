import { useState, useRef, useEffect } from "react";

export default function Autocomplete({ label, items, value, onChange }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // FIX 1: Synchronize internal query state with external value prop
  // This ensures the input displays the currently selected item's name 
  // without relying on the input's default value logic.
  useEffect(() => {
    // If a value object is passed (or changes), set the query to its name.
    setQuery(value?.name || "");
  }, [value]);


  // Filter items based on typing
  const filtered = items.filter((item) =>
    // Ensure item.name exists before calling toLowerCase
    item.name?.toLowerCase().includes(query.toLowerCase()) 
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        // Only close if the user hasn't typed anything AND there is no selected item
        // This is necessary to maintain the selected value if focus is lost.
        if (query === (value?.name || "")) { 
          setOpen(false);
        }
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [query, value]);

  // Handle input change and always keep the selected value's name as fallback
  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setQuery(inputValue);
    setOpen(true);
    
    // IMPORTANT: If the user deletes the text, treat it as unselecting the item
    if (!inputValue) {
        onChange({}); // Pass an empty object or null to clear the parent state
    }
  };


  return (
    <div className="relative w-full" ref={wrapperRef}>
      {label && <label className="text-sm text-gray-700">{label}</label>}

      <input
        className="border p-2 w-full"
        placeholder={`Search ${label}...`}
        // FIX 2: Use query directly as it is now synchronized by the useEffect hook
        value={query} 
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
      />

      {open && filtered.length > 0 && (
        <ul className="absolute left-0 right-0 bg-white border rounded shadow max-h-48 overflow-auto z-10">
          {filtered.map((item) => (
            <li
              key={item.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onChange(item);     // return full object to parent
                setQuery(item.name); // Set query for immediate display
                setOpen(false);
              }}
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}

      {/* Optional: Show message if no items match the query */}
      {open && query && filtered.length === 0 && (
          <div className="absolute left-0 right-0 p-2 bg-white border text-gray-500 text-sm">
              No results found.
          </div>
      )}
    </div>
  );
}