import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Container, Typography, Box, Button, Link
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
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState(null);

  const intervalCheckRef = useRef(null);
  const intervalCountdownRef = useRef(null);
  const retryCountRef = useRef(0);

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

  const clearIntervals = () => {
    if (intervalCheckRef.current) clearInterval(intervalCheckRef.current);
    if (intervalCountdownRef.current) clearInterval(intervalCountdownRef.current);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setEstimatedTimeLeft(300); // 300초

    // ✅ 버튼 누르자마자 카운트다운 시작
    clearInterval(intervalCountdownRef.current);
    intervalCountdownRef.current = setInterval(() => {
      setEstimatedTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    setMidiUrl("");
    setSheetUrl("");
    setBpm(null);
    retryCountRef.current = 0;

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
      alert("Upload failed due to server error or network problem.");
      setLoading(false);
      setEstimatedTimeLeft(null);
      clearIntervals(); // 실패 시 타이머 정리
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
        setEstimatedTimeLeft(null);
        clearIntervals();
      } else if (data.status === "FAILURE") {
        setLoading(false);
        setTaskId(null);
        setEstimatedTimeLeft(null);
        clearIntervals();
        alert(data.reason || "MIDI 변환 실패. 다시 시도해주세요.");
      }
      
    } catch (err) {
      console.error("❌ 결과 확인 실패:", err);
      setLoading(false);
      setTaskId(null);
      setEstimatedTimeLeft(null);
      clearIntervals();
      alert("서버 응답 오류. 다시 시도해주세요.");
    }
  }, [taskId]);

  useEffect(() => {
    if (taskId) {
      retryCountRef.current = 0;

      intervalCheckRef.current = setInterval(() => {
        retryCountRef.current += 1;
        if (retryCountRef.current >= 60) { // 5초 간격 × 60번 = 300초
          setLoading(false);
          setTaskId(null);
          setEstimatedTimeLeft(null);
          clearIntervals();
          alert("The task is taking longer than expected. Please try again later.");
          return;
        }
        checkResult();
      }, 5000);
    }

    return () => {
      clearIntervals();
    };
  }, [taskId, checkResult]);

  return (
    <>
      <CustomAppBar />

      <main style={{ position: "relative" }}>
        <Container sx={{ py: 8 }} maxWidth="md">
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 2 }}>
            Beta 서비스 안내: <br />
            현재 변환 정확도가 완벽하지 않을 수 있습니다. <br />
            지속적으로 개선 및 유지보수 중입니다.<br/><br />
          </Typography>

          <Typography variant="h4" align="center" gutterBottom>
            Audio to MIDI AI
          </Typography>

          <Typography variant="body1" align="center" sx={{ mb: 4 }}>
            반주 오디오 파일(WAV)을 MIDI로 변환하여 다운로드하거나,<br />
            악보로 미리보기를 할 수 있습니다.
          </Typography>

          <Box sx={{ mt: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Button
              variant="outlined"
              component="label"
              sx={{ mb: 2 }}
            >
              Upload File
              <input
                type="file"
                hidden
                onChange={handleFileChange}
              />
            </Button>

            <Typography variant="body2" sx={{ mb: 2 }}>
              {selectedFile ? selectedFile.name : "No file selected"}
            </Typography>

            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={loading || !selectedFile}
              sx={{ width: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}
            >
              {loading ? (
                <>
                  Converting... {estimatedTimeLeft !== null && `(${estimatedTimeLeft}s left)`}
                </>
              ) : (
                "Upload & Convert"
              )}
            </Button>
          </Box>

          {(midiUrl || sheetUrl) && (
            <Box mt={6} textAlign="center">
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                변환된 파일은 최대 5분 동안 다운로드 가능합니다.
              </Typography>

              {midiUrl && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>MIDI 파일 다운로드</Typography>
                  <Link href={midiUrl} download target="_blank" rel="noopener">
                    <Button variant="outlined">Download MIDI</Button>
                  </Link>
                </Box>
              )}

              {bpm && (
                <Typography variant="body1" sx={{ mt: 3 }}>
                  Estimated BPM: <strong>{bpm}</strong>
                </Typography>
              )}

              {sheetUrl && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>Sheet Music Preview</Typography>
                  <iframe
                    src={sheetUrl}
                    width="100%"
                    height="600px"
                    title="Sheet PDF Preview"
                    style={{ border: "1px solid #ccc" }}
                  />
                  <Button
                    variant="outlined"
                    sx={{ mt: 2 }}
                    href={sheetUrl}
                    download
                  >
                    Download Sheet PDF
                  </Button>
                </Box>
              )}
            </Box>
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
          This service uses <strong>Basic Pitch</strong> for audio-to-MIDI conversion.<br />
          Basic Pitch is an open-source tool developed by Spotify.<br />
          Powered by Spotify’s neural pitch detection model (Python implementation).<br />
          The tool 'basic-pitch' is released under the MIT License.<br /><br />
          Contact: taedyoverflow@gmail.com
        </Typography>
        <Copyright />
      </Box>
    </>
  );
}
