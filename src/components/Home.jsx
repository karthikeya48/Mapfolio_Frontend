import { useNavigate } from "react-router-dom";
function Home() {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    navigate("/login");
  };
  return (
    <div className="bg-black">
      <div className="flex flex-col h-screen items-center justify-center top-[50%] text-center gap-5 w-full">
        <h1 className=" text-blue-50 font-bold text-3xl">
          {" "}
          You travel the World
        </h1>
        <h2 className=" text-blue-50 font-bold text-3xl">
          Mapfolio Let we track you adventure
        </h2>
        <h3 className="text-gray-400 font-medium text-xl w-[900px]">
          A world map that tracks your footsteps into every city you can think
          of. Never forget your wonderful experiences, and show your friends how
          you have wandered the world
        </h3>

        <button
          className="w-[120px] p-[10px] rounded-md bg-green-600"
          onClick={handleGetStarted}
        >
          GetStarted
        </button>
      </div>
    </div>
  );
}

export default Home;
