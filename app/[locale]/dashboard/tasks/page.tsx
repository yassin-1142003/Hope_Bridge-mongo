import { authOptions } from "@/lib/auth";
import { getServerSession } from "@/lib/auth";
import React from "react";

// Static data for employees
const employees = [
  { id: 1, name: "Ahmed Hassan", email: "ahmed@company.com" },
  { id: 2, name: "Sara Mohamed", email: "sara@company.com" },
  { id: 3, name: "Omar Ali", email: "omar@company.com" },
  { id: 4, name: "Fatima Ibrahim", email: "fatima@company.com" },
];

interface tasks {
  id: number;
  task: string;
  sender: string;
  senderEmail: string;
  date: string;
  //   priority: Priority;
}

// Static data for received tasks
const receivedTasks: tasks[] = [
  {
    id: 1,
    task: "Review the Q4 financial report and provide feedback by end of week",
    sender: "Ahmed Hassan",
    senderEmail: "ahmed@company.com",
    date: "2025-09-28",
    // priority: "high",
  },
  {
    id: 2,
    task: "Update the employee handbook with new policies",
    sender: "Sara Mohamed",
    senderEmail: "sara@company.com",
    date: "2025-09-29",
    // priority: "medium",
  },
  {
    id: 3,
    task: "Prepare presentation slides for next team meeting",
    sender: "Omar Ali",
    senderEmail: "omar@company.com",
    date: "2025-09-30",
    // priority: "low",
  },
  {
    id: 4,
    task: "Test the new features in the staging environment",
    sender: "Fatima Ibrahim",
    senderEmail: "fatima@company.com",
    date: "2025-09-27",
    // priority: "high",
  },
];

// type Priority = "high" | "medium" | "low";

// type Task = Omit<(typeof receivedTasks)[0], "priority"> & {
//   priority: Priority;
// };

const TaskCard = ({ task, isArabic }: { task: tasks; isArabic: boolean }) => {
  //   const priorityColors: Record<Priority, string> = {
  //     high: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700",
  //     medium:
  //       "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700",
  //     low: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700",
  //   };

  //   const priorityLabels: Record<Priority, string> = {
  //     high: isArabic ? "عاجل" : "High Priority",
  //     medium: isArabic ? "متوسط" : "Medium Priority",
  //     low: isArabic ? "عادي" : "Low Priority",
  //   };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 dark:border-gray-700">
      {/* Priority Badge */}
      {/* <div className="flex items-center justify-between mb-3">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
            priorityColors[task.priority]
          }`}
        >
          {priorityLabels[task.priority]}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {task.date}
        </span>
      </div> */}

      {/* Task Content */}
      <p
        className={`text-accent-foreground dark:text-gray-200 mb-4 leading-relaxed ${
          isArabic ? "text-right" : "text-left"
        }`}
      >
        {task.task}
      </p>

      {/* Sender Info */}
      <div
        className={`flex items-center justify-between ${
          isArabic ? "flex-row" : ""
        }`}
      >
        <div className={`flex items-center gap-2 `}>
          {/* <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
            {task.sender.charAt(0)}
          </div> */}
          <div className={isArabic ? "text-right" : ""}>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {task.sender}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {task.senderEmail}
            </p>
          </div>
        </div>

        {/* Done Button */}
        <button className="px-4 group py-2 cursor-pointer bg-none border border-primary hover:bg-primary text-primary hover:text-white rounded-lg transition-colors duration-200 font-medium text-sm flex items-center gap-2">
          {/* <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 group-hover:-translate-y-1 duration-500 ease-in-out"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg> */}
          {isArabic ? "تم" : "Done"}
        </button>
      </div>
    </div>
  );
};

const page = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  const isArabic = locale === "ar";
  const session = await getServerSession(authOptions);

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
              <p className="text-accent-foreground dark:text-gray-400 text-sm">
                {isArabic
                  ? "اكتب المهمة واختر الموظف المستلم"
                  : "Write a task and select the recipient"}
              </p>
            </div>

            {/* Task Input */}
            <div className="mb-6">
              <label
                className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                  isArabic ? "text-right" : ""
                }`}
              >
                {isArabic ? "وصف المهمة" : "Task Description"}
              </label>
              <textarea
                className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-accent-foreground dark:text-gray-200 resize-none transition-all ${
                  isArabic ? "text-right" : ""
                }`}
                rows={6}
                placeholder={
                  isArabic
                    ? "اكتب وصف المهمة بالتفصيل..."
                    : "Describe the task in detail..."
                }
              />
            </div>

            {/* Priority Selection */}
            {/* <div className="mb-6">
              <label
                className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                  isArabic ? "text-right" : ""
                }`}
              >
                {isArabic ? "الأولوية" : "Priority"}
              </label>
              <select
                className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-accent-foreground dark:text-gray-200 cursor-pointer ${
                  isArabic ? "text-right" : ""
                }`}
              >
                <option value="low">{isArabic ? "عادي" : "Low"}</option>
                <option value="medium">{isArabic ? "متوسط" : "Medium"}</option>
                <option value="high">{isArabic ? "عاجل" : "High"}</option>
              </select>
            </div> */}

            {/* Employee Selection */}
            <div className="mb-6">
              <label
                className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                  isArabic ? "text-right" : ""
                }`}
              >
                {isArabic ? "إرسال إلى" : "Send to"}
              </label>
              <select
                className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-accent-foreground dark:text-gray-200 cursor-pointer ${
                  isArabic ? "text-right" : ""
                }`}
              >
                <option value="">
                  {isArabic ? "اختر موظف" : "Select an employee"}
                </option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} - {emp.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Send Button */}
            <button className="w-full group cursor-pointer py-3 bg-gradient-to-r from-primary to-[#8e1616] hover:from-primary/90 hover:to-[#8e1616]/90 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5  transform duration-300 ease-in-out group-hover:rotate-45"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>

              {isArabic ? "إرسال المهمة" : "Send Task"}
            </button>
          </div>

          {/* Received Tasks Section */}
          <div className="">
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
                {isArabic ? "المهام المستلمة" : "Received Tasks"}
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
              <p className="text-accent-foreground dark:text-gray-400 text-sm">
                {isArabic
                  ? `لديك ${receivedTasks.length} مهام قيد الانتظار`
                  : `You have ${receivedTasks.length} pending tasks`}
              </p>
            </div>

            {/* Tasks Grid */}
            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {receivedTasks.map((task: tasks) => (
                <TaskCard key={task.id} task={task} isArabic={isArabic} />
              ))}
            </div>

            {receivedTasks.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">
                  {isArabic ? "لا توجد مهام حالياً" : "No tasks yet"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
