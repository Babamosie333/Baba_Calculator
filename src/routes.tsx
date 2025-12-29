import CalculatorPage from './pages/CalculatorPage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Scientific Calculator',
    path: '/',
    element: <CalculatorPage />
  }
];

export default routes;
