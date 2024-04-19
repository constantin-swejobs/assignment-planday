import React, { FunctionComponent } from "react";
import { Container } from "../ui";
import { Column } from "../ui";
import { TextField } from "../ui";
import { Row } from "../ui";
import { Card } from "../ui";
import { PaginationControls } from "../ui";
import { useDataItemsLoader } from "./useDataItemsLoader";
import { FeedbackText } from "../ui";

import "./data-items-grid-view.scss";

const DEFAULT_ITEMS_PER_PAGE = 8;
interface IDataItemsGridViewProps {
  header: string;
  itemsPerPage?: number;
}

const DataItemsGridView: FunctionComponent<IDataItemsGridViewProps> = ({
  header,
  itemsPerPage,
}) => {
  // TODO: (UX optimization) sync the filter state to persist between page refresh (e.g.: using query parameters)
  const [currentState, refineResult] = useDataItemsLoader(
    "",
    itemsPerPage || DEFAULT_ITEMS_PER_PAGE,
    0,
  );

  return (
    <Container className="data-items-grid-view">
      <Row className="data-items-grid-view-header">
        <Column centered size={12}>
          <h1>{header}</h1>
        </Column>
      </Row>
      <Row className="data-items-grid-view-filter">
        <Column centered size={12} sizeMD={8}>
          <TextField
            type="search"
            value={currentState.filterQuery}
            onChange={(newVal) => refineResult(newVal, currentState.pageNumber)}
            placeholder="Type here to search"
          />
        </Column>
      </Row>
      <Row role="list">
        {currentState.data == null ? (
          <Column size={12}>
            <FeedbackText text="Loading ..." feedbackRole="status" />
          </Column>
        ) : currentState.data?.totalItems === 0 ? (
          <Column size={12}>
            <FeedbackText text="No results found" feedbackRole="alert" />
          </Column>
        ) : (
          currentState.data.items.map((item, index) => (
            <Column size={6} sizeMD={4} sizeLG={3} key={index} role="listitem">
              <Card
                title={item.title}
                thumbnailUrl={item.imagePath}
                thumbnailCaption={item.description}
              />
            </Column>
          ))
        )}
      </Row>
      <Row className="data-items-grid-view-footer">
        <Column size={12}>
          {currentState.data != null && currentState.data.totalItems !== 0 && (
            <PaginationControls
              disabled={
                currentState.data == null || currentState.data.totalItems === 0
              }
              totalItems={currentState.data ? currentState.data.totalItems : 0}
              itemsPerPage={itemsPerPage || DEFAULT_ITEMS_PER_PAGE}
              pageNumber={currentState.pageNumber}
              onPageNumberChange={(newVal) =>
                refineResult(currentState.filterQuery, newVal)
              }
            />
          )}
        </Column>
      </Row>
    </Container>
  );
};

export { DataItemsGridView };
