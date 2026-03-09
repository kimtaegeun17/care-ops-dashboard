import { useAppState } from '@/context/AppContext';
import { PriorityBadge, StatusBadge, NewBadge } from '@/components/Badges';
import { AlertTriangle, Activity, Clock, Wrench, CheckCircle, TrendingUp } from 'lucide-react';

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  return (
    <div className="bg-card rounded-lg border border-border p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardScreen() {
  const { stats, cases, setScreen, setStatusFilter, currentSnapshot } = useAppState();

  const criticalCases = cases.filter(c => c.priority === 'critical' || c.priority === 'high').slice(0, 5);
  const newCases = cases.filter(c => c.isNew).slice(0, 5);

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">대시보드</h2>
          <p className="text-sm text-muted-foreground">
            {currentSnapshot?.date} {currentSnapshot?.time} ({currentSnapshot?.period}) 기준
          </p>
        </div>
        <button onClick={() => setScreen('import')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition">
          파일 가져오기
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="전체 대상자" value={stats.totalCases} icon={Activity} color="bg-primary/10 text-primary" />
        <StatCard label="활동미감지" value={stats.activityMissing} icon={AlertTriangle} color="bg-danger/10 text-danger" />
        <StatCard label="비정상장비" value={stats.abnormalDevice} icon={Wrench} color="bg-info/10 text-info" />
        <StatCard label="긴급/높음" value={stats.criticalCount + stats.highCount} icon={TrendingUp} color="bg-warning/10 text-warning" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="장기외출" value={stats.longOuting} icon={Clock} color="bg-warning/10 text-warning" />
        <StatCard label="장기부재" value={stats.longAbsence} icon={Clock} color="bg-status-long-absence/10 text-status-long-absence" />
        <StatCard label="조치완료" value={stats.resolvedToday} icon={CheckCircle} color="bg-success/10 text-success" />
        <StatCard label="미조치" value={stats.pendingAction} icon={AlertTriangle} color="bg-muted text-muted-foreground" />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Cases */}
        <div className="bg-card rounded-lg border border-border">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">⚠️ 긴급/높음 우선순위</h3>
            <button onClick={() => { setStatusFilter('all'); setScreen('unified'); }} className="text-xs text-primary hover:underline">
              전체보기 →
            </button>
          </div>
          <div className="divide-y divide-border">
            {criticalCases.map(c => (
              <div key={c.id} className="px-4 py-3 flex items-center gap-3">
                <PriorityBadge level={c.priority} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{c.person.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.detailText}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{c.elapsedTime}</span>
              </div>
            ))}
          </div>
        </div>

        {/* New Cases */}
        <div className="bg-card rounded-lg border border-border">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">🆕 신규 감지 대상</h3>
            <button onClick={() => setScreen('unified')} className="text-xs text-primary hover:underline">
              전체보기 →
            </button>
          </div>
          <div className="divide-y divide-border">
            {newCases.map(c => (
              <div key={c.id} className="px-4 py-3 flex items-center gap-3">
                <NewBadge />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{c.person.name}</p>
                  <div className="flex gap-1 mt-0.5">
                    {c.statuses.map(s => <StatusBadge key={s} status={s} />)}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{c.person.region}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
