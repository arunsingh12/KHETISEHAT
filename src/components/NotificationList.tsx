"use client";

import { useState } from "react";
import clsx from "clsx";

import { MarkNotificationsRead } from "@/components/MarkNotificationsRead";
import { timeAgo } from "@/lib/format";
import type { getNotifications } from "@/lib/queries";

type Notification = Awaited<ReturnType<typeof getNotifications>>[number];

export function NotificationList({ notifications }: { notifications: Notification[] }) {
  // Remember what was unread when the page opened — opening the page marks
  // everything read and refreshes it, but "New" should stay visible.
  const [newIds] = useState(() => new Set(notifications.filter((n) => !n.read).map((n) => n.id)));

  if (notifications.length === 0) {
    return <p className="mt-6 text-ink-soft">Nothing yet — you&apos;ll see booking updates here.</p>;
  }

  return (
    <ul className="mt-6 space-y-2">
      <MarkNotificationsRead hasUnread={newIds.size > 0} />
      {notifications.map((n) => (
        <li
          key={n.id}
          className={clsx(
            "rounded-xl border p-4",
            newIds.has(n.id) ? "border-marigold bg-marigold-light" : "border-line bg-surface",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="font-medium text-ink">
              {newIds.has(n.id) && (
                <span className="mr-2 rounded-full bg-marigold px-1.5 py-0.5 text-xs font-semibold text-white">New</span>
              )}
              {n.title}
            </p>
            <span className="shrink-0 text-xs text-ink-faint" suppressHydrationWarning>
              {timeAgo(n.createdAt)}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-soft">{n.message}</p>
        </li>
      ))}
    </ul>
  );
}
