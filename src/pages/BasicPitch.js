import React from "react";
import {
  Container, Typography, Box, Link
} from "@mui/material";
import CustomAppBar from "../components/CustomAppbar";

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="/">YASS AI</Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

export default function BasicPitch() {
  return (
    <>
      <CustomAppBar />
      <main>
        <Container sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }} maxWidth="md">
          <Typography variant="h4" gutterBottom align="center">
            Basic Pitch AI<br />
            반주 파일을 미디(악보)로 변환
          </Typography>

          <Box mt={4} textAlign="center">
            <Typography variant="h6">서비스 준비중입니다.</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            음성, 음악, 비전 등 다양한 AI 서비스가 지속적으로 추가될 예정입니다.<br />
            서비스 제안이나 기능 오류 등 운영자와의 연락이 필요한 경우,<br />
            아래의 Contact 이메일을 참고해 주세요.<br /><br />

            I am developing an AI-powered service that converts<br />
            accompaniment audio files into MIDI (sheet music) using the Basic Pitch model.<br />
            Various AI features—including voice, music, and vision—will continue to be added.<br />
            If you have service suggestions or need to report a bug,<br />
            please refer to the Contact email below.
            </Typography>
          </Box>
        </Container>
      </main>

      <Box sx={{ bgcolor: "background.paper", p: 6 }} component="footer">
        <Typography 
          variant="body2"
          align="center" 
          color="text.secondary"
          sx={{ fontSize: "0.875rem" }}
        >
          This service uses Basic Pitch (open-source) for audio-to-MIDI conversion.<br />
          It is powered by Spotify’s neural pitch detection model via a Python implementation.<br />
          The tool 'basic-pitch' is released under the MIT License.<br />
          Source: https://github.com/spotify/basic-pitch <br /><br />
          Contact: taedyoverflow@gmail.com
        </Typography>
        <Copyright />
      </Box>
    </>
  );
}
