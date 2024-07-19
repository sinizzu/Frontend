import React from 'react';
import { List, ListItem, ListItemIcon, Tooltip } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import { Link } from 'react-router-dom';

function Menu() {
  const tooltipStyles = {
    tooltip: {
      fontSize: "0.9rem", // 툴팁 글자 크기
      backgroundColor: "rgba(125, 125, 125, 0.6)", // 툴팁 배경색
      color: 'white', // 툴팁 글자색
      padding: "8px 12px", // 툴팁 내부 여백
      maxWidth: "200px", // 툴팁 최대 너비
    },
    arrow: {
      color: "rgba(125, 125, 125, 0.6)", // 화살표 색상
    }
  };
  return (
    <List>
      <Tooltip title = "드라이브" placement="right" arrow 
              componentsProps={{
                tooltip: { sx: tooltipStyles.tooltip },
                arrow: { sx: tooltipStyles.arrow }
              }}
      >
      <ListItem button component={Link} to="/">
        <ListItemIcon>
          <CloudUploadIcon sx={{ fontSize: 40 }}/>
        </ListItemIcon>
      </ListItem>
      </Tooltip>

      <Tooltip title = "논문 검색" placement="right" arrow
              componentsProps={{
                tooltip: { sx: tooltipStyles.tooltip },
                arrow: { sx: tooltipStyles.arrow }
              }}>
      <ListItem button component={Link} to="/search">
        <ListItemIcon>
          <ManageSearchIcon sx={{ fontSize: 40 }}/>
        </ListItemIcon>
      </ListItem>
      </Tooltip>
    </List>
  );
}

export default Menu;
