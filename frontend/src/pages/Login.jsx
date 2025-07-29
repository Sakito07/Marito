import { Fragment, useState } from "react";
import { Link, useNavigate  } from "react-router-dom";
import { ToastContainer, toast, Slide } from "react-toastify";

const Login = ({ setAuth }) => {
  const [inputs, setInputs] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


 const onChange = ({ target: { name, value } }) =>
    setInputs(prev => ({ ...prev, [name]: value }));

  const onSubmitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(inputs),
      });
      const { message, error } = await res.json();
      if (res.ok) {
        setAuth(true);
        toast.success(message);
        navigate("/homepage");
      } else {
        setAuth(false);
        toast.error(error);
      }
    } catch {
      setAuth(false);
      toast.error("Network error");
    }finally {
      setLoading(false);
    }
  };
  

  return (
    <Fragment>
      <h1 className="text-6xl font-bold text-center text-primary mb-6 mt-20">
        Log In
      </h1>
      <form
        className="bg-base-100 max-w-md mx-auto rounded-xl shadow-lg flex flex-col gap-8 p-16"
        onSubmit={onSubmitForm}
      >
        <input
          type="text"
          name="username"
          placeholder="username"
          value={inputs.username}
          onChange={(e) => onChange(e)}
          className="input-bordered w-full text-center p-4 rounded-3xl text-lg font-bold"
        />
        <input
          type="password"
          name="password"
          placeholder="password"
          value={inputs.password}
          onChange={(e) => onChange(e)}
          className="input-bordered w-full text-center p-4 rounded-3xl text-lg font-bold"
        />
        <button className="btn btn-primary w-full text-2xl rounded-3xl">
          {loading ? "Logging in..." : "Submit"}
        </button>
        <Link
          className="block text-lg text-center text-xl font-bold text-secondary transform hover:scale-110 transition-transform duration-300"
          to="/signup"
        >
          Sign Up
        </Link>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable={false} pauseOnHover theme="dark" transition={Slide}/>
      </form>
    </Fragment>
  );
};

export default Login;
