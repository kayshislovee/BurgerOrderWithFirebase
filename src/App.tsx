import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import BurgerOrder from "./pages/pesanburger";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/pesanburger" />
          } />
          <Route path="/pesanburger" element={<BurgerOrder />} />
          <Route path="*" element={<Navigate to="/pesanburger" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}