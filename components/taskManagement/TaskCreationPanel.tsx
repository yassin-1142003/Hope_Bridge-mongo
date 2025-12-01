import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import PrioritySelector from '../ui/PrioritySelector';
import DatePicker from '../ui/DatePicker';
import { Plus, X, Upload, Users, Calendar, Tag } from 'lucide-react';

interface TaskCreationPanelProps {
  onTaskCreate?: (task: any) => void;
  onCancel?: () => void;
  className?: string;
}

const TaskCreationPanel: React.FC<TaskCreationPanelProps> = ({
  onTaskCreate,
  onCancel,
  className = ''
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    assignedTo: [] as string[],
    dueDate: '',
    tags: [] as string[],
    attachment: null as File | null
  });

  const [newTag, setNewTag] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const taskData = {
        ...formData,
        createdAt: new Date().toISOString(),
        id: Date.now().toString()
      };

      if (onTaskCreate) {
        onTaskCreate(taskData);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addAssignee = () => {
    if (newAssignee.trim() && !formData.assignedTo.includes(newAssignee.trim())) {
      setFormData(prev => ({
        ...prev,
        assignedTo: [...prev.assignedTo, newAssignee.trim()]
      }));
      setNewAssignee('');
    }
  };

  const removeAssignee = (assigneeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.filter(assignee => assignee !== assigneeToRemove)
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        attachment: file
      }));
    }
  };

  const removeAttachment = () => {
    setFormData(prev => ({
      ...prev,
      attachment: null
    }));
  };

  return (
    <Card className={`w-full max-w-4xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Task
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title and Description */}
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Task Title *
              </label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter task title"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description *
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter task description"
                rows={4}
                required
              />
            </div>
          </div>

          {/* Priority and Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Priority
              </label>
              <PrioritySelector
                value={formData.priority}
                onChange={(priority: 'low' | 'medium' | 'high' | 'urgent') => handleInputChange('priority', priority)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Due Date
              </label>
              <DatePicker
                value={formData.dueDate}
                onChange={(date: string) => handleInputChange('dueDate', date)}
                placeholder="Select due date"
              />
            </div>
          </div>

          {/* Assigned To */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Users className="inline h-4 w-4 mr-1" />
              Assigned To
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  placeholder="Enter assignee name or email"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAssignee())}
                />
                <Button
                  type="button"
                  onClick={addAssignee}
                  disabled={!newAssignee.trim()}
                  title="Add assignee"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.assignedTo.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.assignedTo.map((assignee) => (
                    <Badge key={assignee} variant="secondary" className="flex items-center gap-1">
                      {assignee}
                      <button
                        type="button"
                        onClick={() => removeAssignee(assignee)}
                        className="ml-1 hover:text-red-500"
                        title={`Remove ${assignee}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Tag className="inline h-4 w-4 mr-1" />
              Tags
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Enter tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button
                  type="button"
                  onClick={addTag}
                  disabled={!newTag.trim()}
                  title="Add tag"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                        title={`Remove tag ${tag}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* File Attachment */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Upload className="inline h-4 w-4 mr-1" />
              Attachment
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.jpg,.jpeg,.png,.gif"
                  className="flex-1"
                />
                <span className="text-sm text-gray-500">Max 5MB</span>
              </div>
              
              {formData.attachment && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{formData.attachment.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(formData.attachment.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeAttachment}
                    title="Remove attachment"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.title || !formData.description || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TaskCreationPanel;
