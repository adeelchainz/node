import { AUTH } from "@/constants/apis";
import { useApiMutation } from "@/lib/reactQuery/hooks";
import { RegisterTypes, verifyTypes } from "@/schemas/authSchema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const Register = () => {
  const router = useRouter(); // Use the router to navigate

  const { mutate, error, isPending, data } = useApiMutation<
    RegisterTypes,
    RegisterTypes
  >({
    url: AUTH.REGISTER,
    method: "POST",
    options: {
      onSuccess: () => {
        toast.success("Registered Successfully", {
          description: "An email has been sent to your account",
        });
        router.push("/login");
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

export const Verify = () => {
  const router = useRouter(); // Use the router to navigate

  const { mutate, error, isPending, data } = useApiMutation<
    verifyTypes,
    { token: string; code: string }
  >({
    url: ({ token, code }) => AUTH.VERIFY(token, code),
    method: "PATCH",
    options: {
      onSuccess: () => {
        toast.success("Verified Successfully");
        router.push("/login");
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
    verify: mutate,
    isLoading: isPending,
    error: error,
    data: data,
  };
};

export const Login = () => {
  const router = useRouter(); // Use the router to navigate

  const { mutate, error, isPending, data } = useApiMutation<
    RegisterTypes,
    RegisterTypes
  >({
    url: AUTH.LOGIN,
    method: "POST",
    options: {
      onSuccess: () => {
        router.push("/home");
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
    login: mutate,
    isLoading: isPending,
    error: error,
    data: data,
  };
};
