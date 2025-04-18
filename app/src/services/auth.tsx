import { useApiMutation } from "@/lib/reactQuery/hooks";
import { RegisterTypes } from "@/schemas/authSchema";
// import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const Register = () => {
  // const router = useRouter(); // Use the router to navigate

  const { mutate, error, isPending, data } = useApiMutation<
    RegisterTypes,
    RegisterTypes
  >({
    url: "http://localhost:3000/v1/register",
    method: "POST",
    options: {
      onSuccess: (data) => {
        toast("You submitted the following values:", {
          description: (
            <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
              <code className="text-white">
                {JSON.stringify(data, null, 2)}
              </code>
            </pre>
          ),
        });
      },
      onError: (error) => {
        toast.error("Something went wrong", {
          description: error.message,
        });
      },
    },
  });
  //Add additional logic or operations here

  return {
    register: mutate,
    isLoading: isPending,
    error: error,
    data: data,
  };
};
