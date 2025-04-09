import React, { useState, useRef } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Link,
  FormControl,
  InputLabel
} from "@mui/material";
import MicIcon from '@mui/icons-material/Mic';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import CustomAppBar from "../components/CustomAppbar";
import AudioPlayer from 'react-audio-player';

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

export default function Train() {
  const [modelName, setModelName] = useState('');
  const [totalEpoch, setTotalEpoch] = useState('100');
  const [selectedFiles, setSelectedFiles] = useState([]); // 파일 객체를 저장할 상태, 배열로 변경
  const [selectedFileNames, setSelectedFileNames] = useState([]); // 파일 이름을 저장할 상태, 배열로 변경
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [error, setError] = useState(false);
// 녹음 관련 상태
const [recording, setRecording] = useState(false);
const [audioURL, setAudioURL] = useState('');
const mediaRecorderRef = useRef(null);
const [paused, setPaused] = useState(false); // 녹음 일시 정지 상태
const audioChunksRef = useRef([]); // 오디오 청크를 저장할 ref
const [recordingTime, setRecordingTime] = useState(0); // 녹음 시간 상태
const recordingTimeIntervalRef = useRef(null); // 녹음 시간을 업데이트할 interval을 저장할 ref

const startRecording = async () => {
  try {
    // 사용자로부터 오디오 입력을 받는 스트림을 요청합니다.
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // MP3 형식 지원 여부 확인 및 설정
    const mimeType = 'audio/mpeg';
    const options = MediaRecorder.isTypeSupported(mimeType) ? { mimeType } : {};

    // MediaRecorder 인스턴스 생성
    const mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    // 데이터가 사용 가능할 때마다 audioChunksRef에 데이터를 추가합니다.
    mediaRecorder.ondataavailable = event => {
      audioChunksRef.current.push(event.data);
    };

    // 녹음이 멈추면 Blob 객체를 생성하고, 이를 사용해 오디오 URL을 설정합니다.
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(audioBlob);
      setAudioURL(url);
    };

    // 녹음을 시작합니다.
    mediaRecorder.start();
    setRecording(true);
    setPaused(false);
    setAudioURL(''); // 스트리밍 바를 숨기기 위해 audioURL 상태를 초기화합니다.

    // 녹음 시간을 관리하기 위한 로직
    setRecordingTime(0); // 녹음 시간을 0으로 초기화합니다.
    recordingTimeIntervalRef.current = setInterval(() => {
      setRecordingTime(prevTime => prevTime + 1); // 1초마다 녹음 시간을 업데이트합니다.
    }, 1000);

  } catch (error) {
    console.error('오디오 녹음 시작 중 오류 발생:', error);
  }
};



// 녹음 중지 함수
const stopRecording = () => {
  if (mediaRecorderRef.current) {
    mediaRecorderRef.current.stop();
    setRecording(false);
    clearInterval(recordingTimeIntervalRef.current); // interval을 정지합니다.
  }
};

const pauseRecording = () => {
  if (mediaRecorderRef.current && recording) {
    mediaRecorderRef.current.pause();
    setPaused(true);
    clearInterval(recordingTimeIntervalRef.current); // 녹음이 일시 정지될 때 타이머 정지
  }
};

const resumeRecording = () => {
  if (mediaRecorderRef.current && paused) {
    mediaRecorderRef.current.resume();
    setPaused(false);
    recordingTimeIntervalRef.current = setInterval(() => { // 녹음이 재개될 때 타이머 다시 시작
      setRecordingTime(prevTime => prevTime + 1);
    }, 1000);
  }
};

const handleFinishRecording = () => {
  stopRecording();

  // 현재 선택된 파일의 수를 기준으로 파일 이름에 사용할 인덱스(순번)를 결정합니다.
  const recordingIndex = selectedFiles.length + 1;
  const fileName = `recording${recordingIndex}.mp3`;

  // 녹음된 오디오를 파일 객체로 변환합니다. MIME 타입을 'audio/mpeg'으로 설정하여 MP3 형식을 명시합니다.
  const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
  const newFile = new File([audioBlob], fileName, { type: 'audio/mpeg' });

  // selectedFiles 및 selectedFileNames 상태에 새로운 파일 객체와 파일 이름을 추가합니다.
  setSelectedFiles(prevFiles => [...prevFiles, newFile]);
  setSelectedFileNames(prevNames => [...prevNames, fileName]);
};


const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};


  // 여러 파일을 처리할 수 있도록 handleChange 함수 수정
  const handleChange = (event) => {
    const files = Array.from(event.target.files); // FileList를 배열로 변환
    if (files.length) {
      setSelectedFiles(prevFiles => [...prevFiles, ...files]); // 이전 파일 배열과 새로운 파일 배열을 합쳐서 상태를 업데이트
      setSelectedFileNames(prevNames => [...prevNames, ...files.map(file => file.name)]); // 파일 이름 배열에 새로운 파일 이름들 추가
    }
  };

  const handleModelNameChange = (event) => {
    const value = event.target.value;
    if (/^[a-zA-Z0-9\s]*$/.test(value)) { // 알파벳, 숫자, 공백만 허용
      setModelName(value);
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleRemoveFile = (index) => {
    // 선택한 파일과 파일 이름에서 해당 인덱스의 항목을 제거합니다.
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newFileNames = selectedFileNames.filter((_, i) => i !== index);
  
    setSelectedFiles(newFiles);
    setSelectedFileNames(newFileNames);
  
    // 모든 파일이 제거되었다면 오디오 스트리밍 바를 숨깁니다.
    if (newFiles.length === 0) {
      setAudioURL('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
      // 모델 이름이 비어 있는지 확인
  if (modelName.trim() === '') {
    alert("모델 이름을 입력해주세요.");
    return; // 모델 이름이 비어 있으면 함수 종료
  }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('model_name', modelName);
    formData.append('total_epoch', totalEpoch);
    // 설정 값들 추가
    formData.append('sampling_rate', "48000");
    formData.append('rvc_version', "v2");
    formData.append('f0method', "rmvpe");
    formData.append('hop_length', "128");
    formData.append('batch_size', "16");
    formData.append('gpu', "0");
    formData.append('pitch_guidance', "true");
    formData.append('pretrained', "true");
    formData.append('custom_pretrained', "false");
    // 실제 파일 객체를 formData에 추가
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('192.168.0.187:8000/train/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        console.log("Data successfully sent to the server.");
        setShowOptions(true);
      } else {
        console.error("Failed to send data to the server.");
      }
    } catch (error) {
      console.error("Error sending data to the server:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <CustomAppBar />
      <main>
        <Container sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 400 }}>
          <Typography variant="h4" gutterBottom align="center">목소리 만들기</Typography>
          <Typography variant="body1" align="center" sx={{ mt: 2, mb: 4 }}>
            맞춤형 음성 훈련 모델 생성
          </Typography>

      {/* 녹음 관련 UI 수정 */}
      <Box textAlign="center" my={4}>
        {recording ? (
          <>
            {paused ? (
              <Button onClick={resumeRecording} variant="outlined" color="primary" startIcon={<MicIcon />}>
                재개
              </Button>
            ) : (
              <Button onClick={pauseRecording} variant="outlined" color="primary" startIcon={<PauseIcon />}>
                일시 정지
              </Button>
            )}
            <Button onClick={handleFinishRecording} variant="contained" color="primary" startIcon={<StopIcon />} sx={{ ml: 2 }}>
              완료
            </Button>
          </>
        ) : (
          <Button onClick={startRecording} variant="outlined" color="primary" startIcon={<MicIcon />}>
            녹음 시작
          </Button>
        )}
        {audioURL && (
          <Box mt={2}>
            <AudioPlayer src={audioURL} controls />
          </Box>
        )}
              {/* 녹음 시간 표시 */}
      {recording && (
        <Typography variant="h6">{formatTime(recordingTime)}</Typography>
      )}
      </Box>

      {/* 음성 파일 업로드 섹션 */}
      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="body2" align="center" sx={{ mb: 1 }}>
          직접 녹음을 하거나, 녹음 파일을 업로드해주세요. <br/>녹음은 15초 이상, 음역대가 다양할수록 좋습니다.<br/>(파일은 여러 개 선택 가능)
        </Typography><br/>
        <Button variant="outlined" component="label" sx={{ mb: 2 }}>
          녹음 파일 업로드
          <input type="file" hidden onChange={handleChange} accept=".m4a,.wav,.mp3" multiple/>
        </Button>
        {selectedFileNames.length > 0 && (
          <Box sx={{ mt: 2, width: '100%' }}>
  <Typography variant="body2" align="center" sx={{ mb: 1 }}>선택한 파일들:</Typography>
  {selectedFileNames.map((name, index) => (
    <Box 
      key={index} 
      sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', // 이름과 X 버튼을 각각의 끝으로 밀어냅니다.
        alignItems: 'center',
        width: '100%', // 전체 너비를 사용하도록 설정
      }}
    >
      <Typography variant="body2">{name}</Typography>
      <Button size="small" onClick={() => handleRemoveFile(index)}>X</Button>
    </Box>
  ))}
</Box>

)}
      </Box>
              <br/>
      <form>
      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 400 }}>
        <TextField
        error={error}
        label="Model Name"
        variant="outlined"
        fullWidth
        value={modelName}
        onChange={handleModelNameChange}
        
      />
      <Typography variant="body2" sx={{ mt: 0 }}>
        모델의 이름을 적어주세요(특수문자 불가)
      </Typography>

    <br/>
    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 400 }}>
          <FormControl fullWidth>
            <InputLabel>Total Epoch</InputLabel>
            <Select
              value={totalEpoch}
              label="Total Epoch"
              onChange={(e) => setTotalEpoch(e.target.value)}
            >
              <MenuItem value="100">100</MenuItem>
              <MenuItem value="200">200</MenuItem>
              <MenuItem value="300">300</MenuItem>
              <MenuItem value="400">400</MenuItem>
              <MenuItem value="500">500</MenuItem>
            </Select>
            <Typography variant="body2" sx={{ mt: 1 }}>
            Epoch는 음성 변환 모델에서, 전체 데이터셋(동일 목소리 녹음 파일들)을 한 번 완전히 통과하고 학습하는 단계를 말합니다.
    </Typography>
          </FormControl>
          </Box>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
            sx={{ mt: 3, mb: 2, width: '100%' }}
          >
            모델 생성
          </Button>
          {isSubmitting && (
            <Box display="flex" justifyContent="center">
              <CircularProgress size={24} />
            </Box>
          )}
        </Box>
      </form>
      
      {showOptions && (
          <>
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>
                나만의 목소리 모델이 생성되었습니다!
              </Typography>
            </Box><br/>
            <Box sx={{ mt: 2, width: '100%', textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                내 목소리로 커버를 하고 싶다면?
              </Typography>
              <Button variant="contained" color="secondary" href="/inference" sx={{ margin: 1 }}>
                INFERENCE
              </Button><br/><br/>
              <Typography variant="h6" gutterBottom>
                내 목소리로 TTS를 해보고 싶다면?
              </Typography>
              <Button variant="contained" color="secondary" href="/tts" sx={{ margin: 1 }}>
                TTS
              </Button>
            </Box>
          </>
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