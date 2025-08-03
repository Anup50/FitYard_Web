import { useState } from "react";
import { sanitizeText } from "../utils/sanitizer";
import { toast } from "react-toastify";

const NewsletterBox = () => {
  const [email, setEmail] = useState("");

  const onSubmitHandler = (e) => {
    e.preventDefault();

    const sanitizedEmail = sanitizeText(email.trim().toLowerCase());

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    toast.success("Thank you for subscribing to our newsletter!");
    setEmail("");
  };

  const handleEmailChange = (e) => {
    const sanitizedValue = sanitizeText(e.target.value);
    setEmail(sanitizedValue);
  };

  return (
    <div className="text-center">
      <p className="text-2xl font-medium text-gray-800">
        Subscribe now & get 20% off
      </p>
      <p className="text-gray-400 mt-3">
        Stay updated with our latest fitness wear collections, exclusive deals,
        and workout tips!
      </p>

      <form
        onSubmit={onSubmitHandler}
        className="w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3"
      >
        <input
          type="email"
          placeholder="Enter your email."
          className="w-full sm:flex-1 outline-none"
          value={email}
          onChange={handleEmailChange}
          required
        />
        <button
          type="submit"
          className="bg-black text-white text-xs px-1 py-4 "
        >
          SUBSCRIBE
        </button>
      </form>
    </div>
  );
};

export default NewsletterBox;
