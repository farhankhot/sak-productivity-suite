import React, {useState, useEffect} from "react";
import { Routes, Route, useLocation} from 'react-router-dom';
import DisplayConvos from './DisplayConvos';
import ProfileSearch from './ProfileSearch';
import NavbarComponent from './NavbarComponent';

function App() {

    const { search } = useLocation();
    const [sessionId, setSessionId] = useState("");

    // const cookie = {};
    // for (const [key, value] of searchParams.entries()) {
    //     cookie[key] = value;
    // }
    // console.log(cookie);

    const val = search.split("=")[1];
    console.log("val", val);

    useEffect(() => {
		setSessionId(val);
	}, []);

    return (
        <>
        <NavbarComponent sessionId={sessionId} />
        <Routes>
            {sessionId && <Route path="/linkedin-search" element={<ProfileSearch sessionId={sessionId} />} /> }
            <Route path="/linkedin-messages" element={<DisplayConvos />} />
        </Routes>
        </>
    );
}
export default App;  