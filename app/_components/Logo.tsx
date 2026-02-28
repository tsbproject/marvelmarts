import Image from "next/image"
import Link from "next/link"


export default function Logo() {
    return(
        <div className="relative -top-5 xs:top-4 xs:left-10 left-2 xs:w-20 
        xs-h-auto xxs:w-20 xxs:h-auto xxs:top-4 xxs:left-12 w-30 md:w-100 h-auto">
        <Link href="/">
          <Image 
          src="/logo.png"
          alt="Marvelmarts logo"
          width={100}
          height={60}
        //    style={{ width: 'auto', height: 'auto' }}
           priority
           className="object-contain"
          />

          </Link>
        </div>
        
    )
}