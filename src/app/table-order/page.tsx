import type { Metadata } from "next";
import { TableOrderClient } from "@/components/order/TableOrderClient";

export const metadata: Metadata = {
  title: "Table Order — CTG Bites",
  robots: { index: false, follow: false },
};

export default function TableOrderPage() {
  return <TableOrderClient />;
}
