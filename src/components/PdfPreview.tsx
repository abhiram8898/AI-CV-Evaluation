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
      <iframe
        className="w-full h-80 border-none bg-white"
        title={label}
        src={zoomed}
      />
    </div>
  );
}
