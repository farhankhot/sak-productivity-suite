import { Routes, Route } from 'react-router-dom';
import ProfileSearch from './ProfileSearch';

function App() {
    return (
        <Router>        
            <div>
                <Routes>
                    <Route path="/profile-search" element={<ProfileSearch />} />
                </Routes>
            </div>
        </Router>
    );
}
export default App;  