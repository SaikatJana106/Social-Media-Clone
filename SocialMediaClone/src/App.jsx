import './App.css'
import Sidebar from './Components/Sidebar/Sidebar'
import Home from './Components/Home/Home'
import Chat from './Components/Chat/Chat'
import Savepost from './Components/Savepost/Savepost'
import People from './Components/People/People'
import Settings from './Components/setings/Settings'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginSignup from './Components/loginSignup/LoginSignup'
import Post from './Components/Post/Post'

function App() {
  return (
    <BrowserRouter>  {/* BrowserRouter should wrap all components using Link */}
      <div className="app-container">
        <div className="sidebar">
          <Sidebar />  {/* Sidebar should be inside BrowserRouter */}
        </div>
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/post" element={<Post />} />
            <Route path="/savepost" element={<Savepost />} />
            <Route path="/people" element={<People />} />
            <Route path="/setting" element={<Settings />} />
            <Route path="/signup" element={<LoginSignup/>} />
          </Routes>
        </div>
        <div className="people-section">
          <People/>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
