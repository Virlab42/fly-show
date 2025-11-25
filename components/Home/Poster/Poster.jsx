'use client'
import Link from "next/link";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './Poster.scss'

import Image from "next/image";

export default function Poster() {
    return (
      <>
        <div className="poster-container">
            <Swiper
              slidesPerView={1}
              spaceBetween={30}
              pagination={{
                  el: ".swiper-pagination",
                  clickable: true,
                  renderBullet: (index, className) => {
                  return `<span class="${className}"></span>`;
                  },
              }}
              modules={[ Pagination]}
              className="poster"
          >
              <SwiperSlide>
                <Link href={'/products/iqosexclusive'} className="services-card">
                    <div>
                      <p>IQOS iLuma Limited Edition</p>
                      <span>В наличии! Успевайте купить!</span>
                    </div>
                    <strong>LIMITED</strong>
                </Link>
                <Image src={'/Home/Poster/poster.webp'} alt="IQOS Iluma" width={1000} height={1000} />
              </SwiperSlide>
              <SwiperSlide>
                <Link href={'/products/terea'} className="services-card">
                    <div>
                      <p>Terea for IQOS ILUMA</p>
                      <span>Стики Terea для IQOS Iluma — попробуйте и&nbsp;откройте для себя новый уровень наслаждения!</span>
                    </div>
                </Link>
                <Image src={'/Home/Poster/poster2.png'} alt="IQOS Iluma" width={1000} height={1000} />
              </SwiperSlide>
              {/* <SwiperSlide>
                <div className="services-card">
                    <div>
                      <p>Мы есть в telegram!</p>
                      <span>Подпишись и узнавай всю актуальную информация о мире премиального электронного парения в нашем канале</span>
                    </div>
                    <strong>IlumaStore</strong>
                </div>
                <Image src={'/Home/Poster/poster.webp'} alt="IQOS Iluma" width={1000} height={1000} />
              </SwiperSlide> */}
              
            <div className="swiper-pagination"></div>
          </Swiper>
          </div>
      </>
    );
  }