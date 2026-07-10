"use client";

import React, { useState, useEffect, useRef } from "react";
import DataTable from "react-data-table-component";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import echo from "@/hooks/echo";
import Link from "next/link";
import ViewStockModal from "@/components/basic-modals/ViewStockModal";
import ViewDiscountModal from "@/components/basic-modals/ViewDiscountModal";
import ViewPurchaseModal from "@/components/basic-modals/ViewPurchaseModal";
import ViewCashDisbursementModal from "@/components/basic-modals/ViewCashDisbursementModal";
import ViewCashAdvanceModal from "@/components/basic-modals/ViewCashAdvanceModal";
import ViewLiquidationModal from "@/components/basic-modals/ViewLiquidationModal";
import ViewRequestModal from "@/components/basic-modals/ViewRequestModal";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import authenticatedPage from "@/lib/authenticatedPage";
import { paginationRowsPerPageOptions } from "@/constants/paginationRowsPerPageOptions";
import ViewCheckIssuanceModal from "@/components/basic-modals/ViewCheckIssuance";
import { BiRotateRight } from "react-icons/bi";
type Props = {};

type Record = {
  total_labor: number;
  total_discount: number;
  total_spotcash: number;
  currency: string;
  pending_approver: {
    approver_name: string;
  };
  requested_by: string;
  requested_signature: string;
  requested_position: string;
  id: number;
  noted_by: {
    id: number;
    firstName: string;
    lastName: string;
    firstname: string;
    lastname: string;
    comment: string;
    position: string;
    signature: string;
    status: string;
  }[];
  approved_by: {
    id: number;
    firstName: string;
    lastName: string;
    comment: string;
    firstname: string;
    lastname: string;
    position: string;
    signature: string;
    status: string;
  }[];
  user_id: number;
  kind_of_request: string;
  request_code: string;
  form_type: string;
  form_data: MyFormData[];
  date: Date;
  created_at: Date;
  branch: {
    name: string;
    branch: string;
  };
  payee?: string;
  bank?: string;
  account_no?: string;
  swift_code?: string;
  status: string;
  purpose: string;
  totalBoatFare: string;
  destination: string;
  grand_total: string;
  grandTotal: string;
  approvers_id: number;
  attachment: string;
  user: {
    branch: {
      branch_code: string;
    };
  };
  approved_attachments: any;
};

type MyFormData = {
  total_labor: number;
  total_discount: number;
  total_spotcash: number;
  approvers_id: number;
  employeeID: string;
  purpose: string;
  items: MyItem[];
  noted_by: {
    id: number;
    firstName: string;
    firstname: string;
    lastname: string;
    lastName: string;
    comment: string;
    position: string;
    signature: string;
    status: string;
  }[];
  approved_by: {
    id: number;
    firstName: string;
    lastName: string;
    comment: string;
    position: string;
    signature: string;
    status: string;
  }[];

  approvers: {
    noted_by: {
      id: number;
      firstName: string;
      lastName: string;
      comment: string;
      position: string;
      signature: string;
      status: string;
    }[];
    approved_by: {
      id: number;
      firstName: string;
      lastName: string;
      comment: string;
      position: string;
      signature: string;
      status: string;
    }[];
  };
  date: string;
  branch: string;
  grand_total: string;
  supplier: string;
  address: string;
  payee?: string;
  bank?: string;
  account_no?: string;
  swift_code?: string;
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
  attachment: string;
  branch_id: number;
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
  from: string;
  to: string;
  activity: string;
  hotel: string;
  rate: string;
  amount: string;
  perDiem: string;
  liquidationDate: string;
  particulars: string;
  particularsAmount: string;
  destination: string;
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
      color: "STRIPEDCOLOR",
      backgroundColor: "STRIPEDCOLOR",
      transition: "background-color 0.1s ease",
      "&:hover": {
        backgroundColor: "#D1E4F3",
      },
    },
    stripedStyle: {
      color: "NORMALCOLOR",
      backgroundColor: "#E7F1F9",
    },
  },
};

const Request = (props: Props) => {
  const [selected, setSelected] = useState<string>("ALL");
  const [requests, setRequests] = useState<Record[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [branchList, setBranchList] = useState<any[]>([]);
  const [branchMap, setBranchMap] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [notificationReceived, setnotificationReceived] = useState(false);
  const [search, searchRequest] = useState("");
  const [toDelete, setToDelete] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const { user } = useAuth();
  const debounce = useRef<any>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        const response = await api.get(`/view-branch`);
        const branches = response.data.data;

        // Create a mapping of id to branch_code
        const branchMapping = new Map<number, string>(
          branches.map((branch: { id: number; branch_code: string }) => [
            branch.id,
            branch.branch_code,
          ]),
        );

        setBranchList(branches);
        setBranchMap(branchMapping);
      } catch (error) {
        console.error("Error fetching branch data:", error);
      }
    };

    fetchBranchData();
  }, []);

  useEffect(() => {
    if (!echo || !user.id) return;
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
  }, [echo, user.id]);

  useEffect(() => {
    if (notificationReceived) {
      setnotificationReceived(false);
    }
  }, [notificationReceived]);

  useEffect(() => {
    if (user.id) {
      const fetchRequests = async () => {
        try {
          const response = await api.get(`/view-request`, {
            params: {
              page: page,
              per_page: perPage,
              search: search,
              status: selected,
            },
          });
          setRequests(response.data?.data?.data);
          setTotalPages(response.data?.data?.total);
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
    toDelete,
    page,
    perPage,
    search,
    selected,
  ]);

  const handleView = (record: Record) => {
    setSelectedRecord(record);
    setModalIsOpen(true);
  };

  const handleDelete = (record: Record) => {
    // Check if the status is not "Pending"
    setToDelete(true);
    if (record.status !== "Pending") {
      Swal.fire({
        icon: "info",
        title: "Request Approved",
        html:
          `<strong>Are you sure you want to delete this request, even though it has already been approved?</strong> <br/>` +
          "Request Code: " +
          record.request_code +
          " <br/> Request Type: " +
          record.form_type,
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, Delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          api
            .delete(`/delete-request/${record.id}`)
            .then(() => {
              Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: `The request was successfully deleted.`,
                confirmButtonColor: "#3085d6",
                confirmButtonText: "Close",
              });
            })
            .catch((error) => {
              console.error("Error deleting request:", error);
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Something went wrong!",
                confirmButtonColor: "#3085d6",
                confirmButtonText: "Close",
              });
            })
            .finally(() => {
              setToDelete(false);
            });
        }
      });

      return;
    }

    Swal.fire({
      title: "Are you sure you want to delete this request?",
      html:
        "Request Code: " +
        record.request_code +
        " <br/> Request Type: " +
        record.form_type,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        api
          .delete(`/delete-request/${record.id}`)
          .then(() => {
            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: `The request was successfully deleted.`,
              confirmButtonColor: "#3085d6",
              confirmButtonText: "Close",
            });
          })
          .catch((error) => {
            console.error("Error deleting request:", error);
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Something went wrong!",
              confirmButtonColor: "#3085d6",
              confirmButtonText: "Close",
            });
          })
          .finally(() => {
            setToDelete(false);
          });
      }
    });
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
            <td className="w-full border border-gray-200" colSpan={6}>
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

  const refreshData = async () => {
    setIsRefreshing(true);
    if (user.id) {
      try {
        const response = await api.get(`/view-request`, {
          params: {
            page: page,
            per_page: perPage,
            search: search,
            status: selected,
          },
        });
        setRequests(response.data?.data?.data);
        setTotalPages(response.data?.data?.total);
      } catch (error) {
        console.error("Error fetching requests data:", error);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  };

  const columns = [
    {
      name: "Request ID",
      selector: (row: Record) => row.request_code,
      width: "160px",
      sortable: true,
    },

    {
      name: "Request Type",
      selector: (row: Record) => row.form_type,
      width: "300px",
      sortable: true,
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
      selector: (row: Record) => {
        // Ensure form_data exists and has at least one item with a branch field
        if (
          row.form_data &&
          row.form_data.length > 0 &&
          row.form_data[0].branch
        ) {
          const branchId = parseInt(row.form_data[0].branch, 10);
          return branchMap.get(branchId) || "Unknown";
        }
        return "Unknown"; // Return "Unknown" if branch is unavailable
      },
      sortable: true,
    },
    {
      name: "Status",
      selector: (row: Record) => row.status,
      sortable: true,
      width: "150px",
      cell: (row: Record) => (
        <div className="relative flex items-center w-full group">
          {/* Status Badge */}
          <div
            className={`${
              row.status.trim() === "Pending"
                ? "bg-yellow-400"
                : row.status.trim() === "Approved"
                  ? "bg-green-400"
                  : row.status.trim() === "Disapproved"
                    ? "bg-accent"
                    : row.status.trim() === "Ongoing"
                      ? "bg-blue-500"
                      : "bg-blue-700"
            } rounded-lg py-1 px-3 text-center text-white flex items-center`}
          >
            {row.status.trim()}
          </div>

          {/* Tooltip Icon and Tooltip Itself */}
          {(row.status === "Pending" || row.status === "Ongoing") && (
            <div
              className="z-20 flex items-center ml-1 transition-opacity duration-300 transform cursor-pointer tooltip tooltip-right group-hover:opacity-100"
              data-tip={`Pending: ${row.pending_approver.approver_name}`}
            >
              <QuestionMarkCircleIcon className="w-6 h-6 text-gray-500" />
            </div>
          )}
        </div>
      ),
    },
    {
      name: "Action",
      width: "180px",
      cell: (row: Record) => (
        <div className="flex items-center justify-center w-full gap-2">
          <button
            className="bg-primary text-white px-3 py-1 rounded-[16px] cursor-pointer"
            onClick={() => handleView(row)}
          >
            View
          </button>
          {row.status === "Pending" && (
            <button
              className="bg-accent text-white px-3 py-1 rounded-[16px] cursor-pointer"
              onClick={() => handleDelete(row)}
            >
              Delete
            </button>
          )}
        </div>
      ),
    },
  ];

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

  const closeModal = () => {
    setModalIsOpen(false);
  };
  const handlePerRowsChange = async (newPerPage: number) => {
    setPerPage(newPerPage);
  };

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  return (
    <div className="w-full px-10 pt-4 bg-graybg dark:bg-blackbg h-lvh md:px-10 lg:px-30">
      <div className="flex justify-between items-center">
        <Link href="/create-request?title=Stock%20Requisition">
          <button className="cursor-pointer bg-primary hover:bg-blue-600 text-white rounded-[12px] mb-2 w-[120px] sm:w-[151px] h-[34px] z-10">
            Create a Request
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

      <div className="relative w-full h-auto rounded-lg drop-shadow-lg md:mr-4 ">
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
                    className={`cursor-pointer text-info px-2 ${
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
              data={requests
                .map((item: Record) => ({
                  ...item,
                  date: new Date(item.date),
                }))
                .sort((a: any, b: any) => b.id - a.id)}
              noDataComponent={<NoDataComponent />}
              progressPending={loading}
              progressComponent={<LoadingSpinner />}
              pagination
              paginationServer
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
          <ViewStockModal
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Discount Requisition Form" && (
          <ViewDiscountModal
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Purchase Order Requisition Slip" && (
          <ViewPurchaseModal
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Cash Disbursement Requisition Slip" && (
          <ViewCashDisbursementModal
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Application For Cash Advance" && (
          <ViewCashAdvanceModal
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Liquidation of Actual Expense" && (
          <ViewLiquidationModal
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Refund Request" && (
          <ViewRequestModal
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Check Issuance Requisition Slip" && (
          <ViewCheckIssuanceModal
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
    </div>
  );
};

export default authenticatedPage(Request);
