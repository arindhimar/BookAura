import { useState } from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

// Import styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

export default function PDFViewer() {
  const [fileUrl, setFileUrl] = useState("/sample.pdf");

  // Move the plugin inside the component
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>PDF Viewer</h2>

      <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.js">
        <div style={{ border: "1px solid #ccc", height: "700px" }}>
          <Viewer fileUrl={fileUrl} plugins={[defaultLayoutPluginInstance]} />
        </div>
      </Worker>
    </div>
  );
}
