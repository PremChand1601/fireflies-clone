"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import type { MeetingListParams, MeetingSort } from "@/types";

const SORTS: MeetingSort[] = ["newest", "oldest", "title", "duration"];

function parseSort(value: string | null): MeetingSort {
  if (value && SORTS.includes(value as MeetingSort)) {
    return value as MeetingSort;
  }
  return "newest";
}

export function useMeetingsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const q = searchParams.get("q") ?? "";
  const sort = parseSort(searchParams.get("sort"));
  const participant = searchParams.get("participant") ?? "";
  const dateFrom = searchParams.get("date_from") ?? "";
  const dateTo = searchParams.get("date_to") ?? "";
  const dateMode: "all" | "range" = dateFrom || dateTo ? "range" : "all";

  const [searchInput, setSearchInput] = useState(q);

  function updateParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParamsRef.current.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    }
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = searchInput.trim();
      const currentQ = searchParamsRef.current.get("q") ?? "";
      if (next === currentQ) return;
      updateParams({ q: next || null });
    }, 300);
    return () => window.clearTimeout(handle);
    // updateParams is stable enough via refs; debounce only on typed input
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const apiParams: MeetingListParams = useMemo(
    () => ({
      q: q || undefined,
      sort,
      participant: participant || undefined,
      date_from: dateFrom ? `${dateFrom}T00:00:00` : undefined,
      date_to: dateTo ? `${dateTo}T23:59:59` : undefined,
      skip: 0,
      limit: 50,
    }),
    [q, sort, participant, dateFrom, dateTo],
  );

  return {
    q,
    sort,
    participant,
    dateFrom,
    dateTo,
    searchInput,
    setSearchInput,
    dateMode,
    setSort: (value: MeetingSort) => updateParams({ sort: value === "newest" ? null : value }),
    setParticipant: (value: string) => updateParams({ participant: value || null }),
    setDateFrom: (value: string) => updateParams({ date_from: value || null }),
    setDateTo: (value: string) => updateParams({ date_to: value || null }),
    setDateMode: (mode: "all" | "range") => {
      if (mode === "all") {
        updateParams({ date_from: null, date_to: null });
      }
    },
    apiParams,
  };
}
