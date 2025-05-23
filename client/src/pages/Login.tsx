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
import { BiSolidHide } from "react-icons/bi";
import { BiSolidShow } from "react-icons/bi";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  email: z.string().email({
    message: "Invalid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

const Login = () => {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form Submitted:", values);
    navigate("/main-page");
  }

  const [show, setShow] = useState(false);

  const handelPasswordIcon = () => {
    setShow((prev) => !prev);
  };

  return (
    <>
      <div className="min-h-screen  flex items-center justify-center bg-gray-100">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 max-w-md mx-auto p-6 bg-white shadow-lg border rounded-2xl flex flex-col  w-full "
          >
            <h1 className="text-center font-bold text-2xl underline">
              {" "}
              Login{" "}
            </h1>

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
                        onClick={handelPasswordIcon}
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
              Login
            </Button>
            <Link to={"/auth/signup"}>
              <p className="font-semibold cursor-pointer underline">
                Create a new account
              </p>
            </Link>
          </form>
        </Form>
      </div>
    </>
  );
};

export default Login;
