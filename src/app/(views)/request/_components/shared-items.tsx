import { api } from "@/lib/api";
import { TrashIcon } from "@heroicons/react/24/solid";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Swal from "sweetalert2";
import ShareUserLoader from "./share-user-loader";

export default function SharedItemModal({
  open,
  requestId,
  setIsSharedItemModalOpen,
}: {
  open: boolean;
  requestId: string;
  setIsSharedItemModalOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [data, setData] = useState<{
    title: string;
    data: {
      id: string;
      fullName: string;
      branch_code: {
        branch_code: string;
        branch_name: string;
      };
      branch: string;
      position: string;
    }[];
  }>({
    title: "",
    data: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteLoading, setDeleteLoading] = useState<{
    [key: string]: boolean;
  }>({
    key: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get(`/shared-requests/${requestId}`);
      if (response.status === 200) {
        setData(response.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (userId: string) => {
    Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setDeleteLoading({ [userId]: true });
        try {
          const response = await api.delete(
            `/shared-requests/${requestId}/${userId}/delete`,
          );

          if (response.status === 200) {
            Swal.fire({
              toast: true,
              position: "top-end",
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              icon: "success",
              title: response.data.message,
            });
            fetchData();
          }
        } catch (error) {
          console.error(error);
        } finally {
          setDeleteLoading({ [userId]: false });
        }
      }
    });
  };

  return (
    <dialog id="my_modal_1" className="modal" open={open}>
      <div className="modal-box overflow-hidden">
        <h3 className="font-bold text-lg">
          {loading ? <div className="skeleton h-6 w-62"></div> : data.title}
        </h3>
        <div>
          <ul className="list max-h-[calc(100vh-250px)] overflow-y-auto">
            {loading ? (
              <ShareUserLoader total={5} />
            ) : data?.data?.length > 0 ? (
              data.data?.map((item) => (
                <li
                  className="list-row justify-between flex gap-1"
                  key={item.id}
                >
                  <div>
                    <div className="font-bold">{item.fullName}</div>
                    <div className="text-xs uppercase font-semibold opacity-60">
                      {item.position}
                    </div>
                    <div>{item.branch}</div>
                    <div>{`${item.branch_code.branch_code} - ${item.branch_code.branch_name}`}</div>
                  </div>
                  <button
                    className="btn btn-square btn-ghost"
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={deleteLoading[item.id]}
                  >
                    {deleteLoading[item.id] ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      <TrashIcon className="w-7 h-7 text-error" />
                    )}
                  </button>
                </li>
              ))
            ) : (
              "No data found"
            )}
          </ul>
        </div>
        <div className="modal-action">
          <button
            className="btn"
            type="button"
            onClick={() => setIsSharedItemModalOpen(false)}
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}
