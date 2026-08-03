import {
  Box,
  Typography,
  Skeleton,
  IconButton,
  Tooltip,
  Stack,
  Button,
  Checkbox,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import StorageIcon from "@mui/icons-material/Storage";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useEffect, useState } from "react";
import { open as openExternal } from "@tauri-apps/plugin-shell";

import ServiceRow from "../components/ServiceRow";

import { getServices, serviceAction } from "../services/service";

import { parseServices } from "../services/parser";

import { invoke } from "@tauri-apps/api/core";

const tokens = {
  bg: "#F6F7F9",
  border: "#232B36",
  text: "#1A1F26",
  textMuted: "#7C8896",
  running: "#3ECF8E",
  stopped: "#FF6B6B",
  accent: "#3ECF8E",
  mono: '"IBM Plex Mono", "JetBrains Mono", "SFMono-Regular", Menlo, monospace',
  sans: '"Inter", "Helvetica Neue", Arial, sans-serif',
};

const MIN_REFRESH_MS = 600;

// Adjust to match wherever phpMyAdmin is actually served in your environment.
const PHPMYADMIN_URL = "http://localhost:8080/phpmyadmin/";

// Adjust to match wherever your PHP projects live on disk.
const PHP_FOLDER_PATH = "/opt/homebrew/var/www";

export default function Dashboard() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pmaOpening, setPmaOpening] = useState(false);
  const [folderOpening, setFolderOpening] = useState(false);

  const loadServices = async () => {
    const data = await getServices();
    const result = parseServices(data);
    setServices(result);
    setLoading(false);
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    const start = Date.now();
    try {
      await loadServices();
    } finally {
      const wait = Math.max(0, MIN_REFRESH_MS - (Date.now() - start));
      setTimeout(() => setRefreshing(false), wait);
    }
  };

  const handleAction = async (service: string, action: string) => {
    setPendingActions((prev) => new Set(prev).add(service));
    try {
      await serviceAction(service, action);
      setTimeout(async () => {
        await loadServices();
        setPendingActions((prev) => {
          const next = new Set(prev);
          next.delete(service);
          return next;
        });
      }, 1000);
    } catch (err) {
      console.error(err);
      setPendingActions((prev) => {
        const next = new Set(prev);
        next.delete(service);
        return next;
      });
    }
  };

  const handleBulkAction = async (
    action: "start" | "stop",
    targetNames: string[],
  ) => {
    const targets = services.filter((s) => {
      if (!targetNames.includes(s.name)) return false;
      const isRunning = s.status === "started";
      return action === "start" ? !isRunning : isRunning;
    });

    if (targets.length === 0) return;

    setPendingActions((prev) => {
      const next = new Set(prev);
      targets.forEach((s) => next.add(s.name));
      return next;
    });

    try {
      await Promise.all(targets.map((s) => serviceAction(s.name, action)));
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(async () => {
        await loadServices();
        setPendingActions((prev) => {
          const next = new Set(prev);
          targets.forEach((s) => next.delete(s.name));
          return next;
        });
      }, 1000);
    }
  };

  const handleOpenPhpMyAdmin = async () => {
    setPmaOpening(true);
    setTimeout(() => setPmaOpening(false), 500);
    try {
      // Requires the "shell:allow-open" permission (scoped to this URL)
      // in your Tauri capabilities file — see src-tauri/capabilities/*.json
      await openExternal(PHPMYADMIN_URL);
    } catch (err) {
      console.error("Failed to open phpMyAdmin:", err);
    }
  };

  const handleOpenPhpFolder = async () => {
    setFolderOpening(true);
    setTimeout(() => setFolderOpening(false), 500);
    try {
      await invoke("open_php_folder", { path: PHP_FOLDER_PATH });
    } catch (err) {
      console.error("Failed to open PHP folder:", err);
    }
  };

  const toggleSelect = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const allSelected = services.length > 0 && selected.size === services.length;
  const someSelected = selected.size > 0 && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(services.map((s) => s.name)));
  };

  const runningCount = services.filter((s) => s.status === "started").length;
  const stoppedCount = services.length - runningCount;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: tokens.bg,
        px: { xs: 3, sm: 6 },
        py: 6,
      }}
    >
      <Typography
        sx={{
          fontFamily: tokens.mono,
          fontSize: 12,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: tokens.textMuted,
          mb: 1,
        }}
      >
        System status
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          rowGap: 1.5,
          mb: 1.5,
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontFamily: tokens.sans, fontWeight: 700, color: tokens.text }}
        >
          Services
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Button
            onClick={handleOpenPhpFolder}
            startIcon={<FolderOpenIcon sx={{ fontSize: 17 }} />}
            sx={{
              fontFamily: tokens.sans,
              fontSize: 12.5,
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
              px: 1.75,
              py: 0.85,
              border: `1px solid ${folderOpening ? tokens.accent : tokens.border}`,
              color: folderOpening ? tokens.accent : tokens.text,
              bgcolor: folderOpening
                ? "rgba(62, 207, 142, 0.08)"
                : "transparent",
              transition:
                "border-color 150ms ease, color 150ms ease, background-color 150ms ease",
              "&:hover": {
                bgcolor: tokens.border,
                color: "#FFFFFF",
              },
            }}
          >
            {folderOpening ? "Opening…" : "Open PHP Folder"}
          </Button>

          <Button
            onClick={handleOpenPhpMyAdmin}
            startIcon={<StorageIcon sx={{ fontSize: 17 }} />}
            endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
            sx={{
              fontFamily: tokens.sans,
              fontSize: 12.5,
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
              px: 1.75,
              py: 0.85,
              border: `1px solid ${pmaOpening ? tokens.accent : tokens.border}`,
              color: pmaOpening ? tokens.accent : tokens.text,
              bgcolor: pmaOpening ? "rgba(62, 207, 142, 0.08)" : "transparent",
              transition:
                "border-color 150ms ease, color 150ms ease, background-color 150ms ease",
              "&:hover": {
                bgcolor: tokens.border,
                color: "#FFFFFF",
              },
            }}
          >
            {pmaOpening ? "Opening…" : "phpMyAdmin"}
          </Button>

          <Tooltip title={refreshing ? "Refreshing…" : "Refresh"}>
            <span>
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing || loading}
                sx={{
                  border: `1px solid ${refreshing ? tokens.accent : tokens.border}`,
                  borderRadius: 2,
                  color: refreshing ? tokens.accent : tokens.text,
                  bgcolor: refreshing
                    ? "rgba(62, 207, 142, 0.08)"
                    : "transparent",
                  transition:
                    "border-color 150ms ease, color 150ms ease, background-color 150ms ease",
                  "&:hover": {
                    bgcolor: tokens.border,
                    color: "#FFFFFF",
                  },
                }}
              >
                <RefreshIcon
                  sx={{
                    fontSize: 20,
                    animation: refreshing
                      ? "spin 0.7s linear infinite"
                      : "none",
                    "@keyframes spin": {
                      from: { transform: "rotate(0deg)" },
                      to: { transform: "rotate(360deg)" },
                    },
                  }}
                />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Box>

      <Typography
        sx={{
          fontFamily: tokens.mono,
          fontSize: 13,
          color: tokens.textMuted,
          mb: 3,
        }}
      >
        {loading ? (
          "checking services…"
        ) : refreshing ? (
          "refreshing…"
        ) : services.length === 0 ? (
          "no services configured"
        ) : (
          <>
            {services.length} total{"  ·  "}
            <Box component="span" sx={{ color: tokens.running }}>
              {runningCount} running
            </Box>
            {"  ·  "}
            <Box component="span" sx={{ color: tokens.stopped }}>
              {stoppedCount} stopped
            </Box>
          </>
        )}
      </Typography>

      {loading ? (
        <Stack spacing={1.5}>
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={56}
              sx={{ bgcolor: tokens.border, borderRadius: 2 }}
            />
          ))}
        </Stack>
      ) : services.length === 0 ? (
        <Box
          sx={{
            border: `1px dashed ${tokens.border}`,
            borderRadius: 3,
            py: 8,
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: tokens.mono,
              fontSize: 13,
              color: tokens.textMuted,
            }}
          >
            Nothing to show yet — add a service to get started.
          </Typography>
        </Box>
      ) : (
        <Stack
          spacing={1.25}
          sx={{
            opacity: refreshing ? 0.55 : 1,
            transition: "opacity 150ms ease",
          }}
        >
          <Box
            sx={{
              border: `1px solid ${tokens.border}`,
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: "#FFFFFF",
              opacity: refreshing ? 0.55 : 1,
              transition: "opacity 150ms ease",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                rowGap: 1,
                columnGap: 1.5,
                px: 2,
                py: 1.5,
                borderBottom: `1px solid ${tokens.border}`,
                bgcolor: tokens.bg,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ flexShrink: 0 }}
              >
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleSelectAll}
                  size="small"
                  sx={{
                    p: 0.5,
                    color: tokens.border,
                    "&.Mui-checked": { color: tokens.text },
                    "&.MuiCheckbox-indeterminate": { color: tokens.text },
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: tokens.mono,
                    fontSize: 12,
                    color: tokens.textMuted,
                    whiteSpace: "nowrap",
                  }}
                >
                  {selected.size > 0
                    ? `${selected.size} selected`
                    : "select all"}
                </Typography>
              </Stack>

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
                sx={{ rowGap: 1 }}
              >
                <Button
                  disabled={selected.size === 0}
                  onClick={() =>
                    handleBulkAction("start", Array.from(selected))
                  }
                  sx={{
                    fontFamily: tokens.sans,
                    fontSize: 12.5,
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: 1.5,
                    px: 1.75,
                    border: `1px solid ${tokens.running}`,
                    color: tokens.running,
                    "&:hover": { bgcolor: "rgba(62, 207, 142, 0.08)" },
                    "&.Mui-disabled": {
                      color: tokens.textMuted,
                      borderColor: tokens.border,
                    },
                  }}
                >
                  Start selected
                </Button>
                <Button
                  disabled={selected.size === 0}
                  onClick={() => handleBulkAction("stop", Array.from(selected))}
                  sx={{
                    fontFamily: tokens.sans,
                    fontSize: 12.5,
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: 1.5,
                    px: 1.75,
                    border: `1px solid ${tokens.stopped}`,
                    color: tokens.stopped,
                    "&:hover": { bgcolor: "rgba(255, 107, 107, 0.08)" },
                    "&.Mui-disabled": {
                      color: tokens.textMuted,
                      borderColor: tokens.border,
                    },
                  }}
                >
                  Stop selected
                </Button>

                <Box
                  sx={{
                    width: "1px",
                    height: 22,
                    bgcolor: tokens.border,
                    mx: 0.5,
                  }}
                />

                <Button
                  onClick={() =>
                    handleBulkAction(
                      "start",
                      services.map((s) => s.name),
                    )
                  }
                  sx={{
                    fontFamily: tokens.sans,
                    fontSize: 12.5,
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: 1.5,
                    px: 1.75,
                    bgcolor: tokens.running,
                    color: "#0B0F14",
                    "&:hover": { bgcolor: "#35B87D" },
                  }}
                >
                  Start all
                </Button>
                <Button
                  onClick={() =>
                    handleBulkAction(
                      "stop",
                      services.map((s) => s.name),
                    )
                  }
                  sx={{
                    fontFamily: tokens.sans,
                    fontSize: 12.5,
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: 1.5,
                    px: 1.75,
                    border: `1px solid ${tokens.stopped}`,
                    color: tokens.stopped,
                    "&:hover": { bgcolor: "rgba(255, 107, 107, 0.08)" },
                  }}
                >
                  Stop all
                </Button>
              </Stack>
            </Box>

            <Box
              sx={{
                "& > *:not(:last-child)": {
                  borderBottom: `1px solid ${tokens.border}`,
                },
              }}
            >
              {services.map((item) => (
                <ServiceRow
                  key={item.name}
                  name={item.name}
                  status={item.status === "started" ? "🟢 Running" : "🔴 Stop"}
                  onAction={handleAction}
                  isLoading={pendingActions.has(item.name)}
                  selected={selected.has(item.name)}
                  onToggleSelect={toggleSelect}
                />
              ))}
            </Box>
          </Box>
        </Stack>
      )}
    </Box>
  );
}
