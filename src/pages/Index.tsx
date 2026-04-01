import { AppProvider } from '@/context/AppContext';
import AppShell from '@/components/AppShell';

const Index = () => (
  <AppProvider>
    <AppShell />
  </AppProvider>
);

export default Index;

