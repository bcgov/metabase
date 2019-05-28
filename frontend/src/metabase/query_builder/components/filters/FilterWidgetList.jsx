/* @flow */

import React, { Component } from "react";
import { findDOMNode } from "react-dom";
import { t } from "ttag";
import FilterWidget from "./FilterWidget.jsx";
import OperatorWidget from "./OperatorWidget.jsx";

import StructuredQuery from "metabase-lib/lib/queries/StructuredQuery";
import type { Filter } from "metabase/meta/types/Query";
import Dimension from "metabase-lib/lib/Dimension";

import type { TableMetadata } from "metabase/meta/types/Metadata";

type Props = {
  query: StructuredQuery,
  filters: Array<Filter>,
  removeFilter?: (index: number) => void,
  updateFilter?: (index: number, filter: Filter) => void,
  maxDisplayValues?: number,
  tableMetadata?: TableMetadata, // legacy parameter
};

type State = {
  shouldScroll: boolean,
};

export default class FilterWidgetList extends Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      shouldScroll: false,
    };
  }

  componentDidUpdate() {
    this.state.shouldScroll
      ? (findDOMNode(this).scrollLeft = findDOMNode(this).scrollWidth)
      : null;
  }

  componentWillReceiveProps(nextProps: Props) {
    // only scroll when a filter is added
    if (nextProps.filters.length > this.props.filters.length) {
      this.setState({ shouldScroll: true });
    } else {
      this.setState({ shouldScroll: false });
    }
  }

  componentDidMount() {
    this.componentDidUpdate();
  }

  renderFilters(filters: Array<Filter>, filtersIndex: number) {
    const { query, tableMetadata, updateOperator, updateFilter, removeFilter, maxDisplayValues } = this.props;
    const clauses = filters.length > 1 ? filters.slice(1) : filters;
    const operator = filters.length > 1 ? filters[0] : null
    console.log(filters, clauses, operator)
    const widgets = []
    clauses.forEach((filter, index) => {
      widgets.push(
        <FilterWidget
          key={index}
          placeholder={t`Item`}
          // TODO: update widgets that are still passing tableMetadata instead of query
          query={
            query || {
              table: () => tableMetadata,
              parseFieldReference: fieldRef =>
                Dimension.parseMBQL(fieldRef, tableMetadata),
            }
          }
          filter={filter}
          index={index}
          removeFilter={removeFilter}
          updateFilter={updateFilter}
          maxDisplayValues={maxDisplayValues}
        />
      )
      if (index < clauses.length - 1) {
        widgets.push(
          <OperatorWidget 
            key={`op${index}`} 
            operator={operator} 
            toggleOperator={() => {
              updateFilter(0, operator === "and" ? "or" :"and")
            }}
          />
        )
      }
     
    });
    return widgets
  }

  render() {
    const { filters } = this.props;
    return (
      <div className="Query-filterList scroll-x scroll-show">
        {this.renderFilters(filters, 0)}
      </div>
    );
  }
}
