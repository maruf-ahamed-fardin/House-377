"use client";

import { useEffect } from "react";

function canRegisterServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return false;
  }

  return window.location.protocol === "https:" || window.location.hostname === "localhost";
}

export function PwaRegister() {
  useEffect(() => {
    if (!canRegisterServiceWorker()) {
      return;
    }

    const activateWaitingWorker = (registration: ServiceWorkerRegistration) => {
      registration.waiting?.postMessage({ type: "SKIP_WAITING" });
    };

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .then((registration) => {
          activateWaitingWorker(registration);
          void registration.update();

          registration.addEventListener("updatefound", () => {
            const installingWorker = registration.installing;

            installingWorker?.addEventListener("statechange", () => {
              if (installingWorker.state === "installed") {
                activateWaitingWorker(registration);
              }
            });
          });
        })
        .catch(() => {
          // PWA support should not block the application shell.
        });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register, { once: true });

    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
