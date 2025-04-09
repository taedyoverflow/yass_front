import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Select,
  MenuItem,
  Slider,
  TextField,
  CircularProgress,
  Link,
  FormControl,
  InputLabel,

} from "@mui/material";
import CustomAppBar from "../components/CustomAppbar";

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

export default function TTS() {
  // 상태 설정
  const [pthFiles, setPthFiles] = useState([]);
  const [indexFiles, setIndexFiles] = useState([]);
  const [pthFile, setPthFile] = useState('');
  const [indexFile, setIndexFile] = useState('');
  const [indexRate, setIndexRate] = useState(0.6);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultAudio, setResultAudio] = useState(null);
  const [error, setError] = useState('');
  const voiceOptions = [
    { label: "한국어(남성)", value: "Microsoft Server Speech Text to Speech Voice (ko-KR, InJoonNeural)" },
    { label: "한국어(여성)", value: "Microsoft Server Speech Text to Speech Voice (ko-KR, SunHiNeural)" },
    { label: "영어(남성)", value: "Microsoft Server Speech Text to Speech Voice (en-US, AndrewNeural)" },
    { label: "영어(여성)", value: "Microsoft Server Speech Text to Speech Voice (en-US, AvaNeural)" },
  ];

  useEffect(() => {
    // TTS Voices, PTH 파일, Index 파일 목록을 불러오는 fetch 함수 구현
    fetchPthFiles();
    fetchIndexFiles();
  }, []);

  const handlePthFileChange = (event) => {
    setPthFile(event.target.value);
};

const handleIndexFileChange = (event) => {
    setIndexFile(event.target.value);
};

const handleIndexRateChange = (event, newValue) => {
    setIndexRate(newValue);
};

  // PTH 파일 목록을 불러오는 함수
  const fetchPthFiles = async () => {
    try {
      const response = await fetch("http://192.168.0.187:8000/list-pth-files/");
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setPthFiles(data);
    } catch (error) {
      console.error("Could not fetch pth files:", error);
    }
  };

  // Index 파일 목록을 불러오는 함수
  const fetchIndexFiles = async () => {
    try {
      const response = await fetch("http://192.168.0.187:8000/list-index-files/");
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setIndexFiles(data);
    } catch (error) {
      console.error("Could not fetch index files:", error);
    }
  };

  // 변환 요청을 처리하는 함수
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    setResultAudio(null);
  
    const formData = new FormData();
    formData.append('text', text);
    formData.append('voice', selectedVoice);
    formData.append('pth_file_path', pthFile); // 파일 경로를 문자열로 전송
    formData.append('index_file_path', indexFile !== 'None' ? indexFile : ''); // 파일 경로를 문자열로 전송, 'None'인 경우 빈 문자열 전송
    formData.append('index_rate', String(indexRate));
  
    // 여기에 사용자 입력을 받지 않는 기타 필요한 값을 추가합니다.
    formData.append('f0up_key', '0');
    formData.append('filter_radius', '3');
    formData.append('rms_mix_rate', '1');
    formData.append('protect', '0.33');
    formData.append('hop_length', '128');
    formData.append('f0method', 'rmvpe');
    formData.append('split_audio', 'False');
    formData.append('f0autotune', 'False');
    formData.append('clean_audio', 'False');
    formData.append('clean_strength', '0.7');
    formData.append('export_format', 'WAV');
  
    try {
      const response = await fetch('http://192.168.0.187:8000/tts/', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.blob();
      const audioURL = URL.createObjectURL(data);
      setResultAudio(audioURL);
    } catch (error) {
      console.error('Error during the TTS process:', error);
      setError('Failed to process TTS. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  

  return (
    <>
    <CustomAppBar />
    <main>
        <Container sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }} maxWidth="md">
          <Typography variant="h4" gutterBottom align="center">Text-to-Speech <br/>목소리 변환</Typography>
          
          {/* 텍스트 입력 필드 */}
          <Box sx={{ width: '100%', maxWidth: 400, mt: 2 }}>
            <TextField
              label="Enter Text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              margin="normal"
              fullWidth
              multiline
              rows={4} // 텍스트 필드의 초기 높이를 4줄 높이로 설정
            />
          </Box>

          <br/>
          {/* TTS Voice 선택 드롭다운 */}
          <FormControl fullWidth sx={{ mt: 2, width: '100%', maxWidth: 400 }}>
  <InputLabel>TTS Voice</InputLabel>
  <Select
    value={selectedVoice}
    onChange={(e) => setSelectedVoice(e.target.value)}
    displayEmpty
  >
    {voiceOptions.map((option, index) => (
      <MenuItem key={index} value={option.value}>{option.label}</MenuItem>
    ))}
  </Select>
  <Typography variant="body2" sx={{ mt: 1 }}>목소리 변환 전의 초기 음성입니다. 언어와 성별을 정해주세요.</Typography>
</FormControl>

          {/* PTH 파일 선택 드롭다운 */}
          <FormControl fullWidth sx={{ mt: 2, width: '100%', maxWidth: 400 }}>
            <InputLabel>Pth 파일</InputLabel>
            <Select
              value={pthFile} // 상태 변수 (예시)
              onChange={handlePthFileChange} // 이벤트 핸들러 (예시)
            >
              {pthFiles.map((file, index) => ( // 옵션 목록 (예시)
                <MenuItem key={index} value={file}>{file}</MenuItem>
              ))}
            </Select>
            <Typography variant="body2" sx={{ mt: 1 }}>변환할 목소리를 정해주세요.</Typography>
          </FormControl>

          {/* Index 파일 선택 드롭다운 */}
          <FormControl fullWidth sx={{ mt: 2, width: '100%', maxWidth: 400 }}>
            <InputLabel>Index 파일</InputLabel>
            <Select
              value={indexFile} // 상태 변수 (예시)
              onChange={handleIndexFileChange} // 이벤트 핸들러 (예시)
            >
              <MenuItem value="">None</MenuItem>
              {indexFiles.map((file, index) => ( // 옵션 목록 (예시)
                <MenuItem key={index} value={file}>{file}</MenuItem>
              ))}
            </Select>
            <Typography variant="body2" sx={{ mt: 1 }}>
              인덱스 파일이 있는 경우, pth 파일의 이름과 동일하게 맞춰주세요.
              인덱스 파일은 변환할 목소리의 특징을 포함한 파일입니다.
            </Typography>
          </FormControl>

<br/>
<Box sx={{ mt: 2, width: '100%', maxWidth: 400 }}>
  <Typography gutterBottom>Index 비율</Typography>
  <Slider
    value={indexRate}
    onChange={handleIndexRateChange}
    step={0.01}
    min={0}
    max={1}
    valueLabelDisplay="auto"
  />
  <Typography variant="body2" sx={{ mt: 1 }}>
    인덱스 비율은 원본 음성과 목표 음성 간의 혼합 비율을 나타냅니다.
    너무 높을 경우 자연스럽지 않을 수 있습니다(권장: 0.6)
    인덱스 파일이 없을 경우 0으로 수정해주세요. 
  </Typography>
</Box>

<br/>
{/* 변환 시작 버튼 */}
<Button
  variant="contained"
  onClick={handleSubmit}
  disabled={isSubmitting}
  sx={{ mt: 3, mb: 2, width: '48%' }}
>
  {isSubmitting ? <CircularProgress size={24} /> : '변환'}
</Button>

{/* 결과 오디오 재생 */}
{resultAudio && (
  <Box mt={2}>
    <audio controls src={resultAudio}>
      Your browser does not support the audio element.
    </audio>
  </Box>
)}

{/* 오류 메시지 출력 */}
{error && (
  <Typography color="error" sx={{ mt: 2 }}>
    {error}
  </Typography>
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
