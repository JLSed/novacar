import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";

type props = {
  user: string;
  description: string;
};

const ReviewCard = ({ user, description }: props) => {
  return (
    <Item variant={"outline"}>
      <ItemContent>
        <ItemTitle>{user}</ItemTitle>
        <ItemDescription>{description}</ItemDescription>
      </ItemContent>
    </Item>
  );
};

export default ReviewCard;
