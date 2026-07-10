"use client";

import { useEffect, useState } from "react";
import building from "@/assets/building.jpg";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import BounceLoader from "react-spinners/ClipLoader";
import SignatureCanvas from "react-signature-canvas";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { EyeSlashIcon, EyeIcon } from "@heroicons/react/24/solid";
import { api } from "@/lib/api";
import guestPage from "@/lib/guestPage";
import { dataURLtoFile } from "@/utils/dataUrlToFile";

type UserCredentials = z.infer<typeof schema>;

interface Position {
  id: number;
  value: string;
  label: string;
}

const schema = z
  .object({
    email: z.string().email(),
    password: z.string().min(5).max(20),
    userName: z.string().min(5).max(20),
    firstName: z.string().min(2).max(30),
    lastName: z.string().min(2).max(30),
    contact: z.string().refine((value) => /^\d{11}$/.test(value), {
      message: "Contact number must be 11 digits",
    }),
    branchCode: z.string().nonempty(),
    confirmPassword: z.string().min(5).max(20),
    position: z.string().nonempty(),
    branch: z.string().nonempty(),
    employee_id: z.string().min(2).max(30),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const inputCls =
  "w-full h-11 px-4 rounded-xl bg-base-200 border border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-base-content placeholder:text-base-content/40 autofill-input";
const selectCls =
  "w-full h-11 px-4 rounded-xl bg-base-200 border border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-base-content";
const labelCls = "block text-sm font-medium text-base-content mb-1.5";
const errorCls = "mt-1 text-xs text-error";
const sectionLabelCls =
  "text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-4 mt-6";

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className={errorCls}>{message}</p> : null;

const Registration = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState<SignatureCanvas | null | any>(
    null,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signatureEmpty, setSignatureEmpty] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string[]>([]);
  const [roleOptions, setRoleOptions] = useState<Position[]>([]);
  const [positionError, setPositionError] = useState("");
  const [branchList, setBranchList] = useState<
    { id: number; branch_code: string; branch: string }[]
  >([]);

  useEffect(() => {
    const fetchPositionData = async () => {
      try {
        const response = await api.get("/positions");
        if (response.status === 200) setRoleOptions(response.data.position);
      } catch (error: any) {
        console.error("Error fetching position data:", error);
      }
    };
    fetchPositionData();
  }, []);

  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        const response = await api.get("view-branch");
        const branches = response.data.data;
        setBranchList(
          branches.map(
            (b: { id: number; branch_code: string; branch: string }) => ({
              id: b.id,
              branch_code: b.branch_code,
              branch: b.branch,
            }),
          ),
        );
      } catch (error) {
        console.error("Error fetching branch data:", error);
      }
    };
    fetchBranchData();
  }, []);

  const signatureIsEmpty = () => {
    if (signature?.isEmpty?.()) {
      setSignatureEmpty(true);
      return true;
    }
    return false;
  };

  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<UserCredentials>({ resolver: zodResolver(schema) });

  const capitalizeWords = (str: string) =>
    str.replace(
      /\b\w+/g,
      (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    );

  const submitData = async (data: UserCredentials) => {
    setLoading(true);
    try {
      if (signatureIsEmpty()) {
        setLoading(false);
        return;
      }

      const signatureDataURL = signature?.toDataURL("image/png");
      const signatureData = dataURLtoFile(
        signatureDataURL,
        `${data.userName}.png`,
      );

      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("userName", data.userName);
      formData.append("firstName", capitalizeWords(data.firstName));
      formData.append("lastName", capitalizeWords(data.lastName));
      formData.append("contact", data.contact);
      formData.append("branch_code", data.branchCode);
      formData.append("position", data.position);
      formData.append("confirmPassword", data.password);
      formData.append("signature", signatureData);
      formData.append("role", "User");
      formData.append("branch", data.branch);
      formData.append("employee_id", data.employee_id);

      const response = await api.post("register", formData);
      setErrorMessage(response.data.errors);

      if (response.data.status) {
        setLoading(false);
        localStorage.setItem("token", response.data.token);
        Swal.fire({
          icon: "success",
          title: response.data.message || "Registration Successful",
          iconColor: "#007bff",
          text: "You will be redirected to the login page",
          confirmButtonText: "Close",
          confirmButtonColor: "#007bff",
        });
        window.setTimeout(() => router.push("/login"), 2000);
      } else {
        setPositionError(response.data.errors.position[0]);
        const errs = response.data.errors;
        const message = [...(errs.email ?? []), ...(errs.employee_id ?? [])];
        setErrorMessage(message);
        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          iconColor: "#dc3545",
          text: message.join(", ") || "An error occurred. Please try again.",
          confirmButtonText: "Close",
          confirmButtonColor: "#dc3545",
        });
      }
    } catch (error: any) {
      console.error("Registration Error:", error);
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        iconColor: "#dc3545",
        text: "An error occurred during the registration process. Please try again.",
        confirmButtonText: "Close",
        confirmButtonColor: "#dc3545",
      });
      if (error.response?.status === 422) {
        const errs = error.response.data.errors;
        Object.keys(errs).forEach((field) =>
          setError(field as keyof UserCredentials, {
            type: "server",
            message: errs[field][0],
          }),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBranchCodeChange = (selectedBranchId: number) => {
    const selected = branchList.find((b) => b.id === selectedBranchId);
    setValue("branch", selected?.branch ?? "Honda Des, Inc.");
  };

  const PasswordInput = ({
    name,
    placeholder,
    show,
    onToggle,
  }: {
    name: "password" | "confirmPassword";
    placeholder: string;
    show: boolean;
    onToggle: () => void;
  }) => (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        {...register(name)}
        placeholder={placeholder}
        className={`${inputCls} pr-11 ${errors[name] ? "border-error" : ""}`}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/70 transition-colors"
      >
        {show ? (
          <EyeSlashIcon className="w-5 h-5" />
        ) : (
          <EyeIcon className="w-5 h-5" />
        )}
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Left form panel */}
      <div className="relative flex items-start justify-center w-full lg:w-1/2 p-6 overflow-y-auto">
        {/* Mobile background */}
        <Image
          className="absolute inset-0 z-0 object-cover w-full h-full lg:hidden"
          fill
          src={building}
          alt="background"
        />
        <div className="absolute inset-0 z-0 bg-black/40 lg:hidden" />

        <div className="relative z-10 w-full max-w-2xl py-8 border border-base-300 rounded-2xl">
          <div className="bg-base-100 rounded-2xl shadow-2xl p-8 lg:p-10">
            {/* Header */}
            <div className="mb-8">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-primary hover:opacity-70 transition-opacity mb-6 flex items-center gap-1 text-xs font-medium"
              >
                ← Back to login
              </button>
              <h1 className="text-2xl font-bold text-base-content">
                Create an account
              </h1>
              <p className="text-sm text-base-content/50 mt-1">
                Fill in the details below to register
              </p>
            </div>

            <form onSubmit={handleSubmit(submitData, () => setLoading(false))}>
              {/* Personal Info */}
              <div className="max-h-[calc(100vh-340px)] overflow-y-auto">
                <p className={sectionLabelCls}>Personal Information</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelCls}>First Name</label>
                    <input
                      type="text"
                      {...register("firstName")}
                      placeholder="Enter first name"
                      className={`${inputCls} ${errors.firstName ? "border-error" : ""}`}
                    />
                    <FieldError message={errors.firstName?.message} />
                  </div>
                  <div>
                    <label className={labelCls}>Last Name</label>
                    <input
                      type="text"
                      {...register("lastName")}
                      placeholder="Enter last name"
                      className={`${inputCls} ${errors.lastName ? "border-error" : ""}`}
                    />
                    <FieldError message={errors.lastName?.message} />
                  </div>
                  <div>
                    <label className={labelCls}>Employee ID</label>
                    <input
                      type="text"
                      {...register("employee_id")}
                      placeholder="Enter employee ID"
                      className={`${inputCls} ${errors.employee_id ? "border-error" : ""}`}
                    />
                    <FieldError message={errors.employee_id?.message} />
                  </div>
                  <div>
                    <label className={labelCls}>Contact Number</label>
                    <input
                      type="text"
                      {...register("contact")}
                      placeholder="Enter 11-digit number"
                      className={`${inputCls} ${errors.contact ? "border-error" : ""}`}
                    />
                    <FieldError message={errors.contact?.message} />
                  </div>
                </div>

                {/* Account Info */}
                <p className={sectionLabelCls}>Account Information</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelCls}>Username</label>
                    <input
                      type="text"
                      {...register("userName", {
                        onChange: (e) => {
                          if (e.target.value.includes(" ")) {
                            e.target.value = e.target.value.trim();
                          }
                        },
                      })}
                      placeholder="Enter username"
                      className={`${inputCls} ${errors.userName ? "border-error" : ""}`}
                    />
                    <FieldError message={errors.userName?.message} />
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input
                      type="text"
                      {...register("email")}
                      placeholder="Enter email"
                      className={`${inputCls} ${errors.email ? "border-error" : ""}`}
                    />
                    <FieldError message={errors.email?.message} />
                  </div>
                  <div>
                    <label className={labelCls}>Password</label>
                    <PasswordInput
                      name="password"
                      placeholder="Enter password"
                      show={showPassword}
                      onToggle={() => setShowPassword(!showPassword)}
                    />
                    <FieldError message={errors.password?.message} />
                  </div>
                  <div>
                    <label className={labelCls}>Confirm Password</label>
                    <PasswordInput
                      name="confirmPassword"
                      placeholder="Confirm password"
                      show={showConfirmPassword}
                      onToggle={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    />
                    <FieldError message={errors.confirmPassword?.message} />
                  </div>
                </div>

                {/* Work Info */}
                <p className={sectionLabelCls}>Work Information</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelCls}>Position</label>
                    <Controller
                      name="position"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className={`${selectCls} ${errors.position ? "border-error" : ""}`}
                        >
                          <option value="" hidden>
                            Select position
                          </option>
                          <option value="" disabled>
                            Select position
                          </option>
                          {roleOptions.length === 0 ? (
                            <option disabled>No positions added yet</option>
                          ) : (
                            roleOptions.map((opt, i) => (
                              <option value={opt.value} key={i}>
                                {opt.label}
                              </option>
                            ))
                          )}
                        </select>
                      )}
                    />
                    {positionError && (
                      <p className={errorCls}>{positionError}</p>
                    )}
                    <FieldError message={errors.position?.message} />
                  </div>
                  <div>
                    <label className={labelCls}>Branch Code</label>
                    <Controller
                      name="branchCode"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className={`${selectCls} ${errors.branchCode ? "border-error" : ""}`}
                          onChange={(e) => {
                            field.onChange(e);
                            handleBranchCodeChange(Number(e.target.value));
                          }}
                        >
                          <option value="" hidden>
                            Select branch
                          </option>
                          <option value="" disabled>
                            Select branch
                          </option>
                          {branchList.length > 0 ? (
                            branchList.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.branch_code}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>
                              No branch codes available
                            </option>
                          )}
                        </select>
                      )}
                    />
                    <FieldError message={errors.branchCode?.message} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Branch</label>
                    <Controller
                      name="branch"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          readOnly
                          placeholder="Auto-filled from branch code"
                          className={`${inputCls} opacity-60 cursor-not-allowed`}
                        />
                      )}
                    />
                    <FieldError message={errors.branch?.message} />
                  </div>
                </div>

                {/* Signature */}
                <p className={sectionLabelCls}>Signature</p>
                <div className="mb-6">
                  <div className="border-2 border-dashed border-base-300 rounded-xl overflow-hidden bg-base-100">
                    <SignatureCanvas
                      penColor="black"
                      ref={(ref) => setSignature(ref)}
                      canvasProps={{
                        className: "sigCanvas w-full h-48 bg-white",
                      }}
                      velocityFilterWeight={0.7}
                      minWidth={1.5}
                      maxWidth={2.5}
                      throttle={10}
                      dotSize={1.5}
                    />
                  </div>
                  {signatureEmpty && (
                    <p className={errorCls}>Please provide a signature.</p>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      signature?.clear();
                      setSignatureEmpty(false);
                    }}
                    type="button"
                    className="mt-2 text-xs text-base-content/40 hover:text-error transition-colors underline"
                  >
                    Clear signature
                  </button>
                </div>
              </div>

              {/* Server errors */}
              {Array.isArray(errorMessage) && errorMessage.length > 0 && (
                <div className="mb-4 px-4 py-3 bg-error/10 border border-error/30 rounded-xl text-xs text-error space-y-1">
                  {errorMessage.map((msg, i) => (
                    <p key={i}>{msg}</p>
                  ))}
                </div>
              )}

              {/* Submit */}
              <button
                className="w-full h-11 bg-primary hover:opacity-90 active:scale-[0.98] text-primary-content font-semibold rounded-xl transition-all flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <BounceLoader color="#FFFFFF" size={20} />
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-base-content/50">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right decorative panel */}
      <div className="hidden lg:block w-1/2 sticky top-0 h-screen">
        <Image
          fill
          className="object-cover rounded-l-[150px]"
          src={building}
          alt="decorative"
          priority
        />
        <div className="absolute inset-0 bg-primary/10 rounded-l-[150px]" />
      </div>
    </div>
  );
};

export default guestPage(Registration);
