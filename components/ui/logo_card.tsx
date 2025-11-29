import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import Image from "next/image";

type props = {
  image_path: string;
  className?: string;
};

const LogoCard = ({ image_path, className }: props) => {
  return (
    <div className={`inset-0 w-32 h-24 ${className || ""}`}>
      <AspectRatio ratio={1 / 1}>
        <Image
          src={image_path}
          fill
          alt={image_path}
          className="object-contain"
        />
      </AspectRatio>
    </div>
  );
};

export default LogoCard;
