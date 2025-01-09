import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

function IntroCard({ setOpencard }) {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="relative w-[500px] h-[200px] bg-[#2c322f] rounded-3xl p-6 flex flex-col justify-between">
        <h1 className="text-white text-center mb-6">
          Get started to track your adventure by clicking on the map !!
        </h1>
        <button
          onClick={() => setOpencard(false)}
          className="self-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 hover:scale-110 hover:-translate-y-1 transition-transform duration-200 ease-out"
        >
          Get started
        </button>
      </div>
    </div>
  );
}

export default IntroCard;
