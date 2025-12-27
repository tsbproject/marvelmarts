import Image from "next/image"
import Link from "next/link"


export default function Logo() {
    return(
        <div className="relative -top-5 left-2 w-30 md:w-100 h-auto">
        <Link href="/">
          <Image 
          src="/logo.png"
          alt="Marvelmarts logo"
          width={100}
          height={60}
          />

          </Link>
        </div>
        
    )
}