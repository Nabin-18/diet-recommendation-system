import { Outlet, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const MainPage = () => {
  return (
    <>
      <div className="sm:hidden lg:flex h-[100%]   ">
        <div className="w-[100%] border shadow-2xl rounded-2xl border-e-shadow-color h-full  flex-col flex gap-8 items-center p-8 lg:w-[20%] ">
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
          <div className="w-full">
            <Link to={"chat-bot"}>
              <Button className="cursor-pointer w-full rounded-[8px] font-bold">
                Virtual Doctor
              </Button>
            </Link>
          </div>
        </div>

        <div className="w-[100%] bg-gray-100 p-4">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default MainPage;
