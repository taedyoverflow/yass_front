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
  const [separationLoading, setSeparationLoading] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalVideos, setTotalVideos] = useState([]);
  const inputRef = useRef(null);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState(null);

  const [vocalBlobUrl, setVocalBlobUrl] = useState("");
  const [drumsBlobUrl, setDrumsBlobUrl] = useState("");
  const [bassBlobUrl, setBassBlobUrl] = useState("");
  const [otherBlobUrl, setOtherBlobUrl] = useState("");

  const isValidYouTubeUrl = (url) => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})(\S*)?$/i;
    return regex.test(url.trim());
  };

  const checkResult = useCallback(async () => {
    if (!taskId) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/result/${taskId}`);
      const data = await res.json();
      if (!data.vocal_url || !data.drums_url || !data.bass_url || !data.other_url) return;
      setVocalBlobUrl(data.vocal_url);
      setDrumsBlobUrl(data.drums_url);
      setBassBlobUrl(data.bass_url);
      setOtherBlobUrl(data.other_url);
      setSeparationLoading(false);
    } catch (error) {
      console.error("checkResult 오류:", error);
    }
  }, [taskId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  useEffect(() => {
    let intervalCheck = null;
    let intervalCountdown = null;

    if (separationLoading && taskId) {
      setEstimatedTimeLeft(200);
      intervalCountdown = setInterval(() => {
        setEstimatedTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      let retryCount = 0;
      intervalCheck = setInterval(() => {
        retryCount += 1;
        if (retryCount >= 40) {
          setSeparationLoading(false);
          alert("작업이 예상보다 오래 걸리고 있어요. 다시 시도해보거나 잠시 후 재시도해주세요.");
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
    if (page > 1) {
      const prevPage = page - 1;
      setPage(prevPage);
      setVideos(totalVideos.slice(prevPage * 10 - 10, prevPage * 10));
    }
  };

  const processAudio = async () => {
    if (!youtubeUrl.trim()) {
      alert("YouTube URL을 입력해주세요.");
      return;
    }

    if (!isValidYouTubeUrl(youtubeUrl.trim())) {
      alert("올바른 YouTube 영상 URL을 입력해주세요.");
      return;
    }

    setSeparationLoading(true);
    setVocalBlobUrl("");
    setDrumsBlobUrl("");
    setBassBlobUrl("");
    setOtherBlobUrl("");

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/process_audio_demucs/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400) {
          alert(errorData.detail || "요청이 거부되었습니다.");
        } else {
          alert("알 수 없는 오류가 발생했습니다.");
        }
        setSeparationLoading(false);
        return;
      }

      const data = await response.json();
      setTaskId(data.task_id);
    } catch (error) {
      alert("분리 요청 중 오류 발생: " + error.message);
      console.error(error);
      setSeparationLoading(false);
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
            Demucs AI를 통해 보컬, 드럼, 베이스,<br />
            그리고 나머지 소리(기타 악기 및 배경음)를 분리할 수 있습니다.<br />
            분리된 음원을 스트리밍하거나 다운로드 해보세요.<br />
            <br />
            ▶ 검색 후 썸네일을 클릭하면 유튜브로 이동,<br />
            ▶ 제목을 클릭하면 자동으로 아래 URL 입력칸이 채워집니다.
          </Typography>

          <Box
            component="form"
            onSubmit={(e) => { e.preventDefault(); searchVideos(); }}
            sx={{ display: "flex", flexDirection: "column", alignItems: "center", "& .MuiTextField-root": { m: 1 } }}
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

          {!separationLoading && vocalBlobUrl && drumsBlobUrl && bassBlobUrl && otherBlobUrl && (
            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Typography variant="h6">Separated Audio</Typography>
              {[['Vocal', vocalBlobUrl], ['Drums', drumsBlobUrl], ['Bass', bassBlobUrl], ['Other', otherBlobUrl]].map(([label, url]) => (
                <Box key={label} sx={{ mt: 2 }}>
                  <Typography>{label}</Typography>
                  <audio controls preload="auto" src={url}></audio>
                  <br />
                  <a href={url} download={`${label.toLowerCase()}.wav`}>
                    <Button variant="outlined" sx={{ mt: 1 }}>
                      Download {label}
                    </Button>
                  </a>
                </Box>
              ))}
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
          This service uses Demucs (open-source) for audio source separation.<br />
          Powered by Facebook AI Research's deep learning model for music demixing.<br />
          The tool 'demucs' is released under the MIT License.<br />
          Source: https://github.com/facebookresearch/demucs <br /><br />
          Contact: taedyoverflow@gmail.com
        </Typography>
        <Copyright />
      </Box>
    </>
  );
}
