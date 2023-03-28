import { Routes, Route, useLocation } from 'react-router-dom';
import DisplayConvos from './DisplayConvos';
import ProfileSearch from './ProfileSearch';
import {Link} from 'react-router-dom';
import NavbarComponent from './NavbarComponent';

function App() {

    const { search } = useLocation();
    const searchParams = new URLSearchParams(search);

    // const cookie = {};
    // for (const [key, value] of searchParams.entries()) {
    //     cookie[key] = value;
    // }
    // console.log(cookie);

    const sessionId = searchParams.get("sessionId")

    return (
        <>
        <NavbarComponent />
        <Routes>
            <Route path="/linkedin-search" element={<ProfileSearch sessionId={sessionId} />} />
            <Route path="/linkedin-messages" element={<DisplayConvos />} />
        </Routes>
        </>
    );
}
export default App;  