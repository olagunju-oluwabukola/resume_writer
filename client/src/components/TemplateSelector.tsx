import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { allTemplates } from "@/lib/resume-templates";
import { Check, Eye } from "lucide-react";

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (templateId: string) => void;
  selectedTemplate?: string;
}

export function TemplateSelector({
  open,
  onOpenChange,
  onSelect,
  selectedTemplate,
}: TemplateSelectorProps) {
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "modern":
        return "bg-blue-100 text-blue-800";
      case "classic":
        return "bg-slate-100 text-slate-800";
      case "minimal":
        return "bg-gray-100 text-gray-800";
      case "creative":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-poppins text-2xl">
            Choose Resume Template
          </DialogTitle>
          <DialogDescription>
            Select a professional template to format your resume. You can
            preview each template before choosing.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2 py-4">
          {allTemplates.map((template) => (
            <Card
              key={template.id}
              className={`overflow-hidden cursor-pointer transition-all duration-200 border-2 ${
                selectedTemplate === template.id
                  ? "border-primary shadow-lg"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => onSelect(template.id)}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary/10 to-primary-light/10 p-4 border-b border-border">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-poppins font-bold text-foreground">
                      {template.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {template.description}
                    </p>
                  </div>
                  {selectedTemplate === template.id && (
                    <div className="flex-shrink-0 mt-1">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 space-y-3">
                <Badge className={getCategoryColor(template.category)}>
                  {getCategoryLabel(template.category)}
                </Badge>

                <div className="bg-muted/30 rounded-lg p-3 max-h-32 overflow-hidden">
                  <pre className="text-xs text-foreground/70 font-mono whitespace-pre-wrap break-words line-clamp-6">
                    {template.preview}
                  </pre>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewTemplate(template.id);
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1 text-xs h-8"
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(template.id);
                      onOpenChange(false);
                    }}
                    size="sm"
                    className="flex-1 gap-1 text-xs h-8 bg-primary hover:bg-primary-light"
                  >
                    {selectedTemplate === template.id ? "Selected" : "Select"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Template Details */}
        <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <h4 className="font-poppins font-bold text-foreground mb-2">
            Template Guide
          </h4>
          <ul className="space-y-2 text-sm text-foreground/80">
            <li>
              <strong>Modern Minimalist:</strong> Best for tech and creative
              roles
            </li>
            <li>
              <strong>Classic Professional:</strong> Ideal for traditional
              corporate positions
            </li>
            <li>
              <strong>Minimal Clean:</strong> Perfect for executive and
              leadership roles
            </li>
            <li>
              <strong>Creative Modern:</strong> Great for design and marketing
              positions
            </li>
            <li>
              <strong>ATS-Optimized:</strong> Recommended for online job
              applications
            </li>
          </ul>
        </div>
      </DialogContent>

      {/* Full Preview Dialog */}
      {previewTemplate && (
        <Dialog
          open={!!previewTemplate}
          onOpenChange={(open) => !open && setPreviewTemplate(null)}
        >
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="font-poppins">
                {allTemplates.find((t) => t.id === previewTemplate)?.name}{" "}
                Preview
              </DialogTitle>
            </DialogHeader>

            <ScrollArea className="h-[600px] w-full rounded-lg border border-border p-4">
              <pre className="text-xs font-mono whitespace-pre-wrap break-words text-foreground/80">
                {allTemplates.find((t) => t.id === previewTemplate)?.preview}
              </pre>
            </ScrollArea>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => {
                  onSelect(previewTemplate);
                  setPreviewTemplate(null);
                  onOpenChange(false);
                }}
                className="flex-1 bg-primary hover:bg-primary-light"
              >
                Use This Template
              </Button>
              <Button
                onClick={() => setPreviewTemplate(null)}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
