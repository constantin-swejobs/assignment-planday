import React from "react";
import { render, screen } from "@testing-library/react";
import { DataItemsGridView } from "../DataItemsGridView";
import { DataReqResult } from "../../api/data-items-service";
import { APIContext } from "../../api/APIProvider";
import userEvent from "@testing-library/user-event";

// MARK: Pagination interactions

const mockGetDataItemsBuilder =
  (size: number) =>
  (
    searchString: string,
    offset: number,
    limit: number,
    s: string,
  ): Promise<DataReqResult> => {
    return Promise.resolve({
      items: [
        ...Array(size - (offset + limit) > 0 ? limit : size - offset),
      ].map((_, index) => ({
        title: `Item: ${offset + index + 1}`,
        description: `Item no. ${offset + index + 1} description`,
        imagePath: `https://example.com/${offset + index + 1}`,
      })),
      totalItems: size,
    });
  };

test("renders DataItemsGridView with empty dataset", async () => {
  render(
    <APIContext.Provider value={{ getDataItems: mockGetDataItemsBuilder(0) }}>
      <DataItemsGridView />
    </APIContext.Provider>,
  );

  // Phase 1: Initial UI (loading state)

  const loadingFeedbackLabel = screen.getByRole("status", {
    name: "Loading ...",
  });
  expect(loadingFeedbackLabel).toBeInTheDocument();

  // Phase 2: UI updated based on the API result (empty dataset returned)
  // should render an empty state feedback UI ...

  const noResultsFeedbackLabel = await screen.findByText("No results found");
  expect(noResultsFeedbackLabel).toBeInTheDocument();
  expect(noResultsFeedbackLabel.getAttribute("role")).toEqual("alert");

  // ... and should result in no rendered items or pagination controls:

  expect(screen.queryAllByRole("listitem")).toHaveLength(0);

  expect(screen.queryByLabelText("Pagination info")).not.toBeInTheDocument();
  expect(
    screen.queryByLabelText("Pagination controls"),
  ).not.toBeInTheDocument();
});

test("renders DataItemsGridView with content", async () => {
  const itemsPerPage = 4;
  render(
    <APIContext.Provider value={{ getDataItems: mockGetDataItemsBuilder(20) }}>
      <DataItemsGridView itemsPerPage={itemsPerPage} />
    </APIContext.Provider>,
  );

  // Phase 1: Initial UI (loading state)

  const loadingFeedbackLabel = screen.getByRole("status", {
    name: "Loading ...",
  });
  expect(loadingFeedbackLabel).toBeInTheDocument();

  expect(screen.queryByLabelText("Pagination info")).not.toBeInTheDocument();
  expect(
    screen.queryByLabelText("Pagination controls"),
  ).not.toBeInTheDocument();

  // Phase 2: UI updated based on the API result (_itemsPerPage_ returned with a total available count of 20)
  // should result in all items equivalent to the first page rendered, alongside pagination status/controls in sync
  // with the API response metadata:

  const firstPageItems = await screen.findAllByRole("listitem");
  expect(firstPageItems).toHaveLength(itemsPerPage);

  expect(screen.getAllByText(/Item: \d+/i)).toHaveLength(itemsPerPage);
  expect(screen.getAllByAltText(/Item no. \d+ description/i)).toHaveLength(
    itemsPerPage,
  );
  expect(screen.getByText("Item: 1")).toBeInTheDocument();
  expect(screen.getByText(`Item: ${itemsPerPage}`)).toBeInTheDocument();
  expect(
    screen.queryByText(`Item: ${itemsPerPage + 1}`),
  ).not.toBeInTheDocument();

  expect(screen.getByLabelText("Pagination info")).toBeInTheDocument();
  expect(screen.getByLabelText("Pagination controls")).toBeInTheDocument();

  // ... validate computed pagination status
  const previousControl = screen.getByText("Previous");
  expect(previousControl).toBeDisabled();
  const nextControl = screen.getByText("Next");
  expect(nextControl).toBeEnabled();

  expect(screen.getByText(`1-${itemsPerPage} of 20 items`)).toBeInTheDocument();
  expect(
    screen.getByLabelText(
      `Page number 1, of ${Math.ceil(20 / itemsPerPage)} pages`,
    ),
  ).toBeInTheDocument();

  const pageSelector = screen.getByRole("combobox");
  expect(pageSelector).toBeInTheDocument();
  expect(
    (screen.getByRole("option", { name: "1" }) as HTMLOptionElement).selected,
  ).toBe(true);
});

test("navigates forward through the available dataset", async () => {
  const itemsPerPage = 4;
  const totalItems = itemsPerPage * 2 + 1;
  render(
    <APIContext.Provider
      value={{ getDataItems: mockGetDataItemsBuilder(totalItems) }}
    >
      <DataItemsGridView itemsPerPage={itemsPerPage} />
    </APIContext.Provider>,
  );

  // Phase 1: Wait & render first page

  const firstPageItems = await screen.findAllByRole("listitem");
  expect(firstPageItems).toHaveLength(itemsPerPage);

  // Phase 2: Initiate navigation to second page & check loading state

  await userEvent.click(screen.getByText("Next"));

  // Phase 3: Wait for content corresponding to the second page & check the updated pagination info

  const secondPageItems = await screen.findAllByRole("listitem");
  expect(secondPageItems).toHaveLength(itemsPerPage);

  expect(screen.getAllByText(/Item: \d+/i)).toHaveLength(itemsPerPage);
  expect(screen.getAllByAltText(/Item no. \d+ description/i)).toHaveLength(
    itemsPerPage,
  );
  expect(screen.getByText(`Item: ${itemsPerPage + 1}`)).toBeInTheDocument();
  expect(screen.getByText(`Item: ${itemsPerPage * 2}`)).toBeInTheDocument();
  expect(
    screen.queryByText(`Item: ${itemsPerPage * 2 + 1}`),
  ).not.toBeInTheDocument();

  expect(screen.getByLabelText("Pagination info")).toBeInTheDocument();
  expect(screen.getByLabelText("Pagination controls")).toBeInTheDocument();

  // ... validate computed pagination status
  expect(screen.getByText("Previous")).toBeEnabled();
  expect(screen.getByText("Next")).toBeEnabled();

  expect(
    screen.getByText(
      `${itemsPerPage + 1}-${itemsPerPage * 2} of ${totalItems} items`,
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByLabelText(
      `Page number 2, of ${Math.ceil(totalItems / itemsPerPage)} pages`,
    ),
  ).toBeInTheDocument();

  expect(screen.getByRole("combobox")).toBeInTheDocument();
  expect(
    (screen.getByRole("option", { name: "2" }) as HTMLOptionElement).selected,
  ).toBe(true);

  // Phase 4: Initiate navigation to last page & check loading state

  await userEvent.click(screen.getByText("Next"));

  // Phase 5: Wait for content corresponding to the last page (incomplete - only 1 item) & check the updated pagination info

  const lastPageItems = await screen.findAllByRole("listitem");
  expect(lastPageItems).toHaveLength(1);

  expect(screen.getAllByText(/Item: \d+/i)).toHaveLength(1);
  expect(screen.getAllByAltText(/Item no. \d+ description/i)).toHaveLength(1);
  expect(screen.getByText(`Item: ${itemsPerPage * 2 + 1}`)).toBeInTheDocument();
  expect(
    screen.queryByText(`Item: ${itemsPerPage * 2 + 2}`),
  ).not.toBeInTheDocument();

  expect(screen.getByLabelText("Pagination info")).toBeInTheDocument();
  expect(screen.getByLabelText("Pagination controls")).toBeInTheDocument();

  // ... validate computed pagination status
  expect(screen.getByText("Previous")).toBeEnabled();
  expect(screen.getByText("Next")).toBeDisabled();

  expect(
    screen.getByText(
      `${itemsPerPage * 2 + 1}-${totalItems} of ${totalItems} items`,
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByLabelText(
      `Page number 3, of ${Math.ceil(totalItems / itemsPerPage)} pages`,
    ),
  ).toBeInTheDocument();

  const pageSelector = screen.getByRole("combobox");
  expect(pageSelector).toBeInTheDocument();
  expect(
    (screen.getByRole("option", { name: "3" }) as HTMLOptionElement).selected,
  ).toBe(true);
});

test("navigates backwards through the available dataset", async () => {
  const itemsPerPage = 4;
  const totalItems = itemsPerPage * 2;
  render(
    <APIContext.Provider
      value={{ getDataItems: mockGetDataItemsBuilder(totalItems) }}
    >
      <DataItemsGridView itemsPerPage={itemsPerPage} />
    </APIContext.Provider>,
  );

  // Phase 1: Navigate & wait for the content corresponding to the second page to load

  const firstPageItems = await screen.findAllByRole("listitem");
  expect(firstPageItems).toHaveLength(itemsPerPage);

  await userEvent.click(screen.getByText("Next"));

  const secondPageItems = await screen.findAllByRole("listitem");
  expect(secondPageItems).toHaveLength(itemsPerPage);

  // Phase 2: Initiate navigation to previous page & check loading state

  await userEvent.click(screen.getByText("Previous"));

  // Phase 3: Wait for content corresponding to the first page to reload & check the updated pagination info

  const previousPageItems = await screen.findAllByRole("listitem");
  expect(previousPageItems).toHaveLength(itemsPerPage);

  expect(screen.getAllByText(/Item: \d+/i)).toHaveLength(itemsPerPage);
  expect(screen.getAllByAltText(/Item no. \d+ description/i)).toHaveLength(
    itemsPerPage,
  );
  expect(screen.getByText(`Item: 1`)).toBeInTheDocument();
  expect(screen.getByText(`Item: ${itemsPerPage}`)).toBeInTheDocument();
  expect(
    screen.queryByText(`Item: ${itemsPerPage + 1}`),
  ).not.toBeInTheDocument();

  expect(screen.getByLabelText("Pagination info")).toBeInTheDocument();
  expect(screen.getByLabelText("Pagination controls")).toBeInTheDocument();

  // ... validate computed pagination status
  expect(screen.getByText("Previous")).toBeDisabled();
  expect(screen.getByText("Next")).toBeEnabled();

  expect(
    screen.getByText(`1-${itemsPerPage} of ${totalItems} items`),
  ).toBeInTheDocument();
  expect(
    screen.getByLabelText(
      `Page number 1, of ${Math.ceil(totalItems / itemsPerPage)} pages`,
    ),
  ).toBeInTheDocument();

  expect(screen.getByRole("combobox")).toBeInTheDocument();
  expect(
    (screen.getByRole("option", { name: "1" }) as HTMLOptionElement).selected,
  ).toBe(true);
});

// MARK: Search interactions

const mockGetDataItemsWithSearch = (
  searchString: string,
  offset: number,
  limit: number,
  s: string,
): Promise<DataReqResult> => {
  return Promise.resolve(
    searchString === "e"
      ? { items: [], totalItems: 0 }
      : {
          items: [...Array(4)].map((_, index) => ({
            title: `Item: ${offset + index + 1} (${searchString})`,
            description: `Item no. ${offset + index + 1} description`,
            imagePath: `https://example.com/${offset + index + 1}`,
          })),
          totalItems: searchString === "" ? 12 : 8,
        },
  );
};

test("refines results based on current search query", async () => {
  render(
    <APIContext.Provider value={{ getDataItems: mockGetDataItemsWithSearch }}>
      <DataItemsGridView itemsPerPage={4} />
    </APIContext.Provider>,
  );

  // Phase 1: Wait & render first page (no search)

  const firstPageItems = await screen.findAllByRole("listitem");
  expect(firstPageItems).toHaveLength(4);

  expect(screen.getAllByText(/Item: \d+ ()/i)).toHaveLength(4);
  expect(screen.getAllByAltText(/Item no. \d+ description/i)).toHaveLength(4);
  expect(
    screen.getByLabelText("Page number 1, of 3 pages"),
  ).toBeInTheDocument();

  // Phase 2: Type in the search box to trigger a search operation

  await userEvent.type(screen.getByRole("searchbox"), "a");

  // Phase 3: Wait for content corresponding to the search query to appear & check its validity + the updated pagination info

  const filteredItems = await screen.findAllByRole("listitem");
  expect(filteredItems).toHaveLength(4);

  expect(screen.getAllByText(/Item: \d+ \(a\)/i)).toHaveLength(4);
  expect(screen.getAllByAltText(/Item no. \d+ description/i)).toHaveLength(4);
  expect(
    screen.getByLabelText("Page number 1, of 2 pages"),
  ).toBeInTheDocument();
});

test("presents an empty state for search queries with no results", async () => {
  render(
    <APIContext.Provider value={{ getDataItems: mockGetDataItemsWithSearch }}>
      <DataItemsGridView itemsPerPage={4} />
    </APIContext.Provider>,
  );

  // Phase 1: Wait & render first page (no search)

  const firstPageItems = await screen.findAllByRole("listitem");
  expect(firstPageItems).toHaveLength(4);

  expect(screen.getAllByText(/Item: \d+ ()/i)).toHaveLength(4);
  expect(screen.getAllByAltText(/Item no. \d+ description/i)).toHaveLength(4);
  expect(
    screen.getByLabelText("Page number 1, of 3 pages"),
  ).toBeInTheDocument();

  // Phase 2: Type in the search box to trigger a search operation which will return no results

  await userEvent.type(screen.getByRole("searchbox"), "e");

  // Phase 3: Wait for response corresponding to the search query to appear & check presence of the empty state indicative of an empty data set

  const noResultsFeedbackLabel = await screen.findByText("No results found");
  expect(noResultsFeedbackLabel).toBeInTheDocument();
  expect(noResultsFeedbackLabel.getAttribute("role")).toEqual("alert");

  expect(screen.queryAllByRole("listitem")).toHaveLength(0);

  expect(screen.queryByLabelText("Pagination info")).not.toBeInTheDocument();
  expect(
    screen.queryByLabelText("Pagination controls"),
  ).not.toBeInTheDocument();
});

test("preserves the search query between page changes", async () => {
  render(
    <APIContext.Provider value={{ getDataItems: mockGetDataItemsWithSearch }}>
      <DataItemsGridView itemsPerPage={4} />
    </APIContext.Provider>,
  );

  // Phase 1: Wait & render first page (no search)

  const firstPageItems = await screen.findAllByRole("listitem");
  expect(firstPageItems).toHaveLength(4);

  expect(screen.getAllByText(/Item: \d+ ()/i)).toHaveLength(4);
  expect(screen.getAllByAltText(/Item no. \d+ description/i)).toHaveLength(4);
  expect(
    screen.getByLabelText("Page number 1, of 3 pages"),
  ).toBeInTheDocument();

  // Phase 2: Type in the search box to trigger a search operation which will refine the dataset and wait for it's content to appear

  await userEvent.type(screen.getByRole("searchbox"), "a");

  const filteredItems = await screen.findAllByRole("listitem");
  expect(filteredItems).toHaveLength(4);
  expect(screen.getAllByText(/Item: \d+ \(a\)/i)).toHaveLength(4);
  expect(screen.getAllByAltText(/Item no. \d+ description/i)).toHaveLength(4);
  expect(
    screen.getByLabelText("Page number 1, of 2 pages"),
  ).toBeInTheDocument();

  // Phase 3: Navigate to the second page associated with the search query and validate the persistance of the previous filter

  await userEvent.click(screen.getByText("Next"));

  const secondPageItems = await screen.findAllByRole("listitem");
  expect(secondPageItems).toHaveLength(4);

  expect(screen.getAllByText(/Item: \d+ \(a\)/i)).toHaveLength(4);
  expect(screen.getAllByAltText(/Item no. \d+ description/i)).toHaveLength(4);
  expect(
    screen.getByLabelText("Page number 2, of 2 pages"),
  ).toBeInTheDocument();

  expect(screen.getByRole("searchbox").getAttribute("value")).toBe("a");
});

// API `getDataItems` mock which queues incoming calls in a pending state and resolved them in reverse order when
// the callback configured through `registerFlushSignal` is called
const mockQueuedGetDataItemsWithSearchBuilder = (
  registerFlushSignal: (
    flushPendingReqInReverse: () => Promise<number>,
  ) => void,
) => {
  const resolveQueue: Array<() => void> = [];
  const promiseQueue: Array<Promise<DataReqResult>> = [];

  registerFlushSignal(async () => {
    for (let i = 0; i < resolveQueue.length; i++) {
      resolveQueue[i]();
    }

    return Promise.all(promiseQueue).then(() => promiseQueue.length);
  });

  return (
    searchString: string,
    offset: number,
    limit: number,
    s: string,
  ): Promise<DataReqResult> => {
    const p: Promise<DataReqResult> = new Promise((resolveRequest) => {
      resolveQueue.unshift(() =>
        resolveRequest({
          items: [...Array(4)].map((_, index) => ({
            title: `Item: ${offset + index + 1} (${searchString})`,
            description: `Item no. ${offset + index + 1} description`,
            imagePath: `https://example.com/${offset + index + 1}`,
          })),
          totalItems: searchString === "" ? 12 : 8,
        }),
      );
    });

    promiseQueue.push(p);
    return p;
  };
};

test("ignores API responses that arrive after a new filter change (page change, search)", async () => {
  let flushPendingReqInReverse!: () => Promise<number>; // getDataItems will only be resolved when this callback will be run, with the responses being delivered in reverse call order
  render(
    <APIContext.Provider
      value={{
        getDataItems: mockQueuedGetDataItemsWithSearchBuilder(
          (trigger) => (flushPendingReqInReverse = trigger),
        ),
      }}
    >
      <DataItemsGridView itemsPerPage={4} />
    </APIContext.Provider>,
  );

  // Phase 1: Initial call for the first page (no search)

  expect(
    screen.getByRole("status", { name: "Loading ..." }),
  ).toBeInTheDocument();

  // Phase 2: Type in the search box to trigger a new API call, with a search filter applied

  await userEvent.type(screen.getByRole("searchbox"), "a");
  expect(
    screen.getByRole("status", { name: "Loading ..." }),
  ).toBeInTheDocument();

  // Phase 3: Trigger the pending API calls in reverse order (with the last result returned being associated with the oldest call) and check
  // that only the response associated with the last request is preserved

  expect(flushPendingReqInReverse).not.toBe(undefined);
  const triggeredCalls = await flushPendingReqInReverse();
  expect(triggeredCalls).toBe(2);

  const firstPageItems = await screen.findAllByRole("listitem");
  expect(firstPageItems).toHaveLength(4);

  expect(screen.getAllByText(/Item: \d+ \(a\)/i)).toHaveLength(4);
  expect(screen.getAllByAltText(/Item no. \d+ description/i)).toHaveLength(4);
  expect(
    screen.getByLabelText("Page number 1, of 2 pages"),
  ).toBeInTheDocument();
});
