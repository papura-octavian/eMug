import { useEffect, useState } from "react";
import api from "../api/axios";

function CategoryList() {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        api
            .get("/categories")
            .then((res) => setCategories(res.data))
            .catch(() => setError("Nu am putut încarca categoriile."));
    }, []);

    if (error) return <p>{error}</p>;

    return (
        <ul>
            {categories.map((c) => (
                <li key={c.id}>{c.name}</li>
            ))}
        </ul>
    );
}

export default CategoryList;