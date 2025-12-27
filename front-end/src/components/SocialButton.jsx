export default function SocialButton({ icon, alt, onClick }) {
    return (
      <button
        onClick={onClick}
        className="w-12 h-12 flex items-center justify-center border rounded-full hover:bg-gray-100 transition"
      >
        <img src={icon} alt={alt} className="w-6 h-6" />
      </button>
    );
  }
  