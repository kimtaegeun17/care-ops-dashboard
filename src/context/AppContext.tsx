import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { CaseRecord, DailyData, DashboardStats } from '@/types/schema';
import { loadDailyData, saveDailyData, resetDailyData } from '@/lib/importEngine';
import { getFilteredData } from '@/lib/dataFilters';

type Screen = 'dashboard' | 'import' | 'activity' | 'outing' | 'absence' | 'device' | 'export';

interface FilteredData {
  activityMissing: CaseRecord[];
  longOuting: CaseRecord[];
  longAbsence: CaseRecord[];
  abnormalDevice: CaseRecord[];
}

interface AppState {
  currentScreen: Screen;
  setScreen: (s: Screen) => void;
  dailyData: DailyData;
  setDailyData: React.Dispatch<React.SetStateAction<DailyData>>;
  filtered: FilteredData;
  stats: DashboardStats;
  updateCase: (category: 'activityMissing' | 'longOuting' | 'longAbsence' | 'abnormalDevice', id: string, updates: Partial<CaseRecord>) => void;
  resetData: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentScreen, setScreen] = useState<Screen>('dashboard');
  const [dailyData, setDailyData] = useState<DailyData>(loadDailyData);

  useEffect(() => {
    saveDailyData(dailyData);
  }, [dailyData]);

  const filtered = useMemo(() => getFilteredData(dailyData), [dailyData]);

  const stats: DashboardStats = {
    totalCases: filtered.activityMissing.length + filtered.longOuting.length + filtered.longAbsence.length + filtered.abnormalDevice.length,
    activityMissing: filtered.activityMissing.length,
    longOuting: filtered.longOuting.length,
    longAbsence: filtered.longAbsence.length,
    abnormalDevice: filtered.abnormalDevice.length,
  };

  const updateCase = useCallback((
    category: 'activityMissing' | 'longOuting' | 'longAbsence' | 'abnormalDevice',
    id: string,
    updates: Partial<CaseRecord>
  ) => {
    setDailyData(prev => ({
      ...prev,
      [category]: prev[category].map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  }, []);

  const resetData = useCallback(() => {
    const empty = resetDailyData();
    setDailyData(empty);
  }, []);

  return (
    <AppContext.Provider value={{
      currentScreen, setScreen, dailyData, setDailyData, filtered, stats,
      updateCase, resetData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be inside AppProvider');
  return ctx;
}
