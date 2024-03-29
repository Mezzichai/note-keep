import { useInfiniteQuery } from "@tanstack/react-query"
import { getNotes } from "./noteServices";
import { NoteType } from "../../../interfaces";
import { useGlobalContext } from "../../../context/GlobalContext";
import { AxiosError } from "axios";


const useInfiniteNotesQuery = () => {
  const { query, currentLabel } = useGlobalContext()

  const {data, fetchNextPage, isFetchingNextPage, hasNextPage, isSuccess, isPending, isError, error} = useInfiniteQuery<NoteType[], AxiosError>({
    queryKey: ["notes", currentLabel._id, query],
    queryFn: ({pageParam = 1}) => getNotes(currentLabel._id || "", query, Number(pageParam)),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 0 ? undefined : allPages.length + 1;
    }
  })

  return { data, isSuccess, isPending, isError, error, fetchNextPage, isFetchingNextPage, hasNextPage};
}



export default useInfiniteNotesQuery