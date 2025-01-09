import { useNavigate } from "react-router-dom";
import frontImage from "../assets/Front.png";
// import Typewriter from "typewriter-effect";

function Home() {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    navigate("/login");
  };
  return (
    <div
      className=" h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${frontImage})` }}
    >
      <div className="flex flex-col h-screen items-center justify-center top-[50%] text-center gap-5 w-full">
        <h1 className=" text-black font-bold text-3xl">
          {" "}
          You travel the World
        </h1>
        <h2 className=" text-black font-bold text-3xl">
          Mapfolio Let we track your adventure
        </h2>
        <h3 className="text-gray-700 font-medium text-xl w-[900px]">
          A world map that tracks your footsteps into every city you can think
          of. Never forget your wonderful experiences, and show your friends how
          you have wandered the world
        </h3>

        <button
          className="w-[120px] p-[10px] rounded-md bg-blue-500 hover:bg-blue-700 hover:scale-110 hover:-translate-y-1 transition-transform duration-200 ease-out"
          onClick={handleGetStarted}
        >
          GetStarted
        </button>
      </div>
    </div>
  );
}

export default Home;
