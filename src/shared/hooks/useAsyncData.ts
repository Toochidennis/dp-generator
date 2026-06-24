import { useCallback, useEffect, useState } from "react";
import type { AsyncStatus } from "@/shared/types/domain";

type State<T> = { data?: T; status: AsyncStatus; error?: string };

// Runs an aborter-aware async fetcher and exposes loading/success/error state.
export function useAsyncData<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: unknown[] = [],
) {
  const [state, setState] = useState<State<T>>({ status: "loading" });
  const [nonce, setNonce] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fetcher, deps);

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ data: prev.data, status: "loading" }));
    run(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ data, status: "success" });
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setState({ status: "error", error: cause instanceof Error ? cause.message : "Something went wrong." });
      });
    return () => controller.abort();
  }, [run, nonce]);

  const reload = useCallback(() => setNonce((value) => value + 1), []);
  const setData = useCallback((updater: (current?: T) => T) => {
    setState((prev) => ({ status: "success", data: updater(prev.data) }));
  }, []);

  return { ...state, reload, setData };
}
