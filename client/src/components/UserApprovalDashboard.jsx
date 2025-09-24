import React, { useEffect, useState } from "react";
import {
  Box, Typography, Paper, Checkbox, Chip, CircularProgress, Button, Grid
} from "@mui/material";
import axios from "axios";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

function ApprovalCheckbox({ label, checked, loading, onChange, color }) {
  return (
    <Chip
      label={label}
      variant={checked ? "filled" : "outlined"}
      color={checked ? color : "default"}
      icon={checked ? <CheckCircleIcon fontSize="small" /> : <HourglassEmptyIcon fontSize="small" />}
      onClick={onChange}
      sx={{
        cursor: "pointer",
        m: 0.4,
        transition: ".2s",
        fontWeight: 600,
        fontSize: 15,
        opacity: loading ? 0.7 : 1,
        animation: checked ? "blinker 2s linear infinite" : "none"
      }}
      clickable
      disabled={loading}
    />
  );
}

export default function UserApprovalDashboard({ onLogout }) {
  const [users, setUsers] = useState([]);
  const [loadingId, setLoadingId] = useState(null); // which user/approve is saving
  const [msg, setMsg] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("http://localhost:3000/api/admin/all-users", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => setUsers(res.data.users || []))
      .catch(err => setMsg("Failed to load users!"));
  }, [reload]);

  async function approveUser(user, approveType) {
    setLoadingId(user._id + approveType);
    setMsg("");
    const token = localStorage.getItem("token");
    let url = "";
    let body = { userId: user._id, value: nextValue };
    if (approveType === "tenant") url = "/api/admin/approvetenant";
    if (approveType === "admin") url = "/api/admin/approveadmin";
    if (approveType === "master") url = "/api/admin/approvemaster";
    try {
      await axios.post("http://localhost:3000" + url, body, {
        headers: { Authorization: "Bearer " + token }
      });
      setMsg((nextValue ? "Granted 🔐" : "Revoked 🔒" ) + " " + approveType + " for " + user.mobile);
      setReload(r => r + 1);
    } catch (e) {
      setMsg("Update failed: " + (e.response?.data?.msg || e.message));
    }
    setLoadingId(null);
  }

  const admins = users.filter(u => u.role === "admin" || u.role === "master");
  const tenants = users.filter(u => u.role === "tenant");

  return (
    <Box sx={{
      minHeight: "100vh", bgcolor: "linear-gradient(135deg, #f3f4f6 0%, #a5b4fc 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", px: 2
    }}>
      <Paper elevation={12} sx={{
        p: { xs: 2, md: 5 }, borderRadius: 4, maxWidth: 700, width: "100%",
        bgcolor: "rgba(255,255,255,0.97)", boxShadow: "0 8px 32px 0 #1e40af44",
        animation: "bounce-in 0.7s"
      }}>
        <Typography variant="h4" textAlign="center" fontWeight={700} mb={2} color="primary">
          Master User Approval Dashboard 🚦✨
        </Typography>
        {msg && <Typography textAlign="center" color="secondary" mb={2} fontWeight={600}>{msg}</Typography>}

        <Grid container spacing={4} mb={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" color="#0ea5e9" mb={1}>Admins</Typography>
            {admins.length === 0 && <Typography>No admins yet.</Typography>}
            {admins.map(user => (
              <Paper key={user._id} sx={{ mb: 2, p: 2, borderRadius: 3, bgcolor: "#eef2ff" }}>
                <Typography fontWeight="bold">
                  <span role="img" aria-label="id">🆔</span> {user.mobile}
                </Typography>
                <Typography fontSize={14} color="text.secondary">
                  Signup: {new Date(user.createdAt).toLocaleString()}
                </Typography>
                <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                  <ApprovalCheckbox
                    label="Admin Access"
                    checked={!!user.adminapprove}
                    loading={loadingId === user._id + "admin"}
                    onChange={() => approveUser(user, "admin", !user.adminapprove)}
                    color="info"
                  />
                  <ApprovalCheckbox
                    label="Master Access"
                    checked={!!user.masterapprove}
                    loading={loadingId === user._id + "master"}
                    onChange={() => approveUser(user, "master", !user.masterapprove)}
                    color="secondary"
                  />
                </Box>
              </Paper>
            ))}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" color="#059669" mb={1}>Tenants</Typography>
            {tenants.length === 0 && <Typography>No tenants yet.</Typography>}
            {tenants.map(user => (
              <Paper key={user._id} sx={{ mb: 2, p: 2, borderRadius: 3, bgcolor: "#e0f2fe" }}>
                <Typography fontWeight="bold"><span role="img" aria-label="id">🆔</span> {user.mobile}</Typography>
                <Typography fontSize={14} color="text.secondary">
                  Signup: {new Date(user.createdAt).toLocaleString()}
                </Typography>
                <Box mt={1}>
                  <ApprovalCheckbox
                    label="Tenant Access"
                    checked={!!user.tenantapprove}
                    loading={loadingId === user._id + "tenant"}
                    onChange={() => approveUser(user, "tenant", !user.tenantapprove)}
                    color="success"
                  />
                </Box>
              </Paper>
            ))}
          </Grid>
        </Grid>
        <Button
          variant="contained"
          color="error"
          sx={{ mt: 2, fontWeight: 700 }}
          onClick={onLogout}
          fullWidth
        >
          Logout
        </Button>
        <style>
          {`
            @keyframes bounce-in {
              0% { transform: scale(0.7); opacity: 0; }
              55% { transform: scale(1.05); }
              70% { transform: scale(0.95);}
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes blinker {
              60% { opacity: 0.4; }
            }
          `}
        </style>
      </Paper>
    </Box>
  );
}