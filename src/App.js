import React from 'react';
import AuthPage from './components/AuthPage';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminPanel from "./components/AdminPanel";
import UserPanel from "./components/UserPanel";
import './App.css';
import SchedulePanel from './components/SchedulePanel';
import AdminSchedulePanel from './components/AdminSchedulePanel';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/schedule" element={<SchedulePanel />} />
        <Route path="/adminschedule" element={<AdminSchedulePanel />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/user/:id" element={<UserPanel />} />
        <Route path="/workshops/:user_id" element={<SchedulePanel />} />
      </Routes>
    </Router>
  );
}

export default App;
