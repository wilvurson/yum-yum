import { useState } from "react";
import {
  TbRosetteNumber1,
  TbRosetteNumber2,
  TbRosetteNumber3,
} from "react-icons/tb";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<
    Array<{ id: number; name: string; points: number; rank: number }>
  >([]);
  return (
    <section className="rounded-[28px] bg-white dark:bg-zinc-900 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.3)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Leaderboard
        </div>
        <a
          href="/leaderboard"
          className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          See all
        </a>
      </div>

      <div className="space-y-3">
        {leaderboard.length === 0 ? (
          <div className="text-center py-4 text-sm text-zinc-500 dark:text-zinc-400">
            Loading leaderboard...
          </div>
        ) : (
          leaderboard.slice(0, 5).map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50 p-2"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  user.rank === 1
                    ? "bg-amber-400 text-white"
                    : user.rank === 2
                    ? "bg-gray-400 text-white"
                    : user.rank === 3
                    ? "bg-orange-400 text-white"
                    : "bg-zinc-200 dark:bg-zinc-600 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {user.rank === 1 ? (
                  <TbRosetteNumber1 size={28} />
                ) : user.rank === 2 ? (
                  <TbRosetteNumber2 size={28} />
                ) : user.rank === 3 ? (
                  <TbRosetteNumber3 size={28} />
                ) : (
                  user.rank
                )}
              </div>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  user.rank === 1
                    ? "bg-amber-100 dark:bg-amber-900/40"
                    : user.rank === 2
                    ? "bg-gray-100 dark:bg-gray-700/40"
                    : user.rank === 3
                    ? "bg-orange-100 dark:bg-orange-900/40"
                    : "bg-zinc-100 dark:bg-zinc-700/40"
                }`}
              >
                👤
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {user.name}
                </div>
              </div>
              <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {user.points}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
