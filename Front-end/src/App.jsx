import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ModalProvider } from './context/ModalContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import PageLoader from './components/PageLoader';
import Home from './pages/Home';

// Route-based Code Splitting: Secondary pages load on-demand
const WatchHistory = lazy(() => import('./pages/WatchHistory'));
const Subscriptions = lazy(() => import('./pages/Subscriptions'));
const Explore = lazy(() => import('./pages/Explore'));
const LikedVideos = lazy(() => import('./pages/LikedVideos'));
const UploadVideo = lazy(() => import('./pages/UploadVideo'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Feed = lazy(() => import('./pages/Feed'));
const LiveStream = lazy(() => import('./pages/LiveStream'));
const Watch = lazy(() => import('./pages/Watch'));
const Playlists = lazy(() => import('./pages/Playlists'));
const WatchLater = lazy(() => import('./pages/WatchLater'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Notifications = lazy(() => import('./pages/Notifications'));
const You = lazy(() => import('./pages/You'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <ModalProvider>
            <Router>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Main App Layout */}
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="explore" element={<Explore />} />
                    <Route path="watch" element={<Watch />} />
                    <Route path="watch/:videoId" element={<Watch />} />
                    <Route path="live" element={<LiveStream />} />
                    <Route path="feed" element={<Feed />} />
                    <Route path="community" element={<Feed />} />
                    <Route path="tweets" element={<Feed />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="subscriptions" element={<Subscriptions />} />
                    <Route path="history" element={<WatchHistory />} />
                    <Route path="you" element={<You />} />
                    <Route path="profile" element={<You />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="liked-videos" element={<LikedVideos />} />
                    <Route path="liked-streams" element={<LikedVideos />} />
                    <Route path="watch-later" element={<WatchLater />} />
                    <Route path="playlists" element={<Playlists />} />
                    <Route path="upload" element={<UploadVideo />} />
                    <Route path="publish" element={<UploadVideo />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="studio" element={<Dashboard />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </Suspense>
            </Router>
          </ModalProvider>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}




export default App;
