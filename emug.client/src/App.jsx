import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProductsPage from "./pages/AdminProductsPage";
import ProductFormPage from "./pages/ProductFormPage";

function App() {
    return (
        <div>
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/admin/products" element={
                    <ProtectedRoute adminOnly>
                        <AdminProductsPage />
                    </ProtectedRoute> 
                } />
                <Route
                    path="/admin/products/new"
                    element={
                        <ProtectedRoute adminOnly>
                            <ProductFormPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/products/:id/edit"
                    element={
                        <ProtectedRoute adminOnly>
                            <ProductFormPage />
                        </ProtectedRoute>
                    }
                />

            </Routes>
        </div>
    );
}

export default App;