import React from "react";
import { render, screen } from "@testing-library/react";
import { PaginationControls } from "./PaginationControls";
import userEvent from "@testing-library/user-event";

test("renders PaginationControls for single page state", () => {
  const noOp = (newPageNumber: number) => undefined;
  render(
    <PaginationControls
      totalItems={4}
      itemsPerPage={4}
      pageNumber={0}
      onPageNumberChange={noOp}
    />,
  );

  expect(screen.getByLabelText("Pagination info")).toBeInTheDocument();
  expect(screen.getByLabelText("Pagination controls")).toBeInTheDocument();

  // validate computed pagination status
  const previousControl = screen.getByText("Previous");
  expect(previousControl).toBeDisabled();
  const nextControl = screen.getByText("Next");
  expect(nextControl).toBeDisabled();

  expect(screen.getByText("1-4 of 4 items")).toBeInTheDocument();
  expect(screen.getByLabelText("Page number 1, of 1")).toBeInTheDocument();

  const pageSelector = screen.getByRole("combobox");
  expect(pageSelector).toBeInTheDocument();
  expect(pageSelector).toBeDisabled();
  expect(
    (screen.getByRole("option", { name: "1" }) as HTMLOptionElement).selected,
  ).toBe(true);
});

test("renders PaginationControls for first page state", () => {
  const noOp = (newPageNumber: number) => undefined;
  render(
    <PaginationControls
      totalItems={10}
      itemsPerPage={4}
      pageNumber={0}
      onPageNumberChange={noOp}
    />,
  );

  expect(screen.getByLabelText("Pagination info")).toBeInTheDocument();
  expect(screen.getByLabelText("Pagination controls")).toBeInTheDocument();

  // validate computed pagination status
  const previousControl = screen.getByText("Previous");
  expect(previousControl).toBeDisabled();
  const nextControl = screen.getByText("Next");
  expect(nextControl).toBeEnabled();

  expect(screen.getByText("1-4 of 10 items")).toBeInTheDocument();
  expect(
    screen.getByLabelText("Page number 1, of 3 pages"),
  ).toBeInTheDocument();

  const pageSelector = screen.getByRole("combobox");
  expect(pageSelector).toBeInTheDocument();
  expect(pageSelector).toBeEnabled();
  expect(
    (screen.getByRole("option", { name: "1" }) as HTMLOptionElement).selected,
  ).toBe(true);
});

test("renders PaginationControls for last page state", () => {
  const noOp = (newPageNumber: number) => undefined;
  render(
    <PaginationControls
      totalItems={10}
      itemsPerPage={4}
      pageNumber={2}
      onPageNumberChange={noOp}
    />,
  );

  expect(screen.getByLabelText("Pagination info")).toBeInTheDocument();
  expect(screen.getByLabelText("Pagination controls")).toBeInTheDocument();

  // validate computed pagination status
  const previousControl = screen.getByText("Previous");
  expect(previousControl).toBeEnabled();
  const nextControl = screen.getByText("Next");
  expect(nextControl).toBeDisabled();

  expect(screen.getByText("9-10 of 10 items")).toBeInTheDocument();
  expect(
    screen.getByLabelText("Page number 3, of 3 pages"),
  ).toBeInTheDocument();

  const pageSelector = screen.getByRole("combobox");
  expect(pageSelector).toBeInTheDocument();
  expect(pageSelector).toBeEnabled();
  expect(
    (screen.getByRole("option", { name: "3" }) as HTMLOptionElement).selected,
  ).toBe(true);
});

test("navigates forward using the 'Next' control", async () => {
  const pageNumberChangeCb = jest.fn();
  render(
    <PaginationControls
      totalItems={10}
      itemsPerPage={4}
      pageNumber={0}
      onPageNumberChange={pageNumberChangeCb}
    />,
  );

  await userEvent.click(screen.getByText("Next"));

  expect(pageNumberChangeCb).toBeCalledTimes(1);
  expect(pageNumberChangeCb).toBeCalledWith(1);
});

test("navigates backwards using the 'Previous' control", async () => {
  const pageNumberChangeCb = jest.fn();
  render(
    <PaginationControls
      totalItems={10}
      itemsPerPage={4}
      pageNumber={1}
      onPageNumberChange={pageNumberChangeCb}
    />,
  );

  await userEvent.click(screen.getByText("Previous"));

  expect(pageNumberChangeCb).toBeCalledTimes(1);
  expect(pageNumberChangeCb).toBeCalledWith(0);
});

test("navigates using the page select control", async () => {
  const pageNumberChangeCb = jest.fn();
  render(
    <PaginationControls
      totalItems={10}
      itemsPerPage={4}
      pageNumber={1}
      onPageNumberChange={pageNumberChangeCb}
    />,
  );

  await userEvent.selectOptions(
    screen.getByRole("combobox"),
    screen.getByRole("option", { name: "2" }),
  );

  expect(pageNumberChangeCb).toBeCalledTimes(1);
  expect(pageNumberChangeCb).toBeCalledWith(1);

  await userEvent.selectOptions(
    screen.getByRole("combobox"),
    screen.getByRole("option", { name: "3" }),
  );

  expect(pageNumberChangeCb).toBeCalledTimes(2);
  expect(pageNumberChangeCb).toBeCalledWith(2);

  await userEvent.selectOptions(
    screen.getByRole("combobox"),
    screen.getByRole("option", { name: "1" }),
  );

  expect(pageNumberChangeCb).toBeCalledTimes(3);
  expect(pageNumberChangeCb).toBeCalledWith(0);
});
