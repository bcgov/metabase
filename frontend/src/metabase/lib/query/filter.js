/* @flow */

import { op, args, noNullValues, updateNested, removeNested, clear } from "./util";

import type {
  FilterClause,
  Filter,
  FilterOptions,
} from "metabase/meta/types/Query";

// returns canonical list of Filters
export function getFilters(filter: ?FilterClause): Filter[] {
  if (!filter || (Array.isArray(filter) && filter.length === 0)) {
    return [];
  } else if (op(filter) === "and" || op(filter) === "or") {
    return args(filter);
  } else {
    return [filter];
  }
}


function consolidateFilterClause(filter: FilterClause): ?FilterClause {
  console.log("consolidate", filter);
  // A simple filter, nothing to consolidate
  if (!isCompoundFilter(filter)) {
    if (filter.length === 1) {
      return filter[0];
    }
    return filter;
  }

  // We just removed a filter and have a compound filter with a single clause
  if (filter.length === 2) { 
    return filter[1];
  } 

  return [op(filter), ...filter.slice(1).map(consolidateFilterClause)];
}

export function addFilter(
  clause: ?FilterClause,
  newFilter: FilterClause,
): FilterClause {
  console.log("addFilter", clause, newFilter)
  if (clause === undefined) {
    return newFilter; // The clause has a single filter, no operator needed
  }
  return isCompoundFilter(clause) ? [...clause, newFilter] : ["and", clause, newFilter] 
}

export function updateFilter(
  filter: FilterClause,
  index: number[],
  updatedFilter: FilterClause,
): FilterClause {
  console.log("updateFilter", filter, index, updatedFilter);
  return consolidateFilterClause(updateNested(filter, index, updatedFilter));
}
export function removeFilter(
  filter: FilterClause,
  index: number[],
): FilterClause {
  console.log("removeFilter", filter, index)
  return consolidateFilterClause(removeNested(filter, index));
}
export function clearFilters(filter: ?FilterClause): ?FilterClause {
  return consolidateFilterClause(clear());
}

export function toggleCompoundFilterOperator(
  clause: FilterClause,
  operatorIndex: number,
  nestedClauseIndex: number[], // TODO: use this
): FilterClause {
  let filterToToggle = clause;
  for (const i of nestedClauseIndex) {
    filterToToggle = [...filterToToggle[i]];
  }
  let lhsFilters = filterToToggle.slice(1, operatorIndex + 2);
  let rhsFilters = filterToToggle.slice(operatorIndex + 2);
  if (lhsFilters.length > 1) {
    lhsFilters = [[op(filterToToggle), ...lhsFilters]];
  } else if (isCompoundFilter(lhsFilters[0]) && op(lhsFilters[0]) !== op(filterToToggle)) {
    lhsFilters = lhsFilters[0].slice(1);
  }
  if (rhsFilters.length > 1) {
    rhsFilters = [[op(filterToToggle), ...rhsFilters]];
  } if (isCompoundFilter(rhsFilters[0]) && op(rhsFilters[0]) !== op(filterToToggle)) {
    rhsFilters = rhsFilters[0].slice(1);
  }
  return updateNested(
    clause, nestedClauseIndex, [op(clause) === "and" ? "or" : "and", ...lhsFilters, ...rhsFilters]
  );
}

// MISC

export function canAddFilter(filter: ?FilterClause): boolean {
  const filters = getFilters(filter);
  if (filters.length > 0) {
    return noNullValues(filters[filters.length - 1]);
  }
  return true;
}

export function isSegmentFilter(filter: FilterClause): boolean {
  return Array.isArray(filter) && filter[0] === "segment";
}

export function isCompoundFilter(filter: FilterClause): boolean {
  return Array.isArray(filter) && (filter[0] === "and" || filter[0] === "or");
}

export function isFieldFilter(filter: FilterClause): boolean {
  return !isSegmentFilter(filter) && !isCompoundFilter(filter);
}

// TODO: is it safe to assume if the last item is an object then it's options?
export function hasFilterOptions(filter: Filter): boolean {
  const o = filter[filter.length - 1];
  return !!o && typeof o == "object" && o.constructor == Object;
}

export function getFilterOptions(filter: Filter): FilterOptions {
  // NOTE: just make a new "any" variable since getting flow to type checking this is a nightmare
  const _filter: any = filter;
  if (hasFilterOptions(filter)) {
    return _filter[_filter.length - 1];
  } else {
    return {};
  }
}

export function setFilterOptions<T: Filter>(
  filter: T,
  options: FilterOptions,
): T {
  // NOTE: just make a new "any" variable since getting flow to type checking this is a nightmare
  let _filter: any = filter;
  // if we have option, strip it off for now
  if (hasFilterOptions(filter)) {
    _filter = _filter.slice(0, -1);
  }
  // if options isn't emtpy, append it
  if (Object.keys(options).length > 0) {
    _filter = [..._filter, options];
  }
  return _filter;
}
