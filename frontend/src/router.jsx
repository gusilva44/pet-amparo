import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Home from './pages/home';
import Unidades from './pages/unidades';
import Pets from './pages/meuspets';
import Teste from './pages/teste'
import Agendamentos from './pages/agendamentos';
import NaoEncontrada from './pages/naoEncontrada'
import RotaProtegida from './components/rotaProtegida/rotaProtegida';
import Clientes from './components/admin/clientes';
import VisaoGeral from './components/admin/visaoGeral/visaoGeral';
import Veterinario from './pages/pagVeterinario';
import UnidadesAdmin from './components/admin/unidades';
import Servicos from './components/admin/servicos/servicos';
import Relatorios from './components/admin/relatorios/relatorios';

export default function Navigation() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/unidades/:id' element={<Unidades />} />
                <Route path='/meuspets' element={<Pets />}/>
                <Route path='/teste' element={<Teste />}/>
                <Route path ='/agendamentos' element={<Agendamentos/>}/>

                <Route element={<RotaProtegida tiposPermitidos={['admin']} />}>
                    <Route path='/usuarios' element={<Clientes />} />
                    <Route path='/visao' element={<VisaoGeral/>} />
                    <Route path='/unidades' element={<UnidadesAdmin />} />
                    <Route path='/servicos' element={<Servicos />} />
                    <Route path='/relatorios' element={<Relatorios />} />
                </Route>

                <Route element={<RotaProtegida tiposPermitidos={['veterinario']} />}>
                    <Route path='/admveterinario' element={<Veterinario/>} />
                </Route>

                <Route path='*' element={<NaoEncontrada/>}/>
            </Routes>
        </BrowserRouter>
    )
}
