import { Route, Routes, BrowserRouter } from 'react-router-dom'
import Home from './pages/home'
import Unidades from './pages/unidades';

export default function Navigation() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/unidades' element={<Unidades />} />
            </Routes>
        </BrowserRouter>
    )
}