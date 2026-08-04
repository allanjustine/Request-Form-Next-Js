"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Man from "@/assets/manComputer.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClockRotateLeft,
  faRotate,
  faFileLines,
  faFileCircleXmark,
  faFileCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { format, startOfWeek, endOfMonth } from "date-fns";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import authenticatedPage from "@/lib/authenticatedPage";
import Swal from "sweetalert2";

type Props = {};

const boxWhite =
  "bg-base-100 w-full h-[190px] rounded-[15px] drop-shadow-lg relative";
const boxPink = "w-full h-[150px] rounded-t-[12px] relative";
const outerLogo =
  "lg:w-[120px] lg:h-[125px] !text-[120px] w-[80px] h-[90px] right-0 mr-[56px] lg:mt-[26px] mt-[56px] absolute";
const innerBox =
  "lg:w-[82px] lg:h-[84px] w-[57px] h-[58px] bg-base-100 absolute right-0 mr-[29px] lg:mt-[37px] md:mt-[47px] mt-[47px] rounded-[12px] flex justify-center items-center";
const innerLogo =
  "lg:w-[48px] lg:h-[51px] !text-[40px] w-[40px] h-[45px] flex justify-center items-center";

interface Item {
  quantity: string;
  description: string;
  unitCost: string;
  totalAmount: string;
  remarks: string | null;
}

interface FormData {
  branch: string;
  date: string;
  status: string;
  grand_total: string;
  purpose?: string;
  items: Item[];
  approvers?: string;
  supplier?: string;
  address?: string;
}

interface Request {
  id: number;
  user_id: number;
  form_type: string;
  form_data: FormData[];
  created_at: string;
  updated_at: string;
  approvers_id: number;
  status: string;
}

const ApproverDashboard: React.FC<Props> = ({}) => {
  const [areaChartData, setAreaChartData] = useState<
    {
      name: string;
      Total: number;
      Approved: number;
      Pending: number;
      Disapproved: number;
    }[]
  >([]);

  const [barChartData, setBarChartData] = useState<
    { name: string; Request: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [totalRequestsSent, setTotalRequestsSent] = useState<number | null>(
    null,
  );
  const [totalCompletedRequests, setTotalCompletedRequests] = useState<
    number | null
  >(null);
  const [totalOngoingRequests, setTotalOngoingRequests] = useState<
    number | null
  >(null);
  const [totalPendingRequests, setTotalPendingRequests] = useState<
    number | null
  >(null);
  const [totalDisapprovedRequests, setTotalDisapprovedRequests] = useState<
    number | null
  >(null);
  const [dataLoading, setDataLoading] = useState(true);
  const { user } = useAuth();
  const [approvalRequestCounts, setApprovalRequestCounts] = useState<{
    total: number;
    total_completed: number;
    total_disapproved: number;
    total_ongoing: number;
    total_pending: number;
  }>({
    total: 0,
    total_completed: 0,
    total_disapproved: 0,
    total_ongoing: 0,
    total_pending: 0,
  });

  useEffect(() => {
    Swal.close();
  }, []);

  useEffect(() => {
    if (!user.id) return;

    const fetchData = async () => {
      try {
        const myRequest = api.get(
          `/total-request-sent/${user.id}/my-request-total`,
        );
        const approvalRequest = api.get("/approval-request-counts");

        const [myRequestResponse, approvalRequestResponse] = await Promise.all([
          myRequest,
          approvalRequest,
        ]);

        if (myRequestResponse.status === 200) {
          setTotalRequestsSent(myRequestResponse.data.totalRequestSent);
          setTotalCompletedRequests(
            myRequestResponse.data.totalCompletedRequest,
          );
          setTotalPendingRequests(myRequestResponse.data.totalPendingRequest);
          setTotalOngoingRequests(myRequestResponse.data.totalOngoingRequest);
          setTotalDisapprovedRequests(
            myRequestResponse.data.totalDisapprovedRequest,
          );
        }

        if (approvalRequestResponse.status === 200) {
          const { message, ...rest } = approvalRequestResponse.data;
          setApprovalRequestCounts(rest);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  const fetchData = async () => {
    try {
      const response = await api.get(
        `/request-forms/for-approval/${user.id}/for-approval-requests`,
      );

      const requests: Request[] = response.data.request_forms || []; // Use the defined type

      let approvedCount = 0;
      let pendingCount = 0;
      let unsuccessfulCount = 0;

      requests.forEach((request: Request) => {
        const status = request.status.toLowerCase();
        if (status.includes("approved")) {
          approvedCount++;
        } else if (status.includes("pending")) {
          pendingCount++;
        } else if (
          status.includes("rejected") ||
          status.includes("disapproved")
        ) {
          unsuccessfulCount++;
        }
      });

      processAreaChartData(requests);
      processBarChartData(requests);
    } catch (error) {
      console.error("Error fetching requests data:", error);
    }
  };

  const processAreaChartData = (requests: Request[]) => {
    const today = new Date();
    let startDate: Date;
    let endDate: Date;

    // Set startDate to January 1 of the current year
    startDate = new Date(today.getFullYear(), 0, 1); // January 1 of the current year

    // Set endDate to the last day of the current month
    endDate = endOfMonth(today);

    const aggregatedData: {
      [key: string]: {
        total: number;
        approved: number;
        pending: number;
        disapproved: number;
        rejected: number;
      };
    } = {};

    requests.forEach((record) => {
      const recordDate = new Date(record.created_at);
      if (recordDate >= startDate && recordDate <= endDate) {
        const monthName = format(recordDate, "MMM");
        if (!aggregatedData[monthName]) {
          aggregatedData[monthName] = {
            total: 0,
            approved: 0,
            pending: 0,
            disapproved: 0,
            rejected: 0,
          };
        }
        aggregatedData[monthName].total += 1;
        if (record.status === "Approved") {
          aggregatedData[monthName].approved += 1;
        } else if (record.status === "Pending") {
          aggregatedData[monthName].pending += 1;
        } else if (record.status.includes("Disapproved")) {
          aggregatedData[monthName].disapproved += 1;
        } else if (record.status.includes("Rejected")) {
          aggregatedData[monthName].rejected += 1;
        }
      }
    });

    const allMonths = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const areaChartData = allMonths.map((month) => ({
      name: month,
      Total: Math.floor(aggregatedData[month]?.total || 0),
      Approved: Math.floor(aggregatedData[month]?.approved || 0),
      Pending: Math.floor(aggregatedData[month]?.pending || 0),
      Disapproved: Math.floor(aggregatedData[month]?.disapproved || 0),
      Rejected: Math.floor(aggregatedData[month]?.rejected || 0),
    }));

    setAreaChartData(areaChartData);
  };

  const processBarChartData = (requests: Request[]) => {
    const today = new Date();
    const currentWeekStartDate = startOfWeek(today);

    const aggregatedData: { [key: string]: number } = {};

    requests.forEach((record) => {
      const recordDate = new Date(record.created_at);
      if (recordDate >= currentWeekStartDate) {
        const dayName = format(recordDate, "EEE");
        if (aggregatedData[dayName]) {
          aggregatedData[dayName] += 1;
        } else {
          aggregatedData[dayName] = 1;
        }
      }
    });

    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const barChartData = weekDays.map((day) => ({
      name: day,
      Request: Math.floor(aggregatedData[day] || 0),
    }));

    setBarChartData(barChartData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-graybg dark:bg-blackbg h-full pt-[26px] px-[30px] pb-20">
      <div className="bg-primary w-full sm:w-full h-[210px] rounded-[12px] pl-[30px] flex flex-row justify-between items-center">
        <div>
          <p className="!text-[15px] lg:!text-[20px] font-bold">
            Hi, {user.firstName} 👋
          </p>
          <p className="!text-[15px] lg:!text-[20px] text-white font-semibold">
            Welcome to Request
          </p>
          <p className="text-[15px] hidden sm:block text-white mb-4">
            Request products and services
          </p>
          <div className="flex flex-row gap-2">
            <Link href="/create-request?title=Stock%20Requisition">
              <button className="bg-[#FF947D] hover:bg-[#ff957dd6] text-[15px] w-full lg:h-[57px] h-[40px] rounded-[12px] font-semibold px-3 cursor-pointer">
                Create a Request
              </button>
            </Link>
            <Link href="/approver/request">
              <button className="bg-[#FF947D] hover:bg-[#ff957dd6] text-[15px] w-full lg:h-[57px] h-[40px] rounded-[12px] font-semibold px-3 cursor-pointer">
                Process Request
              </button>
            </Link>
          </div>
        </div>
        <div className="ml-4 mr-[29px]">
          <Image alt="man" src={Man} width={320} height={176} />
        </div>
      </div>
      <div className="p-3 my-3">
        <div className="flex justify-between items-center">
          <p className="text-[25px]! font-bold">Approval Request</p>
          <Link
            href="/approver/request"
            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
          >
            See all
          </Link>
        </div>
        <div className="grid w-full grid-cols-1 gap-8 mt-4 space-y-2 sm:w-full md:grid-cols-2 lg:grid-cols-5 md:space-y-0">
          <div className={`${boxWhite} hover:-translate-y-1`}>
            <div className={`${boxPink} bg-primary`}>
              <FontAwesomeIcon
                icon={faFileLines}
                className={`${outerLogo} text-[#49789e]`}
              />
              <div className={`${innerBox}`}>
                <FontAwesomeIcon
                  icon={faFileLines}
                  className={`${innerLogo} text-primary`}
                />
              </div>
              <p className="!text-[16px] font-semibold mt-[10px] ml-[17px] absolute">
                Total Requests
              </p>
              <p className="!text-[40px] font-bold bottom-6 mx-5 absolute">
                {dataLoading ? (
                  <span className="my-4 custom-loader bottom-6"></span>
                ) : (
                  approvalRequestCounts.total
                )}
              </p>
            </div>
          </div>
          <div className={`${boxWhite} hover:-translate-y-1`}>
            <div className={`${boxPink} bg-[#64a73a]`}>
              <FontAwesomeIcon
                icon={faFileCircleCheck}
                className={`${outerLogo} text-[#82f238]`}
              />
              <div className={`${innerBox}`}>
                <FontAwesomeIcon
                  icon={faFileCircleCheck}
                  className={`${innerLogo} text-[#1b6915]`}
                />
              </div>
              <p className="!text-[16px] font-semibold mt-[10px] ml-[17px] absolute">
                Completed Requests
              </p>
              <p className="!text-[40px] font-bold bottom-6 mx-5 absolute">
                {dataLoading ? (
                  <span className="my-4 custom-loader bottom-6"></span>
                ) : (
                  approvalRequestCounts.total_completed
                )}
              </p>
            </div>
          </div>
          <div className={`${boxWhite} hover:-translate-y-1`}>
            <div className={`${boxPink} bg-[#19bc7a]`}>
              <FontAwesomeIcon
                icon={faRotate}
                className={`${outerLogo} text-[#0b8652]`}
              />
              <div className={`${innerBox}`}>
                <FontAwesomeIcon
                  icon={faRotate}
                  className={`${innerLogo} text-[#208642]`}
                />
              </div>
              <p className="!text-[16px] font-semibold mt-[10px] ml-[17px] absolute">
                Ongoing Requests
              </p>
              <p className="!text-[40px] font-bold bottom-6 mx-5 absolute">
                {dataLoading ? (
                  <span className="my-4 custom-loader bottom-6"></span>
                ) : (
                  approvalRequestCounts.total_ongoing
                )}
              </p>
            </div>
          </div>
          <div className={`${boxWhite} hover:-translate-y-1`}>
            <div className={`${boxPink} bg-secondary`}>
              <FontAwesomeIcon
                icon={faClockRotateLeft}
                className={`${outerLogo} text-[#7b4d0c]`}
              />
              <div className={`${innerBox}`}>
                <FontAwesomeIcon
                  icon={faClockRotateLeft}
                  className={`${innerLogo} text-secondary`}
                />
              </div>
              <p className="!text-[16px] font-semibold mt-[10px] ml-[17px] absolute">
                Pending Requests
              </p>
              <p className="!text-[40px] font-bold bottom-6 mx-5 absolute">
                {dataLoading ? (
                  <span className="my-4 custom-loader bottom-6"></span>
                ) : (
                  approvalRequestCounts.total_pending
                )}
              </p>
            </div>
          </div>
          <div className={`${boxWhite} hover:-translate-y-1`}>
            <div className={`${boxPink} bg-accent`}>
              <FontAwesomeIcon
                icon={faFileCircleXmark}
                className={`${outerLogo} text-[#6b0d2d]`}
              />
              <div className={`${innerBox}`}>
                <FontAwesomeIcon
                  icon={faFileCircleXmark}
                  className={`${innerLogo} text-accent`}
                />
              </div>
              <p className="!text-[16px] font-semibold mt-[10px] ml-[17px] absolute">
                Unsuccessful Requests
              </p>
              <p className="!text-[40px] font-bold bottom-6 mx-5 absolute">
                {dataLoading ? (
                  <span className="my-4 custom-loader bottom-6"></span>
                ) : (
                  approvalRequestCounts.total_disapproved
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 my-3">
        <div className="flex justify-between items-center">
          <p className="text-[25px]! font-bold">My Request</p>
          <Link
            href="/request"
            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
          >
            See all
          </Link>
        </div>
        <div className="grid w-full grid-cols-1 gap-8 mt-4 space-y-2 sm:w-full md:grid-cols-2 lg:grid-cols-5 md:space-y-0">
          <div className={`${boxWhite} hover:-translate-y-1`}>
            <div className={`${boxPink} bg-primary`}>
              <FontAwesomeIcon
                icon={faFileLines}
                className={`${outerLogo} text-[#298DDE]`}
              />
              <div className={`${innerBox}`}>
                <FontAwesomeIcon
                  icon={faFileLines}
                  className={`${innerLogo} text-primary`}
                />
              </div>
              <p className="!text-[16px] font-semibold mt-[10px] ml-[17px] absolute">
                Total Requests
              </p>
              <p className="!text-[40px] font-bold bottom-6 mx-5 absolute">
                {dataLoading ? (
                  <span className="my-4 custom-loader bottom-6"></span>
                ) : (
                  totalRequestsSent
                )}
              </p>
            </div>
          </div>
          <div className={`${boxWhite} hover:-translate-y-1`}>
            <div className={`${boxPink} bg-[#4abffd]`}>
              <FontAwesomeIcon
                icon={faFileCircleCheck}
                className={`${outerLogo} text-[#2a8bbf]`}
              />
              <div className={`${innerBox}`}>
                <FontAwesomeIcon
                  icon={faFileCircleCheck}
                  className={`${innerLogo} text-[#2ea7e8]`}
                />
              </div>
              <p className="!text-[16px] font-semibold mt-[10px] ml-[17px] absolute">
                Completed Requests
              </p>
              <p className="!text-[40px] font-bold bottom-6 mx-5 absolute">
                {dataLoading ? (
                  <span className="my-4 custom-loader bottom-6"></span>
                ) : (
                  totalCompletedRequests
                )}
              </p>
            </div>
          </div>
          <div className={`${boxWhite} hover:-translate-y-1`}>
            <div className={`${boxPink} bg-[#32bfd5]`}>
              <FontAwesomeIcon
                icon={faRotate}
                className={`${outerLogo} text-[#368a96]`}
              />
              <div className={`${innerBox}`}>
                <FontAwesomeIcon
                  icon={faRotate}
                  className={`${innerLogo} text-[#2da6b9]`}
                />
              </div>
              <p className="!text-[16px] font-semibold mt-[10px] ml-[17px] absolute">
                Ongoing Requests
              </p>
              <p className="!text-[40px] font-bold bottom-6 mx-5 absolute">
                {dataLoading ? (
                  <span className="my-4 custom-loader bottom-6"></span>
                ) : (
                  totalOngoingRequests
                )}
              </p>
            </div>
          </div>
          <div className={`${boxWhite} hover:-translate-y-1`}>
            <div className={`${boxPink} bg-secondary`}>
              <FontAwesomeIcon
                icon={faClockRotateLeft}
                className={`${outerLogo} text-[#D88A1B]`}
              />
              <div className={`${innerBox}`}>
                <FontAwesomeIcon
                  icon={faClockRotateLeft}
                  className={`${innerLogo} text-secondary`}
                />
              </div>
              <p className="!text-[16px] font-semibold mt-[10px] ml-[17px] absolute">
                Pending Requests
              </p>
              <p className="!text-[40px] font-bold bottom-6 mx-5 absolute">
                {dataLoading ? (
                  <span className="my-4 custom-loader bottom-6"></span>
                ) : (
                  totalPendingRequests
                )}
              </p>
            </div>
          </div>
          <div className={`${boxWhite} hover:-translate-y-1`}>
            <div className={`${boxPink} bg-accent`}>
              <FontAwesomeIcon
                icon={faFileCircleXmark}
                className={`${outerLogo} text-[#C22158]`}
              />
              <div className={`${innerBox}`}>
                <FontAwesomeIcon
                  icon={faFileCircleXmark}
                  className={`${innerLogo} text-accent`}
                />
              </div>
              <p className="!text-[16px] font-semibold mt-[10px] ml-[17px] absolute">
                Unsuccessful Requests
              </p>
              <p className="!text-[40px] font-bold bottom-6 mx-5 absolute">
                {dataLoading ? (
                  <span className="my-4 custom-loader bottom-6"></span>
                ) : (
                  totalDisapprovedRequests
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 md:flex-row ">
        <div className="flex-7 pt-2 bg-base-100 drop-shadow-lg w-full rounded-[12px] h-[327px] mt-4">
          <h1 className="text-lg font-bold text-center ">
            REQUESTS THIS MONTH
          </h1>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={areaChartData}
              margin={{ right: 30, left: 0, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                domain={[0, "auto"]}
                ticks={[20, 60, 90, 150]}
                allowDecimals={false}
                tickFormatter={(value) => Math.floor(value).toString()}
              />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="Total"
                stroke="#1E9AFF" // Blue for total requests
                fillOpacity={0.3}
                fill="#1E9AFF"
              />
              <Area
                type="monotone"
                dataKey="Approved"
                stroke="#5EB562" // Green for approved requests
                fillOpacity={0.3}
                fill="#5EB562"
              />
              <Area
                type="monotone"
                dataKey="Pending"
                stroke="#FEA01C" // Yellow for pending requests
                fillOpacity={0.3}
                fill="#FEA01C"
              />
              <Area
                type="monotone"
                dataKey="Disapproved"
                stroke="#E73774" // Red for unapproved requests
                fillOpacity={0.3}
                fill="#E73774"
              />
              <Area
                type="monotone"
                dataKey="Rejected"
                stroke="#Ff0000" // Red for unapproved requests
                fillOpacity={0.3}
                fill="#FF4122"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-3 pb-10 pt-2 bg-base-100 w-full drop-shadow-lg lg:w-2/4 rounded-[12px] h-[327px] mt-4">
          <h1 className="text-lg font-bold text-center">REQUEST THIS WEEK</h1>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              width={500}
              height={300}
              data={barChartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                tickFormatter={(value) => Math.floor(value).toString()}
                allowDecimals={false}
                domain={[0, "auto"]}
                ticks={[20, 60, 90, 150]}
              />
              <Tooltip />
              <Bar dataKey="Request" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default authenticatedPage(ApproverDashboard, true, false, true);
