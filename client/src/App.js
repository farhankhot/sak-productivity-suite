import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import ProfileSearch from './ProfileSearch';

function App() {

    const {cookie} = useParams();
    console.log(cookie);

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