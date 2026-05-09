import Image from "next/image"
import Link from "next/link"


export default function Logo() {
    return(
        <div className="relative -top-5 xs:top-4 xs:left-10 left-2 xs:w-35 
        xs-h-auto xxs:w-35 xxs:h-auto xxs:top-2 xxs:left-8 w-30 md:w-100 2xl:-top-4 2xl:-left-10 h-auto">
        <Link href="/">
          <img 
          src="/logo1-white.png"
          alt="Marvelmarts logo"
          width={100}
          height={60}
        //    style={{ width: 'auto', height: 'auto' }}
          //  priority
          //  quality={100}
           className="object-contain w-60 "
          />

          </Link>
        </div>
        
    )
}