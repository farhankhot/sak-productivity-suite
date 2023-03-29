import React, {useState, useEffect} from "react";
import { Routes, Route, useLocation} from 'react-router-dom';
import DisplayConvos from './DisplayConvos';
import ProfileSearch from './ProfileSearch';
import NavbarComponent from './NavbarComponent';
import DisplaySearchResults from "./DisplaySearchResults";

function App() {

    const { search } = useLocation();
    const [sessionId, setSessionId] = useState("");

    const val = search.split("=")[1];
    useEffect(() => {
		setSessionId(val);
	}, []);

    return (
        <>
        <NavbarComponent />
        <Routes>
            {sessionId && <Route path="/linkedin-search" element={<ProfileSearch sessionId={sessionId} />} /> }
            {sessionId && <Route path="/linkedin-messages" element={<DisplayConvos sessionId={sessionId} />} /> }
            <Route path="/display-linkedin-search-results" element={<DisplaySearchResults />} /> 

        </Routes>
        </>
    );
}
export default App;  