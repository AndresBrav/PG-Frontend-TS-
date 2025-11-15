import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TokenProvider } from "./Context/TokenProvider";
import Login from "./pages/users/Login";
import SignUp from "./pages/users/SignUp";
import Dashboard from "./pages/Games/Presentation/Dashboard";
import Ejercicio1 from "./pages/Games/Level1/Ejercicio1";
import Ejercicio2 from "./pages/Games/Level1/Ejercicio2";
import Ejercicio3 from "./pages/Games/Level1/Ejercicio3";
import Ejercicio4 from "./pages/Games/Level1/Ejercicio4";
import Ejercicio5 from "./pages/Games/Level1/Ejercicio5";

function App() {
    return (
        <>
            <TokenProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/registro" element={<SignUp />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/ejercicio1" element={<Ejercicio1 />} />
                        <Route path="/ejercicio2" element={<Ejercicio2 />} />
                        <Route path="/ejercicio3" element={<Ejercicio3 />} />
                        <Route path="/ejercicio4" element={<Ejercicio4 />} />
                        <Route path="/ejercicio5" element={<Ejercicio5 />} />
                    </Routes>
                </BrowserRouter>
            </TokenProvider>
        </>
    );
}

export default App;
