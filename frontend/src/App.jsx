import { useState, useEffect, Fragment } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import SignUp from "./pages/Signup";
import Account from "./pages/Account";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Meditation from "./pages/Meditation";
import Journaling from "./pages/Journaling";
import HabitTracker from "./pages/Tracker";
import Productivity from "./pages/Productivity";
import Navbar from "./components/Navbar";
import { useThemeStore } from "./store/useThemeStore";

function App() {
  const { theme } = useThemeStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  
  const setAuth = (boolean) => {
    setIsAuthenticated(boolean);
  };

useEffect(() => {
  const checkAuthenticated = async () => {
    try {
      const res = await fetch("http://localhost:3000/verify", {
        method: "POST",
        credentials: "include",
      });
      const parseRes = await res.json();
      if(parseRes.valid){
        setAuth(true);
      }
    } catch {
      setAuth(false);
    } finally {
      setLoading(false);
    }
  };
  checkAuthenticated();
}, []);

  if (loading) return null;

  return (
    <Fragment>
      
      <div
        className="min-h-screen bg-base-200 transition-colors duration-300"
        data-theme={theme}
      >
        <Navbar isAuthenticated={isAuthenticated}/>
        <Routes>
           <Route element={<PublicRoute isAuthenticated={isAuthenticated}/>}>
              <Route exact path="/" element={<Landing/>}/>
              <Route path="/login" element={isAuthenticated ? <Navigate to="/homepage" replace /> : <Login setAuth={setAuth} />} />
              <Route path="/signup" element={isAuthenticated ? <Navigate to="/homepage" replace /> : <SignUp setAuth={setAuth} />} />
          </Route>
          <Route element={<ProtectedRoute isAuthenticated={isAuthenticated}/>}>
             <Route exact path="/homepage" element={<HomePage/>}/>
             <Route exact path="/account" element={<Account setAuth={setAuth}/>}/>
             <Route exact path="/meditation" element={<Meditation/>}/>
             <Route exact path="/journaling" element={<Journaling/>}/>
             <Route exact path="/habits" element={<HabitTracker/>}/>
             <Route exact path="/productivity" element={<Productivity/>}/>
          </Route>
        </Routes>
        
      </div>
  
    </Fragment>
  );
}

export default App;