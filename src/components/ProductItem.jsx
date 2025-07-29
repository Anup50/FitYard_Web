import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import { sanitizeText, sanitizeURL } from "../utils/sanitizer";

const ProductItem = ({ id, image, name, price }) => {
  const { currency } = useContext(ShopContext);

  // Sanitize inputs
  const safeName = sanitizeText(name);
  const safePrice =
    typeof price === "number" ? price : sanitizeText(String(price));
  const safeImageSrc =
    Array.isArray(image) && image[0] ? sanitizeURL(image[0]) : "";

  return (
    <Link to={`/product/${id}`} className="text-gray-700 cursor-pointer">
      <div className="overflow-hidden">
        <img
          src={safeImageSrc}
          alt={safeName}
          className="hover:scale-110 transition ease-in-out"
          onError={(e) => {
            e.target.src = "/placeholder-product.png"; // Fallback image
          }}
        />
      </div>
      <p className="pt-3 pb-1 text-sm">{safeName}</p>
      <p className="text-sm font-medium">
        {currency}
        {safePrice}
      </p>
    </Link>
  );
};

export default ProductItem;
