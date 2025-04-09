import React, { useState } from "react";
import CustomAppBar from "../components/CustomAppbar";
import record from "../images/record.jpg";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid"; // 수정: Unstable_Grid2를 Grid로 변경
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";

import "./produce.css";

function Produce() {
  const [selectedSinger, setSelectedSinger] = useState("");
  const [selectedSong, setSelectedSong] = useState("");
  const [rotation, setRotation] = useState(0);

  const handleSingerChange = (event) => {
    setSelectedSinger(event.target.value);
  };

  const handleSongChange = (event) => {
    setSelectedSong(event.target.value);
  };

  const handleSubmit = async () => {
    // 선택된 가수와 노래 정보를 이용하여 원하는 작업을 수행
    console.log("가수:", selectedSinger);
    console.log("노래:", selectedSong);

    // 필수 입력값을 확인하고 누락된 경우 사용자에게 알림
    if (!selectedSinger || !selectedSong) {
      alert("Please select a singer and a song.");
      return; // 누락된 입력값이 있으면 함수를 종료
    }

    // 이미지를 3600도 회전
    setRotation(rotation + 3600);

    // JSON 데이터를 생성
    const data = {
      singer: selectedSinger,
      song: selectedSong,
    };

    // 서버 URL을 지정
    const serverUrl = "http://localhost:8080/cover/making"; // 실제 서버 URL로 대체

    try {
      const response = await fetch(serverUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("POST 요청 실패");
      }

      const responseData = await response.json();
      // 서버 응답 처리
      console.log("서버 응답:", responseData);
      setTimeout(() => {
        alert("Submission has been completed.");
      }, 5000); // 5초 뒤에 알림 창
    } catch (error) {
      console.error("오류 발생:", error);
      setTimeout(() => {
        alert("An error has occurred.");
      }, 5000); // 5초 뒤에 알림 창
    }
  };

  const imageStyle = {
    width: "70%", // 이미지를 컨테이너에 맞게 크기 조정
    marginTop: 30,
    transform: `rotate(${rotation}deg)`,
    transition: "transform 5s ease-in-out",
    sx: {
      marginTop: 2,
    },
  };

  return (
    <div>
      <CustomAppBar />
      <Container>
        <Typography
          variant="h4"
          component="h2"
          marginTop={2}
          marginLeft={2}
          style={{ fontWeight: "bold", marginBottom: "20px" }}
        >
          Cover Song Production
        </Typography>
        <Grid container spacing={2}>
          {/* 화면 폭에 따라 Grid의 xs 설정을 변경 */}
          <Grid item xs={12} md={8}>
            <img src={record} alt="음반이미지" style={imageStyle} />
          </Grid>
          <Grid item xs={12} md={4}>
            <div>
              <p><strong>Singer Selection:</strong></p>
              <Select
                value={selectedSinger}
                onChange={handleSingerChange}
                style={{ width: "100%", marginBottom: "20px" }}
              >
                <MenuItem value="성시경">성시경</MenuItem>
                <MenuItem value="존박">존박</MenuItem>
                <MenuItem value="김동률">김동률</MenuItem>
                <MenuItem value="아이유">아이유</MenuItem>
                <MenuItem value="윈터">윈터</MenuItem>
              </Select>
            </div>
            <div>
              <p><strong>Song Selection:</strong></p>
              <Select
                value={selectedSong}
                onChange={handleSongChange}
                style={{ width: "100%", marginBottom: "20px" }}
              >
                <MenuItem value="밝게_빛나는_별이되어_비춰줄게">밝게 빛나는 별이되어 비춰줄게</MenuItem>
                <MenuItem value="헤어지자_말해요">헤어지자 말해요</MenuItem>
                <MenuItem value="야생화">야생화</MenuItem>
                <MenuItem value="홍연">홍연</MenuItem>
                <MenuItem value="사랑앓이">사랑앓이</MenuItem>
              </Select>
            </div>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              endIcon={<SendIcon />}
            >
              Send
            </Button>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default Produce;
