// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import mainBanner from '../images/main_banner.png';
import todaysMusic from '../images/todays_music.png';
import todaysSinger from '../images/todays_singer.png';

import './banner.css';
// import required modules
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

export default function Banner() {

  return (
    <>
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="mySwiper"
      >
        <SwiperSlide>
          <img src={mainBanner} alt="메인 배너" />
        </SwiperSlide>
        <SwiperSlide>
          <img src={todaysMusic} alt="오늘의 추천 음악" />
        </SwiperSlide>
        <SwiperSlide>
          <img src={todaysSinger} alt="오늘의 추천 가수" />
        </SwiperSlide>
      </Swiper>
    </>
  );
}
