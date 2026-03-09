import { useAppState } from '@/context/AppContext';
import { 
  LayoutDashboard, Upload, Activity, Clock, CalendarOff, Wrench, Settings, Printer
} from 'lucide-react';

const navItems = [
  { id: 'dashboard' as const, label: '대시보드', icon: LayoutDashboard },
  { id: 'import' as const, label: '파일 가져오기', icon: Upload },
  { id: 'activity' as const, label: '활동미감지', icon: Activity, badge: 'activityMissing' as const },
  { id: 'outing' as const, label: '장기외출', icon: Clock, badge: 'longOuting' as const },
  { id: 'absence' as const, label: '장기부재', icon: CalendarOff, badge: 'longAbsence' as const },
  { id: 'device' as const, label: '비정상장비', icon: Wrench, badge: 'abnormalDevice' as const },
  { id: 'as' as const, label: 'A/S 관리', icon: Settings },
  { id: 'export' as const, label: '인쇄/내보내기', icon: Printer },
];

export default function Sidebar() {
  const { currentScreen, setScreen, stats } = useAppState();

  const badgeCounts: Record<string, number> = {
    activityMissing: stats.activityMissing,
    longOuting: stats.longOuting,
    longAbsence: stats.longAbsence,
    abnormalDevice: stats.abnormalDevice,
  };

  return (
    <aside className="no-print w-56 min-h-screen bg-sidebar flex flex-col border-r border-sidebar-border">
      <div className="px-4 py-4 border-b border-sidebar-border">
        <h1 className="text-sm font-bold text-sidebar-primary-foreground leading-tight">
          일일점검현황
        </h1>
        <p className="text-[10px] text-sidebar-muted mt-0.5">로컬 오프라인 앱</p>
      </div>
      <nav className="flex-1 py-2">
        {navItems.map(item => {
          const active = currentScreen === item.id;
          const count = item.badge ? badgeCounts[item.badge] : 0;
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground border-r-2 border-sidebar-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  item.id === 'activity' ? 'bg-danger text-danger-foreground' : 'bg-sidebar-accent text-sidebar-muted'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="px-4 py-3 border-t border-sidebar-border">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span className="text-[10px] text-sidebar-muted">오프라인 모드</span>
        </div>
      </div>
    </aside>
  );
}
