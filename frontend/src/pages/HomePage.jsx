import { Link } from "react-router-dom";
import Cookies from "js-cookie"
import { useEffect, useState } from "react";

const Homepage = () => {
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");

  const fetchQuote = async () => {
    try {
      const res = await fetch("http://localhost:3000/quote");
      const data = await res.json();

      setQuote(data.quote);
      setAuthor(data.author);

      const today = new Date().toISOString().split("T")[0];

      Cookies.set("quoteOfTheDay", JSON.stringify({
        quote: data.quote,
        author: data.author,
        date: today
      }), { expires: 1 });

    } catch (error) {
      console.error("Failed to fetch quote:", error);
    }
  };

  const loadQuote = () => {
    const cookie = Cookies.get("quoteOfTheDay");
    const today = new Date().toISOString().split("T")[0];

    if (!cookie) {
      fetchQuote();
      return;
    }

    const data = JSON.parse(cookie);

    if (data.date !== today) {
      fetchQuote();
    } else {
      setQuote(data.quote);
      setAuthor(data.author);
    }
  };

  useEffect(() => {
    loadQuote();
  }, []);




  return (
    <div className="mt-24 text-center">
      <h1 className="text-6xl font-bold text-primary mb-6">Welcome User</h1>
      <p className="text-2xl text-secondary font-bold mb-4">{quote}</p>
      <p className="text-2xl text-primary  mb-12">{author}</p>
      <div className="flex justify-center gap-6">
        <Link to="/meditation" className="btn btn-primary text-xl px-8 rounded-3xl transition-transform hover:scale-105 font-bold">
          Meditation
        </Link>
        <Link to="/journaling" className="btn btn-secondary text-xl px-8 rounded-3xl transition-transform hover:scale-105 font-bold">
          Journaling
        </Link>
        <Link to="/habits" className="btn btn-secondary text-xl px-8 rounded-3xl transition-transform hover:scale-105 font-bold">
          Habits
        </Link>
        <Link to="/productivity" className="btn btn-primary text-xl px-8 rounded-3xl transition-transform hover:scale-105 font-bold">
          Productivity
        </Link>
      </div>
    </div>
  );
};

export default Homepage;