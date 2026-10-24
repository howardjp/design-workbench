import { useEffect, useReducer, useRef, useState } from "react";
import { initialState, reducer, dirty, matches, type Move } from "./model";
export function useNotebook() {
  const [s, dispatch] = useReducer(reducer, undefined, initialState);
  const [failNext, setFailNext] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const error = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const focusAfter = useRef(false);
  const selected = s.notes.find((n) => n.id === s.selected);
  function request(move: Move) {
    focusAfter.current = !dirty(s);
    dispatch({ type: "request", move });
  }
  function edit() {
    focusAfter.current = true;
    dispatch({ type: "edit" });
  }
  function discard() {
    focusAfter.current = true;
    dispatch({ type: "discard" });
  }
  function undo() {
    focusAfter.current = true;
    dispatch({ type: "undo" });
  }
  function save() {
    if (s.draft && !s.draft.title.trim()) error.current?.focus();
    dispatch({ type: "save" });
  }
  useEffect(() => {
    if (s.phase !== "saving") return;
    const timer = setTimeout(() => {
      focusAfter.current = true;
      dispatch({ type: failNext ? "failed" : "saved" });
      setFailNext(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [s.phase, failNext]);
  useEffect(() => {
    if (s.error) error.current?.focus();
    else if (focusAfter.current && !s.pending) {
      heading.current?.focus();
      focusAfter.current = false;
    }
  }, [s.selected, s.draft === null, s.pending, s.error, s.message]);
  useEffect(() => {
    if (!dirty(s)) return;
    const protect = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [s]);
  return {
    s,
    dispatch,
    selected,
    request,
    edit,
    discard,
    undo,
    save,
    heading,
    error,
    search,
    dirty: dirty(s),
    results: matches(s),
    failNext,
    setFailNext,
  };
}
export type Notebook = ReturnType<typeof useNotebook>;
