import React, { useState, useEffect, useCallback } from "react";
import {
  Container, Typography, Box, Button, CircularProgress, Link
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [midiUrl, setMidiUrl] = useState("");
  const [sheetUrl, setSheetUrl] = useState("");
  const [taskId, setTaskId] = useState(null);
  const [bpm, setBpm] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isWav = file.name.toLowerCase().endsWith(".wav") || file.type === "audio/wav";
    if (!isWav) {
      alert("현재는 WAV 파일만 업로드 가능합니다.");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setMidiUrl("");
    setSheetUrl("");
    setBpm(null);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/convert_midi/`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setTaskId(data.task_id);
    } catch (err) {
      console.error("❌ 업로드 실패:", err);
      alert("서버 오류 또는 네트워크 문제로 업로드에 실패했습니다.");
      setLoading(false);
    }
  };

  const checkResult = useCallback(async () => {
    if (!taskId) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/result/${taskId}`);
      const data = await res.json();

      if (data.status === "SUCCESS") {
        setMidiUrl(data.midi_url);
        setSheetUrl(data.sheet_url);
        setBpm(data.bpm || null);
        setLoading(false);
        setTaskId(null);
      } else if (data.status === "FAILURE") {
        setLoading(false);
        setTaskId(null);
        alert("MIDI 변환 실패. 다시 시도해주세요.");
      }
    } catch (err) {
      console.error("❌ 결과 확인 실패:", err);
      alert("서버 응답 오류. 다시 시도해주세요.");
      setLoading(false);
      setTaskId(null);
    }
  }, [taskId]);

  useEffect(() => {
    let interval;
    if (taskId) {
      interval = setInterval(() => {
        checkResult();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [taskId, checkResult]);

  return (
    <>
      <CustomAppBar />

      <main style={{ position: "relative" }}>
        <Container sx={{ py: 8 }} maxWidth="md">
          <Typography variant="h4" align="center" gutterBottom>
            Audio to MIDI AI
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 4 }}>
            반주 오디오 파일(wav)을 MIDI로 변환하여 다운로드하거나,<br />
            악보로 확인해 보세요.
          </Typography>

          <Box sx={{ mt: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Button
              variant="outlined"
              component="label"
              sx={{ mb: 2 }}
            >
              파일 선택
              <input
                type="file"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {selectedFile ? selectedFile.name : "선택된 파일 없음"}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={loading || !selectedFile}
              sx={{ width: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Converting...
                </>
              ) : (
                "Upload & Convert"
              )}
            </Button>
          </Box>

          {(midiUrl || sheetUrl) && (
            <Box mt={6} textAlign="center">
              {midiUrl && (
                <Box>
                  <Typography variant="h6" gutterBottom>MIDI 파일 다운로드</Typography>
                  <Link href={midiUrl} download target="_blank" rel="noopener">
                    <Button variant="outlined">MIDI 다운로드</Button>
                  </Link>
                </Box>
              )}

              {bpm && (
                <Typography variant="body1" sx={{ mt: 3 }}>
                  추정 BPM: <strong>{bpm}</strong>
                </Typography>
              )}

              {sheetUrl && (
                <Box mt={4}>
                  <Typography variant="h6" gutterBottom>악보 미리보기</Typography>
                  <iframe
                    src={sheetUrl}
                    width="100%"
                    height="600px"
                    title="악보 PDF 미리보기"
                    style={{ border: "1px solid #ccc" }}
                  />
                  <Button
                    variant="outlined"
                    sx={{ mt: 2 }}
                    href={sheetUrl}
                    download
                  >
                    악보 PDF 다운로드
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Container>

        {/* 서비스 준비중 오버레이 */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            bgcolor: "rgba(255, 255, 255, 1)", // 조금 더 투명하게 수정
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            p: 4,
          }}
        >
          <Box sx={{ maxWidth: 600 }}>
            <Typography variant="h4" gutterBottom>
              <br /> Audio to MIDI AI <br />
              서비스 준비중입니다
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              <br />음성, 음악, 비전 등 다양한 AI 서비스가 지속적으로 추가될 예정입니다.<br />
              서비스 제안이나 기능 관련 오류가 있을 경우,<br />
              <strong>taedyoverflow@gmail.com</strong> 으로 메일을 보내주세요.
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 5 }}>
            I am developing an AI-powered service that converts<br />
            accompaniment audio files into MIDI (sheet music) using the Basic Pitch model.<br />
            Various AI features—including voice, music, and vision—will continue to be added.<br />
            If you have service suggestions or need to report a bug,<br />
            please refer to the Contact email below.
            </Typography>
          </Box>
        </Box>
      </main>

      <Box sx={{ bgcolor: "background.paper", p: 6 }} component="footer">
        <Typography
          variant="body2"
          align="center"
          color="text.secondary"
          sx={{ fontSize: "0.875rem" }}
        >
          This service uses <strong>Basic Pitch</strong> for audio-to-MIDI conversion.<br />
          Basic Pitch is an open-source audio-to-MIDI conversion tool developed by Spotify.<br />
          It is powered by Spotify’s neural pitch detection model via a Python implementation.<br />
          The tool 'basic-pitch' is released under the MIT License.
          <br /><br />
          Contact: taedyoverflow@gmail.com
        </Typography>
        <Copyright />
      </Box>
    </>
  );
}
