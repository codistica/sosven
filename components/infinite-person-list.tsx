"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { PersonCard } from "./person-card";
import { loadMorePersons } from "@/lib/actions";
import type { Person, PersonCursor, PersonStatus } from "@/lib/db/schema";
import type { Filter } from "@/lib/format";

/**
 * Renders the directory grid and lazily appends pages as the sentinel scrolls
 * into view (keyset pagination via the `loadMorePersons` server action). The
 * parent remounts this with a `key` when the query/filter/status changes, so
 * local state always starts from a fresh first page.
 */
export function InfinitePersonList({
  initialItems,
  initialCursor,
  query,
  filter,
  status,
  emptyState,
}: {
  initialItems: Person[];
  initialCursor: PersonCursor | null;
  query: string;
  filter: Filter;
  status?: PersonStatus | PersonStatus[];
  emptyState: ReactNode;
}) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const sentinel = useRef<HTMLDivElement | null>(null);
  const lock = useRef(false);

  const loadMore = useCallback(async () => {
    if (lock.current || !cursor) return;
    lock.current = true;
    setLoading(true);
    try {
      const res = await loadMorePersons({ query, filter, status, cursor });
      setItems((prev) => [...prev, ...res.items]);
      setCursor(res.nextCursor);
    } finally {
      setLoading(false);
      lock.current = false;
    }
  }, [cursor, query, filter, status]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !cursor) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [cursor, loadMore]);

  if (items.length === 0) return <>{emptyState}</>;

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {items.map((person) => (
          <PersonCard key={person._id} person={person} />
        ))}
      </div>
      {cursor && <div ref={sentinel} aria-hidden className="h-12" />}
      {loading && (
        <p className="mt-6 text-center text-sm text-muted">Cargando más personas…</p>
      )}
    </div>
  );
}
