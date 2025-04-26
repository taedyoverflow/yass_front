import React, { useState, useEffect, useRef, useCallback } from "react";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import CircularProgress from "@mui/material/CircularProgress";
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

function decodeHtml(html) {
  const textArea = document.createElement("textarea");
  textArea.innerHTML = html;
  return textArea.value;
}

export default function Download() {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const [separationLoadingDemucs, setSeparationLoadingDemucs] = useState(false);
  const [separationLoadingSpleeter, setSeparationLoadingSpleeter] = useState(false);

  const [vocalBlobUrlDemucs, setVocalBlobUrlDemucs] = useState("");
  const [drumsBlobUrl, setDrumsBlobUrl] = useState("");
  const [bassBlobUrl, setBassBlobUrl] = useState("");
  const [otherBlobUrl, setOtherBlobUrl] = useState("");

  const [vocalBlobUrlSpleeter, setVocalBlobUrlSpleeter] = useState("");
  const [accompBlobUrl, setAccompBlobUrl] = useState("");

  const [taskIdDemucs, setTaskIdDemucs] = useState(null);
  const [taskIdSpleeter, setTaskIdSpleeter] = useState(null);

  const [page, setPage] = useState(1);
  const [totalVideos, setTotalVideos] = useState([]);
  const inputRef = useRef(null);

  const [estimatedTimeLeftDemucs, setEstimatedTimeLeftDemucs] = useState(null);
  const [estimatedTimeLeftSpleeter, setEstimatedTimeLeftSpleeter] = useState(null);

  const checkResultDemucs = useCallback(async () => {
    if (!taskIdDemucs) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/result/${taskIdDemucs}`);
      const data = await res.json();
      if (!data.vocal_url || !data.drums_url || !data.bass_url || !data.other_url) return;
      setEstimatedTimeLeftDemucs(200);
      setVocalBlobUrlDemucs(data.vocal_url);
      setDrumsBlobUrl(data.drums_url);
      setBassBlobUrl(data.bass_url);
      setOtherBlobUrl(data.other_url);
      setSeparationLoadingDemucs(false);
    } catch (error) {
      console.error("Demucs checkResult 오류:", error);
    }
  }, [taskIdDemucs]);

  const checkResultSpleeter = useCallback(async () => {
    if (!taskIdSpleeter) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/result/${taskIdSpleeter}`);
      const data = await res.json();
      if (!data.vocal_url || !data.accompaniment_url) return;
      setEstimatedTimeLeftSpleeter(100);
      setVocalBlobUrlSpleeter(data.vocal_url);
      setAccompBlobUrl(data.accompaniment_url);
      setSeparationLoadingSpleeter(false);
    } catch (error) {
      console.error("Spleeter checkResult 오류:", error);
    }
  }, [taskIdSpleeter]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [page]);

  useEffect(() => {
    let intervalCheck = null;
    let intervalCountdown = null;

    if (separationLoadingDemucs && taskIdDemucs) {
      intervalCountdown = setInterval(() => {
        setEstimatedTimeLeftDemucs(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      intervalCheck = setInterval(checkResultDemucs, 5000);
    }

    return () => { clearInterval(intervalCheck); clearInterval(intervalCountdown); };
  }, [separationLoadingDemucs, taskIdDemucs, checkResultDemucs]);

  useEffect(() => {
    let intervalCheck = null;
    let intervalCountdown = null;

    if (separationLoadingSpleeter && taskIdSpleeter) {
      intervalCountdown = setInterval(() => {
        setEstimatedTimeLeftSpleeter(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      intervalCheck = setInterval(checkResultSpleeter, 5000);
    }

    return () => { clearInterval(intervalCheck); clearInterval(intervalCountdown); };
  }, [separationLoadingSpleeter, taskIdSpleeter, checkResultSpleeter]);

  const searchVideos = async () => {
    setSearchLoading(true);
    const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
    const queryEncoded = encodeURIComponent(query);
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=50&q=${queryEncoded}&key=${apiKey}`;
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      const videos = data.items.map(item => ({
        videoId: item.id.videoId,
        title: decodeHtml(item.snippet.title),
        description: decodeHtml(item.snippet.description),
        thumbnail: item.snippet.thumbnails.medium.url,
        link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      }));
      setTotalVideos(videos);
      setPage(1);
      setVideos(videos.slice(0, 10));
    } catch (error) {
      alert("검색 중 오류가 발생했습니다.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleNextPage = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setVideos(totalVideos.slice(nextPage * 10 - 10, nextPage * 10));
  };

  const handlePrevPage = () => {
    if (page > 1) {
      const prevPage = page - 1;
      setPage(prevPage);
      setVideos(totalVideos.slice(prevPage * 10 - 10, prevPage * 10));
    }
  };

// processAudioDemucs 안에 추가
const processAudioDemucs = async () => {
  if (!youtubeUrl.trim()) { alert("YouTube URL을 입력해주세요."); return; }
  setSeparationLoadingDemucs(true);
  setVocalBlobUrlDemucs("");
  setDrumsBlobUrl("");
  setBassBlobUrl("");
  setOtherBlobUrl("");
  setEstimatedTimeLeftDemucs(200); // ✅ 추가

  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/process_audio_demucs/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: youtubeUrl }),
    });
    const data = await response.json();
    setTaskIdDemucs(data.task_id);
  } catch (error) {
    alert("Demucs 분리 요청 오류: " + error.message);
    setSeparationLoadingDemucs(false);
  }
};

// processAudioSpleeter 안에 추가
const processAudioSpleeter = async () => {
  if (!youtubeUrl.trim()) { alert("YouTube URL을 입력해주세요."); return; }
  setSeparationLoadingSpleeter(true);
  setVocalBlobUrlSpleeter("");
  setAccompBlobUrl("");
  setEstimatedTimeLeftSpleeter(100); // ✅ 추가

  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/process_audio/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: youtubeUrl }),
    });
    const data = await response.json();
    setTaskIdSpleeter(data.task_id);
  } catch (error) {
    alert("Spleeter 분리 요청 오류: " + error.message);
    setSeparationLoadingSpleeter(false);
  }
};

  return (
    <>
      <CustomAppBar />
  
      <main>
        <Container sx={{ py: 8 }} maxWidth="md">
          <Typography variant="h4" gutterBottom align="center">
            YouTube Audio Separation and Streaming AI
          </Typography>
          <Typography variant="body1" align="center" sx={{ mt: 2, mb: 4 }}>
            유튜브에서 음원을 검색하고 URL을 입력하면,<br />
            Spleeter(보컬/반주) 또는 Demucs(보컬/드럼/베이스/그 외)<br />
            AI를 통해 음원을 분리할 수 있습니다.<br /><br />
            ▶ 검색 후 썸네일을 클릭하면 유튜브로 이동,<br />
            ▶ 제목을 클릭하면 자동으로 아래 URL 입력칸이 채워집니다.
          </Typography>
  
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              searchVideos();
            }}
            sx={{ display: "flex", flexDirection: "column", alignItems: "center", "& .MuiTextField-root": { m: 1 } }}
          >
            <TextField
              label="Search for audio on YouTube."
              variant="outlined"
              sx={{ width: "50%" }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button variant="contained" type="submit" sx={{ m: 1 }} disabled={searchLoading}>
              {searchLoading ? "Searching..." : "Search"}
            </Button>
          </Box>
  
          <Grid container spacing={2} justifyContent="center">
            {videos.map((video) => (
              <Grid item xs={12} md={6} lg={4} key={video.videoId}>
                <Card sx={{ maxWidth: 345, m: 1 }}>
                <CardMedia
                  component="img"
                  image={video.thumbnail}
                  alt={video.title}
                  onClick={() => window.open(video.link, "_blank")}
                  sx={{
                    cursor: "pointer",
                    objectFit: "cover",
                    width: "100%",
                    aspectRatio: "16 / 9",
                  }}
                />

                  <CardContent>
                    <Typography
                      gutterBottom
                      variant="h6"
                      component="div"
                      onClick={() => {
                        setYoutubeUrl(video.link);
                        setTimeout(() => {
                          inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }, 100);
                      }}
                      style={{ cursor: "pointer", textDecoration: "underline" }}
                    >
                      {video.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {video.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
  
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Button onClick={handlePrevPage} disabled={page === 1} sx={{ m: 1 }}>
              Prev
            </Button>
            <Button onClick={handleNextPage} disabled={page * 10 >= totalVideos.length} sx={{ m: 1 }}>
              Next
            </Button>
          </Box>
  
          {/* 유튜브 URL 입력 + 분리 버튼 2개 */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mt: 5,
              "& .MuiTextField-root": { m: 1 },
            }}
          >
            <TextField
              inputRef={inputRef}
              label="Enter the YouTube URL."
              variant="outlined"
              sx={{ width: "50%" }}
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                onClick={processAudioSpleeter}
                disabled={separationLoadingSpleeter || separationLoadingDemucs} // ✅ 둘 다 체크
                sx={{ flex: 1, whiteSpace: "nowrap", fontSize: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {separationLoadingSpleeter ? (
                  <>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    Spleeter...
                    {estimatedTimeLeftSpleeter !== null && ` (${estimatedTimeLeftSpleeter}s left)`}
                  </>
                ) : (
                  "Spleeter (2 Track)"
                )}
              </Button>
  
              <Button
                variant="contained"
                onClick={processAudioDemucs}
                disabled={separationLoadingDemucs || separationLoadingSpleeter} // ✅ 둘 다 체크
                sx={{ flex: 1, whiteSpace: "nowrap", fontSize: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {separationLoadingDemucs ? (
                  <>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    Demucs...
                    {estimatedTimeLeftDemucs !== null && ` (${estimatedTimeLeftDemucs}s left)`}
                  </>
                ) : (
                  "Demucs (4 Track)"
                )}
              </Button>
            </Box>
          </Box>
  
          {/* 결과 출력 (Spleeter) */}
            {!separationLoadingSpleeter && vocalBlobUrlSpleeter && accompBlobUrl && (
              <Box sx={{ mt: 4, textAlign: "center" }}>
                <Typography variant="h6">Separated Audio</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  분리된 음성은 최대 5분 동안 스트리밍하거나 다운로드 받으실 수 있습니다.
                </Typography>

                {/* Vocal */}
                <Box sx={{ mt: 2 }}>
                  <Typography>Vocal</Typography>
                  <audio controls preload="auto" src={vocalBlobUrlSpleeter}></audio> {/* ✅ 수정 */}
                  <Box sx={{ mt: 1, display: "flex", justifyContent: "center" }}>
                    <a href={vocalBlobUrlSpleeter} download="vocal.wav">
                      <Button variant="outlined" sx={{ mt: 1 }}>
                        Download Vocal
                      </Button>
                    </a>
                  </Box>
                </Box>

                {/* Accompaniment */}
                <Box sx={{ mt: 3 }}>
                  <Typography>Accompaniment</Typography>
                  <audio controls preload="auto" src={accompBlobUrl}></audio>
                  <Box sx={{ mt: 1, display: "flex", justifyContent: "center" }}>
                    <a href={accompBlobUrl} download="accompaniment.wav">
                      <Button variant="outlined" sx={{ mt: 1 }}>
                        Download Accompaniment
                      </Button>
                    </a>
                  </Box>
                </Box>
              </Box>
            )}


          {/* 결과 출력 (Demucs) */}
            {!separationLoadingDemucs && vocalBlobUrlDemucs && drumsBlobUrl && bassBlobUrl && otherBlobUrl && (
              <Box sx={{ mt: 5, textAlign: "center" }}>
                <Typography variant="h6">Separated by Demucs</Typography>
                {[
                  ["Vocal", vocalBlobUrlDemucs],
                  ["Drums", drumsBlobUrl],
                  ["Bass", bassBlobUrl],
                  ["Other", otherBlobUrl],
                ].map(([label, url]) => (
                  <Box key={label} sx={{ mt: 2 }}>
                    <Typography>{label}</Typography>
                    <audio controls preload="auto" src={url}></audio> {/* ✅ width: "100%" 삭제 */}
                    <Box sx={{ mt: 1, display: "flex", justifyContent: "center" }}>
                      <a href={url} download={`${label.toLowerCase()}.wav`}>
                        <Button variant="outlined" sx={{ mt: 1 }}> {/* ✅ fullWidth 삭제 */}
                          Download {label}
                        </Button>
                      </a>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

        </Container>
      </main>
  
      <Box sx={{ bgcolor: "background.paper", p: 6 }} component="footer">
        <Typography variant="body2" align="center" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
          This service uses <strong>Spleeter</strong> and <strong>Demucs</strong> for audio source separation.<br />
          Spleeter is an open-source music source separation tool developed by Deezer Research.<br />
          Demucs is an open-source music source separation model developed by Facebook AI Research.<br />
          Both tools are released under the MIT License.<br /><br />
          Contact: taedyoverflow@gmail.com
        </Typography>
        <Copyright />
      </Box>
    </>
  );
}  