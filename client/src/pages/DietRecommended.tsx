import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import RecommendedDiet from "./RecommendedDiet";
import dataFromModel from "@/assets/data";

const dietFormSchema = z.object({
  height: z
    .string()
    .regex(/^\d+$/, "Height must be a number")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 50, {
      message: "Minimum height should be 50 cm",
    }),

  weight: z
    .string()
    .regex(/^\d+$/, "Weight must be a number")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 10, {
      message: "Minimum weight should be 10 kg",
    }),

  age: z
    .string()
    .regex(/^\d+$/, "Age must be a number")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 10, {
      message: "Minimum age should be 10 years",
    }),

  gender: z.enum(["male", "female", "others"], {
    required_error: "Gender is required",
  }),

  goal: z.enum(["wt-gain", "wt-loss", "maintain"], {
    required_error: "Goal is required",
  }),

  preference: z.enum(["vegeterain", "non-vegeterain"], {
    required_error: "Preference is required",
  }),

  condition: z.enum(["asthama", "hypertension", "diabetes", "normal"], {
    required_error: "Condition is required",
  }),

  mealType: z.enum(["general", "breakfast", "lunch", "dinner"], {
    required_error: "Meal type is required",
  }),

  mealFrequency: z.enum(["1", "2", "3", "4"], {
    required_error: "Frequency is required",
  }),
});

const DietRecommended = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(dietFormSchema),
  });

  type DietFormData = z.infer<typeof dietFormSchema>;

  const onSubmit = (data: DietFormData) => {
    console.log("Form Submitted:", data);
  };

  return (
    <>
      <div className="m-auto flex flex-col items-center shadow-2xl rounded-2xl bg-white">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full p-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-center font-bold p-4 text-2xl">
              Fill up All the Details
            </h1>
            <h1 className="font-bold text-2xl">Personal Details :</h1>

            <div className="flex items-center gap-8">
              <div className="w-full">
                <Input
                  {...register("height")}
                  placeholder="Enter your Height (cm)"
                  className="rounded-[8px] focus-visible:ring-0 shadow-none placeholder:text-gray-500"
                />
                <p className="text-red-500 text-sm mt-1">
                  {errors.height?.message}
                </p>
              </div>

              <div className="w-full">
                <Input
                  {...register("weight")}
                  placeholder="Enter your Weight(kg)"
                  className="rounded-[8px] focus-visible:ring-0 shadow-none placeholder:text-gray-500"
                />
                <p className="text-red-500 text-sm mt-1">
                  {errors.weight?.message}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="w-full">
                <Input
                  {...register("age")}
                  placeholder="Enter age"
                  className="rounded-[8px] focus-visible:ring-0 shadow-none placeholder:text-gray-500"
                />
                <p className="text-red-500 text-sm mt-1">
                  {errors.age?.message}
                </p>
              </div>

              <div className="w-full">
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full rounded-[8px] focus-visible:ring-0 shadow-none placeholder:text-gray-500">
                        <SelectValue placeholder="Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-red-500 text-sm mt-1">
                  {errors.gender?.message}
                </p>
              </div>
            </div>

            <h1 className="font-bold text-2xl">Health Preference:</h1>
            <div className="flex items-center gap-8">
              <div className="w-full">
                <Controller
                  control={control}
                  name="goal"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full rounded-[8px] focus-visible:ring-0 shadow-none placeholder:text-gray-500">
                        <SelectValue placeholder="Goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wt-gain">Weight Gain</SelectItem>
                        <SelectItem value="wt-loss">Weight Loss</SelectItem>
                        <SelectItem value="maintain">Maintain</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-red-500 text-sm mt-1">
                  {errors.goal?.message}
                </p>
              </div>

              <div className="w-full">
                <Controller
                  control={control}
                  name="preference"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full rounded-[8px] focus-visible:ring-0 shadow-none placeholder:text-gray-500">
                        <SelectValue placeholder="Preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vegeterain">Vegeterain</SelectItem>
                        <SelectItem value="non-vegeterain">
                          Non-Vegeterain
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-red-500 text-sm mt-1">
                  {errors.preference?.message}
                </p>
              </div>

              <div className="w-full">
                <Controller
                  control={control}
                  name="condition"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full rounded-[8px] focus-visible:ring-0 shadow-none placeholder:text-gray-500">
                        <SelectValue placeholder="Health Condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asthama">Asthama</SelectItem>
                        <SelectItem value="hypertension">
                          Hypertension
                        </SelectItem>
                        <SelectItem value="diabetes">Diabetes</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-red-500 text-sm mt-1">
                  {errors.condition?.message}
                </p>
              </div>
            </div>

            <h1 className="font-bold text-2xl">Meal Preference:</h1>
            <div className="flex items-center gap-8">
              <div className="w-full">
                <Controller
                  control={control}
                  name="mealType"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full rounded-[8px] focus-visible:ring-0 shadow-none placeholder:text-gray-500">
                        <SelectValue placeholder="Meal Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-red-500 text-sm mt-1">
                  {errors.mealType?.message}
                </p>
              </div>

              <div className="w-full">
                <Controller
                  control={control}
                  name="mealFrequency"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full rounded-[8px] focus-visible:ring-0 shadow-none placeholder:text-gray-500">
                        <SelectValue placeholder="Meal Frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-red-500 text-sm mt-1">
                  {errors.mealFrequency?.message}
                </p>
              </div>
            </div>

            <Button
              type="submit"
              className="mt-6 w-[20%] m-auto cursor-pointer rounded-[8px] font-semibold"
            >
              Submit
            </Button>
          </div>
        </form>
      </div>
      <div className="m-auto  items-center shadow-2xl rounded-2xl flex flex-col gap-6  mt-4">
        <h1 className="text-xl font-semibold text-center">Recommended Diets</h1>
        <div className="flex flex-wrap gap-6">
          {dataFromModel.length > 0 ? (
            dataFromModel.map((item, index) => (
              <RecommendedDiet
                key={index}
                name={item.name}
                image={item.image}
                calories={item.calories}
                fat={item.fat}
                sugar={item.sugar}
                sodium={item.sodium}
                fiber={item.fiber}
                carbs={item.carbs}
                instruction={item.instruction}
              />
            ))
          ) : (
            <p className="text-gray-500 text-lg">No data to show</p>
          )}
        </div>
      </div>
    </>
  );
};

export default DietRecommended;
