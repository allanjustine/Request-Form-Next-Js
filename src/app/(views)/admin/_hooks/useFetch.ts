import { useEffect, useRef, useState } from "react";
import { PaginationType } from "../_types/pagination";
import { paginationData } from "../_constants/pagination";
import { api } from "@/lib/api";
import { FilterType } from "@/types/filterTypes";
import { FILTER } from "@/constants/filters";

export default function useFetch({
  url,
  isFetch = true,
}: {
  url: string;
  isFetch?: boolean;
}) {
  const [data, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<PaginationType>(paginationData);
  const [filter, setFilter] = useState<FilterType>(FILTER);
  const [isRefresh, setIsRefresh] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchData, setSearchData] = useState<string>("");
  const searchDebounce = useRef<any>(null);

  useEffect(() => {
    if (!isFetch) return;
    setPagination((pagination) => ({
      ...pagination,
      loading: true,
    }));
    const fetchAllData = async () => {
      try {
        const response = await api.get(url, {
          params: {
            page: pagination?.current_page,
            per_page: pagination?.per_page,
            search: searchTerm,
            date_from: filter.date_from,
            date_to: filter.date_to,
            status: filter.status,
          },
        });
        setData(response.data.data);
        setPagination((pagination) => ({
          ...pagination,
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          total: response.data.total,
          per_page: response.data.per_page,
        }));
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
        setPagination((pagination) => ({
          ...pagination,
          loading: false,
        }));
        setIsRefresh(false);
      }
    };
    fetchAllData();
  }, [
    pagination?.current_page,
    pagination?.per_page,
    isRefresh,
    searchTerm,
    filter?.date_from,
    filter?.date_to,
    filter?.status,
    isFetch,
  ]);

  const handleSearch = () => (e: any) => {
    const { value } = e.target;
    setSearchData(value);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);

    searchDebounce.current = setTimeout(() => {
      setSearchTerm(value);
    }, 1000);
  };

  const handleRefresh = () => {
    setIsRefresh(!isRefresh);
  };

  return {
    data,
    setData,
    isLoading,
    setIsLoading,
    pagination,
    setPagination,
    isRefresh,
    setIsRefresh,
    handleSearch,
    setSearchTerm,
    setFilter,
    filter,
    searchData,
    searchTerm,
    setSearchData,
    handleRefresh,
  };
}
