"use client";

import React, { useState, useEffect, useRef } from "react";
import DataTable from "react-data-table-component";
import { api } from "@/lib/api";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import echo from "@/hooks/echo";
import Link from "next/link";
import ApproversStock from "../_components/modals/ApproverStock";
import ApproverDiscount from "../_components/modals/ApproverDiscount";
import ApproverCashDisbursement from "../_components/modals/ApproverCashDisbursement";
import ApproverCashAdvance from "../_components/modals/ApproverCashAdvance";
import ApproverLiquidation from "../_components/modals/ApproverLiquidation";
import ApproverRefund from "../_components/modals/ApproverRefund";
import ApproverPurchase from "../_components/modals/ApproverPurchase";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { paginationRowsPerPageOptions } from "@/constants/paginationRowsPerPageOptions";
import ApproverCheckIssuance from "../_components/modals/ApproverChecklssuance";
import { BiRotateRight } from "react-icons/bi";
import authenticatedPage from "@/lib/authenticatedPage";
type Props = {};

type Record = {
  approved_attachment: string;
  employeeID: string;
  pending_approver: string;
  requested_by: string;
  id: number;
  created_at: Date;
  user_id: number;
  request_id: string;
  request_code: string;
  form_type: string;
  form_data: MyFormData[];
  date: Date;
  branch: {
    name: string;
    branch: string;
  };
  currency: string;
  status: string;
  purpose: string;
  totalBoatFare: string;
  destination: string;
  grand_total: string;
  grandTotal: string;
  approvers_id: number;
  attachment: string;
  noted_by: Approver[];
  approved_by: Approver[];
  avp_staff: Approver[];
  requested_signature: string;
  requested_position: string;
  completed_status: string;
  user_requested: string;
};
interface Approver {
  id: number;
  firstname: string;
  lastname: string;
  firstName: string;
  lastName: string;
  name: string;
  comment: string;
  position: string;
  signature: string;
  status: string;
  branch: string;
}
type MyFormData = {
  total_labor: number;
  total_discount: number;
  total_spotcash: number;
  employeeID: string;
  requested_by: string;
  approvers_id: number;
  purpose: string;
  items: MyItem[];
  approvers: {
    noted_by: {
      firstName: string;
      lastName: string;
      firstname: string;
      lastname: string;
      position: string;
      signature: string;
      status: string;
      branch: string;
    }[];
    approved_by: {
      firstName: string;
      lastName: string;
      position: string;
      signature: string;
      status: string;
      branch: string;
    }[];
  };
  date: string;
  branch: string;
  grand_total: string;
  supplier: string;
  address: string;
  totalBoatFare: string;
  totalContingency: string;
  totalFare: string;
  totalHotel: string;
  totalperDiem: string;
  totalExpense: string;
  cashAdvance: string;
  short: string;
  name: string;
  signature: string;
};

type MyItem = {
  brand: string;
  model: string;
  unit: string;
  partno: string;
  labor: string;
  spotcash: string;
  discountedPrice: string;
  quantity: string;
  description: string;
  unitCost: string;
  totalAmount: string;
  remarks: string;
  date: string;
  cashDate: string;
  branch: string;
  status: string;
  day: string;
  itinerary: string;
  activity: string;
  hotel: string;
  rate: string;
  amount: string;
  perDiem: string;
  liquidationDate: string;
  particulars: string;
  particularsAmount: string;
  destination: string;
  from: string;
  to: string;
  transportation: string;
  transportationAmount: string;
  hotelAmount: string;
  hotelAddress: string;
  grandTotal: string;
};

const tableCustomStyles = {
  headRow: {
    style: {
      color: "black",
      backgroundColor: "#FFFF",
    },
  },
  rows: {
    style: {
      color: "black", // Adjust as per your design
      backgroundColor: "#E7F1F9", // Adjust as per your design
    },
    stripedStyle: {
      color: "black", // Adjust as per your design
      backgroundColor: "#E7F1F9", // Adjust as per your design
    },
  },
};

const RequestApprover = (props: Props) => {
  const [selected, setSelected] = useState<string>("ALL");
  const [requests, setRequests] = useState<Record[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationReceived, setnotificationReceived] = useState(false);
  const [search, searchRequest] = useState("");
  const { user } = useAuth();
  const { isRefresh } = useNotification();
  const [totalPages, setTotalPages] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const debounce = useRef<NodeJS.Timeout>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    if (!user.id || !echo) return;
    echo
      .private(`App.Models.User.${user.id}`)
      .notification((notification: any) => {
        setnotificationReceived(true);
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "info",
          title: notification.message,
          showConfirmButton: false,
          timer: 6000,
          timerProgressBar: true,
          showCloseButton: true,
        });
      });

    return () => {
      echo.leave(`App.Models.User.${user.id}`);
    };
  }, [user.id, echo]);

  useEffect(() => {
    if (notificationReceived) {
      setnotificationReceived(false);
    }
  }, [notificationReceived]);

  useEffect(() => {
    if (user.id) {
      const fetchRequests = async () => {
        try {
          const response = await api.get(
            `/request-forms/for-approval/${user.id}/for-approval-requests`,
            {
              params: {
                page: page,
                per_page: perPage,
                search: search,
                status: selected,
              },
            },
          );
          setRequests(response.data.request_forms_paginated.data);
          setTotalPages(response.data.request_forms_paginated.total);
        } catch (error) {
          console.error("Error fetching requests data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchRequests();
    }
  }, [
    user.id,
    notificationReceived,
    isRefresh,
    page,
    perPage,
    search,
    selected,
  ]);

  const NoDataComponent = () => (
    <div className="flex items-center justify-center h-64 text-gray-500">
      <p className="text-lg">No {search ? `"${search}"` : ""} records found</p>
    </div>
  );
  const LoadingSpinner = () => (
    <table className="table" style={{ background: "white" }}>
      <tbody>
        {Array.from({ length: 6 }).map((_, index) => (
          <tr key={index}>
            <td className="w-full border border-gray-200" colSpan={7}>
              <div className="flex justify-center">
                <div className="flex flex-col w-full gap-4">
                  <div className="w-full h-12 skeleton bg-slate-300"></div>
                </div>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const handleView = (record: Record) => {
    setSelectedRecord(record);
    setModalIsOpen(true);
  };

  const handleClick = (status: string) => {
    setSelected(status);
  };

  const handleSearchRequest = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      searchRequest(event.target.value.toLowerCase());
    }, 500);
  };

  const columns = [
    {
      name: "Request ID",
      selector: (row: Record) => row.request_code,
      width: "160px",
      sortable: true,
    },
    {
      name: "Requested by",
      sortable: true,
      selector: (row: Record) => row.requested_by,
    },
    {
      name: "Request Type",
      sortable: true,
      selector: (row: Record) => row.form_type,
      width: "300px",
    },
    {
      name: "Date",
      selector: (row: Record) =>
        new Date(row.created_at).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      sortable: true,
    },
    {
      name: "Branch",
      sortable: true,
      selector: (row: Record) => row?.user_requested,
    },
    {
      name: "Status",
      selector: (row: Record) => row.status,
      sortable: true,
      width: "200px",
      cell: (row: Record) => (
        <div className="relative flex items-center w-full group">
          {/* Status Badge */}
          <div
            className={`${
              row.completed_status === "Completed"
                ? "bg-primary"
                : row.status.trim() === "Pending"
                  ? "bg-secondary"
                  : row.status.trim() === "Approved"
                    ? "bg-green-400"
                    : row.status.trim() === "Disapproved"
                      ? "bg-accent"
                      : row.status.trim() === "Ongoing"
                        ? "bg-primary"
                        : "bg-red-600"
            } rounded-lg py-1 px-3 text-center text-white flex items-center`}
          >
            {row.completed_status === "Completed"
              ? row.completed_status.trim()
              : row.status.trim()}
          </div>

          {/* Tooltip Icon and Tooltip Itself */}
          {(row.status === "Pending" || row.status === "Ongoing") && (
            <div
              className="z-20 flex items-center ml-1 transition-opacity duration-300 transform cursor-pointer tooltip tooltip-right group-hover:opacity-100"
              data-tip={`Pending: ${
                row.pending_approver === user?.fullName
                  ? "You"
                  : row.pending_approver
              }`}
            >
              <QuestionMarkCircleIcon className="w-6 h-6 text-gray-500" />
            </div>
          )}
        </div>
      ),
    },
    {
      name: "Action",
      width: "150px",
      cell: (row: Record) => (
        <button
          className="bg-primary text-white  px-3 py-1 rounded-[16px] cursor-pointer"
          onClick={() => handleView(row)}
        >
          View
        </button>
      ),
    },
  ];

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    if (user.id) {
      try {
        const response = await api.get(
          `/request-forms/for-approval/${user.id}/for-approval-requests`,
          {
            params: {
              page: page,
              per_page: perPage,
              search: search,
              status: selected,
            },
          },
        );
        setRequests(response.data.request_forms_paginated.data);
        setTotalPages(response.data.request_forms_paginated.total);
      } catch (error) {
        console.error("Error fetching requests data:", error);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  };

  const items = [
    {
      label: "All Requests",
      value: "ALL",
    },
    {
      label: "Completed Requests",
      value: "Completed",
    },
    {
      label: "Pending Requests",
      value: "Pending",
    },
    {
      label: "Ongoing Requests",
      value: "Ongoing",
    },
    {
      label: "Unsuccessful Requests",
      value: "Disapproved",
    },
  ];

  const handlePerRowsChange = (pageRow: number) => {
    setPerPage(pageRow);
  };

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  return (
    <div className="w-full px-10 pt-4 pb-10 bg-graybg dark:bg-blackbg h-lvh">
      <div className="flex justify-between items-center">
        <Link href="/create-request?title=Stock%20Requisition">
          <button className="bg-primary text-white rounded-[12px] mb-2 w-[120px] sm:w-[151px] h-[34px] z-10 cursor-pointer">
            Send Request
          </button>
        </Link>
        <button
          type="button"
          disabled={isRefreshing}
          onClick={refreshData}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 flex gap-1 rounded items-center"
        >
          <BiRotateRight
            className={`size-6 ${isRefreshing && "animate-spin"}`}
          />{" "}
          <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>
      <div className="relative w-full h-auto rounded-lg drop-shadow-lg md:mr-4">
        <div className="flex flex-col items-center w-full overflow-x-auto bg-base-100 rounded-lg">
          <div className="w-full border-b-2">
            <ul className="flex items-center justify-between px-2 py-4 space-x-4 overflow-x-auto font-medium md:space-x-6">
              <div className="flex justify-start">
                {items.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      handleClick(item.value);
                      setLoading(true);
                    }}
                    className={`cursor-pointer hover:text-primary px-2 ${
                      selected === item.value ? "underline text-primary" : ""
                    } underline-offset-8 decoration-primary decoration-2`}
                  >
                    {item.label}
                  </li>
                ))}
              </div>
              <div className="group justify-end flex px-4 py-3 rounded-md border-2 border-blue-300 overflow-hidden max-w-md font-[sans-serif] focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 192.904 192.904"
                  width="16px"
                  className="mr-3 rotate-90 fill-gray-600"
                >
                  <path d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z"></path>
                </svg>
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-full text-sm text-gray-600 bg-transparent outline-none focus:outline-none"
                  onChange={handleSearchRequest}
                />
              </div>
            </ul>
          </div>
          <div className="w-full overflow-x-auto">
            <DataTable
              columns={columns}
              defaultSortAsc={false}
              data={
                requests
                  .map((item: Record) => ({
                    ...item,
                    date: new Date(item.date),
                  }))
                  .sort((a, b) => b.id - a.id) // Sorts by id in descending order
              }
              noDataComponent={<NoDataComponent />}
              progressPending={loading}
              progressComponent={<LoadingSpinner />}
              paginationServer
              pagination
              striped
              customStyles={tableCustomStyles}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handlePerRowsChange}
              paginationTotalRows={totalPages}
              paginationRowsPerPageOptions={paginationRowsPerPageOptions}
              persistTableHead
            />
          </div>
        </div>
      </div>
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Stock Requisition Slip" && (
          <ApproversStock
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Purchase Order Requisition Slip" && (
          <ApproverPurchase
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Discount Requisition Form" && (
          <ApproverDiscount
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Cash Disbursement Requisition Slip" && (
          <ApproverCashDisbursement
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Application For Cash Advance" && (
          <ApproverCashAdvance
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Liquidation of Actual Expense" && (
          <ApproverLiquidation
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Refund Request" && (
          <ApproverRefund
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Check Issuance Requisition Slip" && (
          <ApproverCheckIssuance
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
    </div>
  );
};

export default authenticatedPage(RequestApprover, true, false, true);
