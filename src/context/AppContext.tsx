import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { CaseRecord, DailyData, DashboardStats, AsRecord } from '@/types/schema';
import { loadDailyData, saveDailyData, resetDailyData } from '@/lib/importEngine';
import { getFilteredData } from '@/lib/dataFilters';

type Screen = 'dashboard' | 'import' | 'activity' | 'outing' | 'absence' | 'device' | 'as' | 'export';

interface FilteredData {
  activityMissing: CaseRecord[];
  longOuting: CaseRecord[];
  longAbsence: CaseRecord[];
  abnormalDevice: CaseRecord[];
  asRecords: AsRecord[];
}

interface AppState {
  currentScreen: Screen;
  setScreen: (s: Screen) => void;
  dailyData: DailyData;
  setDailyData: React.Dispatch<React.SetStateAction<DailyData>>;
  filtered: FilteredData;
  stats: DashboardStats;
  updateCase: (category: 'activityMissing' | 'longOuting' | 'longAbsence' | 'abnormalDevice', id: string, updates: Partial<CaseRecord>) => void;
  addAsRecord: (record: AsRecord) => void;
  updateAsRecord: (id: string, updates: Partial<AsRecord>) => void;
  deleteAsRecord: (id: string) => void;
  resetData: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentScreen, setScreen] = useState<Screen>('dashboard');
  const [dailyData, setDailyData] = useState<DailyData>(loadDailyData);

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveDailyData(dailyData);
  }, [dailyData]);

  // Filtered data: 6h+ for activity/outing, gateway dedup for devices
  const filtered = useMemo(() => getFilteredData(dailyData), [dailyData]);

  const stats: DashboardStats = {
    totalCases: filtered.activityMissing.length + filtered.longOuting.length + filtered.longAbsence.length + filtered.abnormalDevice.length,
    activityMissing: filtered.activityMissing.length,
    longOuting: filtered.longOuting.length,
    longAbsence: filtered.longAbsence.length,
    abnormalDevice: filtered.abnormalDevice.length,
    asCount: filtered.asRecords.length,
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

  const addAsRecord = useCallback((record: AsRecord) => {
    setDailyData(prev => ({
      ...prev,
      asRecords: [...prev.asRecords, record],
    }));
  }, []);

  const updateAsRecord = useCallback((id: string, updates: Partial<AsRecord>) => {
    setDailyData(prev => ({
      ...prev,
      asRecords: prev.asRecords.map(r => r.id === id ? { ...r, ...updates } : r),
    }));
  }, []);

  const deleteAsRecord = useCallback((id: string) => {
    setDailyData(prev => ({
      ...prev,
      asRecords: prev.asRecords.filter(r => r.id !== id),
    }));
  }, []);

  const resetData = useCallback(() => {
    const empty = resetDailyData();
    setDailyData(empty);
  }, []);

  return (
    <AppContext.Provider value={{
      currentScreen, setScreen, dailyData, setDailyData, filtered, stats,
      updateCase, addAsRecord, updateAsRecord, deleteAsRecord, resetData,
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
