import React from 'react';
import Button from '@mui/material/Button';
import { Log } from '../logger/logger';

export default function LoggerButton() {
  const handleClick = () => {
    Log("frontend", "info", "component", "User clicked the log button");
  };

  return (
    <Button variant="contained" onClick={handleClick}>
      Click to Log (Frontend)
    </Button>
  );
}
