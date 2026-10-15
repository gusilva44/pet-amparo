import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Home from './pages/home';
import Unidades from './pages/unidades';
import Pets from './pages/meuspets';

export default function Navigation() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/unidades' element={<Unidades />} />
                <Route path='/meuspets' element={<Pets />}/>
            </Routes>
        </BrowserRouter>
    )
}