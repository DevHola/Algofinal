import React from 'react';
import { BrowserRouter as Router, Routes, Route}
    from 'react-router-dom';
import Home from './screens/Home';
import Login from './screens/Login';
  
function App() {
return (
    <Router>
    <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login/>} />
    </Routes>
    </Router>
);
}
  
export default App;