"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const role = "admin"; //dummy role, bisa diganti sesuai kebutuhan

  const menu = [
    { name: "Artist", path: "/artist" },
    { name: "Ticket Category", path: "/ticket-category" },
  ];

  return (
    <nav className="w-full bg-white border-b border-orange-100 shadow-sm">

      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LOGO */}
        <h1 className="text-xl font-black text-orange-500">
          TikTakTuk
        </h1>

        {/* MENU */}
        <div className="flex items-center gap-6">
          {menu.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`
                text-sm font-semibold transition
                ${pathname === item.path
                  ? "text-orange-500 border-b-2 border-orange-500 pb-1"
                  : "text-gray-500 hover:text-orange-500"
                }
              `}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* ROLE BADGE */}
        <div className="text-xs px-3 py-1 rounded-full bg-orange-50 text-orange-500 border border-orange-200">
          {role}
        </div>

      </div>
    </nav>
  );
}