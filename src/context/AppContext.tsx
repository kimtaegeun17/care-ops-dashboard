import React, { createContext, useContext, useState, useCallback } from 'react';
import { CaseRecord, Snapshot, DashboardStats, StaffSummary } from '@/types/schema';
import { mockCases, mockDashboardStats, mockStaffSummary, mockSnapshot, mockSnapshots } from '@/data/mockData';

type Screen = 'dashboard' | 'import' | 'unified' | 'staff' | 'absence' | 'device' | 'export' | 'snapshots';

interface AppState {
  currentScreen: Screen;
  setScreen: (s: Screen) => void;
  cases: CaseRecord[];
  setCases: React.Dispatch<React.SetStateAction<CaseRecord[]>>;
  stats: DashboardStats;
  staffSummary: StaffSummary[];
  snapshots: Snapshot[];
  currentSnapshot: Snapshot | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (f: string) => void;
  updateCase: (id: string, updates: Partial<CaseRecord>) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentScreen, setScreen] = useState<Screen>('dashboard');
  const [cases, setCases] = useState<CaseRecord[]>(mockCases);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const stats: DashboardStats = {
    totalCases: cases.length,
    activityMissing: cases.filter(c => c.statuses.includes('활동미감지')).length,
    longOuting: cases.filter(c => c.statuses.includes('장기외출')).length,
    longAbsence: cases.filter(c => c.statuses.includes('장기부재')).length,
    abnormalDevice: cases.filter(c => c.statuses.includes('비정상장비')).length,
    criticalCount: cases.filter(c => c.priority === 'critical').length,
    highCount: cases.filter(c => c.priority === 'high').length,
    resolvedToday: cases.filter(c => c.result === '확인완료' || c.result === '조치완료').length,
    pendingAction: cases.filter(c => !c.result).length,
  };

  const staffSummary: StaffSummary[] = Array.from(new Set(cases.map(c => c.person.staff))).filter(Boolean).map(name => {
    const sc = cases.filter(c => c.person.staff === name);
    return {
      staff: name,
      region: sc[0]?.person.region || '',
      totalCases: sc.length,
      criticalCases: sc.filter(c => c.priority === 'critical' || c.priority === 'high').length,
      completedCases: sc.filter(c => c.result === '확인완료' || c.result === '조치완료').length,
      pendingCases: sc.filter(c => !c.result).length,
    };
  });

  const updateCase = useCallback((id: string, updates: Partial<CaseRecord>) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  return (
    <AppContext.Provider value={{
      currentScreen, setScreen, cases, setCases, stats, staffSummary,
      snapshots: mockSnapshots, currentSnapshot: mockSnapshot,
      searchQuery, setSearchQuery, statusFilter, setStatusFilter, updateCase,
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
