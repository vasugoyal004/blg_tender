import { lazy } from 'react';

import AdminLayout from 'layouts/AdminLayout';
import GuestLayout from 'layouts/GuestLayout';
import ProtectedRoute from '../views/auth/Protected ';

const DashboardSales = lazy(() => import('../views/dashboard/DashSales/index'));


const Login = lazy(() => import('../views/auth/login'));

const Add_tender = lazy(() => import('../Menu/Add_tender'));
const View_all_tender = lazy(() => import('../Menu/View_all_tender'));

const Tender_information_view = lazy(() => import('../Menu/Tender_information_view'));
const Archive_list = lazy(() => import('../Menu/Archive_list'));
const View_all_accounts_tender = lazy(() => import('../Menu/View_all_accounts_tender'));
const Emd_tender_fee_request = lazy(() => import('../Menu/Emd_tender_fee_request'));
const Account_tender_information = lazy(() => import('../Menu/Account_tender_information'));
const Send_letter = lazy(() => import('../Menu/Send_letter'));
const Emd_refund = lazy(() => import('../Menu/Emd_refund')); 
const Add_tender_category = lazy(() => import('../Menu/Add_tender_category')); 
const Performance_gurantee = lazy(() => import('../Menu/Performance_gurantee')); 
const Tender_information_edit = lazy(() => import('../Menu/Tender_information_edit')); 



const MainRoutes = {
  path: '/',
  children: [
        {
      path: '/',
      element: <Login />,
    },
    {
      path: '/',
      element: <AdminLayout />,
      children: [
        {
          path: '/dashboard',
          element: <ProtectedRoute><DashboardSales /></ProtectedRoute>
        },
          {
          path: '/Add_tender',
          element: <ProtectedRoute><Add_tender /></ProtectedRoute>
        },
        {
          path: '/View_all_tender',
          element: <ProtectedRoute><View_all_tender /></ProtectedRoute>
        },
        {
            path: '/Tender_information_view/:temp_id',
            element: <ProtectedRoute><Tender_information_view /></ProtectedRoute>
        },
        {
          path: '/Archive_list',
          element: <ProtectedRoute><Archive_list /></ProtectedRoute>
        },
        {
          path: '/View_all_accounts_tender',
          element: <ProtectedRoute><View_all_accounts_tender /></ProtectedRoute>
        },
        {
          path: '/Emd_tender_fee_request',
          element: <ProtectedRoute><Emd_tender_fee_request /></ProtectedRoute>
        },
        {
          path: '/Account_tender_information/:temp_id',
          element: <ProtectedRoute><Account_tender_information /></ProtectedRoute>
        },
        {
          path: '/Send_letter/:temp_id',
          element: <ProtectedRoute><Send_letter /></ProtectedRoute>
        },
        {
          path: '/Emd_refund',
          element: <ProtectedRoute><Emd_refund /></ProtectedRoute>
        },
         {
          path: '/Performance_gurantee',
          element: <ProtectedRoute><Performance_gurantee /></ProtectedRoute>
        },
        {
          path: '/Add_tender_category',
          element: <ProtectedRoute><Add_tender_category /></ProtectedRoute>
        },
        {
          path: '/Tender_information_edit/:temp_id',
          element: <ProtectedRoute><Tender_information_edit /></ProtectedRoute>
        },
       
      ]
    },
   
  ]
};

export default MainRoutes;
