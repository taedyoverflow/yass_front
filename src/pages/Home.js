import React, { useState } from "react";

import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";

import Banner from "../components/Banner";
import CustomAppBar from "../components/CustomAppbar";
import MusicModal from "../components/MusicModal";
import taeImage from '../images/tae3.jpg';
import mirImage from '../images/mir3.jpg';
import joImage from '../images/jo.png';

import mir from '../music/mir.wav';
import taedy from '../music/tae.wav';

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

const cards = [
  {
    id: 1,
    title: "벚꽃엔딩",
    content: "태현[원곡:버스커버스커]",
    imageUrl:
      "https://cdn.discordapp.com/attachments/1214688422334300270/1214688422686359633/242656335971A81A24.gif?ex=660c7abf&is=65fa05bf&hm=e96da9d9a8a7d2a94eeb0cf1388e39435b502a5f18b95ad36f31da78eb53435c&",
    musicUrl: taedy
  },
  {
    id: 2,
    title: "밤양갱",
    content: "미령[원곡:비비]",
    imageUrl:
      "https://file.mk.co.kr/meet/neds/2022/08/image_readtop_2022_715474_16603105725136714.jpg",
      musicUrl: mir
  },
    {
    id: 3,
    title: "별 보러 가자",
    content: "명환[원곡:적재]",
    imageUrl:
      "https://cdn.discordapp.com/attachments/1219671602304782437/1219671602682265711/KIM.gif?ex=660c26b2&is=65f9b1b2&hm=9939b080c2838a85f0a5c678fdf69a4e48b7be3d5e90583ba74f140221bf24e0&",
      musicUrl: "https://cdn.discordapp.com/attachments/1219671602304782437/1219671894345777232/iloveyou.mp3?ex=660c26f8&is=65f9b1f8&hm=a1ab1490702275b83afaa1a3145c36346020f4b9b7a719c9a48cdd3e90bd7370&"
  },
  {
    id: 4,
    title: "헤픈 우연",
    content: "딘(DEAN)[원곡:헤이즈]",
    imageUrl:
      "https://cdn.discordapp.com/attachments/1214688422334300270/1214688422686359633/242656335971A81A24.gif?ex=660c7abf&is=65fa05bf&hm=e96da9d9a8a7d2a94eeb0cf1388e39435b502a5f18b95ad36f31da78eb53435c&",
    musicUrl: "https://cdn.discordapp.com/attachments/1214688422334300270/1214688670616129606/83bd8880a5e6ef80.mp3?ex=660c7afa&is=65fa05fa&hm=648151f4ef60483a666456c7832fe234649c182f05f5c9579f7e483ff32fba22&"
  },
  {
    id: 5,
    title: "눈,코,입",
    content: "폴블랑코[원곡:태양]",
    imageUrl:
      "https://cdn.discordapp.com/attachments/1163032016040755272/1163032016279834784/maxresdefault.jpg?ex=66125a78&is=65ffe578&hm=ce3e437875bdf4f7587993d4b43b93937d6d52f1ca9493dbaf3830aadcf71fff&",
    musicUrl: "https://cdn.discordapp.com/attachments/1163032016040755272/1163032985159860256/867dc73824b566a0.mp3?ex=66125b5f&is=65ffe65f&hm=6cc40a1da3667f43561f4cffe7b5f3e0c64cf53d57277738867e4481d9a0016c&"
  },
  {
    id: 6,
    title: "헤어지자 말해요",
    content: "성시경[원곡:박재정]",
    imageUrl:
      "https://cdn.discordapp.com/attachments/1159198793670078475/1159198794404077588/img.gif?ex=660da301&is=65fb2e01&hm=740f24c822dbee1d790020174db323e6ab13f8a57baa7850d24da911af646d26&",
    musicUrl: "https://cdn.discordapp.com/attachments/1159198793670078475/1159199289612976148/5645b316f4753bc8.mp3?ex=660da377&is=65fb2e77&hm=cc0e96576fe1e0f4f4bb891235a2417c752ace2499e0b69d65dccac43aa8531d&"
  },
  {
    id: 7,
  title: "I Love You",
    content: "김광석[원곡:안세하 Ver]",
    imageUrl:
      "https://cdn.discordapp.com/attachments/1219671602304782437/1219671602682265711/KIM.gif?ex=660c26b2&is=65f9b1b2&hm=9939b080c2838a85f0a5c678fdf69a4e48b7be3d5e90583ba74f140221bf24e0&",
      musicUrl: "https://cdn.discordapp.com/attachments/1219671602304782437/1219671894345777232/iloveyou.mp3?ex=660c26f8&is=65f9b1f8&hm=a1ab1490702275b83afaa1a3145c36346020f4b9b7a719c9a48cdd3e90bd7370&"
  },
  {
    id: 8,
    title: "오래된 노래",
    content: "자우림[원곡:김동률]",
    imageUrl:
      "https://cdn.discordapp.com/attachments/1139467680223608942/1139467680919851059/b456ce5aa6b29e20.gif?ex=660faef9&is=65fd39f9&hm=1b5710bd974e979b72734c22b9bde2924f8566655deb884190136cd812249766&",
    musicUrl: "https://cdn.discordapp.com/attachments/1139467680223608942/1139467837858136074/7ec79b847f0817f2.mp3?ex=660faf1e&is=65fd3a1e&hm=f4b629b36f46f11d886c9bc4ead168a8798d02bfdaeae3552d5b9f796bfe62ff&"
  },
  {
    id: 9,
    title: "사나이 청춘",
    content: "송가인[원곡:이찬원]",
    imageUrl: "https://cdn.discordapp.com/attachments/1153212287381930047/1153212287902031973/o1AavB7BLb5H637090258262774418.gif?ex=660a50a3&is=65f7dba3&hm=50ed4cd9125a264b85336a9ea3dc49dd7791a241aceb5b256fe36987ab0c4c2a&",
    musicUrl: "https://cdn.discordapp.com/attachments/1153212287381930047/1153213323953831936/61beebb8ff7c0379.mp3?ex=660a519a&is=65f7dc9a&hm=b78ec2f0a4ec7b6a50790c1a4d3c9a5932fe15a3c5e4e7a35d02c9b80d1a977f&"
  },
  {
    id: 10,
    title: "운이 좋았지",
    content: "선우정아[원곡:권진아]",
    imageUrl: "https://cdn.discordapp.com/attachments/1171098664924631090/1171098665121751082/swja_-__2019__SERENADE_LIVE_HD8.gif?ex=660ac91f&is=65f8541f&hm=297ce2c1074239faf79ddbd73187f36cd012f024b99625a1962baa8db60697fe&",
    musicUrl: "https://cdn.discordapp.com/attachments/1171098664924631090/1171098871934488688/7b6e024beb53e207.mp3?ex=660ac951&is=65f85451&hm=2a5e812c83455c269323d56a8ff857054f13dced726dd3dddceffb32720a6462&"
  },
  {
    id: 11,
    title: "P.R.R.W",
    content: "임영웅[원곡:윤하]",
    imageUrl: "https://cdn.discordapp.com/attachments/1179131844025929788/1179131844566982737/WE50209363_ori.gif?ex=660c531a&is=65f9de1a&hm=e3225d86b906e71e2ba66eec9b37d22b5d81fccc12b63d670210e0ae79ecf0d5&",
    musicUrl: "https://cdn.discordapp.com/attachments/1179131844025929788/1179131968714195138/prrw_.mp3?ex=660c5338&is=65f9de38&hm=110f952ee6778f206559fbca8a29e0a899f31c681194b2e2ab1b2d073ffe479b&"
  },
  {
    id: 12,
    title: "You Are My Everything",
    content: "이수현(악뮤)[원곡:거미]",
    imageUrl: "https://cdn.discordapp.com/attachments/1171099765811990689/1171099766533390366/img-1.gif?ex=660aca26&is=65f85526&hm=5df39a825b11989832e598e36a11e2b4596384333c45062c628b14b517b971c6&",
    musicUrl: "https://cdn.discordapp.com/attachments/1171099765811990689/1171100422417678336/247ecac80051c0f8.mp3?ex=660acac2&is=65f855c2&hm=5747419d09306fbe5a7990732ecffda7aa7d462bb053856ac095792e596e026f&"
  },
];

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태를 관리
  const [currentMusic, setCurrentMusic] = useState(null); // 현재 재생 중인 음악 정보를 저장

  const openModal = (music) => {
    setCurrentMusic(music); // 현재 재생 중인 음악 정보 설정
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setCurrentMusic(null); // 모달 닫을 때 현재 음악 정보 초기화
    setIsModalOpen(false);
  };

  return (
    <>
      <CustomAppBar />
      <main>
        {/* Hero unit */}
        <Box
          sx={{
            bgcolor: "background.paper",
            pt: 8, // 여기서 pt (padding-top) 값을 조정해 주세요. 예를 들어, pt: 8 대신 pt: 10 등으로 변경하여 공간을 더 확보할 수 있습니다.
          }}
        >
          <Container maxWidth="lg">
            <Banner />
          </Container>
        </Box>
        <Container sx={{ py: 8 }} maxWidth="md">
          {/* End hero unit */}
          <Typography gutterBottom variant="h4" component="h2">
            AI Cover Music List
          </Typography>
          <Grid container spacing={4}>
            {cards.map((card) => (
              <Grid item key={card.id} xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardMedia
                    component="img"
                    sx={{ height: 140 }} // 여기서 이미지의 높이를 조절할 수 있습니다. 필요에 따라 값 조정
                    image={
                      card.id === 1 ? taeImage :
                      card.id === 2 ? mirImage : // id가 2인 경우의 조건을 추가
                      card.id === 3 ? joImage :
                      card.imageUrl
                    }
                    alt={card.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {card.title}
                    </Typography>
                    <Typography>{card.content}</Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => openModal(card)}>Play</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
        {/* 모달 컴포넌트 */}
        <MusicModal open={isModalOpen} handleClose={closeModal} currentMusic={currentMusic} />
      </main>
      {/* Footer */}
      <Box sx={{ bgcolor: "background.paper", p: 6 }} component="footer">
        <Typography variant="h6" align="center" gutterBottom>
          음악만이 나라에서 허락한 유일한 마약이니까
        </Typography>
        <Copyright />
      </Box>
      {/* End footer */}
    </>
  );
                }  