"use client";

import { useState, useEffect } from "react";
import { CRMUser } from "../types";
import { getMe } from "../lib/auth";

export function useAuth() {
  const [user, setUser] = useState<CRMUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  return { user, loading, setUser };
}