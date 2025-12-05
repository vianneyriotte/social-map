'use client';

import { Typography, Box } from '@mui/material';
import versionData from '@/version.json';

export default function VersionDisplay() {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 8,
        left: 8,
        zIndex: 1000,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          opacity: 0.7,
          fontSize: '0.65rem',
        }}
      >
        v{versionData.version}
      </Typography>
    </Box>
  );
}
