import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="mt-24 text-center">
      <div className="mt-60">
        <h1 className="text-6xl font-bold text-primary mb-6">Welcome to Unbreakable</h1>
        <p className="text-2xl text-gray-600 font-bold mb-12">Sign in and start building your mental fortress</p>
      </div>
      <div className="flex justify-center gap-6">
        <Link to="/login" className="btn btn-primary text-xl px-8 rounded-3xl transition-transform hover:scale-105 font-bold">
          Log In
        </Link>
        <Link to="/signup" className="btn btn-secondary text-xl px-8 rounded-3xl transition-transform hover:scale-105 font-bold">
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default Landing;