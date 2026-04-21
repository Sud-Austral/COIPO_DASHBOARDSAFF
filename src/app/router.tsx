import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Must match vite.config.ts `base` — ensures routing works on GitHub Pages
const BASE_PATH = import.meta.env.BASE_URL;
import { MainLayout } from './layout/MainLayout';

// Lazy load features
const InformePage = React.lazy(() => import('../features/executive/pages/InformePage'));
const ControlPage = React.lazy(() => import('../features/control/pages/ControlPage'));
const TerritorialPage = React.lazy(() => import('../features/territorial/pages/TerritorialPage'));

// Helper for dynamic region route
const RegionDetailPage = React.lazy(() => import('../features/territorial/pages/RegionDetailPage'));

export const Router: React.FC = () => {
  return (
    <BrowserRouter basename={BASE_PATH}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/informe" replace />} />
          <Route 
            path="informe" 
            element={
              <React.Suspense fallback={<Loading />}>
                <InformePage />
              </React.Suspense>
            } 
          />
          <Route 
            path="control" 
            element={
              <React.Suspense fallback={<Loading />}>
                <ControlPage />
              </React.Suspense>
            } 
          />
          <Route 
            path="territorios" 
            element={
              <React.Suspense fallback={<Loading />}>
                <TerritorialPage />
              </React.Suspense>
            } 
          >
            <Route path=":codigo" element={<RegionDetailPage />} />
          </Route>
          
          <Route path="configuracion" element={<div className="p-8"><h1 className="text-2xl font-bold">Configuración</h1><p className="mt-4 text-gray-500">Panel de preferencias y usuarios simitados.</p></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-forest-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-forest-700 animate-pulse uppercase tracking-widest text-[10px]">Cargando Dashboard...</span>
      </div>
    </div>
  );
}
