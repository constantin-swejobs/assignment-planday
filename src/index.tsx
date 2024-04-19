import * as React from "react";
import ReactDOM from "react-dom";
import { APIProvider } from "./api/APIProvider";
import { DataItemsGridView } from "./views/DataItemsGridView";

import "./index.scss";

let App = () => (
  <APIProvider>
    <DataItemsGridView header="Planday Assignment Demo" />
  </APIProvider>
);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
