"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  href: string;
  label: string;
}

interface NavbarDropdownProps {
  items: MenuItem[];
}

export default function NavbarDropdown({ items }: NavbarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1 text-sm font-bold hover:text-primary transition-colors cursor-pointer outline-none",
          isOpen && "text-primary"
        )}
      >
        Lainnya
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 min-w-[200px] bg-white border-2 border-black shadow-[4px_4px_0_0_#000] z-50 py-2">
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm font-bold hover:bg-yellow-400 hover:text-black transition-colors border-b border-black last:border-0"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
