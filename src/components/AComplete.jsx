// components/AAutocomplete.jsx
// Reusable autocomplete component with debounced async fetching

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, Search } from "lucide-react";

/**
 * @param {Function} fetchFunction   async (query) => Promise<Array | {data:Array}>
 * @param {Function} onSelect        (item|null) => void
 * @param {Function} renderOption    (item) => JSX
 * @param {Function} getOptionLabel  (item) => string
 * @param {string}   placeholder
 * @param {string}   initialSearchValue
 * @param {number}   minChars
 */
export default function AAutocomplete({
  fetchFunction,
  onSelect,
  renderOption,
  getOptionLabel = (item) =>
    item?.label || item?.name || item?.companyName || "",
  placeholder = "Search...",
  initialSearchValue = "",
  minChars = 2,
}) {
  const [searchQuery, setSearchQuery] = useState(initialSearchValue);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const componentRef = useRef(null);

  // --------------------------------------------------
  // Debounced Fetch Logic (NO dropdown dependency)
  // --------------------------------------------------
  const debouncedFetch = useCallback(
    async (query) => {
      if (!query || query.length < minChars) {
        setOptions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const result = await fetchFunction(query);

        // Normalize axios / fetch / custom responses
        const list = result?.data ?? result ?? [];
        setOptions(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Autocomplete fetch error:", err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [fetchFunction, minChars]
  );

  // --------------------------------------------------
  // Debounce Effect
  // --------------------------------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedFetch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedFetch]);

  // --------------------------------------------------
  // Sync external value (Edit / Reset)
  // --------------------------------------------------
  useEffect(() => {
    setSearchQuery(initialSearchValue || "");
  }, [initialSearchValue]);

  // --------------------------------------------------
  // Handlers
  // --------------------------------------------------
  const handleChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowDropdown(true);

    if (value === "") {
      setOptions([]);
      onSelect?.(null);
    }
  };

  const handleSelect = (item) => {
    setSearchQuery(getOptionLabel(item));
    setShowDropdown(false);
    setOptions([]);
    onSelect?.(item);
  };

  // --------------------------------------------------
  // Close dropdown on outside click
  // --------------------------------------------------
  useEffect(() => {
    function handleClickOutside(e) {
      if (componentRef.current && !componentRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div className="relative w-full" ref={componentRef}>
      <div className="flex items-center border rounded-lg px-3 py-2 bg-white">
        <Search size={18} className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleChange}
          onFocus={() => setShowDropdown(true)}
          className="w-full outline-none text-sm"
        />
        {loading && (
          <Loader2
            size={18}
            className="animate-spin text-blue-500 ml-2"
          />
        )}
      </div>

      {showDropdown && options.length > 0 && (
        <div className="absolute bg-white border mt-1 w-full shadow-lg rounded z-20 max-h-60 overflow-y-auto">
          {options.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
            >
              {renderOption(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
