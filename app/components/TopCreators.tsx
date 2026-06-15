"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Creator {
  _id: string;
  penName?: string;
  displayName?: string;
  email?: string;
  followersCount?: number;
  mangaCount?: number;
  photoURL?: string;
}

export default function TopCreators() {
  const [creators, setCreators] = useState<Creator[]>([]);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    fetch(`${API}/users/top-creators`)
      .then((r) => r.json())
      .then((data) => setCreators(Array.isArray(data) ? data.slice(0, 4) : []))
      .catch(() => {});
  }, []);

  const placeholders: Creator[] = [
    { _id: "1", penName: "Akira Mori",   followersCount: 124000 },
    { _id: "2", penName: "Sora Yuki",    followersCount: 98000  },
    { _id: "3", penName: "Hina Takeda",  followersCount: 87000  },
    { _id: "4", penName: "Kai Ren",      followersCount: 75000  },
  ];

  const display = creators.length > 0 ? creators : placeholders;

  function fmtFollowers(n?: number) {
    if (!n) return "0";
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return String(n);
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">Top Creators</h2>
        <Link href="/creators" className="text-purple-400 hover:text-purple-300 transition">
          View All →
        </Link>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {display.map((creator) => {
          const name = creator.penName ?? creator.displayName ?? creator.email ?? "Creator";
          const initial = name.charAt(0).toUpperCase();

          return (
            <div
              key={creator._id}
              className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden hover:border-purple-500/40 transition-all"
            >
              {/* Avatar area */}
              <div className="relative h-[200px] flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-violet-900/30">
                {creator.photoURL ? (
                  <img
                    src={creator.photoURL}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-purple-500/20 border-2 border-purple-500/40 flex items-center justify-center">
                    <span className="text-4xl font-bold text-purple-400">{initial}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#07080f]/80 to-transparent" />
              </div>

              <div className="p-5">
                <h3 className="font-semibold text-lg">{name}</h3>
                <p className="text-gray-400 text-sm mt-1">
                  {fmtFollowers(creator.followersCount)} Followers
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
