import Image from "next/image"


export default function Logo() {
    return(
        <div className="w-100 h-auto">
          <Image 
          src="/logo.png"
          alt="Marvelmarts logo"
          width={100}
          height={60}
          />

        </div>
        
    )
}