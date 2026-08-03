import {
  Box,
  Typography,
  Button,
  Stack,
  Checkbox,
  CircularProgress,
  keyframes,
} from "@mui/material";

type Props = {
  name: string;
  status: string;
  onAction: (service: string, action: string) => void;
  isLoading?: boolean;
  selected?: boolean;
  onToggleSelect?: (name: string) => void;
};

const tokens = {
  bg: "#FFFFFF",
  border: "#E4E7EC",
  hoverBg: "#F6F7F9",
  text: "#1A1F26",
  textMuted: "#7C8896",
  running: "#3ECF8E",
  runningGlow: "rgba(62, 207, 142, 0.55)",
  stopped: "#FF6B6B",
  stoppedGlow: "rgba(255, 107, 107, 0.45)",
  mono: '"IBM Plex Mono", "JetBrains Mono", "SFMono-Regular", Menlo, monospace',
  sans: '"Inter", "Helvetica Neue", Arial, sans-serif',
};

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 ${tokens.runningGlow}; }
  70% { box-shadow: 0 0 0 8px rgba(62, 207, 142, 0); }
  100% { box-shadow: 0 0 0 0 rgba(62, 207, 142, 0); }
`;

export default function ServiceRow({
  name,
  status,
  onAction,
  isLoading = false,
  selected = false,
  onToggleSelect,
}: Props) {
  const running = status.includes("🟢");
  const statusLabel =
    status.replace(/[🟢🔴]/g, "").trim() || (running ? "running" : "stopped");

  const startIsActionable = !running;
  const stopIsActionable = running;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        bgcolor: tokens.bg,
        px: 2,
        py: 1.25,
        opacity: isLoading ? 0.85 : 1,
        transition: "background-color 120ms ease, opacity 150ms ease",
        "&:hover": { bgcolor: tokens.hoverBg },
      }}
    >
      <Checkbox
        checked={selected}
        onChange={() => onToggleSelect?.(name)}
        size="small"
        sx={{
          p: 0.5,
          color: tokens.border,
          "&.Mui-checked": { color: tokens.text },
        }}
      />

      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: running ? tokens.running : tokens.stopped,
          boxShadow: running
            ? `0 0 6px 1px ${tokens.runningGlow}`
            : `0 0 6px 1px ${tokens.stoppedGlow}`,
          animation: running ? `${pulse} 2.2s ease-out infinite` : "none",
          flexShrink: 0,
        }}
      />

      <Typography
        sx={{
          fontFamily: tokens.mono,
          fontSize: 15,
          fontWeight: 600,
          color: tokens.text,
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </Typography>

      <Typography
        sx={{
          fontFamily: tokens.mono,
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: running ? tokens.running : tokens.stopped,
          minWidth: 90,
          flexShrink: 0,
        }}
      >
        {isLoading ? "updating…" : statusLabel}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
        <Button
          disableElevation
          disabled={running || isLoading}
          onClick={() => onAction(name, "start")}
          sx={{
            fontFamily: tokens.sans,
            fontSize: 12.5,
            fontWeight: 600,
            textTransform: "none",
            borderRadius: 1.5,
            px: 1.75,
            py: 0.5,
            minWidth: 72,
            bgcolor: running ? "transparent" : tokens.running,
            color: running ? tokens.textMuted : "#0B0F14",
            border: `1px solid ${running ? tokens.border : tokens.running}`,
            "&:hover": { bgcolor: running ? tokens.border : "#35B87D" },
            "&.Mui-disabled": {
              color: tokens.textMuted,
              borderColor: tokens.border,
              bgcolor:
                startIsActionable && isLoading ? tokens.running : "transparent",
              opacity: startIsActionable && isLoading ? 0.6 : 1,
            },
          }}
        >
          {isLoading && startIsActionable ? (
            <CircularProgress
              size={14}
              thickness={5}
              sx={{ color: "#0B0F14" }}
            />
          ) : (
            "Start"
          )}
        </Button>

        <Button
          disableElevation
          disabled={!running || isLoading}
          onClick={() => onAction(name, "stop")}
          sx={{
            fontFamily: tokens.sans,
            fontSize: 12.5,
            fontWeight: 600,
            textTransform: "none",
            borderRadius: 1.5,
            px: 1.75,
            py: 0.5,
            minWidth: 72,
            bgcolor: "transparent",
            color: running ? tokens.stopped : tokens.textMuted,
            border: `1px solid ${running ? tokens.stopped : tokens.border}`,
            "&:hover": {
              bgcolor: running ? "rgba(255, 107, 107, 0.08)" : "transparent",
              borderColor: running ? tokens.stopped : tokens.border,
            },
            "&.Mui-disabled": {
              color:
                stopIsActionable && isLoading
                  ? tokens.stopped
                  : tokens.textMuted,
              borderColor:
                stopIsActionable && isLoading ? tokens.stopped : tokens.border,
              opacity: stopIsActionable && isLoading ? 0.6 : 1,
            },
          }}
        >
          {isLoading && stopIsActionable ? (
            <CircularProgress
              size={14}
              thickness={5}
              sx={{ color: tokens.stopped }}
            />
          ) : (
            "Stop"
          )}
        </Button>
      </Stack>
    </Box>
  );
}
