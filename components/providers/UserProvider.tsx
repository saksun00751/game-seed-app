"use client";

import { createContext, useContext } from "react";
import type { AuthUser } from "@/lib/session/auth";

const UserContext = createContext<AuthUser | null>(null);

export function useUser(): AuthUser | null {
  return useContext(UserContext);
}

export default function UserProvider({
  user,
  children,
}: {
  user: AuthUser;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
