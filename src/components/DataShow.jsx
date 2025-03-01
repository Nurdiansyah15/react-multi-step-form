const DataShow = ({ isOpen, onClose, title, message, data }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <p className="mb-4">{message}</p>

        {data && (
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DataShow;
