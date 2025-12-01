import { FiMail, FiLock } from "react-icons/fi";

export default function InputField({ type, placeholder }) {
  const Icon = type === "email" ? FiMail : FiLock;

  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type={type}
        placeholder={placeholder}
        className="w-full bg-[#111] text-white rounded-lg py-3 pl-10 pr-3 border border-gray-700 focus:border-pink-500 outline-none"
      />
    </div>
  );
}
