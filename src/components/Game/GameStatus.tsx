import { useTranslation } from 'react-i18next';
import type { GameState } from '@/features/game';
import styles from './GameStatus.module.scss';

interface GameStatusProps {
  status: GameState['status'];
  guesses: GameState['guesses'];
}

export const GameStatus = ({ status, guesses }: GameStatusProps) => {
  const { t } = useTranslation();

  if (status === 'won') {
    return (
      <div className={`${styles.status} ${styles.won}`} role="status">
        <h2>{t('gameStatus.congratulations')}</h2>
        <p>{t('gameStatus.guessedCorrectly', { count: guesses.length })}</p>
      </div>
    );
  }

  if (status === 'lost') {
    return (
      <div className={`${styles.status} ${styles.lost}`} role="status">
        <h2>{t('gameStatus.gameOver')}</h2>
        <p>{t('gameStatus.usedAllGuesses')}</p>
      </div>
    );
  }

  return (
    <div className={styles.status} role="status">
      <p className={styles.guessCount}>
        {t('game.guesses')}: <strong>{guesses.length}</strong>
      </p>
    </div>
  );
};

