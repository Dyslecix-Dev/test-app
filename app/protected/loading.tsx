import { Spinner } from "@/components/ui/spinner";

export default function ProtectedLoading() {
  return (
    <div className="flex w-full flex-1 items-center justify-center py-20">
      <Spinner className="size-8" />
    </div>
  );
}
