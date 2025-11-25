import './About.scss'
import Image from 'next/image'
import Link from 'next/link'

export default function About(){
    return(
        <>
            <div id='about' className='about'>
                <Image src={'/Home/About/about.jpg'} width={740} height={800} alt='О шоу надувных подушек' />
                <div className='about-text'>
                    <h2>Создадим реквизит под ваш сценарий</h2>
                    <div className='about-card'>
                        <span>Ваш логотип</span>
                        <p>Добавим фирменный стиль: подушки с вашим логотипом станут узнаваемым реквизитом на каждом шоу</p>
                    </div>
                    <div className='about-card'>
                        <span>Особая форма</span>
                        <p>Сердце, корона, звезда или что-то уникальное — мы создаём реквизит по вашему сценарию</p>
                    </div>
                    <div className='about-card'>
                        <span>Ваш логотип</span>
                        <p>Соберём комплект именно под ваше мероприятие: от маленького шоу до масштабного фестиваля</p>
                    </div>
                    <Link href='' type="button" data-bs-toggle="modal" data-bs-target="#exampleModal">Создать шоу</Link>
                </div>
            </div>
        </>
    )
}