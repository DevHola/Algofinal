import React from 'react';
import { BrowserRouter as Router, Routes, Route}
    from 'react-router-dom';
import Home from './screens/Home';
import Login from './screens/Login';
import Pagenotfound from './screens/Pagenotfound';

  
function App() {
return (
    <Router>
    <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login/>} />
        <Route path='*' element={<Pagenotfound/>} />
    </Routes>
    </Router>
);
}
  
export default App;