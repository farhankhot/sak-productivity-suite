import { Routes, Route, useLocation } from 'react-router-dom';
import ProfileSearch from './ProfileSearch';

function App() {

    const { search } = useLocation();
    const searchParams = new URLSearchParams(search);

    // get all parameters
    const cookie = {};
    for (const [key, value] of searchParams.entries()) {
        cookie[key] = value;
    }
    // console.log(cookie);

    return (
        <>
        <p>Hi!</p>
            <Routes>
                <Route path="/" element={<ProfileSearch cookie={cookie} />} />
            </Routes>
        </>
    );
}
export default App;  