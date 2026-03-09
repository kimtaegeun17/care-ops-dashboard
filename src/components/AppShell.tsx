import { useAppState } from '@/context/AppContext';
import Sidebar from './Sidebar';
import DashboardScreen from '@/screens/DashboardScreen';
import ImportScreen from '@/screens/ImportScreen';
import UnifiedTableScreen from '@/screens/UnifiedTableScreen';
import StaffScreen from '@/screens/StaffScreen';
import AbsenceScreen from '@/screens/AbsenceScreen';
import DeviceScreen from '@/screens/DeviceScreen';
import ExportScreen from '@/screens/ExportScreen';
import SnapshotScreen from '@/screens/SnapshotScreen';

const screenMap = {
  dashboard: DashboardScreen,
  import: ImportScreen,
  unified: UnifiedTableScreen,
  staff: StaffScreen,
  absence: AbsenceScreen,
  device: DeviceScreen,
  export: ExportScreen,
  snapshots: SnapshotScreen,
};

export default function AppShell() {
  const { currentScreen } = useAppState();
  const Screen = screenMap[currentScreen];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Screen />
      </main>
    </div>
  );
}
