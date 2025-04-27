import React, { useState } from 'react';
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import MusicIcon from "@mui/icons-material/QueueMusic";
import { useTheme, useMediaQuery } from '@mui/material';

function CustomAppBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        YASS AI
      </Typography>
      <List>
        <ListItem button component="a" href="/">
          <ListItemText primary="Spleeter / Demucs" />
        </ListItem>
        <ListItem button component="a" href="/tts">
          <ListItemText primary="edgeTTS" />
        </ListItem>
        <ListItem button component="a" href="/pitch">
          <ListItemText primary="BasicPitch" />
        </ListItem>
        <ListItem button component="a" href="/djing">
          <ListItemText primary="GrooVAE" />
        </ListItem>
      </List>
    </Box>
  );
    
  return (
    <AppBar position="sticky" color="inherit">
      <Toolbar>
        {isMobile ? (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        ) : (
          <MusicIcon sx={{ mr: 2 }} />
        )}
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          YASS AI
        </Typography>
        {!isMobile && (
          <Box sx={{ display: 'flex', flexGrow: 1, justifyContent: 'flex-end' }}>
            {/* <Button href="/" color="inherit">HOME</Button>
            <Button href="/separation" color="inherit">SEPARATION</Button>
            <Button href="/inference" color="inherit">INFERENCE</Button>*/}
            <Button href="/" color="inherit">Spleeter / Demucs</Button>
            <Button href="/tts" color="inherit">edgeTTS</Button>
            <Button href="/pitch" color="inherit">BasicPitch</Button>
            <Button href="/djing" color="inherit">GrooVAE</Button> 
          </Box>
        )}
      </Toolbar>
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          {drawer}
        </Drawer>
      )}
    </AppBar>
  );
}

export default CustomAppBar;