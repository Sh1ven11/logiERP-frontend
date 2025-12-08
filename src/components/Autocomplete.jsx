import { useState, useRef, useEffect } from "react";

export default function Autocomplete({ label, items, value, onChange }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Filter items based on typing
  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {label && <label className="text-sm text-gray-700">{label}</label>}

      <input
        className="border p-2 w-full"
        placeholder={`Search ${label}...`}
        value={query || value?.name || ""}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />

      {open && filtered.length > 0 && (
        <ul className="absolute left-0 right-0 bg-white border rounded shadow max-h-48 overflow-auto z-10">
          {filtered.map((item) => (
            <li
              key={item.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onChange(item);     // return full object
                setQuery(item.name);
                setOpen(false);
              }}
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
