import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Home from './pages/home';
import Unidades from './pages/unidades';
import Pets from './pages/meuspets';
import Teste from './pages/teste'
import Agendamentos from './pages/agendamentos';
import NaoEncontrada from './pages/naoEncontrada'

export default function Navigation() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/unidades/:id' element={<Unidades />} />
                <Route path='/meuspets' element={<Pets />}/>
                <Route path='/teste' element={<Teste />}/>
                <Route path = '/agendamentos' element={<Agendamentos/>}/>
                <Route path='*' element={<NaoEncontrada/>}/>
            </Routes>
        </BrowserRouter>
    )
}