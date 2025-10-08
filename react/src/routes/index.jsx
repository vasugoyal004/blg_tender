import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

// project import
import MainRoutes from './MainRoutes';

// render - landing page
const Login = lazy(() => import('../views/auth/login'));

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Login />,
    },
    MainRoutes
  ],
  { basename: import.meta.env.VITE_APP_BASE_NAME }
);

export default router;
