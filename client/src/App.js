import React, {useState, useEffect} from "react";
import { Routes, Route, useLocation} from 'react-router-dom';
import Home from "./Home";
import DisplayConvos from './DisplayConvos';
import ProfileSearch from './ProfileSearch';
import NavbarComponent from './NavbarComponent';
import DisplaySearchResults from "./DisplaySearchResults";
import DisplayThread from "./DisplayThread";
import ZoomInfoSearch from "./ZoomInfoSearch";
import DisplayZoomInfoSearchResults from "./DisplayZoomInfoSearchResults";

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
            {sessionId && <Route path="/" element={<Home sessionId={sessionId} />} /> }

            {sessionId && <Route path="/linkedin-search" element={<ProfileSearch sessionId={sessionId} />} /> }
            <Route path="/display-linkedin-search-results" element={<DisplaySearchResults />} /> 
            
            {sessionId && <Route path="/display-thread" element={<DisplayThread />} /> }
            {sessionId && <Route path="/linkedin-messages" element={<DisplayConvos sessionId={sessionId} />} /> }

            {sessionId && <Route path="/zoominfo-search" element={<ZoomInfoSearch sessionId={sessionId} />} /> }
            <Route path="/display-zoominfo-search-results" element={<DisplayZoomInfoSearchResults />} /> 
            
            
        </Routes>
        </>
    );
}
export default App;  