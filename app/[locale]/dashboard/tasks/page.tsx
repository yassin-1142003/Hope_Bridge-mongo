import { authOptions } from "@/lib/auth";
import { getServerSession } from "@/lib/auth";
import React from "react";
import TaskForm from "@/components/TaskForm";
import TaskCard from "@/components/TaskCard";
import { TaskService } from "@/lib/services/TaskService";
import { UserRole } from "@/lib/roles";

// Static data for employees with roles
const employees = [
  { id: "1", name: "Ahmed Hassan", email: "ahmed@company.com", role: "ADMIN" as UserRole },
  { id: "2", name: "Sara Mohamed", email: "sara@company.com", role: "PROJECT_COORDINATOR" as UserRole },
  { id: "3", name: "Omar Ali", email: "omar@company.com", role: "FIELD_OFFICER" as UserRole },
  { id: "4", name: "Fatima Ibrahim", email: "fatima@company.com", role: "HR" as UserRole },
];

const TaskManagerClient = ({ isArabic, session }: { isArabic: boolean; session: any }) => {
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const taskService = new TaskService();

  React.useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const result = await taskService.getAllTasks();
      setTasks(result.tasks as any[]);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (taskData: any, files: File[]) => {
    try {
      setIsLoading(true);
      
      // Process files
      const uploadedFiles = await taskService.processFileUpload(files);
      
      // Create task
      const newTask = await taskService.createTask({
        ...taskData,
        files: uploadedFiles,
        createdBy: session?.user?.email || 'unknown'
      });
      
      setTasks(prev => [newTask, ...prev]);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create task:', error);
      alert(isArabic ? 'فشل إنشاء المهمة' : 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: any) => {
    try {
      setIsLoading(true);
      await taskService.updateTask(taskId, updates);
      setTasks(prev => prev.map(task => 
        task._id === taskId ? { ...task, ...updates } : task
      ));
    } catch (error) {
      console.error('Failed to update task:', error);
      alert(isArabic ? 'فشل تحديث المهمة' : 'Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setIsLoading(true);
      await taskService.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task._id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert(isArabic ? 'فشل حذف المهمة' : 'Failed to delete task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#1d1616] dark:to-[#1d1616] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex w-full my-5 items-center justify-center flex-col">
          <h1 className="text-3xl font-bold text-primary dark:text-white mb-2">
            {isArabic ? "إدارة المهام" : "Task Management"}
          </h1>
          <p
            dir={isArabic ? "rtl" : "ltr"}
            className="text-accent-foreground font-semibold dark:text-gray-400"
          >
            {isArabic ? "مرحباً" : "Welcome"}, {session?.user?.email}
          </p>
        </div>

        <div
          dir={isArabic ? "rtl" : "ltr"}
          className="grid lg:grid-cols-2 gap-8"
        >
          {/* Send Task Section */}
          <div className="bg-white h-fit dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className={`mb-6 ${isArabic ? "text-right" : ""}`}>
              <h2 className="text-2xl font-bold text-accent-foreground dark:text-white mb-2 flex items-center gap-3">
                {!isArabic && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                )}
                {isArabic ? "إرسال مهمة جديدة" : "Send New Task"}
                {isArabic && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                )}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {isArabic 
                  ? "إنشاء مهمة جديدة مع إمكانية إرفاق ملفات" 
                  : "Create a new task with file attachments"
                }
              </p>
            </div>

            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                {isArabic ? "إنشاء مهمة جديدة" : "Create New Task"}
              </button>
            ) : (
              <div className="space-y-4">
                <TaskForm
                  onSubmit={handleCreateTask}
                  isLoading={isLoading}
                  isArabic={isArabic}
                  employees={employees}
                  currentUserRole={session?.user?.role || 'USER'}
                />
                <button
                  onClick={() => setShowForm(false)}
                  className="w-full py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  {isArabic ? "إلغاء" : "Cancel"}
                </button>
              </div>
            )}
          </div>

          {/* Tasks List Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className={`mb-6 ${isArabic ? "text-right" : ""}`}>
              <h2 className="text-2xl font-bold text-accent-foreground dark:text-white mb-2 flex items-center gap-3">
                {!isArabic && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                )}
                {isArabic ? "قائمة المهام" : "Tasks List"}
                {isArabic && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                )}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {isArabic ? "عرض وإدارة جميع المهام" : "View and manage all tasks"}
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {isArabic ? "جاري التحميل..." : "Loading..."}
                </p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-600 dark:text-gray-400">
                  {isArabic ? "لا توجد مهام حالياً" : "No tasks available"}
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {tasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onUpdate={handleUpdateTask}
                    onDelete={handleDeleteTask}
                    isArabic={isArabic}
                    currentUserId={session?.user?.email}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const page = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  const isArabic = locale === "ar";
  const session = await getServerSession(authOptions);

  return <TaskManagerClient isArabic={isArabic} session={session} />;
};

export default page;
