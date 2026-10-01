import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ModalProvider } from './context/ModalContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import WatchHistory from './pages/WatchHistory';
import Subscriptions from './pages/Subscriptions';
import Explore from './pages/Explore';
import LikedVideos from './pages/LikedVideos';
import UploadVideo from './pages/UploadVideo';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import LiveStream from './pages/LiveStream';
import Watch from './pages/Watch';
import Playlists from './pages/Playlists';
import WatchLater from './pages/WatchLater';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import You from './pages/You';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ModalProvider>
          <Router>
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
      </Router>
        </ModalProvider>
      </SocketProvider>
    </AuthProvider>
  );
}




export default App;
