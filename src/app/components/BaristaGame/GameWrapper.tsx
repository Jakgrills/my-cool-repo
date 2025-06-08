'use client';

import dynamic from 'next/dynamic';
import { CgLibProvider } from '../../context/CgLibContext';

const BaristaGame = dynamic(
  () => import('./index'),
  { ssr: false }
);

export default function GameWrapper() {
  return (
    <CgLibProvider>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white mb-4 text-center">Barista Brew</h1>
        <BaristaGame />
      </div>
    </CgLibProvider>
  );
} 