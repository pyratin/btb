import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';

import Route_ from '#browser/Route_';
import '#browser/index.scss';

createRoot(document.body).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Route_ />}></Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
