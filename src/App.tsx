import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./components/users/Login";
import SignUp from "./components/users/SignUp";
import { TokenProvider } from "./components/Context/TokenProvider";

function App() {
    return (
        <>
            <TokenProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/registro" element={<SignUp />} />
                    </Routes>
                </BrowserRouter>
            </TokenProvider>
        </>
    );
}

export default App;
