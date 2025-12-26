import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setActiveTab, selectActiveTab, ActiveTab } from '@/features/navigation';
import { SidebarItem } from './SidebarItem';
import styles from './Sidebar.module.scss';

export const Sidebar = () => {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(selectActiveTab);

  const handleTabClick = (tab: ActiveTab) => {
    dispatch(setActiveTab(tab));
  };

  const handleKeyDown = (event: React.KeyboardEvent, tab: ActiveTab) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleTabClick(tab);
    }
  };

  return (
    <nav className={styles.sidebar} aria-label="Main navigation">
      <ul className={styles.navList}>
        <SidebarItem
          tab={ActiveTab.Play}
          icon="🎮"
          label="Fortedle"
          activeTab={activeTab}
          onTabClick={handleTabClick}
          onKeyDown={handleKeyDown}
        />
        <SidebarItem
          tab={ActiveTab.Leaderboard}
          icon="🏆"
          label="Leaderboard"
          activeTab={activeTab}
          onTabClick={handleTabClick}
          onKeyDown={handleKeyDown}
        />
        <SidebarItem
          tab={ActiveTab.Rules}
          icon="📖"
          label="Rules"
          activeTab={activeTab}
          onTabClick={handleTabClick}
          onKeyDown={handleKeyDown}
        />
         <SidebarItem
          tab={ActiveTab.Employees}
          icon="👥"
          label="Employees"
          activeTab={activeTab}
          onTabClick={handleTabClick}
          onKeyDown={handleKeyDown}
        />
        <SidebarItem
          tab={ActiveTab.Sync}
          icon="🔄"
          label="Sync"
          activeTab={activeTab}
          onTabClick={handleTabClick}
          onKeyDown={handleKeyDown}
        />
       
      </ul>
    </nav>
  );
};

