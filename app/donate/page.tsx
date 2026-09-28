import { redirect } from "next/navigation";
import { DONATE_URL } from "@/lib/site";

export default function Donate() {
  redirect(DONATE_URL);
}
