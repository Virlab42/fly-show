import Image from "next/image";
import './Promo.scss'
import Link from "next/link";

export default function Promo() {
  return (
    <>
      <div className="projects">
        <div className="card-project card-project-title">
          <div>
            <h2>Сделайте праздник, который запомнят</h2>
            <p className="text-title">Зрелищные надувные подушки — это вау-эффект, который сразу конвертируется в доход</p>
          </div>
          <Link href='' type="button" data-bs-toggle="modal" data-bs-target="#exampleModal">Создать шоу</Link>
        </div>
        <div className="card-project">
          <Image src={'/Home/Promo/1.jpg'} width={800} height={500} alt="Надувное шоу"/>
        </div>
        <div className="card-project">
          <Image src={'/Home/Promo/4.jpg'} width={800} height={500} alt="Надувные подушки"/>
        </div>
        <div className="card-project">
          <Image src={'/Home/Promo/3.jpg'} width={800} height={500} alt="Батуты"/>
        </div>
        <div className="card-project">
          <Image src={'/Home/Promo/2.jpg'} width={800} height={500} alt="Надувное шоу под заказ"/>
        </div>
      </div>
    </>
  );
}
