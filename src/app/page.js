import Image from "next/image";
import "./main.scss";
import Hero from "../../components/Home/Hero/Hero";
import About from "../../components/Home/About/About";
import New from "../../components/Home/New/New";
import Exclusive from "../../components/Home/Exclusive/Exclusive";
import Reviews from "../../components/Home/Reviews/Reviews";
import Promo from "../../components/Home/Projects/Promo";
import Questions from "../../components/Home/Questions/Questions";
import OrderCalculator from "../../components/Home/Calculator/Calculator";
import Categories from "../../components/Home/Categories/Categories";
import Clips from "../../components/Home/Clips/Clips";

export const metadata = {
  title: "Надувной реквизит для профессиональных шоу и мероприятий",
  description: "Каталог надувного реквизита для ивентов, праздников и корпоративных шоу. Подушки, аттракционы и декор для организаторов, аниматоров и event-агентств.",
  alternates: {
    canonical: `https://naduvnoeshow.ru/products/podushki`,
  },
  openGraph: {
    title: "Надувной реквизит для профессиональных шоу и мероприятий",
    description: "Каталог надувного реквизита для ивентов, праздников и корпоративных шоу. Подушки, аттракционы и декор для организаторов, аниматоров и event-агентств.",
    url: `https://naduvnoeshow.ru/products/podushki`,
    images: [
      {
        url: `/favicon/web-app-manifest-512x512`,
        alt: `Надувное шоу`,
      },
    ],
  },
};

export default function Home() {
  return (
    <>
      <h1 className="hidden-h1">
        Надувной реквизит для запуска шоу в вашем городе. Производим шоу гигантских подушек и надувной реквизит из ткани премиум качества и дорогой, качественной фурнитуры!
      </h1>
      <Hero />
      <Categories />
      <New title="Наши новинки"/>
      <Exclusive/>
      <About />
      <Clips />
      {/* <OrderCalculator /> */}
      <Questions />
      <Reviews />
      <Promo />
    </>
  );
}
