import React, { AriaRole, FunctionComponent, ReactElement } from "react";
import { IRowProps } from "./Row";

interface IContainerProps {
  role?: AriaRole;

  children: ReactElement<IRowProps> | Array<ReactElement<IRowProps>>;

  className?: string;
}

const Container: FunctionComponent<IContainerProps> = ({
  role,
  children,
  className,
}) => {
  return (
    <div className={`container ${className ? className : ""}`} role={role}>
      {children}
    </div>
  );
};

export { Container };
export type { IContainerProps };
