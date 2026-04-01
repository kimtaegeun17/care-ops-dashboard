/* eslint-disable */
import { useAppState } from '@/context/AppContext';
import Sidebar from './Sidebar';
import DashboardScreen from '@/screens/DashboardScreen';
import ImportScreen from '@/screens/ImportScreen';
import ActivityScreen from '@/screens/ActivityScreen';
import OutingScreen from '@/screens/OutingScreen';
import AbsenceScreen from '@/screens/AbsenceScreen';
import DeviceScreen from '@/screens/DeviceScreen';
import ExportScreen from '@/screens/ExportScreen';

const screenMap = {
  dashboard: DashboardScreen,
  import: ImportScreen,
  activity: ActivityScreen,
  outing: OutingScreen,
  absence: AbsenceScreen,
  device: DeviceScreen,
  export: ExportScreen,
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
