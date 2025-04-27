import React, { useState, useEffect, useCallback } from "react";
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
    setEstimatedTimeLeft(200);
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
      setEstimatedTimeLeft(null);  // 실패했으면 카운트다운도 초기화
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
      } else if (data.status === "FAILURE") {
        setLoading(false);
        setTaskId(null);
        setEstimatedTimeLeft(null);
        alert(data.reason || "MIDI 변환 실패. 다시 시도해주세요.");
      }
      
    } catch (err) {
      console.error("❌ 결과 확인 실패:", err);
      alert("서버 응답 오류. 다시 시도해주세요.");
      setLoading(false);
      setTaskId(null);
      setEstimatedTimeLeft(null);
    }
  }, [taskId]);

  useEffect(() => {
    let intervalCheck = null;
    let intervalCountdown = null;
    let retryCount = 0;

    if (taskId) {
      setEstimatedTimeLeft(200);
      intervalCountdown = setInterval(() => {
        setEstimatedTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      intervalCheck = setInterval(() => {
        retryCount += 1;
        if (retryCount >= 40) {
          setLoading(false);
          setTaskId(null);
          setEstimatedTimeLeft(null);
          alert("작업이 예상보다 오래 걸리고 있어요. 다시 시도해보거나 잠시 후 재시도해주세요."); // ✅ 수정 완료
          clearInterval(intervalCheck);
          clearInterval(intervalCountdown);
          return;
        }
        checkResult();
      }, 5000);
    }

    return () => {
      clearInterval(intervalCheck);
      clearInterval(intervalCountdown);
    };
  }, [taskId, checkResult]);

  useEffect(() => {
    let countdown;
    if (loading && estimatedTimeLeft !== null) {
      countdown = setInterval(() => {
        setEstimatedTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(countdown);
  }, [loading, estimatedTimeLeft]);

  return (
    <>
      <CustomAppBar />

      <main style={{ position: "relative" }}>
        <Container sx={{ py: 8 }} maxWidth="md">
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 2 }}>
            Beta 서비스 안내: <br />
            베타 서비스 중에는 악보의 정확성을 보장할 수 없습니다. <br />
            지속적으로 고도화 및 유지보수 중입니다.<br/><br />
          </Typography>
          <Typography variant="h4" align="center" gutterBottom>
            Audio to MIDI AI
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 4 }}>
            반주 오디오 파일(wav)을 MIDI로 변환해서 다운로드하거나,<br />
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
              sx={{ width: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}
            >
              {loading ? (
                <>
                  {/* <CircularProgress size={20} sx={{ mr: 1 }} /> */}
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
                변환된 미디파일과 악보는 최대 5분 동안 다운로드 가능합니다.
              </Typography>

              {midiUrl && (
                <Box sx={{ mt: 3 }}>
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
                <Box sx={{ mt: 4 }}>
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
          The tool 'basic-pitch' is released under the MIT License.<br /><br />
          Contact: taedyoverflow@gmail.com
        </Typography>
        <Copyright />
      </Box>
    </>
  );
}
