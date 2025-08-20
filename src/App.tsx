import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TokenProvider } from "./Context/TokenProvider";
import Login from "./pages/users/Login";
import SignUp from "./pages/users/SignUp";
import Dashboard from "./pages/Games/Presentation/Dashboard";
import Exercise1 from "./pages/Games/Level1/bigScreen/Exercise1";
import Exercise1Small from "./pages/Games/Level1/smallScreen/Exercise1Small";

function App() {
    return (
        <>
            <TokenProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/registro" element={<SignUp />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/exercise1" element={<Exercise1 />} />
                        <Route
                            path="/exercise1-small"
                            element={<Exercise1Small />}
                        />
                    </Routes>
                </BrowserRouter>
            </TokenProvider>
        </>
    );
}

export default App;
