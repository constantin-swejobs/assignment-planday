import React, { ChangeEvent, FunctionComponent, useMemo } from "react";

interface IPaginationControlsProps {
  totalItems: number;
  itemsPerPage: number;

  pageNumber: number;
  onPageNumberChange: (newVal: number) => void;

  disabled?: boolean;
}

const PaginationControls: FunctionComponent<IPaginationControlsProps> = ({
  totalItems,
  itemsPerPage,
  pageNumber,
  onPageNumberChange,
  disabled,
}) => {
  const totalPages = useMemo(
    () => Math.ceil(totalItems / itemsPerPage),
    [totalItems, itemsPerPage],
  );
  const firstItemOnCurrentPage = pageNumber * itemsPerPage + 1;
  const lastItemOnCurrentPage =
    pageNumber * itemsPerPage + itemsPerPage > totalItems
      ? totalItems
      : pageNumber * itemsPerPage + itemsPerPage;

  const infoLabel = `${firstItemOnCurrentPage}-${lastItemOnCurrentPage} of ${totalItems} ${totalItems === 1 ? "item" : "items"}`;
  const pageSelectorInfoSuffix = `, of ${totalPages}${totalPages === 1 ? "" : " pages"}`;

  const handleOnChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (typeof onPageNumberChange === "function") {
      onPageNumberChange(parseInt(event.target.value));
    }
  };

  return (
    <div className={`pagination-controls ${disabled ? "disabled" : ""}`}>
      <div
        className="pagination-controls-section"
        role="status"
        aria-label="Pagination info"
      >
        {infoLabel}
      </div>

      <div
        className="pagination-controls-section"
        role="navigation"
        aria-label="Pagination controls"
      >
        <label
          className="page-selector"
          aria-label={`Page number ${pageNumber + 1}${pageSelectorInfoSuffix}`}
        >
          Page number
          <select
            value={pageNumber}
            onChange={handleOnChange}
            disabled={disabled || totalPages === 1}
          >
            {[...Array(totalPages)].map((_, index) => (
              <option value={index} key={index}>
                {index + 1}
              </option>
            ))}
          </select>
          {pageSelectorInfoSuffix}
        </label>

        <div className="page-controls">
          <button
            className="page-controls-previous"
            aria-label="Previous page"
            disabled={disabled || pageNumber <= 0}
            onClick={() => onPageNumberChange(pageNumber - 1)}
          >
            Previous
          </button>
          <button
            className="page-controls-next"
            aria-label="Next page"
            disabled={disabled || pageNumber >= totalPages - 1}
            onClick={() => onPageNumberChange(pageNumber + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

PaginationControls.defaultProps = {
  disabled: false,
};

export { PaginationControls };
export type { IPaginationControlsProps };
