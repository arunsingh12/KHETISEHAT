"use client";

import { useEffect } from "react";

import { markNotificationsRead } from "@/actions/notifications";

/**
 * Marks the viewer's notifications read once the page has rendered — done
 * from the client (not during the server render) so the unread badge in the
 * dashboard menu refreshes via the action's revalidation.
 */
export function MarkNotificationsRead({ hasUnread }: { hasUnread: boolean }) {
  useEffect(() => {
    if (hasUnread) void markNotificationsRead();
  }, [hasUnread]);
  return null;
}
