import bgImage from "../assets/bgImage.png";
import { BugPlay } from "lucide-react";

function NotFound() {
  return (
    <>
      <div
        style={{ backgroundImage: `url(${bgImage})` }}
        className="flex flex-col items-center justify-center w-full min-h-screen bg-repeat bg-current"
      >
        <div className="flex flex-col gap-3 w-fit items-center bg-slate-800 p-8 rounded-3xl shadow-[0_0_40px_4px_rgba(0,0,0,0.15)] shadow-blue-900/50">
          <BugPlay size={80} color="red" />
          <p className="text-5xl font-bold text-red-600 text">404</p>
          <p className="text-xl font-medium text-white">Page Not Found</p>
          <p className="text-center text-white max-w-md mt-3">
            We're sorry, the page you requested could not be found. It might
            have been moved or deleted. Please check the URL or navigate back to
            a known section of a site.
          </p>
          <div className="flex gap-4 mt-3">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg border-2 border-blue-500 font-semibold hover:border-2 hover:border-white">
              Go To Homepage
            </button>
            <button className="bg-black text-blue-500 px-4 py-2 rounded-lg border-2 border-black font-semibold hover:border-2 hover:border-blue-500">
              Go To Login
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default NotFound;
