import React, { useState, useEffect, useCallback } from "react";
import {
  Container, Typography, Box, Button, Select, MenuItem,
  TextField, CircularProgress, Link, FormControl, InputLabel
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

export default function TTS() {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [taskId, setTaskId] = useState(null);
  const [resultAudio, setResultAudio] = useState('');
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState('');

  const voiceOptions = [
    { label: "한국어(남성)", value: "ko-KR-InJoonNeural" },
    { label: "한국어(여성)", value: "ko-KR-SunHiNeural" },
    { label: "영어(남성)", value: "en-US-AndrewNeural" },
    { label: "영어(여성)", value: "en-US-AvaNeural" },
  ];

  const checkResult = useCallback(async () => {
    if (!taskId) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/result/${taskId}`);
      const data = await res.json();
      if (data.url) {
        const audioRes = await fetch(data.url);
        const contentType = audioRes.headers.get("Content-Type");

        if (!contentType || !contentType.includes("audio")) {
          throw new Error("응답이 오디오 형식이 아닙니다.");
        }

        const audioBlob = await audioRes.blob();
        const blobUrl = URL.createObjectURL(audioBlob);

        // 💡 렌더링 안정화를 위한 약간의 지연
        setTimeout(() => {
          setResultAudio(blobUrl);
        }, 100);

        setPolling(false);
      }
    } catch (err) {
      console.error("❌ TTS 결과 확인 실패:", err);
      setError("TTS 결과 확인 실패");
      setPolling(false);
    }
  }, [taskId]);

  useEffect(() => {
    let interval;
    if (polling) {
      interval = setInterval(() => {
        checkResult();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [polling, checkResult]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setResultAudio('');

    const formData = new URLSearchParams();
    formData.append('text', text);
    formData.append('voice', selectedVoice);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/tts/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });

      const data = await response.json();
      setTaskId(data.task_id);
      setPolling(true);
    } catch (err) {
      console.error("❌ TTS 요청 실패:", err);
      setError("TTS 요청 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CustomAppBar />
      <main>
        <Container sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }} maxWidth="md">
          <Typography variant="h4" gutterBottom align="center">
            Text-to-Speech AI <br />텍스트를 음성으로 변환
          </Typography>

          <Box sx={{ width: '100%', maxWidth: 400, mt: 2 }}>
            <TextField
              label="Enter Text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              margin="normal"
              fullWidth
              multiline
              rows={4}
            />
          </Box>

          <FormControl fullWidth sx={{ mt: 2, width: '100%', maxWidth: 400 }}>
            <InputLabel>TTS Voice</InputLabel>
            <Select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              displayEmpty
            >
              {voiceOptions.map((opt, i) => (
                <MenuItem key={i} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
            <Typography variant="body2" sx={{ mt: 1 }}>
              언어와 성별을 정해주세요.
            </Typography>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || polling}
            sx={{ mt: 3, mb: 2, width: '48%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {(loading || polling) ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Generating...
              </>
            ) : (
              'Generate Speech'
            )}
          </Button>

          {resultAudio && (
            <Box mt={4} textAlign="center">
              <Typography variant="h6">Generated Audio</Typography>
              <Box sx={{ mt: 2 }}>
                <audio key={resultAudio} controls src={resultAudio}></audio>
                <br />
                <a href={resultAudio} download="tts_result.wav">
                  <Button variant="outlined" sx={{ mt: 1 }}>
                    Download TTS
                  </Button>
                </a>
              </Box>
            </Box>
          )}

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Container>
      </main>

      <Box sx={{ bgcolor: "background.paper", p: 6 }} component="footer">
        <Typography
          variant="body2"
          align="center"
          color="text.secondary"
          sx={{ fontSize: "0.875rem" }}
        >
          This service uses Edge TTS (unofficial) for text-to-speech synthesis.<br />
          It is powered by Microsoft Edge’s neural voices through an open-source Python wrapper.<br />
          The tool 'edge-tts' is released under the MIT License.<br />
          Source: https://github.com/rany2/edge-tts <br />
          Contact: taedyoverflow@gmail.com
        </Typography>
        <Copyright />
      </Box>
    </>
  );
}
