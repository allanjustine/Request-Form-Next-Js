import React, { useState, useEffect, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { api } from "@/lib/api";
import { PencilIcon } from "@heroicons/react/24/outline";
import EditStockModalSuccess from "./EditStockModalSuccess";
import BeatLoader from "react-spinners/BeatLoader";
import Avatar from "@/assets/avatar.png";
import { Approver } from "@/types/approverTypes";
import Image from "next/image";
import AddCustomModal from "./AddCustomModal";
import PrintCashDisbursement from "@/app/(views)/approver/_components/prints/PrintCashDisbursement";
import { useAuth } from "@/context/AuthContext";
import ZoomableImage from "../ZoomableImage";
import ApprovedAttachments from "../ApprovedAttachments";
import formattedAmount from "@/utils/formattedAmount";
import Storage from "@/utils/storage";
import Swal from "sweetalert2";
import SelectKindOfRequest from "../select-kind-of-request";
import Attachment from "../attachment";
type Props = {
  closeModal: () => void;
  record: Record;
  refreshData: () => void;
};
type Record = {
  created_at: Date;
  id: number;
  request_code: string;
  status: string;
  approvers_id: number;
  form_data: FormData[];
  currency: string;
  supplier?: string;
  address?: string;
  branch: {
    name: string;
    branch: string;
  };
  date: string;
  user_id: number;
  attachment: string;
  kind_of_request: string;
  user: {
    branch: {
      branch_code: string;
    };
  };
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
type FormData = {
  approvers_id: number;
  approvers: {
    noted_by: { firstName: string; lastName: string }[];
    approved_by: { firstName: string; lastName: string }[];
  };
  purpose: string;
  items: Item[];
  branch: string;
  date: string;
  grand_total: string;
  supplier: string;
  address: string;
};

type Item = {
  quantity: string;
  description: string;
  unitCost: string;
  totalAmount: string;
  remarks: string;
};

const currencySymbols: { [key: string]: string } = {
  USD: "$",
  EUR: "€",
  PHP: "₱",
};

const tableStyle2 = "bg-base-100 p-2";
const inputStyle = "border border-black text-[12px] font-bold p-2 h-14";
const tableCellStyle = `${inputStyle} w-20 text-end`;
const ViewCashDisbursementModal: React.FC<Props> = ({
  closeModal,
  record,
  refreshData,
}) => {
  const [editableRecord, setEditableRecord] = useState(record);
  const [newData, setNewData] = useState<Item[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedApprovers, setEditedApprovers] = useState<number>(
    record.approvers_id,
  );
  const [editedDate, setEditedDate] = useState("");
  const [fetchingApprovers, setFetchingApprovers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notedBy, setNotedBy] = useState<Approver[]>([]);
  const [approvedBy, setApprovedBy] = useState<Approver[]>([]);
  const [isFetchingApprovers, setisFetchingApprovers] = useState(false);
  const [isFetchingUser, setisFetchingUser] = useState(false);
  const [printWindow, setPrintWindow] = useState<Window | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string[]>([]);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [removedAttachments, setRemovedAttachments] = useState<
    (string | number)[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const hasDisapprovedInNotedBy = notedBy.some(
    (user) => user.status === "Disapproved",
  );
  const hasDisapprovedInApprovedBy = approvedBy.some(
    (user) => user.status === "Disapproved",
  );
  const [isImgModalOpen, setIsImgModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [kindOfRequest, setKindOfRequest] = useState<string>("");
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const { user } = useAuth();

  const getCurrencySymbol = (currencyCode: string): string => {
    return (
      currencySymbols[currencyCode as keyof typeof currencySymbols] ||
      currencyCode
    );
  };

  const handleCurrencyChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { value } = event.target;
    setEditableRecord((prevRecord) => ({
      ...prevRecord,
      currency: value,
    }));
  };

  // Get branch ID from record
  const branchId = parseInt(record.form_data[0].branch, 10);
  // Get branch name or default to "Unknown"
  const branchName = record?.user?.branch?.branch_code;

  useEffect(() => {
    const attachments = JSON.parse(record.attachment);
    // Ensure currentUserId and userId are converted to numbers if they exist
    setNewData(record.form_data[0].items.map((item) => ({ ...item })));
    setEditableRecord(record);
    setNotedBy(editableRecord.noted_by);
    setApprovedBy(editableRecord.approved_by);
    setEditedApprovers(record.approvers_id);
    setKindOfRequest(record.kind_of_request);
    try {
      if (typeof record.attachment === "string") {
        // Parse the JSON string if it contains the file path
        const parsedAttachment: string[] = JSON.parse(record.attachment);

        if (parsedAttachment.length > 0) {
          // Construct file URLs
          const fileUrls = parsedAttachment.map((filePath) => filePath);
          setAttachmentUrl(fileUrls);
        }
      }
    } catch (error) {
      console.error("Error parsing attachment:", error);
    }
  }, [record]);
  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset newData to original values
    setEditedApprovers(record.approvers_id);
    setAttachmentUrl(attachmentUrl);
    setNewAttachments([]); // Clear new attachments
    setRemovedAttachments([]); // Reset removed attachments
    setNewData(record.form_data[0].items.map((item) => ({ ...item })));
    setEditableRecord((prevState) => ({
      ...prevState,
      form_data: [
        {
          ...prevState.form_data[0],
          grand_total: record.form_data[0].grand_total, // Reset grand_total
        },
      ],
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewAttachments((prevImages) => [...prevImages, ...files]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files) as File[];
    setNewAttachments((prevImages) => [...prevImages, ...droppedFiles]);
    setIsHovering(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovering(true);
  };

  const handleDragLeave = () => {
    setIsHovering(false);
  };

  const handleRemoveImage = (imageName: string) => {
    setNewAttachments((prevImages) =>
      prevImages.filter((image) => image.name !== imageName),
    );
  };

  const handleRemoveAttachment = (index: string) => {
    // Add the path to the removedAttachments state
    setRemovedAttachments((prevRemoved) => [...prevRemoved, index]);

    // Remove the attachment from the current list
    setAttachmentUrl((prevUrls) =>
      prevUrls.filter((item, i) => item !== index),
    );
  };

  const handleEdit = () => {
    setEditedDate(editableRecord.form_data[0].date); // Initialize editedDate with the original date
    setNotedBy(user.noted_bies.map((nb: any) => nb.noted_by));
    setApprovedBy(user.approved_bies.map((ab: any) => ab.approved_by));
    setIsEditing(true);
  };

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  if (!record) return null;

  const handleItemChange = (
    index: number,
    field: keyof Item,
    value: string,
  ) => {
    // Update the field of the item at the specified index in newData
    const newDataCopy = [...newData];
    newDataCopy[index] = { ...newDataCopy[index], [field]: value };
    setErrorMessage("");
    // Calculate totalAmount if either quantity or unitCost changes
    if (field === "quantity" || field === "unitCost") {
      const quantity = parseFloat(newDataCopy[index].quantity);
      const unitCost = parseFloat(newDataCopy[index].unitCost);
      newDataCopy[index].totalAmount =
        (quantity * unitCost).toString() === "NaN"
          ? "0"
          : parseFloat((quantity * unitCost).toString()).toFixed(2);
    }

    // Calculate grandTotal
    let total = 0;
    for (const item of newDataCopy) {
      total += parseFloat(item.totalAmount);
    }
    const grandTotal = parseFloat(total.toString()).toFixed(2);

    // Update the state with the modified newDataCopy and grandTotal
    setNewData(newDataCopy);
    setEditableRecord((prevState) => ({
      ...prevState,
      approvers_id: editedApprovers,
      form_data: [
        {
          ...prevState.form_data[0],
          grand_total: grandTotal,
          date: editedDate !== "" ? editedDate : prevState.form_data[0].date,
        },
      ],
    }));
  };
  const handleSaveChanges = async () => {
    // Simple validation
    if (
      !newData.every(
        (item) =>
          parseFloat(item.quantity) > 0 &&
          parseFloat(item.unitCost) > 0 &&
          item.description &&
          item.description.trim() !== "",
      )
    ) {
      setErrorMessage(
        "Quantity and unit cost must be greater than 0, and description cannot be empty.",
      );
      return;
    }
    setFormSubmitted(true);
    if (!kindOfRequest) {
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("updated_at", new Date().toISOString());
      const notedByIds = Array.isArray(notedBy)
        ? notedBy.map((person) => person.id)
        : [];
      const approvedByIds = Array.isArray(approvedBy)
        ? approvedBy.map((person) => person.id)
        : [];
      formData.append("noted_by", JSON.stringify(notedByIds));
      formData.append("approved_by", JSON.stringify(approvedByIds));
      formData.append("currency", editableRecord.currency);
      formData.append("kind_of_request", kindOfRequest);
      formData.append(
        "form_data",
        JSON.stringify([
          {
            branch: editableRecord.form_data[0].branch,
            date: editedDate !== "" ? editedDate : editableRecord.created_at,
            status: editableRecord.status,
            grand_total: editableRecord.form_data[0].grand_total,
            items: newData,
          },
        ]),
      );

      // Append existing attachments
      attachmentUrl.forEach((url, index) => {
        const path = url.split(
          "request-form-files/request_form_attachments/",
        )[1];
        formData.append(`attachment_url_${index}`, path);
      });

      // Append new attachments
      newAttachments.forEach((file) => {
        formData.append("new_attachments[]", file);
      });

      // Append removed attachments
      removedAttachments.forEach((path, index) => {
        formData.append("removed_attachments[]", String(path));
      });

      const response = await api.post(`/update-request/${record.id}`, formData);

      setLoading(false);
      setIsEditing(false);
      setSavedSuccessfully(true);
      setRemovedAttachments([]);
      setFormSubmitted(false);
      refreshData();
    } catch (error: any) {
      setLoading(false);
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to update Cash Disbursement",
      );
    }
  };
  const openAddCustomModal = () => {
    Swal.fire({
      title: "Edit Approver",
      text: "Before updating the approver, please make sure to save your changes first. Editing the approver may result in loss of unsaved changes.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setIsModalOpen(true);
      }
    });
  };

  const closeModals = () => {
    setIsModalOpen(false);
  };

  const handleAddCustomData = (notedBy: Approver[], approvedBy: Approver[]) => {
    setNotedBy(notedBy);
    setApprovedBy(approvedBy);
    setIsEditing(false);
  };

  const handlePrint = () => {
    // Construct the data object to be passed
    const data = {
      id: record,
      approvedBy: approvedBy,
      notedBy: notedBy,
      user: user,
      requested_branch: record?.branch,
    };

    localStorage.setItem("printData", JSON.stringify(data));
    // Open a new window with PrintRefund component
    const newWindow = window.open(`/print/cash-disbursement`, "_blank");

    // Optional: Focus the new window
    if (newWindow) {
      newWindow.focus();
    }
  };

  const handleViewImage = (imageUrl: any) => {
    setCurrentImage(Storage(imageUrl));
    setIsImgModalOpen(true);
  };

  const closeImgModal = () => {
    setIsImgModalOpen(false);
    setCurrentImage(null);
  };

  return (
    <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black/50">
      <div className="relative z-10 w-full p-4 mx-10 overflow-scroll bg-base-100 border-black rounded-t-lg shadow-lg md:mx-0 md:w-1/2 space-y-auto h-3/4">
        <div className="sticky flex justify-end cursor-pointer top-2">
          <XMarkIcon
            className="w-8 h-8 p-1   bg-base-100 rounded-full "
            onClick={closeModal}
          />
        </div>
        <div className="flex flex-col items-start justify-start w-full space-y-4">
          {!fetchingApprovers && !isFetchingApprovers && (
            <>
              <button
                type="button"
                className="p-1 px-2 text-white bg-blue-600 rounded-md cursor-pointer"
                onClick={handlePrint}
              >
                Print
              </button>
              {printWindow && (
                <PrintCashDisbursement
                  data={{
                    id: record,
                    approvedBy: approvedBy,
                    notedBy: notedBy,
                    user: user,
                  }}
                />
              )}
            </>
          )}
          <div className="flex items-center justify-between w-full">
            <div>
              <h1 className="font-semibold text-[18px]">
                Cash Disbursement Requisition Slip
              </h1>
            </div>
            <div className="flex w-auto ">
              <p>Date: </p>
              <p className="pl-1 font-bold">
                {formatDate(editableRecord.created_at)}
              </p>
            </div>
          </div>
          <p className="font-medium text-[14px]">
            Request ID: {record.request_code}
          </p>
          <div className="flex items-center w-full md:w-1/2">
            <p>Status:</p>
            <p
              className={`${
                record.status.trim() === "Pending"
                  ? "bg-yellow-400"
                  : record.status.trim() === "Approved"
                    ? "bg-green-400"
                    : record.status.trim() === "Disapproved"
                      ? "bg-pink-400"
                      : record.status.trim() === "Ongoing"
                        ? "bg-primary"
                        : "bg-blue-700"
              } rounded-lg  py-1 w-1/3
             font-medium text-[14px] text-center ml-2 text-white`}
            >
              {" "}
              {record.status}
            </p>
          </div>
          <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-2">
            <div className="flex w-full">
              <h1 className="flex items-center">Branch: </h1>
              <p className="inline-block w-full pl-1 font-bold align-middle bg-base-100 rounded-md">
                {branchName}
              </p>
            </div>
            {isEditing && (
              <div className="right-0 flex w-full">
                <h1 className="">Change Currency: </h1>
                <select
                  value={editableRecord.currency}
                  onChange={handleCurrencyChange} // No need to extract e.target.value here
                  className="pl-1 font-bold bg-base-100 rounded-md"
                >
                  <option value="PHP">₱ - Peso</option>
                  <option value="EUR">€ - Euro</option>
                  <option value="USD">$ - USD</option>
                </select>
              </div>
            )}
          </div>

          {isEditing ? (
            <>
              <SelectKindOfRequest
                onChange={(e) => setKindOfRequest(e.target.value)}
                value={kindOfRequest}
                width={"w-full"}
              />
              {!kindOfRequest && formSubmitted && (
                <p className="text-red-500">Kind of request is required</p>
              )}
            </>
          ) : (
            <div className="flex">
              <div>
                <h1 className="flex items-center w-full">Kind of Request: </h1>
              </div>
              <p className="w-full pl-1 font-bold bg-base-100 rounded-md">
                {record?.kind_of_request}
              </p>
            </div>
          )}
          <div className="w-full mt-4 overflow-x-auto">
            <div className="w-full border-collapse">
              <div className="table-container">
                <table className="w-full border table-auto lg:table-fixed">
                  <thead className="border border-black h-14 bg-[#8EC7F7]">
                    <tr className="border text-[10px]">
                      <th className={`${inputStyle} w-1/12`}>QTY</th>
                      <th
                        className={`${inputStyle} w-1/3 break-words whitespace-normal`}
                      >
                        DESCRIPTION
                      </th>
                      <th className={`${inputStyle} w-1/12`}>UNIT COST</th>
                      <th className={`${inputStyle} w-1/12`}>TOTAL AMOUNT</th>
                      <th
                        className={`${inputStyle} w-1/4 break-words whitespace-normal`}
                      >
                        USAGE/REMARKS
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${tableCellStyle}`}>
                    {isEditing
                      ? newData.map((item, index) => (
                          <tr key={index}>
                            <td className={tableCellStyle}>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "quantity",
                                    e.target.value,
                                  )
                                }
                                className={`${tableStyle2} w-full`}
                              />
                            </td>
                            <td className={tableCellStyle}>
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "description",
                                    e.target.value,
                                  )
                                }
                                className={`${tableStyle2} w-full break-words whitespace-normal`}
                              />
                            </td>
                            <td className={tableCellStyle}>
                              <input
                                type="number"
                                value={item.unitCost}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "unitCost",
                                    e.target.value,
                                  )
                                }
                                className={`${tableStyle2} w-full`}
                              />
                            </td>
                            <td className={tableCellStyle}>
                              <input
                                type="text"
                                value={item.totalAmount}
                                readOnly
                                className={`${tableStyle2} w-full`}
                              />
                            </td>
                            <td className={tableCellStyle}>
                              <input
                                type="text"
                                value={item.remarks}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "remarks",
                                    e.target.value,
                                  )
                                }
                                className={`${tableStyle2} w-full break-words whitespace-normal`}
                              />
                            </td>
                          </tr>
                        ))
                      : editableRecord.form_data[0].items.map((item, index) => (
                          <tr key={index}>
                            <td className={tableCellStyle}>{item.quantity}</td>
                            <td
                              className={`${tableCellStyle} break-words whitespace-normal`}
                            >
                              {item.description}
                            </td>
                            <td className={tableCellStyle}>
                              {formattedAmount(item.unitCost)}
                            </td>
                            <td className={tableCellStyle}>
                              {formattedAmount(item.totalAmount)}
                            </td>
                            <td
                              className={`${tableCellStyle} break-words whitespace-normal`}
                            >
                              {item.remarks}
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          </div>
          <div className="w-full">
            <h1>Grand Total</h1>
            <input
              type="text"
              className="w-full p-1 mt-2 font-bold bg-base-100 border border-black rounded-md "
              value={`${getCurrencySymbol(editableRecord.currency)} ${
                editableRecord.form_data[0].grand_total
              }`}
              readOnly
            />
          </div>
          {isEditing && (
            <div className="my-2">
              <button
                type="button"
                onClick={openAddCustomModal}
                className="p-2 text-white rounded bg-primary cursor-pointer hover:bg-blue-600"
              >
                Edit Approver
              </button>
            </div>
          )}
          <div className="flex-col items-center justify-center w-full">
            {isFetchingApprovers ? (
              <div className="flex items-center justify-center w-full h-40">
                <h1>Fetching..</h1>
              </div>
            ) : (
              <div className="flex flex-wrap">
                <div className="mb-4 ml-5">
                  <h3 className="mb-3 font-bold">Requested By:</h3>
                  <ul className="flex flex-wrap gap-6">
                    <li className="relative flex flex-col items-center justify-center w-auto text-center">
                      <div className="relative flex flex-col items-center justify-center">
                        {/* Signature */}
                        {user.signature && (
                          <div className="absolute -top-15">
                            <Image
                              src={Storage(user.signature || "")}
                              alt="avatar"
                              width={120}
                              height={120}
                              className="relative z-20 pointer-events-none"
                              draggable="false"
                              onContextMenu={(e) => e.preventDefault()}
                              style={{ filter: "blur(1px)" }} // Optional: Apply a blur
                            />
                          </div>
                        )}
                        {/* Name */}
                        <p className="relative z-10 inline-block mt-4 font-medium text-center uppercase">
                          <span className="relative z-10">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-black"></span>
                        </p>
                        {/* Position */}
                        <p className="font-bold text-[12px] text-center mt-1">
                          {user.position}
                        </p>
                        {/* Status, if needed */}
                        {user.status && (
                          <p
                            className={`font-bold text-[12px] text-center mt-1 ${
                              user.status === "Approved"
                                ? "text-green-400"
                                : user.status === "Pending"
                                  ? "text-yellow-400"
                                  : user.status === "Rejected"
                                    ? "text-red"
                                    : ""
                            }`}
                          >
                            {user.status}
                          </p>
                        )}
                      </div>
                    </li>
                  </ul>
                </div>

                {notedBy.length > 0 && (
                  <div className="mb-4 ml-5">
                    <h3 className="mb-3 font-bold">Noted By:</h3>
                    <ul className="flex flex-wrap gap-6">
                      {notedBy.map((user, index) => (
                        <li
                          className="relative flex flex-col items-center justify-center text-center"
                          key={index}
                        >
                          <div className="relative flex flex-col items-center justify-center text-center">
                            {/* Signature */}
                            {(user.status === "Approved" ||
                              (typeof user.status === "string" &&
                                user.status.split(" ")[0] === "Rejected")) && (
                              <div className="absolute -top-15">
                                <Image
                                  src={Storage(user.signature || "")}
                                  alt="avatar"
                                  width={120}
                                  height={120}
                                  className="relative z-20 pointer-events-none"
                                  draggable="false"
                                  onContextMenu={(e) => e.preventDefault()}
                                  style={{ filter: "blur(1px)" }} // Optional: Apply a blur
                                />
                              </div>
                            )}
                            {/* Name */}
                            <p className="relative z-10 inline-block mt-4 font-medium text-center uppercase">
                              <span className="relative z-10">
                                {user.firstName} {user.lastName}
                              </span>
                              <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-black"></span>
                            </p>
                            {/* Position */}
                            <p className="font-bold text-[12px] text-center mt-1">
                              {user.position}
                            </p>
                            {/* Status */}
                            {hasDisapprovedInApprovedBy ||
                            hasDisapprovedInNotedBy ? (
                              user.status === "Disapproved" ? (
                                <p className="font-bold text-[12px] text-center text-red-500 mt-1">
                                  {user.status}
                                </p>
                              ) : null
                            ) : (
                              <p
                                className={`font-bold text-[12px] text-center mt-1 ${
                                  user.status === "Approved"
                                    ? "text-green-400"
                                    : user.status === "Pending" || !user.status
                                      ? "text-yellow-400"
                                      : ""
                                }`}
                              >
                                {user.status ? user.status : "Pending"}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mb-4 ml-5">
                  <h3 className="mb-3 font-bold">Approved By:</h3>
                  <ul className="flex flex-wrap gap-6">
                    {approvedBy.map((user, index) => (
                      <li
                        className="relative flex flex-col items-center justify-center text-center"
                        key={index}
                      >
                        <div className="relative flex flex-col items-center justify-center text-center">
                          {/* Signature */}
                          {(user.status === "Approved" ||
                            (typeof user.status === "string" &&
                              user.status.split(" ")[0] === "Rejected")) && (
                            <div className="absolute -top-15">
                              <Image
                                src={Storage(user.signature || "")}
                                alt="avatar"
                                width={120}
                                height={120}
                                className="relative z-20 pointer-events-none"
                                draggable="false"
                                onContextMenu={(e) => e.preventDefault()}
                                style={{ filter: "blur(1px)" }} // Optional: Apply a blur
                              />
                            </div>
                          )}
                          {/* Name */}
                          <p className="relative z-10 inline-block mt-4 font-medium text-center uppercase">
                            <span className="relative z-10">
                              {user.firstName} {user.lastName}
                            </span>
                            <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-black"></span>
                          </p>
                          {/* Position */}
                          <p className="font-bold text-[12px] text-center mt-1">
                            {user.position}
                          </p>
                          {/* Status */}
                          {hasDisapprovedInApprovedBy ||
                          hasDisapprovedInNotedBy ? (
                            user.status === "Disapproved" ? (
                              <p className="font-bold text-[12px] text-center text-red-500 mt-1">
                                {user.status}
                              </p>
                            ) : null
                          ) : (
                            <p
                              className={`font-bold text-[12px] text-center mt-1 ${
                                user.status === "Approved"
                                  ? "text-green-400"
                                  : user.status === "Pending" || !user.status
                                    ? "text-yellow-400"
                                    : ""
                              }`}
                            >
                              {user.status ? user.status : "Pending"}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          <div className="w-full">
            {isEditing && (
              <div className="w-full max-w-md p-4">
                <p className="mb-3 font-semibold">Upload attachment:</p>
                <div
                  className={`relative w-full p-6 text-center border-2 border-gray-300 border-dashed rounded-lg cursor-pointer 
                    ${isHovering ? "bg-base-200" : "hover:bg-base-300"}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => document.getElementById("files")?.click()}
                >
                  <input
                    type="file"
                    id="files"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <p className="text-gray-500">
                    Drag and drop your images here <br /> or <br />
                    <span className="text-blue-500">click to upload</span>
                  </p>
                </div>
              </div>
            )}
            {newAttachments.length > 0 && (
              <div className="mt-4">
                <p className="mb-3 font-semibold">Attachments:</p>
                <button
                  type="button"
                  onClick={() => setNewAttachments([])}
                  className="px-3 py-1 text-xs text-white bg-red-700 rounded-lg hover:bg-red-500 cursor-pointer"
                >
                  Remove All
                </button>
              </div>
            )}
            <div className="max-w-[500px] overflow-x-auto pb-3">
              <div className="flex gap-1">
                {attachmentUrl.map((fileItem, index) => (
                  <Attachment
                    key={index}
                    fileItem={fileItem}
                    isEditing={isEditing}
                    handleViewImage={handleViewImage}
                    handleRemoveAttachment={handleRemoveAttachment}
                  />
                ))}
                {newAttachments.map((fileItem) => (
                  <div
                    key={fileItem.name}
                    className="relative w-24 p-2 bg-base-100 rounded-lg shadow-md"
                  >
                    <div className="relative">
                      {fileItem.type.startsWith("image/") ? (
                        // Display image preview if file is an image
                        <Image
                          width={100}
                          height={100}
                          src={URL.createObjectURL(fileItem)}
                          alt={fileItem.name}
                          className="object-cover w-full h-20 rounded-md"
                        />
                      ) : (
                        // Display document icon if file is not an image
                        <div className="flex items-center justify-center w-full h-20 bg-gray-100 rounded-md">
                          <Image
                            width={100}
                            height={100}
                            src="https://cdn-icons-png.flaticon.com/512/3396/3396255.png"
                            alt=""
                          />
                        </div>
                      )}

                      {/* Display File Name and Size */}
                      <div className="mt-2">
                        <p key={fileItem.name} className="text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(fileItem.name)}
                            className="px-3 py-1 text-xs text-white bg-red-500 rounded-lg cursor-pointer"
                          >
                            Remove
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {isImgModalOpen && (
                <ZoomableImage
                  closeImgModal={closeImgModal}
                  currentImage={currentImage}
                />
              )}
            </div>
            {/* <div>
              {attachmentUrl
                .filter((_, index) => !removedAttachments.includes(index))
                .map((url, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500"
                    >
                      {url.split("/").pop()}
                    </a>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        className="text-red-500"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}

              {attachmentUrl.filter(
                (_, index) => !removedAttachments.includes(index)
              ).length === 0 && (
                <p className="text-gray-500">No attachments available.</p>
              )}
            </div> */}
          </div>

          <div className="w-full">
            <h2 className="mb-2 text-lg font-bold">Comments</h2>

            {/* Check if there are no comments in both notedBy and approvedBy */}
            {notedBy.filter((user) => user.comment).length === 0 &&
            approvedBy.filter((user) => user.comment).length === 0 ? (
              <p className="text-gray-500">No comments yet.</p>
            ) : (
              <>
                {/* Render Noted By comments */}
                <ul className="flex flex-col w-full mb-4 space-y-4">
                  {notedBy
                    .filter((user) => user.comment)
                    .map((user, index) => (
                      <div className="flex" key={index}>
                        <div>
                          <Image
                            alt="avatar"
                            className="hidden cursor-pointer sm:block"
                            src={Avatar}
                            height={35}
                            width={45}
                            draggable="false"
                            onContextMenu={(e) => e.preventDefault()}
                            style={{ filter: "blur(1px)" }} // Optional: Apply a blur
                          />
                        </div>
                        <div className="flex flex-row w-full">
                          <li className="flex flex-col justify-between pl-2">
                            <h3 className="text-lg font-bold">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p>{user.comment}</p>
                          </li>
                        </div>
                      </div>
                    ))}
                </ul>

                {/* Render Approved By comments */}
                <ul className="flex flex-col w-full mb-4 space-y-4">
                  {approvedBy
                    .filter((user) => user.comment)
                    .map((user, index) => (
                      <div className="flex" key={index}>
                        <div>
                          <Image
                            alt="avatar"
                            className="hidden cursor-pointer sm:block"
                            src={Avatar}
                            height={35}
                            width={45}
                            draggable="false"
                            onContextMenu={(e) => e.preventDefault()}
                            style={{ filter: "blur(1px)" }} // Optional: Apply a blur
                          />
                        </div>
                        <div className="flex flex-row w-full">
                          <li className="flex flex-col justify-between pl-2">
                            <h3 className="text-lg font-bold">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p>{user.comment}</p>
                          </li>
                        </div>
                      </div>
                    ))}
                </ul>
              </>
            )}
          </div>

          <ApprovedAttachments
            record={record}
            handleViewImage={handleViewImage}
          />

          <div className="flex items-center md:absolute right-20 top-2">
            {isEditing ? (
              <div>
                <button
                  type="button"
                  className="items-center h-10 p-2 text-white bg-primary rounded-xl cursor-pointer hover:bg-blue-600"
                  onClick={handleSaveChanges}
                >
                  {loading ? (
                    <BeatLoader color="white" size={10} />
                  ) : (
                    "Save Changes"
                  )}
                </button>
                <button
                  type="button"
                  className="p-2 ml-2 text-white bg-red-600 rounded-xl cursor-pointer"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            ) : (
              !fetchingApprovers &&
              !isFetchingApprovers &&
              (editableRecord.status === "Pending" ||
                editableRecord.status === "Disapproved") && (
                <button
                  type="button"
                  className="flex p-2 ml-2 text-white bg-blue-500 rounded-xl cursor-pointer"
                  onClick={handleEdit}
                >
                  <PencilIcon className="w-6 h-6 mr-2" />
                  Edit
                </button>
              )
            )}
          </div>
        </div>
      </div>
      {savedSuccessfully && (
        <EditStockModalSuccess
          closeSuccessModal={closeModal}
          refreshData={refreshData}
        />
      )}
      <AddCustomModal
        modalIsOpen={isModalOpen}
        closeModal={closeModals}
        openCompleteModal={() => {}}
        entityType="Approver"
        initialNotedBy={notedBy}
        initialApprovedBy={approvedBy}
        refreshData={() => {}}
        handleAddCustomData={handleAddCustomData}
      />
    </div>
  );
};

export default ViewCashDisbursementModal;
