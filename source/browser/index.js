import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';

import Route_ from '#browser/Route_';
import Round from '#browser/Route_/Round';
import Ante from '#browser/Route_/Ante';
import '#browser/index.scss';

createRoot(document.body).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Route_ />}>
          <Route path='Ante' element={<Ante />} />

          <Route path='Round' element={<Round />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
