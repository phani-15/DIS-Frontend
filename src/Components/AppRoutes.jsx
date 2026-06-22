import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from '../Pages/Home';
import NotFound from '../Pages/NotFound';
import Header from './Header';
import AddEvent from '../Pages/AddEvent';

function AppRoutes() {
    return (
        <>
            <Header />
            <main className='grow'>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/add' element={<AddEvent/>}/>

                    <Route path='*' element={<NotFound />} />
                </Routes>
            </main>
        </>
    );
}

export default AppRoutes;