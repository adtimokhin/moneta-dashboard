"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  Download,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Sample document data - replace with API call
const getDocumentById = (id) => {
  const documents = {
    1: {
      id: "1",
      name: "Invoice_2024_Q1.pdf",
      type: "pdf",
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      uploadedBy: "John Doe",
      uploadDate: "2024-03-15",
      size: "2.4 MB",
    },
    2: {
      id: "2",
      name: "Presentation_Slides.pptx",
      type: "pptx",
      url: "https://view.officeapps.live.com/op/embed.aspx?src=https://file-examples.com/wp-content/storage/2017/08/file_example_PPT_250kB.ppt",
      uploadedBy: "Jane Smith",
      uploadDate: "2024-03-14",
      size: "1.8 MB",
    },
    3: {
      id: "3",
      name: "Sample_Document.docx",
      type: "docx",
      url: "https://view.officeapps.live.com/op/embed.aspx?src=https://file-examples.com/wp-content/storage/2017/02/file-sample_100kB.doc",
      uploadedBy: "Mike Johnson",
      uploadDate: "2024-03-13",
      size: "100 KB",
    },
    4: {
      id: "4",
      name: "Company_Logo.png",
      type: "image",
      url: "https://via.placeholder.com/800x600/0066cc/ffffff?text=Company+Document",
      uploadedBy: "Sarah Williams",
      uploadDate: "2024-03-12",
      size: "245 KB",
    },
    5: {
      id: "5",
      name: "Meeting_Notes.txt",
      type: "txt",
      content: `Meeting Notes - March 2024

Date: March 15, 2024
Attendees: John Doe, Jane Smith, Mike Johnson

Agenda:
1. Q1 Financial Review
2. New Product Launch Timeline
3. Marketing Strategy Discussion

Key Points:
- Q1 revenue exceeded expectations by 15%
- Product launch scheduled for May 2024
- Marketing budget approved for digital campaigns
- Next meeting scheduled for April 15, 2024

Action Items:
- John: Prepare detailed financial report
- Jane: Finalize product specifications
- Mike: Draft marketing proposal

Notes taken by: Sarah Williams`,
      uploadedBy: "Sarah Williams",
      uploadDate: "2024-03-10",
      size: "2 KB",
    },
  };

  return documents[id] || null;
};

const getFileTypeLabel = (type) => {
  const labels = {
    pdf: "PDF Document",
    docx: "Word Document",
    pptx: "PowerPoint Presentation",
    xlsx: "Excel Spreadsheet",
    txt: "Text File",
    image: "Image",
  };
  return labels[type] || "Document";
};

export default function DocumentViewerPage() {
  const params = useParams();
  const router = useRouter();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    // Simulate loading document
    const loadDocument = async () => {
      setLoading(true);
      // In real app, fetch from API: await fetch(`/api/documents/${params.id}`)
      const doc = getDocumentById(params.id);
      setDocument(doc);
      setLoading(false);
    };

    if (params.id) {
      loadDocument();
    }
  }, [params.id]);

  const handleDownload = () => {
    if (document?.url) {
      window.open(document.url, "_blank");
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  const renderDocumentViewer = () => {
    if (!document) {
      return (
        <Alert>
          <AlertDescription>
            Document not found. Please check the document ID and try again.
          </AlertDescription>
        </Alert>
      );
    }

    switch (document.type) {
      case "pdf":
        return (
          <div className="w-full h-full min-h-[600px]">
            <iframe
              src={document.url}
              className="w-full h-full min-h-[600px] border-0"
              title={document.name}
            />
          </div>
        );

      case "docx":
      case "pptx":
      case "xlsx":
        return (
          <div className="w-full h-full min-h-[600px]">
            <iframe
              src={document.url}
              className="w-full h-full min-h-[600px] border-0"
              title={document.name}
            />
          </div>
        );

      case "image":
        return (
          <div className="flex items-center justify-center bg-muted/30 p-8 rounded-lg">
            <img
              src={document.url}
              alt={document.name}
              style={{ transform: `scale(${zoom / 100})` }}
              className="max-w-full h-auto transition-transform duration-200"
            />
          </div>
        );

      case "txt":
        return (
          <div className="bg-muted/30 p-6 rounded-lg">
            <pre
              className="whitespace-pre-wrap font-mono text-sm"
              style={{ fontSize: `${zoom}%` }}
            >
              {document.content}
            </pre>
          </div>
        );

      default:
        return (
          <Alert>
            <AlertDescription>
              Preview not available for this file type. Please download the file
              to view it.
            </AlertDescription>
          </Alert>
        );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">
              Loading document...
            </span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  {document?.name || "Document Not Found"}
                </CardTitle>
                {document && (
                  <CardDescription className="mt-1">
                    {getFileTypeLabel(document.type)} • {document.size} •
                    Uploaded by {document.uploadedBy} on{" "}
                    {new Date(document.uploadDate).toLocaleDateString("en-US")}
                  </CardDescription>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{document?.type.toUpperCase()}</Badge>
            </div>
          </div>
        </CardHeader>

        <Separator />

        {document && (document.type === "image" || document.type === "txt") && (
          <>
            <div className="px-6 py-3 flex items-center gap-2 bg-muted/30">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[60px] text-center">
                {zoom}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 200}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <div className="flex-1" />
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
            <Separator />
          </>
        )}

        {document && document.type !== "image" && document.type !== "txt" && (
          <>
            <div className="px-6 py-3 flex items-center justify-end bg-muted/30">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
            <Separator />
          </>
        )}

        <CardContent className="p-6">{renderDocumentViewer()}</CardContent>
      </Card>
    </div>
  );
}
