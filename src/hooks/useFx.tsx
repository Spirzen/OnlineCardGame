import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { FxPayload } from '../game/types';

interface FxContextValue {
  effects: FxPayload[];
  spawn: (kind: FxPayload['kind'], opts?: Partial<FxPayload>) => void;
  shake: () => void;
  shaking: boolean;
}

const FxContext = createContext<FxContextValue | null>(null);
let fxId = 0;

export function FxProvider({ children }: { children: ReactNode }) {
  const [effects, setEffects] = useState<FxPayload[]>([]);
  const [shaking, setShaking] = useState(false);

  const spawn = useCallback((kind: FxPayload['kind'], opts: Partial<FxPayload> = {}) => {
    const fx: FxPayload = { id: ++fxId, kind, ...opts };
    setEffects((prev) => [...prev, fx]);
    setTimeout(() => setEffects((prev) => prev.filter((e) => e.id !== fx.id)), 1500);
  }, []);

  const shake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 400);
  }, []);

  return (
    <FxContext.Provider value={{ effects, spawn, shake, shaking }}>
      {children}
    </FxContext.Provider>
  );
}

export function useFx() {
  const ctx = useContext(FxContext);
  if (!ctx) throw new Error('useFx must be used within FxProvider');
  return ctx;
}

export function useScreenTransition(screen: string) {
  const prev = useRef(screen);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (prev.current !== screen) {
      prev.current = screen;
      setTransitioning(true);
      const t = setTimeout(() => setTransitioning(false), 400);
      return () => clearTimeout(t);
    }
  }, [screen]);

  return transitioning;
}
