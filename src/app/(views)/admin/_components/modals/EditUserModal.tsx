import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { api } from "@/lib/api";
import ClipLoader from "react-spinners/ClipLoader";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";

type EntityType = "User" | "Branch" | "Custom" | "Approver";
const EditUserModal = ({
  editModal,
  editModalClose,
  openSuccessModal,
  entityType,
  selectedUser,
  refreshData,
}: {
  editModal: boolean;
  editModalClose: any;
  openSuccessModal: any;
  entityType: EntityType;
  selectedUser: any;
  refreshData: any;
}) => {
  const [editedBranch, setEditedBranch] = useState<string>("");
  const [editedBranchCode, setEditedBranchCode] = useState<string>("");
  const [editedBranchName, setEditedBranchName] = useState<string>("");
  const [firstname, setFirstName] = useState<string>("");
  const [lastname, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [contact, setContact] = useState<string>("");
  const [editedRole, setEditedRole] = useState<string>("");
  const [editedPosition, setEditedPosition] = useState<string>("");
  const [editedEmployeeId, setEditedEmployeeId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [errorBag, setErrorBag] = useState<any>(null);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [notedBy, setNotedBy] = useState<number[]>([]);
  const [approvedBy, setApprovedBy] = useState<number[]>([]);
  const [approvers, setApprovers] = useState<any[]>([]);
  const [name, setName] = useState<string>("");
  const [branchList, setBranchList] = useState<
    { id: number; branch_code: string; branch: string }[]
  >([]);
  const [roleOptions, setRoleOptions] = useState<any[]>([]);
  const [isResettingSignature, setIsResettingSignature] =
    useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        const response = await api.get(`/view-branch`);
        const branches = response.data.data;
        const branchOptions = branches.map(
          (branch: { id: number; branch_code: string; branch: string }) => ({
            id: branch.id,
            branch_code: branch.branch_code,
            branch: branch.branch,
          }),
        );
        setBranchList(branchOptions);
      } catch (error) {
        console.error("Error fetching branch data:", error);
      }
    };

    fetchBranchData();
  }, []);

  useEffect(() => {
    const fetchPosition = async () => {
      try {
        const response = await api.get(`/positions`);

        setRoleOptions(response.data.position);
      } catch (error) {
        console.error("Error fetching branch data:", error);
      }
    };

    fetchPosition();
  }, []);

  useEffect(() => {
    if (entityType === "Custom") {
      const fetchApprovers = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/view-approvers/${user.id}`);
          const allApprovers = [
            ...(response.data.HOApprovers || []),
            ...(response.data.areaManagerApprover || []),
            ...(response.data.sameBranchApprovers || []),
          ];

          setApprovers(allApprovers);

          setLoading(false);
        } catch (error) {
          console.error("Error fetching approvers:", error);
          setLoading(false);
        }
      };

      fetchApprovers();
    }
  }, [user.id]);
  useEffect(() => {
    if (editModal && selectedUser) {
      setName(selectedUser.name || "");
      setApprovedBy(selectedUser.approved_by || []);
      setNotedBy(selectedUser.noted_by || []);
    }
  }, [editModal, selectedUser]);
  const toggleNotedBy = (userId: number) => {
    setNotedBy((prevNotedBy) =>
      prevNotedBy.includes(userId)
        ? prevNotedBy.filter((id) => id !== userId)
        : [...prevNotedBy, userId],
    );
  };

  const toggleApprovedBy = (userId: number) => {
    setApprovedBy((prevApprovedBy) =>
      prevApprovedBy.includes(userId)
        ? prevApprovedBy.filter((id) => id !== userId)
        : [...prevApprovedBy, userId],
    );
  };

  useEffect(() => {
    if (selectedUser) {
      setFirstName(selectedUser.firstname || "");
      setLastName(selectedUser.lastname || "");
      setEmail(selectedUser.email || "");
      setUsername(selectedUser.username || "");
      setContact(selectedUser.contact || "");
      setEditedBranch(selectedUser.branch.branch || "");
      setEditedBranchCode(selectedUser.branch_code);
      setEditedBranchName(selectedUser.branch_name || "");
      setEditedRole(selectedUser.role || "");
      setEditedPosition(selectedUser.position || "");
      setEditedEmployeeId(selectedUser.employee_id || "");
    }
  }, [selectedUser]);

  const handleCancel = () => {
    if (selectedUser) {
      setFirstName(selectedUser.firstname);
      setLastName(selectedUser.lastname);
      setEmail(selectedUser.email);
      setUsername(selectedUser.username);
      setContact(selectedUser.contact);
      setEditedBranch(selectedUser.branch);
      setEditedBranchCode(selectedUser.branch_code);
      setEditedBranchName(selectedUser.branch_name);
      setEditedRole(selectedUser.role);
      setEditedPosition(selectedUser.position);
      setEditedEmployeeId(selectedUser.employee_id);
      setPassword("");
    }
    editModalClose();
  };

  const handleBranchCodeChange = (selectedBranchId: number) => {
    const selectedBranch = branchList.find(
      (branch) => branch.id === selectedBranchId,
    );
    setEditedBranchCode(selectedBranch?.id.toString() || "");
    if (selectedBranch) {
      setEditedBranch(selectedBranch.branch.toString());
    } else {
      setEditedBranch("Honda Des, Inc.");
    }
  };

  const handleUpdate = async () => {
    // Validation based on entityType
    if (entityType === "User") {
      if (
        firstname.trim() === "" ||
        lastname.trim() === "" ||
        email.trim() === "" ||
        username.trim() === "" ||
        contact.trim() === "" ||
        editedBranch.trim() === "" ||
        editedBranchCode.trim() === "" ||
        editedRole.trim() === "" ||
        editedPosition.trim() === "" ||
        editedEmployeeId.trim() === ""
      ) {
        setErrorMessage("Please fill out all required fields.");
        return;
      }
    } else if (entityType === "Branch") {
      if (
        editedBranch.trim() === "" ||
        editedBranchCode.trim() === "" ||
        editedBranchName.trim() === ""
      ) {
        setErrorMessage("Please fill out all required fields.");
        return;
      }
    } else if (entityType === "Custom") {
      if (notedBy.length === 0 || approvedBy.length === 0) {
        setErrorMessage(
          "You must select at least one noted by and one approved by.",
        );
        return;
      }
    } else {
      setErrorMessage("Invalid entity type.");
      return;
    }

    setLoading(true);
    try {
      // Define type for updatedData
      interface UpdatedData {
        id: any;
        firstName: string;
        lastName: string;
        email: string;
        userName: string;
        contact: string;
        branch?: string; // Optional for Branch entityType
        branch_code?: string; // Optional for Branch entityType
        branch_name?: string; // Optional for Branch entityType
        role?: string; // Optional for User entityType
        position?: string; // Optional for User entityType
        password?: string; // Make password optional
        notedBy?: number[];
        approvedBy?: number[];
        employee_id?: string;
      }

      // Create updatedData object
      const updatedData: UpdatedData = {
        id: selectedUser.id,
        firstName: firstname,
        lastName: lastname,
        email: email,
        userName: username,
        contact: contact,
        branch:
          entityType === "Branch" || entityType === "User"
            ? editedBranch
            : undefined,
        branch_code:
          entityType === "Branch" || entityType === "User"
            ? editedBranchCode
            : undefined,
        branch_name: entityType === "Branch" ? editedBranchName : undefined,

        role: entityType === "User" ? editedRole : undefined,
        position: entityType === "User" ? editedPosition : undefined,
        password: password.trim() !== "" ? password.trim() : undefined,
        employee_id: entityType === "User" ? editedEmployeeId : undefined,
      };

      // Include password field only if a new password is provided
      if (password.trim() !== "") {
        updatedData.password = password.trim();
      }

      // Perform the API request based on entityType
      if (entityType === "Branch") {
        const response = await api.post(
          `/update-branch/${selectedUser.id}`,
          updatedData,
        );
        if (response.status === 200) {
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: response.data.message,
            showConfirmButton: false,
            timer: 6000,
            timerProgressBar: true,
            showCloseButton: true,
          });
        }
      } else if (entityType === "User") {
        const response = await api.post(
          `/update-profile/${selectedUser.id}`,
          updatedData,
        );
      } else if (entityType === "Custom") {
        try {
          const response = await api.post(
            `/update-approvers/${selectedUser.id}`,
            {
              approved_by: approvedBy,
              noted_by: notedBy,
              name: name,
              // Include other fields as necessary
            },
          );
        } catch (error) {
          console.error("Error updating approvers:", error);
        }
      }

      // Handle success
      refreshData();
      openSuccessModal();
      setErrorMessage(""); // Clear error message on success
      setPassword("");
      setErrorBag(null); // Clear error bag on success
    } catch (error: any) {
      if (error.response.status === 400) {
        setErrorMessage(error.response.data.message);
      }
      if (error.response.status === 422) {
        setErrorBag(Object.values(error.response.data.errors).flat());
      } else {
        setErrorMessage("Failed to update. Please try again.");
      }
      console.error("Error updating:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!editModal) {
    return null;
  }

  const fieldsConfig: { [key: string]: string[] } = {
    User: [
      "Firstname",
      "Lastname",
      "Email",
      "Username",
      "Contact",
      "Position",
      "Role",
      "Branch Code",
      "Branch Name",
      "Password",
      "Employee ID",
    ],
    Branch: ["Branch", "BranchCode", "BranchName"],
    Manager: ["Manager Name", "Manager ID", "Branch Code"],
  };

  const fields = fieldsConfig[entityType] || [];
  const pStyle = "font-medium w-full";
  const inputStyle = "input input-bordered bg-base-100 w-full mt-2";

  const branch = [
    "Des Appliance, Inc.",
    "Des Strong Motors, Inc.",
    "Strong Moto Centrum, Inc.",
    "Honda Des, Inc.",
    "Head Office",
  ];

  const positionOptions = [
    { label: "Approver", value: "approver" },
    { label: "User", value: "User" },
    { label: "Admin", value: "Admin" },
  ];

  const resetSignature = async () => {
    setIsResettingSignature(true);
    try {
      const response = await api.patch(
        `/reset-signature/${selectedUser.id}/reset`,
      );
      if (response.status === 200) {
        openSuccessModal();
      }
    } catch (error: any) {
      console.error("Error resetting signature:", error);
    } finally {
      setIsResettingSignature(false);
    }
  };

  const handleResetSignature = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, reset it!",
    }).then((result) => {
      if (result.isConfirmed) {
        resetSignature();
      }
    });
  };

  return (
    <div className="fixed top-0 left-0 flex flex-col items-center justify-center w-full h-full bg-black/50 z-50">
      <div className="p-6 w-10/12 md:w-2/5 bg-primary text-white rounded-t-[12px] shadow-xl relative">
        <h2 className="text-center text-xl md:text-[32px] font-bold">{`Edit ${entityType}`}</h2>
        <XMarkIcon
          className="absolute text-white cursor-pointer size-6 right-3 top-6"
          onClick={handleCancel}
        />
      </div>
      <div className="bg-base-100 w-10/12 md:w-2/5 mx-auto rounded-b-[12px] shadow-lg overflow-y-auto p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Render input fields dynamically */}
          {fields.map((field, index) => (
            <div key={index}>
              <p className={`${pStyle}`}>{field}</p>
              {field === "Role" ? (
                <select
                  className={`select select-bordered w-full bg-base-100 rounded-lg border p-2`}
                  value={editedRole}
                  onChange={(e) => setEditedRole(e.target.value)}
                >
                  <option value="" hidden>
                    Select Role
                  </option>
                  <option value="" disabled>
                    Select Role
                  </option>
                  {positionOptions.map((option, index) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field === "Branch Code" ? (
                <select
                  className={`select select-bordered w-full rounded-lg border bg-base-100 p-2`}
                  value={editedBranchCode}
                  onChange={(e) =>
                    handleBranchCodeChange(Number(e.target.value))
                  }
                >
                  <option value="" hidden>
                    Select Branch Code
                  </option>
                  <option value="" disabled>
                    Select Branch Code
                  </option>
                  {branchList.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branch_code}
                    </option>
                  ))}
                </select>
              ) : field === "Position" ? (
                <select
                  className={`select select-bordered w-full rounded-lg bg-base-100 border p-2`}
                  value={editedPosition}
                  onChange={(e) => setEditedPosition(e.target.value)}
                >
                  <option value="" hidden>
                    Select Position
                  </option>
                  <option value="" disabled>
                    Select Position
                  </option>
                  {roleOptions.map((option, index) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field === "Branch Name" ? (
                <input
                  className={`${inputStyle}`}
                  value={editedBranch}
                  readOnly
                />
              ) : field === "Branch" ? (
                <select
                  className={`select select-bordered w-full rounded-lg bg-base-100 border p-2 mt-2`}
                  value={editedBranch}
                  onChange={(e) => setEditedBranch(e.target.value)}
                >
                  <option value="" hidden>
                    Select Branch
                  </option>
                  <option value="" disabled>
                    Select Branch
                  </option>
                  {branch.length > 0 ? (
                    branch.map((branchItem) => (
                      <option key={branchItem} value={branchItem}>
                        {branchItem}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No branch codes available
                    </option>
                  )}
                </select>
              ) : field === "BranchCode" || field === "BranchName" ? (
                <input
                  className={`${inputStyle}`}
                  value={
                    field === "BranchCode" ? editedBranchCode : editedBranchName
                  }
                  onChange={(e) =>
                    field === "BranchCode"
                      ? setEditedBranchCode(e.target.value)
                      : setEditedBranchName(e.target.value)
                  }
                />
              ) : (
                <>
                  <input
                    type={field === "Password" ? "password" : "text"}
                    className={`${inputStyle}`}
                    value={
                      field === "Firstname"
                        ? firstname
                        : field === "Lastname"
                          ? lastname
                          : field === "Email"
                            ? email
                            : field === "Username"
                              ? username
                              : field === "Contact"
                                ? contact
                                : field === "Password"
                                  ? password
                                  : field === "Employee ID"
                                    ? editedEmployeeId
                                    : ""
                    }
                    onChange={(e) =>
                      field === "Firstname"
                        ? setFirstName(e.target.value)
                        : field === "Lastname"
                          ? setLastName(e.target.value)
                          : field === "Email"
                            ? setEmail(e.target.value)
                            : field === "Username"
                              ? setUsername(e.target.value)
                              : field === "Contact"
                                ? setContact(e.target.value)
                                : field === "Password"
                                  ? setPassword(e.target.value)
                                  : field === "Employee ID"
                                    ? setEditedEmployeeId(e.target.value)
                                    : null
                    }
                  />
                </>
              )}
            </div>
          ))}
        </div>

        {/* Custom fields section */}
        {entityType === "Custom" && (
          <div className="mt-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className={`${pStyle}`}>Name</p>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg input input-bordered"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errorMessage && (
                  <p className="text-sm text-red-500">{errorMessage}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Noted By
                </label>
                {approvers.map((person) => (
                  <div key={person.id} className="flex items-center py-1">
                    <input
                      type="checkbox"
                      id={`noted_by_${person.id}`}
                      checked={notedBy.includes(person.id)}
                      onChange={() => toggleNotedBy(person.id)}
                      className="mr-2 input input-bordered"
                    />
                    <label
                      htmlFor={`noted_by_${person.id}`}
                      className="text-lg"
                    >
                      {person.firstName} {person.lastName}
                    </label>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Approved By
                </label>
                {approvers.map((person) => (
                  <div key={person.id} className="flex items-center py-1">
                    <input
                      type="checkbox"
                      id={`approved_by_${person.id}`}
                      checked={approvedBy.includes(person.id)}
                      onChange={() => toggleApprovedBy(person.id)}
                      className="mr-2 input input-bordered"
                    />
                    <label
                      htmlFor={`approved_by_${person.id}`}
                      className="text-lg"
                    >
                      {person.firstName} {person.lastName}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        <div className="mt-4">
          {errorMessage && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}
          {errorBag &&
            errorBag.map((error: string, index: number) => (
              <p className="text-sm text-red-600" key={index}>
                {error}
              </p>
            ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-6 space-x-4">
          <button
            className="w-24 text-white bg-gray-500 border-gray-500 btn btn-secondary hover:bg-gray-600 hover:border-gray-600"
            onClick={handleCancel}
          >
            Cancel
          </button>
          {entityType === "User" && (
            <button
              className="text-white bg-red-500 border-red-500 btn btn-secondary hover:bg-red-600 hover:border-red-600"
              onClick={handleResetSignature}
              disabled={isResettingSignature}
            >
              {isResettingSignature ? "Resetting..." : "Reset Signature"}
            </button>
          )}
          <button
            className={`btn btn-primary bg-primary border-primary hover:bg-blue-400 hover:border-blue-400 text-white hover:text-white w-1/3`}
            onClick={handleUpdate}
          >
            {loading ? <ClipLoader color="#36d7b7" /> : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
