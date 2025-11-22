import useSyncUser from "./hooks/useSyncUser";
import NewNav from "./components/newNav.jsx";

function App() {
  useSyncUser(); // 👈 automatically runs sync after login

  return (
    <div>
      <NewNav />
      <h1>Welcome to StudentStarter+</h1>
    </div>
  );
}

export default App;
