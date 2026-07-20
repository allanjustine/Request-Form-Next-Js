"use client";

import DataTable from "react-data-table-component";
import useFetch from "../admin/_hooks/useFetch";
import { paginationRowsPerPageOptions } from "@/constants/paginationRowsPerPageOptions";
import { BiRotateRight } from "react-icons/bi";
import { format } from "date-fns";
import { FILTER } from "@/constants/filters";
import FilterReports from "@/components/filter-reports";
import { useState } from "react";
import Modal from "./_components/modal";
import authenticatedPage from "@/lib/authenticatedPage";

const Reports = () => {
  const {
    isLoading,
    data,
    pagination,
    handleSearch,
    setSearchData,
    setSearchTerm,
    setPagination,
    setFilter,
    filter,
    searchData,
    handleRefresh,
    isRefresh,
  } = useFetch({
    url: "/request-reports",
  });
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [details, setDetails] = useState({});

  const columns = [
    {
      name: "Request Code",
      selector: (row: any) => row.request_code,
      sortable: true,
    },
    {
      name: "Requested By",
      selector: (row: any) => row.user?.fullName,
      sortable: true,
    },
    {
      name: "Request Type",
      selector: (row: any) => row.form_type,
      sortable: true,
    },
    {
      name: "Date",
      selector: (row: any) => format(row.created_at, "MMMM d, yyyy hh:mm a"),
      sortable: true,
    },
    {
      name: "Branch",
      selector: (row: any) => row?.branch_code?.branch_code,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row: any) => row.status,
      sortable: true,
      cell: (row: any) => (
        <span className={`badge ${getStatusBadgeClass(row.status)}`}>
          {row.status}
        </span>
      ),
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <button
          className="btn btn-xs btn-primary"
          type="button"
          onClick={handleViewDetails(row)}
        >
          View Details
        </button>
      ),
    },
  ];

  const getStatusBadgeClass = (status: any) => {
    switch (status) {
      case "Completed":
        return "badge-primary !text-sm";
      case "Pending":
        return "badge-warning !text-sm";
      case "Approved":
        return "badge-success !text-sm";
      case "Rejected":
        return "badge-error !text-sm";
      case "Disapproved":
        return "badge-error !text-sm";
      case "Ongoing":
        return "badge-info !text-sm";
      default:
        return "badge-error !text-sm";
    }
  };

  const resetFilters = () => {
    setFilter(FILTER);
    setSearchData("");
    setSearchTerm("");
  };

  const handlePerRowsChange = (newPerPage: number) => {
    setPagination((pagination) => ({
      ...pagination,
      per_page: newPerPage,
    }));
  };

  const handlePageChange = (page: number) => {
    setPagination((pagination) => ({
      ...pagination,
      current_page: page,
    }));
  };

  const handleViewDetails = (details: any) => () => {
    setDetails(details);
    setIsOpen(true);
  };

  const handleCloseViewDetails = () => {
    setIsOpen(false);
    setDetails({});
  };

  return (
    <>
      <div className="p-5">
        <div className="bg-base-100 rounded-lg shadow-md p-5 mb-5 shadow-gray-200">
          <h2 className="!text-xl font-bold mb-4">Filter Reports</h2>

          <FilterReports
            filter={filter}
            setFilter={setFilter}
            searchData={searchData}
            setSearchData={setSearchData}
            handleSearch={handleSearch}
            setSearchTerm={setSearchTerm}
          />

          <div className="flex justify-end mb-4">
            <button
              className="btn bg-blue-500 text-white border-none hover:bg-blue-600"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-base-100 rounded-lg shadow p-5">
          <div className="flex justify-end p-3">
            <button
              type="button"
              disabled={isRefresh}
              onClick={handleRefresh}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 flex gap-1 rounded items-center"
            >
              <BiRotateRight
                className={`size-6 ${isRefresh && "animate-spin"}`}
              />{" "}
              <span>{isRefresh ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
          <DataTable
            columns={columns}
            data={data}
            pagination
            paginationServer
            paginationRowsPerPageOptions={paginationRowsPerPageOptions}
            paginationTotalRows={pagination.total}
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handlePerRowsChange}
            progressComponent={
              <div className="w-full">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index}>
                    <div className="w-full border border-gray-200 p-2">
                      <div className="flex justify-center">
                        <div className="flex flex-col w-full gap-4">
                          <div className="w-full h-12 skeleton bg-slate-300"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            }
            progressPending={isLoading}
            persistTableHead
          />
        </div>
      </div>
      <Modal
        isOpen={isOpen}
        details={details}
        handleCloseViewDetails={handleCloseViewDetails}
      />
    </>
  );
};

export default authenticatedPage(Reports, true, true, false);
