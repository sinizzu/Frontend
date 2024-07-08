import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, CssBaseline, Drawer, Box, Grid, List, ListItem, ListItemIcon } from '@mui/material';

function Header() {
    return (
        <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
            <Typography variant="h6" noWrap>
            Paper Insight
            </Typography>
        </Toolbar>
        </AppBar>
        </Box>
    );
}

export default Header