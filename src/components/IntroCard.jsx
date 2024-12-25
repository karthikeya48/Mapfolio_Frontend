import TypewriterComponent from "typewriter-effect";
import { auth } from "../backend/firebase";
function IntroCard() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-[500px] h-[300px] bg-[#2c322f] rounded-3xl ">
        <h1 className=" relative top-[20px] left-[20px] text-white font-medium ">
          Hi,{" "}
          <span className="text-blue-400">{auth.currentUser.displayName}</span>
        </h1>
        <h2 className="relative top-[30px] left-[20px] text-white font-medium">
          Welcome to mapfolio
        </h2>
        <h3 className="relative top-[40px] left-[20px] text-white font-medium">
          Get started for making your memories noted of the <br />
          places that you have travelled.
        </h3>
        <h4 className="relative top-[50px] left-[20px] text-white font-medium">
          Click on to the map to get the location on to your memories.
        </h4>
        <button className="relative mt-8 text-white bg-blue-500 left-[20px] top-[60px] px-4 py-2 rounded-md hover:bg-blue-700">
          Get Started
        </button>
      </div>
    </div>
  );
}

export default IntroCard;
