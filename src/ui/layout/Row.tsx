import React, { AriaRole, FunctionComponent, ReactElement } from "react";
import { IColumnProps } from "./Column";

interface IRowProps {
  role?: AriaRole;

  children: ReactElement<IColumnProps> | Array<ReactElement<IColumnProps>>;

  className?: string;
}

const Row: FunctionComponent<IRowProps> = ({ role, children, className }) => {
  return (
    <div className={`row ${className ? className : ""}`} role={role}>
      {children}
    </div>
  );
};

export { Row };
export type { IRowProps };
