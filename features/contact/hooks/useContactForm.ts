"use client";

import { useReducer } from "react";
import {
  contactReducer,
  initialContactState,
} from "@/workflows/contactForm";

export function useContactForm() {
  const [state, dispatch] = useReducer(contactReducer, initialContactState);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    dispatch({ type: "submit" });
    // Demo: no backend. Simulate a round-trip.
    await new Promise((r) => setTimeout(r, 700));
    dispatch({ type: "resolve" });
  }

  return { status: state.status, submit, reset: () => dispatch({ type: "reset" }) };
}
