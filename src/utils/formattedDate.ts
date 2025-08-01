import { format } from "date-fns";

export default function formattedDate(date: string) {
  return format(new Date(date), "MM/dd/yyyy");
}
