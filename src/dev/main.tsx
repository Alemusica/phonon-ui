/**
 * Phonon UI - Development Entry Point
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { DevApp } from './DevApp';
import '../styles/globals.css';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <DevApp />
  </React.StrictMode>
);
