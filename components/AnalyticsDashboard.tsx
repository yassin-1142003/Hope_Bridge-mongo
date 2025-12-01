/**
 * Analytics Dashboard Component
 * 
 * Displays visit statistics for projects and pages,
 * distinguishing between guest and user visits.
 */

"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import styles from './AnalyticsDashboard.module.css';

interface VisitStats {
  totalVisits: number;
  recentVisits: number;
  uniqueVisitors: number;
  dailyStats: Array<{ _id: string; count: number }>;
  projectStats: Array<{
    projectId: string;
    visits: number;
    uniqueVisitors: number;
  }>;
  topProjects: Array<{ _id: string; count: number }>;
  filteredProject?: string;
}

interface AnalyticsDashboardProps {
  projectId?: string;
  days?: number;
  showProjectDetails?: boolean;
}

export default function AnalyticsDashboard({ 
  projectId, 
  days = 7, 
  showProjectDetails = true 
}: AnalyticsDashboardProps) {
  const { data: session } = useSession();
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get width class for dynamic values
  const getWidthClass = (percentage: number, type: 'daily' | 'project' = 'daily'): string => {
    const roundedPercentage = Math.round(percentage / 10) * 10; // Round to nearest 10
    const prefix = type === 'daily' ? 'daily-chart-fill-width-' : 'project-performance-fill-width-';
    return `${prefix}${roundedPercentage}`;
  };

  useEffect(() => {
    if (session?.user?.role !== 'admin') {
      setError('Admin access required to view analytics');
      setLoading(false);
      return;
    }

    fetchAnalytics();
  }, [session, projectId, days]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        days: days.toString(),
        ...(projectId && { projectId })
      });

      const response = await fetch(`/api/analytics/visit?${params}`, {
        headers: {
          'Authorization': `Bearer ${session?.user?.token || 'admin-token'}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();
      setStats(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className={styles.loadingSkeleton}>
          <div className={styles.loadingSkeletonHeader}></div>
          <div className="space-y-2">
            <div className={styles.loadingSkeletonLine}></div>
            <div className={styles.loadingSkeletonLineShort}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h3 className={styles.errorTitle}>Analytics Error</h3>
        <p className={styles.errorMessage}>{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={styles.noDataContainer}>
        <p className={styles.noDataMessage}>No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${styles.analyticsCard} ${styles.analyticsCardBlue}`}>
          <h3 className={styles.analyticsCardTitle}>Total Visits</h3>
          <p className={styles.analyticsCardValue}>{stats.totalVisits.toLocaleString()}</p>
          <p className={styles.analyticsCardSubtitle}>All time</p>
        </div>

        <div className={`${styles.analyticsCard} ${styles.analyticsCardGreen}`}>
          <h3 className={styles.analyticsCardTitle}>Unique Visitors</h3>
          <p className={styles.analyticsCardValue}>{stats.uniqueVisitors.toLocaleString()}</p>
          <p className={styles.analyticsCardSubtitle}>Last {days} days</p>
        </div>

        <div className={`${styles.analyticsCard} ${styles.analyticsCardPurple}`}>
          <h3 className={styles.analyticsCardTitle}>Recent Visits</h3>
          <p className={styles.analyticsCardValue}>{stats.recentVisits.toLocaleString()}</p>
          <p className={styles.analyticsCardSubtitle}>Last {days} days</p>
        </div>

        <div className={`${styles.analyticsCard} ${styles.analyticsCardOrange}`}>
          <h3 className={styles.analyticsCardTitle}>Avg Daily Visits</h3>
          <p className={styles.analyticsCardValue}>
            {stats.dailyStats.length > 0 
              ? Math.round(stats.dailyStats.reduce((sum, day) => sum + day.count, 0) / stats.dailyStats.length)
              : 0
            }
          </p>
          <p className={styles.analyticsCardSubtitle}>Per day</p>
        </div>
      </div>

      {/* Daily Stats Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Visits (Last {days} days)</h3>
        <div className="space-y-2">
          {stats.dailyStats.map((day) => {
            const maxCount = Math.max(...stats.dailyStats.map(d => d.count));
            const percentage = (day.count / maxCount) * 100;
            const widthClass = getWidthClass(percentage, 'daily');
            
            return (
              <div key={day._id} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{day._id}</span>
                <div className="flex items-center space-x-2">
                  <div className={styles.dailyChartBar}>
                    <div className={`${styles.dailyChartFill} ${styles[widthClass]}`}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">{day.count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Project Statistics */}
      {showProjectDetails && stats.projectStats && stats.projectStats.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Performance</h3>
          <div className="space-y-4">
            {stats.projectStats.map((project) => {
              const maxVisits = Math.max(...stats.projectStats.map(p => p.visits));
              const percentage = (project.visits / maxVisits) * 100;
              const widthClass = getWidthClass(percentage, 'project');
              
              return (
                <div key={project.projectId} className={styles.projectPerformanceCard}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Project {project.projectId}</h4>
                    <div className="flex space-x-4 text-sm">
                      <span className="text-blue-600">{project.visits} visits</span>
                      <span className="text-green-600">{project.uniqueVisitors} unique</span>
                    </div>
                  </div>
                  <div className={styles.projectPerformanceBar}>
                    <div className={`${styles.projectPerformanceFill} ${styles[widthClass]}`}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Projects */}
      {showProjectDetails && stats.topProjects && stats.topProjects.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Projects</h3>
          <div className="space-y-2">
            {stats.topProjects.map((project, index) => (
              <div key={project._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                  <span className="text-sm font-medium text-gray-900">Project {project._id}</span>
                </div>
                <span className="text-sm font-bold text-blue-600">{project.count} visits</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Info */}
      {stats.filteredProject && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            Showing analytics for project: <span className="font-semibold">{stats.filteredProject}</span>
          </p>
        </div>
      )}
    </div>
  );
}
