import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Button, Typography, Paper, Chip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import LogoutIcon from "@mui/icons-material/Logout";

export default function DashboardPage({ role, onLogout }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get("http://localhost:3000/api/auth/me", {
          headers: { Authorization: "Bearer " + token }
        });
        setProfile(res.data.user);
      } catch (e) {
        onLogout();
      }
    }
    fetchProfile();
  }, [onLogout]);

  if (!profile) return <Box textAlign="center" pt={10}>Loading your dashboard...</Box>;

  let approved = false, statusMessage = "", statusColor = "warning", StatusIcon = HourglassEmptyIcon;
  if (profile.role === "tenant") {
    approved = profile.tenantapprove;
    statusMessage = approved ? "✅ Access Approved" : "⏳ Waiting for Approval";
    statusColor = approved ? "success" : "warning";
    StatusIcon = approved ? CheckCircleIcon : HourglassEmptyIcon;
  } else if (profile.role === "admin") {
    approved = profile.adminapprove;
    statusMessage = approved ? "✅ Admin Rights Approved" : "⏳ Admin Approval Pending";
    statusColor = approved ? "success" : "warning";
    StatusIcon = approved ? CheckCircleIcon : HourglassEmptyIcon;
  } else if (profile.role === "master") {
    approved = profile.masterapprove;
    statusMessage = approved ? "✅ Master/Admin Approved" : "⏳ Master: Waiting Approval";
    statusColor = approved ? "success" : "warning";
    StatusIcon = approved ? CheckCircleIcon : HourglassEmptyIcon;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        bgcolor: "linear-gradient(135deg, #f9fafb 0%, #e0e7ff 60%, #e0f2fe 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "0.4s",
        overflow: "auto",
      }}
    >
      <Paper
        elevation={12}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
          position: "relative",
          bgcolor: "rgba(255,255,255,0.97)",
          boxShadow: "0 8px 32px 0 rgba(96, 165, 250,.27), 0 1.5px 16px 0 rgba(67,56,202,0.17)",
          animation: "bounce-in 0.7s"
        }}
      >
        <Typography variant="h4" fontWeight={500} mb={2} color="primary">
          👋 Hello, {profile.mobile}
        </Typography>
        <Chip
          icon={<StatusIcon />}
          label={statusMessage}
          color={statusColor}
          sx={{
            mb: 2,
            fontWeight: 500,
            fontSize: 15,
            animation: approved ? "blinker 2s linear infinite" : "none"
          }}
          size="medium"
          variant={approved ? "filled" : "outlined"}
        />
        <Typography variant="subtitle1" color="secondary" mb={1}>
          <b>Role:</b>{" "}
          <span
            style={{
              color:
                profile.role === "master"
                  ? "#a21caf"
                  : profile.role === "admin"
                  ? "#0ea5e9"
                  : "#059669",
              fontWeight: 600,
            }}
          >
            {profile.role.toUpperCase()}
          </span>
        </Typography>
        <Box display="flex" flexDirection="column" gap={1} mt={2}>
          <Typography style={{ color: "#059669" }}>
            Tenant Approved: <b>{String(profile.tenantapprove)}</b>
          </Typography>
          <Typography style={{ color: "#0ea5e9" }}>
            Admin Approved: <b>{String(profile.adminapprove)}</b>
          </Typography>
          <Typography style={{ color: "#a21caf" }}>
            Master Approved: <b>{String(profile.masterapprove)}</b>
          </Typography>
        </Box>
        <Button
          startIcon={<LogoutIcon />}
          variant="contained"
          sx={{
            mt: 4,
            bgcolor: "#b91c1c",
            "&:hover": { bgcolor: "#991b1b" },
            fontWeight: 700
          }}
          onClick={onLogout}
          fullWidth
        >
          LOGOUT
        </Button>
        {/* Bounce keyframe */}
        <style>
          {`
            @keyframes bounce-in {
              0% { transform: scale(0.7); opacity: 0; }
              55% { transform: scale(1.05); }
              70% { transform: scale(0.95);}
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes blinker {
              60% { opacity: 0.6; }
            }
          `}
        </style>
      </Paper>
    </Box>
  );
}