

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'
import LandingPage from './Pages/LandingPage'
import LoginPage from './Pages/LoginPage'
import SignUp from './Pages/SignUp'
import InvestmentPage from './Pages/InvestorPages/InvestmentPage'
import InvestmentDetailPage from './Pages/InvestorPages/InvestmentDetailPage'
import InvestorsDashboard from './Pages/InvestorPages/InvestorsDashboard'
import SuccessfulInvestmentsPage from './Pages/InvestorPages/SuccessfulInvestmentsPage'
import CheckoutPage from './Pages/InvestorPages/CheckoutPage'
import Contact from './Pages/Contact'
import About from './Pages/About'
import Testimonials from './Pages/Testimonial'
import ProjectOwnerDashboard from './Pages/ProjectOwnerPages/ProjectOwnerDashboard'
import ProjectOwnerVerificationPage from './Pages/ProjectOwnerPages/ProjectOwnerVerificationPage'
import PendingApprovalPage from './Pages/ProjectOwnerPages/PendingApprovalPage'
import MyListPage from './Pages/ProjectOwnerPages/MyListPage'
import ProjectOwnerListingDetailPage from './Pages/ProjectOwnerPages/ProjectOwnerListingDetailPage'
import ProjectOwnerLoginPage from './Pages/ProjectOwnerLoginPage'
import SettingPage from './Pages/SettingPage'
import ProfilePage from './Pages/ProfilePage'
import NotificationsPage from './Pages/NotificationsPage'
import ReferralsPage from './Pages/ReferralsPage'
import RouteError from './Components/RouteError'
import AppLayout from './Components/AppLayout'
import { AuthProvider } from './contexts/AuthContext'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        element: <LandingPage />
      },
      {
        path: '/Login',
        element: <LoginPage />
      },
      {
        path: '/SignUp',
        element: <SignUp />
      },
      {
        path: '/project-owner-login',
        element: <ProjectOwnerLoginPage />
      },
      {
        path: '/verification',
        element: <ProjectOwnerVerificationPage />
      },
      {
        path: '/pending-approval',
        element: <PendingApprovalPage />
      },
      {
        path: '/settings',
        element: <SettingPage />
      },
      {
        path: '/profile',
        element: <ProfilePage />
      },
      {
        path: '/notifications',
        element: <NotificationsPage />
      },
      {
        path: '/referrals',
        element: <ReferralsPage />
      },
      {
        path: '/project-owners-dashboard',
        element: <ProjectOwnerDashboard />
      },
      {
        path: '/my-list',
        element: <MyListPage />
      },
      {
        path: '/my-list/:id',
        element: <ProjectOwnerListingDetailPage />
      },
      {
        path: '/Investments',
        element: <InvestmentPage />
      },
      {
        path: '/successful-investments',
        element: <SuccessfulInvestmentsPage />
      },
      {
        path: '/investor-dashboard',
        element: <InvestorsDashboard />
      },
      {
        path: '/investments/:id',
        element: <InvestmentDetailPage />
      },
      {
        path: '/checkout',
        element: <CheckoutPage />
      },
      {
        path: '/About',
        element: <About />
      },
      {
        path: '/Testimonials',
        element: <Testimonials />
      },
      {
        path: '/contact',
        element: <Contact />
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
)