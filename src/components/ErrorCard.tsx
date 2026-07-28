export default function ErrorCard({ error }: { error: string }) {
  return (
    <div className="p-6 bg-white/5 border border-gray-300 rounded-lg max-w-md mx-auto">
      <p className="text-center text-xl font-bold text-red-600">
        🚨 Fehler: {error}
      </p>
      {error.includes('No data') && (
        <p className="text-sm text-gray-600">
          Bitte nach einer kleinen Weile erneut versuchen
        </p>
      )}
    </div>
  );
}