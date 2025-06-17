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
  image: z
  .any()
  .refine((file) => file instanceof File || file === undefined, {
    message: "Image must be a file",
  }),

  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  dob: z.string().nonempty("Date of Birth is required"),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender",
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
      dob: "",
      gender: "male",

    },
  });

  const handlePasswordIcon = () => {
    setShow((prev) => !prev);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    // formData.append("image", values.image as File);
    formData.append("name", values.username);
    formData.append("email", values.email);
    formData.append("password", values.password);
    if(values.image){
      formData.append("image", values.image);
    }
    formData.append("dob", values.dob);
    formData.append("gender", values.gender);
    
    try {
      await axios.post("http://localhost:5000/api/user/create-account", formData,{
        headers: {
          "Content-Type": "multipart/form-data",
        },
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
            
            {/* Image Upload */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (

                <FormItem>
                  <FormLabel className="font-semibold">Profile Image</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* username */}
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
            {/* Email */}
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
            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Password</FormLabel>
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
                        {show ? <BiSolidShow /> : <BiSolidHide />}
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date of Birth */}
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold ">Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
               {/* Gender */}
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Gender</FormLabel>
                  <FormControl>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          value="male"
                          checked={field.value === "male"}
                          onChange={field.onChange}
                        />
                        Male
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          value="female"
                          checked={field.value === "female"}
                          onChange={field.onChange}
                        />
                        Female
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          value="other"
                          checked={field.value === "other"}
                          onChange={field.onChange}
                        />
                        Other
                      </label>
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
