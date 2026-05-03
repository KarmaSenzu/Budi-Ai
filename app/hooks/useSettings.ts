"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, DEFAULT_SETTINGS } from "@/lib/types";
import { getSettings, saveSettings } from "@/lib/storage";

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = getSettings();
    setSettingsState(saved);
    setIsLoaded(true);
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

  const isConfigured = Boolean(settings.apiKey && settings.baseUrl && settings.model);

  return { settings, updateSettings, resetSettings, isConfigured, isLoaded };
}
