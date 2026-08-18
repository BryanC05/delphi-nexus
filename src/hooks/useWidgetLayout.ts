import { useCallback, useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from '@/services/firebase';
import { DEFAULT_WIDGETS, WIDGET_OPTIONS, type WidgetId } from '@/config/widgetRegistry';
import { playClickSound } from '@/shared/soundUtils';

export function enforceTopWidgets(widgets: string[]): string[] {
  const sorted = [...widgets];
  const weatherIdx = sorted.indexOf('weather');
  if (weatherIdx !== -1) {
    sorted.splice(weatherIdx, 1);
    sorted.splice(0, 0, 'weather');
  }
  const animeIdx = sorted.indexOf('anime');
  if (animeIdx !== -1) {
    sorted.splice(animeIdx, 1);
    const targetPos = sorted.includes('weather') ? 1 : 0;
    sorted.splice(targetPos, 0, 'anime');
  }
  return sorted;
}

function loadActiveWidgets(): string[] {
  const saved = localStorage.getItem('activeWidgets');
  if (!saved) return [...DEFAULT_WIDGETS];

  let parsed: string[] = JSON.parse(saved);
  if (parsed.includes('media')) {
    parsed = parsed.map((w) => (w === 'media' ? 'anime' : w));
  }
  parsed = parsed.filter((w) => w !== 'radar' && w !== 'clock');
  parsed = Array.from(new Set(parsed));
  const enforced = enforceTopWidgets(parsed);
  localStorage.setItem('activeWidgets', JSON.stringify(enforced));
  return enforced;
}

type CloudLayoutRestore = {
  activeTheme?: string;
};

export function useWidgetLayout(
  geolocationDenied: boolean,
  onCloudRestore?: (data: CloudLayoutRestore) => void
) {
  const [activeWidgets, setActiveWidgets] = useState<string[]>(loadActiveWidgets);
  const [collapsedWidgets, setCollapsedWidgets] = useState<Record<string, boolean>>(() =>
    JSON.parse(localStorage.getItem('collapsedWidgets') || '{}')
  );
  const [user, setUser] = useState<User | null>(null);

  const syncToCloud = useCallback(async (updates: Record<string, unknown>) => {
    if (!auth?.currentUser || !db) return;
    try {
      const docRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(docRef, updates, { merge: true });
    } catch (e) {
      console.error('Cloud sync failed:', e);
    }
  }, []);

  useEffect(() => {
    if (geolocationDenied) {
      setActiveWidgets((prev) => {
        const next = enforceTopWidgets(prev.filter((w) => w !== 'bio' && w !== 'solar'));
        localStorage.setItem('activeWidgets', JSON.stringify(next));
        return next;
      });
    }
  }, [geolocationDenied]);

  useEffect(() => {
    if (!auth || !db) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) return;

      try {
        const docSnap = await getDoc(doc(db, 'users', currentUser.uid));
        if (!docSnap.exists()) return;
        const data = docSnap.data();
        if (data.activeWidgets) {
          const enforced = enforceTopWidgets(data.activeWidgets);
          setActiveWidgets(enforced);
          localStorage.setItem('activeWidgets', JSON.stringify(enforced));
        }
        if (data.collapsedWidgets) {
          setCollapsedWidgets(data.collapsedWidgets);
          localStorage.setItem('collapsedWidgets', JSON.stringify(data.collapsedWidgets));
        }
        if (data.activeTheme) {
          localStorage.setItem('activeTheme', data.activeTheme);
          onCloudRestore?.({ activeTheme: data.activeTheme });
        }
      } catch (e) {
        console.error('Error fetching layout:', e);
      }
    });
    return unsubscribe;
  }, [onCloudRestore]);

  const toggleCollapse = (id: string) => {
    setCollapsedWidgets((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem('collapsedWidgets', JSON.stringify(next));
      syncToCloud({ collapsedWidgets: next });
      return next;
    });
    playClickSound();
  };

  const toggleWidgetActive = (id: string) => {
    setActiveWidgets((prev) => {
      const newWidgets = prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id];
      const enforced = enforceTopWidgets(newWidgets);
      localStorage.setItem('activeWidgets', JSON.stringify(enforced));
      syncToCloud({ activeWidgets: enforced });
      return enforced;
    });
    playClickSound();
  };

  const reorderWidgets = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || Number.isNaN(fromIndex)) return;
    setActiveWidgets((prev) => {
      const newOrder = [...prev];
      const [draggedWidget] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, draggedWidget);
      const enforced = enforceTopWidgets(newOrder);
      localStorage.setItem('activeWidgets', JSON.stringify(enforced));
      syncToCloud({ activeWidgets: enforced });
      return enforced;
    });
    playClickSound();
  };

  return {
    activeWidgets: activeWidgets as WidgetId[],
    collapsedWidgets,
    user,
    widgetOptions: WIDGET_OPTIONS,
    toggleCollapse,
    toggleWidgetActive,
    reorderWidgets,
    syncToCloud,
  };
}
