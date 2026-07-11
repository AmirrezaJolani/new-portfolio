export type ContactStatus = "idle" | "submitting" | "success" | "error";

export interface ContactState {
  status: ContactStatus;
}

export const initialContactState: ContactState = { status: "idle" };

export type ContactAction =
  | { type: "submit" }
  | { type: "resolve" }
  | { type: "reject" }
  | { type: "reset" };

export function contactReducer(
  state: ContactState,
  action: ContactAction,
): ContactState {
  switch (action.type) {
    case "submit":
      return { status: "submitting" };
    case "resolve":
      return { status: "success" };
    case "reject":
      return { status: "error" };
    case "reset":
      return { status: "idle" };
    default:
      return state;
  }
}
