import { describe, it, expect } from "vitest";
import { contactReducer, initialContactState } from "./contactForm";

describe("contactReducer", () => {
  it("starts idle", () => {
    expect(initialContactState.status).toBe("idle");
  });

  it("submit -> submitting -> success", () => {
    let s = contactReducer(initialContactState, { type: "submit" });
    expect(s.status).toBe("submitting");
    s = contactReducer(s, { type: "resolve" });
    expect(s.status).toBe("success");
  });

  it("submit -> reject sets error", () => {
    let s = contactReducer(initialContactState, { type: "submit" });
    s = contactReducer(s, { type: "reject" });
    expect(s.status).toBe("error");
  });

  it("reset returns to idle", () => {
    let s = contactReducer(initialContactState, { type: "submit" });
    s = contactReducer(s, { type: "reset" });
    expect(s.status).toBe("idle");
  });
});
