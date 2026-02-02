import { Routes, Route, Navigate } from "react-router";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Homepage from "./pages/Homepage";
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from "./authSlice";
import { useEffect } from "react";
import AdminPanel from "./components/AdminPanel";
import ProblemPage from "./pages/ProblemPage";
import Admin from "./pages/Admin";
import AdminVideo from "./components/AdminVideo";
import AdminDelete from "./components/AdminDelete";
import AdminUpload from "./components/AdminUpload";
import UserProfile from './pages/UserProfile';
import GuidePage from "./pages/GuidePage";
import DiscussionList from './pages/DiscussionList';
import DiscussionDetail from './pages/DiscussionDetail';
import POTDPage from './pages/POTDPage';


function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  // check initial authentication
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // Helper for cleaner code
  const isAdmin = isAuthenticated && user?.role === 'admin';

  return (
    <>
      <Routes>
        {/* Public Routes (redirect to home if logged in) */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <Signup />} />

        {/* Protected User Routes */}
        <Route path="/" element={isAuthenticated ? <Homepage /> : <Navigate to="/login" />} />
        <Route path="/guide" element={isAuthenticated ? <GuidePage /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuthenticated ? <UserProfile /> : <Navigate to="/login" />} />
        <Route path="/problem/:problemId" element={isAuthenticated ? <ProblemPage /> : <Navigate to="/login" />} />
        <Route path="/discuss" element={<DiscussionList />} />
        <Route path="/discuss/:id" element={<DiscussionDetail />} />
        <Route path="/potd" element={<POTDPage />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={isAdmin ? <Admin /> : <Navigate to="/" />} />
        <Route path="/admin/create" element={isAdmin ? <AdminPanel /> : <Navigate to="/" />} />
        <Route path="/admin/delete" element={isAdmin ? <AdminDelete /> : <Navigate to="/" />} />
        <Route path="/admin/video" element={isAdmin ? <AdminVideo /> : <Navigate to="/" />} />
        <Route path="/admin/upload/:problemId" element={isAdmin ? <AdminUpload /> : <Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;