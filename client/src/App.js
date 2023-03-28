import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import ProfileSearch from './ProfileSearch';

function App() {
    
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const cookie = searchParams.get('cookie');

    return (
        <>
        <p>Hi!</p>
        <Router>
            <Routes>
                <Route path="/" element={<ProfileSearch cookie={cookie}/>} />
            </Routes>
        </Router>
        </>
    );
}
export default App;  