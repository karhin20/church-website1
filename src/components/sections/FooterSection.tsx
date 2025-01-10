import { Link } from "react-router-dom";
import { Map, Phone, Mail, Facebook, Youtube } from "lucide-react";

export const FooterSection = () => {
  return (
    <footer className="bg-church-primary text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-bold mb-6">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Map className="w-5 h-5 mr-3 text-church-secondary" />
                <p>Nii Boiman West Road, Accra, Ghana</p>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-church-secondary" />
                <p>+233 24 123 4567</p>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-church-secondary" />
                <p>ahwcniiboiman@gmail.com</p>
              </div>
            </div>
            {/* Social Media Links */}
            <div className="flex space-x-4 mt-6">
              <SocialLink
                href="https://facebook.com/tac.niiboimancentral"
                icon={<Facebook className="w-5 h-5" />}
              />
              <SocialLink
                href="https://www.youtube.com/channel/UCjK_4V8MBc3YER-Utfk8QDA"
                icon={<Youtube className="w-5 h-5" />}
              />
              <SocialLink
                href="https://tiktok.com/@tacniiboiman"
                icon={<TiktokIcon />}
              />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6">Quick Links</h3>
            <div className="space-y-3">
              <Link
                to="/about"
                className="block hover:text-church-secondary transition-colors"
              >
                About Us
              </Link>
              <Link
                to="/sermons"
                className="block hover:text-church-secondary transition-colors"
              >
                Sermons
              </Link>
              <Link
                to="/events"
                className="block hover:text-church-secondary transition-colors"
              >
                Events
              </Link>
              <Link
                to="/contact"
                className="block hover:text-church-secondary transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Map and Location Sharing */}
          <div>
            <h3 className="text-xl font-bold mb-6">
              Location & Social Media
            </h3>
            <div className="mb-6 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.7358124867687!2d-0.2572909243561401!3d5.605986433143636!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9907a958ff31%3A0x6bf8d0c7685caae6!2sThe%20Apostolic%20Church%20Nii%20Boiman%20Assembly!5e0!3m2!1sen!2sgh!4v1733188166229!5m2!1sen!2sgh"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            {/* Share Button */}
            <div className="mb-4">
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator
                      .share({
                        title:
                          "The Apostolic Church - Nii Boiman Central Assembly",
                        text: "Check out our location!",
                        url: "https://www.google.com/maps/place/The+Apostolic+Church+Nii+Boiman+Assembly/@5.6059864,-0.2572909,17z/data=!3m1!4b1!4m6!3m5!1s0xfdf9907a958ff31:0x6bf8d0c7685caae6!8m2!3d5.6059864!4d-0.254706!16s%2Fg%2F11h1444_4f?entry=ttu", // Replace with your desired URL
                      })
                      .then(() => console.log("Successful share"))
                      .catch((error) => console.log("Error sharing:", error));
                  } else {
                    // Fallback for browsers that do not support the Web Share API
                    alert("Web Share API is not supported in your browser.");
                  }
                }}
                className="bg-church-secondary text-church-primary px-4 py-2 rounded-md hover:bg-church-secondary/90 transition-colors"
              >
                Share Location
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p>
            &copy; {new Date().getFullYear()} The Apostolic Church - Ghana, Nii
            Boiman Central Assembly. All rights reserved.
            <span className="block mt-2 font-bold text-yellow-500">
              Contact the Developers:{" "}
              <a href="tel:+233543119117">0543 119 117</a>
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

const SocialLink = ({
  href,
  icon,
}: {
  href: string;
  icon: React.ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-church-secondary text-church-primary p-2 rounded-full hover:bg-church-secondary/90 transition-colors"
  >
    {icon}
  </a>
);

const TiktokIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);