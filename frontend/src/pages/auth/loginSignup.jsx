import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  loginUser,
  registerUser,
} from "./../../services/userServices/authService";

const LoginSignup = () => {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // =====================
        // LOGIN
        // =====================
        await loginUser({
          email: form.email,
          password: form.password,
        });

        navigate("/dashboard", { replace: true });
      } else {
        // =====================
        // REGISTER + AUTO LOGIN
        // =====================
        await registerUser({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        });

        // 🔥 Auto login after register
        await loginUser({
          email: form.email,
          password: form.password,
        });

        navigate("/dashboard", { replace: true });
      }

      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
      });
    } catch (err) {
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>

        {!isLogin && (
          <>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              style={styles.input}
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={handleChange}
              style={styles.input}
            />
          </>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading
            ? "Please wait..."
            : isLogin
            ? "Login"
            : "Create Account"}
        </button>

        <p style={styles.switchText}>
          {isLogin ? "Don’t have an account?" : "Already have an account?"}
          <span
            onClick={() => setIsLogin(!isLogin)}
            style={styles.switchLink}
          >
            {isLogin ? " Sign up" : " Login"}
          </span>
        </p>
      </form>
    </div>
  );
};

export default LoginSignup;

/* =========================
   INLINE STYLES
========================= */

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
  },
  card: {
    background: "#020617",
    padding: "2rem",
    borderRadius: "10px",
    width: "100%",
    maxWidth: "400px",
    color: "#fff",
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "6px",
    border: "1px solid #334155",
    background: "#020617",
    color: "#fff",
  },
  button: {
    width: "100%",
    padding: "10px",
    marginTop: "15px",
    borderRadius: "6px",
    border: "none",
    background: "#22c55e",
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer",
  },
  switchText: {
    marginTop: "15px",
    fontSize: "14px",
    textAlign: "center",
  },
  switchLink: {
    color: "#22c55e",
    cursor: "pointer",
    marginLeft: "5px",
    fontWeight: "bold",
  },
};
