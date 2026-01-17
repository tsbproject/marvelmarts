"use client";

import { useState, useEffect, useRef } from "react";
import { Search, FileText, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SupportSearchMini() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      const res = await fetch(`/api/support/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
      setLoading(false);
      setIsOpen(true);
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 1 && setIsOpen(true)}
          placeholder="Search help articles..."
          className="w-full h-12 pl-12 pr-4 bg-gray-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
        />
        {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-gray-400" size={16} />}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          {results.map((article: any) => (
            <Link
              key={article.id}
              href={`/support/articles/${article.slug}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-4 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
            >
              <FileText size={16} className="text-blue-600" />
              <div>
                <p className="text-sm font-bold text-gray-900">{article.title}</p>
                <p className="text-[10px] text-gray-400 uppercase font-black">{article.category}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}