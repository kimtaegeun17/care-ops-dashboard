import { AppProvider } from '@/context/AppContext';
import AppShell from '@/components/AppShell';

const Index = () => {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
};

export default Index;
