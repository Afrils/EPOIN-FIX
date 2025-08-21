
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { Role } from './types.ts';

// Static imports to fix module resolution issues
import Login from './pages/Login.tsx';
import Dashboard from './pages/Dashboard.tsx';
import AddRecord from './pages/teacher/AddRecord.tsx';
import MyPoints from './pages/student/MyPoints.tsx';

const AppRoutes: React.FC = () => {
    const { isAuthenticated } = useAuth();
    return (
        <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
            
            <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={[Role.ADMIN, Role.GURU, Role.SISWA]}><Dashboard /></ProtectedRoute>
            } />
            
            {/* Guru Routes */}
            <Route path="/add-record" element={
                <ProtectedRoute allowedRoles={[Role.GURU]}><AddRecord /></ProtectedRoute>
            } />
            <Route path="/my-students" element={
                <ProtectedRoute allowedRoles={[Role.GURU]}><div className="p-4">Halaman Siswa Saya (Guru)</div></ProtectedRoute>
            } />

            {/* Siswa Routes */}
            <Route path="/my-points" element={
                <ProtectedRoute allowedRoles={[Role.SISWA]}><MyPoints /></ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/manage-users" element={
                <ProtectedRoute allowedRoles={[Role.ADMIN]}><div className="p-4">Halaman Manajemen User (Admin)</div></ProtectedRoute>
            } />
            <Route path="/manage-classes" element={
                <ProtectedRoute allowedRoles={[Role.ADMIN]}><div className="p-4">Halaman Manajemen Kelas (Admin)</div></ProtectedRoute>
            } />
            <Route path="/manage-academic-years" element={
                <ProtectedRoute allowedRoles={[Role.ADMIN]}><div className="p-4">Halaman Manajemen Tahun Ajaran (Admin)</div></ProtectedRoute>
            } />
            
            {/* Common Routes */}
            <Route path="/profile" element={
                <ProtectedRoute allowedRoles={[Role.ADMIN, Role.GURU, Role.SISWA]}><div className="p-4">Halaman Profil</div></ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        </Routes>
    )
}


const App: React.FC = () => {
  return (
    <AuthProvider>
        <HashRouter>
            <AppRoutes />
        </HashRouter>
    </AuthProvider>
  );
};

export default App;
