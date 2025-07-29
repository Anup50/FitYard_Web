import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsletterBox from "../components/NewsletterBox";
import { sanitizeURL, sanitizeText } from "../utils/sanitizer";

const About = () => {
  return (
    <div>
      <div className="text-2xl text-center pt-8 border-t">
        <Title text1={"ABOUT"} text2={"US"} />
      </div>

      <div className="my-10 flex flex-col md:flex-row gap-16">
        <img
          src={sanitizeURL(assets.about_img)}
          className="w-full md:max-w-[450px]"
          alt={sanitizeText("About us image")}
        />
        <div className="flex flex-col justify-center gap-6 md:w-2/4 text-gray-600">
          <p>
            Welcome to FitYard, your ultimate destination for premium fitness apparel and activewear. 
            Founded with a passion for fitness and fashion, we believe that the right workout gear can 
            transform not just your appearance, but your entire fitness journey. Our carefully curated 
            collection features high-performance athletic wear designed to move with you, whether you're 
            hitting the gym, running outdoors, or practicing yoga.
          </p>
          <p>
            At FitYard, we understand that fitness is a lifestyle, not just a hobby. That's why we've 
            partnered with leading brands and emerging designers to bring you innovative fabrics, 
            cutting-edge designs, and uncompromising quality that supports your active lifestyle 
            every step of the way.
          </p>

          <b className="text-gray-800">Our Mission</b>
          <p>
            To empower every individual on their fitness journey by providing premium, comfortable, 
            and stylish activewear that enhances performance and boosts confidence. We're committed 
            to helping you look good, feel great, and achieve your fitness goals.
          </p>
        </div>
      </div>

      <div className="text-xl py-4">
        <Title text1={"WHY"} text2={"CHOOSE US"} />
      </div>

      <div className="flex flex-col md:flex-row text-sm mb-20">
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Premium Quality:</b>
          <p className="text-gray-600">
            We carefully select high-performance fabrics and partner with trusted manufacturers 
            to ensure every piece meets our rigorous standards for durability, comfort, and style.
          </p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Perfect Fit Guarantee:</b>
          <p className="text-gray-600">
            Our comprehensive size guides and flexible return policy ensure you find the perfect fit 
            for your body type and workout style, making online shopping confident and convenient.
          </p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Fitness Community Support:</b>
          <p className="text-gray-600">
            Beyond just selling activewear, we're committed to supporting your fitness journey with 
            expert advice, workout tips, and a community of fitness enthusiasts who share your passion.
          </p>
        </div>
      </div>

      <NewsletterBox />
    </div>
  );
};

export default About;
