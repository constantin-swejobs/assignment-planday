import React, {
  FunctionComponent,
  PropsWithChildren,
  createContext,
} from "react";
import { DataReqResult, getDataItems } from "./data-items-service";

interface IAPIContext {
  getDataItems: (
    searchString: string,
    offset: number,
    limit: number,
  ) => Promise<DataReqResult>;
}

const APIContext = createContext<IAPIContext>({
  getDataItems: () => Promise.reject("Context not yet initialized!"),
});

const APIProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const apiImplementation = {
    getDataItems: getDataItems,
  };

  return (
    <APIContext.Provider value={apiImplementation}>
      {children}
    </APIContext.Provider>
  );
};

export { APIProvider, APIContext };
