"use client";

import Navbar from "@/components/layouts/navbar";
import Sidebar2 from "@/components/layouts/sidebar2";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Modal from "../ui/modal";
import SetupSignature from "../setup-signature";
import SignatureCanvas from "react-signature-canvas";
import { api } from "@/lib/api";
import Swal from "sweetalert2";
import Form from "@/app/_components/Form";
import { RiCustomerService2Fill } from "react-icons/ri";

const BaseContent = ({ children }: any) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState<any>(false);
  const [signature, setSignature] = useState<SignatureCanvas | null | any>(
    null,
  );
  const { user, isLoading, updateProfile, isAuthenticated } = useAuth();
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<{
    feedback: string;
    message: string;
  }>({
    feedback: "",
    message: "",
  });
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const divRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!submitted && !successMessage?.message) return;
    Swal.fire({
      icon: "success",
      title: "Success",
      text: successMessage?.message,
    });
  }, [submitted, successMessage?.message]);

  useEffect(() => {
    const handleClickOutSide = (e: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        divRef.current &&
        !divRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutSide);

    return () => {
      document.removeEventListener("mousedown", handleClickOutSide);
    };
  }, []);

  const isGuest =
    pathname === "/login" ||
    pathname === "/registration" ||
    pathname === "/" ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/print");

  const isPrint = pathname.startsWith("/print");

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const handleSubmitSignature = async () => {
    setIsSubmit(true);
    if (!signature) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please add signature first before saving.",
      });
      setIsSubmit(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("signature", signature);
      const response = await api.post("/update-signature", formData);

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: response?.data?.message,
        });
        updateProfile();
        document.body.style.overflow = "unset";
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmit(false);
    }
  };

  const handleOpenFeedback = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {isGuest ? (
        children
      ) : (
        <>
          <Modal
            isOpen={!isLoading && !user?.signature && isAuthenticated}
            title="Setup Signature"
            handleSubmit={handleSubmitSignature}
            isLoading={isSubmit}
          >
            <SetupSignature signatureProps={setSignature} />
          </Modal>
          <div className="relative flex w-full h-screen">
            <div
              className={`h-full fixed ${
                isSidebarVisible ? "block" : "hidden"
              } md:block z-30 overflow-visible`}
            >
              <Sidebar2
                darkMode={false}
                role={user?.role}
                isSidebarVisible={isSidebarVisible}
                toggleSidebar={toggleSidebar}
                open={isSidebarVisible}
              />
            </div>
            <div
              className={`flex-1 flex-col w-full transition-all duration-300 ml-0 ${
                isSidebarVisible ? "md:ml-60 ml-20" : "md:ml-20 ml-0"
              }`}
            >
              <Navbar
                darkMode={false}
                toggleSidebar={toggleSidebar}
                currentPage={pathname.replace(/\//g, " ")}
                isSidebarVisible={isSidebarVisible}
              />
              <div className="flex-1 w-full">{children}</div>
            </div>
          </div>
        </>
      )}

      <div className="relative z-50">
        <div
          ref={divRef}
          className={`max-w-md max-h-2/3 overflow-auto shadow rounded-xl fixed bottom-25 right-10 transition-all duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "translate-x-150"
          }`}
        >
          <Form
            setSubmitted={setSubmitted}
            setSuccessMessage={setSuccessMessage}
          />
        </div>
        <button
          hidden={isPrint}
          ref={buttonRef}
          type="button"
          className="fixed bottom-5 bg-base-100 p-3 rounded-full right-5"
          onClick={handleOpenFeedback}
        >
          <div className="flex gap-1 items-center group transition-all duration-500 ease-in-out">
            <div className="w-10 h-10">
              <RiCustomerService2Fill className="w-full h-full text-blue-500" />
            </div>
            <div
              className={`text-blue-500 font-bold  max-w-0 opacity-0 overflow-hidden transition-all duration-500 ease-in-out group-hover:max-w-[200px] group-hover:opacity-100 ${
                isOpen && "max-w-[200px] opacity-100"
              }`}
            >
              <span className="inline-block">Send us feedback</span>
            </div>
          </div>
        </button>
      </div>
    </>
  );
};

export default BaseContent;
