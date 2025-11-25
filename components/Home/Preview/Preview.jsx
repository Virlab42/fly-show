import './Preview.scss'
import Image from 'next/image'
import Link from 'next/link'

export default function Preview(){
    return(
        <>
            <div className='preview'>
                <div className='preview-card preview-column-one'>
                <Link href='/products/iqos' className=''>
                    <h3>iLuma</h3>
                    <p>от 5 500 ₽</p>
                    <Image src={'/Home/Preview/iluma.png'} alt='IQOS iLuma' width={500} height={700} />
                </Link>
                    </div>
                <div className='preview-column-two'>
                    <Link href='/products/terea' className='preview-card'>
                        <h3>Стики Terea</h3>
                        <p>от 3 600 ₽</p>
                        <Image src={'/Home/Preview/terea.png'} alt='IQOS iLuma' width={500} height={700} />
                    </Link>
                    <Link href='/products/iqosexclusive' className='preview-card'>
                        <h3>Эксклюзивы</h3>
                        <p>от 12 000 ₽</p>
                        <Image src={'/Home/Preview/limited.webp'} alt='IQOS iLuma' width={500} height={700} />
                    </Link>
                    <Link href='/products/heets' className='preview-card'>
                        <h3>Стики Heets</h3>
                        <p>от 6 000 ₽</p>
                        <Image src={'/Home/Preview/heets.png'} alt='IQOS iLuma' width={500} height={700} />
                    </Link>
                    <Link href='/products/devices' className='preview-card'>
                        <h3>Аксессуары</h3>
                        <p>от 1490 ₽</p>
                        <Image src={'/Home/Preview/device.png'} alt='IQOS iLuma' width={500} height={700} />
                    </Link>
                </div>
            </div>
            <div className='preview mob'>
                <div className='preview-column-two'>
                    <Link href='/products/iqosexclusive' className='preview-card'>
                        <h3>Эксклюзивы</h3>
                        <p>от 12 000 ₽</p>
                        <Image src={'/Home/Preview/limited.webp'} alt='IQOS iLuma' width={500} height={700} />
                    </Link>
                    <Link href='/products/heets' className='preview-card'>
                        <h3>Стики Heets</h3>
                        <p>от 6 000 ₽</p>
                        <Image src={'/Home/Preview/heets.png'} alt='IQOS iLuma' width={500} height={700} />
                    </Link>
                </div>
            </div>
        </>
    )
}