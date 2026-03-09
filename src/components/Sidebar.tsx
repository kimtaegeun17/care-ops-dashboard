import { useAppState } from '@/context/AppContext';
import { 
  LayoutDashboard, Upload, TableProperties, Users, Clock, Wrench, Printer, History
} from 'lucide-react';

const navItems = [
  { id: 'dashboard' as const, label: '대시보드', icon: LayoutDashboard },
  { id: 'import' as const, label: '파일 가져오기', icon: Upload },
  { id: 'unified' as const, label: '일일점검현황', icon: TableProperties },
  { id: 'staff' as const, label: '담당자별 현황', icon: Users },
  { id: 'absence' as const, label: '장기부재 관리', icon: Clock },
  { id: 'device' as const, label: '비정상장비 관리', icon: Wrench },
  { id: 'export' as const, label: '인쇄/내보내기', icon: Printer },
  { id: 'snapshots' as const, label: '스냅샷 이력', icon: History },
];

export default function Sidebar() {
  const { currentScreen, setScreen } = useAppState();

  return (
    <aside className="no-print w-60 min-h-screen bg-sidebar flex flex-col border-r border-sidebar-border">
      <div className="px-5 py-5 border-b border-sidebar-border">
        <h1 className="text-base font-bold text-sidebar-primary-foreground leading-tight">
          일일점검현황
        </h1>
        <p className="text-xs text-sidebar-muted mt-1">디지털돌봄 로컬 오프라인 앱</p>
      </div>
      <nav className="flex-1 py-3">
        {navItems.map(item => {
          const active = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground border-r-2 border-sidebar-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-muted">로컬 오프라인 모드</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span className="text-xs text-sidebar-muted">정상 동작중</span>
        </div>
      </div>
    </aside>
  );
}
