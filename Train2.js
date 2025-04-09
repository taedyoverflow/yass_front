import React, { useState } from "react";
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

export default function Train() {
  const [modelName, setModelName] = useState('');
  const [totalEpoch, setTotalEpoch] = useState('100');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [error, setError] = useState(false);


  const handleModelNameChange = (event) => {
    const value = event.target.value;
    if (/^[a-zA-Z0-9\s]*$/.test(value)) { // 알파벳, 숫자, 공백만 허용
      setModelName(value);
      setError(false);
    } else {
      setError(true);
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

    try {
      const response = await fetch('http://localhost:8000/train/', {
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
        <Container sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }} maxWidth="md">
          <Typography variant="h4" gutterBottom align="center">목소리 만들기</Typography>
          <Typography variant="body1" align="center" sx={{ mt: 2, mb: 4 }}>
            맞춤형 음성 훈련 모델 생성
          </Typography>

      <form>
        <Box sx={{ width: '400px', display: 'flex', flexDirection: 'column', gap: 1 }}>
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