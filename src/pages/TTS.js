import React, { useState, useEffect, useCallback } from "react";
import {
  Container, Typography, Box, Button, Select, MenuItem,
  TextField, Link, FormControl, InputLabel
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
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [taskId, setTaskId] = useState(null);
  const [resultAudio, setResultAudio] = useState('');
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState('');
  const containsKorean = (text) => /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(text);
  const containsEnglish = (text) => /[a-zA-Z]/.test(text);
  const [textError, setTextError] = useState('');

  const languageOptions = [
    { label: "한국어", value: "ko" },
    { label: "영어", value: "en" },
  ];

  const checkResult = useCallback(async () => {
    if (!taskId) return;
  
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/result/${taskId}`);
      const data = await res.json();
  
      if (data.url) {
        setResultAudio(data.url);
        setPolling(false);
        console.log("TTS URL 직접 사용");
      }
    } catch (err) {
      setError("TTS 결과 확인 실패");
      console.error(err);
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
    setError('');
    setResultAudio('');
  
    if (!text.trim() && !selectedLanguage) {
      alert("텍스트를 입력하고 언어를 선택해주세요.");
      return;
    }
  
    if (!text.trim()) {
      alert("텍스트를 입력해주세요.");
      return;
    }
  
    if (!selectedLanguage) {
      alert("언어를 선택해주세요.");
      return;
    }
  
    // 텍스트 길이 유효성 검사 추가
    if (text.length > 1000) {
      alert("텍스트는 1000자 이내로 입력해주세요.");
      return;
    }
  
    // 언어 불일치 유효성 검사
    const isKorean = selectedLanguage === "ko";
    const isEnglish = selectedLanguage === "en";
  
    if (isKorean && containsEnglish(text)) {
      alert("선택한 언어가 한국어입니다. 텍스트에 영어가 포함되어 있으면 안 됩니다.");
      return;
    }
  
    if (isEnglish && containsKorean(text)) {
      alert("선택한 언어가 영어입니다. 텍스트에 한글이 포함되어 있으면 안 됩니다.");
      return;
    }
  
    setLoading(true);
  
    const formData = new URLSearchParams();
    formData.append('text', text);
    formData.append('lang', selectedLanguage);
  
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
      console.error(err);
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
          <Typography variant="h4" gutterBottom align="center">Text-to-Speech AI <br/>텍스트를 음성으로 변환</Typography>

          <Box sx={{ width: '100%', maxWidth: 400, mt: 2 }}>
            <TextField
              label="Enter Text"
              value={text}
              onChange={(e) => {
                const input = e.target.value;
                setText(input);

                if (input.length > 1000) {
                  setTextError(`현재 ${input.length}자 입력됨 (최대 1000자까지 가능)`);
                } else {
                  setTextError('');
                }
              }}
              margin="normal"
              fullWidth
              multiline
              rows={4}
              error={Boolean(textError)}
              helperText={textError || `${text.length}/1000`}
              sx={{
                '& .MuiInputBase-root textarea': {
                  resize: 'vertical'
                }
              }}
            />
          </Box>

          <FormControl fullWidth sx={{ mt: 2, width: '100%', maxWidth: 400 }}>
            <InputLabel>Language</InputLabel>
            <Select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              displayEmpty
            >
              {languageOptions.map((opt, i) => (
                <MenuItem key={i} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
            <Typography variant="body2" sx={{ mt: 1 }}>
              언어를 선택해주세요.
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
                {/* <CircularProgress size={20} sx={{ mr: 1 }} /> */}
                Generating...
              </>
            ) : (
              'Generate Speech'
            )}
          </Button>


          {resultAudio && (
            <Box mt={4} textAlign="center">
              <Typography variant="h6">Generated Audio</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                변환된 음성은 최대 5분 동안 스트리밍하거나 다운로드 받으실 수 있습니다.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <audio controls src={resultAudio}></audio>
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
        <Typography variant="body2" align="center" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
          This service uses <strong>gTTS</strong> (Google Text-to-Speech) for text-to-speech synthesis.<br />
          gTTS is a Python library that interfaces with Google Translate's text-to-speech API.<br />
          The library 'gTTS' is released under the MIT License.<br /><br />

          Contact: taedyoverflow@gmail.com
        </Typography>
        <Copyright />
      </Box>
    </>
  );
}