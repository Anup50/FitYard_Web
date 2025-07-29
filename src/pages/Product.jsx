import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import RelatedProduct from "../components/RelatedProduct";
import { sanitizeText, sanitizeURL } from "../utils/sanitizer";
import SafeHTML from "../components/SafeHTML";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, cartItems, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");

  const fetchProductData = async () => {
    products.map((item) => {
      if (item._id === productId) {
        setProductData(item);
        setImage(item.image[0]);

        return null;
      }
    });
  };

  useEffect(() => {
    fetchProductData();
  }, [productId]);

  return productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/* PRODUCT DATA */}
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/* PRODUCT IMAGES */}

        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {productData.image.map((item, i) => (
              <img
                src={sanitizeURL(item)}
                key={i}
                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
                alt={`Product image ${i + 1}`}
                onClick={() => setImage(sanitizeURL(item))}
                onError={(e) => {
                  e.target.src = "/placeholder-product.png"; // Fallback image
                }}
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%]">
            <img
              src={sanitizeURL(image)}
              className="w-full h-auto"
              alt={sanitizeText(productData.name)}
              onError={(e) => {
                e.target.src = "/placeholder-product.png"; // Fallback image
              }}
            />
          </div>
        </div>

        {/* PRODUCT INFO */}
        <div className="flex-1 ">
          <h1 className="font-medium text-2xl my-2">
            {sanitizeText(productData.name)}
          </h1>
          <div className="flex items-center gap-1 mt-2">
            <img className="w-3.5" src={assets.star_icon} alt="star" />
            <img className="w-3.5" src={assets.star_icon} alt="star" />
            <img className="w-3.5" src={assets.star_icon} alt="star" />
            <img className="w-3.5" src={assets.star_icon} alt="star" />
            <img className="w-3.5" src={assets.star_dull_icon} alt="star" />
            <p className="pl-2">(122)</p>
          </div>
          <p className="mt-5 text-3xl font-medium">
            {currency}
            {sanitizeText(String(productData.price))}
          </p>
          <SafeHTML
            html={productData.description}
            className="mt-5 text-gray-500 md:w-4/5"
            sanitizeOptions={{
              ALLOWED_TAGS: ["p", "br", "strong", "em", "b", "i"],
              ALLOWED_ATTR: [],
            }}
          />
          <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2">
              {productData.sizes.map((item, i) => (
                <button
                  className={`border py-2 px-4 bg-gray-100 ${
                    item === size ? "border-orange-500" : ""
                  }`}
                  key={i}
                  onClick={() => setSize(sanitizeText(item))}
                >
                  {sanitizeText(item)}
                </button>
              ))}
            </div>
          </div>

          <button
            className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
            onClick={() => addToCart(productData._id, size)}
          >
            ADD TO CART
          </button>
          <hr className="mt-8 sm:w-4/5" />

          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original Product.</p>
            <p>Cash o delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* DESCRIPTION AND REVIEW SECTION */}
      <div className="mt-20">
        <div className="flex">
          <b className="border px-5 py-3 text-sm ">Description</b>
          <p className="border px-5 py-3 text-sm ">Reviews (122)</p>
        </div>
        <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae
            dolor, consequuntur totam nostrum praesentium distinctio accusamus
            assumenda architecto alias veritatis autem. Non facilis alias
            quaerat quasi cumque nisi. Suscipit cupiditate perspiciatis
            laudantium error quibusdam facere, praesentium delectus cum rerum
            tempore laboriosam temporibus. Id voluptatibus quia, optio provident
            nesciunt debitis. Harum!
          </p>
          <p>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Qui quos
            deleniti corrupti dolore commodi deserunt, dicta ipsam ex nemo
            animi.
          </p>
        </div>
      </div>

      {/* DISPLAY RELATED PRODUCTS */}
      <RelatedProduct
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;
