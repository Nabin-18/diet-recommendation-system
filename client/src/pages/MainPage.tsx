import { Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";

const MainPage = () => {
  return (
    <>
      <div className="flex h-[100%]">
        <div className="w-[20%] border shadow-2xl rounded-2xl border-e-shadow-color h-full flex flex-col gap-8 items-center p-8">
          <div className="w-full">
            <Link to={"diet-recommend"}>
              <Button className="cursor-pointer w-full rounded-[8px] font-bold">
                Diet Recommendation
              </Button>
            </Link>
          </div>
          <div className="w-full">
            <Link to={"dashboard"}>
              <Button className="cursor-pointer w-full rounded-[8px] font-bold">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
        <div className="w-[80%] bg-gray-100 p-4">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default MainPage;
