import { Routes, Route, useLocation } from 'react-router-dom';
import DisplayConvos from './DisplayConvos';
import ProfileSearch from './ProfileSearch';
import {Link} from 'react-router-dom';

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
        <Routes>
            <Route path="/" element={<ProfileSearch cookie={cookie} />} />
            <Route path="/linkedin-messages" element={<DisplayConvos />} />

        </Routes>
        </>
    );
}
export default App;  