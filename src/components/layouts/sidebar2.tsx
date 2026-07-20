"use client";

import { useEffect, useState } from "react";
import Logo from "@/assets/logo.png";
import {
  ChartBarIcon,
  EnvelopeIcon,
  DocumentCheckIcon,
  DocumentPlusIcon,
  UserGroupIcon,
  BookOpenIcon,
  UserIcon,
  BuildingOfficeIcon,
  MapIcon,
  SwatchIcon,
  UserPlusIcon,
  BriefcaseIcon,
  StarIcon,
  LockClosedIcon,
  FlagIcon,
  UsersIcon,
  FolderArrowDownIcon,
} from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import echo from "@/hooks/echo";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { NavItem, SidebarProps } from "@/types/sidebarTypes";
import { useNotification } from "@/context/NotificationContext";
import Swal from "sweetalert2";

const Sidebar2 = ({ darkMode, role, open, toggleSidebar }: SidebarProps) => {
  const pathname = usePathname();
  const [notificationReceived, setnotificationReceived] = useState(false);
  const [pendingCounts, setPendingCounts] = useState(0);
  const [tooltip, setTooltip] = useState<{ label: string; y: number } | null>(
    null,
  );
  const { user, logout, isAuthenticated, isApprover, isAuditor, isAdmin } =
    useAuth();
  const { isRefresh } = useNotification();

  const navItems: NavItem[] =
    isAuditor && isApprover
      ? [
          {
            title: "Dashboard",
            submenu: false,
            icon: ChartBarIcon,
            path: "/approver/dashboard",
          },
          {
            title: "My Request",
            submenu: false,
            icon: EnvelopeIcon,
            path: "/request",
          },
          {
            title: "Create Request",
            submenu: false,
            icon: DocumentPlusIcon,
            path: "/create-request?title=Stock%20Requisition",
          },
          {
            title: "Process Request",
            submenu: false,
            icon: DocumentCheckIcon,
            path: "/approver/request",
          },
          {
            title: "Reports",
            submenu: false,
            icon: FlagIcon,
            path: "/reports",
          },
          {
            title: "Shared Requests",
            submenu: false,
            icon: FolderArrowDownIcon,
            path: "/shared-requests",
          },
          { title: "Help", submenu: false, icon: BookOpenIcon, path: "/help" },
        ]
      : isAuditor
        ? [
            {
              title: "Dashboard",
              submenu: false,
              icon: ChartBarIcon,
              path: "/dashboard",
            },
            {
              title: "My Request",
              submenu: false,
              icon: EnvelopeIcon,
              path: "/request",
            },
            {
              title: "Create Request",
              submenu: false,
              icon: DocumentPlusIcon,
              path: "/create-request?title=Stock%20Requisition",
            },
            {
              title: "Reports",
              submenu: false,
              icon: FlagIcon,
              path: "/reports",
            },
            {
              title: "Shared Requests",
              submenu: false,
              icon: FolderArrowDownIcon,
              path: "/shared-requests",
            },
            {
              title: "Help",
              submenu: false,
              icon: BookOpenIcon,
              path: "/help",
            },
          ]
        : isApprover
          ? [
              {
                title: "Dashboard",
                submenu: false,
                icon: ChartBarIcon,
                path: "/approver/dashboard",
              },
              {
                title: "My Request",
                submenu: false,
                icon: EnvelopeIcon,
                path: "/request",
              },
              {
                title: "Create Request",
                submenu: false,
                icon: DocumentPlusIcon,
                path: "/create-request?title=Stock%20Requisition",
              },
              {
                title: "Process Request",
                submenu: false,
                icon: DocumentCheckIcon,
                path: "/approver/request",
              },
              {
                title: "Shared Requests",
                submenu: false,
                icon: FolderArrowDownIcon,
                path: "/shared-requests",
              },
              {
                title: "Help",
                submenu: false,
                icon: BookOpenIcon,
                path: "/help",
              },
            ]
          : isAdmin
            ? [
                {
                  title: "Dashboard",
                  submenu: false,
                  icon: ChartBarIcon,
                  path: "/dashboard",
                },
                {
                  title: "Users",
                  submenu: false,
                  icon: UserPlusIcon,
                  path: "/admin/users",
                },
                {
                  title: "Positions",
                  submenu: false,
                  icon: BriefcaseIcon,
                  path: "/admin/positions",
                },
                {
                  title: "Branches",
                  submenu: false,
                  icon: BuildingOfficeIcon,
                  path: "/admin/branches",
                },
                {
                  title: "Approvers",
                  submenu: false,
                  icon: UserIcon,
                  path: "/admin/approvers",
                },
                // {
                //   title: "Approver Checkers",
                //   submenu: false,
                //   icon: UsersIcon,
                //   path: "/admin/approver-checkers",
                // },
                {
                  title: "AVP Staffs",
                  submenu: false,
                  icon: UserGroupIcon,
                  path: "/admin/avp-staffs",
                },
                {
                  title: "Area Managers",
                  submenu: false,
                  icon: MapIcon,
                  path: "/admin/area-managers",
                },
                {
                  title: "Branch Heads",
                  submenu: false,
                  icon: SwatchIcon,
                  path: "/admin/branch-heads",
                },
                {
                  title: "Feedbacks",
                  submenu: false,
                  icon: StarIcon,
                  path: "/admin/feedbacks",
                },
                {
                  title: "Request Access",
                  submenu: false,
                  icon: LockClosedIcon,
                  path: "/admin/request-access",
                },
                {
                  title: "Reports",
                  submenu: false,
                  icon: FlagIcon,
                  path: "/reports",
                },
                {
                  title: "Help",
                  submenu: false,
                  icon: BookOpenIcon,
                  path: "/help",
                },
              ]
            : [
                {
                  title: "Dashboard",
                  submenu: false,
                  icon: ChartBarIcon,
                  path: "/dashboard",
                },
                {
                  title: "My Request",
                  submenu: false,
                  icon: EnvelopeIcon,
                  path: "/request",
                },
                {
                  title: "Create Request",
                  submenu: false,
                  icon: DocumentPlusIcon,
                  path: "/create-request?title=Stock%20Requisition",
                },
                {
                  title: "Shared Requests",
                  submenu: false,
                  icon: FolderArrowDownIcon,
                  path: "/shared-requests",
                },
                {
                  title: "Help",
                  submenu: false,
                  icon: BookOpenIcon,
                  path: "/help",
                },
              ];

  useEffect(() => {
    const handleResize = () => {
      // Your resize logic here
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!isApprover) return;
    const fetchPendingsCount = async () => {
      try {
        const response = await api.get("/for-approval-pendings-count");

        setPendingCounts(response?.data);
      } catch (error) {
        console.error(error);
      } finally {
        setnotificationReceived(false);
      }
    };

    fetchPendingsCount();
  }, [notificationReceived, isRefresh, isApprover]);

  useEffect(() => {
    if (!echo || !user?.id) return;

    echo
      .private(`pendingCount.${user?.id}`)
      .listen("NotificationEvent", (e: any) => {
        setnotificationReceived(true);
      });

    return () => {
      echo.leave(`pendingCount.${user?.id}`);
    };
  }, [user?.id, echo]);

  useEffect(() => {
    if (!echo || !user?.id) return;
    echo
      .private(`App.Models.User.${user?.id}`)
      .notification((notification: any) => {
        setnotificationReceived(true);
      });

    return () => {
      echo.leave(`App.Models.User.${user?.id}`);
    };
  }, [user?.id, echo]);

  useEffect(() => {}, []);

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
      }
    });
  };

  const listStyle =
    "relative mx-2 group flex items-center text-[18px] text-gray-400 font-medium py-2 pr-3 px-2 cursor-pointer rounded-lg";
  const pStyle = "group-hover:text-primary font text-lg px-2 rounded-lg";
  const iconStyle = "size-[32px] group-hover:text-primary";
  const activeClass = "bg-[#D2E6F7] text-primary";

  if (!isAuthenticated) return null;

  const logoutIcon = (
    <svg
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
      style={{ transform: "rotate(-180deg)", width: "25px", height: "25px" }}
    >
      <path d="M17 16l4-4m0 0l-4-4 m4 4h-14m5 8 H6a3 3 0 01-3-3V7a3 3 0 013-3h7"></path>
    </svg>
  );

  return (
    <div
      className={`h-full ${open ? "w-60" : "w-20"} flex flex-col bg-base-100 border-r border-base-300 transition-all duration-300 ${!open ? "overflow-visible" : "overflow-hidden"}`}
    >
      {/* Single fixed tooltip rendered at hovered item's Y position */}
      {!open && tooltip && (
        <div
          className="fixed left-20 z-[9999] pointer-events-none whitespace-nowrap rounded-lg bg-[#D2E6F7] text-primary px-3 py-1.5 text-sm font-medium shadow-md"
          style={{ top: tooltip.y }}
        >
          {tooltip.label}
        </div>
      )}
      {/* Logo */}
      <div className="px-2 py-3 h-[68px] flex justify-center items-center border-b border-base-300 shrink-0">
        <Image
          src={Logo}
          alt="Logo"
          height={80}
          width={120}
          className="cursor-pointer"
          onClick={toggleSidebar}
        />
      </div>

      {/* Nav items — scrollable */}
      <ul className="flex-1 overflow-y-auto overflow-x-hidden w-full mt-4 pb-2">
        <div className="w-full flex flex-col gap-1">
          {navItems.map((item) => (
            <Link href={item.path} key={item.title}>
              <li
                className={`${listStyle} ${
                  pathname.startsWith(item.path.split("?")[0])
                    ? activeClass
                    : ""
                } ${!open ? "justify-center hover:bg-[#D2E6F7] dark:hover:bg-base-200 overflow-visible" : "hover:bg-[#E7F1F9] dark:hover:bg-base-200"}`}
                onMouseEnter={(e) =>
                  !open &&
                  setTooltip({
                    label: item.title,
                    y:
                      (e.currentTarget.getBoundingClientRect().top +
                        e.currentTarget.getBoundingClientRect().bottom) /
                        2 -
                      14,
                  })
                }
                onMouseLeave={() => setTooltip(null)}
              >
                <div className="relative p-2">
                  <item.icon className={iconStyle} />
                  {pendingCounts > 0 &&
                    item.title === "Process Request" &&
                    !open && (
                      <span className="absolute top-0 right-0 bg-pink-400 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                        {pendingCounts}
                      </span>
                    )}
                </div>
                {open ? (
                  <div className="flex-1">
                    <p className={`${pStyle} truncate p-1`}>
                      {item.title}{" "}
                      {pendingCounts > 0 &&
                        item.title === "Process Request" && (
                          <span className="bg-pink-400 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                            {pendingCounts}
                          </span>
                        )}
                    </p>
                  </div>
                ) : null}
              </li>
            </Link>
          ))}
        </div>
      </ul>

      {/* Logout — always at bottom */}
      <div
        onClick={handleLogout}
        onMouseEnter={(e) =>
          !open &&
          setTooltip({
            label: "Logout",
            y:
              (e.currentTarget.getBoundingClientRect().top +
                e.currentTarget.getBoundingClientRect().bottom) /
                2 -
              14,
          })
        }
        onMouseLeave={() => setTooltip(null)}
        className={`relative shrink-0 flex items-center border-t border-base-300 h-12 cursor-pointer group hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors ${
          open ? "px-5 gap-2" : "justify-center"
        }`}
      >
        <span className="text-base-content/50 group-hover:text-red-500 transition-colors">
          {logoutIcon}
        </span>
        {open && (
          <p className="text-base-content/50 group-hover:text-red-500 font text-lg px-2 rounded-lg truncate p-1 transition-colors">
            Logout
          </p>
        )}
      </div>
    </div>
  );
};

export default Sidebar2;
