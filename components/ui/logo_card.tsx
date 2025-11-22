import { AspectRatio } from "@radix-ui/react-aspect-ratio"
import Image from "next/image"

const LogoCard = (params: { image_path: string }) => {
  return (
    <div className="inset-0 w-32 h-24">
      <AspectRatio ratio={1 / 1}>
        <Image src={params.image_path} fill alt={params.image_path} className="object-contain" />
      </AspectRatio>
    </div>
  )
}

export default LogoCard
