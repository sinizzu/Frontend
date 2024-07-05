import React from 'react';
import { CssBaseline, Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemText, Divider, Card, CardContent, CardActions, Button } from '@mui/material';

const drawerWidth = 240;

function App() {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Transformer in Transformer
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar />
        <Divider />
        <List>
          {['Search', 'Paper 1', 'Paper 2', 'Paper 3'].map((text, index) => (
            <ListItem button key={text}>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
      >
        <Toolbar />
        <Typography paragraph>
          Paper Search
        </Typography>
        {[1, 2, 3].map((value) => (
          <Card key={value} sx={{ minWidth: 275, mb: 2 }}>
            <CardContent>
              <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                Category: cs.CL
              </Typography>
              <Typography variant="h5" component="div">
                Towards Robust Speech Representation Learning for Thousands of Languages
              </Typography>
              <Typography sx={{ mb: 1.5 }} color="text.secondary">
                Authors: William Chen, Wangyou Zhang, ...
              </Typography>
              <Typography variant="body2">
                Self-supervised learning (SSL) has helped extend speech technologies...
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small">PDF 보기</Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Box>
  );
}

export default App;
