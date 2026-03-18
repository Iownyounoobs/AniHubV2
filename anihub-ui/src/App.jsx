import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Movies from "./pages/Movies";
import LatestEpisodes from "./pages/LatestEpisodes"; 
import OriginAnime from "./pages/OriginAnime";
import MyList from "./pages/MyList";
import WatchEpisode from "./pages/WatchEpisode";
import AnimeDetails from "./pages/AnimeDetails";
import Profile from "./pages/Profile";
import ChangeAccount from "./pages/ChangeAccount";
import Subscribe from "./pages/Subscribe";
import Subscribed from "./pages/Subscribed";
import Genre from "./pages/Genre";

// Route Guards
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route path="/subscribe" element={<Subscribe />} />
        <Route path="/subscribed" element={<Subscribed />} />

        <Route
          path="/change-account"
          element={
              <ChangeAccount />
          }
        />
                <Route
          path="/profile"
          element={
              <Profile />
          }
          />

          
        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movies"
          element={
            <ProtectedRoute>
              <Movies />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tv"
          element={
            <ProtectedRoute>
              <LatestEpisodes /> 
            </ProtectedRoute>
          }
        />
        <Route
          path="/origin/:country"
          element={
            <ProtectedRoute>
              <OriginAnime />
            </ProtectedRoute>
          }
        />
        <Route
          path="/latest"
          element={
            <ProtectedRoute>
              <LatestEpisodes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mylist"
          element={
            <ProtectedRoute>
              <MyList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/watch/:episodeId"
          element={
            <ProtectedRoute>
              <WatchEpisode />
            </ProtectedRoute>
          }
        />
        <Route
          path="/anime/:animeId"
          element={
            <ProtectedRoute>
              <AnimeDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/genre/:genre"
          element={
            <ProtectedRoute>
              <Genre />
            </ProtectedRoute>
          }
        />

        {/* Catch-All Redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
