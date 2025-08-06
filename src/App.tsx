import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TokenProvider } from "./Context/TokenProvider";
import Login from "./pages/users/Login";
import SignUp from "./pages/users/SignUp";
import Dashboard from "./pages/Games/Presentation/Dashboard";

function App() {
    return (
        <>
            <TokenProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/registro" element={<SignUp />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                    </Routes>
                </BrowserRouter>
            </TokenProvider>
        </>
    );
}

export default App;
