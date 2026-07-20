import { api } from "@/lib/api";
import { ArrowUturnLeftIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useEffect, useMemo, useState } from "react";
import ShareUserLists, { ShareUserProp } from "./share-user-lists";
import ShareUserLoader from "./share-user-loader";
import { BiLoader } from "react-icons/bi";
import Swal from "sweetalert2";
import { FaUserSlash } from "react-icons/fa";

export default function Share({
  requestId,
  closeModal,
}: {
  requestId: number | null;
  closeModal: () => void;
}) {
  const [users, setUsers] = useState<ShareUserProp[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [error, setError] = useState<{
    errors: string[];
    errorMessage: string;
  }>({
    errors: [],
    errorMessage: "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!requestId) return;
    fetchUsers();
  }, [requestId]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/lists-of-users-to-share-request", {
        params: {
          request_id: requestId,
        },
      });
      if (response.status === 200) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareRequest = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.post("/shared-requests", {
        request_id: requestId,
        user_ids: selectedUsers,
      });

      if (response.status === 201) {
        setError({
          errors: [],
          errorMessage: "",
        });
        closeModal();
        Swal.fire({
          icon: "success",
          title: "Success",
          text: response.data.message,
          confirmButtonText: "Close",
        });
      }
    } catch (error: any) {
      console.error(error);
      let errors = {
        errors: [],
        errorMessage: "",
      };

      if (error.response.status === 422) {
        errors.errors = Object.values(error.response.data.errors);
      } else {
        errors.errorMessage = error.response.data.message;
      }

      setError(errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUser = useMemo(() => {
    return users?.filter(
      (item) =>
        `${item?.lastName} ${item?.firstName}`
          ?.toLowerCase()
          ?.includes(searchTerm?.toLowerCase()) ||
        `${item?.firstName} ${item?.lastName}`
          ?.toLowerCase()
          ?.includes(searchTerm?.toLowerCase()) ||
        item?.lastName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        item?.branch_code?.branch_name
          ?.toLowerCase()
          ?.includes(searchTerm?.toLowerCase()) ||
        item?.branch_code?.branch_code
          ?.toLowerCase()
          ?.includes(searchTerm?.toLowerCase()) ||
        item?.firstName?.toLowerCase()?.includes(searchTerm?.toLowerCase()),
    );
  }, [users, searchTerm]);

  if (!requestId) return null;

  return (
    <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black/50">
      <div className="relative z-10 w-full p-4 mx-10 overflow-auto bg-base-100 border-black rounded-t-lg shadow-lg md:mx-0 md:w-1/4 space-y-auto h-fit">
        <div className="sticky flex justify-between top-2 p-5">
          <p className="font-bold">Select users you want to share with</p>
          <button onClick={closeModal} className="cursor-pointer ">
            <XMarkIcon className="w-8 h-8 p-1 bg-base-100 rounded-full" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-hidden">
          {isLoading ? (
            <ShareUserLoader />
          ) : users?.length > 0 ? (
            <>
              <label className="input w-full h-17">
                <svg
                  className="h-[1em] opacity-50"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <g
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                    fill="none"
                    stroke="currentColor"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </g>
                </svg>
                <input
                  type="search"
                  required
                  placeholder={`Search on ${filteredUser.length} users...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </label>
              <ul className="list bg-base-100 rounded-box shadow-md max-h-[calc(100vh-400px)] overflow-y-auto space-y-1">
                {filteredUser.map((user: ShareUserProp, index) => (
                  <ShareUserLists
                    user={user}
                    setSelectedUsers={setSelectedUsers}
                    selectedUsers={selectedUsers}
                    key={index}
                  />
                ))}
              </ul>
            </>
          ) : (
            <div className="flex items-center flex-col justify-center h-full py-3 space-y-2">
              <FaUserSlash className="w-12 h-12" />
              <p className="text-center">No users found</p>
            </div>
          )}
        </div>
        {(error?.errorMessage || error?.errors?.length > 0) && (
          <div role="alert" className="alert alert-error text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error?.errorMessage || error.errors.flat().join(", ")}</span>
          </div>
        )}
        <div className="flex justify-end w-full h-full gap-4 p-4">
          {selectedUsers?.length > 0 && (
            <button
              className="btn btn-error text-white"
              type="button"
              onClick={() => setSelectedUsers([])}
            >
              Reset
            </button>
          )}
          <button className="btn" type="button" onClick={closeModal}>
            Close
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={handleShareRequest}
            disabled={isSubmitting || filteredUser?.length === 0}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-md"></span>{" "}
                Sharing...
              </>
            ) : (
              <>
                <ArrowUturnLeftIcon /> Share{" "}
                {selectedUsers?.length > 0 && (
                  <div className="badge badge-sm badge-success">
                    {selectedUsers?.length}
                  </div>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
