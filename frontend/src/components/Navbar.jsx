import { useState } from "react";
import { Link } from "react-router-dom";
import { Brain, User, Menu, X } from "lucide-react";
import ThemeSelector from "./ThemeSelector";

function Navbar({ isAuthenticated }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-base-100/80 backdrop-blur-lg border-b border-base-content/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="navbar min-h-[4rem] flex justify-between items-center">
        
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:opacity-80 transition-opacity flex items-center gap-2">
              <Brain className="size-9 text-primary" />
              <span className="font-semibold font-mono tracking-widest text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Unbreakable
              </span>
            </Link>
          </div>

         
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-primary hover:scale-110 transition-transform"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="size-8" /> : <Menu className="size-8" />}
            </button>
          </div>

       
          <div className="hidden lg:flex flex-1 justify-center gap-6">
            {isAuthenticated ? (
              <>
                <Link to="/meditation" className="text-lg font-bold text-secondary hover:scale-110 transition-transform duration-300">
                  Meditation
                </Link>
                <Link to="/journaling" className="text-lg font-bold text-secondary hover:scale-110 transition-transform duration-300">
                  Journaling
                </Link>
                <Link to="/habits" className="text-lg font-bold text-secondary hover:scale-110 transition-transform duration-300">
                  Habits
                </Link>
                <Link to="/productivity" className="text-lg font-bold text-secondary hover:scale-110 transition-transform duration-300">
                  Productivity
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-lg font-bold text-secondary hover:scale-110 transition-transform duration-300">
                  Log In
                </Link>
                <Link to="/signup" className="text-lg font-bold text-secondary hover:scale-110 transition-transform duration-300">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          
          <div className="hidden lg:flex items-center gap-4">
            {isAuthenticated && (
              <Link to="/account" className="text-secondary hover:scale-110 transition-transform duration-300">
                <User className="text-primary" />
              </Link>
            )}
            <ThemeSelector />
          </div>
        </div>

      
        {isMenuOpen && (
          <div className="lg:hidden mt-2 flex flex-col gap-4 items-center pb-4">
            {isAuthenticated ? (
              <>
                <Link to="/meditation" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-secondary">
                  Meditation
                </Link>
                <Link to="/journaling" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-secondary">
                  Journaling
                </Link>
                <Link to="/habits" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-secondary">
                  Habits
                </Link>
                <Link to="/productivity" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-secondary">
                  Productivity
                </Link>
                <Link to="/account" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-secondary">
                  Account
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-secondary">
                  Log In
                </Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-secondary">
                  Sign Up
                </Link>
              </>
            )}
            <ThemeSelector />
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;
