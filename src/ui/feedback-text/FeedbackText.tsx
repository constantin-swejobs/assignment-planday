import React, { AriaRole, FunctionComponent } from "react";

interface IFeedbackTextProps {
  feedbackRole?: Extract<AriaRole, "alert" | "status">;

  text: string;

  className?: string;
}

const FeedbackText: FunctionComponent<IFeedbackTextProps> = ({
  feedbackRole,
  text,
  className,
}) => {
  return (
    <div
      className={`feedback-text ${className ? className : ""}`}
      role={feedbackRole}
      aria-label={text}
    >
      {text}
    </div>
  );
};

export { FeedbackText };
export type { IFeedbackTextProps };
