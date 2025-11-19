interface PdfPreviewProps {
  objectUrl: string | null;
  label?: string;
}

export default function PdfPreview({
  objectUrl,
  label = "CV Preview",
}: Readonly<PdfPreviewProps>) {
  if (!objectUrl) return null;

  const zoomed =
    objectUrl + (objectUrl.includes("#") ? "&" : "#") + "zoom=page-width";

  return (
    <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
      <header className="flex items-center gap-2 px-4 py-3 bg-white/10 text-black text-sm font-semibold border-b border-white/10">
        <i className="fa-solid fa-file-pdf text-red-400 text-sm"></i>
        {label}
      </header>
      <iframe
        className="w-full h-80 border-none bg-white"
        title={label}
        src={zoomed}
      />
    </div>
  );
}
