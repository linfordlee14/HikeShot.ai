/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import CreateHike from './pages/CreateHike';
import JoinHike from './pages/JoinHike';
import HikeGallery from './pages/HikeGallery';
import CameraCapture from './pages/CameraCapture';
import AdminDashboard from './pages/AdminDashboard';
import FindMyPhotos from './pages/FindMyPhotos';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500/30">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/create" element={<CreateHike />} />
          <Route path="/join" element={<JoinHike />} />
          <Route path="/join/:id" element={<JoinHike />} />
          <Route path="/hike/:id" element={<HikeGallery />} />
          <Route path="/hike/:id/camera" element={<CameraCapture />} />
          <Route path="/hike/:id/find" element={<FindMyPhotos />} />
          <Route path="/event/:id" element={<HikeGallery />} />
          <Route path="/event/:id/gallery" element={<HikeGallery />} />
          <Route path="/event/:id/camera" element={<CameraCapture />} />
          <Route path="/event/:id/find" element={<FindMyPhotos />} />
          <Route path="/admin/:id" element={<AdminDashboard />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </div>
    </Router>
  );
}
