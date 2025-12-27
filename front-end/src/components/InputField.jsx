export default function InputField({
    label,
    type = "text",
    placeholder = "",
    value,
    onChange,
    name,
    autoComplete,
  }) {
    return (
      <div className="space-y-1">
        {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>
    );
  }
  