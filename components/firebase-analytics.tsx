"use client";

import { useEffect } from "react";
import { getAnalytics, isSupported } from "firebase/analytics";

import { getFirebaseApp, hasFirebaseAnalyticsConfig } from "@/lib/firebase";

export function FirebaseAnalytics() {
  useEffect(() => {
    if (!hasFirebaseAnalyticsConfig()) {
      return;
    }

    let isActive = true;

    void isSupported()
      .then((supported) => {
        if (!supported || !isActive) {
          return;
        }

        const app = getFirebaseApp();

        if (app) {
          getAnalytics(app);
        }
      })
      .catch((error: unknown) => {
        if (process.env.NODE_ENV === "development") {
          console.warn("Firebase Analytics could not be initialized.", error);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return null;
}
