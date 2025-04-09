import React, { useState } from "react";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import CustomAppBar from "../components/CustomAppbar";
import Link from "@mui/material/Link";
import { CircularProgress } from "@mui/material";

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="/">
        My Way, Our Voices
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

// HTML 엔티티를 디코딩하는 함수
function decodeHtml(html) {
    var textArea = document.createElement("textarea");
    textArea.innerHTML = html;
    return textArea.value;
}

export default function Separation() {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState([]);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [separationResult, setSeparationResult] = useState({ vocalPath: '', accompanimentPath: '' });
  const [isLoading, setIsLoading] = useState(false);
  // 상태 및 함수 정의...
  const searchVideos = async () => {
    try {
      const response = await fetch('http://192.168.0.187:8000/youtube_search/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (response.ok) {
        const data = await response.json();
        const decodedVideos = data.videos.map(video => ({
            ...video,
            title: decodeHtml(video.title), // 제목 디코딩
            description: decodeHtml(video.description), // 설명 디코딩
        }));
        setVideos(decodedVideos);
      } else {
        alert('검색 오류가 발생했습니다.');
      }
    } catch (error) {
      alert('검색 오류가 발생했습니다.');
    }
  };
  const processAudio = async () => {
    setIsLoading(true); // 분리 시작 시 로딩 상태 활성화
    try {
      const response = await fetch('http://192.168.0.187:8000/process_audio/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: youtubeUrl }),
      });
  
      if (response.ok) {
        const data = await response.json();
        setSeparationResult({
          vocalStreamUrl: data.vocal_stream_url,
          accompanimentStreamUrl: data.accompaniment_stream_url,
          vocalDownloadUrl: data.vocal_download_url,
          accompanimentDownloadUrl: data.accompaniment_download_url
        });
      } else {
        alert('오류가 발생했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false); // 작업 완료 후 로딩 상태 비활성화
    }
  };
  

  return (
    <>
      <CustomAppBar />

<main>
  <Container sx={{ py: 8 }} maxWidth="md">
    <Typography variant="h4" gutterBottom align="center">
      YouTube 음원 다운로드 및 분리
    </Typography>

     {/* 안내 메시지 */}
    <Typography variant="body1" align="center" sx={{ mt: 2, mb: 4 }}>
      유튜브 음원 검색 후 검색 결과에 나오는 썸네일 이미지를 클릭하면 YouTube로 이동,<br/>
      제목을 클릭하면 자동으로 URL이 입력됩니다.
    </Typography>
    
    {/* YouTube 검색 필드 */}
    <Box
      component="form"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        '& .MuiTextField-root': { m: 1 },
      }}
      noValidate
      autoComplete="off"
    >
      <TextField
        label="YouTube에서 음원을 검색하세요"
        variant="outlined"
        sx={{ width: '50%' }} // 입력 필드 길이 조정
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button variant="contained" onClick={searchVideos} sx={{ m: 1 }}>
        검색
      </Button>
    </Box>

{/* 검색 결과 */}
<Grid container spacing={2} justifyContent="center">
  {videos.map((video) => (
    <Grid item xs={12} md={6} lg={4} key={video.videoId}>
      <Card sx={{ maxWidth: 345, m: 1 }}>
        {/* CardActionArea 제거 및 CardMedia에 직접 onClick 이벤트 핸들러 추가 */}
        <CardMedia
          component="img"
          height="140"
          image={video.thumbnail} // 썸네일 이미지 URL
          alt={video.title} // 이미지가 로드되지 않을 경우 표시될 텍스트
          onClick={() => window.open(video.link, "_blank")} // 썸네일 클릭 시 YouTube로 이동
          style={{ cursor: 'pointer' }} // 커서를 포인터로 변경하여 클릭 가능함을 나타냄
        />
        <CardContent>
          {/* 제목 클릭 시 URL 자동 입력을 위해 Typography에 onClick 이벤트 핸들러 추가 */}
          <Typography
            gutterBottom
            variant="h5"
            component="div"
            onClick={() => setYoutubeUrl(video.link)} // 제목 클릭 시
            style={{ cursor: 'pointer', textDecoration: 'underline' }} // 스타일 추가
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


    {/* YouTube URL 입력 필드 */}
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        '& .MuiTextField-root': { m: 1 },
        mt: 5 // 검색 버튼과의 간격 조정
      }}
    >
      <TextField
        label="YouTube URL을 입력하세요"
        variant="outlined"
        sx={{ width: '50%' }} // 입력 필드 길이 조정
        value={youtubeUrl}
        onChange={(e) => setYoutubeUrl(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={processAudio} disabled={isLoading} sx={{ m: 1 }}>
        분리
      </Button>
    </Box>
    
{/* 분리 결과 및 로딩 상태 표시 */}
{isLoading ? (
  <Box display="flex" justifyContent="center" sx={{ width: '100%' }}>
    <Box display="flex" alignItems="center">
      <CircularProgress size={24} sx={{ mr: 1 }} />
      <Typography 
        variant="body1" 
        sx={{ 
          lineHeight: '24px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        음원 다운로드 및 분리중...
      </Typography>
    </Box>
  </Box>
) : (
  separationResult.vocalStreamUrl && (
    <Box sx={{ mt: 4, textAlign: 'center' }}>
      <Typography variant="h6">결과:</Typography>
      {/* 오디오 컨트롤 추가 */}
    <div>
        <br/><label htmlFor="vocalTrack">보컬 트랙</label>
        <br/><audio id="vocalTrack" controls src={separationResult.vocalStreamUrl}></audio>
    </div>
    <div>
        <br/><label htmlFor="accompanimentTrack">반주 트랙</label>
        <br/><audio id="accompanimentTrack" controls src={separationResult.accompanimentStreamUrl}></audio>
    </div>
    <div>
       {/* 다운로드 링크에 서버에서 응답한 URL을 그대로 사용 */}
        {/* <a href={`http://localhost:8000${separationResult.vocalDownloadUrl}`} target="_blank" rel="noopener noreferrer">보컬 다운로드</a><br/>
        <a href={`http://localhost:8000${separationResult.accompanimentDownloadUrl}`} target="_blank" rel="noopener noreferrer">반주 다운로드</a> */}
    </div>
    {/* "목소리 변환하러 가기" 버튼 추가 */}
    <br/>
    <br/>
    <Button
        variant="contained"
        color="secondary"
        sx={{ mt: 2 }}
        onClick={() => { window.location.href = '/inference'; }}
      >
        목소리 변환하러 가기
      </Button>
    </Box>
  )
)}
  </Container>
</main>


{/* Footer */}
<Box sx={{ bgcolor: "background.paper", p: 6 }} component="footer">
        <Typography variant="h6" align="center" gutterBottom></Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          component="p"
        >
          음악만이 나라에서 허락한 유일한 마약이니까
        </Typography>
        <Copyright />
      </Box>
      {/* End footer */}
    </>
  );
}
