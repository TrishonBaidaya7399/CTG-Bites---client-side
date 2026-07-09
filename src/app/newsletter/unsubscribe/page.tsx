import { Suspense } from "react";
import { UnsubscribeClient } from "@/components/layout/UnsubscribeClient";

export default function UnsubscribePage() {
  return (
    <Suspense>
      <UnsubscribeClient />
    </Suspense>
  );
}
