import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Home from './pages/home';
import Unidades from './pages/unidades';
import Pets from './pages/meuspets';
import Teste from './pages/teste'

export default function Navigation() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/unidades/:id' element={<Unidades />} />
                <Route path='/meuspets' element={<Pets />}/>
                <Route path='/teste' element={<Teste />}/>
            </Routes>
        </BrowserRouter>
    )
}