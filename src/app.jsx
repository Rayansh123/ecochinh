import useStore from './store/useStore';
import LandingPage from './components/LandingPage';
import OperatorDashboard from './components/OperatorDashboard';
import CorporateDashboard from './components/CorporateDashboard';
import AuditorDashboard from './components/AuditorDashboard';

function App() {
  const currentUser = useStore((state) => state.currentUser);

  const renderDashboard = () => {
    switch (currentUser) {
      case 'operator':
        return <OperatorDashboard />;
      case 'corporate':
        return <CorporateDashboard />;
      case 'auditor':
        return <AuditorDashboard />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-charcoal">
      {renderDashboard()}
    </div>
  );
}

export default App;