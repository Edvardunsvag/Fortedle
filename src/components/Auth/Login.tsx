import { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { checkToken, selectIsAuthenticated, setToken } from '@/features/auth';
import styles from './Login.module.scss';

const Login = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [tokenInput, setTokenInput] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWaitingForToken, setIsWaitingForToken] = useState(false);
  const [showBookmarkletCode, setShowBookmarkletCode] = useState(false);
  const popupRef = useRef<Window | null>(null);
  const checkIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Check for token in localStorage on mount
    dispatch(checkToken());
    
    // Check URL for token parameter (in case redirected back with token)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      dispatch(setToken(tokenFromUrl));
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Listen for postMessage from popup or bookmarklet
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from Huma domain for security
      if (event.origin !== 'https://fortedigital.humahr.com' && event.origin !== window.location.origin) {
        return;
      }

      if (event.data && event.data.type === 'HUMA_TOKEN' && event.data.token) {
        dispatch(setToken(event.data.token));
        setIsWaitingForToken(false);
        if (popupRef.current) {
          popupRef.current.close();
          popupRef.current = null;
        }
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    };
  }, [dispatch]);

  const handleLogin = () => {
    // Open Huma login in a popup window
    const popup = window.open(
      'https://fortedigital.humahr.com/',
      'humaLogin',
      'width=800,height=600,scrollbars=yes,resizable=yes'
    );
    
    if (!popup) {
      setError('Popup blocked. Please allow popups for this site and try again.');
      return;
    }

    popupRef.current = popup;
    setIsWaitingForToken(true);
    setError(null);

    // Try to inject a script into the popup to read the token
    // This will only work if same-origin or if CORS allows it
    const tryInjectScript = () => {
      try {
        // Try to access popup's localStorage (will fail due to CORS, but worth trying)
        if (popup && !popup.closed) {
          // We can't directly access, but we can try to postMessage to the popup
          // asking it to send us the token
          popup.postMessage({ type: 'REQUEST_TOKEN', source: 'fortel' }, 'https://fortedigital.humahr.com');
        }
      } catch (err) {
        // Expected to fail due to CORS
        console.log('Direct access not possible, waiting for bookmarklet or manual entry');
      }
    };

    // Wait a bit for the page to load, then try
    setTimeout(tryInjectScript, 2000);

    // Poll to check if popup is closed (user might have logged in and closed it)
    checkIntervalRef.current = setInterval(() => {
      if (popup.closed) {
        setIsWaitingForToken(false);
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
        // Show manual entry option
        setShowTokenInput(true);
      }
    }, 1000);
  };

  const getBookmarkletCode = () => {
    const currentOrigin = window.location.origin;
    const bookmarklet = `javascript:(function(){try{const token=localStorage.getItem('huma:accessToken');if(token){const parsed=JSON.parse(token);const tokenValue=Array.isArray(parsed)?parsed[0]:parsed;window.postMessage({type:'HUMA_TOKEN',token:tokenValue},'${currentOrigin}');alert('Token sent to Fortel!');}else{alert('No token found. Please login first.');}}catch(e){alert('Error: '+e.message);}})();`;
    return bookmarklet;
  };

  const copyBookmarklet = async () => {
    const bookmarklet = getBookmarkletCode();
    try {
      await navigator.clipboard.writeText(bookmarklet);
      alert('Bookmarklet copied! Create a bookmark and paste this code as the URL, then click it on the Huma page.');
    } catch (err) {
      // Fallback: show in a textarea
      const textarea = document.createElement('textarea');
      textarea.value = bookmarklet;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('Bookmarklet copied!');
    }
  };

  const handleOpenHuma = () => {
    // Open Huma in a new tab (not popup) for easier use
    window.open('https://fortedigital.humahr.com/', '_blank');
    setShowTokenInput(true);
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tokenInput.trim()) {
      setError('Please enter a token');
      return;
    }

    try {
      dispatch(setToken(tokenInput.trim()));
      setTokenInput('');
      setShowTokenInput(false);
    } catch (err) {
      setError('Failed to save token. Please try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTokenSubmit(e);
    }
  };

  if (isAuthenticated) {
    return null; // Don't show login if already authenticated
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Login Required</h1>
        <p className={styles.description}>
          Please login to Huma to access employee data.
        </p>
        
        {isWaitingForToken ? (
          <div className={styles.waitingContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.waitingText}>Waiting for token...</p>
            <p className={styles.waitingHint}>
              After logging in on the Huma page, use the bookmarklet below to automatically send your token.
            </p>
            <div className={styles.bookmarkletSection}>
              <p className={styles.bookmarkletLabel}>Quick Setup:</p>
              <button
                className={styles.bookmarkletButton}
                onClick={copyBookmarklet}
                type="button"
              >
                Copy Bookmarklet
              </button>
              <p className={styles.bookmarkletInstructions}>
                1. Click "Copy Bookmarklet" above
                <br />
                2. Create a new bookmark in your browser
                <br />
                3. Paste the copied code as the bookmark URL
                <br />
                4. After logging into Huma, click the bookmark
                <br />
                5. The token will be sent automatically!
              </p>
            </div>
            <button
              className={styles.cancelButton}
              onClick={() => {
                setIsWaitingForToken(false);
                if (popupRef.current && !popupRef.current.closed) {
                  popupRef.current.close();
                }
                if (checkIntervalRef.current) {
                  clearInterval(checkIntervalRef.current);
                  checkIntervalRef.current = null;
                }
                setShowTokenInput(true);
              }}
              type="button"
            >
              Enter Token Manually Instead
            </button>
          </div>
        ) : !showTokenInput ? (
          <>
            <div className={styles.methodSection}>
              <h2 className={styles.methodTitle}>Method 1: Automatic (Recommended)</h2>
              <button
                className={styles.loginButton}
                onClick={handleLogin}
                type="button"
              >
                Login to Huma (Popup)
              </button>
              <p className={styles.hint}>
                Opens Huma in a popup. After logging in, use the bookmarklet below to automatically send your token.
              </p>
              <div className={styles.bookmarkletSection}>
                <button
                  className={styles.bookmarkletButton}
                  onClick={copyBookmarklet}
                  type="button"
                >
                  Copy Bookmarklet Code
                </button>
                <button
                  className={styles.viewCodeButton}
                  onClick={() => setShowBookmarkletCode(!showBookmarkletCode)}
                  type="button"
                >
                  {showBookmarkletCode ? 'Hide' : 'View'} Bookmarklet Code
                </button>
                {showBookmarkletCode && (
                  <div className={styles.bookmarkletCodeDisplay}>
                    <code className={styles.codeBlock}>{getBookmarkletCode()}</code>
                  </div>
                )}
                <p className={styles.bookmarkletInstructions}>
                  After copying, create a bookmark and paste the code as the URL. Then click it on the Huma page.
                </p>
              </div>
            </div>

            <div className={styles.methodDivider}>OR</div>

            <div className={styles.methodSection}>
              <h2 className={styles.methodTitle}>Method 2: Manual</h2>
              <button
                className={styles.tokenButton}
                onClick={handleOpenHuma}
                type="button"
              >
                Open Huma & Copy Token
              </button>
              <p className={styles.hint}>
                Opens Huma in a new tab. After logging in, copy the token from DevTools and paste it below.
              </p>
            </div>
          </>
        ) : (
          <form onSubmit={handleTokenSubmit} className={styles.tokenForm}>
            <label htmlFor="token-input" className={styles.tokenLabel}>
              Access Token
            </label>
            <textarea
              id="token-input"
              className={styles.tokenInput}
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste your access token here..."
              rows={4}
            />
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.tokenActions}>
              <button
                className={styles.submitButton}
                type="submit"
              >
                Save Token
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => {
                  setShowTokenInput(false);
                  setTokenInput('');
                  setError(null);
                }}
                type="button"
              >
                Cancel
              </button>
            </div>
            <p className={styles.instructions}>
              <strong>How to get your token:</strong>
              <br />
              1. Open Developer Tools (F12)
              <br />
              2. Go to Application → Local Storage → https://fortedigital.humahr.com
              <br />
              3. Find the key <code>huma:accessToken</code>
              <br />
              4. Copy the value (it may be in array format like <code>["token"]</code>)
              <br />
              5. Paste it here
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;

