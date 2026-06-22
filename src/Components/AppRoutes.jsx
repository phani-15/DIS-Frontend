import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from '../Pages/Home';
import NotFound from '../Pages/NotFound';
import Header from './Header';

function AppRoutes() {
    return (
        <>
            <Header />
            <main className='grow'>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='*' element={<NotFound />} />
                </Routes>
            </main>
        </>
    );
}

export default AppRoutes;