'use client';

import { CgPluginLib } from '@common-ground-dao/cg-plugin-lib';
import { createContext, useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface CgLibContextType {
  cgInstance: CgPluginLib | null;
  iframeUid: string | null;
  isInitialized: boolean;
}

const CgLibContext = createContext<CgLibContextType>({
  cgInstance: null,
  iframeUid: null,
  isInitialized: false,
});

const publicKey = process.env.NEXT_PUBLIC_PUBKEY as string;
if (!publicKey) {
  throw new Error("Public key is not set in the .env file");
}

// Add timeout configuration
const TIMEOUT_DURATION = 10000; // 10 seconds

export function CgLibProvider({ children }: { children: React.ReactNode }) {
  const [cgInstance, setCgInstance] = useState<CgPluginLib | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const searchParams = useSearchParams();
  const iframeUid = searchParams.get('iframeUid');

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const initializeCgLib = async () => {
      if (!iframeUid) return;

      try {
        // Create a promise that rejects after timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('CG Lib initialization timed out'));
          }, TIMEOUT_DURATION);
        });

        // Race between initialization and timeout
        const instance = await Promise.race([
          CgPluginLib.initialize(iframeUid, '/api/sign', publicKey),
          timeoutPromise
        ]) as CgPluginLib;

        clearTimeout(timeoutId);
        setCgInstance(instance);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize CG Lib:', error);
        clearTimeout(timeoutId);
      }
    };

    initializeCgLib();

    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [iframeUid]);

  return (
    <CgLibContext.Provider value={{ cgInstance, iframeUid, isInitialized }}>
      {children}
    </CgLibContext.Provider>
  );
}

export const useCgLib = () => useContext(CgLibContext); 