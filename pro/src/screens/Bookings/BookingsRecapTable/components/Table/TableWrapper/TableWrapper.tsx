import React from 'react'
import {
  Column,
  useExpanded,
  usePagination,
  useSortBy,
  useTable,
} from 'react-table'

import {
  BookingRecapResponseModel,
  CollectiveBookingResponseModel,
} from 'apiClient/v1'
import { Audience } from 'core/shared'

import TableBody from '../Body'
import TableHead from '../Head'
import TablePagination from '../Paginate'

interface TableWrapperProps<
  T extends BookingRecapResponseModel | CollectiveBookingResponseModel
> {
  columns: Column<T>[]
  currentPage: number
  data: T[]
  nbBookings: number
  nbBookingsPerPage: number
  updateCurrentPage: (pageNumber: number) => void
  audience: Audience
  reloadBookings: () => void
}

const TableWrapper = <
  T extends BookingRecapResponseModel | CollectiveBookingResponseModel
>({
  columns,
  currentPage,
  data,
  nbBookings,
  nbBookingsPerPage,
  updateCurrentPage,
  audience,
  reloadBookings,
}: TableWrapperProps<T>): JSX.Element => {
  const {
    canPreviousPage,
    canNextPage,
    getTableProps,
    getTableBodyProps,
    headerGroups,
    nextPage,
    previousPage,
    prepareRow,
    page,
    state: { pageIndex },
  } = useTable(
    {
      columns,
      data,
      initialState: {
        pageIndex: currentPage,
        pageSize: nbBookingsPerPage,
      },
    },
    useSortBy,
    useExpanded,
    usePagination
  )

  const pageCount = Math.ceil(nbBookings / nbBookingsPerPage)

  const goToNextPage = () => {
    nextPage()
    updateCurrentPage(pageIndex + 1)
  }

  const goToPreviousPage = () => {
    previousPage()
    updateCurrentPage(pageIndex - 1)
  }

  return (
    <div className="bookings-table-wrapper">
      <table className="bookings-table" {...getTableProps()}>
        <TableHead headerGroups={headerGroups} />
        <TableBody
          page={page}
          prepareRow={prepareRow}
          tableBodyProps={getTableBodyProps()}
          audience={audience}
          reloadBookings={reloadBookings}
        />
      </table>
      <TablePagination
        canNextPage={canNextPage}
        canPreviousPage={canPreviousPage}
        currentPage={pageIndex + 1}
        nbPages={pageCount}
        nextPage={goToNextPage}
        previousPage={goToPreviousPage}
      />
    </div>
  )
}

export default TableWrapper
