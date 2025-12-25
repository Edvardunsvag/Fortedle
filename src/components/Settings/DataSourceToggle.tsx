import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setDataSource, selectDataSource } from '@/features/employees';
import { selectAccessToken } from '@/features/auth';
import type { DataSource } from '@/features/employees/types';
import styles from './DataSourceToggle.module.scss';

const DataSourceToggle = () => {
  const dispatch = useAppDispatch();
  const dataSource = useAppSelector(selectDataSource);
  const accessToken = useAppSelector(selectAccessToken);

  const handleToggle = (newSource: DataSource) => {
    dispatch(setDataSource(newSource));
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>Data Source:</label>
      <div className={styles.toggleGroup}>
        <button
          className={`${styles.toggleButton} ${dataSource === 'mock' ? styles.active : ''}`}
          onClick={() => handleToggle('mock')}
          type="button"
          aria-pressed={dataSource === 'mock'}
        >
          Mock Data
        </button>
        <button
          className={`${styles.toggleButton} ${dataSource === 'api' ? styles.active : ''} ${!accessToken ? styles.disabled : ''}`}
          onClick={() => handleToggle('api')}
          type="button"
          disabled={!accessToken}
          aria-pressed={dataSource === 'api'}
          title={!accessToken ? 'Please login first to use API data' : ''}
        >
          API Data
        </button>
      </div>
    </div>
  );
};

export default DataSourceToggle;

