import React, { useEffect, useRef } from "react";
import Modal from "@mui/material/Modal";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const MusicModal = ({ open, handleClose, currentMusic }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = useRef(new Audio(currentMusic?.musicUrl)); // 오디오 요소를 위한 ref

  // 재생/일시 정지 토글 함수
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(error => console.log(error));
    }
  };

  // 모달이 열릴 때마다 오디오를 재설정하고 자동 재생
  useEffect(() => {
    if (open && currentMusic) {
      audioRef.current = new Audio(currentMusic.musicUrl);
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [open, currentMusic]);

  // 모달이 닫힐 때 오디오 정지
  useEffect(() => {
    if (!open) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={() => {
        handleClose();
        setIsPlaying(false); // 모달을 닫을 때 재생 상태 초기화
      }}
      aria-labelledby="music-modal-title"
      aria-describedby="music-modal-description"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: "80%",
          backgroundColor: "#fff",
          borderRadius: "8px",
          padding: "16px",
          textAlign: "center",
          position: "relative", // IconButton 위치 조정을 위해 추가
        }}
      >
        <IconButton
          onClick={() => {
            handleClose();
            setIsPlaying(false); // 닫기 버튼 클릭시 재생 상태 초기화
          }}
          sx={{
            position: "absolute",
            top: "8px",
            right: "8px",
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h5" id="music-modal-title">
          {currentMusic ? currentMusic.title : "No Title"}
        </Typography>
        <Box
          sx={{
            fontSize: "48px",
            marginTop: "16px",
          }}
        >
          {isPlaying ? (
            <PauseCircleOutlineIcon fontSize="inherit" onClick={togglePlay} />
          ) : (
            <PlayCircleOutlineIcon fontSize="inherit" onClick={togglePlay} />
          )}
        </Box>
        <Typography variant="body1" id="music-modal-description">
          {currentMusic ? currentMusic.content : "No Content"}
        </Typography>
      </Box>
    </Modal>
  );
};

export default MusicModal;
