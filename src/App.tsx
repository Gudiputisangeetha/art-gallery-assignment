// src/App.tsx
import React from 'react';
import ArtTable from './components/ArtTable.tsx';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';

import './styles.css';

export default function App() {
  return <ArtTable />;
}
