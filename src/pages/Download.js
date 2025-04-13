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
      <Link color="inherit" href="/">
        YASS AI
      </Link>{" "}
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
  const [separationLoading, setSeparationLoading] = useState(false);
  const [vocalBlobUrl, setVocalBlobUrl] = useState("");
  const [accompBlobUrl, setAccompBlobUrl] = useState("");
  const [taskId, setTaskId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalVideos, setTotalVideos] = useState([]);
  const inputRef = useRef(null);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState(null);

  const checkResult = useCallback(async () => {
    if (!taskId) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/result/${taskId}`);
      const data = await res.json();
      if (data.vocal_url && data.accompaniment_url) {
        const [vocalRes, accompRes] = await Promise.all([
          fetch(data.vocal_url),
          fetch(data.accompaniment_url),
        ]);
  
        const vocalBlob = await vocalRes.blob();
        const accompBlob = await accompRes.blob();
  
        setVocalBlobUrl(URL.createObjectURL(vocalBlob));
        setAccompBlobUrl(URL.createObjectURL(accompBlob));
        setSeparationLoading(false);
      }
    } catch (error) {
      console.error("결과 확인 중 오류 발생: ", error);
    }
  }, [taskId]);

  useEffect(() => {
    let interval;
    if (separationLoading && taskId) {
      setEstimatedTimeLeft(90); // 기본 90초 예상
      interval = setInterval(() => {
        checkResult();
        setEstimatedTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [separationLoading, taskId, checkResult]); 

  useEffect(() => {
    console.log("✅ 백엔드 URL:", process.env.REACT_APP_BACKEND_URL);
  }, []);

  useEffect(() => {
    let interval;
    if (separationLoading && taskId) {
      interval = setInterval(() => {
        checkResult();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [separationLoading, taskId, checkResult]);
  

  const searchVideos = async () => {
    setSearchLoading(true);
    const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
    const queryEncoded = encodeURIComponent(query);
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=50&q=${queryEncoded}&key=${apiKey}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      const videos = data.items.map((item) => ({
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
    const prevPage = page - 1;
    setPage(prevPage);
    setVideos(totalVideos.slice(prevPage * 10 - 10, prevPage * 10));
  };

  const processAudio = async () => {
    setSeparationLoading(true);
    setVocalBlobUrl("");
    setAccompBlobUrl("");
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/process_audio/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl }),
      });

      const data = await response.json();
      setTaskId(data.task_id);
    } catch (error) {
      alert("분리 요청 중 오류 발생: " + error.message);
      console.error(error);
      setSeparationLoading(false);
    }
  };


  

// 이후 return(...) JSX 코드 블록은 변경 없음 (디자인 유지 조건)


  return (
    <>
      <CustomAppBar />

      <main>
        <Container sx={{ py: 8 }} maxWidth="md">
          <Typography variant="h4" gutterBottom align="center">
            YouTube Audio Separation and Streaming AI
          </Typography>
          <Typography variant="body1" align="center" sx={{ mt: 2, mb: 4 }}>
            유튜브에서 음원을 검색하고,<br />
            보컬과 반주(MR)를 Spleeter AI로 분리한 뒤<br />
            바로 스트리밍하거나 다운로드해보세요.<br /><br />
            ▶ 썸네일을 클릭하면 유튜브에서 영상 재생<br />
            ▶ 제목을 클릭하면 자동으로 아래 URL 입력칸이 채워집니다.
          </Typography>


          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              searchVideos();
            }}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              "& .MuiTextField-root": { m: 1 },
            }}
          >
            <TextField
              label="Search for audio on YouTube."
              variant="outlined"
              sx={{ width: "50%" }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button
              variant="contained"
              type="submit"
              sx={{ m: 1 }}
              disabled={searchLoading}
            >
              <span>{searchLoading ? "Searching..." : "Search"}</span>
            </Button>
          </Box>

          <Grid container spacing={2} justifyContent="center">
            {videos.map((video) => (
              <Grid item xs={12} md={6} lg={4} key={video.videoId}>
                <Card sx={{ maxWidth: 345, m: 1 }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={video.thumbnail}
                    alt={video.title}
                    onClick={() => window.open(video.link, "_blank")}
                    style={{ cursor: "pointer" }}
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
                        }, 100); // 약간의 delay 주면 안정적
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
            <Button
              onClick={handleNextPage}
              disabled={page * 10 >= totalVideos.length}
              sx={{ m: 1 }}
            >
              Next
            </Button>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              "& .MuiTextField-root": { m: 1 },
              mt: 5,
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
            <Button
              variant="contained"
              onClick={processAudio}
              disabled={separationLoading}
              sx={{ m: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              type="button"
            >
              {separationLoading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  {`Separating...${estimatedTimeLeft !== null ? ` (${estimatedTimeLeft} s left)` : ''}`}
                </>
              ) : (
                'SEPARATION'
              )}
            </Button>
          </Box>

          {!separationLoading && vocalBlobUrl && (
            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Typography variant="h6">Separated Audio</Typography>

              <Box sx={{ mt: 2 }}>
                <Typography>Vocal</Typography>
                <audio controls src={vocalBlobUrl}></audio>
                <br />
                <a href={vocalBlobUrl} download="vocal.wav">
                  <Button variant="outlined" sx={{ mt: 1 }}>
                    Download Vocal
                  </Button>
                </a>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography>Accompaniment</Typography>
                <audio controls src={accompBlobUrl}></audio>
                <br />
                <a href={accompBlobUrl} download="accompaniment.wav">
                  <Button variant="outlined" sx={{ mt: 1 }}>
                    Download Accompaniment
                  </Button>
                </a>
              </Box>
            </Box>
          )}
        </Container>
      </main>

      <Box sx={{ bgcolor: "background.paper", p: 6 }} component="footer">
      <Typography 
        variant="body2"  // 기존 subtitle1보다 작은 기본 글자 크기
        align="center" 
        color="text.secondary"
        sx={{ fontSize: "0.875rem" }} // 또는 직접 크기 지정도 가능
      >
        This service uses Spleeter by Deezer for audio source separation. <br />
        Spleeter is an open-source project released under the MIT License. <br />
        Source: https://github.com/deezer/spleeter <br />
        Contact: taedyoverflow@gmail.com

        </Typography>
        <Copyright />
      </Box>
    </>
  );
}
