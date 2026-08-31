import Storage from "@/utils/storage";
import Image from "next/image";
import { formatDate } from "@/components/formatDate";

type Props = {
  isFetchingApprovers: boolean;
  record: Record<string, any>;
  user: Record<string, any>;
  notedBy: Record<string, any>;
  approvedBy: Record<string, any>;
  hasDisapprovedInApprovedBy: boolean;
  hasDisapprovedInNotedBy: boolean;
};

export default function ApproverLists({
  isFetchingApprovers,
  record,
  user,
  notedBy,
  approvedBy,
  hasDisapprovedInApprovedBy,
  hasDisapprovedInNotedBy,
}: Props) {
  return (
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
                  {record?.requested_signature ? (
                    <div className="-mb-10 h-17">
                      <Image
                        src={Storage(record?.requested_signature)}
                        width={120}
                        height={120}
                        className="relative z-20 pointer-events-none"
                        alt="signature"
                        draggable="false"
                        onContextMenu={(e) => e.preventDefault()}
                        style={{ filter: "blur(1px)" }}
                      />
                    </div>
                  ) : (
                    <div className="-mb-10 z-20 w-17 h-17"></div>
                  )}
                  {/* Name and Position */}
                  <div className="relative flex flex-col items-center justify-center mt-4 text-center">
                    {/* Name */}
                    <p className="relative z-10 inline-block font-medium text-center uppercase">
                      <span className="relative z-10">
                        {record?.requested_by}
                      </span>
                      <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-black"></span>
                    </p>
                    {/* Position */}
                    <p className="font-bold text-[12px] text-center mt-1">
                      {record?.requested_position}
                    </p>
                    {/* Status */}
                    <div className="mt-1 min-h-[1.5rem] flex items-center justify-center">
                      {user.status && (
                        <p
                          className={`font-bold text-[12px] text-center ${
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
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {notedBy.length > 0 && (
            <div className="mb-4 ml-5">
              <h3 className="mb-3 font-bold">Noted By:</h3>
              <ul className="flex flex-wrap gap-6">
                {notedBy.map((user: any, index: number) => (
                  <li
                    className="relative flex flex-col items-center justify-center text-center"
                    key={index}
                  >
                    <div className="relative flex flex-col items-center justify-center text-center">
                      {/* Signature */}
                      {user.status === "Approved" ||
                      (typeof user.status === "string" &&
                        user.status.split(" ")[0] === "Rejected") ? (
                        <div className="-mb-10 h-17">
                          <Image
                            src={Storage(user.signature || "")}
                            alt="avatar"
                            width={120}
                            height={120}
                            className="relative z-20 pointer-events-none"
                            draggable="false"
                            onContextMenu={(e) => e.preventDefault()}
                            style={{ filter: "blur(1px)" }}
                          />
                        </div>
                      ) : (
                        <div className="-mb-10 z-20 w-17 h-17"></div>
                      )}
                      {/* Name and Position */}
                      <div className="relative flex flex-col items-center justify-center mt-4 text-center">
                        {/* Name */}
                        <p className="relative z-10 inline-block font-medium text-center uppercase">
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
                        <div className="mt-1 min-h-[1.5rem] flex items-center justify-center">
                          {hasDisapprovedInApprovedBy ||
                          hasDisapprovedInNotedBy ? (
                            user.status === "Disapproved" ? (
                              <p className="font-bold text-[12px] text-center text-red-500">
                                {user.status}
                              </p>
                            ) : null
                          ) : (
                            <p
                              className={`font-bold text-[12px] text-center ${
                                user.status === "Approved"
                                  ? "text-green-400"
                                  : user.status === "Pending"
                                    ? "text-yellow-400"
                                    : ""
                              }`}
                            >
                              {user.status}
                            </p>
                          )}
                          {user.status !== "Pending" && (
                            <p> = {formatDate(user.updated_at)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-4 ml-5">
            <h3 className="mb-3 font-bold">Approved By:</h3>
            <ul className="flex flex-wrap gap-6">
              {approvedBy.map((user: any, index: number) => (
                <li
                  className="relative flex flex-col items-center justify-center text-center"
                  key={index}
                >
                  <div className="relative flex flex-col items-center justify-center text-center">
                    {/* Signature */}
                    {user.status === "Approved" ||
                    (typeof user.status === "string" &&
                      user.status.split(" ")[0] === "Rejected") ? (
                      <div className="-mb-10 h-17">
                        <Image
                          src={Storage(user.signature || "")}
                          alt="avatar"
                          width={120}
                          height={120}
                          className="relative z-20 pointer-events-none"
                          draggable="false"
                          onContextMenu={(e) => e.preventDefault()}
                          style={{ filter: "blur(1px)" }}
                        />
                      </div>
                    ) : (
                      <div className="-mb-10 z-20 w-17 h-17"></div>
                    )}
                    {/* Name and Position */}
                    <div className="relative flex flex-col items-center justify-center mt-4 text-center">
                      {/* Name */}
                      <p className="relative z-10 inline-block font-medium text-center uppercase">
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
                      <div className="mt-1 min-h-[1.5rem] flex items-center justify-center">
                        {hasDisapprovedInApprovedBy ||
                        hasDisapprovedInNotedBy ? (
                          user.status === "Disapproved" ? (
                            <p className="font-bold text-[12px] text-center text-red-500">
                              {user.status}
                            </p>
                          ) : null
                        ) : (
                          <p
                            className={`font-bold text-[12px] text-center ${
                              user.status === "Approved"
                                ? "text-green-400"
                                : user.status === "Pending"
                                  ? "text-yellow-400"
                                  : ""
                            }`}
                          >
                            {user.status}
                          </p>
                        )}
                        {user.status !== "Pending" && (
                            <p> = {formatDate(user.updated_at)}</p>
                          )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
