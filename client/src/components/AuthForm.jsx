import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Tab,
  Tabs,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import axios from "axios";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import MenuIcon from "@mui/icons-material/Menu";
import NightlightRoundIcon from "@mui/icons-material/NightlightRound";
import WbSunnyIcon from "@mui/icons-material/WbSunny";

export default function AuthForm({ onLoginSuccess }) {
  const [tab, setTab] = useState(0);
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("tenant");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false);

  // Fun glow "party" effect
  const cardShadow =
    "0 8px 32px 0 rgba(96, 165, 250,.37), 0 1.5px 16px 0 rgba(67,56,202,0.17)";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      if (tab === 0) {
        const res = await axios.post("http://localhost:3000/api/auth/login", {
          mobile,
          password,
        });
        setMsg("✔️ Welcome! Redirecting... 🎊");
        setLoading(false);
        setTimeout(() => onLoginSuccess(res.data.token, res.data.user.role), 800); // Delay for bounce
      } else {
        const res = await axios.post("http://localhost:3000/api/auth/signup", {
          mobile,
          password,
          role,
        });
        setMsg("🎉 " + res.data.msg);
        setLoading(false);
      }
    } catch (err) {
      setMsg(
        (tab === 0 ? "❌ " : "⚠️ ") +
          (err.response?.data?.msg || (tab === 0 ? "Login failed!" : "Signup failed!"))
      );
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        bgcolor:
          dark
            ? "linear-gradient(135deg, #292524 0%, #312e81 80%, #0ea5e9 100%)"
            : "linear-gradient(135deg, #f9fafb 0%, #e0e7ff 60%, #e0f2fe 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "0.4s",
        position: "relative",
      }}
    >
      {/* Hamburger & Dark/Light UI (top left/right, future usage) */}
      <IconButton
        aria-label="menu"
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          bgcolor: "#fff6",
          borderRadius: 2,
        }}
      >
        <MenuIcon />
      </IconButton>

      <IconButton
        onClick={() => setDark((v) => !v)}
        aria-label="toggle theme"
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          bgcolor: "#fff5",
          borderRadius: 2,
        }}
      >
        {dark ? <WbSunnyIcon /> : <NightlightRoundIcon />}
      </IconButton>
      {/* Actual Login Card */}
      <Paper
        elevation={12}
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 4,
          width: "100%",
          maxWidth: 400,
          boxShadow: cardShadow,
          textAlign: "center",
          position: "relative",
          animation: "bounce-in 0.7s",
          bgcolor: dark ? "#141927" : "rgba(255,255,255,0.97)",
        }}
      >
        <Typography variant="h5" mb={2} color="primary">
          {tab === 0 ? "🚪 Login To Your Account" : "🆕 Sign Up For Access"}
        </Typography>
        <Tabs
          value={tab}
          onChange={(_, v) => {
            setTab(v);
            setMsg("");
          }}
          centered
        >
          <Tab
            icon={<LoginIcon />}
            iconPosition="start"
            label="Login"
            sx={{ fontWeight: 900 }}
          />
          <Tab
            icon={<PersonAddAltIcon />}
            iconPosition="start"
            label="Sign Up"
            sx={{ fontWeight: 900 }}
          />
        </Tabs>
        <form
          onSubmit={handleSubmit}
          style={{ marginTop: 24, width: "100%" }}
          autoComplete="off"
        >
          <TextField
            margin="dense"
            label="📱 Mobile Number"
            fullWidth
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            inputProps={{ type: "tel", maxLength: 15 }}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="🔑 Password"
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            inputProps={{ autoComplete: "off" }}
            required
            sx={{ mb: 2 }}
          />
          {tab === 1 && (
            <TextField
              margin="dense"
              select
              label="👤 Role"
              fullWidth
              SelectProps={{ native: true }}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              sx={{ mb: 1 }}
            >
              <option value="tenant">Tenant 🏠</option>
              <option value="admin">Admin 🛠️</option>
            </TextField>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color={tab === 0 ? "primary" : "secondary"}
            sx={{
              mt: 2,
              py: 1.4,
              fontWeight: 700,
              fontSize: 16,
              textTransform: "uppercase",
              letterSpacing: 2,
              boxShadow: "0 2px 12px 0 #60a5fa33",
              animation: loading ? "bounce 0.5s linear infinite" : "none",
            }}
            disabled={loading}
          >
            {loading ? (
              <span>
                {" "}
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                {tab === 0 ? "Logging In..." : "Signing Up..."}
              </span>
            ) : tab === 0 ? (
              "LOGIN 🚀"
            ) : (
              "SIGN UP 🧑‍💻"
            )}
          </Button>
        </form>
        {msg && (
          <Box mt={2} sx={{ animation: "blinker 1s linear infinite" }}>
            <Alert
              severity={
                msg.includes("Success")
                  ? "success"
                  : msg.includes("not") || msg.includes("fail")
                  ? "warning"
                  : "info"
              }
              sx={{
                fontWeight: "bold",
                fontSize: 15,
                borderRadius: 2,
                px: 1.5,
                py: 0.5,
              }}
            >
              {msg}
            </Alert>
          </Box>
        )}
        <Typography
          align="center"
          color="textSecondary"
          sx={{ mt: 3, fontSize: 14 }}
        >
          {tab === 0
            ? "Don't have an account? 👉 Click 'Sign Up'."
            : "Already have an account? 👉 Click 'Login'."}
        </Typography>
      </Paper>
      {/* Keyframes for bounce/bling effects */}
      <style>
        {`
        @keyframes bounce-in {
          0% { transform: scale(0.7); opacity: 0; }
          55% { transform: scale(1.05); }
          70% { transform: scale(0.95);}
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes blinker {
          50% { opacity: 0.6; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-5px);}
          50% { transform: translateY(2px);}
          75% { transform: translateY(-5px);}
        }
        `}
      </style>
    </Box>
  );
}