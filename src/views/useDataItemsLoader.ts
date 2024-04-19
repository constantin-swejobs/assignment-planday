import { useContext, useEffect, useRef, useState } from "react";
import { DataReqResult } from "../api/data-items-service";
import { APIContext } from "../api/APIProvider";

type DataLoaderResult = {
  filterQuery: string;
  pageNumber: number;

  data: DataReqResult | undefined; // undefined when loading
};

// Returns a promise handler configured to reject pending wrapped promises once a new one is given
const replaceablePromiseHandler = <T>(
  resolveCb: (result: T) => void,
  rejectCb: (reason: any) => void,
): ((newPromise: Promise<T>) => void) => {
  let newestPromise: number = 0;

  return (newPromise: Promise<T>) => {
    const promiseNr = ++newestPromise;
    newPromise
      .then((val) =>
        promiseNr === newestPromise
          ? resolveCb(val)
          : rejectCb("cancelled promise"),
      )
      .catch((reason) => rejectCb(reason));
  };
};

// TODO: (UX & performance improvement) Debounce handleFilterOrPageChange calls to lower API call frequency in the current typeahead mode search
export function useDataItemsLoader(
  filterQuery: string,
  pageSize: number,
  pageNumber: number,
): [DataLoaderResult, (filterQuery: string, pageNumber: number) => void] {
  const [filterState, setFilterState] = useState<{
    filterQuery: string;
    pageNumber: number;
  }>({ filterQuery, pageNumber });
  const [data, setData] = useState<DataReqResult>();

  const apiContext = useContext(APIContext);

  const getDataItemsHandler = useRef(
    replaceablePromiseHandler<DataReqResult>(
      (data) => setData(data),
      (reason) => console.warn("(useDataItemsLoader) request rejected", reason),
    ),
  );

  useEffect(() => {
    getDataItemsHandler.current(
      apiContext.getDataItems(filterQuery, 0, pageSize),
    );
  }, []); // Mount/unmount

  const handleFilterOrPageChange = (
    newFilterQuery: string,
    newPageNumber: number,
  ) => {
    if (newFilterQuery !== filterState.filterQuery) {
      setFilterState({ filterQuery: newFilterQuery, pageNumber: 0 });
      setData(undefined);
      getDataItemsHandler.current(
        apiContext.getDataItems(newFilterQuery, 0, pageSize),
      );
    } else if (newPageNumber !== filterState.pageNumber) {
      const offset = newPageNumber * pageSize;

      setFilterState({
        filterQuery: newFilterQuery,
        pageNumber: newPageNumber,
      });
      setData(undefined);
      getDataItemsHandler.current(
        apiContext.getDataItems(newFilterQuery, offset, pageSize),
      );
    }
  };

  return [
    {
      filterQuery: filterState.filterQuery,
      pageNumber: filterState.pageNumber,
      data: data,
    },
    handleFilterOrPageChange,
  ];
}
