import React, { AriaRole, FunctionComponent, ReactNode } from "react";

type LayoutSize = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

interface IColumnProps {
  size?: LayoutSize;
  sizeMD?: LayoutSize;
  sizeLG?: LayoutSize;

  centered?: boolean;

  role?: AriaRole;
  children: ReactNode | Array<ReactNode>;

  className?: string;
}

const Column: FunctionComponent<IColumnProps> = ({
  size,
  sizeMD,
  sizeLG,
  centered,
  role,
  children,
  className,
}) => {
  let computedClassName = `column ${centered ? "centered" : ""}`;

  if (size != null) {
    computedClassName += ` column-${size}`;
  }

  if (sizeMD != null) {
    computedClassName += ` column-md-${sizeMD}`;
  }

  if (sizeLG != null) {
    computedClassName += ` column-lg-${sizeLG}`;
  }

  return (
    <div
      className={`${computedClassName} ${className ? className : ""}`}
      role={role}
    >
      {children}
    </div>
  );
};

Column.defaultProps = {
  centered: false,
};

export { Column };
export type { IColumnProps };
