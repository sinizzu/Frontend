import React from 'react';
import { List, ListItem, ListItemIcon } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ChatIcon from '@mui/icons-material/Chat';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import BookIcon from '@mui/icons-material/Book';
import KeyIcon from '@mui/icons-material/Key';
import { Link } from 'react-router-dom';

function Menu() {
  return (
    <List>
      <ListItem button component={Link} to="/">
        <ListItemIcon>
          <CloudUploadIcon sx={{ fontSize: 40 }}/>
        </ListItemIcon>
      </ListItem>
      <ListItem button component={Link} to="/chatbot">
        <ListItemIcon>
          <ChatIcon sx={{ fontSize: 40 }}/>
        </ListItemIcon>
      </ListItem>
      <ListItem button component={Link} to="/search">
        <ListItemIcon>
          <ManageSearchIcon sx={{ fontSize: 40 }}/>
        </ListItemIcon>
      </ListItem>
      <ListItem button component={Link} to="/paper">
        <ListItemIcon>
          <BookIcon sx={{ fontSize: 40 }}/>
        </ListItemIcon>
      </ListItem>
      <ListItem button component={Link} to="/keyword">
        <ListItemIcon>
          <KeyIcon sx={{ fontSize: 40 }}/>
        </ListItemIcon>
      </ListItem>
    </List>
  );
}

export default Menu;
