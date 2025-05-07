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
            GrooVAE AI 비트 메이커<br />
            리얼 드러머 감성의 드럼 비트를 AI로 생성하고,<br />
            다양한 음악과 믹싱해보세요.
          </Typography>

          <Box mt={4} textAlign="center">
            <Typography variant="h6" sx={{ mb: 3 }}>서비스 준비중입니다.</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            음성, 음악, 비전 등 다양한 AI 서비스가 지속적으로 추가될 예정입니다.<br />
            서비스 제안이나 기능 관련 오류가 있을 경우,<br />
            taedyoverflow@gmail.com 으로 메일을 보내주세요.<br /><br /><br />

            I am developing an AI-powered service that generates<br />
            natural drum beats from scratch using the GrooVAE model.<br />
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
          This service uses <strong>GrooVAE</strong> for AI-powered drum beat generation.<br />
          GrooVAE is an open-source model developed by Google's Magenta project.<br />
          Powered by a neural variational autoencoder architecture for realistic rhythm creation.<br />
          The tool 'GrooVAE' is released under the Apache 2.0 License.<br /><br />
          Contact: taedyoverflow@gmail.com
        </Typography>
        <Copyright />
      </Box>
    </>
  );
}