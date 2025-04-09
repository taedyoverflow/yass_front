import React, { useState, useEffect } from "react";
import { Container, Typography, Box, Button, Select, MenuItem, Modal, FormControl, InputLabel, Slider, Link, CircularProgress } from "@mui/material";
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

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};


export default function Inference() {
  const [inputAudio, setInputAudio] = useState(null);
  const [pthFiles, setPthFiles] = useState([]);
  const [indexFiles, setIndexFiles] = useState([]);
  const [pthFile, setPthFile] = useState('');
  const [indexFile, setIndexFile] = useState('');
  const [indexRate, setIndexRate] = useState(0.6);
  const [pitchInput, setPitchInput] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultAudio, setResultAudio] = useState(null);
  const [error, setError] = useState('');
  const [selectedFileName, setSelectedFileName] = useState("");
  const [openModal, setOpenModal] = useState(false);
  // 상태 및 함수 정의...
  useEffect(() => {
    // PTH 파일 목록 조회
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
    
  // Index 파일 목록 조회
  const fetchIndexFiles = async () => {
    try {
      const response = await fetch("http://192.168.0.187:8000/list-index-files/");
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setIndexFiles(data); // "None"을 여기에 추가하지 않습니다.
    } catch (error) {
      console.error("Could not fetch index files:", error);
    }
  };
  
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

const handlePitchInputChange = (event, newValue) => {
    setPitchInput(newValue);
};

const handleSubmit = async () => {
    if (!inputAudio || !pthFile) {
        alert("Please fill in all required fields.");
        return;
    }

    setIsSubmitting(true); // 요청 시작 시 isSubmitting을 true로 설정
    setError('');
    setResultAudio(null);

    const formData = new FormData();
    formData.append('input_audio', inputAudio);
    formData.append('pth_file', pthFile);
    formData.append('index_file_path', indexFile !== 'None' ? indexFile : ''); // 파일 경로를 문자열로 전송, 'None'인 경우 빈 문자열 전송
    formData.append('index_rate', String(indexRate));
    formData.append('f0up_key', String(pitchInput));
    formData.append('filter_radius', '3');
    formData.append('rms_mix_rate', '1.0');
    formData.append('protect', '0.33');
    formData.append('hop_length', '128');
    formData.append('f0method', 'rmvpe');
    formData.append('split_audio', 'False');
    formData.append('f0autotune', 'False');
    formData.append('clean_audio', 'False');
    formData.append('clean_strength', '0.7');
    formData.append('export_format', 'WAV');

    try {
        const response = await fetch('http://192.168.0.187:8000/convert-audio/', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.blob(); // 서버로부터 받은 응답을 Blob으로 변환
        console.log(data); // 변환된 Blob 데이터를 콘솔에 로그로 출력

        const audioURL = URL.createObjectURL(data); // Blob 데이터로부터 오디오 URL 생성
        setResultAudio(audioURL); // 생성된 오디오 URL을 상태에 설정하여 재생 가능하게 함
    } catch (error) {
        console.error('Error during voice transformation:', error);
        setError('Failed to transform the voice. Please try again.');
    } finally {
        setIsSubmitting(false);
    }
};

const handleChange = async (event) => {
  const selectedFile = event.target.files[0];
  if (selectedFile) {
    // 파일 이름을 상태에 저장
    setSelectedFileName(selectedFile.name);
    setInputAudio(selectedFile);

    // 파일 이름에서 ID 추출
    const fileID = selectedFile.name.split('_vocals.wav')[0];
    console.log(fileID); // 콘솔에 fileID 출력
    
    try {
      // 서버에 반주 파일 존재 여부 확인 요청
      const response = await fetch(`http://192.168.0.187:8000/check-accompaniment/${fileID}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (!data.exists) {
        // 반주 파일이 없으면 모달 열기
        setOpenModal(true); 
        // 반주 파일이 없으므로 파일 선택 상태 초기화
        setInputAudio(null);
        setSelectedFileName("");
        event.target.value = ""; // input file 요소의 선택된 파일을 초기화
      } else {
        // 반주 파일이 있으면 모달 닫기
        setOpenModal(false);
      }
    } catch (error) {
      console.error("Could not check accompaniment file existence:", error);
      // 에러 발생 시 모달 열기
      setOpenModal(true); 
    }
  }
};


return (
  <>
  <Modal
  open={openModal}
  onClose={() => setOpenModal(false)}
  aria-labelledby="modal-modal-title"
  aria-describedby="modal-modal-description"
>
  <Box sx={modalStyle}>
    <Typography id="modal-modal-title" variant="h6" component="h2">
      경고
    </Typography>
    <Typography id="modal-modal-description" sx={{ mt: 2, mb: 2 }}>
      합성할 반주 파일이 없습니다. 먼저 유튜브에서 음원을 다운로드 받아 분리를 진행해주세요.
    </Typography>
    <Button 
      onClick={() => setOpenModal(false)} 
      variant="contained" 
      sx={{ mt: 2 }}
    >
      확인
    </Button>
  </Box>
</Modal>
    <CustomAppBar />
    <main>
<Container sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }} maxWidth="md">
      <Typography variant="h4" gutterBottom>보컬 목소리 변환</Typography>
      <Box component="form" noValidate sx={{ mt: 3, width: '100%', maxWidth: 400 }}>

      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
      <Typography variant="body2" sx={{ marginBottom: 1 }}>반주와 분리된(변환 전) 보컬 파일을 업로드해주세요</Typography>
      <label htmlFor="vocal-upload">
        <input
          type="file"
          id="vocal-upload"
          style={{ display: 'none' }}
          onChange={handleChange}
          accept=".wav,.mp3"
        />
        <Button variant="outlined" component="span">
          보컬 파일 선택
        </Button>
      </label>
      {selectedFileName && (
        <Typography variant="body2" sx={{ marginTop: 1 }}>
          선택한 파일: {selectedFileName}
        </Typography>
      )}
    </Box>


  <br/><br/>
  <FormControl fullWidth sx={{ mt: 2 }}>
  <InputLabel>Pth 파일</InputLabel>
  <Select
    value={pthFile}
    label="Pth 파일"
    onChange={handlePthFileChange}
    sx={{ width: '100%' }}
  >
    {pthFiles.map((file, index) => (
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


  <br/><br/>
  <Box sx={{ mt: 2 }}>
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

  <br/><br/>
  <Box sx={{ mt: 2 }}>
    <Typography gutterBottom>피치 입력</Typography>
    <Slider
      value={pitchInput}
      onChange={handlePitchInputChange}
      step={1}
      min={-24}
      max={24}
      valueLabelDisplay="auto"
    />
    <Typography variant="body2" sx={{ mt: 1 }}>
      (권장)<br/>
    남자모델 → 여자노래= -2 ~ -4 <br/>
    여자모델 → 남자노래= +2 ~ +4
    </Typography>
  </Box>

<br/>
<Button
  variant="contained"
  onClick={handleSubmit}
  disabled={isSubmitting}
  sx={{ mt: 3, mb: 2, width: '100%' }}
>
  변환
</Button>
{isSubmitting && (
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
        목소리 변환 및 합성중...
      </Typography>
    </Box>
  </Box>
)}


{resultAudio && (
  <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
    <Box>
      <audio controls src={resultAudio} />
      <Button
        variant="contained"
        color="secondary"
        sx={{ mt: 2, display: 'block', mx: 'auto' }} // `mx: 'auto'` 추가로 버튼도 중앙 정렬
        onClick={() => { window.location.href = '/train'; }}
      >
        목소리 만들러 가기
      </Button>
    </Box>
  </Box>
)}



  {error && (
    <Typography color="error" sx={{ mt: 2 }}>
      {error}
    </Typography>
  )}
<br/>
    <br/>
  
</Box>

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