"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode, RefObject } from "react";

/** DOM-only UI state shared by the room chrome (never read by the 3D side). */
export interface RoomUi {
  /** The element that opened the current panel; focus returns to it on close. */
  openerRef: RefObject<HTMLElement | null>;
}

const RoomUiContext = createContext<RoomUi | null>(null);

export function RoomUiProvider({ children }: { children: ReactNode }) {
  const [value] = useState<RoomUi>(() => ({ openerRef: { current: null } }));
  return <RoomUiContext.Provider value={value}>{children}</RoomUiContext.Provider>;
}

export function useRoomUi(): RoomUi {
  const ui = useContext(RoomUiContext);
  if (!ui) throw new Error("useRoomUi must be used inside <RoomUiProvider>");
  return ui;
}
