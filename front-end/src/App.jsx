// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import RequireAdmin from "./components/RequireAdmin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import Category from "./pages/Category";
import Detail from "./pages/Detail";
import Reader from "./pages/Reader";
import Favorites from "./pages/Favorites";
import Authors from "./pages/Authors";
import Genres from "./pages/Genres";
import Library from "./pages/Library";
import Notifications from "./pages/Notifications";
import AuthorProfile from "./pages/AuthorProfile";
import EditProfile from "./pages/EditProfile";
import AuthorStudio from "./pages/studio/AuthorStudio";
import NewWork from "./pages/studio/NewWork";
import NewChapter from "./pages/studio/NewChapter";
import Report from "./pages/Report";
import UpgradeVipSandbox from "./pages/UpgradeVipSandbox";
import WheelSpin from "./pages/WheelSpin";



// --- Admin pages ---
import AdminHome from "./pages/admin/AdminHome";
import Users from "./pages/admin/Users";
import AddUser from "./pages/admin/AddUser";
import Moderation from "./pages/admin/Moderation";
import ModerationPending from "./pages/admin/ModerationPending";
import Reports from "./pages/admin/Reports";
import ProcessGuide from "./pages/admin/ProcessGuide";
import Rule from "./pages/admin/Rule";
import AdminNovels from "./pages/admin/AdminNovels";
import AdminNovelDetail from "./pages/admin/AdminNovelDetail";
import AdminChapters from "./pages/admin/AdminChapters";
import AdminNotifications from "./pages/admin/AdminNotifications";


export default function App() {
  return (
    <Routes>
      {/* Mặc định */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Main pages */}
      <Route path="/home" element={<Home />} />
      <Route path="/category/:genre" element={<Category />} />
      <Route path="/novel/:id" element={<Detail />} />
      <Route path="/novel/:id/chuong/:no" element={<Reader />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/authors" element={<Authors />} />
      <Route path="/genres" element={<Genres />} />
      <Route path="/library" element={<Library />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/author/:id" element={<AuthorProfile />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/edit" element={<EditProfile />} />
      <Route path="/studio" element={<AuthorStudio />} />
      <Route path="/studio/new" element={<NewWork />} />
      <Route path="/studio/novel/:id/edit" element={<NewWork />} />
      <Route path="/studio/novel/:id/chapters/new" element={<NewChapter />} />
      <Route path="/report" element={<Report />} />
      <Route path="/vip" element={<UpgradeVipSandbox />} />
      <Route path="/wheel-spin" element={<WheelSpin />} />


      {/* Admin pages (được bảo vệ bởi RequireAdmin) */}
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminHome />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RequireAdmin>
            <Users />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/users/add"
        element={
          <RequireAdmin>
            <AddUser />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/moderation"
        element={
          <RequireAdmin>
            <Moderation />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/moderation/pending"
        element={
          <RequireAdmin>
            <ModerationPending />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <RequireAdmin>
            <Reports />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/process-guide"
        element={
          <RequireAdmin>
            <ProcessGuide />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/rules"
        element={
          <RequireAdmin>
            <Rule />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/novels"
        element={
          <RequireAdmin>
            <AdminNovels />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/novels/new"
        element={
          <RequireAdmin>
            <AdminNovelDetail mode="create" />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/novels/:id"
        element={
          <RequireAdmin>
            <AdminNovelDetail mode="edit" />
          </RequireAdmin>
        }
      />
      <Route path="/admin/chapters" element={<AdminChapters />} />
      <Route path="/admin/notifications" element={<AdminNotifications />} />

      {/* Dự phòng */}
      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route path="/admin/reports" element={<Reports />} />

    </Routes>
  );
}
