export default function SocialButton({ icon, label }) {
  return (
    <button className="flex items-center justify-center gap-2 w-full bg-[#111] border border-gray-700 rounded-xl py-3 text-white hover:bg-gray-800 transition">
      {icon}
      {label}
    </button>
  );
}
