import { useState, useEffect } from 'react';

export default function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (err) {
      console.error('useLocalStorage: read failed', err);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (err) {
      console.error('useLocalStorage: write failed', err);
    }
  }, [key, state]);

  return [state, setState];
}
