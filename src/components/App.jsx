import { signInWithGoogle } from "../backend/firebase";

function App() {
  return (
    <div>
      <button onClick={signInWithGoogle} className="">
        Sign with google
      </button>
      <h1>{localStorage.getItem("name")}</h1>
      <h1>{localStorage.getItem("email")}</h1>
      <img src={localStorage.getItem("profile")}></img>
    </div>
  );
}

export default App;
