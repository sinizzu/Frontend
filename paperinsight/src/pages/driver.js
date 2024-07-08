import React, { useState } from 'react';
import { Container, Paper, Typography, Box, TextField, Select, MenuItem, FormControl } from '@mui/material';

function Home() {
  return (
    <Box sx={{ height: '100vh', overflow: 'auto', borderRight: '1px solid #ccc', pr: 2 }}>
      <h1>Drive</h1>
      <Container sx={{ pl: '0px !important', pr: '0px !important', m: '0px !important' }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ fontSize: '14px' }}>lalala</Typography>
          </Paper>
      </Container>
    </Box>
  );
}

export default Home;
