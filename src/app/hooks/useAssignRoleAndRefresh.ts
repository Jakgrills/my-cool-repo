'use client';

import { useCgLib } from '../context/CgLibContext';
import { useState } from 'react';

interface AssignRoleVariables {
  roleId: string;
  userId: string;
}

const TIMEOUT_DURATION = 10000; // 10 seconds

export function useAssignRoleAndRefresh() {
  const { cgInstance, isInitialized } = useCgLib();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async ({ roleId, userId }: AssignRoleVariables) => {
    if (!isInitialized || !cgInstance) {
      setError(new Error('CG Lib is not initialized'));
      return;
    }

    if (!roleId || !userId) {
      setError(new Error('Role ID and User ID are required'));
      return;
    }

    setIsPending(true);
    setError(null);

    try {
      // Create a promise that rejects after timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Role assignment timed out'));
        }, TIMEOUT_DURATION);
      });

      // Race between role assignment and timeout
      await Promise.race([
        cgInstance.giveRole(roleId, userId),
        timeoutPromise
      ]);
    } catch (err) {
      console.error('Error assigning role:', err);
      setError(err instanceof Error ? err : new Error('Failed to assign role'));
    } finally {
      setIsPending(false);
    }
  };

  return {
    mutate,
    isPending,
    error
  };
} 