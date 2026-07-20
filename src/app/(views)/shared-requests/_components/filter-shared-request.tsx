import { FilterType } from "@/types/filterTypes";
import { useRouter } from "next/navigation";
import { BiSearchAlt } from "react-icons/bi";

export default function FilterSharedRequest({
  filter,
  setFilter,
  searchData,
  handleSearch,
}: {
  filter: FilterType;
  searchData: string;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
  handleSearch: () => (e: any) => void;
}) {
  const router = useRouter();
  console.log(searchData);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="form-control">
        <label className="label">
          <span className="label-text">From Date</span>
        </label>
        <input
          type="date"
          className="input input-bordered w-full"
          value={filter.date_from}
          onChange={(e) =>
            setFilter((filter) => ({
              ...filter,
              date_from: e.target.value,
            }))
          }
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">To Date</span>
        </label>
        <input
          type="date"
          className="input input-bordered w-full"
          value={filter?.date_to}
          onChange={(e) =>
            setFilter((filter) => ({
              ...filter,
              date_to: e.target.value,
            }))
          }
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Status</span>
        </label>
        <select
          className="select select-bordered w-full bg-base-100"
          value={filter?.status}
          onChange={(e) =>
            setFilter((filter) => ({
              ...filter,
              status: e.target.value,
            }))
          }
        >
          <option value="">All Status</option>
          <option value="Completed">Completed</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Disapproved">Disapproved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Search</span>
        </label>
        <div className="relative">
          <input
            type="search"
            placeholder="Search reports..."
            value={searchData}
            className="input input-bordered w-full pl-10 bg-base-100 focus:outline-none focus:border-blue-500"
            onChange={(e) => {
              handleSearch()(e);
              router.replace("/shared-requests");
            }}
          />
          <span className="absolute left-3 top-2 z-1">
            <BiSearchAlt className="text-gray-500" size={20} />
          </span>
        </div>
      </div>
    </div>
  );
}
