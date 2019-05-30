/* @flow */

import React, { Component } from "react";
import { findDOMNode } from "react-dom";
import { t } from "ttag";
import FilterWidget from "./FilterWidget.jsx";
import OperatorWidget from "./OperatorWidget.jsx";

import StructuredQuery from "metabase-lib/lib/queries/StructuredQuery";
import type { Filter } from "metabase/meta/types/Query";
import {isCompoundFilter} from "metabase/lib/query/filter";

import Dimension from "metabase-lib/lib/Dimension";

import type { TableMetadata } from "metabase/meta/types/Metadata";

type Props = {
  query: StructuredQuery,
  filter: Filter,
  removeFilter?: (index: number[]) => void,
  updateFilter?: (index: number[], filter: Filter) => void,
  toggleCompoundFilterOperator: (operatorIndex: number, nestedClauseIndex: number[]) => void,
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
    if (nextProps.filter.length > this.props.filter.length) {
      this.setState({ shouldScroll: true });
    } else {
      this.setState({ shouldScroll: false });
    }
  }

  componentDidMount() {
    this.componentDidUpdate();
  }

  renderFilter(filter: Filter, nestedClauseIndex: number[]) {
    const { query, tableMetadata, toggleCompoundFilterOperator, updateFilter, removeFilter, maxDisplayValues } = this.props;

    const clauses = isCompoundFilter(filter) ? filter.slice(1) : [filter];
    const operator = clauses.length > 1 ? filter[0] : null
    console.log(filter, clauses, operator)
    const widgets = []
    if (nestedClauseIndex.length > 0) {
      widgets.push(
        <span className="flex flex-column justify-center">
          <span className="p0 text-larger text-light text-bold">(</span>
        </span>
      );
    }
    clauses.forEach((filter, i) => {
      // The full nested index of the clause. 
      // If there is an operator, that is the first element of the array, so we add an offset
      const index = [...nestedClauseIndex, operator ? i + 1 : i];
      if (isCompoundFilter(filter)) {
        widgets.push(this.renderFilter(filter, index))
      } else {
        widgets.push(
          <FilterWidget
            key={i}
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
      }
      if (i < clauses.length - 1) {
        widgets.push(
          <OperatorWidget 
            key={`op${i}`} 
            operator={operator} 
            toggleOperator={() => {
              toggleCompoundFilterOperator(i, nestedClauseIndex)
            }}
          />
        )
      }
     
    });
    if (nestedClauseIndex.length > 0) {
      widgets.push(
        <span className="flex flex-column justify-center">
          <span className="p0 text-larger text-light text-bold">)</span>
        </span>
      );
    }
    return widgets
  }

  render() {
    const { filter: filters } = this.props;
    return (
      <div className="Query-filterList scroll-x scroll-show pl2">
        {this.renderFilter(filters, [])}
      </div>
    );
  }
}
