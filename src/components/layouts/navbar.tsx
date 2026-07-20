"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronDownIcon,
  BellIcon,
  ChevronUpIcon,
  EnvelopeIcon,
  Bars3Icon,
  EnvelopeOpenIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import Avatar from "@/assets/avatar.png";
import { format } from "date-fns";
import { useSpring, animated } from "@react-spring/web";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { ucfirst } from "@/utils/ucfirst";
import { useRouter } from "next/navigation";
import { NavProps } from "@/types/navbarTypes";
import { useNotification } from "@/context/NotificationContext";
import ApproverPurchase from "@/app/(views)/approver/_components/modals/ApproverPurchase";
import ApproversStock from "@/app/(views)/approver/_components/modals/ApproverStock";
import ApproverDiscount from "@/app/(views)/approver/_components/modals/ApproverDiscount";
import ApproverCashDisbursement from "@/app/(views)/approver/_components/modals/ApproverCashDisbursement";
import ApproverCashAdvance from "@/app/(views)/approver/_components/modals/ApproverCashAdvance";
import ApproverLiquidation from "@/app/(views)/approver/_components/modals/ApproverLiquidation";
import ApproverRefund from "@/app/(views)/approver/_components/modals/ApproverRefund";
import ViewStockModal from "../basic-modals/ViewStockModal";
import ViewDiscountModal from "../basic-modals/ViewDiscountModal";
import ViewPurchaseModal from "../basic-modals/ViewPurchaseModal";
import ViewCashDisbursementModal from "../basic-modals/ViewCashDisbursementModal";
import ViewCashAdvanceModal from "../basic-modals/ViewCashAdvanceModal";
import ViewLiquidationModal from "../basic-modals/ViewLiquidationModal";
import ViewRequestModal from "../basic-modals/ViewRequestModal";
import fullnameAcronym from "@/utils/fullnameAcronym";
import ThemeButton from "./theme-button";

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
  kind_of_request: string;
  user: {
    branch: {
      branch_code: string;
    };
  };
  approved_attachments: any;
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

const AnimatedDiv = animated.div as any;

const Navbar = ({
  darkMode,
  currentPage,
  toggleSidebar,
  isSidebarVisible,
}: NavProps) => {
  const flexBetween = "flex items-center justify-between items-center";
  const listProfile = "px-4 hover:bg-[#E0E0F9] cursor-pointer py-2";
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenNotif, setIsOpenNotif] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [selectedRecordRequest, setSelectedRecordRequest] =
    useState<Record | null>(null);
  const [requests, setRequests] = useState<Record[]>([]);
  const { user, isLoading, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    handleMarkAllAsRead,
    markAsReadNotification,
  } = useNotification();

  const handleClose = () => {
    setIsOpen(false);
  };

  const toggleProfileDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsOpenNotif(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, buttonRef]);

  // Format the notification date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString.replace(" ", "T")), "MMM d, yyyy h:mm a");
  };

  // Animation for the unread notification count
  const springProps: any = useSpring({
    opacity: unreadCount > 0 ? 1 : 0,
    transform: unreadCount > 0 ? "scale(1)" : "scale(0)",
    config: { tension: 250, friction: 15 },
  });

  const profilePictureUrl = user?.profile_picture
    ? `${
        process.env.NEXT_PUBLIC_API_STORAGE_URL
      }/${user?.profile_picture.replace(/\\/g, "/")}`
    : Avatar;

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        handleClose();
      }
    });
  };

  const fetchNotifData = async (data: any) => {
    try {
      const response = await api.get(
        `/request-forms/for-approval/${user.id}/for-approval-requests`,
      );
      const request_forms = response.data.request_forms;
      request_forms.some((request: any) => {
        if (request.id === data) {
          setSelectedRecord({
            ...request,
            date: new Date(request.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          });
          return true;
        }
        return false;
      });
    } catch (error) {
      console.error("Error fetching requests data:", error);
    }
  };

  const fetchRequests = async (data: string) => {
    try {
      const response = await api.get(`/view-request`);
      const request_forms = response.data.data;
      request_forms.some((request: any) => {
        if (request.id === data) {
          setSelectedRecordRequest({
            ...request,
            date: new Date(request.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          });
          return true;
        }
        return false;
      });
    } catch (error) {
      console.error("Error fetching requests data:", error);
    }
  };

  const handleView = (data: string) => () => {
    fetchNotifData(data);
    setModalIsOpen(true);
  };

  const handleViewRequest = (data: string) => () => {
    fetchRequests(data);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const refreshData = () => {
    if (user.id) {
      api
        .get(`/request-forms/for-approval/${user.id}/for-approval-requests`)
        .then((response) => {
          setRequests(response.data.request_forms);
        })
        .catch((error) => {
          console.error("Error refreshing requests data:", error);
        });
    }
  };

  const handleGoToAllRequest = () => () => {
    router.push("/request");
  };

  const handleGoToSharedRequests =
    (notifId: number, request_code: string) => () => {
      router.push(`/shared-requests?search=${request_code}`);
      markAsReadNotification(notifId);
    };

  const handleViewAndMarkReadNotification =
    (requestId: any, notifId: any) => () => {
      handleView(requestId)();
      markAsReadNotification(notifId);
    };
  const handleViewAndMarkReadRequestNotification =
    (requestId: any, notifId: any) => () => {
      handleViewRequest(requestId)();
      markAsReadNotification(notifId);
    };

  const handleReadOnly = (notifId: any) => () => {
    markAsReadNotification(notifId);
  };

  if (!isAuthenticated) return null;

  return (
    <div className={`nav-container sticky top-0 z-50 bg-base-100`}>
      {/* Toggle light and dark mode */}
      <nav className={`${flexBetween}`}>
        <div className={`h-[67px] flex items-center`}>
          <div onClick={toggleSidebar}>
            {isSidebarVisible ? (
              <XMarkIcon
                title="Close Menu"
                className={`size-[36px] font-bold cursor-pointer pl-4`}
              />
            ) : (
              <Bars3Icon
                className={`size-[36px] font-bold cursor-pointer pl-4`}
              />
            )}
          </div>

          <h1
            className={`lg:!text-[32px] md:!text-[28px] sm:!text-[20px] font-bold text-primary text-capitalize pl-4`}
          >
            {ucfirst(currentPage)}
          </h1>
        </div>

        <div className="flex items-center justify-between pr-12">
          <div className={`${flexBetween} gap-2 relative`}>
            {isLoading ? (
              <div className="relative flex flex-col gap-4 w-52">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full shrink-0 bg-slate-300 skeleton"></div>
                  <div className="flex flex-col gap-4">
                    <div className="h-9 w-28 bg-slate-300 skeleton"></div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="pr-2">
                  <ThemeButton />
                </div>
                {user?.profile_picture ? (
                  <Image
                    alt="logo"
                    className="hidden rounded-full cursor-pointer sm:block w-14 h-14"
                    src={profilePictureUrl}
                    height={45}
                    width={45}
                    onClick={toggleProfileDropdown}
                  />
                ) : (
                  fullnameAcronym({
                    fullName: user?.fullName,
                    height: "h-14",
                    width: "w-14",
                    textSize: "!text-2xl",
                  })
                )}
                {/* USER NAME */}
                <p
                  className="pl-2 lg:!text-[14px] !text-[11px] font-bold cursor-pointer"
                  onClick={toggleProfileDropdown}
                >
                  {user?.firstName} {user?.lastName}
                </p>
              </>
            )}

            {!isOpen ? (
              <button
                ref={buttonRef}
                className="size-[25px] cursor-pointer"
                onClick={toggleProfileDropdown}
              >
                <ChevronDownIcon />
              </button>
            ) : (
              <button
                ref={buttonRef}
                className="size-[25px] cursor-pointer"
                onClick={toggleProfileDropdown}
              >
                <ChevronUpIcon />
              </button>
            )}
            {/* Profile dropdown */}
            {isOpen && (
              <div
                ref={dropdownRef}
                className="absolute z-50 w-full bg-base-100 overflow-x-hidden top-[55px] rounded-b-lg shadow-sm"
                style={{ zIndex: 1000 }}
              >
                <ul>
                  <Link href="/profile" onClick={handleClose}>
                    <li className={`${listProfile}`}>My Profile</li>
                  </Link>
                  <Link href="/help" onClick={handleClose}>
                    <li className={`${listProfile}`}>Help</li>
                  </Link>
                  <hr />
                  <li className={`${listProfile}`} onClick={handleLogout}>
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
          <div className="relative pl-4 sm:pl-10">
            <div className="relative">
              <BellIcon
                className={`size-[30px] cursor-pointer ${
                  isOpenNotif ? "text-yellow-400" : "text-gray-400"
                }`}
                onClick={() => {
                  setIsOpenNotif(!isOpenNotif);
                  // handleOpenNotification();
                }}
              />
              {/* Notification Count */}
              {unreadCount > 0 && (
                <AnimatedDiv
                  style={
                    {
                      ...springProps,
                      position: "absolute",
                      top: -10,
                      right: -10,
                      background: "red",
                      color: "white",
                      borderRadius: "50%",
                      width: 20,
                      height: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: "bold",
                    } as any
                  }
                >
                  {unreadCount}
                </AnimatedDiv>
              )}
            </div>
            {/* Notification */}
            {isOpenNotif && (
              <div className="flex flex-row">
                <div
                  className="w-96 md:w-[500px] absolute top-11 right-0 border-2 bg-base-100 border-black z-40 overflow-y-auto max-h-[500px] rounded-lg shadow-lg flex flex-col"
                  ref={dropdownRef}
                >
                  <ul className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <li className="px-4 py-4 text-center">
                        No notifications yet
                      </li>
                    ) : (
                      notifications.map((notif) => {
                        const message =
                          notif.data?.message || "No message available";
                        const title =
                          notif.data?.request_form_id ??
                          notif.data?.form_type ??
                          notif.data?.title ??
                          "No title available";
                        const requestSender =
                          `${notif.data?.requesterFirstname} ${notif.data?.requesterLastname}` ||
                          "No name available";
                        const from = notif.data?.from || "No name available";
                        const createdAt =
                          notif?.created_at || new Date().toISOString();
                        const notificationId =
                          notif.notification_id || "unknown-id";

                        const handles =
                          notif.data.type === "feedback"
                            ? handleReadOnly(notif.id)
                            : notif.data.title === "Shared a Request"
                              ? handleGoToSharedRequests(
                                  notif.id,
                                  notif.data.request_code,
                                )
                              : !notif.data.request_id
                                ? handleGoToAllRequest()
                                : notif.data.request_reference === "approver"
                                  ? handleViewAndMarkReadNotification(
                                      notif.data.request_id,
                                      notif.id,
                                    )
                                  : notif.data.request_reference === "requester"
                                    ? handleViewAndMarkReadRequestNotification(
                                        notif.data.request_id,
                                        notif.id,
                                      )
                                    : handleGoToAllRequest();

                        const textColor =
                          notif.data.status === "approved"
                            ? "text-green-400"
                            : notif.data.status === "ongoing"
                              ? "text-blue-500"
                              : notif.type ===
                                    "App\\Notifications\\PreviousReturnRequestNotification" ||
                                  notif.type ===
                                    "App\\Notifications\\ReturnRequestNotification"
                                ? "text-red-500"
                                : notif.data.type === "feedback"
                                  ? "text-purple-500"
                                  : "text-primary";

                        return (
                          <button
                            type="button"
                            className="w-full"
                            onClick={handles}
                            key={notif.id}
                          >
                            <li
                              className={`px-4 py-4 hover:bg-base-100 cursor-pointer border-b flex items-center relative ${
                                notif.read_at ? "" : "bg-base-300"
                              }`}
                              onClick={() => setIsOpenNotif(false)}
                              aria-label={`Notification: ${message}`}
                            >
                              <div className="flex items-center justify-center w-12 h-12 bg-black rounded-full">
                                {notif.read_at ? (
                                  <EnvelopeOpenIcon className="text-white size-5" />
                                ) : (
                                  <EnvelopeIcon className="text-white size-5" />
                                )}
                              </div>
                              <div className="flex-1 mt-4 ml-4">
                                <p
                                  className={`${textColor} !text-lg ${
                                    notif.read_at ? "" : "font-bold"
                                  } text-center`}
                                >
                                  {title}
                                </p>
                                <p
                                  className={`${textColor} text-sm ${
                                    notif.read_at ? "" : "font-bold"
                                  } text-center ${
                                    notif.data.type === "feedback" &&
                                    "whitespace-pre-wrap"
                                  }`}
                                >
                                  {message}
                                </p>
                                {notif.data.request_reference ===
                                  "approver" && (
                                  <p>
                                    <span className="font-bold">From:</span>{" "}
                                    <span className="font-semibold">
                                      {requestSender}
                                    </span>
                                  </p>
                                )}
                                {notif.data.from && (
                                  <p>
                                    <span className="font-bold">From:</span>{" "}
                                    <span className="font-semibold">
                                      {from}
                                    </span>
                                  </p>
                                )}
                              </div>
                              <p className="absolute !text-xs text-center text-gray-400 top-2 right-2">
                                {formatDate(createdAt)}
                              </p>
                              {!notif.read_at && (
                                <p className="absolute left-0 right-0 !text-sm text-center text-gray-600 top-2">
                                  Unread notification
                                </p>
                              )}
                            </li>
                          </button>
                        );
                      })
                    )}
                  </ul>
                  <hr />
                  {notifications.length > 0 && ( // Conditionally render this section
                    <div
                      className="py-5 text-center cursor-pointer"
                      onClick={handleMarkAllAsRead}
                    >
                      Mark All As Read
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
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
      {/* for view only */}
      {modalIsOpen &&
        selectedRecordRequest &&
        selectedRecordRequest.form_type === "Stock Requisition Slip" && (
          <ViewStockModal
            closeModal={closeModal}
            record={{
              ...selectedRecordRequest,
              date: selectedRecordRequest.date.toString(),
            }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecordRequest &&
        selectedRecordRequest.form_type === "Discount Requisition Form" && (
          <ViewDiscountModal
            closeModal={closeModal}
            record={{
              ...selectedRecordRequest,
              date: selectedRecordRequest.date.toString(),
            }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecordRequest &&
        selectedRecordRequest.form_type ===
          "Purchase Order Requisition Slip" && (
          <ViewPurchaseModal
            closeModal={closeModal}
            record={{
              ...selectedRecordRequest,
              date: selectedRecordRequest.date.toString(),
            }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecordRequest &&
        selectedRecordRequest.form_type ===
          "Cash Disbursement Requisition Slip" && (
          <ViewCashDisbursementModal
            closeModal={closeModal}
            record={{
              ...selectedRecordRequest,
              date: selectedRecordRequest.date.toString(),
            }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecordRequest &&
        selectedRecordRequest.form_type === "Application For Cash Advance" && (
          <ViewCashAdvanceModal
            closeModal={closeModal}
            record={{
              ...selectedRecordRequest,
              date: selectedRecordRequest.date.toString(),
            }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecordRequest &&
        selectedRecordRequest.form_type === "Liquidation of Actual Expense" && (
          <ViewLiquidationModal
            closeModal={closeModal}
            record={{
              ...selectedRecordRequest,
              date: selectedRecordRequest.date.toString(),
            }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecordRequest &&
        selectedRecordRequest.form_type === "Refund Request" && (
          <ViewRequestModal
            closeModal={closeModal}
            record={{
              ...selectedRecordRequest,
              date: selectedRecordRequest.date.toString(),
            }}
            refreshData={refreshData}
          />
        )}
    </div>
  );
};

export default Navbar;
