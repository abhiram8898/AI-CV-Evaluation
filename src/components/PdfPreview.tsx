interface PdfPreviewProps {
  objectUrl: string | null;
  label?: string;
  size?: "small" | "medium" | "large";
}

export default function PdfPreview({
  objectUrl,
  label = "CV Preview",
  size = "medium",
}: Readonly<PdfPreviewProps>) {
  if (!objectUrl) return null;

  const zoomed =
    objectUrl + (objectUrl.includes("#") ? "&" : "#") + "zoom=page-width";

  const heightClass = {
    small: "h-80",
    medium: "h-96",
    large: "min-h-[800px]",
  }[size];

  return (
    <div className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-lg">
      <iframe
        className={`w-full ${heightClass} border-none`}
        title={label}
        src={zoomed}
      />
    </div>
  );
}
