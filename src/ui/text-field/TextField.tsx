import React, { ChangeEvent, FunctionComponent } from "react";

interface ITextFieldProps {
  type: "search" | "text";

  value: string;
  onChange: (newVal: string) => void;

  placeholder: string;

  className?: string;
}

const TextField: FunctionComponent<ITextFieldProps> = ({
  type,
  value,
  onChange,
  placeholder,
  className,
}) => {
  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (typeof onChange === "function") {
      onChange(event.target.value);
    }
  };

  return (
    <div className={`text-field ${className ? className : ""}`}>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleOnChange}
      />
    </div>
  );
};

TextField.defaultProps = {
  type: "text",
};

export { TextField };
export type { ITextFieldProps };
