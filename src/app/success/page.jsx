import Link from "next/link";
import "./Success.scss";
import Image from "next/image";

export default function Success() {
  return (
    <>
      <div className="success-container">
        <div className="hero-left">
          <div className="text-container">
          </div>
          <div className="cta-container">
            
            <h1>
              <span>Заказ оформлен</span>
            </h1>
            <p>
              Мы свяжемся с вами в ближайшее время для подтверждения
            </p>
            <Link href='/'>На главную</Link>
          </div>
        </div>
      </div>
    </>
  );
}
