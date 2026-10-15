import { Link } from "react-router-dom";

function ProductCard({ product }) {
    return (
        <Link to={`/products/${product.id}`} className="product-card">
            <div className="product-img">
                {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} />
                ) : (
                    <span>Fara poza</span>
                )}
            </div>
            <div className="product-body">
                <span className="product-category">{product.category?.name}</span>
                <h3>{product.name}</h3>
                <div className="product-bottom">
                    <span className="price">{product.price.toFixed(2)} lei</span>
                    <span className={product.stock > 0 ? "stock" : "stock out"}>
                        {product.stock > 0 ? "In stoc" : "Stoc epuizat"}
                    </span>
                </div>
            </div>
        </Link>
    );
}

export default ProductCard;