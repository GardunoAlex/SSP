import useSyncUser from "./hooks/useSyncUser";
import Navbar from "./components/Navbar";

function App() {
  useSyncUser(); // 👈 automatically runs sync after login

  return (
    <div>
      <Navbar />
      <h1>Welcome to StudentStarter+</h1>
    </div>
  );
}

export default App;
