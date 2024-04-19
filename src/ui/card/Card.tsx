import React, { FunctionComponent } from "react";

interface ICardProps {
  title: string;

  thumbnailUrl: string;
  thumbnailCaption: string;

  onClick?: () => void;
}
const Card: FunctionComponent<ICardProps> = ({
  title,
  thumbnailUrl,
  thumbnailCaption,
  onClick,
}) => {
  const handleOnClick = () => {
    if (typeof onClick === "function") {
      onClick();
    }
  };

  return (
    <div className="card" onClick={handleOnClick}>
      <div className="card-thumbnail">
        <img src={thumbnailUrl} alt={thumbnailCaption} />
      </div>
      <div className="card-body">
        <h3>{title}</h3>
      </div>
    </div>
  );
};

export { Card };
export type { ICardProps };
