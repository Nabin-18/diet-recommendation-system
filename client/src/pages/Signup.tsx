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
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

const Signup = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const handlePasswordIcon = () => {
    setShow((prev) => !prev);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post("http://localhost:5000/api/user/create-account", {
        name: values.username,
        email: values.email,
        password: values.password,
      });
      toast.success("Signup Successfully!");
      // Redirect after short delay
      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Signup failed. Try again.";
      toast.error(message);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 max-w-md mx-auto p-6 bg-white shadow-lg border rounded-2xl flex flex-col w-full"
          >
            <h1 className="text-center font-bold text-2xl underline">Sign Up</h1>

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Username:</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your full name"
                      className="rounded-[8px] focus-visible:ring-0 shadow-none placeholder:text-gray-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Email:</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      className="rounded-[8px] focus-visible:ring-0 shadow-none placeholder:text-gray-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Password:</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={!show ? "password" : "text"}
                        placeholder="Enter password"
                        className="rounded-[8px] focus-visible:ring-0 shadow-none placeholder:text-gray-500"
                        {...field}
                      />
                      <span
                        className="absolute top-1/2 right-3 transform -translate-y-1/2 text-xl text-gray-600 cursor-pointer"
                        onClick={handlePasswordIcon}
                      >
                        {show ? <BiSolidHide /> : <BiSolidShow />}
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full cursor-pointer">
              Sign Up
            </Button>
            <Link to={"/auth/login"}>
              <p className="font-semibold cursor-pointer underline text-center">
                Already have an account?
              </p>
            </Link>
          </form>
        </Form>
        <ToastContainer />
      </div>
    </>
  );
};

export default Signup;
