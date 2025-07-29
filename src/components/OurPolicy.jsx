import { assets } from "../assets/assets";
import { sanitizeURL, sanitizeText } from "../utils/sanitizer";

const OurPolicy = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-20 text-xs sm:text-sm md:text-base text-gray-700">
      <div>
        <img
          src={sanitizeURL(assets.exchange_icon)}
          className="w-12 m-auto mb-5"
          alt={sanitizeText("Exchange Policy")}
        />
        <p className="font-semibold"> Easy Exchange Policy</p>
        <p className="text-gray-400">We offer hassle free exchange policy.</p>
      </div>

      <div>
        <img
          src={sanitizeURL(assets.quality_icon)}
          className="w-12 m-auto mb-5"
          alt={sanitizeText("Return Policy")}
        />
        <p className="font-semibold"> 7 Days Return Policy</p>
        <p className="text-gray-400">We provide 7 days free return policy.</p>
      </div>

      <div>
        <img
          src={sanitizeURL(assets.support_img)}
          className="w-12 m-auto mb-5"
          alt={sanitizeText("Customer Support")}
        />
        <p className="font-semibold">Best Customer Support</p>
        <p className="text-gray-400">We provide 24/7 customer support.</p>
      </div>
    </div>
  );
};

export default OurPolicy;
