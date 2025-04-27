import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Home from "./pages/Home";
// import SignIn from "./pages/SignIn";
// import Produce from "./pages/Produce";
// import Separation from "./pages/Separation";
// import Inference from "./pages/Inference";
import DJing from "./pages/DJing";
import TTS from "./pages/TTS";
import Download from "./pages/Download"

import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import BasicPitch from "./pages/BasicPitch";

function App() {
  // TODO remove, this demo shouldn't need to reset the theme.
  const defaultTheme = createTheme({
  typography: {
    fontFamily: 'MyFont, sans-serif',
  },
});
  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* <Route path="/produce" element={<Produce />} /> */}
          {/* <Route path="/signin" element={<SignIn />} /> */}
          {/* <Route path="/" element={<Home />} /> */}
          {/* <Route path="/separation" element={<Separation />} /> */}
          <Route path="/djing" element={<DJing />} />
          <Route path="/pitch" element={<BasicPitch />} /> */
          <Route path="/tts" element={<TTS />} />
          <Route path="/" element={<Download />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
