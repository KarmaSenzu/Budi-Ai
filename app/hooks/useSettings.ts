"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, DEFAULT_SETTINGS } from "@/lib/types";
import { getSettings, saveSettings } from "@/lib/storage";

export interface ServerConfig {
  aiConfigured: boolean;
  usageConfigured: boolean;
  aiBaseUrlHint: string | null;
}

const DEFAULT_SERVER_CONFIG: ServerConfig = {
  aiConfigured: false,
  usageConfigured: false,
  aiBaseUrlHint: null,
};

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [serverConfig, setServerConfig] = useState<ServerConfig>(DEFAULT_SERVER_CONFIG);
  const [serverConfigLoaded, setServerConfigLoaded] = useState(false);

  useEffect(() => {
    const saved = getSettings();
    setSettingsState(saved);
    setIsLoaded(true);
  }, []);

  // Fetch server-managed config flag once on mount. The endpoint never
  // returns secrets — only booleans + an optional public baseUrl hint.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/config")
      .then((r) => r.json())
      .then((cfg) => {
        if (cancelled || !cfg || typeof cfg !== "object") return;
        setServerConfig({
          aiConfigured: Boolean(cfg.aiConfigured),
          usageConfigured: Boolean(cfg.usageConfigured),
          aiBaseUrlHint: typeof cfg.aiBaseUrlHint === "string" ? cfg.aiBaseUrlHint : null,
        });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setServerConfigLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettingsState((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettingsState(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
  }, []);

  // App is "configured" if EITHER:
  //  - Server-managed mode is active (apiKey + baseUrl baked into the server), OR
  //  - User supplied apiKey + baseUrl via the legacy login flow.
  // A model selection is still required in both modes.
  const userConfigured = Boolean(settings.apiKey && settings.baseUrl && settings.model);
  const serverManagedConfigured = serverConfig.aiConfigured && Boolean(settings.model);
  const isConfigured = userConfigured || serverManagedConfigured;

  return {
    settings,
    updateSettings,
    resetSettings,
    isConfigured,
    isLoaded: isLoaded && serverConfigLoaded,
    serverConfig,
  };
}
