import { Routes, Route } from 'react-router-dom';
import ProfileSearch from './ProfileSearch';

function App() {
    return (
        <div>
            <Routes>
                <Route path="/profile-search" element={<ProfileSearch />} />
            </Routes>
        </div>
    );
}
export default App;  