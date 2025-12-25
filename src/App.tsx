import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { selectActiveTab, ActiveTab } from './features/navigation';
import { checkToken, selectIsAuthenticated } from './features/auth';
import Sidebar from './components/Sidebar/Sidebar';
import Login from './components/Auth/Login';
import Play from './components/Pages/Play';
import Leaderboard from './components/Pages/Leaderboard';
import Rules from './components/Pages/Rules';
import DataSourceToggle from './components/Settings/DataSourceToggle';
import styles from './App.module.scss';

const App = () => {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(selectActiveTab);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    // Check for token on mount
    dispatch(checkToken());
  }, [dispatch]);

  const renderPage = () => {
    switch (activeTab) {
      case ActiveTab.Play:
        return <Play />;
      case ActiveTab.Leaderboard:
        return <Leaderboard />;
      case ActiveTab.Rules:
        return <Rules />;
      default:
        return <Play />;
    }
  };

  return (
    <div className={styles.app}>
      <Login />
      {isAuthenticated && (
        <>
          <Sidebar />
          <div className={styles.settings}>
            <DataSourceToggle />
          </div>
          {renderPage()}
        </>
      )}
    </div>
  );
};

export default App;

