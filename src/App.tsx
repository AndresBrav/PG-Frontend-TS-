import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from 'react-router-dom';
import { TokenProvider } from './Context/TokenProvider';
import { UsuarioProvider } from './Context/UsuarioProvider';
import RutaProtegida from './components/rutas/RutaProtegida';
import RutaPorRol from './components/rutas/RutaPorRol';
import RutaPublica from './components/rutas/RutaPublica';
import Login from './pages/users/Login';
import SignUp from './pages/users/SignUp';
import DashboardInicio from './pages/Home/DashboardInicio';
import DetalleGrupo from './pages/Profesor/DetalleGrupo';
import DetalleEstudiante from './pages/Profesor/DetalleEstudiante';
import PanelAdmin from './pages/Admin/PanelAdmin';
import Dashboard from './pages/Games/Presentation/Dashboard';
import Ejercicio1 from './pages/Games/Level1/Ejercicio1';
import Ejercicio2 from './pages/Games/Level1/Ejercicio2';
import Ejercicio3 from './pages/Games/Level1/Ejercicio3';
import Ejercicio4 from './pages/Games/Level1/Ejercicio4';
import Ejercicio5 from './pages/Games/Level1/Ejercicio5';
import EjercicioP1 from './pages/Games/Nivel2/EjercicioP1';
import EjercicioP2 from './pages/Games/Nivel2/EjercicioP2';
import EjercicioP3 from './pages/Games/Nivel2/EjercicioP3';
import EjercicioP4 from './pages/Games/Nivel2/EjercicioP4';
import EjercicioP5 from './pages/Games/Nivel2/EjercicioP5';
import EjercicioP6 from './pages/Games/Nivel2/EjercicioP6';
import EjercicioP7 from './pages/Games/Nivel2/EjercicioP7';
import EjercicioP8 from './pages/Games/Nivel2/EjercicioP8';
import EjercicioP9 from './pages/Games/Nivel2/EjercicioP9';
import EjercicioP10 from './pages/Games/Nivel2/EjercicioP10';
import DesignBoard from './pages/Games/GeneradosPorIA/DesignBoard';
import DashboardIA from './pages/Games/GeneradosPorIA/DashboardIA';
import EditingBoard from './pages/Games/GeneradosPorIA/EditingBoard/EditingBoard';
import GruposInicio from './pages/Grupos/GruposInicio';
import GrupoDetalle from './pages/Grupos/GrupoDetalle';
import TableroDiagramaGrupo from './pages/Grupos/tableros/TableroDiagramaGrupo';
import TableroPseudocodigoGrupo from './pages/Grupos/tableros/TableroPseudocodigoGrupo';

function App() {
    return (
        <>
            <TokenProvider>
                <UsuarioProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    <RutaPublica>
                                        <Login />
                                    </RutaPublica>
                                }
                            />
                            <Route
                                path="/registro"
                                element={
                                    <RutaPublica>
                                        <SignUp />
                                    </RutaPublica>
                                }
                            />

                            <Route element={<RutaProtegida />}>
                                <Route
                                    path="/dashboard"
                                    element={<DashboardInicio />}
                                />
                                <Route
                                    path="/ejercicios"
                                    element={<Dashboard />}
                                />
                                <Route
                                    path="/ejercicios-ia"
                                    element={<DashboardIA />}
                                />
                                <Route
                                    path="/dashboardIA"
                                    element={
                                        <Navigate
                                            to="/ejercicios-ia"
                                            replace
                                        />
                                    }
                                />
                                <Route
                                    path="/ejercicio1"
                                    element={<Ejercicio1 />}
                                />
                                <Route
                                    path="/ejercicio2"
                                    element={<Ejercicio2 />}
                                />
                                <Route
                                    path="/ejercicio3"
                                    element={<Ejercicio3 />}
                                />
                                <Route
                                    path="/ejercicio4"
                                    element={<Ejercicio4 />}
                                />
                                <Route
                                    path="/ejercicio5"
                                    element={<Ejercicio5 />}
                                />
                                <Route
                                    path="/ejercicio1-pseudocodigo"
                                    element={<EjercicioP1 />}
                                />
                                <Route
                                    path="/ejercicio2-pseudocodigo"
                                    element={<EjercicioP2 />}
                                />
                                <Route
                                    path="/ejercicio3-pseudocodigo"
                                    element={<EjercicioP3 />}
                                />
                                <Route
                                    path="/ejercicio4-pseudocodigo"
                                    element={<EjercicioP4 />}
                                />
                                <Route
                                    path="/ejercicio5-pseudocodigo"
                                    element={<EjercicioP5 />}
                                />
                                <Route
                                    path="/ejercicio6-pseudocodigo"
                                    element={<EjercicioP6 />}
                                />
                                <Route
                                    path="/ejercicio7-pseudocodigo"
                                    element={<EjercicioP7 />}
                                />
                                <Route
                                    path="/ejercicio8-pseudocodigo"
                                    element={<EjercicioP8 />}
                                />
                                <Route
                                    path="/ejercicio9-pseudocodigo"
                                    element={<EjercicioP9 />}
                                />
                                <Route
                                    path="/ejercicio10-pseudocodigo"
                                    element={<EjercicioP10 />}
                                />
                                <Route
                                    path="/designboard"
                                    element={<DesignBoard />}
                                />
                                <Route
                                    path="/editingboard"
                                    element={<EditingBoard />}
                                />
                                <Route
                                    path="/grupos"
                                    element={<GruposInicio />}
                                />
                                <Route
                                    path="/grupos/:id"
                                    element={<GrupoDetalle />}
                                />
                                <Route
                                    path="/grupos/:id/ejercicios/:ejercicioId/diagrama"
                                    element={<TableroDiagramaGrupo />}
                                />
                                <Route
                                    path="/grupos/:id/ejercicios/:ejercicioId/pseudocodigo"
                                    element={<TableroPseudocodigoGrupo />}
                                />

                                <Route
                                    element={
                                        <RutaPorRol
                                            roles={['profesor', 'admin']}
                                        />
                                    }
                                >
                                    <Route
                                        path="/grupos/:id/reporte"
                                        element={<DetalleGrupo />}
                                    />
                                    <Route
                                        path="/estudiantes/:id"
                                        element={<DetalleEstudiante />}
                                    />
                                </Route>

                                <Route
                                    element={
                                        <RutaPorRol roles={['admin']} />
                                    }
                                >
                                    <Route
                                        path="/admin"
                                        element={<PanelAdmin />}
                                    />
                                </Route>
                            </Route>
                        </Routes>
                    </BrowserRouter>
                </UsuarioProvider>
            </TokenProvider>
        </>
    );
}

export default App;
