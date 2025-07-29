import { Fragment, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast, Slide } from "react-toastify";

const Account = ({ setAuth }) => {
  const [inputs, setInputs] = useState({
    username: "",
    password: "",
    newPassword: "",
    age: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getInfo = async () => {
      try {
        const res = await fetch("http://localhost:3000/account", {
          method: "GET",
          headers: { "Content-type": "application/json" },
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setInputs({
            username: data.username || "",
            password: "",
            newPassword: "",
            age: data.age || "",
          });
        } else {
          toast.error("Failed to fetch user info");
        }
      } catch (error) {
        toast.error(error);
      }
    };
    getInfo();
  }, []);

  const onChange = ({ target: { name, value } }) =>
    setInputs((prev) => ({ ...prev, [name]: value }));

  const onSubmitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/account", {
        method: "PUT",
        headers: { "Content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(inputs),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Updated successfully");
         navigate("/homepage")
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
     
      setLoading(false);
    }
  };
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch("http://localhost:3000/logout", {
      method: "POST",
      credentials: "include",
    });
    setAuth(false);
    navigate("/");
  };

  return (
    <Fragment>
      <h1 className="text-6xl font-bold text-center text-primary mb-6 mt-20">
        Your info
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
          onChange={onChange}
          className="input-bordered w-full text-center p-4 rounded-3xl text-lg font-bold text-secondary"
        />
        <input
          type="password"
          name="password"
          placeholder="old password"
          value={inputs.password}
          onChange={onChange}
          className="input-bordered w-full text-center p-4 rounded-3xl text-lg font-bold text-secondary"
          autoComplete="new-password"
        />
        <input
          type="password"
          name="newPassword"
          placeholder="new password"
          value={inputs.newPassword}
          onChange={onChange}
          className="input-bordered w-full text-center p-4 rounded-3xl text-lg font-bold text-secondary"
          autoComplete="new-password"
        />
        <input
          type="number"
          name="age"
          placeholder="age"
          value={inputs.age}
          onChange={onChange}
          className="input-bordered w-full text-center p-4 rounded-3xl text-lg font-bold text-secondary"
        />
        <button className="btn btn-primary w-full text-2xl rounded-3xl">
          {loading ? "Updating..." : "Submit"}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="block text-lg text-center text-xl font-bold text-secondary transform hover:scale-110 transition-transform duration-300"
        >
          Log Out
        </button>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable={false}
          pauseOnHover
          theme="dark"
          transition={Slide}
        />
      </form>
    </Fragment>
  );
};

export default Account;
