"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

type FormData = z.infer<typeof formSchema>;

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const onSubmit = async (values: FormData) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/user/get-user",
        {
          email: values.email,
          password: values.password,
        }
      );
      console.log(values);

      if (response.status === 200) {
        toast.success("Login Successful!");
        setTimeout(() => {
          navigate("/main-page");
        }, 2000);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Login failed. Try again.";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 max-w-md mx-auto p-6 bg-white shadow-lg border rounded-2xl flex flex-col w-full"
        >
          <h1 className="text-center font-bold text-2xl underline">Login</h1>

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Email:</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="rounded-[8px] focus-visible:ring-0 shadow-none placeholder:text-gray-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Password:</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      className="rounded-[8px] focus-visible:ring-0 shadow-none placeholder:text-gray-500"
                      {...field}
                    />
                    <span
                      className="absolute top-1/2 right-3 transform -translate-y-1/2 text-xl text-gray-600 cursor-pointer"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <BiSolidHide /> : <BiSolidShow />}
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full cursor-pointer">
            Login
          </Button>

          <Link to="/auth/signup" className="text-center">
            <p className="font-semibold cursor-pointer underline">
              Create a new account
            </p>
          </Link>
        </form>
      </Form>
      <ToastContainer />
    </div>
  );
};

export default Login;
