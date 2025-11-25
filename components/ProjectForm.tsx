"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Save, X, Plus, Trash2 } from "lucide-react";

interface ProjectContent {
  language_code: string;
  name: string;
  description: string;
  content: string;
}

interface ProjectFormData {
  bannerPhotoUrl: string;
  contents: ProjectContent[];
}

interface ProjectFormProps {
  initialData?: ProjectFormData;
  projectId?: string;
  onSuccess?: () => void;
}

export default function ProjectForm({ initialData, projectId, onSuccess }: ProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState<ProjectFormData>(
    initialData || {
      bannerPhotoUrl: "",
      contents: [
        { language_code: "en", name: "", description: "", content: "" }
      ]
    }
  );

  const addContent = (languageCode: string) => {
    setFormData(prev => ({
      ...prev,
      contents: [...prev.contents, { language_code: languageCode, name: "", description: "", content: "" }]
    }));
  };

  const removeContent = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contents: prev.contents.filter((_, i) => i !== index)
    }));
  };

  const updateContent = (index: number, field: keyof ProjectContent, value: string) => {
    setFormData(prev => ({
      ...prev,
      contents: prev.contents.map((content, i) => 
        i === index ? { ...content, [field]: value } : content
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const url = projectId ? `/api/projects/${projectId}` : "/api/projects";
      const method = projectId ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(projectId ? "Project updated successfully!" : "Project created successfully!");
        if (onSuccess) onSuccess();
        if (!projectId) {
          setTimeout(() => router.push("/dashboard"), 1500);
        }
      } else {
        setError(result.error || "Failed to save project");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {projectId ? "Edit Project" : "Create New Project"}
        </h2>
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          aria-label="Cancel and go back"
          title="Cancel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banner Photo URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Banner Photo URL
          </label>
          <input
            type="url"
            value={formData.bannerPhotoUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, bannerPhotoUrl: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="https://example.com/image.jpg"
            required
          />
        </div>

        {/* Content Sections */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Project Content (Multilingual)
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => addContent("en")}
                className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
              >
                + English
              </button>
              <button
                type="button"
                onClick={() => addContent("ar")}
                className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
              >
                + Arabic
              </button>
            </div>
          </div>

          {formData.contents.map((content, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {content.language_code === "en" ? "English" : "Arabic"} Content
                </h4>
                {formData.contents.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContent(index)}
                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    aria-label={`Remove ${content.language_code === "en" ? "English" : "Arabic"} content`}
                    title="Remove content"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={content.name}
                    onChange={(e) => updateContent(index, "name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Project name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={content.description}
                    onChange={(e) => updateContent(index, "description", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Brief project description"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Content
                  </label>
                  <textarea
                    value={content.content}
                    onChange={(e) => updateContent(index, "content", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Detailed project content"
                    rows={6}
                    required
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <span>Saving...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {projectId ? "Update Project" : "Create Project"}
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
