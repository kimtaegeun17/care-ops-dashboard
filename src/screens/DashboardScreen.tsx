import { useAppState } from '@/context/AppContext';
import { Activity, Clock, CalendarOff, Wrench, RefreshCw } from 'lucide-react';

function StatCard({ label, value, icon: Icon, color, onClick }: { label: string; value: number; icon: any; color: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`bg-card rounded-lg border border-border p-4 flex items-center gap-4 text-left hover:bg-muted/50 transition-colors ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </button>
  );
}

export default function DashboardScreen() {
  const { stats, setScreen, dailyData, filtered, resetData } = useAppState();
  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayStr = dayNames[today.getDay()];

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">일일점검대상자 {dateStr}({dayStr})</h2>
          <p className="text-sm text-muted-foreground">
            마지막 업데이트: {dailyData.lastUpdated ? new Date(dailyData.lastUpdated).toLocaleTimeString('ko-KR') : '-'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetData}
            className="flex items-center gap-1.5 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:opacity-90"
          >
            <RefreshCw className="w-4 h-4" /> 초기화
          </button>
          <button
            onClick={() => setScreen('import')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
          >
            파일 가져오기
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="활동미감지 6시간↑" value={stats.activityMissing} icon={Activity} color="bg-danger/10 text-danger" onClick={() => setScreen('activity')} />
        <StatCard label="장기외출" value={stats.longOuting} icon={Clock} color="bg-warning/10 text-warning" onClick={() => setScreen('outing')} />
        <StatCard label="장기부재" value={stats.longAbsence} icon={CalendarOff} color="bg-status-long-absence/10 text-status-long-absence" onClick={() => setScreen('absence')} />
        <StatCard label="비정상장비" value={stats.abnormalDevice} icon={Wrench} color="bg-info/10 text-info" onClick={() => setScreen('device')} />
      </div>

      {/* Quick preview tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 활동미감지 */}
        <div className="bg-card rounded-lg border border-border">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-danger/5">
            <h3 className="text-sm font-bold text-foreground">🚨 활동미감지 6시간 이상</h3>
            <button onClick={() => setScreen('activity')} className="text-xs text-primary hover:underline">전체보기 →</button>
          </div>
          <div className="max-h-64 overflow-auto">
            {filtered.activityMissing.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">데이터 없음</p>
            ) : (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border">
                  {filtered.activityMissing.slice(0, 5).map((c, i) => (
                    <tr key={c.id} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/30'}>
                      <td className="px-3 py-2 text-xs">{i + 1}</td>
                      <td className="px-3 py-2 text-xs font-semibold">{c.person.name}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{c.person.phone}</td>
                      <td className="px-3 py-2 text-xs font-medium text-danger">{c.elapsedTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* 비정상장비 */}
        <div className="bg-card rounded-lg border border-border">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-info/5">
            <h3 className="text-sm font-bold text-foreground">🔧 비정상장비</h3>
            <button onClick={() => setScreen('device')} className="text-xs text-primary hover:underline">전체보기 →</button>
          </div>
          <div className="max-h-64 overflow-auto">
            {filtered.abnormalDevice.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">데이터 없음</p>
            ) : (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border">
                  {filtered.abnormalDevice.slice(0, 5).map((c, i) => (
                    <tr key={c.id} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/30'}>
                      <td className="px-3 py-2 text-xs">{i + 1}</td>
                      <td className="px-3 py-2 text-xs">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-info/15 text-info">{c.deviceTag}</span>
                      </td>
                      <td className="px-3 py-2 text-xs font-semibold">{c.person.name}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{c.person.gwNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
